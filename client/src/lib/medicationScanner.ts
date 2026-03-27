// ─── Medication Scanner ────────────────────────────────────────────────────────
// Full AI-powered medication identification pipeline:
//   Stage 1: Claude Vision AI reads the label/bottle/pill image
//   Stage 2: Cross-references with OpenFDA (drug labels + NDC directory)
//   Stage 3: Cross-references with RxNorm (NIH normalized drug data)
//   Stage 4: Cross-references with DailyMed (NIH official labels)
//
// Works for ANY medication: OTC, prescription, supplements, vitamins, herbal.
// Returns comprehensive structured data from 4 authoritative sources.

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ScanResult {
  name: string;
  brand?: string;
  genericName?: string;
  strength?: string;
  unit?: string;
  form?: string;
  confidence: "high" | "medium" | "low";
  source: "barcode" | "ai" | "manual";

  // Rich fields from the new pipeline
  manufacturer?: string;
  ndc_number?: string;
  lot_number?: string;
  expiration_date?: string;
  quantity?: string;
  rx_or_otc?: string;
  drug_schedule?: string;
  active_ingredients?: Array<{ name: string; strength?: string }>;
  directions?: string;
  warnings_visible?: string;
  description?: string;

  // Cross-referenced database data
  fda_data?: any;
  rxnorm_data?: any;
  dailymed_data?: any;
}

export interface ScanError {
  code:
    | "NO_CAMERA"
    | "PERMISSION_DENIED"
    | "CAMERA_IN_USE"
    | "NOT_SUPPORTED"
    | "SCAN_FAILED"
    | "NETWORK_ERROR"
    | "TIMEOUT";
  message: string;
}

// ─── NDC Barcode → OpenFDA Drug Lookup ───────────────────────────────────────

/**
 * Convert a UPC-A (12-digit) or EAN-13 (13-digit) barcode to possible NDC formats.
 * US drug barcodes encode the NDC using one of three segmentation formats.
 */
function barcodeToCandidateNDCs(barcode: string): string[] {
  const candidates: string[] = [];

  let digits = barcode.replace(/\D/g, "");

  // Strip EAN-13 leading country digit (0) to get UPC-A
  if (digits.length === 13 && digits[0] === "0") {
    digits = digits.slice(1);
  }

  // UPC-A is 12 digits. Strip check digit (last digit) → 11 inner digits
  if (digits.length === 12) {
    const inner = digits.slice(0, 11); // drop check digit

    // The 10 "NDC digits" are positions 1-10 of UPC-A (after leading 0)
    const d = inner.startsWith("0") ? inner.slice(1) : inner;

    if (d.length === 10) {
      candidates.push(`${d.slice(0, 5)}-${d.slice(5, 8)}-${d.slice(8, 10)}`); // 5-3-2
      candidates.push(`${d.slice(0, 5)}-${d.slice(5, 9)}-${d.slice(9, 10)}`); // 5-4-1
      candidates.push(`${d.slice(0, 4)}-${d.slice(4, 8)}-${d.slice(8, 10)}`); // 4-4-2
    }
  }

  // Also handle raw 10/11 digit NDC strings (e.g. from QR codes on bottles)
  if (digits.length === 11) {
    const d = digits;
    candidates.push(`${d.slice(0, 5)}-${d.slice(5, 8)}-${d.slice(8, 11)}`);
    candidates.push(`${d.slice(0, 5)}-${d.slice(5, 9)}-${d.slice(9, 11)}`);
    candidates.push(`${d.slice(0, 4)}-${d.slice(4, 8)}-${d.slice(8, 11)}`);
  }

  if (digits.length === 10) {
    const d = digits;
    candidates.push(`${d.slice(0, 5)}-${d.slice(5, 8)}-${d.slice(8, 10)}`);
    candidates.push(`${d.slice(0, 5)}-${d.slice(5, 9)}-${d.slice(9, 10)}`);
    candidates.push(`${d.slice(0, 4)}-${d.slice(4, 8)}-${d.slice(8, 10)}`);
  }

  return [...new Set(candidates)]; // deduplicate
}

/**
 * Look up a drug in OpenFDA using a package NDC string.
 * Returns structured drug data or null if not found.
 */
