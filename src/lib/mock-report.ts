import { InvestmentFormData, ResearchReport, StockRecommendation, MutualFundRecommendation } from "@/types/investment";

const STOCK_DB: StockRecommendation[] = [
  {
    name: "Tata Consultancy Services",
    sector: "IT",
    cmp: "₹3,850",
    target: "₹4,400",
    rationale: "Market leader with consistent revenue growth driven by digital transformation demand globally.",
    demandAnalysis: "Enterprise cloud migration and AI integration driving sustained demand. Order book remains robust.",
    fundamentals: "PE: 28.5, ROE: 47%, Debt/Equity: 0.04. Best-in-class margins at 25%+.",
    technicals: "Trading above 200-DMA. RSI at 58 — neutral zone. Support at ₹3,700.",
    geopolitical: "Benefiting from US/EU outsourcing trends. Currency hedging mitigates INR volatility.",
  },
  {
    name: "HDFC Bank",
    sector: "Banking",
    cmp: "₹1,680",
    target: "₹1,950",
    rationale: "Strongest asset quality among Indian banks with expanding retail loan book.",
    demandAnalysis: "Credit growth at 18% YoY. Digital banking penetration creating new revenue streams.",
    fundamentals: "PE: 19.2, ROE: 16.8%, NPA: 1.2%. Consistent dividend payer.",
    technicals: "Breakout above ₹1,650 resistance. MACD bullish crossover on weekly chart.",
    geopolitical: "RBI's stable rate environment supports NIM. Merger synergies fully realized.",
  },
  {
    name: "Bharti Airtel",
    sector: "Telecom",
    cmp: "₹1,520",
    target: "₹1,800",
    rationale: "Duopoly market structure ensures pricing power. 5G rollout unlocking enterprise revenue.",
    demandAnalysis: "Data consumption growing 25% annually. ARPU trajectory firmly upward.",
    fundamentals: "PE: 35, ROE: 15.2%, improving FCF. Africa operations provide diversification.",
    technicals: "Strong uptrend. 50-DMA acting as dynamic support. RSI 62.",
    geopolitical: "Government's Digital India push supports telecom infrastructure investment.",
  },
  {
    name: "Larsen & Toubro",
    sector: "Infrastructure",
    cmp: "₹3,400",
    target: "₹3,900",
    rationale: "Largest beneficiary of India's infrastructure capex cycle with ₹4L+ crore order book.",
    demandAnalysis: "Government infrastructure spending at all-time highs. Defence orders accelerating.",
    fundamentals: "PE: 32, ROE: 14.5%. Order book provides 3-year revenue visibility.",
    technicals: "Consolidating near highs. Volume accumulation pattern. Support at ₹3,200.",
    geopolitical: "Make in India and defence indigenization directly benefit L&T's engineering capabilities.",
  },
  {
    name: "Sun Pharmaceutical",
    sector: "Pharma",
    cmp: "₹1,750",
    target: "₹2,050",
    rationale: "Specialty pharma pipeline in US market creating high-margin growth engine.",
    demandAnalysis: "Generic drug demand stable. Specialty products (Ilumya, Winlevi) gaining market share.",
    fundamentals: "PE: 38, ROE: 12.8%. R&D spending at 7% of revenue driving future pipeline.",
    technicals: "All-time high breakout. Strong momentum. Support at ₹1,650.",
    geopolitical: "FDA compliance improving. US healthcare policy stable for generics pricing.",
  },
];

const MF_DB: MutualFundRecommendation[] = [
  {
    name: "Parag Parikh Flexi Cap Fund",
    category: "Flexi Cap",
    aum: "₹58,000 Cr",
    expenseRatio: "0.63%",
    returns: "3Y: 18.2%, 5Y: 22.1%",
    overlapNote: "Minimal overlap with other recommended funds. Unique international allocation (Google, Alphabet, Microsoft).",
    sipOrLumpsum: "SIP recommended for ₹2L+; lumpsum suitable in market corrections.",
    rationale: "Diversified across market caps and geographies. Conservative stock selection with valuation discipline.",
  },
  {
    name: "ICICI Prudential Bluechip Fund",
    category: "Large Cap",
    aum: "₹52,000 Cr",
    expenseRatio: "0.87%",
    returns: "3Y: 16.5%, 5Y: 17.8%",
    overlapNote: "~15% portfolio overlap with PPFAS (HDFC Bank, ICICI Bank common holdings).",
    sipOrLumpsum: "SIP ideal for long-term wealth creation. Stable anchor for portfolio.",
    rationale: "Consistent top-quartile performer. Well-diversified large cap exposure with low volatility.",
  },
  {
    name: "Nippon India Small Cap Fund",
    category: "Small Cap",
    aum: "₹45,000 Cr",
    expenseRatio: "0.72%",
    returns: "3Y: 28.5%, 5Y: 30.2%",
    overlapNote: "Zero overlap with large cap funds. Provides complementary small cap exposure.",
    sipOrLumpsum: "Strictly SIP only. Lumpsum not recommended due to high volatility in small caps.",
    rationale: "Best risk-adjusted returns in category. Fund manager's stock-picking in emerging companies is exceptional.",
  },
  {
    name: "HDFC Mid-Cap Opportunities Fund",
    category: "Mid Cap",
    aum: "₹62,000 Cr",
    expenseRatio: "0.78%",
    returns: "3Y: 22.1%, 5Y: 24.5%",
    overlapNote: "~8% overlap with small cap fund in transitioning mid-to-small cap stocks.",
    sipOrLumpsum: "SIP preferred. Can consider staggered lumpsum on 10%+ market correction.",
    rationale: "India's mid cap space benefits most from domestic consumption growth. Fund has sector-diversified approach.",
  },
];

