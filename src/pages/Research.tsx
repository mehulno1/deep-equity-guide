import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Sparkles } from "lucide-react";
import {
  InvestmentFormData,
  Tenure,
  RiskAppetite,
  InstrumentType,
  MarketCap,
  GeoExposure,
  TaxRegime,
  ScriptCount,
  SECTORS,
  Sector,
} from "@/types/investment";

const TENURE_OPTIONS: { value: Tenure; label: string; desc: string }[] = [
  { value: "short", label: "Short", desc: "1–3 years" },
  { value: "medium", label: "Medium", desc: "3–7 years" },
  { value: "long", label: "Long", desc: "7–15 years" },
  { value: "ultra-long", label: "Ultra-Long", desc: "15+ years" },
];

const RISK_OPTIONS: { value: RiskAppetite; label: string; desc: string }[] = [
  { value: "defensive", label: "Defensive", desc: "Capital preservation, steady returns" },
  { value: "moderate", label: "Moderate", desc: "Balanced growth with managed risk" },
  { value: "aggressive", label: "Aggressive", desc: "High growth, higher volatility" },
];

const INSTRUMENT_OPTIONS: { value: InstrumentType; label: string }[] = [
  { value: "equities", label: "Equities" },
  { value: "mutual-funds", label: "Mutual Funds" },
  { value: "both", label: "Both" },
];

const MARKET_CAP_OPTIONS: { value: MarketCap; label: string }[] = [
  { value: "large", label: "Large Cap" },
  { value: "mid", label: "Mid Cap" },
  { value: "small", label: "Small Cap" },
  { value: "flexi", label: "Flexi Cap" },
  { value: "no-preference", label: "No Preference" },
];

const GEO_OPTIONS: { value: GeoExposure; label: string }[] = [
  { value: "india", label: "India Only" },
  { value: "global", label: "Global" },
  { value: "emerging", label: "Emerging Markets" },
];

const TAX_OPTIONS: { value: TaxRegime; label: string }[] = [
  { value: "old", label: "Old Regime" },
  { value: "new", label: "New Regime" },
];

const SCRIPT_COUNT_OPTIONS: { value: ScriptCount; label: string; desc?: string }[] = [
  { value: "auto", label: "Let AI Decide", desc: "Best number based on your profile" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
  { value: "6", label: "6" },
  { value: "8", label: "8" },
  { value: "10", label: "10" },
];

function OptionPill({
  selected,
  onClick,
  children,
  subtitle,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all text-left ${
        selected
          ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/15"
          : "bg-card text-card-foreground border-border hover:border-primary/40 hover:bg-secondary"
      }`}
    >
      <div>{children}</div>
      {subtitle && (
        <div className={`text-xs mt-0.5 ${selected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
          {subtitle}
        </div>
      )}
    </button>
  );
}

