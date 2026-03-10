import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ResearchReport } from "@/types/investment";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, FileText } from "lucide-react";

const Reports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<ResearchReport[]>([]);

  useEffect(() => {
    const stored: ResearchReport[] = JSON.parse(localStorage.getItem("reports") || "[]");
    setReports(stored);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="text-lg font-semibold text-foreground">Past Reports</span>
        </div>
        <Button size="sm" onClick={() => navigate("/research")}>
          <Plus className="h-4 w-4 mr-1" />
          New Research
        </Button>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        {reports.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <FileText className="h-12 w-12 text-muted-foreground/40 mx-auto" />
            <p className="text-muted-foreground">No reports yet. Start your first research.</p>
            <Button onClick={() => navigate("/research")}>
              <Plus className="h-4 w-4 mr-1" />
              New Research
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => {
              const date = new Date(report.createdAt);
              const fd = report.formData;
              return (
                <Card
                  key={report.id}
                  className="border-border/60 hover:border-primary/30 transition-colors cursor-pointer"
                  onClick={() => navigate(`/report/${report.id}`)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-semibold text-sm text-foreground">
                        {fd.risk.charAt(0).toUpperCase() + fd.risk.slice(1)} · {fd.instrument === "both" ? "Equity + MF" : fd.instrument === "equities" ? "Equities" : "Mutual Funds"} · ₹{fd.amount}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} ·{" "}
                        {report.equityRecommendations.length} stocks, {report.mutualFundRecommendations.length} funds
                      </p>
                    </div>
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Reports;
