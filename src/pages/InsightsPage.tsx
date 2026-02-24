import { useMonth } from "@/contexts/MonthContext";
import { getInsightsData } from "@/data/mockData";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { NoData } from "@/components/dashboard/NoData";
import { Lightbulb, ThumbsUp, ThumbsDown, Award, Target, FileText } from "lucide-react";

export default function InsightsPage() {
  const { selectedMonth } = useMonth();
  const data = getInsightsData(selectedMonth);

  if (!data) return <NoData month={selectedMonth} />;

  return (
    <div className="space-y-10 animate-fade-in">
      <SectionHeader title="Insight & Analysis" subtitle={selectedMonth} icon={<Lightbulb className="w-4 h-4" />} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Insights */}
        <div className="bg-tint-blue rounded-xl border border-channel-google/15 p-6 shadow-card">
          <div className="flex items-center gap-2.5 mb-5">
            <Lightbulb className="w-4 h-4 text-channel-google" />
            <h3 className="font-semibold text-sm text-card-foreground">Key Insights</h3>
          </div>
          <ul className="space-y-3">
            {data.keyInsights.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-card-foreground leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-channel-google mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Supporting Factors */}
        <div className="bg-tint-green rounded-xl border border-success/15 p-6 shadow-card">
          <div className="flex items-center gap-2.5 mb-5">
            <ThumbsUp className="w-4 h-4 text-success" />
            <h3 className="font-semibold text-sm text-card-foreground">Supporting Factors</h3>
          </div>
          <ul className="space-y-3">
            {data.supportingFactors.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-card-foreground leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-success mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Limiting Factors */}
        <div className="bg-tint-red rounded-xl border border-destructive/15 p-6 shadow-card">
          <div className="flex items-center gap-2.5 mb-5">
            <ThumbsDown className="w-4 h-4 text-destructive" />
            <h3 className="font-semibold text-sm text-card-foreground">Limiting Factors</h3>
          </div>
          <ul className="space-y-3">
            {data.limitingFactors.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-card-foreground leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Best Channel & Achievement */}
        <div className="space-y-5">
          <div className="bg-card rounded-xl border border-border/40 p-6 shadow-card">
            <div className="flex items-center gap-2.5 mb-3">
              <Award className="w-4 h-4 text-warning" />
              <h3 className="font-semibold text-sm text-card-foreground">Best Channel of the Month</h3>
            </div>
            <p className="text-kpi font-extrabold text-foreground tracking-tight">{data.bestChannel}</p>
          </div>
          <div className="bg-card rounded-xl border border-border/40 p-6 shadow-card">
            <div className="flex items-center gap-2.5 mb-3">
              <Target className="w-4 h-4 text-foreground" />
              <h3 className="font-semibold text-sm text-card-foreground">Achievement vs Target</h3>
            </div>
            <p className={`text-kpi font-extrabold tracking-tight ${data.achievementPercent >= 100 ? "text-success" : data.achievementPercent >= 75 ? "text-warning" : "text-destructive"}`}>{data.achievementPercent}%</p>
            <div className="w-full bg-muted rounded-full h-2.5 mt-4 overflow-hidden">
              <div
                className="gradient-primary h-2.5 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${Math.min(data.achievementPercent, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Insight Summary */}
      <div className="bg-tint-blue rounded-xl border-l-4 border-l-channel-google border border-channel-google/15 p-6 shadow-card">
        <div className="flex items-center gap-2.5 mb-3">
          <FileText className="w-4 h-4 text-channel-google" />
          <h3 className="font-semibold text-sm text-card-foreground">Insight Summary</h3>
        </div>
        <p className="text-sm text-card-foreground leading-relaxed">{data.insightSummary}</p>
      </div>
    </div>
  );
}
