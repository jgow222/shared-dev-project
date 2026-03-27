// Supabase Edge Function: scan-medication
// Receives a base64 JPEG photo of any medication/supplement/prescription label.
// Uses Claude Vision AI to identify the medication and return structured data.
// Works for: OTC drugs, prescription medications, vitamins, supplements, herbal products.

import Anthropic from "npm:@anthropic-ai/sdk@0.80.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ScanResult {
  name?: string;
  brand?: string;
  strength?: string;
  unit?: string;
  form?: string;
  confidence?: "high" | "medium" | "low";
  raw_text?: string;
  error?: string;
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

  try {
    let body: { image?: string };
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { image } = body;

    if (!image || typeof image !== "string" || image.length < 100) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key not configured on server" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse data URL
    let base64Data = image;
    let mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif" = "image/jpeg";

    if (image.startsWith("data:")) {
      const match = image.match(/^data:(image\/[^;]+);base64,(.+)$/s);
      if (match) {
        const mime = match[1];
        if (["image/jpeg", "image/png", "image/webp", "image/gif"].includes(mime)) {
          mediaType = mime as typeof mediaType;
        }
        base64Data = match[2];
      }
    }

    if (!base64Data || base64Data.length < 500) {
      return new Response(JSON.stringify({ error: "Image data is too small or corrupted" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const client = new Anthropic({ apiKey });

    // Comprehensive prompt that handles every type of medication label
    const prompt = `You are an expert pharmacist and medical product identifier. 
    
Analyze this photo and identify the medication, supplement, or prescription drug shown.

The image may show:
- An OTC drug bottle (Advil, Tylenol, Benadryl, NyQuil, etc.)
- A prescription medication bottle with a pharmacy label
- A vitamin or dietary supplement bottle
- A supplement box or blister pack
- An herbal remedy product
- A protein powder or health product

Extract ALL of the following from visible text on the label:
1. BRAND NAME (e.g. Advil, Tylenol, Lipitor, One A Day, Centrum)
2. GENERIC/ACTIVE INGREDIENT name (e.g. Ibuprofen, Acetaminophen, Atorvastatin)
3. STRENGTH — the numeric dose amount only (e.g. 200, 500, 10, 1000)
4. UNIT — mg, mcg, mL, IU, g, % (pick the one that matches the strength)
5. DOSAGE FORM — exactly one of: Tablet, Capsule, Liquid, Gel Cap, Softgel, Chewable, Patch, Cream, Inhaler, Gummy, Powder, Spray, Drops, Injection, Other

Rules:
- Prefer the generic/active ingredient as "name" when visible
- If only brand name is visible, use the brand name as "name"  
- For multi-ingredient products (e.g. NyQuil), use the brand name as "name"
- For vitamins: "Vitamin D3", "Vitamin C", "Fish Oil", "Magnesium", etc.
- confidence: "high" if you can clearly read the label, "medium" if partially visible, "low" if very blurry

Respond with ONLY a valid JSON object, no markdown:
{
  "name": "primary medication name (generic preferred, or brand if generic unknown)",
  "brand": "brand name if different from name, else null",
  "strength": "number only, no unit (e.g. '200' not '200mg'), or null if not visible",
  "unit": "mg or mcg or mL or IU or g or % or null",
  "form": "Tablet or Capsule or Liquid etc.",
  "confidence": "high or medium or low",
  "raw_text": "key text you can read from the label, max 100 chars"
}

If you cannot identify any medication (completely blurry, not a medication, or no text visible), return:
{"error": "Cannot identify medication from this image", "confidence": "low"}`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 400,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: base64Data },
            },
            { type: "text", text: prompt },
          ],
        },
      ],
    });

    const rawText = response.content[0].type === "text" ? response.content[0].text.trim() : "";

    let result: ScanResult = {};
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        result = { error: "Could not parse AI response", confidence: "low" };
      }
    } catch {
      result = { error: "Invalid response format", confidence: "low" };
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("scan-medication error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
