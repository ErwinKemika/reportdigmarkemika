import { useMonth } from "@/contexts/MonthContext";
import { getClosingData } from "@/data/mockData";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { NoData } from "@/components/dashboard/NoData";
import { Flag, FileText, Star, Crosshair, TrendingUp, Target, DollarSign } from "lucide-react";

export default function ClosingPage() {
  const { selectedMonth } = useMonth();
  const data = getClosingData(selectedMonth);

  if (!data) return <NoData month={selectedMonth} />;

  const targetKPIs = [
    { label: "Traffic Growth", value: `${data.targetTrafficGrowth}%`, icon: <TrendingUp className="w-5 h-5" /> },
    { label: "Conversion Improvement", value: `${data.targetConversionImprovement}%`, icon: <Target className="w-5 h-5" /> },
    { label: "Target ROAS", value: `${data.targetROAS}x`, icon: <DollarSign className="w-5 h-5" /> },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <SectionHeader title="Closing & Summary" subtitle={selectedMonth} icon={<Flag className="w-4 h-4" />} />

      {/* Monthly Summary */}
      <div className="bg-card rounded-lg border border-border/50 p-6 shadow-card">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm text-card-foreground">Monthly Performance Summary</h3>
        </div>
        <p className="text-sm text-card-foreground leading-relaxed">{data.monthlySummary}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Highlights */}
        <div className="bg-card rounded-lg border border-border/50 p-5 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-warning" />
            <h3 className="font-semibold text-sm text-card-foreground">Highlights</h3>
          </div>
          <ul className="space-y-2.5">
            {data.highlights.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-card-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-warning mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Focus Area */}
        <div className="bg-card rounded-lg border border-primary/20 p-5 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <Crosshair className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm text-card-foreground">Focus Area Next Month</h3>
          </div>
          <p className="text-sm text-card-foreground leading-relaxed">{data.focusAreaNextMonth}</p>
        </div>
      </div>

      {/* Target KPIs */}
      <div>
        <h3 className="font-semibold text-card-foreground mb-4">Target Next Month KPI</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {targetKPIs.map((kpi, i) => (
            <div key={i} className="bg-card rounded-lg border border-border/50 p-6 shadow-card text-center">
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-3 text-primary-foreground">
                {kpi.icon}
              </div>
              <p className="text-2xl font-bold text-card-foreground mb-1">{kpi.value}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
