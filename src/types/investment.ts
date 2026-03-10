export type Tenure = "short" | "medium" | "long" | "ultra-long";
export type RiskAppetite = "defensive" | "moderate" | "aggressive";
export type InstrumentType = "equities" | "mutual-funds" | "both";
export type MarketCap = "large" | "mid" | "small" | "flexi" | "no-preference";
export type GeoExposure = "india" | "global" | "emerging";
export type TaxRegime = "old" | "new";

export const SECTORS = [
  "IT", "Pharma", "FMCG", "Banking", "Infrastructure",
  "Auto", "Energy", "Metals", "Chemicals", "Real Estate",
  "Telecom", "Defence", "Textiles",
] as const;

export type Sector = (typeof SECTORS)[number];

export type ScriptCount = "auto" | "3" | "4" | "5" | "6" | "8" | "10";

export interface InvestmentFormData {
  tenure: Tenure;
  amount: string;
  risk: RiskAppetite;
  instrument: InstrumentType;
  sectors: Sector[];
  marketCap: MarketCap;
  geoExposure: GeoExposure;
  existingHoldings: string;
  taxRegime: TaxRegime;
  scriptCount: ScriptCount;
}

export interface StockRecommendation {
  name: string;
  sector: string;
  cmp: string;
  target: string;
  rationale: string;
  demandAnalysis: string;
  fundamentals: string;
  technicals: string;
  geopolitical: string;
}

export interface MutualFundRecommendation {
  name: string;
  category: string;
  aum: string;
  expenseRatio: string;
  returns: string;
  overlapNote: string;
  sipOrLumpsum: string;
  rationale: string;
}

export interface ResearchReport {
  id: string;
  createdAt: string;
  formData: InvestmentFormData;
  executiveSummary: string;
  assetAllocation: {
    equity: number;
    mutualFunds: number;
    debt: number;
    gold: number;
  };
  equityRecommendations: StockRecommendation[];
  mutualFundRecommendations: MutualFundRecommendation[];
  riskFactors: string[];
  diversificationNote: string;
}
