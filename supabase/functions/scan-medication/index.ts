// Supabase Edge Function: scan-medication
// Full MedScan pipeline:
//   Stage 1: Claude Vision AI reads the medication label/bottle/pill
//   Stage 2: Cross-reference with OpenFDA (drug labels + NDC directory)
//   Stage 3: Cross-reference with RxNorm (NIH normalized drug data)
//   Stage 4: Cross-reference with DailyMed (NIH official labels)
//
// Works for: OTC drugs, prescription medications, vitamins, supplements, herbal products.

import Anthropic from "npm:@anthropic-ai/sdk@0.80.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ─── FDA Lookup ──────────────────────────────────────────────────────────────

async function queryOpenFDA(drugName: string): Promise<Record<string, any> | null> {
  const results: Record<string, any> = {};

  // Search drug labeling
  try {
    const labelUrl = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${encodeURIComponent(drugName)}"+OR+openfda.generic_name:"${encodeURIComponent(drugName)}"&limit=1`;
    const resp = await fetch(labelUrl, { signal: AbortSignal.timeout(10000) });
    if (resp.ok) {
      const data = await resp.json();
      if (data?.results?.length) {
        const r = data.results[0];
        results.label = {
          purpose: r.purpose ?? [],
          indications_and_usage: r.indications_and_usage ?? [],
          dosage_and_administration: r.dosage_and_administration ?? [],
          warnings: r.warnings ?? [],
          active_ingredient: r.active_ingredient ?? [],
          inactive_ingredient: r.inactive_ingredient ?? [],
          drug_interactions: r.drug_interactions ?? [],
          storage_and_handling: r.storage_and_handling ?? [],
          openfda: r.openfda ?? {},
        };
      }
    }
  } catch { /* non-fatal */ }

  // Search NDC directory
  try {
    const ndcUrl = `https://api.fda.gov/drug/ndc.json?search=brand_name:"${encodeURIComponent(drugName)}"+OR+generic_name:"${encodeURIComponent(drugName)}"&limit=3`;
    const resp = await fetch(ndcUrl, { signal: AbortSignal.timeout(10000) });
    if (resp.ok) {
      const data = await resp.json();
      if (data?.results?.length) {
        results.ndc = data.results.map((r: any) => ({
          brand_name: r.brand_name ?? "",
          generic_name: r.generic_name ?? "",
          labeler_name: r.labeler_name ?? "",
          active_ingredients: r.active_ingredients ?? [],
          dosage_form: r.dosage_form ?? "",
          route: r.route ?? [],
          product_type: r.product_type ?? "",
          product_ndc: r.product_ndc ?? "",
          packaging: (r.packaging ?? []).map((p: any) => p.description ?? ""),
        }));
      }
    }
  } catch { /* non-fatal */ }

  return Object.keys(results).length > 0 ? results : null;
}

// ─── RxNorm Lookup ───────────────────────────────────────────────────────────

async function queryRxNorm(drugName: string): Promise<Record<string, any> | null> {
  const results: Record<string, any> = {};

  try {
    // Get RXCUI via approximate match
    const approxUrl = `https://rxnav.nlm.nih.gov/REST/approximateTerm.json?term=${encodeURIComponent(drugName)}&maxEntries=3`;
    const resp = await fetch(approxUrl, { signal: AbortSignal.timeout(10000) });
    if (resp.ok) {
      const data = await resp.json();
      const candidates = data?.approximateGroup?.candidate;
      if (candidates?.length) {
        const rxcui = candidates[0].rxcui;
        results.rxcui = rxcui;
        results.matched_name = candidates[0].name ?? "";

        // Get all related info
        const relUrl = `https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/allrelated.json`;
        const resp2 = await fetch(relUrl, { signal: AbortSignal.timeout(10000) });
        if (resp2.ok) {
          const related = await resp2.json();
          const groups = related?.allRelatedGroup?.conceptGroup ?? [];
          const relatedConcepts: Record<string, any[]> = {};
          for (const g of groups) {
            const tty = g.tty ?? "";
            const props = g.conceptProperties ?? [];
            if (props.length) {
              relatedConcepts[tty] = props.slice(0, 5).map((p: any) => ({
                rxcui: p.rxcui, name: p.name, tty: p.tty,
              }));
            }
          }
          results.related_concepts = relatedConcepts;
        }
      }
    }
  } catch { /* non-fatal */ }

  return Object.keys(results).length > 0 ? results : null;
}

