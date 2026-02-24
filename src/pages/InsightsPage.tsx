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
    <div className="space-y-8 animate-fade-in">
      <SectionHeader title="Insight & Analysis" subtitle={selectedMonth} icon={<Lightbulb className="w-4 h-4" />} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Insights — blue tint */}
        <div className="bg-tint-blue rounded-lg border border-channel-google/20 p-5 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-4 h-4 text-channel-google" />
            <h3 className="font-semibold text-sm text-card-foreground">Key Insights</h3>
          </div>
          <ul className="space-y-2.5">
            {data.keyInsights.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-card-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-channel-google mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Supporting Factors — green tint */}
        <div className="bg-tint-green rounded-lg border border-success/20 p-5 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <ThumbsUp className="w-4 h-4 text-success" />
            <h3 className="font-semibold text-sm text-card-foreground">Supporting Factors</h3>
          </div>
          <ul className="space-y-2.5">
            {data.supportingFactors.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-card-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-success mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Limiting Factors — red tint */}
        <div className="bg-tint-red rounded-lg border border-destructive/20 p-5 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <ThumbsDown className="w-4 h-4 text-destructive" />
            <h3 className="font-semibold text-sm text-card-foreground">Limiting Factors</h3>
          </div>
          <ul className="space-y-2.5">
            {data.limitingFactors.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-card-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Best Channel & Achievement */}
        <div className="space-y-4">
          <div className="bg-card rounded-lg border border-border/50 p-5 shadow-card">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-warning" />
              <h3 className="font-semibold text-sm text-card-foreground">Best Channel of the Month</h3>
            </div>
            <p className="text-2xl font-bold text-primary">{data.bestChannel}</p>
          </div>
          <div className="bg-card rounded-lg border border-border/50 p-5 shadow-card">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm text-card-foreground">Achievement vs Target</h3>
            </div>
            <p className={`text-2xl font-bold ${data.achievementPercent >= 100 ? "text-success" : data.achievementPercent >= 75 ? "text-warning" : "text-destructive"}`}>{data.achievementPercent}%</p>
            <div className="w-full bg-muted rounded-full h-2 mt-3">
              <div
                className="gradient-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(data.achievementPercent, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Insight Summary — blue highlight */}
      <div className="bg-tint-blue rounded-lg border-l-4 border-l-channel-google border border-channel-google/20 p-5 shadow-card">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-channel-google" />
          <h3 className="font-semibold text-sm text-card-foreground">Insight Summary</h3>
        </div>
        <p className="text-sm text-card-foreground leading-relaxed">{data.insightSummary}</p>
      </div>
    </div>
  );
}
