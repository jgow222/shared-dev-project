// Supabase Edge Function: scan-medication
// Accepts a base64 image of a medication label/bottle
// Uses Claude Vision (claude-3-5-sonnet) to identify the medication
// Returns: { name, strength, unit, form, brand, confidence }

import Anthropic from "npm:@anthropic-ai/sdk@0.36.3";

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
    const { image } = await req.json() as { image: string };

    if (!image) {
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

    const client = new Anthropic({ apiKey });

    // Strip data URL prefix if present
    // Supports: "data:image/jpeg;base64,..." or raw base64
    let base64Data = image;
    let mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif" = "image/jpeg";

    if (image.startsWith("data:")) {
      const matches = image.match(/^data:(image\/[^;]+);base64,(.+)$/);
      if (matches) {
        const mimeType = matches[1] as typeof mediaType;
        if (["image/jpeg", "image/png", "image/webp", "image/gif"].includes(mimeType)) {
          mediaType = mimeType;
        }
        base64Data = matches[2];
      }
    }

    const prompt = `You are a pharmaceutical expert assistant analyzing a medication bottle or package label photo.

Your task: identify the medication in this image as precisely as possible.

Look for:
1. Brand name (e.g. "Advil", "Tylenol", "Lipitor")  
2. Generic name (e.g. "Ibuprofen", "Acetaminophen", "Atorvastatin")
3. Strength/dose (e.g. "200mg", "500mg", "10mg/5mL")
4. Form (Tablet, Capsule, Liquid, Gel Cap, Softgel, Chewable, Patch, Cream, etc.)
5. Unit (mg, mcg, mL, IU, %, g)

Respond ONLY with a valid JSON object — no explanation, no markdown:
{
  "name": "generic drug name (preferred) or brand name if generic unknown",
  "brand": "brand name if visible, else null",
  "strength": "numeric value only (e.g. '200' not '200mg')",
  "unit": "mg | mcg | mL | IU | g | %",
  "form": "Tablet | Capsule | Liquid | Gel Cap | Softgel | Chewable | Patch | Cream | Inhaler | Drops | Injection | Other",
  "confidence": "high | medium | low",
  "raw_text": "any text you can read from the label (max 200 chars)"
}

If you cannot identify the medication at all, return:
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

    // Parse JSON from Claude's response
    let result: ScanResult = {};
    try {
      // Extract JSON from response (handles cases where Claude adds backticks)
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        result = { error: "Could not parse response", confidence: "low" };
      }
    } catch {
      result = { error: "Invalid response format", confidence: "low" };
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("scan-medication error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
