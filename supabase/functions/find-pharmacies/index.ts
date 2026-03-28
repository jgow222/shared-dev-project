// Supabase Edge Function: find-pharmacies
// Finds real pharmacies near a given lat/lon using OpenStreetMap Overpass API.
// 100% free — no API key required. Returns sorted, enriched pharmacy data.
//
// Request body: { lat: number, lon: number, medication: string, radiusMiles?: number }
// Response:     { pharmacies: Pharmacy[], count: number }

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface PharmacyResult {
  id: number;
  name: string;
  distanceMiles: number;
  address: string;
  city: string;
  phone: string;
  hours: string;
  hoursFormatted: string; // human-readable
  isOpen: boolean | null; // null = unknown
  lat: number;
  lon: number;
  mapUrl: string;
  brand: string;
}

// Haversine distance in miles
function distanceMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

// Parse OSM opening_hours string into something readable
function formatHours(raw: string): string {
  if (!raw) return "";
  if (raw === "24/7") return "Open 24 hours";
  if (raw.includes("00:00-24:00")) return "Open 24 hours";
  // Simplify complex OSM format e.g. "Mo-Fr 09:00-18:00; Sa 10:00-16:00"
  return raw
    .replace(/Mo-Fr/g, "Mon–Fri")
    .replace(/Sa/g, "Sat")
    .replace(/Su/g, "Sun")
    .replace(/00:00-24:00/g, "24h")
    .split(";")[0] // take first rule
    .trim()
    .slice(0, 40);
}

// Very basic open/closed check based on current time
function checkIsOpen(raw: string): boolean | null {
  if (!raw) return null;
  if (raw === "24/7" || raw.includes("00:00-24:00")) return true;
  // Return null for complex rules — we can't parse reliably
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: { lat?: number; lon?: number; medication?: string; radiusMiles?: number };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { lat, lon, medication = "", radiusMiles = 5 } = body;

  if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
    return new Response(JSON.stringify({ error: "lat and lon are required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Convert radius in miles to degrees (approx: 1 degree lat ≈ 69 miles)
  const delta = Math.min(radiusMiles / 69, 0.15); // cap at ~10 miles to prevent timeouts
  const bbox = `${lat - delta},${lon - delta},${lat + delta},${lon + delta}`;

  // Overpass QL — fetch pharmacies AND drugstores/chemists
  const overpassQuery = `[out:json][timeout:12];(node[amenity=pharmacy](${bbox});node[shop=chemist](${bbox});node[shop=drugstore](${bbox}););out;`;
  const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;

  let elements: any[] = [];
  try {
    const overpassRes = await fetch(overpassUrl, {
      headers: { "User-Agent": "Nurilo-App/1.0 (medication tracker)" },
      signal: AbortSignal.timeout(14_000),
    });
    if (!overpassRes.ok) throw new Error(`Overpass HTTP ${overpassRes.status}`);
    const data = await overpassRes.json();
    elements = data.elements ?? [];
  } catch (err) {
    console.error("Overpass error:", err);
    return new Response(
      JSON.stringify({ error: "Could not fetch pharmacy data. Please try again.", pharmacies: [], count: 0 }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Build pharmacy results
  const pharmacies: PharmacyResult[] = elements
    .filter(el => el.lat && el.lon && el.tags?.name)
    .map(el => {
      const tags = el.tags ?? {};
      const dist = distanceMiles(lat, lon, el.lat, el.lon);
      const houseNum = tags["addr:housenumber"] ?? "";
      const street = tags["addr:street"] ?? "";
      const address = [houseNum, street].filter(Boolean).join(" ") || "Address unavailable";
      const city = tags["addr:city"] ?? tags["addr:suburb"] ?? "";
      const phone = tags.phone ?? tags["contact:phone"] ?? "";
      const rawHours = tags.opening_hours ?? "";
      const hoursFormatted = formatHours(rawHours);

      return {
        id: el.id,
        name: tags.name,
        distanceMiles: Math.round(dist * 100) / 100,
        address,
        city,
        phone: phone.replace(/^\+1\s?/, "").replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3"),
        hours: rawHours,
        hoursFormatted,
        isOpen: checkIsOpen(rawHours),
        lat: el.lat,
        lon: el.lon,
        mapUrl: `https://www.google.com/maps/dir/?api=1&destination=${el.lat},${el.lon}`,
        brand: tags.brand ?? tags.operator ?? "",
      };
    })
    .sort((a, b) => a.distanceMiles - b.distanceMiles)
    .slice(0, 20); // top 20 closest

  return new Response(
    JSON.stringify({ pharmacies, count: pharmacies.length, medication }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