async function lookupNDCinOpenFDA(ndc: string): Promise<ScanResult | null> {
  const encoded = encodeURIComponent(`"${ndc}"`);
  const url = `https://api.fda.gov/drug/ndc.json?search=packaging.package_ndc:${encoded}&limit=1`;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const results = data?.results;
    if (!results?.length) return null;

    const item = results[0];
    const brand = item.brand_name || "";
    const generic = item.generic_name || "";
    const dosageForm = item.dosage_form || "Tablet";
    const ingredients: Array<{ name: string; strength: string }> =
      item.active_ingredients || [];

    // Parse strength from first active ingredient e.g. "IBUPROFEN 200 mg/1"
    let strength = "";
    let unit = "mg";
    if (ingredients.length > 0) {
      const rawStr = ingredients[0].strength || "";
      const match = rawStr.match(/(\d+\.?\d*)\s*(mg|mcg|mL|IU|g|%|units)/i);
      if (match) {
        strength = match[1];
        unit = match[2].toLowerCase().replace("iu", "IU");
      }
    }

    // Normalize form
    const formMap: Record<string, string> = {
      "TABLET": "Tablet",
      "TABLET, COATED": "Tablet",
      "TABLET, FILM COATED": "Tablet",
      "TABLET, CHEWABLE": "Chewable",
      "CAPSULE": "Capsule",
      "CAPSULE, GELATIN COATED": "Gel Cap",
      "SOLUTION": "Liquid",
      "SUSPENSION": "Liquid",
      "SYRUP": "Liquid",
      "CREAM": "Cream",
      "GEL": "Gel",
      "OINTMENT": "Cream",
      "SPRAY": "Spray",
      "AEROSOL, METERED": "Inhaler",
      "POWDER": "Powder",
      "PATCH": "Patch",
      "INJECTION": "Injection",
      "SOFTGEL": "Softgel",
    };
    const normalizedForm =
      formMap[dosageForm?.toUpperCase()] ||
      (dosageForm ? dosageForm.charAt(0).toUpperCase() + dosageForm.slice(1).toLowerCase() : "Tablet");

    const displayName = generic
      ? generic.charAt(0).toUpperCase() + generic.slice(1).toLowerCase()
      : brand;

    return {
      name: displayName || brand,
      brand: brand || undefined,
      genericName: generic || undefined,
      strength,
      unit,
      form: normalizedForm,
      confidence: "high",
      source: "barcode",
      manufacturer: item.labeler_name || undefined,
      ndc_number: ndc,
      active_ingredients: ingredients,
    };
  } catch {
    return null;
  }
}

/**
 * Full barcode → drug lookup.
 * Tries all NDC format candidates against OpenFDA.
 */
export async function lookupBarcodeInDrugDB(
  barcode: string
): Promise<ScanResult | null> {
  const candidates = barcodeToCandidateNDCs(barcode);

  // Try all candidates in parallel for speed
  const results = await Promise.allSettled(
    candidates.map((ndc) => lookupNDCinOpenFDA(ndc))
  );

  for (const result of results) {
    if (result.status === "fulfilled" && result.value) {
      return result.value;
    }
  }

  return null;
}

// ─── AI Vision Scanner ───────────────────────────────────────────────────────

// Scanner uses the Nurilo Supabase project where the MedScan edge function is deployed
const SCANNER_SUPABASE_URL = "https://vytsmfnzaidhpopbleqr.supabase.co";
const SCANNER_SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5dHNtZm56YWlkaHBvcGJsZXFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzOTIwNTMsImV4cCI6MjA4OTk2ODA1M30.Ff0mTzjIeXLNqkBmW5Sv16C9_YkANhqs6QqIINS_ARA";

/**
 * Send a captured photo to the AI medication scanner.
 * The edge function runs the full pipeline: Claude Vision → OpenFDA → RxNorm → DailyMed.
 * Returns comprehensive scan results or null on failure.
 */
export async function scanWithAIVision(
  imageDataUrl: string
): Promise<ScanResult | null> {
  try {
    const res = await fetch(`${SCANNER_SUPABASE_URL}/functions/v1/scan-medication`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SCANNER_SUPABASE_KEY}`,
        apikey: SCANNER_SUPABASE_KEY,
      },
      body: JSON.stringify({ image: imageDataUrl }),
      signal: AbortSignal.timeout(50000),
    });

    if (!res.ok) return null;
    const data = await res.json();

    if (data.error || !data.name) return null;

    return {
      name: data.name,
      brand: data.brand || undefined,
      genericName: data.genericName || undefined,
      strength: data.strength || undefined,
      unit: data.unit || "mg",
      form: data.form || "Tablet",
      confidence: data.confidence || "medium",
      source: "ai",

      // Rich fields
      manufacturer: data.manufacturer || undefined,
      ndc_number: data.ndc_number || undefined,
      lot_number: data.lot_number || undefined,
      expiration_date: data.expiration_date || undefined,
      quantity: data.quantity || undefined,
      rx_or_otc: data.rx_or_otc || undefined,
      drug_schedule: data.drug_schedule || undefined,
      active_ingredients: data.active_ingredients || [],
      directions: data.directions || undefined,
      warnings_visible: data.warnings_visible || undefined,
      description: data.description || undefined,

      // Database cross-references
      fda_data: data.fda_data || undefined,
      rxnorm_data: data.rxnorm_data || undefined,
      dailymed_data: data.dailymed_data || undefined,
    };
  } catch {
    return null;
  }
}

// ─── Camera Error Helper ──────────────────────────────────────────────────────

export function parseCameraError(err: unknown): ScanError {
  const e = err as any;
  const name = e?.name || "";
  const msg = e?.message || "";

  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return {
      code: "PERMISSION_DENIED",
      message:
        "Camera permission denied. Tap the camera icon in your browser's address bar to allow access.",
    };
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return {
      code: "NO_CAMERA",
      message: "No camera found on this device.",
    };
  }
  if (name === "NotReadableError" || name === "TrackStartError") {
    return {
      code: "CAMERA_IN_USE",
      message:
        "Camera is in use by another app. Close other camera apps and try again.",
    };
  }
  if (name === "NotSupportedError" || name === "OverconstrainedError") {
    return {
      code: "NOT_SUPPORTED",
      message: "Camera not supported on this browser. Try Chrome or Safari.",
    };
  }
  if (msg.includes("timeout") || msg.includes("Timeout") || name === "TimeoutError") {
    return {
      code: "TIMEOUT",
      message: "Scan timed out. Make sure the label is well-lit and try again.",
    };
  }
  return {
    code: "SCAN_FAILED",
    message: `Camera error: ${msg || "Unknown error"}. Try the Type Label option.`,
  };
}
