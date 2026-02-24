import { useMonth } from "@/contexts/MonthContext";
import { getWebstoreSalesData, formatCurrency, formatNumber, growthPercent } from "@/data/mockData";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { NoData } from "@/components/dashboard/NoData";
import { ShoppingCart, Eye, Package, TrendingUp, TrendingDown } from "lucide-react";

export default function WebstoreSalesPage() {
  const { selectedMonth } = useMonth();
  const data = getWebstoreSalesData(selectedMonth);

  if (!data) return <NoData month={selectedMonth} />;

  const revenueGrowth = growthPercent(data.totalRevenue, data.previousRevenue);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Total Revenue */}
      <div className="bg-card rounded-lg border border-border/50 p-6 shadow-card border-l-[3px] border-l-success">
        <SectionHeader title="Webstore Sales" subtitle={selectedMonth} icon={<ShoppingCart className="w-4 h-4" />} />
        <div className="flex items-end gap-4">
          <span className="text-3xl font-extrabold text-card-foreground">{formatCurrency(data.totalRevenue)}</span>
          <div className="flex items-center gap-1 mb-1">
            {revenueGrowth >= 0 ? (
              <TrendingUp className="w-4 h-4 text-success" />
            ) : (
              <TrendingDown className="w-4 h-4 text-destructive" />
            )}
            <span className={`text-sm font-semibold ${revenueGrowth >= 0 ? "text-success" : "text-destructive"}`}>
              {revenueGrowth >= 0 ? "+" : ""}{revenueGrowth.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products Viewed */}
        <section className="bg-card rounded-lg border border-border/50 p-5 shadow-card">
          <SectionHeader title="Top 5 Product Viewed" icon={<Eye className="w-4 h-4" />} />
          <div className="space-y-3">
            {data.topProductsViewed.map((product, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-channel-website flex items-center justify-center text-xs font-bold text-white">{i + 1}</span>
                  <span className="text-sm text-card-foreground">{product.name}</span>
                </div>
                <span className="text-sm font-semibold text-card-foreground">{formatNumber(product.sessions)} sessions</span>
              </div>
            ))}
          </div>
        </section>

        {/* Top Products Sold */}
        <section className="bg-card rounded-lg border border-border/50 p-5 shadow-card">
          <SectionHeader title="Top 5 Product Sold" icon={<Package className="w-4 h-4" />} />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-xs text-muted-foreground font-medium">#</th>
                  <th className="text-left py-2 text-xs text-muted-foreground font-medium">Product</th>
                  <th className="text-right py-2 text-xs text-muted-foreground font-medium">Units</th>
                  <th className="text-right py-2 text-xs text-muted-foreground font-medium">Price</th>
                  <th className="text-right py-2 text-xs text-muted-foreground font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.topProductsSold.map((p, i) => (
                  <tr key={i} className="border-b border-border/30 last:border-0">
                    <td className="py-2.5 font-medium text-card-foreground">{i + 1}</td>
                    <td className="py-2.5 text-card-foreground">{p.name}</td>
                    <td className="py-2.5 text-right font-medium text-card-foreground">{formatNumber(p.units)}</td>
                    <td className="py-2.5 text-right text-muted-foreground">{formatCurrency(p.price)}</td>
                    <td className="py-2.5 text-right font-semibold text-success">{formatCurrency(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