// ─── DailyMed Lookup ─────────────────────────────────────────────────────────

async function queryDailyMed(drugName: string): Promise<Record<string, any> | null> {
  try {
    const url = `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls.json?drug_name=${encodeURIComponent(drugName)}&pagesize=1`;
    const resp = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (resp.ok) {
      const data = await resp.json();
      const spls = data?.data;
      if (spls?.length) {
        const spl = spls[0];
        return {
          setid: spl.setid ?? "",
          title: spl.title ?? "",
          published_date: spl.published_date ?? "",
          dailymed_url: `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${spl.setid ?? ""}`,
        };
      }
    }
  } catch { /* non-fatal */ }
  return null;
}

// ─── Main Handler ────────────────────────────────────────────────────────────

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

    // Warmup ping — return immediately
    if (image === "warmup") {
      return new Response(JSON.stringify({ status: "warm" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    // ── Stage 1: Claude Vision AI ──────────────────────────────────────────────

    const client = new Anthropic({ apiKey });

    const prompt = `You are a medication identification expert. Analyze this image of a medication, supplement, or prescription drug.

Extract ALL of the following information that you can see or identify:

1. **drug_name**: The primary drug/medication name (brand name if visible, otherwise generic name)
2. **generic_name**: The generic/chemical name if visible
3. **brand_name**: The brand name if visible
4. **manufacturer**: The manufacturer/company name
5. **dosage_strength**: The dosage/strength (e.g., "500mg", "10mg/5mL")
6. **dosage_form**: The form (tablet, capsule, liquid, cream, etc.)
7. **ndc_number**: NDC number if visible on label
8. **lot_number**: Lot/batch number if visible
9. **expiration_date**: Expiration date if visible
10. **quantity**: Package quantity if visible
11. **rx_or_otc**: Whether this appears to be prescription (Rx) or over-the-counter (OTC)
12. **drug_schedule**: DEA schedule if visible (e.g., CII, CIII)
13. **active_ingredients**: List of active ingredients with strengths
14. **directions**: Usage directions if visible
15. **warnings_visible**: Any warnings visible on the label
16. **description**: Brief description of what you see in the image
17. **confidence**: Your confidence level (high/medium/low) in the identification

Return ONLY valid JSON. If a field is not visible or identifiable, use null.

IMPORTANT: For drug_name, provide the most common/searchable name that would work with the FDA database. If you see "Tylenol", also note generic_name as "Acetaminophen". If you see a supplement like "Vitamin D3", use that as the drug_name.

\`\`\`json
{
  "drug_name": "",
  "generic_name": "",
  "brand_name": "",
  "manufacturer": "",
  "dosage_strength": "",
  "dosage_form": "",
  "ndc_number": "",
  "lot_number": "",
  "expiration_date": "",
  "quantity": "",
  "rx_or_otc": "",
  "drug_schedule": "",
  "active_ingredients": [],
  "directions": "",
  "warnings_visible": "",
  "description": "",
  "confidence": ""
}
\`\`\``;

    const response = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 2000,
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

    let aiResult: Record<string, any> = {};
    try {
      const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : (rawText.match(/\{[\s\S]*\}/)?.[0] ?? rawText);
      aiResult = JSON.parse(jsonStr);
    } catch {
      return new Response(JSON.stringify({ error: "Could not parse AI response", raw: rawText.slice(0, 200) }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Stage 2-4: Cross-reference with FDA databases ────────────────────────

    const searchName = aiResult.drug_name || aiResult.generic_name || aiResult.brand_name;

    let fdaData: Record<string, any> | null = null;
    let rxnormData: Record<string, any> | null = null;
    let dailymedData: Record<string, any> | null = null;

    if (searchName) {
      // Build search terms: primary name + alternates
      const searchTerms = [searchName];
      if (aiResult.generic_name && aiResult.generic_name !== searchName) {
        searchTerms.push(aiResult.generic_name);
      }
      if (aiResult.brand_name && aiResult.brand_name !== searchName) {
        searchTerms.push(aiResult.brand_name);
      }

      // Try each term until we get results
      for (const term of searchTerms) {
        const [fda, rx, dm] = await Promise.allSettled([
          !fdaData ? queryOpenFDA(term) : Promise.resolve(null),
          !rxnormData ? queryRxNorm(term) : Promise.resolve(null),
          !dailymedData ? queryDailyMed(term) : Promise.resolve(null),
        ]);

        if (fda.status === "fulfilled" && fda.value) fdaData = fda.value;
        if (rx.status === "fulfilled" && rx.value) rxnormData = rx.value;
        if (dm.status === "fulfilled" && dm.value) dailymedData = dm.value;

        if (fdaData && rxnormData) break;
      }
    }

    // ── Build backwards-compatible response ────────────────────────────────────
    // The old scanner expects: name, brand, strength, unit, form, confidence
    // We add the new rich data alongside it

    // Parse strength into number + unit for form auto-fill
    let strengthNum = aiResult.dosage_strength ?? "";
    let strengthUnit = "mg";
    if (strengthNum) {
      const match = String(strengthNum).match(/([\d.]+)\s*(mg|mcg|mL|IU|g|%|units)?/i);
      if (match) {
        strengthNum = match[1];
        if (match[2]) strengthUnit = match[2].toLowerCase().replace("iu", "IU");
      }
    }

    // Normalize form
    const formMap: Record<string, string> = {
      tablet: "Tablet", capsule: "Capsule", liquid: "Liquid", cream: "Cream",
      gel: "Gel", spray: "Spray", inhaler: "Inhaler", patch: "Patch",
      injection: "Injection", drops: "Drops", powder: "Powder", gummy: "Gummy",
      softgel: "Softgel", "gel cap": "Gel Cap", chewable: "Chewable",
      solution: "Liquid", suspension: "Liquid", syrup: "Liquid",
      caplet: "Tablet", lozenge: "Lozenge", suppository: "Suppository",
    };
    const rawForm = (aiResult.dosage_form ?? "").toLowerCase();
    const normalizedForm = formMap[rawForm] ?? (rawForm ? rawForm.charAt(0).toUpperCase() + rawForm.slice(1) : "Tablet");

    // Get manufacturer from FDA if AI didn't see it
    const manufacturer = aiResult.manufacturer
      || fdaData?.label?.openfda?.manufacturer_name?.[0]
      || fdaData?.ndc?.[0]?.labeler_name
      || null;

    const result = {
      // Backwards-compatible fields (old scanner)
      name: aiResult.drug_name || aiResult.generic_name || aiResult.brand_name || null,
      brand: aiResult.brand_name || null,
      genericName: aiResult.generic_name || null,
      strength: strengthNum || null,
      unit: strengthUnit,
      form: normalizedForm,
      confidence: aiResult.confidence || "medium",
      manufacturer,

      // New rich fields
      ndc_number: aiResult.ndc_number || fdaData?.ndc?.[0]?.product_ndc || null,
      lot_number: aiResult.lot_number || null,
      expiration_date: aiResult.expiration_date || null,
      quantity: aiResult.quantity || null,
      rx_or_otc: aiResult.rx_or_otc || null,
      drug_schedule: aiResult.drug_schedule || null,
      active_ingredients: aiResult.active_ingredients || fdaData?.ndc?.[0]?.active_ingredients || [],
      directions: aiResult.directions || null,
      warnings_visible: aiResult.warnings_visible || null,
      description: aiResult.description || null,

      // FDA verified data
      fda_data: fdaData,
      rxnorm_data: rxnormData,
      dailymed_data: dailymedData,
    };

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
