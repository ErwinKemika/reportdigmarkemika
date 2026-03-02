import { useMonth } from "@/contexts/MonthContext";
import { usePageData } from "@/hooks/usePageData";
import { getGoogleAdsData, getMetaAdsData, getShopeeAdsData, formatCurrencyFull, formatNumber } from "@/data/mockData";
import { transformPlatformAdsDetail, transformShopeeAds } from "@/lib/dataTransformers";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { NoData } from "@/components/dashboard/NoData";
import { DollarSign } from "lucide-react";
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  "Google Ads": (
    <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
        <path d="M20.17 10.24L12 18.41l-2.83-2.83 8.17-8.17a3 3 0 014.24 0 3 3 0 01-.41 4.83z" fill="#FBBC04" />
        <path d="M12 18.41l-8.17-8.17a3 3 0 010-4.24 3 3 0 014.24 0L12 10.07" fill="#4285F4" />
        <circle cx="6" cy="18" r="3" fill="#34A853" />
      </svg>
    </div>
  ),
  "Meta Ads": (
    <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 2.24 3 5s-1.34 5-3 5-3-2.24-3-5 1.34-5 3-5z" fill="#0081FB" />
      </svg>
    </div>
  ),
  "Shopee Ads": (
    <div className="w-9 h-9 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
      <span className="text-sm font-bold text-orange-500">S</span>
    </div>
  ),
};

const CHANNEL_COLORS: Record<string, string> = {
  "Google Ads": "#34A853",
  "Meta Ads": "#0081FB",
  "Shopee Ads": "#F97316",
};

// Mini sparkline data generators
function genBarData(value: number, count = 7) {
  return Array.from({ length: count }, (_, i) => ({
    v: Math.max(value * 0.3, value * (0.4 + Math.random() * 0.6) * ((i + 1) / count)),
  }));
}
function genLineData(value: number, count = 7) {
  return Array.from({ length: count }, (_, i) => ({
    v: value * (0.3 + (i / count) * 0.5 + Math.random() * 0.2),
  }));
}
function genAreaData(value: number, count = 7) {
  return Array.from({ length: count }, (_, i) => ({
    v: value * (0.4 + (i / count) * 0.4 + Math.random() * 0.2),
  }));
}

