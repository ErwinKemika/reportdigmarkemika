import { useMergedPageData } from "@/hooks/useMergedPageData";
import { getMarketplaceData, formatCurrency, formatNumber, growthPercent } from "@/data/mockData";
import { transformMarketplace, marketplacePrevMapper } from "@/lib/dataTransformers";
import { NoData } from "@/components/dashboard/NoData";
import { Store, TrendingUp, TrendingDown, ShoppingBag } from "lucide-react";
import { useMonth } from "@/contexts/MonthContext";

export default function MarketplacePage() {
  const { selectedMonth, selectedYear } = useMonth();
  const { data, isLoading } = useMergedPageData("marketplace", getMarketplaceData, transformMarketplace, marketplacePrevMapper);

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading...</div>;
  if (!data) return <NoData month={selectedMonth} />;

  const revenueGrowth = growthPercent(data.totalCombinedRevenue, data.previousCombinedRevenue);
  const unitsGrowth = growthPercent(data.totalUnitsSold, data.previousUnitsSold);

  const GrowthBadge = ({ value, size = "sm" }: { value: number; size?: "sm" | "lg" }) => {
    const isUp = value >= 0;
    const Icon = isUp ? TrendingUp : TrendingDown;
    const textClass = size === "lg" ? "text-base font-bold" : "text-xs font-semibold";
    const iconClass = size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5";
    return (
      <span className={`inline-flex items-center gap-1 ${isUp ? "text-success" : "text-destructive"}`}>
        <Icon className={iconClass} />
        <span className={textClass}>{isUp ? "+" : ""}{value.toFixed(1)}%</span>
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Combined Revenue */}
        <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Total Combined Revenue</p>
          <p className="text-2xl font-extrabold text-card-foreground tracking-tight">Rp {data.totalCombinedRevenue.toLocaleString("id-ID")}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <GrowthBadge value={revenueGrowth} />
            <span className="text-xs text-muted-foreground">{data.totalProductCount} product</span>
          </div>
        </div>

        {/* Total Units Sold */}
        <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Total Units Sold</p>
          <p className="text-2xl font-extrabold text-card-foreground tracking-tight">{data.totalUnitsSold.toLocaleString("id-ID")}</p>
          <div className="flex items-center gap-2 mt-2">
            <GrowthBadge value={unitsGrowth} />
            <span className="text-xs text-muted-foreground">{data.totalProductCount} produk terjual</span>
          </div>
        </div>

        {/* Growth Card */}
        <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-card flex flex-col justify-center items-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Growth vs Prev Month</p>
          <div className={`text-4xl font-extrabold tracking-tight ${revenueGrowth >= 0 ? "text-success" : "text-destructive"}`}>
            {revenueGrowth >= 0 ? "" : ""}{revenueGrowth.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Channel Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ===== Tokopedia ===== */}
        <div className="rounded-2xl border border-border/30 overflow-hidden shadow-card bg-card">
          {/* Channel Header */}
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ background: "linear-gradient(135deg, #00b894, #55efc4)" }}>
                <Store className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-card-foreground">Tokopedia</h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="px-3 py-1 rounded-md border border-border/50 bg-muted/50 font-medium text-card-foreground">{selectedMonth}</span>
              <span className="px-3 py-1 rounded-md bg-success text-success-foreground font-bold">{selectedYear}</span>
            </div>
          </div>

          {/* Revenue Banner - Green gradient */}
          <div className="mx-5 mb-4 rounded-xl p-5" style={{ background: "linear-gradient(135deg, hsl(160 60% 94%), hsl(160 40% 97%))" }}>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Revenue</p>
            <p className="text-2xl font-extrabold tracking-tight" style={{ color: "#0F1524" }}>Rp {data.tokopedia.revenue.toLocaleString("id-ID")}</p>
            {data.tokopedia.previousRevenue !== undefined && (() => {
              const g = growthPercent(data.tokopedia.revenue, data.tokopedia.previousRevenue);
              return (
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs text-muted-foreground">PV Bulan terkait</span>
                  <GrowthBadge value={g} />
                </div>
              );
            })()}
          </div>

          {/* Metric Row */}
          <div className="grid grid-cols-2 gap-3 mx-5 mb-6">
            <MetricItem label="GMV" value={data.tokopedia.gmv} prevValue={data.tokopedia.previousGmv} isCurrency />
            <MetricItem label="UNITS SOLD" value={data.tokopedia.unitsSold} prevValue={data.tokopedia.previousUnitsSold} />
            <MetricItem label="VISITORS" value={data.tokopedia.visitors} prevValue={data.tokopedia.previousVisitors} />
            <MetricItem label="PAGE VIEWS" value={data.tokopedia.pageViews} prevValue={data.tokopedia.previousPageViews} />
          </div>

          {/* Top Products */}
          <div className="px-6 pb-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-4">Top {data.tokopedia.topProducts.length} Best Selling</p>
            <div className="rounded-xl overflow-hidden border border-border/30">
              <div className="px-4 py-2.5 text-white font-semibold text-sm flex items-center gap-2" style={{ background: "linear-gradient(135deg, #00b894, #55efc4)" }}>
                <Store className="w-4 h-4" />
                Tokopedia
              </div>
              {data.tokopedia.topProducts.map((p, i) => (
                <div key={i} className="flex justify-between items-center px-4 py-3 border-b border-border/15 last:border-0 bg-card">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{ background: i === 0 ? "linear-gradient(135deg, #00b894, #55efc4)" : "hsl(160 30% 70%)" }}>{i + 1}</span>
                    <div>
                      <span className="text-sm font-medium text-card-foreground">{p.name}</span>
                      <p className="text-xs text-muted-foreground">{p.units.toLocaleString("id-ID")} unit sold</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-card-foreground">{formatCurrency(p.revenue)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== Shopee ===== */}
        <div className="rounded-2xl border border-border/30 overflow-hidden shadow-card bg-card">
          {/* Channel Header */}
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ background: "linear-gradient(135deg, #e17055, #fab1a0)" }}>
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-card-foreground">Shopee</h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="px-3 py-1 rounded-md border border-border/50 bg-muted/50 font-medium text-card-foreground">{selectedMonth}</span>
              <span className="px-3 py-1 rounded-md border border-border/50 bg-muted/50 font-medium text-card-foreground">{selectedYear}</span>
            </div>
          </div>

          {/* Revenue Banner - Orange/Peach gradient */}
          <div className="mx-5 mb-5 rounded-xl p-5" style={{ background: "linear-gradient(135deg, hsl(15 80% 94%), hsl(15 60% 97%))" }}>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Revenue</p>
            <p className="text-2xl font-extrabold tracking-tight" style={{ color: "#0F1524" }}>Rp {data.shopee.revenue.toLocaleString("id-ID")}</p>
            {data.shopee.previousRevenue !== undefined && (() => {
              const g = growthPercent(data.shopee.revenue, data.shopee.previousRevenue);
              return (
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs text-muted-foreground">PV Bulan terkait</span>
                  <GrowthBadge value={g} />
                </div>
              );
            })()}
          </div>

          {/* Metric Row */}
          <div className="grid grid-cols-2 gap-3 mx-5 mb-6">
            <MetricItem label="ORDERS" value={data.shopee.orders} prevValue={data.shopee.previousOrders} />
            <MetricItem label="VISITORS" value={data.shopee.visitors} prevValue={data.shopee.previousVisitors} />
            <MetricItem label="PRODUCT CLICK" value={data.shopee.productClick} prevValue={data.shopee.previousProductClick} />
            <MetricItem label="CANCELLED" value={data.shopee.cancelledOrders} prevValue={data.shopee.previousCancelledOrders} />
          </div>

          {/* Top Products */}
          <div className="px-6 pb-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-4">Top {data.shopee.topProducts.length} Best Selling</p>
            <div className="rounded-xl overflow-hidden border border-border/30">
              <div className="px-4 py-2.5 text-white font-semibold text-sm flex items-center gap-2" style={{ background: "linear-gradient(135deg, #e17055, #fab1a0)" }}>
                <ShoppingBag className="w-4 h-4" />
                Shopee
              </div>
              {data.shopee.topProducts.map((p, i) => (
                <div key={i} className="flex justify-between items-center px-4 py-3 border-b border-border/15 last:border-0 bg-card">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{ background: i === 0 ? "linear-gradient(135deg, #e17055, #fab1a0)" : "hsl(15 40% 75%)" }}>{i + 1}</span>
                    <div>
                      <span className="text-sm font-medium text-card-foreground">{p.name}</span>
                      <p className="text-xs text-muted-foreground">{p.units.toLocaleString("id-ID")} unit sold</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-card-foreground">{formatCurrency(p.revenue)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Small inline metric */
function MetricItem({ label, value, prevValue, isCurrency }: { label: string; value: number; prevValue?: number; isCurrency?: boolean }) {
  const g = prevValue !== undefined ? growthPercent(value, prevValue) : null;
  const displayVal = isCurrency
    ? `Rp ${value.toLocaleString("id-ID")}`
    : value >= 1000
      ? `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`
      : value.toLocaleString("id-ID");
  return (
    <div className="text-center py-3 rounded-lg bg-muted/30">
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <p className="text-lg font-bold text-card-foreground">{displayVal}</p>
      {g !== null && (
        <span className={`text-xs font-semibold ${g >= 0 ? "text-success" : "text-destructive"}`}>
          {g >= 0 ? "↑" : "↓"} {Math.abs(g).toFixed(1)}%
        </span>
      )}
    </div>
  );
}
