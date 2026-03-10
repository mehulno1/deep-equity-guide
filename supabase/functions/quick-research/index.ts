import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Mapping of common asset names to Yahoo Finance ticker symbols
const TICKER_MAP: Record<string, { symbol: string; unit?: string }> = {
  // Indian stocks
  tcs: { symbol: "TCS.NS" },
  reliance: { symbol: "RELIANCE.NS" },
  infosys: { symbol: "INFY.NS" },
  "hdfc bank": { symbol: "HDFCBANK.NS" },
  "hdfc": { symbol: "HDFCBANK.NS" },
  wipro: { symbol: "WIPRO.NS" },
  "sbi": { symbol: "SBIN.NS" },
  "state bank": { symbol: "SBIN.NS" },
  "icici bank": { symbol: "ICICIBANK.NS" },
  "icici": { symbol: "ICICIBANK.NS" },
  "kotak": { symbol: "KOTAKBANK.NS" },
  "axis bank": { symbol: "AXISBANK.NS" },
  "bajaj finance": { symbol: "BAJFINANCE.NS" },
  "bharti airtel": { symbol: "BHARTIARTL.NS" },
  airtel: { symbol: "BHARTIARTL.NS" },
  "asian paints": { symbol: "ASIANPAINT.NS" },
  "maruti": { symbol: "MARUTI.NS" },
  "titan": { symbol: "TITAN.NS" },
  "nestle": { symbol: "NESTLEIND.NS" },
  "hul": { symbol: "HINDUNILVR.NS" },
  "itc": { symbol: "ITC.NS" },
  "lt": { symbol: "LT.NS" },
  "larsen": { symbol: "LT.NS" },
  "sun pharma": { symbol: "SUNPHARMA.NS" },
  "adani": { symbol: "ADANIENT.NS" },
  "tatamotors": { symbol: "TATAMOTORS.NS" },
  "tata motors": { symbol: "TATAMOTORS.NS" },
  "tata steel": { symbol: "TATASTEEL.NS" },
  "power grid": { symbol: "POWERGRID.NS" },
  "ntpc": { symbol: "NTPC.NS" },
  "ongc": { symbol: "ONGC.NS" },
  "coal india": { symbol: "COALINDIA.NS" },
  "tech mahindra": { symbol: "TECHM.NS" },
  "hcltech": { symbol: "HCLTECH.NS" },
  "hcl tech": { symbol: "HCLTECH.NS" },
  "ultratech": { symbol: "ULTRACEMCO.NS" },
  "dmart": { symbol: "DMART.NS" },
  "avenue supermarts": { symbol: "DMART.NS" },
  "zomato": { symbol: "ZOMATO.NS" },
  "paytm": { symbol: "PAYTM.NS" },
  "nykaa": { symbol: "NYKAA.NS" },
  // Global commodities available on Yahoo
  gold: { symbol: "GC=F", unit: "/10g" },
  silver: { symbol: "SI=F", unit: "/kg" },
  "crude oil": { symbol: "CL=F", unit: "/barrel" },
  "natural gas": { symbol: "NG=F", unit: "/mmBtu" },
  copper: { symbol: "HG=F", unit: "/kg" },
  // Forex
  "usd/inr": { symbol: "USDINR=X" },
  "eur/inr": { symbol: "EURINR=X" },
  "gbp/inr": { symbol: "GBPINR=X" },
  "jpy/inr": { symbol: "JPYINR=X" },
};

