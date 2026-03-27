// Supabase Edge Function: scan-medication
// Accepts a base64 image of a medication label/bottle
// Uses Claude Vision to identify the medication
// Returns: { name, strength, unit, form, brand, confidence }

import Anthropic from "npm:@anthropic-ai/sdk@0.80.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ScanResult {
  name?: string;
  strength?: string;
  unit?: string;
  form?: string;
  brand?: string;
  confidence?: "high" | "medium" | "low";
  raw_text?: string;
  error?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
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

    if (!image || typeof image !== "string") {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Anthropic API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Strip data URL prefix — supports "data:image/jpeg;base64,..." or raw base64
    let base64Data = image;
    let mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif" = "image/jpeg";

    if (image.startsWith("data:")) {
      const matches = image.match(/^data:(image\/[^;]+);base64,(.+)$/s);
      if (matches) {
        const mimeType = matches[1];
        if (["image/jpeg", "image/png", "image/webp", "image/gif"].includes(mimeType)) {
          mediaType = mimeType as typeof mediaType;
        }
        base64Data = matches[2];
      }
    }

    // Validate we actually have base64 data
    if (!base64Data || base64Data.length < 100) {
      return new Response(JSON.stringify({ error: "Image data too small or empty" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const client = new Anthropic({ apiKey });

    const prompt = `You are a pharmaceutical expert analyzing a photo of a medication bottle, prescription label, supplement bottle, or drug packaging.

Your task: identify exactly what medication or supplement is shown.

Look carefully for:
1. Brand name (e.g. "Advil", "Tylenol", "Lipitor", "NyQuil", "One A Day")
2. Generic/active ingredient name (e.g. "Ibuprofen", "Acetaminophen", "Atorvastatin")
3. Strength/dose number (e.g. "200", "500", "10")
4. Unit (mg, mcg, mL, IU, g, %)
5. Form (Tablet, Capsule, Liquid, Gel Cap, Softgel, Chewable, Patch, Cream, Inhaler, Gummy, etc.)

Respond ONLY with a valid JSON object — no markdown, no explanation:
{
  "name": "generic drug name preferred, or brand name if generic unknown",
  "brand": "brand name if visible, else null",
  "strength": "number only e.g. '200' not '200mg'",
  "unit": "mg or mcg or mL or IU or g or %",
  "form": "Tablet or Capsule or Liquid or Gel Cap or Softgel or Chewable or Patch or Cream or Inhaler or Gummy or Other",
  "confidence": "high or medium or low",
  "raw_text": "any text visible on label, max 150 chars"
}

If you cannot identify any medication (e.g. the image is blurry, dark, or not a medication), return:
{"error": "Could not identify medication", "confidence": "low"}`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64Data,
              },
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    });

    const rawText = response.content[0].type === "text" ? response.content[0].text : "";

    // Parse JSON — handles backtick-wrapped responses from Claude
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
