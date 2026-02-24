import { useMonth } from "@/contexts/MonthContext";
import { getRecommendationsData } from "@/data/mockData";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { NoData } from "@/components/dashboard/NoData";
import { ActionTag } from "@/components/dashboard/ActionTag";
import { ClipboardList, Globe, Store, Clock } from "lucide-react";

export default function RecommendationsPage() {
  const { selectedMonth } = useMonth();
  const data = getRecommendationsData(selectedMonth);

  if (!data) return <NoData month={selectedMonth} />;

  const ActionPlanSection = ({ title, subtitle, items }: { title: string; subtitle: string; items: { action: string; tag: string }[] }) => (
    <div className="bg-card rounded-lg border border-border/50 p-5 shadow-card">
      <h3 className="font-semibold text-sm text-card-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground mb-4">{subtitle}</p>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-3 py-2 border-b border-border/30 last:border-0">
            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
            <div className="flex-1">
              <p className="text-sm text-card-foreground mb-1.5">{item.action}</p>
              <ActionTag tag={item.tag} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <SectionHeader title="Recommendation & Action Plan" subtitle={selectedMonth} icon={<ClipboardList className="w-4 h-4" />} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Optimasi Website */}
        <div className="bg-card rounded-lg border border-border/50 p-5 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm text-card-foreground">Optimasi Website</h3>
          </div>
          <ul className="space-y-2.5">
            {data.optimasiWebsite.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-card-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Optimasi Marketplace */}
        <div className="bg-card rounded-lg border border-border/50 p-5 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Store className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm text-card-foreground">Optimasi Marketplace</h3>
          </div>
          <ul className="space-y-2.5">
            {data.optimasiMarketplace.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-card-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Plans */}
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-card-foreground">Next Action Plan</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ActionPlanSection title="30 Days" subtitle="Immediate" items={data.actionPlan30} />
        <ActionPlanSection title="60 Days" subtitle="Tactical" items={data.actionPlan60} />
        <ActionPlanSection title="90 Days" subtitle="Strategic" items={data.actionPlan90} />
      </div>
    </div>
  );
}
