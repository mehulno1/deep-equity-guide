import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ResearchReport } from "@/types/investment";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, BarChart3, Gem } from "lucide-react";

const AllocationBar = ({ allocation }: { allocation: ResearchReport["assetAllocation"] }) => {
  const items = [
    { label: "Equity", value: allocation.equity, color: "bg-primary" },
    { label: "Mutual Funds", value: allocation.mutualFunds, color: "bg-chart-2" },
    { label: "Commodities", value: allocation.commodities, color: "bg-chart-5" },
    { label: "Debt", value: allocation.debt, color: "bg-chart-3" },
    { label: "Gold", value: allocation.gold, color: "bg-chart-4" },
  ].filter((i) => i.value > 0);

  return (
    <div className="space-y-3">
      <div className="flex h-8 rounded-lg overflow-hidden">
        {items.map((item) => (
          <div key={item.label} className={`${item.color} flex items-center justify-center text-xs font-bold text-primary-foreground`} style={{ width: `${item.value}%` }}>
            {item.value}%
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-sm">
            <div className={`w-3 h-3 rounded-sm ${item.color}`} />
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-semibold text-foreground">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const Report = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<ResearchReport | null>(null);

  useEffect(() => {
    const reports: ResearchReport[] = JSON.parse(localStorage.getItem("reports") || "[]");
    const found = reports.find((r) => r.id === id);
    if (found) {
      // Backfill missing fields from older reports
      if (!found.commodityRecommendations) found.commodityRecommendations = [];
      if (found.assetAllocation.commodities === undefined) found.assetAllocation.commodities = 0;
      setReport(found);
    } else navigate("/");
  }, [id, navigate]);

  if (!report) return null;

  const date = new Date(report.createdAt);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 px-6 py-4 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <span className="text-lg font-semibold text-foreground">Research Report</span>
            <p className="text-xs text-muted-foreground">
              {date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate("/reports")}>All Reports</Button>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {/* Executive Summary */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Executive Summary
          </h2>
          <p className="font-narrative text-base leading-relaxed text-foreground/90">{report.executiveSummary}</p>
        </section>

        <Separator />

        {/* Asset Allocation */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Asset Allocation</h2>
          <AllocationBar allocation={report.assetAllocation} />
        </section>

        <Separator />

        {/* Equity Recommendations */}
        {report.equityRecommendations.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Equity Recommendations
            </h2>
            <div className="space-y-4">
              {report.equityRecommendations.map((stock, i) => (
                <Card key={i} className="border-border/60">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{stock.name}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">{stock.sector}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono font-semibold text-foreground">CMP: {stock.cmp}</p>
                        <p className="text-sm font-mono text-success">Target: {stock.target}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="font-narrative text-sm text-foreground/90 leading-relaxed">{stock.rationale}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { label: "Market Demand", value: stock.demandAnalysis },
                        { label: "Fundamentals", value: stock.fundamentals },
                        { label: "Technicals", value: stock.technicals },
                        { label: "Geopolitical", value: stock.geopolitical },
                      ].map((detail) => (
                        <div key={detail.label} className="bg-secondary/50 rounded-lg p-3">
                          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">{detail.label}</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">{detail.value}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {report.equityRecommendations.length > 0 && (report.mutualFundRecommendations.length > 0 || report.commodityRecommendations.length > 0) && <Separator />}

        {/* Mutual Fund Recommendations */}
        {report.mutualFundRecommendations.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Mutual Fund Recommendations
            </h2>
            <div className="space-y-4">
              {report.mutualFundRecommendations.map((fund, i) => (
                <Card key={i} className="border-border/60">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{fund.name}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">{fund.category}</p>
                      </div>
                      <div className="text-right text-xs font-mono space-y-0.5">
                        <p className="text-muted-foreground">AUM: {fund.aum}</p>
                        <p className="text-muted-foreground">ER: {fund.expenseRatio}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="font-narrative text-sm text-foreground/90 leading-relaxed">{fund.rationale}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="bg-secondary/50 rounded-lg p-3">
                        <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Returns</p>
                        <p className="text-xs text-muted-foreground">{fund.returns}</p>
                      </div>
                      <div className="bg-secondary/50 rounded-lg p-3">
                        <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Overlap Analysis</p>
                        <p className="text-xs text-muted-foreground">{fund.overlapNote}</p>
                      </div>
                      <div className="bg-secondary/50 rounded-lg p-3">
                        <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">SIP vs Lumpsum</p>
                        <p className="text-xs text-muted-foreground">{fund.sipOrLumpsum}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {report.mutualFundRecommendations.length > 0 && report.commodityRecommendations.length > 0 && <Separator />}

        {/* Commodity Recommendations */}
        {report.commodityRecommendations.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Gem className="h-5 w-5 text-primary" />
              Commodity Recommendations
            </h2>
            <div className="space-y-4">
              {report.commodityRecommendations.map((commodity, i) => (
                <Card key={i} className="border-border/60">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{commodity.name}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">{commodity.exchange} · {commodity.category.charAt(0).toUpperCase() + commodity.category.slice(1)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono font-semibold text-foreground">CMP: {commodity.cmp}</p>
                        <p className="text-sm font-mono text-success">Target: {commodity.target}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="font-narrative text-sm text-foreground/90 leading-relaxed">{commodity.rationale}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { label: "Market Demand", value: commodity.demandAnalysis },
                        { label: "Fundamentals", value: commodity.fundamentals },
                        { label: "Technicals", value: commodity.technicals },
                        { label: "Geopolitical", value: commodity.geopolitical },
                      ].map((detail) => (
                        <div key={detail.label} className="bg-secondary/50 rounded-lg p-3">
                          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">{detail.label}</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">{detail.value}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        <Separator />

        {/* Risk Factors */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Risk Factors
          </h2>
          <ul className="space-y-2">
            {report.riskFactors.map((risk, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <TrendingDown className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <span className="font-narrative">{risk}</span>
              </li>
            ))}
          </ul>
        </section>

        <Separator />

        {/* Diversification Note */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            Diversification Strategy
          </h2>
          <p className="font-narrative text-base leading-relaxed text-foreground/90">{report.diversificationNote}</p>
        </section>

        <div className="mt-12 p-4 rounded-lg bg-secondary/50 border border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            This report is generated for personal research purposes only. It does not constitute financial advice.
            Always consult a certified financial advisor before making investment decisions.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Report;
