import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { name, assetType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const assetTypeLabel = assetType === "mutual-fund" ? "mutual fund" : assetType;

    const systemPrompt = `You are an expert Indian financial analyst providing deep research reports. You must respond ONLY with a valid JSON object (no markdown, no code fences). The JSON must have exactly these fields:
{
  "name": "Full official name of the asset",
  "exchange": "Exchange where traded (e.g. NSE/BSE, MCX, NCDEX, AMFI)",
  "currentPrice": "Current price with ₹ symbol and unit (e.g. ₹3,850 or ₹62,500/10g or NAV: ₹45.2)",
  "category": "Category description (e.g. IT Services — Large Cap, Precious Metal, Food Grain)",
  "overview": "2-3 sentence overview of the asset",
  "demandAnalysis": "3-4 sentences on demand drivers, supply dynamics, market sentiment",
  "fundamentals": "3-4 sentences with key metrics (PE, ROE, margins for stocks; NAV, expense ratio for MF; production, MSP for commodities)",
  "technicals": "3-4 sentences with specific technical levels (support, resistance, RSI, MACD, moving averages)",
  "geopolitical": "2-3 sentences on geopolitical/macro factors affecting this asset",
  "verdict": "Buy" or "Hold" or "Avoid",
  "verdictRationale": "2-3 sentences explaining the verdict with actionable advice"
}

Important:
- Use realistic, current Indian market data and prices as of early 2026
- All prices in INR (₹)
- Be specific with numbers — don't use placeholders
- For commodities use per-unit pricing (per 10g, per kg, per quintal etc.)
- The verdict must be exactly one of: "Buy", "Hold", "Avoid"`;

    const userPrompt = `Generate a comprehensive deep research report for "${name}" which is a ${assetTypeLabel} in the Indian market. Provide realistic current prices and detailed analysis.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings → Workspace → Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await response.json();
    let content = aiResponse.choices?.[0]?.message?.content || "";

    // Strip markdown code fences if present
    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    let report;
    try {
      report = JSON.parse(content);
    } catch {
      console.error("Failed to parse AI response:", content);
      return new Response(JSON.stringify({ error: "Failed to parse AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate verdict
    if (!["Buy", "Hold", "Avoid"].includes(report.verdict)) {
      report.verdict = "Hold";
    }

    return new Response(JSON.stringify({ report: { ...report, assetType } }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("quick-research error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
