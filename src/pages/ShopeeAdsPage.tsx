import { useMonth } from "@/contexts/MonthContext";
import { getShopeeAdsData, formatCurrency, formatNumber, growthPercent } from "@/data/mockData";
import { KPICard } from "@/components/dashboard/KPICard";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { NoData } from "@/components/dashboard/NoData";
import { ShoppingBag, TrendingUp, TrendingDown } from "lucide-react";

export default function ShopeeAdsPage() {
  const { selectedMonth } = useMonth();
  const data = getShopeeAdsData(selectedMonth);

  if (!data) return <NoData month={selectedMonth} />;

  const roasGrowth = growthPercent(data.roas, data.previousRoas);

  return (
    <div className="space-y-8 animate-fade-in">
      <section>
        <SectionHeader title="Shopee Ads KPIs" subtitle={selectedMonth} icon={<ShoppingBag className="w-4 h-4" />} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard title="Impressions" data={data.impressions} />
          <KPICard title="Clicks" data={data.clicks} />
          <KPICard title="CTR" data={data.ctr} format="percent" />
          <KPICard title="Orders" data={data.orders} />
          <KPICard title="Units Sold" data={data.unitsSold} />
          <KPICard title="Revenue from Ads" data={data.revenueFromAds} format="currency" />
          <KPICard title="Ad Spend" data={data.adSpend} format="currency" />
          <div className="bg-card rounded-lg p-5 shadow-card border border-primary/20 animate-fade-in">
            <span className="text-xs font-medium uppercase tracking-wider text-primary">ROAS</span>
            <div className="text-2xl font-bold text-card-foreground mt-3 mb-2">{data.roas.toFixed(2)}x</div>
            <div className="flex items-center gap-1.5">
              {roasGrowth >= 0 ? <TrendingUp className="w-3.5 h-3.5 text-success" /> : <TrendingDown className="w-3.5 h-3.5 text-destructive" />}
              <span className={`text-xs font-semibold ${roasGrowth >= 0 ? "text-success" : "text-destructive"}`}>
                {roasGrowth >= 0 ? "+" : ""}{roasGrowth.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">vs prev month</span>
            </div>
          </div>
        </div>
      </section>

      {/* Product Cards */}
      <section>
        <SectionHeader title="Product Performance" subtitle="Individual product ads metrics" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.products.map((p, i) => (
            <div key={i} className="bg-card rounded-lg border border-border/50 p-5 shadow-card hover:shadow-card-hover transition-shadow">
              <h3 className="font-semibold text-sm text-card-foreground mb-4">{p.name}</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                  <p className="font-semibold text-card-foreground">{formatCurrency(p.revenue)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Units Sold</p>
                  <p className="font-semibold text-card-foreground">{formatNumber(p.unitsSold)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Views</p>
                  <p className="font-semibold text-card-foreground">{formatNumber(p.views)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Clicks</p>
                  <p className="font-semibold text-card-foreground">{formatNumber(p.clicks)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Budget</p>
                  <p className="font-semibold text-card-foreground">{formatCurrency(p.budget)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
