import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { InvestmentFormData, ResearchReport } from "@/types/investment";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ANALYSIS_STEPS = [
  "Parsing investment intent and risk profile...",
  "Querying fundamental data: Revenue, EPS, ROE, Debt/Equity...",
  "Analyzing market demand for target sectors...",
  "Running technical analysis: Support, Resistance, RSI, MACD...",
  "Evaluating current geopolitical landscape...",
  "Forecasting macro-economic impact on selected sectors...",
  "Calculating portfolio overlap across mutual funds...",
  "Optimizing diversification — avoiding over-concentration...",
  "Building asset allocation strategy...",
  "Compiling final research report...",
];

const Analysis = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [visibleSteps, setVisibleSteps] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [aiDone, setAiDone] = useState(false);
  const [reportReady, setReportReady] = useState<ResearchReport | null>(null);

  useEffect(() => {
    const formData = sessionStorage.getItem("researchForm");
    if (!formData) {
      navigate("/research");
      return;
    }

    const parsed: InvestmentFormData = JSON.parse(formData);

    // Start AI call immediately
    const fetchReport = async () => {
      try {
        const { data, error: fnError } = await supabase.functions.invoke("portfolio-research", {
          body: parsed,
        });

        if (fnError) throw new Error(fnError.message || "AI analysis failed");
        if (data?.error) throw new Error(data.error);

        const report = data.report as ResearchReport;
        // Save to localStorage
        const existing = JSON.parse(localStorage.getItem("reports") || "[]");
        existing.unshift(report);
        localStorage.setItem("reports", JSON.stringify(existing));
        sessionStorage.removeItem("researchForm");
        setReportReady(report);
        setAiDone(true);
      } catch (err: any) {
        console.error("Portfolio research error:", err);
        setError(err.message || "Failed to generate report");
        toast.error(err.message || "Failed to generate report");
      }
    };

    fetchReport();

    // Animate steps independently
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= ANALYSIS_STEPS.length) {
          clearInterval(interval);
          return prev;
        }
        setVisibleSteps((s) => [...s, ANALYSIS_STEPS[prev]]);
        return prev + 1;
      });
    }, 700);

    return () => clearInterval(interval);
  }, [navigate]);

  // Navigate when both animation is done and AI is done
  useEffect(() => {
    if (aiDone && reportReady && currentStep >= ANALYSIS_STEPS.length) {
      setTimeout(() => navigate(`/report/${reportReady.id}`), 600);
    }
  }, [aiDone, reportReady, currentStep, navigate]);

  const stepsComplete = currentStep >= ANALYSIS_STEPS.length;
  const isComplete = stepsComplete && aiDone;

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center space-y-4 max-w-md">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-bold text-foreground">Analysis Failed</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate("/research")}>Go Back</Button>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-xl w-full space-y-6">
        <div className="flex items-center gap-3">
          {!isComplete && <Loader2 className="h-5 w-5 text-primary animate-spin" />}
          <h2 className="text-lg font-semibold text-foreground">
            {isComplete ? "Analysis Complete" : stepsComplete && !aiDone ? "AI is finalizing your report..." : "Running Deep Analysis..."}
          </h2>
        </div>

        <div className="space-y-2 font-mono text-sm">
          {visibleSteps.map((step, i) => (
            <div key={i} className="animate-fade-in flex items-start gap-2">
              <span className="text-primary font-bold select-none">›</span>
              <span className={i === visibleSteps.length - 1 && !isComplete ? "text-foreground" : "text-muted-foreground"}>
                {step}
              </span>
            </div>
          ))}
          {!isComplete && (
            <span className="inline-block w-2 h-4 bg-primary animate-blink ml-5" />
          )}
        </div>

        {isComplete && (
          <p className="text-sm text-primary font-medium animate-fade-in">
            Redirecting to your report...
          </p>
        )}
      </div>
    </div>
  );
};

export default Analysis;