const Research = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<InvestmentFormData>({
    tenure: "medium",
    amount: "",
    risk: "moderate",
    instrument: "both",
    sectors: [],
    marketCap: "no-preference",
    geoExposure: "india",
    existingHoldings: "",
    taxRegime: "new",
    scriptCount: "auto",
  });

  const toggleSector = (sector: Sector) => {
    setForm((prev) => ({
      ...prev,
      sectors: prev.sectors.includes(sector)
        ? prev.sectors.filter((s) => s !== sector)
        : [...prev.sectors, sector],
    }));
  };

  const handleSubmit = () => {
    if (!form.amount) return;
    // Store form data and navigate to analysis
    sessionStorage.setItem("researchForm", JSON.stringify(form));
    navigate("/analysis");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/60 px-6 py-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <span className="text-lg font-semibold text-foreground">New Research</span>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        {/* Tenure */}
        <section className="space-y-3">
          <Label className="text-sm font-semibold text-foreground uppercase tracking-wider">Investment Tenure</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {TENURE_OPTIONS.map((opt) => (
              <OptionPill
                key={opt.value}
                selected={form.tenure === opt.value}
                onClick={() => setForm((p) => ({ ...p, tenure: opt.value }))}
                subtitle={opt.desc}
              >
                {opt.label}
              </OptionPill>
            ))}
          </div>
        </section>

        {/* Amount */}
        <section className="space-y-3">
          <Label className="text-sm font-semibold text-foreground uppercase tracking-wider">Investment Amount (₹)</Label>
          <Input
            type="text"
            placeholder="e.g. 5,00,000"
            value={form.amount}
            onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
            className="h-12 text-base font-mono"
          />
        </section>

        {/* Risk */}
        <section className="space-y-3">
          <Label className="text-sm font-semibold text-foreground uppercase tracking-wider">Risk Appetite</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {RISK_OPTIONS.map((opt) => (
              <OptionPill
                key={opt.value}
                selected={form.risk === opt.value}
                onClick={() => setForm((p) => ({ ...p, risk: opt.value }))}
                subtitle={opt.desc}
              >
                {opt.label}
              </OptionPill>
            ))}
          </div>
        </section>

        {/* Instrument */}
        <section className="space-y-3">
          <Label className="text-sm font-semibold text-foreground uppercase tracking-wider">Instrument Type</Label>
          <div className="grid grid-cols-3 gap-2">
            {INSTRUMENT_OPTIONS.map((opt) => (
              <OptionPill
                key={opt.value}
                selected={form.instrument === opt.value}
                onClick={() => setForm((p) => ({ ...p, instrument: opt.value }))}
              >
                {opt.label}
              </OptionPill>
            ))}
          </div>
        </section>

        {/* Sectors */}
        <section className="space-y-3">
          <Label className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Sector Preference <span className="text-muted-foreground font-normal normal-case">(optional, multi-select)</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {SECTORS.map((sector) => (
              <button
                key={sector}
                type="button"
                onClick={() => toggleSector(sector)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  form.sectors.includes(sector)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:border-primary/40"
                }`}
              >
                {sector}
              </button>
            ))}
          </div>
        </section>

        {/* Market Cap */}
        <section className="space-y-3">
          <Label className="text-sm font-semibold text-foreground uppercase tracking-wider">Market Cap Preference</Label>
          <div className="flex flex-wrap gap-2">
            {MARKET_CAP_OPTIONS.map((opt) => (
              <OptionPill
                key={opt.value}
                selected={form.marketCap === opt.value}
                onClick={() => setForm((p) => ({ ...p, marketCap: opt.value }))}
              >
                {opt.label}
              </OptionPill>
            ))}
          </div>
        </section>

        {/* Geo Exposure */}
        <section className="space-y-3">
          <Label className="text-sm font-semibold text-foreground uppercase tracking-wider">Geographic Exposure</Label>
          <div className="grid grid-cols-3 gap-2">
            {GEO_OPTIONS.map((opt) => (
              <OptionPill
                key={opt.value}
                selected={form.geoExposure === opt.value}
                onClick={() => setForm((p) => ({ ...p, geoExposure: opt.value }))}
              >
                {opt.label}
              </OptionPill>
            ))}
          </div>
        </section>

        {/* Existing Holdings */}
        <section className="space-y-3">
          <Label className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Existing Holdings <span className="text-muted-foreground font-normal normal-case">(optional — to avoid overlap)</span>
          </Label>
          <Textarea
            placeholder="e.g. HDFC Bank, SBI Bluechip Fund, Infosys..."
            value={form.existingHoldings}
            onChange={(e) => setForm((p) => ({ ...p, existingHoldings: e.target.value }))}
            className="font-mono text-sm"
            rows={3}
          />
        </section>

        {/* Tax Regime */}
        <section className="space-y-3">
          <Label className="text-sm font-semibold text-foreground uppercase tracking-wider">Tax Regime</Label>
          <div className="grid grid-cols-2 gap-2">
            {TAX_OPTIONS.map((opt) => (
              <OptionPill
                key={opt.value}
                selected={form.taxRegime === opt.value}
                onClick={() => setForm((p) => ({ ...p, taxRegime: opt.value }))}
              >
                {opt.label}
              </OptionPill>
            ))}
          </div>
        </section>

        {/* Number of Scripts/Funds */}
        <section className="space-y-3">
          <Label className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Number of Scripts / Funds
          </Label>
          <div className="flex flex-wrap gap-2">
            {SCRIPT_COUNT_OPTIONS.map((opt) => (
              <OptionPill
                key={opt.value}
                selected={form.scriptCount === opt.value}
                onClick={() => setForm((p) => ({ ...p, scriptCount: opt.value }))}
                subtitle={opt.desc}
              >
                {opt.label}
              </OptionPill>
            ))}
          </div>
        </section>

        {/* Submit */}
        <Card className="border-primary/20 bg-secondary/50">
          <CardContent className="p-6 flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground text-center font-narrative text-base">
              The AI will analyze your inputs using fundamental, technical, and geopolitical intelligence
              to generate a comprehensive research report.
            </p>
            <Button
              size="lg"
              className="h-14 px-12 text-base font-semibold rounded-lg shadow-lg shadow-primary/20"
              onClick={handleSubmit}
              disabled={!form.amount}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Generate Analysis
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Research;
