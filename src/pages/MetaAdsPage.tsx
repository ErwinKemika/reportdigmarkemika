import { useMergedPageData } from "@/hooks/useMergedPageData";
import { getAdsBudgetData, formatCurrency, formatNumber } from "@/data/mockData";
import { transformAdsBudget } from "@/lib/dataTransformers";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { NoData } from "@/components/dashboard/NoData";
import { Target } from "lucide-react";
import { useMonth } from "@/contexts/MonthContext";

export default function MetaAdsPage() {
  const { selectedMonth } = useMonth();
  const { data, isLoading } = useMergedPageData("ads-budget", getAdsBudgetData, transformAdsBudget);

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading...</div>;
  if (!data) return <NoData month={selectedMonth} />;

  const m = data.meta;
  const roas = m.budget > 0 ? m.revenue / m.budget : 0;

  return (
    <div className="space-y-10 animate-fade-in">
      <SectionHeader title="Meta Ads Performance" subtitle={selectedMonth} icon={<Target className="w-4 h-4 text-purple-500" />} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="bg-card rounded-xl border border-border/40 p-6 shadow-card border-l-[3px] border-l-purple-500">
          <span className="text-label uppercase tracking-wider text-muted-foreground">Budget</span>
          <div className="text-xl font-extrabold text-card-foreground mt-2">{formatCurrency(m.budget)}</div>
        </div>
        <div className="bg-card rounded-xl border border-border/40 p-6 shadow-card border-l-[3px] border-l-purple-500">
          <span className="text-label uppercase tracking-wider text-muted-foreground">Clicks</span>
          <div className="text-xl font-extrabold text-card-foreground mt-2">{formatNumber(m.clicks)}</div>
        </div>
        <div className="bg-card rounded-xl border border-border/40 p-6 shadow-card border-l-[3px] border-l-purple-500">
          <span className="text-label uppercase tracking-wider text-muted-foreground">Conversions</span>
          <div className="text-xl font-extrabold text-card-foreground mt-2">{formatNumber(m.conversions)}</div>
        </div>
        <div className="bg-card rounded-xl border border-border/40 p-6 shadow-card border-l-[3px] border-l-purple-500">
          <span className="text-label uppercase tracking-wider text-muted-foreground">ROAS</span>
          <div className="text-xl font-extrabold mt-2" style={{ color: "hsl(245, 58%, 51%)" }}>{roas.toFixed(2)}x</div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border/40 p-6 shadow-card">
        <h3 className="font-semibold text-sm text-card-foreground mb-4">Revenue from Meta Ads</h3>
        <div className="text-3xl font-extrabold text-success">{formatCurrency(m.revenue)}</div>
        <p className="text-sm text-muted-foreground mt-2">Total revenue attributed to Meta Ads campaigns this period.</p>
      </div>
    </div>
  );
}
