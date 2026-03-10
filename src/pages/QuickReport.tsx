import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { QuickResearchReport, AssetType } from "@/types/investment";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, TrendingUp, BarChart3, Globe, Activity, Eye, CheckCircle, AlertTriangle, MinusCircle, Search, Share2, Copy } from "lucide-react";
import { toast } from "sonner";

const verdictConfig = {
  Buy: { color: "text-success", bg: "bg-success/10 border-success/30", icon: CheckCircle },
  Hold: { color: "text-chart-4", bg: "bg-chart-4/10 border-chart-4/30", icon: MinusCircle },
  Avoid: { color: "text-destructive", bg: "bg-destructive/10 border-destructive/30", icon: AlertTriangle },
};

const QuickReport = () => {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<QuickResearchReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingSteps = [
    "Analyzing market data...",
    "Running fundamental analysis...",
    "Evaluating technical indicators...",
    "Assessing geopolitical factors...",
    "Generating verdict...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchReport = async () => {
      const data = sessionStorage.getItem("quickResearchData");
      let assetType: AssetType = "stock";
      if (data) {
        const parsed = JSON.parse(data);
        assetType = parsed.assetType;
      }

      const decodedName = decodeURIComponent(name || "");

      try {
        const { data: functionData, error: functionError } = await supabase.functions.invoke("quick-research", {
          body: { name: decodedName, assetType },
        });

        if (functionError) {
          throw new Error(functionError.message || "AI analysis failed");
        }

        if (functionData?.error) {
          throw new Error(functionData.error);
        }

        setReport(functionData.report as QuickResearchReport);
      } catch (err: any) {
        console.error("Quick research error:", err);
        setError(err.message || "Failed to generate report");
        toast.error(err.message || "Failed to generate report");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [name]);

  const handleCopyReport = () => {
    if (!report) return;
    const text = `${report.name} - AI Research Report\n\nVerdict: ${report.verdict}\nPrice: ${report.currentPrice}\n\n${report.overview}\n\n${report.verdictRationale}`;
    navigator.clipboard.writeText(text);
    toast.success("Report copied to clipboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6 max-w-sm">
          <div className="h-10 w-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="space-y-2">
            <p className="text-lg font-semibold text-foreground">Analyzing {decodeURIComponent(name || "")}</p>
            <p className="text-sm text-muted-foreground font-narrative animate-pulse">{loadingSteps[loadingStep]}</p>
          </div>
          <div className="flex gap-1 justify-center">
            {loadingSteps.map((_, i) => (
              <div key={i} className={`h-1.5 w-8 rounded-full transition-all duration-500 ${i <= loadingStep ? "bg-primary" : "bg-secondary"}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md px-6">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-bold text-foreground">Analysis Failed</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate("/quick-research")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!report) return null;

  const vc = verdictConfig[report.verdict];
  const VerdictIcon = vc.icon;

  const sections = [
    { icon: Eye, label: "Overview", content: report.overview },
    { icon: TrendingUp, label: "Demand Analysis", content: report.demandAnalysis },
    { icon: BarChart3, label: "Fundamental Analysis", content: report.fundamentals },
    { icon: Activity, label: "Technical Analysis", content: report.technicals },
    { icon: Globe, label: "Geopolitical Factors", content: report.geopolitical },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 px-6 py-4 flex items-center gap-3 sticky top-0 bg-background/95 backdrop-blur z-10">
        <Button variant="ghost" size="icon" onClick={() => navigate("/quick-research")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <span className="text-lg font-semibold text-foreground">{report.name}</span>
          <p className="text-xs text-muted-foreground">{report.exchange} · {report.category}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={handleCopyReport} title="Copy report">
          <Copy className="h-4 w-4" />
        </Button>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {/* Price & Verdict Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Current Price</p>
            <p className="text-3xl font-mono font-bold text-foreground">{report.currentPrice}</p>
          </div>
          <Card className={`border ${vc.bg}`}>
            <CardContent className="p-4 flex items-center gap-3">
              <VerdictIcon className={`h-6 w-6 ${vc.color}`} />
              <div>
                <p className={`text-lg font-bold ${vc.color}`}>{report.verdict}</p>
                <p className="text-xs text-muted-foreground">AI Verdict</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Analysis Sections */}
        {sections.map((section, i) => (
          <div key={section.label}>
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <section.icon className="h-5 w-5 text-primary" />
                {section.label}
              </h2>
              <p className="font-narrative text-base leading-relaxed text-foreground/90">{section.content}</p>
            </section>
            {i < sections.length - 1 && <Separator className="mt-6" />}
          </div>
        ))}

        <Separator />

        {/* Verdict Rationale */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <VerdictIcon className={`h-5 w-5 ${vc.color}`} />
            Verdict Rationale
          </h2>
          <p className="font-narrative text-base leading-relaxed text-foreground/90">{report.verdictRationale}</p>
        </section>

        {/* Research Another Asset CTA */}
        <Card className="border-primary/20 bg-secondary/50">
          <CardContent className="p-6 flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground text-center">
              Want to analyze another asset?
            </p>
            <Button size="lg" variant="outline" className="h-12 px-8" onClick={() => navigate("/quick-research")}>
              <Search className="mr-2 h-5 w-5" />
              Research Another Asset
            </Button>
          </CardContent>
        </Card>

        <div className="p-4 rounded-lg bg-secondary/50 border border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            This report is AI-generated for personal research purposes only. It does not constitute financial advice. Always consult a qualified financial advisor.
          </p>
        </div>
      </main>
    </div>
  );
};

export default QuickReport;
