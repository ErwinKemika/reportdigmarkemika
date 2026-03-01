import { useMergedPageData } from "@/hooks/useMergedPageData";
import { getAdsBudgetData, formatCurrency, formatNumber } from "@/data/mockData";
import { transformAdsBudget } from "@/lib/dataTransformers";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { NoData } from "@/components/dashboard/NoData";
import { Search } from "lucide-react";
import { useMonth } from "@/contexts/MonthContext";

export default function GoogleAdsPage() {
  const { selectedMonth } = useMonth();
  const { data, isLoading } = useMergedPageData("ads-budget", getAdsBudgetData, transformAdsBudget);

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading...</div>;
  if (!data) return <NoData month={selectedMonth} />;

  const g = data.google;
  const roas = g.budget > 0 ? g.revenue / g.budget : 0;

  return (
    <div className="space-y-10 animate-fade-in">
      <SectionHeader title="Google Ads Performance" subtitle={selectedMonth} icon={<Search className="w-4 h-4 text-blue-500" />} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="bg-card rounded-xl border border-border/40 p-6 shadow-card border-l-[3px] border-l-blue-500">
          <span className="text-label uppercase tracking-wider text-muted-foreground">Budget</span>
          <div className="text-xl font-extrabold text-card-foreground mt-2">{formatCurrency(g.budget)}</div>
        </div>
        <div className="bg-card rounded-xl border border-border/40 p-6 shadow-card border-l-[3px] border-l-blue-500">
          <span className="text-label uppercase tracking-wider text-muted-foreground">Clicks</span>
          <div className="text-xl font-extrabold text-card-foreground mt-2">{formatNumber(g.clicks)}</div>
        </div>
        <div className="bg-card rounded-xl border border-border/40 p-6 shadow-card border-l-[3px] border-l-blue-500">
          <span className="text-label uppercase tracking-wider text-muted-foreground">Conversions</span>
          <div className="text-xl font-extrabold text-card-foreground mt-2">{formatNumber(g.conversions)}</div>
        </div>
        <div className="bg-card rounded-xl border border-border/40 p-6 shadow-card border-l-[3px] border-l-blue-500">
          <span className="text-label uppercase tracking-wider text-muted-foreground">ROAS</span>
          <div className="text-xl font-extrabold mt-2" style={{ color: "hsl(217, 91%, 60%)" }}>{roas.toFixed(2)}x</div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border/40 p-6 shadow-card">
        <h3 className="font-semibold text-sm text-card-foreground mb-4">Revenue from Google Ads</h3>
        <div className="text-3xl font-extrabold text-success">{formatCurrency(g.revenue)}</div>
        <p className="text-sm text-muted-foreground mt-2">Total revenue attributed to Google Ads campaigns this period.</p>
      </div>
    </div>
  );
}
