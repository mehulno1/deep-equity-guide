import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Search, Zap, TrendingUp, Shield, Brain } from "lucide-react";
import { AssetType } from "@/types/investment";

const ASSET_TYPE_OPTIONS: { value: AssetType; label: string }[] = [
  { value: "stock", label: "Stock" },
  { value: "mutual-fund", label: "Mutual Fund" },
  { value: "commodity", label: "Commodity" },
];

const TRENDING_ASSETS = [
  { name: "Gold", type: "commodity" as AssetType },
  { name: "TCS", type: "stock" as AssetType },
  { name: "Jeera", type: "commodity" as AssetType },
  { name: "Crude Oil", type: "commodity" as AssetType },
  { name: "Reliance", type: "stock" as AssetType },
  { name: "Infosys", type: "stock" as AssetType },
  { name: "Silver", type: "commodity" as AssetType },
  { name: "Nippon Small Cap", type: "mutual-fund" as AssetType },
];

const QuickResearch = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [assetType, setAssetType] = useState<AssetType>("stock");

  const handleSubmit = () => {
    if (!name.trim()) return;
    sessionStorage.setItem("quickResearchData", JSON.stringify({ name: name.trim(), assetType }));
    navigate(`/quick-report/${encodeURIComponent(name.trim())}`);
  };

  const handleTrendingClick = (asset: { name: string; type: AssetType }) => {
    setName(asset.name);
    setAssetType(asset.type);
    sessionStorage.setItem("quickResearchData", JSON.stringify({ name: asset.name, assetType: asset.type }));
    navigate(`/quick-report/${encodeURIComponent(asset.name)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 px-6 py-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <span className="text-lg font-semibold text-foreground">Quick Research</span>
      </header>

      <main className="max-w-xl mx-auto px-6 py-16 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Research a Specific Asset</h1>
          <p className="text-muted-foreground font-narrative">
            Get an AI-powered deep research report with fundamental, technical, and geopolitical analysis in seconds.
          </p>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { icon: Brain, label: "AI-Powered" },
            { icon: Zap, label: "Real-time Analysis" },
            { icon: Shield, label: "5-Pillar Research" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Icon className="h-3.5 w-3.5 text-primary" />
              {label}
            </div>
          ))}
        </div>

        <section className="space-y-3">
          <Label className="text-sm font-semibold text-foreground uppercase tracking-wider">Asset Type</Label>
          <div className="grid grid-cols-3 gap-2">
            {ASSET_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setAssetType(opt.value)}
                className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                  assetType === opt.value
                    ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/15"
                    : "bg-card text-card-foreground border-border hover:border-primary/40 hover:bg-secondary"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <Label className="text-sm font-semibold text-foreground uppercase tracking-wider">Asset Name</Label>
          <Input
            type="text"
            placeholder="e.g. TCS, Gold, Nippon Small Cap Fund, Wheat, Crude Oil..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12 text-base"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        </section>

        {/* Trending assets */}
        <section className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Popular searches</p>
          <div className="flex flex-wrap gap-2">
            {TRENDING_ASSETS.map((asset) => (
              <button
                key={asset.name}
                type="button"
                onClick={() => handleTrendingClick(asset)}
                className="px-3 py-1.5 rounded-full text-xs font-medium border border-border bg-card text-card-foreground hover:border-primary/40 hover:bg-secondary transition-all"
              >
                {asset.name}
              </button>
            ))}
          </div>
        </section>

        <Button
          size="lg"
          className="w-full h-14 text-base font-semibold rounded-lg shadow-lg shadow-primary/20"
          onClick={handleSubmit}
          disabled={!name.trim()}
        >
          <Search className="mr-2 h-5 w-5" />
          Generate AI Research
        </Button>
      </main>
    </div>
  );
};

export default QuickResearch;
