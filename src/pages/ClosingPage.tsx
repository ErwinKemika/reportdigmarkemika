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
    { label: "Traffic Growth", value: `${data.targetTrafficGrowth}%`, icon: <TrendingUp className="w-5 h-5" />, color: "bg-channel-website" },
    { label: "Conversion Improvement", value: `${data.targetConversionImprovement}%`, icon: <Target className="w-5 h-5" />, color: "bg-success" },
    { label: "Target ROAS", value: `${data.targetROAS}x`, icon: <DollarSign className="w-5 h-5" />, color: "bg-channel-google" },
  ];

  return (
    <div className="space-y-10 animate-fade-in">
      <SectionHeader title="Closing & Summary" subtitle={selectedMonth} icon={<Flag className="w-4 h-4" />} />

      {/* Monthly Summary */}
      <div className="bg-tint-blue rounded-xl border border-channel-google/15 p-8 shadow-card">
        <div className="flex items-center gap-2.5 mb-4">
          <FileText className="w-4 h-4 text-channel-google" />
          <h3 className="font-semibold text-sm text-card-foreground">Monthly Performance Summary</h3>
        </div>
        <p className="text-sm text-card-foreground leading-relaxed">{data.monthlySummary}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Highlights */}
        <div className="bg-tint-green rounded-xl border border-success/15 p-6 shadow-card">
          <div className="flex items-center gap-2.5 mb-5">
            <Star className="w-4 h-4 text-warning" />
            <h3 className="font-semibold text-sm text-card-foreground">Highlights</h3>
          </div>
          <ul className="space-y-3">
            {data.highlights.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-card-foreground leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-success mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Focus Area */}
        <div className="bg-tint-purple rounded-xl border border-channel-meta/15 p-6 shadow-card">
          <div className="flex items-center gap-2.5 mb-4">
            <Crosshair className="w-4 h-4 text-channel-meta" />
            <h3 className="font-semibold text-sm text-card-foreground">Focus Area Next Month</h3>
          </div>
          <p className="text-sm text-card-foreground leading-relaxed">{data.focusAreaNextMonth}</p>
        </div>
      </div>

      {/* Target KPIs */}
      <div>
        <h3 className="text-section-title text-foreground mb-5">Target Next Month KPI</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {targetKPIs.map((kpi, i) => (
            <div key={i} className="bg-card rounded-xl border border-border/40 p-8 shadow-card hover:shadow-card-hover transition-all duration-300 text-center">
              <div className={`w-14 h-14 ${kpi.color} rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary-foreground shadow-card`}>
                {kpi.icon}
              </div>
              <p className="text-kpi font-extrabold text-card-foreground mb-1.5 tracking-tight">{kpi.value}</p>
              <p className="text-label text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
