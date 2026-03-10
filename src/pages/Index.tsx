import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Brain, Shield, Clock } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/60 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold tracking-tight text-foreground">Forma Voluntas</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/reports")}>
          Past Reports
        </Button>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl w-full text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
              AI-Powered Investment<br />
              <span className="text-primary">Research & Analysis</span>
            </h1>
            <p className="font-narrative text-lg md:text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Deep research on equities and mutual funds, driven by fundamental analysis,
              technicals, and geopolitical intelligence. Built on 30 years of analyst wisdom.
            </p>
          </div>

          <Button
            size="lg"
            className="h-14 px-10 text-base font-semibold rounded-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
            onClick={() => navigate("/research")}
          >
            Start New Research
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            {[
              { icon: Brain, label: "AI Deep Analysis" },
              { icon: Shield, label: "Risk-Calibrated" },
              { icon: BarChart3, label: "Overlap Detection" },
              { icon: Clock, label: "Saved Reports" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm border border-border/50"
              >
                <Icon className="h-4 w-4 text-primary" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 px-6 py-4 text-center text-xs text-muted-foreground">
        For personal research purposes only. Not financial advice.
      </footer>
    </div>
  );
};

export default Index;
