import { useMergedPageData } from "@/hooks/useMergedPageData";
import { getRecommendationsData } from "@/data/mockData";
import { transformRecommendations } from "@/lib/dataTransformers";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { NoData } from "@/components/dashboard/NoData";
import { ActionTag } from "@/components/dashboard/ActionTag";
import { ClipboardList, Globe, Store, Clock } from "lucide-react";
import { useMonth } from "@/contexts/MonthContext";

export default function RecommendationsPage() {
  const { selectedMonth } = useMonth();
  const { data, isLoading } = useMergedPageData("recommendations", getRecommendationsData, transformRecommendations);

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading...</div>;
  if (!data) return <NoData month={selectedMonth} />;

  const planColors: Record<string, string> = {
    Immediate: "border-l-4 border-l-success bg-success/5",
    Tactical: "border-l-4 border-l-primary bg-primary/5",
    Strategic: "border-l-4 border-l-warning bg-warning/5",
  };

  const ActionPlanSection = ({ subtitle, items }: { subtitle: string; items: { action: string; tag: string }[] }) => (
    <div className={`bg-card rounded-xl border border-border/40 p-6 shadow-card hover:shadow-card-hover transition-all duration-300 ${planColors[subtitle] || ""}`}>
      <h3 className="text-section-title text-card-foreground mb-5">{subtitle}</h3>
      <div className="space-y-1">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-3 py-2 border-b border-border/20 last:border-0">
            <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
            <div className="flex-1">
              <p className="text-sm text-card-foreground mb-1 leading-relaxed">{item.action}</p>
              <ActionTag tag={item.tag} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-10 animate-fade-in">
      <SectionHeader title="Upcoming Action Plan" subtitle={selectedMonth} icon={<ClipboardList className="w-4 h-4" />} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border/40 p-6 shadow-card">
          <div className="flex items-center gap-2.5 mb-5">
            <Globe className="w-4 h-4 text-foreground" />
            <h3 className="font-semibold text-sm text-card-foreground">Optimasi Website</h3>
          </div>
          <ul className="space-y-3">
            {data.optimasiWebsite.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-card-foreground leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-foreground/30 mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-card rounded-xl border border-border/40 p-6 shadow-card">
          <div className="flex items-center gap-2.5 mb-5">
            <Store className="w-4 h-4 text-foreground" />
            <h3 className="font-semibold text-sm text-card-foreground">Optimasi Marketplace</h3>
          </div>
          <ul className="space-y-3">
            {data.optimasiMarketplace.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-card-foreground leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-foreground/30 mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex items-center gap-2.5 mb-2">
        <Clock className="w-4 h-4 text-foreground" />
        <h3 className="text-section-title text-foreground">Next Action Plan</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <ActionPlanSection subtitle="Immediate" items={data.actionPlan30} />
        <ActionPlanSection subtitle="Tactical" items={data.actionPlan60} />
        <ActionPlanSection subtitle="Strategic" items={data.actionPlan90} />
      </div>
    </div>
  );
}
