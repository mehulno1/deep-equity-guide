import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { InvestmentFormData, ResearchReport } from "@/types/investment";
import { generateMockReport } from "@/lib/mock-report";
import { Loader2 } from "lucide-react";

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

  useEffect(() => {
    const formData = sessionStorage.getItem("researchForm");
    if (!formData) {
      navigate("/research");
      return;
    }

    const parsed: InvestmentFormData = JSON.parse(formData);

    // Animate steps
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= ANALYSIS_STEPS.length) {
          clearInterval(interval);
          // Generate mock report and navigate
          const report = generateMockReport(parsed);
          const existing = JSON.parse(localStorage.getItem("reports") || "[]");
          existing.unshift(report);
          localStorage.setItem("reports", JSON.stringify(existing));
          sessionStorage.removeItem("researchForm");
          setTimeout(() => navigate(`/report/${report.id}`), 600);
          return prev;
        }
        setVisibleSteps((s) => [...s, ANALYSIS_STEPS[prev]]);
        return prev + 1;
      });
    }, 700);

    return () => clearInterval(interval);
  }, [navigate]);

  const isComplete = currentStep >= ANALYSIS_STEPS.length;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-xl w-full space-y-6">
        <div className="flex items-center gap-3">
          {!isComplete && <Loader2 className="h-5 w-5 text-primary animate-spin" />}
          <h2 className="text-lg font-semibold text-foreground">
            {isComplete ? "Analysis Complete" : "Running Deep Analysis..."}
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
