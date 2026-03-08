import { useMergedPageData } from "@/hooks/useMergedPageData";
import { getWebstoreSalesData, formatCurrency, formatNumber, growthPercent } from "@/data/mockData";
import { transformWebstoreSales, webstoreSalesPrevMapper } from "@/lib/dataTransformers";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { NoData } from "@/components/dashboard/NoData";

import { ShoppingCart, Eye, Package, TrendingUp, TrendingDown } from "lucide-react";
import { useMonth } from "@/contexts/MonthContext";

export default function WebstoreSalesPage() {
  const { selectedMonth } = useMonth();
  const { data, isLoading } = useMergedPageData("webstore-sales", getWebstoreSalesData, transformWebstoreSales, webstoreSalesPrevMapper);

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading...</div>;
  if (!data) return <NoData month={selectedMonth} />;

  const revenueGrowth = growthPercent(data.totalRevenue, data.previousRevenue);

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="bg-card rounded-2xl border border-border/40 p-8 shadow-hero border-l-[4px] border-l-success">
        <SectionHeader title="Webstore Sales" subtitle={selectedMonth} icon={<ShoppingCart className="w-4 h-4" />} />
        <div className="flex items-end gap-4">
          <span className="text-kpi-lg text-card-foreground tracking-tight">Rp {data.totalRevenue.toLocaleString("id-ID")}</span>
          <div className="flex items-center gap-1.5 mb-2">
            {revenueGrowth >= 0 ? <TrendingUp className="w-4 h-4 text-success" /> : <TrendingDown className="w-4 h-4 text-destructive" />}
            <span className={`text-sm font-semibold ${revenueGrowth >= 0 ? "text-success" : "text-destructive"}`}>
              {revenueGrowth >= 0 ? "+" : ""}{revenueGrowth.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-card rounded-xl border border-border/40 p-6 shadow-card hover:shadow-card-hover transition-all duration-300">
          <SectionHeader title="Top 5 Product Viewed" icon={<Eye className="w-4 h-4" />} />
          <div className="space-y-1">
            {data.topProductsViewed.map((product, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-channel-website flex items-center justify-center text-xs font-bold text-primary-foreground">{i + 1}</span>
                  <span className="text-sm font-medium text-card-foreground">{product.name}</span>
                </div>
                <span className="text-sm font-semibold text-muted-foreground">{formatNumber(product.sessions)} sessions</span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-card rounded-xl border border-border/40 p-6 shadow-card hover:shadow-card-hover transition-all duration-300">
          <SectionHeader title="Top 5 Product Sold" icon={<Package className="w-4 h-4" />} />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60">
                  <th className="text-left py-3 text-label text-muted-foreground uppercase tracking-wider">#</th>
                  <th className="text-left py-3 text-label text-muted-foreground uppercase tracking-wider">Product</th>
                  <th className="text-right py-3 text-label text-muted-foreground uppercase tracking-wider">Units</th>
                  <th className="text-right py-3 text-label text-muted-foreground uppercase tracking-wider">Price</th>
                  <th className="text-right py-3 text-label text-muted-foreground uppercase tracking-wider">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.topProductsSold.map((p, i) => (
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
        </section>
      </div>

    </div>
  );
}