export default function AdsBudgetPage() {
  const { selectedMonth, period } = useMonth();

  const { data: googleDbData, isLoading: gLoading } = usePageData(period, "google-ads");
  const { data: metaDbData, isLoading: mLoading } = usePageData(period, "meta-ads");
  const { data: shopeeDbData, isLoading: sLoading } = usePageData(period, "shopee-ads");

  const isLoading = gLoading || mLoading || sLoading;

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading...</div>;

  const googleRaw = googleDbData
    ? transformPlatformAdsDetail(googleDbData as Record<string, any>)
    : getGoogleAdsData(selectedMonth);
  const metaRaw = metaDbData
    ? transformPlatformAdsDetail(metaDbData as Record<string, any>)
    : getMetaAdsData(selectedMonth);
  const shopeeRaw = shopeeDbData
    ? transformShopeeAds(shopeeDbData as Record<string, any>)
    : getShopeeAdsData(selectedMonth);

  if (!googleRaw && !metaRaw && !shopeeRaw) return <NoData month={selectedMonth} />;

  const channels = [
    { name: "Google Ads", budget: googleRaw?.cost ?? 0, clicks: googleRaw?.clicks ?? 0, conversions: googleRaw?.conversions ?? 0 },
    { name: "Meta Ads", budget: metaRaw?.cost ?? 0, clicks: metaRaw?.clicks ?? 0, conversions: metaRaw?.conversions ?? 0 },
    { name: "Shopee Ads", budget: shopeeRaw?.adSpend?.value ?? 0, clicks: shopeeRaw?.clicks?.value ?? 0, conversions: shopeeRaw?.orders?.value ?? 0 },
  ];

  const totalBudget = channels.reduce((s, c) => s + c.budget, 0);
  const totalClicks = channels.reduce((s, c) => s + c.clicks, 0);
  const totalConversions = channels.reduce((s, c) => s + c.conversions, 0);
  const convRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : "0";

  const pieData = channels.map((c) => ({ name: c.name, value: c.budget })).filter((d) => d.value > 0);
  const PIE_COLORS = ["#34A853", "#0081FB", "#F97316"];

  // Find top channel
  const topChannel = channels.reduce((max, c) => (c.budget > max.budget ? c : max), channels[0]);

  return (
    <div className="space-y-8 animate-fade-in">
      <SectionHeader title="Ads Budget Performance" subtitle={`${selectedMonth} — Auto-aggregated from platform pages`} icon={<DollarSign className="w-4 h-4" />} />

      {/* KPI Row with mini charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Spend */}
        <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-card relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 to-transparent dark:from-emerald-500/5 dark:to-transparent pointer-events-none" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Total Spend</p>
              <p className="text-2xl font-extrabold text-card-foreground mt-1.5">{formatCurrencyFull(totalBudget)}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{selectedMonth} — Auto-aggregated</p>
            </div>
            <div className="w-24 h-12">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={genBarData(totalBudget)} barCategoryGap={2}>
                  <Bar dataKey="v" fill="#34A853" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Total Clicks */}
        <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-card relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 to-transparent dark:from-blue-500/5 dark:to-transparent pointer-events-none" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Total Clicks</p>
              <p className="text-2xl font-extrabold text-card-foreground mt-1.5">{formatNumber(totalClicks)}</p>
            </div>
            <div className="w-24 h-12">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={genLineData(totalClicks)}>
                  <Line type="monotone" dataKey="v" stroke="#6B9BF7" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Total Conversions */}
        <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-card relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/40 to-transparent dark:from-emerald-500/5 dark:to-transparent pointer-events-none" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Total Conversions</p>
              <p className="text-2xl font-extrabold text-card-foreground mt-1.5">{formatNumber(totalConversions)}</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-24 h-12">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={genAreaData(totalConversions)}>
                    <defs>
                      <linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#34A853" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#34A853" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke="#34A853" strokeWidth={2} fill="url(#convGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold px-2 py-1 rounded-full whitespace-nowrap">
                Conv. Rate<br />→ {convRate}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Per-channel cards with icons and mini charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {channels.map((c) => (
          <div key={c.name} className="bg-card rounded-2xl border border-border/40 p-5 shadow-card hover:shadow-card-hover transition-all duration-300">
            <div className="flex items-center gap-3 mb-5">
              {CHANNEL_ICONS[c.name]}
              <h3 className="font-semibold text-sm text-card-foreground">{c.name}</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Budget</span>
                <span className="font-bold text-card-foreground">{formatCurrencyFull(c.budget)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Clicks</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={genBarData(c.clicks, 5)} barCategoryGap={1}>
                        <Bar dataKey="v" fill={CHANNEL_COLORS[c.name]} radius={[1, 1, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <span className="font-bold text-card-foreground">{formatNumber(c.clicks)}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Conversions</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={genBarData(c.conversions, 5)} barCategoryGap={1}>
                        <Bar dataKey="v" fill={CHANNEL_COLORS[c.name]} radius={[1, 1, 0, 0]} opacity={0.7} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <span className="font-bold text-card-foreground">{formatNumber(c.conversions)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Summary with Donut + Top Channel */}
      <div className="bg-card rounded-2xl border border-border/40 p-6 shadow-card">
        <h3 className="font-semibold text-base text-card-foreground mb-6">Performance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: labels + donut + values */}
          <div className="flex items-center gap-6">
            <div className="space-y-4 text-sm text-muted-foreground shrink-0">
              <p>Total Budget</p>
              <p>Total Clicks</p>
              <p>Total Conversions</p>
            </div>
            <div className="w-32 h-32 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData.length > 0 ? pieData : [{ name: "No Data", value: 1 }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={55}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {(pieData.length > 0 ? pieData : [{ name: "No Data", value: 1 }]).map((_, i) => (
                      <Cell key={i} fill={pieData.length > 0 ? PIE_COLORS[i % PIE_COLORS.length] : "#e5e7eb"} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#34A853]" />
                <span className="text-xs text-muted-foreground">Total Budget</span>
                <span className="text-sm font-bold text-card-foreground ml-auto">{formatCurrencyFull(totalBudget)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6B9BF7]" />
                <span className="text-xs text-muted-foreground">Total Clicks</span>
                <span className="text-sm font-bold text-card-foreground ml-auto">{formatNumber(totalClicks)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" />
                <span className="text-xs text-muted-foreground">Total Conversions</span>
                <span className="text-sm font-bold text-card-foreground ml-auto">{formatNumber(totalConversions)}</span>
              </div>
            </div>
          </div>

          {/* Right: Top Channel breakdown */}
          <div className="bg-muted/30 dark:bg-white/[0.03] rounded-xl border border-border/30 p-5">
            <div className="flex items-center gap-3 mb-4">
              {CHANNEL_ICONS[topChannel.name]}
              <h4 className="font-semibold text-sm text-card-foreground">{topChannel.name}</h4>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Budget</span>
                <span className="font-bold text-card-foreground">{formatCurrencyFull(topChannel.budget)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Clicks</span>
                <span className="font-bold text-card-foreground">{formatNumber(topChannel.clicks)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Conversions</span>
                <span className="font-bold text-card-foreground">{formatNumber(topChannel.conversions)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
