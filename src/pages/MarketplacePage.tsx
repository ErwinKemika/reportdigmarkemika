import { useMergedPageData } from "@/hooks/useMergedPageData";
import { getMarketplaceData, formatCurrency, formatNumber, growthPercent } from "@/data/mockData";
import { transformMarketplace } from "@/lib/dataTransformers";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { NoData } from "@/components/dashboard/NoData";
import { Store, TrendingUp, TrendingDown, ShoppingBag } from "lucide-react";
import { useMonth } from "@/contexts/MonthContext";

export default function MarketplacePage() {
  const { selectedMonth } = useMonth();
  const { data, isLoading } = useMergedPageData("marketplace", getMarketplaceData, transformMarketplace);

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading...</div>;
  if (!data) return <NoData month={selectedMonth} />;

  const revenueGrowth = growthPercent(data.totalCombinedRevenue, data.previousCombinedRevenue);
  const unitsGrowth = growthPercent(data.totalUnitsSold, data.previousUnitsSold);

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Hero Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-card rounded-xl border border-border/40 p-6 shadow-hero border-l-[4px] border-l-success">
          <p className="text-label text-muted-foreground uppercase tracking-wider mb-2">Total Combined Revenue</p>
          <p className="text-kpi font-extrabold text-card-foreground tracking-tight">Rp {data.totalCombinedRevenue.toLocaleString("id-ID")}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-xs text-muted-foreground">vs Prev Month: Rp {data.previousCombinedRevenue.toLocaleString("id-ID")}</span>
            {revenueGrowth >= 0 ? <TrendingUp className="w-3.5 h-3.5 text-success" /> : <TrendingDown className="w-3.5 h-3.5 text-destructive" />}
            <span className={`text-xs font-semibold ${revenueGrowth >= 0 ? "text-success" : "text-destructive"}`}>{revenueGrowth >= 0 ? "+" : ""}{revenueGrowth.toFixed(1)}%</span>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border/40 p-6 shadow-card">
          <p className="text-label text-muted-foreground uppercase tracking-wider mb-2">Total Units Sold</p>
          <p className="text-kpi font-extrabold text-card-foreground tracking-tight">{data.totalUnitsSold.toLocaleString("id-ID")}</p>
          <p className="text-xs text-muted-foreground mt-1">{data.totalProductCount} produk terjual</p>
          <div className="flex items-center gap-1.5 mt-2">
            {unitsGrowth >= 0 ? <TrendingUp className="w-3.5 h-3.5 text-success" /> : <TrendingDown className="w-3.5 h-3.5 text-destructive" />}
            <span className={`text-xs font-semibold ${unitsGrowth >= 0 ? "text-success" : "text-destructive"}`}>{unitsGrowth >= 0 ? "+" : ""}{unitsGrowth.toFixed(1)}%</span>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border/40 p-6 shadow-card">
          <p className="text-label text-muted-foreground uppercase tracking-wider mb-2">Growth vs Prev Month</p>
          <p className={`text-kpi font-extrabold tracking-tight ${revenueGrowth >= 0 ? "text-success" : "text-destructive"}`}>{revenueGrowth >= 0 ? "+" : ""}{revenueGrowth.toFixed(1)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tokopedia */}
        <section className="bg-card rounded-xl border border-border/40 p-6 shadow-card hover:shadow-card-hover transition-all duration-300 border-t-[3px] border-t-channel-tokopedia">
          <SectionHeader title="Tokopedia" icon={<Store className="w-4 h-4 text-channel-tokopedia" />} />
          {/* Tokopedia Total Revenue */}
          <div className="mb-4 p-4 bg-muted/30 rounded-lg">
            <p className="text-label text-muted-foreground uppercase tracking-wider mb-1">Total Revenue</p>
            <p className="text-lg font-extrabold text-card-foreground">Rp {data.tokopedia.revenue.toLocaleString("id-ID")}</p>
            {data.tokopedia.previousRevenue !== undefined && (() => {
              const g = growthPercent(data.tokopedia.revenue, data.tokopedia.previousRevenue);
              return (
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-xs text-muted-foreground">vs Prev Month: Rp {data.tokopedia.previousRevenue.toLocaleString("id-ID")}</span>
                  {g >= 0 ? <TrendingUp className="w-3.5 h-3.5 text-success" /> : <TrendingDown className="w-3.5 h-3.5 text-destructive" />}
                  <span className={`text-xs font-semibold ${g >= 0 ? "text-success" : "text-destructive"}`}>{g >= 0 ? "+" : ""}{g.toFixed(1)}%</span>
                </div>
              );
            })()}
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <MetricCard title="GMV" value={data.tokopedia.gmv} previousValue={data.tokopedia.previousGmv} format="currency" />
            <MetricCard title="Units Sold" value={data.tokopedia.unitsSold} previousValue={data.tokopedia.previousUnitsSold} />
          </div>
          <div className="grid grid-cols-2 gap-2 mb-6">
            <MetricCard title="Visitors" value={data.tokopedia.visitors} previousValue={data.tokopedia.previousVisitors} />
            <MetricCard title="Page Views" value={data.tokopedia.pageViews} previousValue={data.tokopedia.previousPageViews} />
          </div>
          <p className="text-label text-muted-foreground uppercase tracking-wider mb-3">Top 3 Best Selling</p>
          <div className="space-y-1">
            {data.tokopedia.topProducts.map((p, i) => (
              <div key={i} className="flex justify-between items-center py-2.5 border-b border-border/20 last:border-0">
                 <div className="flex items-center gap-2.5">
                   <span className="w-6 h-6 rounded-lg bg-channel-tokopedia text-primary-foreground flex items-center justify-center text-xs font-bold">{i + 1}</span>
                  <div>
                    <span className="text-sm font-medium">{p.name}</span>
                    <p className="text-xs text-muted-foreground">{p.units.toLocaleString("id-ID")} unit terjual</p>
                  </div>
                </div>
                <span className="text-sm font-semibold">{formatCurrency(p.revenue)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Shopee */}
        <section className="bg-card rounded-xl border border-border/40 p-6 shadow-card hover:shadow-card-hover transition-all duration-300 border-t-[3px] border-t-channel-shopee">
          <SectionHeader title="Shopee" icon={<ShoppingBag className="w-4 h-4 text-channel-shopee" />} />
          {/* Shopee Total Revenue */}
          <div className="mb-4 p-4 bg-muted/30 rounded-lg">
            <p className="text-label text-muted-foreground uppercase tracking-wider mb-1">Total Revenue</p>
            <p className="text-lg font-extrabold text-card-foreground">Rp {data.shopee.revenue.toLocaleString("id-ID")}</p>
            {data.shopee.previousRevenue !== undefined && (() => {
              const g = growthPercent(data.shopee.revenue, data.shopee.previousRevenue);
              return (
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-xs text-muted-foreground">vs Prev Month: Rp {data.shopee.previousRevenue.toLocaleString("id-ID")}</span>
                  {g >= 0 ? <TrendingUp className="w-3.5 h-3.5 text-success" /> : <TrendingDown className="w-3.5 h-3.5 text-destructive" />}
                  <span className={`text-xs font-semibold ${g >= 0 ? "text-success" : "text-destructive"}`}>{g >= 0 ? "+" : ""}{g.toFixed(1)}%</span>
                </div>
              );
            })()}
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <MetricCard title="Orders" value={data.shopee.orders} previousValue={data.shopee.previousOrders} />
            <MetricCard title="Visitors" value={data.shopee.visitors} previousValue={data.shopee.previousVisitors} />
          </div>
          <div className="grid grid-cols-2 gap-2 mb-6">
            <MetricCard title="Product Click" value={data.shopee.productClick} previousValue={data.shopee.previousProductClick} />
            <MetricCard title="Cancelled" value={data.shopee.cancelledOrders} previousValue={data.shopee.previousCancelledOrders} />
          </div>
          <p className="text-label text-muted-foreground uppercase tracking-wider mb-3">Top 3 Best Selling</p>
          <div className="space-y-1">
            {data.shopee.topProducts.map((p, i) => (
              <div key={i} className="flex justify-between items-center py-2.5 border-b border-border/20 last:border-0">
                 <div className="flex items-center gap-2.5">
                   <span className="w-6 h-6 rounded-lg bg-channel-shopee text-primary-foreground flex items-center justify-center text-xs font-bold">{i + 1}</span>
                  <div>
                    <span className="text-sm font-medium">{p.name}</span>
                    <p className="text-xs text-muted-foreground">{p.units.toLocaleString("id-ID")} unit terjual</p>
                  </div>
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
