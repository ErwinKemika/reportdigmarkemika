import { useMergedPageData } from "@/hooks/useMergedPageData";
import { getShopeeAdsData, formatCurrency, formatNumber, growthPercent } from "@/data/mockData";
import { transformShopeeAds, shopeeAdsPrevMapper } from "@/lib/dataTransformers";
import { KPICard } from "@/components/dashboard/KPICard";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { NoData } from "@/components/dashboard/NoData";
import { PageEditDialog } from "@/components/dashboard/PageEditDialog";
import { shopeeAdsSchema } from "@/components/dashboard/pageEditSchemas";
import { ShoppingBag, TrendingUp, TrendingDown } from "lucide-react";
import { useMonth } from "@/contexts/MonthContext";

export default function ShopeeAdsPage() {
  const { selectedMonth } = useMonth();
  const { data, isLoading } = useMergedPageData("shopee-ads", getShopeeAdsData, transformShopeeAds, shopeeAdsPrevMapper);

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading...</div>;
  if (!data) return <NoData month={selectedMonth} />;

  const roasGrowth = growthPercent(data.roas, data.previousRoas);

  return (
    <div className="space-y-10 animate-fade-in">
      <section className="bg-tint-orange/50 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-4">
          <SectionHeader title="Shopee Ads KPIs" subtitle={selectedMonth} icon={<ShoppingBag className="w-4 h-4 text-channel-shopee" />} />
          <PageEditDialog schema={shopeeAdsSchema} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard title="Iklan Dilihat" data={data.impressions} accentColor="orange" />
          <KPICard title="Jumlah Klik" data={data.clicks} accentColor="orange" />
          <KPICard title="Persentase Klik (%)" data={data.ctr} format="percent" accentColor="orange" />
          <KPICard title="Pesanan" data={data.orders} accentColor="orange" />
          <KPICard title="Produk Terjual" data={data.unitsSold} accentColor="orange" />
          <KPICard title="Penjualan dari Iklan (Rp)" data={data.revenueFromAds} format="currency" accentColor="green" hero />
          <KPICard title="Biaya Iklan (Rp)" data={data.adSpend} format="currency" accentColor="orange" />
          <div className="bg-card rounded-xl p-6 shadow-card border border-channel-shopee/20 border-l-[3px] border-l-channel-shopee animate-fade-in">
            <span className="text-label uppercase tracking-wider text-channel-shopee">ROAS</span>
            <div className="text-kpi font-extrabold text-card-foreground mt-3 mb-3 tracking-tight">{data.roas.toFixed(2)}x</div>
            <div className="flex items-center gap-1.5">
              {roasGrowth >= 0 ? <TrendingUp className="w-3.5 h-3.5 text-success" /> : <TrendingDown className="w-3.5 h-3.5 text-destructive" />}
              <span className={`text-xs font-semibold ${roasGrowth >= 0 ? "text-success" : "text-destructive"}`}>
                {roasGrowth >= 0 ? "+" : ""}{roasGrowth.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground/70">vs prev</span>
            </div>
          </div>
        </div>
      </section>

      <section>
        <SectionHeader title="Product Performance" subtitle="Individual product ads metrics" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
         {data.products.map((p, i) => (
            <div key={i} className="bg-card rounded-xl border border-border/40 p-6 shadow-card hover:shadow-card-hover transition-all duration-300 border-t-[3px] border-t-channel-shopee">
              <div className="flex items-center gap-3 mb-5">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-border/40" />
                ) : (
                  <span className="w-10 h-10 rounded-lg bg-channel-shopee text-primary-foreground flex items-center justify-center text-sm font-bold">{i + 1}</span>
                )}
                <h3 className="font-semibold text-sm text-card-foreground">{p.name}</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-label text-muted-foreground mb-1">Revenue</p>
                  <p className="font-semibold text-success">{formatCurrency(p.revenue)}</p>
                </div>
                <div>
                  <p className="text-label text-muted-foreground mb-1">Units Sold</p>
                  <p className="font-semibold text-card-foreground">{formatNumber(p.unitsSold)}</p>
                </div>
                <div>
                  <p className="text-label text-muted-foreground mb-1">Views</p>
                  <p className="font-semibold text-card-foreground">{formatNumber(p.views)}</p>
                </div>
                <div>
                  <p className="text-label text-muted-foreground mb-1">Clicks</p>
                  <p className="font-semibold text-card-foreground">{formatNumber(p.clicks)}</p>
                </div>
                <div className="col-span-2 pt-2 border-t border-border/30">
                  <p className="text-label text-muted-foreground mb-1">Budget</p>
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
