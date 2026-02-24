import { useMonth } from "@/contexts/MonthContext";
import { getMarketplaceData, formatCurrency, formatNumber, growthPercent } from "@/data/mockData";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { NoData } from "@/components/dashboard/NoData";
import { Store, TrendingUp, TrendingDown, ShoppingBag } from "lucide-react";

export default function MarketplacePage() {
  const { selectedMonth } = useMonth();
  const data = getMarketplaceData(selectedMonth);

  if (!data) return <NoData month={selectedMonth} />;

  const revenueGrowth = growthPercent(data.totalCombinedRevenue, data.previousCombinedRevenue);
  const unitsGrowth = growthPercent(data.totalUnitsSold, data.previousUnitsSold);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border border-border/50 p-5 shadow-card border-l-[3px] border-l-success">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Combined Revenue</p>
          <p className="text-2xl font-extrabold text-card-foreground">{formatCurrency(data.totalCombinedRevenue)}</p>
          <div className="flex items-center gap-1 mt-1">
            {revenueGrowth >= 0 ? <TrendingUp className="w-3.5 h-3.5 text-success" /> : <TrendingDown className="w-3.5 h-3.5 text-destructive" />}
            <span className={`text-xs font-semibold ${revenueGrowth >= 0 ? "text-success" : "text-destructive"}`}>{revenueGrowth >= 0 ? "+" : ""}{revenueGrowth.toFixed(1)}%</span>
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border/50 p-5 shadow-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Units Sold</p>
          <p className="text-2xl font-extrabold text-card-foreground">{formatNumber(data.totalUnitsSold)}</p>
          <div className="flex items-center gap-1 mt-1">
            {unitsGrowth >= 0 ? <TrendingUp className="w-3.5 h-3.5 text-success" /> : <TrendingDown className="w-3.5 h-3.5 text-destructive" />}
            <span className={`text-xs font-semibold ${unitsGrowth >= 0 ? "text-success" : "text-destructive"}`}>{unitsGrowth >= 0 ? "+" : ""}{unitsGrowth.toFixed(1)}%</span>
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border/50 p-5 shadow-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Growth vs Prev Month</p>
          <p className={`text-2xl font-extrabold ${revenueGrowth >= 0 ? "text-success" : "text-destructive"}`}>{revenueGrowth >= 0 ? "+" : ""}{revenueGrowth.toFixed(1)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tokopedia — green accent */}
        <section className="bg-card rounded-lg border border-border/50 p-5 shadow-card border-t-[3px] border-t-channel-tokopedia">
          <SectionHeader title="Tokopedia" icon={<Store className="w-4 h-4 text-channel-tokopedia" />} />
          <div className="grid grid-cols-3 gap-2 mb-4">
            <MetricCard title="Revenue" value={data.tokopedia.revenue} format="currency" />
            <MetricCard title="GMV" value={data.tokopedia.gmv} format="currency" />
            <MetricCard title="Units Sold" value={data.tokopedia.unitsSold} />
          </div>
          <div className="grid grid-cols-2 gap-2 mb-5">
            <MetricCard title="Visitors" value={data.tokopedia.visitors} />
            <MetricCard title="Page Views" value={data.tokopedia.pageViews} />
          </div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Top 3 Best Selling</p>
          <div className="space-y-2">
            {data.tokopedia.topProducts.map((p, i) => (
              <div key={i} className="flex justify-between items-center py-1.5 border-b border-border/30 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-channel-tokopedia text-white flex items-center justify-center text-xs font-bold">{i + 1}</span>
                  <span className="text-sm">{p.name}</span>
                </div>
                <span className="text-sm font-semibold">{formatCurrency(p.revenue)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Shopee — orange accent */}
        <section className="bg-card rounded-lg border border-border/50 p-5 shadow-card border-t-[3px] border-t-channel-shopee">
          <SectionHeader title="Shopee" icon={<ShoppingBag className="w-4 h-4 text-channel-shopee" />} />
          <div className="grid grid-cols-3 gap-2 mb-4">
            <MetricCard title="Revenue" value={data.shopee.revenue} format="currency" />
            <MetricCard title="Orders" value={data.shopee.orders} />
            <MetricCard title="Visitors" value={data.shopee.visitors} />
          </div>
          <div className="grid grid-cols-2 gap-2 mb-5">
            <MetricCard title="Product Click" value={data.shopee.productClick} />
            <MetricCard title="Cancelled" value={data.shopee.cancelledOrders} />
          </div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Top 3 Best Selling</p>
          <div className="space-y-2">
            {data.shopee.topProducts.map((p, i) => (
              <div key={i} className="flex justify-between items-center py-1.5 border-b border-border/30 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-channel-shopee text-white flex items-center justify-center text-xs font-bold">{i + 1}</span>
                  <span className="text-sm">{p.name}</span>
                </div>
                <span className="text-sm font-semibold">{formatCurrency(p.revenue)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
