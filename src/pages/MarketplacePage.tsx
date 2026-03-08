import { useMergedPageData } from "@/hooks/useMergedPageData";
import { getMarketplaceData, getWebstoreSalesData, formatCurrency, formatNumber, growthPercent } from "@/data/mockData";
import { transformMarketplace, marketplacePrevMapper, transformWebstoreSales, webstoreSalesPrevMapper } from "@/lib/dataTransformers";
import { NoData } from "@/components/dashboard/NoData";
import { Store, TrendingUp, TrendingDown, ShoppingBag, ShoppingCart, Eye, Package } from "lucide-react";
import { useMonth } from "@/contexts/MonthContext";

export default function MarketplacePage() {
  const { selectedMonth, selectedYear } = useMonth();
  const { data, isLoading } = useMergedPageData("marketplace", getMarketplaceData, transformMarketplace, marketplacePrevMapper);
  const { data: wsData, isLoading: wsLoading } = useMergedPageData("webstore-sales", getWebstoreSalesData, transformWebstoreSales, webstoreSalesPrevMapper);

  if (isLoading || wsLoading) return <div className="p-8 text-muted-foreground">Loading...</div>;
  if (!data) return <NoData month={selectedMonth} />;

  // Include webstore revenue in combined totals
  const webstoreRevenue = wsData?.totalRevenue || 0;
  const webstorePrevRevenue = wsData?.previousRevenue || 0;
  const totalCombinedRevenue = data.totalCombinedRevenue + webstoreRevenue;
  const previousCombinedRevenue = data.previousCombinedRevenue + webstorePrevRevenue;

  const revenueGrowth = growthPercent(totalCombinedRevenue, previousCombinedRevenue);
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
          <p className="text-2xl font-extrabold text-card-foreground tracking-tight">Rp {totalCombinedRevenue.toLocaleString("id-ID")}</p>
          {previousCombinedRevenue > 0 && (
            <p className="text-xs text-muted-foreground mt-1">Prev: Rp {previousCombinedRevenue.toLocaleString("id-ID")}</p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <GrowthBadge value={revenueGrowth} />
            <span className="text-xs text-muted-foreground">Tokopedia + Shopee + Webstore</span>
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
            {revenueGrowth.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Channel Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ===== Tokopedia ===== */}
        <div className="rounded-2xl border border-border/30 overflow-hidden shadow-card bg-card">
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

          <div className="mx-5 mb-4 rounded-xl p-5" style={{ background: "linear-gradient(135deg, hsl(160 60% 94%), hsl(160 40% 97%))" }}>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Revenue</p>
            <p className="text-2xl font-extrabold tracking-tight" style={{ color: "#0F1524" }}>Rp {data.tokopedia.revenue.toLocaleString("id-ID")}</p>
            {data.tokopedia.previousRevenue !== undefined && (
              <p className="text-xs text-muted-foreground mt-1">Prev: Rp {data.tokopedia.previousRevenue.toLocaleString("id-ID")}</p>
            )}
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

          <div className="grid grid-cols-2 gap-3 mx-5 mb-6">
            <MetricItem label="GMV" value={data.tokopedia.gmv} prevValue={data.tokopedia.previousGmv} isCurrency />
            <MetricItem label="UNITS SOLD" value={data.tokopedia.unitsSold} prevValue={data.tokopedia.previousUnitsSold} />
            <MetricItem label="VISITORS" value={data.tokopedia.visitors} prevValue={data.tokopedia.previousVisitors} />
            <MetricItem label="PAGE VIEWS" value={data.tokopedia.pageViews} prevValue={data.tokopedia.previousPageViews} />
          </div>

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

          <div className="mx-5 mb-5 rounded-xl p-5" style={{ background: "linear-gradient(135deg, hsl(15 80% 94%), hsl(15 60% 97%))" }}>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Revenue</p>
            <p className="text-2xl font-extrabold tracking-tight" style={{ color: "#0F1524" }}>Rp {data.shopee.revenue.toLocaleString("id-ID")}</p>
            {data.shopee.previousRevenue !== undefined && (
              <p className="text-xs text-muted-foreground mt-1">Prev: Rp {data.shopee.previousRevenue.toLocaleString("id-ID")}</p>
            )}
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

          <div className="grid grid-cols-2 gap-3 mx-5 mb-6">
            <MetricItem label="ORDERS" value={data.shopee.orders} prevValue={data.shopee.previousOrders} />
            <MetricItem label="VISITORS" value={data.shopee.visitors} prevValue={data.shopee.previousVisitors} />
            <MetricItem label="PRODUCT CLICK" value={data.shopee.productClick} prevValue={data.shopee.previousProductClick} />
            <MetricItem label="CANCELLED" value={data.shopee.cancelledOrders} prevValue={data.shopee.previousCancelledOrders} />
          </div>

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

      {/* ===== Webstore Sales ===== */}
      {wsData && (
        <div className="rounded-2xl border border-border/30 overflow-hidden shadow-card bg-card">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ background: "linear-gradient(135deg, #6c5ce7, #a29bfe)" }}>
                <ShoppingCart className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-card-foreground">Webstore Sales</h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="px-3 py-1 rounded-md border border-border/50 bg-muted/50 font-medium text-card-foreground">{selectedMonth}</span>
              <span className="px-3 py-1 rounded-md border border-border/50 bg-muted/50 font-medium text-card-foreground">{selectedYear}</span>
            </div>
          </div>

          {/* Revenue Banner - Purple gradient */}
          <div className="mx-5 mb-5 rounded-xl p-5" style={{ background: "linear-gradient(135deg, hsl(262 60% 94%), hsl(262 40% 97%))" }}>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Revenue</p>
            <p className="text-2xl font-extrabold tracking-tight" style={{ color: "#0F1524" }}>Rp {wsData.totalRevenue.toLocaleString("id-ID")}</p>
            {wsData.previousRevenue > 0 && (
              <p className="text-xs text-muted-foreground mt-1">Prev: Rp {wsData.previousRevenue.toLocaleString("id-ID")}</p>
            )}
            {wsData.previousRevenue > 0 && (() => {
              const g = growthPercent(wsData.totalRevenue, wsData.previousRevenue);
              return (
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs text-muted-foreground">PV Bulan terkait</span>
                  <GrowthBadge value={g} />
                </div>
              );
            })()}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-6 pb-6">
            {/* Top Products Viewed */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Top 5 Product Viewed</p>
              </div>
              <div className="space-y-1">
                {wsData.topProductsViewed.map((product, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{ background: i === 0 ? "linear-gradient(135deg, #6c5ce7, #a29bfe)" : "hsl(262 30% 70%)" }}>{i + 1}</span>
                      <span className="text-sm font-medium text-card-foreground">{product.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-muted-foreground">{formatNumber(product.sessions)} sessions</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Products Sold */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Top 5 Product Sold</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60">
                      <th className="text-left py-3 text-[10px] text-muted-foreground uppercase tracking-wider">#</th>
                      <th className="text-left py-3 text-[10px] text-muted-foreground uppercase tracking-wider">Product</th>
                      <th className="text-right py-3 text-[10px] text-muted-foreground uppercase tracking-wider">Units</th>
                      <th className="text-right py-3 text-[10px] text-muted-foreground uppercase tracking-wider">Price</th>
                      <th className="text-right py-3 text-[10px] text-muted-foreground uppercase tracking-wider">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wsData.topProductsSold.map((p, i) => (
                      <tr key={i} className="border-b border-border/20 last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="py-3.5 font-semibold text-card-foreground">{i + 1}</td>
                        <td className="py-3.5 font-medium text-card-foreground">{p.name}</td>
                        <td className="py-3.5 text-right font-medium text-card-foreground">{formatNumber(p.units)}</td>
                        <td className="py-3.5 text-right text-muted-foreground">{formatCurrency(p.price)}</td>
                        <td className="py-3.5 text-right font-semibold text-success">{formatCurrency(p.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
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