async function fetchYahooPrice(symbol: string): Promise<{ price: number | null; currency: string }> {
  try {
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbol)}`;
    const resp = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!resp.ok) {
      console.error(`Yahoo Finance returned ${resp.status} for ${symbol}`);
      return { price: null, currency: "INR" };
    }
    const data = await resp.json();
    const quote = data?.quoteResponse?.result?.[0];
    if (!quote) return { price: null, currency: "INR" };
    return {
      price: quote.regularMarketPrice ?? null,
      currency: quote.currency ?? "INR",
    };
  } catch (e) {
    console.error(`Failed to fetch Yahoo price for ${symbol}:`, e);
    return { price: null, currency: "INR" };
  }
}

function findTicker(name: string): { symbol: string; unit?: string } | null {
  const key = name.toLowerCase().trim();
  // Direct match
  if (TICKER_MAP[key]) return TICKER_MAP[key];
  // Partial match
  for (const [k, v] of Object.entries(TICKER_MAP)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return null;
}

// Convert USD commodity prices to INR approximations
async function getUsdInrRate(): Promise<number> {
  try {
    const { price } = await fetchYahooPrice("USDINR=X");
    return price ?? 83.5;
  } catch {
    return 83.5;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { name, assetType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const assetTypeLabel = assetType === "mutual-fund" ? "mutual fund" : assetType;
    const ticker = findTicker(name);

    let livePrice: string | null = null;
    let priceSource = "ai-estimated";

    if (ticker) {
      const [quoteResult, usdInr] = await Promise.all([
        fetchYahooPrice(ticker.symbol),
        ticker.symbol.includes("=F") && !ticker.symbol.includes("INR") ? getUsdInrRate() : Promise.resolve(1),
      ]);

      if (quoteResult.price !== null) {
        let finalPrice = quoteResult.price;
        const isUsd = quoteResult.currency === "USD";

        if (isUsd) {
          finalPrice = finalPrice * usdInr;
          // Convert gold from USD/troy oz to INR/10g
          if (ticker.symbol === "GC=F") {
            finalPrice = (finalPrice / 31.1035) * 10;
          }
          // Convert silver from USD/troy oz to INR/kg
          if (ticker.symbol === "SI=F") {
            finalPrice = (finalPrice / 31.1035) * 1000;
          }
          // Convert copper from USD/lb to INR/kg
          if (ticker.symbol === "HG=F") {
            finalPrice = finalPrice * 2.20462;
          }
        }

        const formatted = new Intl.NumberFormat("en-IN", {
          maximumFractionDigits: 2,
          minimumFractionDigits: 0,
        }).format(finalPrice);

        livePrice = `₹${formatted}${ticker.unit || ""}`;
        priceSource = "yahoo-finance";
      }
    }

    const priceInstruction = livePrice
      ? `IMPORTANT: The REAL current market price is ${livePrice} (sourced from Yahoo Finance). You MUST use this exact price in your "currentPrice" field. Do NOT make up a different price.`
      : `NOTE: No live price data is available for this asset. Provide your best estimate of the current Indian market price, but clearly prefix it with "~" to indicate it's an estimate (e.g. "~₹22,000/quintal").`;

    const systemPrompt = `You are an expert Indian financial analyst providing deep research reports. You must respond ONLY with a valid JSON object (no markdown, no code fences). The JSON must have exactly these fields:
{
  "name": "Full official name of the asset",
  "exchange": "Exchange where traded (e.g. NSE/BSE, MCX, NCDEX, AMFI)",
  "currentPrice": "Current price with ₹ symbol and unit",
  "category": "Category description",
  "overview": "2-3 sentence overview of the asset",
  "demandAnalysis": "3-4 sentences on demand drivers, supply dynamics, market sentiment",
  "fundamentals": "3-4 sentences with key metrics",
  "technicals": "3-4 sentences with specific technical levels (support, resistance, RSI, MACD, moving averages)",
  "geopolitical": "2-3 sentences on geopolitical/macro factors affecting this asset",
  "verdict": "Buy" or "Hold" or "Avoid",
  "verdictRationale": "2-3 sentences explaining the verdict with actionable advice"
}

${priceInstruction}

Important:
- Use realistic, current Indian market data
- All prices in INR (₹)
- Be specific with numbers
- For commodities use per-unit pricing (per 10g, per kg, per quintal etc.)
- The verdict must be exactly one of: "Buy", "Hold", "Avoid"`;

    const userPrompt = `Generate a comprehensive deep research report for "${name}" which is a ${assetTypeLabel} in the Indian market.`;

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
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings → Workspace → Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!["Buy", "Hold", "Avoid"].includes(report.verdict)) {
      report.verdict = "Hold";
    }

    // Override price with live data if available
    if (livePrice) {
      report.currentPrice = livePrice;
    }

    return new Response(JSON.stringify({
      report: { ...report, assetType, priceSource },
    }), {
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