export function generateMockReport(formData: InvestmentFormData): ResearchReport {
  const showEquities = formData.instrument === "equities" || formData.instrument === "both";
  const showMF = formData.instrument === "mutual-funds" || formData.instrument === "both";

  let equityPct = 0, mfPct = 0, debtPct = 0, goldPct = 0;

  if (formData.risk === "aggressive") {
    equityPct = showEquities ? 55 : 0;
    mfPct = showMF ? 30 : 0;
    debtPct = 10;
    goldPct = 5;
  } else if (formData.risk === "moderate") {
    equityPct = showEquities ? 40 : 0;
    mfPct = showMF ? 35 : 0;
    debtPct = 15;
    goldPct = 10;
  } else {
    equityPct = showEquities ? 20 : 0;
    mfPct = showMF ? 40 : 0;
    debtPct = 30;
    goldPct = 10;
  }

  // Redistribute if one instrument type is excluded
  if (!showEquities) {
    mfPct += equityPct;
    equityPct = 0;
  }
  if (!showMF) {
    equityPct += mfPct;
    mfPct = 0;
  }

  // Pick 3-4 stocks based on sector preference
  let stocks = STOCK_DB;
  if (formData.sectors.length > 0) {
    const sectorFiltered = STOCK_DB.filter((s) =>
      formData.sectors.some((sec) => s.sector.toLowerCase().includes(sec.toLowerCase()))
    );
    stocks = sectorFiltered.length >= 2 ? sectorFiltered : STOCK_DB;
  }
  const selectedStocks = stocks.slice(0, formData.risk === "aggressive" ? 4 : 3);

  // Pick 2-3 MFs
  const selectedMFs = MF_DB.slice(0, formData.risk === "aggressive" ? 4 : 3);

  const riskLabel = formData.risk.charAt(0).toUpperCase() + formData.risk.slice(1);
  const tenureLabel =
    formData.tenure === "short" ? "1-3 year" :
    formData.tenure === "medium" ? "3-7 year" :
    formData.tenure === "long" ? "7-15 year" : "15+ year";

  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    formData,
    executiveSummary: `This research report is tailored for a ${riskLabel} investor with a ${tenureLabel} horizon and an investment corpus of ₹${formData.amount}. The analysis incorporates fundamental strength, market demand dynamics, technical positioning, and current geopolitical factors. The asset allocation prioritizes ${formData.risk === "aggressive" ? "growth with calculated risk exposure" : formData.risk === "moderate" ? "balanced growth with downside protection" : "capital preservation with steady income generation"}. ${showEquities ? `${selectedStocks.length} equity scripts` : ""}${showEquities && showMF ? " and " : ""}${showMF ? `${selectedMFs.length} mutual funds` : ""} have been carefully selected — enough for meaningful diversification without diluting conviction.`,
    assetAllocation: {
      equity: equityPct,
      mutualFunds: mfPct,
      debt: debtPct,
      gold: goldPct,
    },
    equityRecommendations: showEquities ? selectedStocks : [],
    mutualFundRecommendations: showMF ? selectedMFs : [],
    riskFactors: [
      "Global interest rate changes could impact equity valuations and fund NAVs.",
      "Geopolitical tensions (Middle East, US-China) may cause short-term volatility.",
      "Sector concentration risk if preference sectors face regulatory headwinds.",
      "Currency fluctuation risk for funds with international exposure.",
      "Liquidity risk in small/mid cap segments during market stress periods.",
    ],
    diversificationNote: `This portfolio recommends ${showEquities ? selectedStocks.length + " stocks" : ""}${showEquities && showMF ? " and " : ""}${showMF ? selectedMFs.length + " mutual funds" : ""} — deliberately limited to maintain conviction while ensuring adequate diversification. Over-diversification (10+ scripts) dilutes returns and makes monitoring impractical. Each selection serves a distinct purpose in the portfolio with minimal overlap.`,
  };
}
