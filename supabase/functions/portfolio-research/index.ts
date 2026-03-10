import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const formData = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert Indian financial advisor creating personalized investment portfolio reports. Respond ONLY with valid JSON (no markdown, no code fences).

The JSON must follow this exact structure:
{
  "executiveSummary": "3-4 sentence executive summary of the portfolio strategy",
  "assetAllocation": {
    "equity": <number 0-100>,
    "mutualFunds": <number 0-100>,
    "debt": <number 0-100>,
    "gold": <number 0-100>,
    "commodities": <number 0-100>
  },
  "equityRecommendations": [
    {
      "name": "Company Name",
      "sector": "Sector",
      "cmp": "₹X,XXX",
      "target": "₹X,XXX (XX% upside)",
      "rationale": "2 sentences on why",
      "demandAnalysis": "2 sentences",
      "fundamentals": "2 sentences with PE, ROE, margins",
      "technicals": "2 sentences with support/resistance/RSI",
      "geopolitical": "1-2 sentences"
    }
  ],
  "mutualFundRecommendations": [
    {
      "name": "Fund Name",
      "category": "Category",
      "aum": "₹X,XXX Cr",
      "expenseRatio": "X.XX%",
      "returns": "1Y: XX% | 3Y: XX% | 5Y: XX%",
      "overlapNote": "Overlap analysis",
      "sipOrLumpsum": "SIP/Lumpsum recommendation",
      "rationale": "2 sentences"
    }
  ],
  "commodityRecommendations": [
    {
      "name": "Commodity Name",
      "category": "metals|energy|currency|food-grains|others",
      "exchange": "MCX/NCDEX",
      "cmp": "₹X,XXX/unit",
      "target": "₹X,XXX/unit (XX% upside)",
      "rationale": "2 sentences",
      "demandAnalysis": "2 sentences",
      "fundamentals": "2 sentences",
      "technicals": "2 sentences",
      "geopolitical": "1-2 sentences"
    }
  ],
  "riskFactors": ["Risk 1", "Risk 2", "Risk 3"],
  "diversificationNote": "2-3 sentences on portfolio diversification"
}

Rules:
- Asset allocation must sum to 100%
- Use realistic 2026 Indian market prices
- All prices in INR (₹)
- If instrument type doesn't include equities, equityRecommendations should be empty array
- If instrument type doesn't include mutual funds, mutualFundRecommendations should be empty array
- If instrument type doesn't include commodities, commodityRecommendations should be empty array
- Respect the scriptCount for number of recommendations
- Avoid overlap with existing holdings mentioned by user
- Match the risk appetite and tenure in your recommendations`;

    const userPrompt = `Create a personalized investment portfolio report with these parameters:
- Investment Tenure: ${formData.tenure}
- Investment Amount: ₹${formData.amount}
- Risk Appetite: ${formData.risk}
- Instrument Type: ${formData.instrument}
- Sector Preferences: ${formData.sectors?.length ? formData.sectors.join(", ") : "No preference"}
- Market Cap Preference: ${formData.marketCap}
- Geographic Exposure: ${formData.geoExposure}
- Existing Holdings: ${formData.existingHoldings || "None mentioned"}
- Tax Regime: ${formData.taxRegime}
- Number of Scripts/Funds: ${formData.scriptCount === "auto" ? "Decide the optimal number" : formData.scriptCount}
- Commodity Categories: ${formData.commodityCategories?.length ? formData.commodityCategories.join(", ") : "No preference"}`;

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
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
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

    // Ensure arrays exist
    if (!report.equityRecommendations) report.equityRecommendations = [];
    if (!report.mutualFundRecommendations) report.mutualFundRecommendations = [];
    if (!report.commodityRecommendations) report.commodityRecommendations = [];
    if (!report.riskFactors) report.riskFactors = [];

    // Generate ID and timestamp
    report.id = crypto.randomUUID();
    report.createdAt = new Date().toISOString();
    report.formData = formData;

    return new Response(JSON.stringify({ report }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("portfolio-research error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
