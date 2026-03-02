import { useMonth } from "@/contexts/MonthContext";
import { usePageData } from "@/hooks/usePageData";
import { getGoogleAdsData, getMetaAdsData, getShopeeAdsData, formatCurrency, formatNumber } from "@/data/mockData";
import { transformPlatformAdsDetail, transformShopeeAds } from "@/lib/dataTransformers";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { NoData } from "@/components/dashboard/NoData";
import { DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const CHANNEL_COLORS: Record<string, string> = {
  "Google Ads": "hsl(217,91%,60%)",
  "Meta Ads": "hsl(245,58%,51%)",
  "Shopee Ads": "hsl(25,95%,53%)",
};

const CHANNEL_BORDER: Record<string, string> = {
  "Google Ads": "border-l-[3px] border-l-channel-google",
  "Meta Ads": "border-l-[3px] border-l-channel-meta",
  "Shopee Ads": "border-l-[3px] border-l-channel-shopee",
};

export default function AdsBudgetPage() {
  const { selectedMonth, period } = useMonth();

  // Fetch from each child page's data
  const { data: googleDbData, isLoading: gLoading } = usePageData(period, "google-ads");
  const { data: metaDbData, isLoading: mLoading } = usePageData(period, "meta-ads");
  const { data: shopeeDbData, isLoading: sLoading } = usePageData(period, "shopee-ads");

  const isLoading = gLoading || mLoading || sLoading;

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading...</div>;

  // Transform DB data or fallback to mock
  const googleRaw = googleDbData
    ? transformPlatformAdsDetail(googleDbData as Record<string, any>)
    : getGoogleAdsData(selectedMonth);
  const metaRaw = metaDbData
    ? transformPlatformAdsDetail(metaDbData as Record<string, any>)
    : getMetaAdsData(selectedMonth);
  const shopeeRaw = shopeeDbData
    ? transformShopeeAds(shopeeDbData as Record<string, any>)
    : getShopeeAdsData(selectedMonth);

  // If all are empty, show no data
  if (!googleRaw && !metaRaw && !shopeeRaw) return <NoData month={selectedMonth} />;

  // Build aggregated channel data
  const channels = [
    {
      name: "Google Ads",
      budget: googleRaw?.cost ?? 0,
      clicks: googleRaw?.clicks ?? 0,
      conversions: googleRaw?.conversions ?? 0,
      revenue: googleRaw?.revenue ?? 0,
    },
    {
      name: "Meta Ads",
      budget: metaRaw?.cost ?? 0,
      clicks: metaRaw?.clicks ?? 0,
      conversions: metaRaw?.conversions ?? 0,
      revenue: metaRaw?.revenue ?? 0,
    },
    {
      name: "Shopee Ads",
      budget: shopeeRaw?.adSpend?.value ?? 0,
      clicks: shopeeRaw?.clicks?.value ?? 0,
      conversions: shopeeRaw?.orders?.value ?? 0,
      revenue: shopeeRaw?.revenueFromAds?.value ?? 0,
    },
  ];

  const channelsWithRoas = channels.map(c => ({
    ...c,
    roas: c.budget > 0 ? c.revenue / c.budget : 0,
  }));

  const totalBudget = channelsWithRoas.reduce((s, c) => s + c.budget, 0);
  const totalRevenue = channelsWithRoas.reduce((s, c) => s + c.revenue, 0);
  const totalClicks = channelsWithRoas.reduce((s, c) => s + c.clicks, 0);
  const totalConversions = channelsWithRoas.reduce((s, c) => s + c.conversions, 0);
  const totalROI = totalBudget > 0 ? ((totalRevenue - totalBudget) / totalBudget) * 100 : 0;
  const blendedRoas = totalBudget > 0 ? totalRevenue / totalBudget : 0;

  const roasChartData = channelsWithRoas.map((c) => ({ name: c.name, ROAS: parseFloat(c.roas.toFixed(2)) }));

  return (
    <div className="space-y-10 animate-fade-in">
      <SectionHeader title="Ads Budget Performance" subtitle={`${selectedMonth} — Auto-aggregated from platform pages`} icon={<DollarSign className="w-4 h-4" />} />

      {/* Summary KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-card rounded-xl border border-border/40 p-5 shadow-card">
          <p className="text-label text-muted-foreground uppercase tracking-wider">Total Spend</p>
          <p className="text-lg font-extrabold text-card-foreground mt-2">{formatCurrency(totalBudget)}</p>
        </div>
        <div className="bg-card rounded-xl border border-border/40 p-5 shadow-card">
          <p className="text-label text-muted-foreground uppercase tracking-wider">Total Clicks</p>
          <p className="text-lg font-extrabold text-card-foreground mt-2">{formatNumber(totalClicks)}</p>
        </div>
        <div className="bg-card rounded-xl border border-border/40 p-5 shadow-card">
          <p className="text-label text-muted-foreground uppercase tracking-wider">Total Conversions</p>
          <p className="text-lg font-extrabold text-card-foreground mt-2">{formatNumber(totalConversions)}</p>
        </div>
        <div className="bg-card rounded-xl border border-border/40 p-5 shadow-card">
          <p className="text-label text-muted-foreground uppercase tracking-wider">Blended ROAS</p>
          <p className="text-lg font-extrabold text-card-foreground mt-2">{blendedRoas.toFixed(2)}x</p>
        </div>
        <div className="bg-card rounded-xl border border-border/40 p-5 shadow-card">
          <p className="text-label text-muted-foreground uppercase tracking-wider">Total Ad Revenue</p>
          <p className="text-lg font-extrabold text-success mt-2">{formatCurrency(totalRevenue)}</p>
        </div>
      </div>

      {/* Per-channel cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {channelsWithRoas.map((c) => (
          <div key={c.name} className={`bg-card rounded-xl border border-border/40 p-6 shadow-card hover:shadow-card-hover transition-all duration-300 ${CHANNEL_BORDER[c.name] || ""}`}>
            <h3 className="font-semibold text-sm text-card-foreground mb-5">{c.name}</h3>
            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Budget</span><span className="font-semibold text-card-foreground">{formatCurrency(c.budget)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Clicks</span><span className="font-semibold text-card-foreground">{formatNumber(c.clicks)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Conversions</span><span className="font-semibold text-card-foreground">{formatNumber(c.conversions)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Revenue</span><span className="font-semibold text-success">{formatCurrency(c.revenue)}</span></div>
              <div className="flex justify-between pt-3 border-t border-border/30">
                <span className="font-semibold" style={{ color: CHANNEL_COLORS[c.name] }}>ROAS</span>
                <span className="text-lg font-extrabold tracking-tight" style={{ color: CHANNEL_COLORS[c.name] }}>{c.roas.toFixed(2)}x</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border/40 p-6 shadow-card">
          <h3 className="font-semibold text-sm text-card-foreground mb-6">Performance Summary</h3>
          <div className="space-y-5">
            <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Total Budget</span><span className="text-base font-bold text-card-foreground">{formatCurrency(totalBudget)}</span></div>
            <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Total Revenue</span><span className="text-base font-bold text-card-foreground">{formatCurrency(totalRevenue)}</span></div>
            <div className="flex justify-between items-center pt-4 border-t border-border/40">
              <span className="text-sm font-semibold text-foreground">Total ROI</span>
              <span className={`text-base font-bold ${totalROI >= 0 ? "text-card-foreground" : "text-destructive"}`}>{totalROI.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border/40 p-6 shadow-card">
          <h3 className="font-semibold text-sm text-card-foreground mb-6">ROAS Comparison</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={roasChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(220,9%,46%)" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(220,9%,46%)" }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(0,0%,100%)", border: "1px solid hsl(220,13%,91%)", borderRadius: 12, fontSize: 12, boxShadow: "0 4px 12px hsl(222,47%,11%,0.08)" }} />
              <Bar dataKey="ROAS" radius={[6, 6, 0, 0]}>
                {roasChartData.map((entry) => (
                  <Cell key={entry.name} fill={CHANNEL_COLORS[entry.name] || "hsl(222,47%,20%)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
