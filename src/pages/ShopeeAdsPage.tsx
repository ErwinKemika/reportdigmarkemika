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
      <section className="bg-tint-orange/40 rounded-xl p-6">
        <SectionHeader title="Shopee Ads KPIs" subtitle={selectedMonth} icon={<ShoppingBag className="w-4 h-4 text-channel-shopee" />} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard title="Impressions" data={data.impressions} accentColor="orange" />
          <KPICard title="Clicks" data={data.clicks} accentColor="orange" />
          <KPICard title="CTR" data={data.ctr} format="percent" accentColor="orange" />
          <KPICard title="Orders" data={data.orders} accentColor="orange" />
          <KPICard title="Units Sold" data={data.unitsSold} accentColor="orange" />
          <KPICard title="Revenue from Ads" data={data.revenueFromAds} format="currency" accentColor="green" />
          <KPICard title="Ad Spend" data={data.adSpend} format="currency" accentColor="orange" />
          <div className="bg-card rounded-lg p-5 shadow-card border border-channel-shopee/20 border-l-[3px] border-l-channel-shopee animate-fade-in">
            <span className="text-xs font-medium uppercase tracking-wider text-channel-shopee">ROAS</span>
            <div className="text-2xl font-extrabold text-card-foreground mt-3 mb-2">{data.roas.toFixed(2)}x</div>
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
            <div key={i} className="bg-card rounded-lg border border-border/50 p-5 shadow-card hover:shadow-card-hover transition-shadow border-t-[3px] border-t-channel-shopee">
              <h3 className="font-semibold text-sm text-card-foreground mb-4">{p.name}</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                  <p className="font-semibold text-success">{formatCurrency(p.revenue)}</p>
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
                  <p className="font-semibold text-channel-shopee">{formatCurrency(p.budget)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
