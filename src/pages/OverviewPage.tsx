import { useMonth } from "@/contexts/MonthContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePageData } from "@/hooks/usePageData";
import {
  getWebstoreSalesData, getMarketplaceData, getROIRevenueData,
  getWebsitePerformanceData, getShopeeAdsData, getAdsBudgetData,
  formatCurrency, formatCurrencyFull, formatNumber, growthPercent,
} from "@/data/mockData";
import {
  transformWebstoreSales, transformMarketplace,
  transformROIRevenue, transformWebsitePerformance,
  transformShopeeAds, transformAdsBudget,
} from "@/lib/dataTransformers";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { NoData } from "@/components/dashboard/NoData";
import { PageEditDialog } from "@/components/dashboard/PageEditDialog";
import { overviewManualSchema } from "@/components/dashboard/pageEditSchemas";
import {
  Globe, Users, DollarSign, Percent, Wallet, TrendingUp, TrendingDown,
  Minus, Trophy, Package, Star, Info, Clock, ShoppingBag, Store, ShoppingCart,
  ArrowRight, ChevronRight,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { MonthName } from "@/contexts/MonthContext";
import { MONTHS } from "@/contexts/MonthContext";
import { Progress } from "@/components/ui/progress";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  Tooltip as RechartsTooltip, Legend,
} from "recharts";

function getPreviousMonthYear(month: MonthName, year: number) {
  const idx = MONTHS.indexOf(month);
  if (idx === 0) return { month: MONTHS[11], year: year - 1, period: `${MONTHS[11]} ${year - 1}` };
  return { month: MONTHS[idx - 1], year, period: `${MONTHS[idx - 1]} ${year}` };
}

function useSourceData(period: string, pageKey: string, mockMonth: MonthName, mockGetter: (m: MonthName) => any, transformer: (d: Record<string, any>) => any) {
  const { data: dbData, isLoading } = usePageData(period, pageKey);
  const mock = mockGetter(mockMonth);
  if (isLoading) return { data: undefined, isLoading: true };
  if (dbData && transformer) return { data: transformer(dbData as Record<string, any>), isLoading: false };
  return { data: mock, isLoading: false };
}

// ============ GRADIENT KPI CARD ============
const GRADIENT_MAP: Record<string, string> = {
  traffic: "from-[hsl(217,91%,60%)] to-[hsl(210,100%,72%)]",
  leads: "from-[hsl(45,100%,51%)] to-[hsl(55,95%,60%)]",
  revenue: "from-[hsl(160,84%,39%)] to-[hsl(142,60%,50%)]",
  conversion: "from-[hsl(245,58%,51%)] to-[hsl(262,52%,62%)]",
  budget: "from-[hsl(280,60%,55%)] to-[hsl(262,80%,70%)]",
  roi: "from-[hsl(25,95%,53%)] to-[hsl(38,92%,60%)]",
};

function GradientKPICard({ title, value, previousValue, formatter, icon, tooltip, gradientKey }: {
  title: string;
  value: number;
  previousValue: number;
  formatter: (n: number) => string;
  icon: React.ReactNode;
  tooltip?: string;
  gradientKey: string;
}) {
  const growth = growthPercent(value, previousValue);
  const isPositive = growth > 0;
  const isNeutral = growth === 0;
  const gradient = GRADIENT_MAP[gradientKey] || GRADIENT_MAP.traffic;

  return (
    <div className={`relative overflow-hidden rounded-[20px] bg-gradient-to-br ${gradient} p-5 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-0.5 group`}>
      {/* Animated background shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-white/20 text-white/90">
              {icon}
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/80">{title}</span>
          </div>
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-3.5 h-3.5 text-white/40 cursor-help hover:text-white/70 transition-colors" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs text-xs">{tooltip}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <p className="text-2xl font-extrabold text-white tracking-tight leading-tight mb-1">
          {formatter(value)}
        </p>
        <p className="text-[10px] text-white/50 mb-2">
          Prev: {formatter(previousValue)}
        </p>
        <div className="flex items-center gap-1.5">
          {isNeutral ? (
            <Minus className="w-3.5 h-3.5 text-white/60" />
          ) : isPositive ? (
            <TrendingUp className="w-3.5 h-3.5 text-white" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-white" />
          )}
          <span className="text-xs font-bold text-white/90">
            {isPositive ? "+" : ""}{growth.toFixed(1)}%
          </span>
          <span className="text-[10px] text-white/50">vs prev</span>
        </div>
      </div>
    </div>
  );
}

// ============ CHANNEL PERFORMANCE CARD ============
function ChannelCard({ name, icon, traffic, prevTraffic, revenue, prevRevenue, conversionRate, prevCR, color }: {
  name: string;
  icon: React.ReactNode;
  traffic: number;
  prevTraffic: number;
  revenue: number;
  prevRevenue: number;
  conversionRate: number;
  prevCR: number;
  color: string;
}) {
  const trafficGrowth = growthPercent(traffic, prevTraffic);
  const revenueGrowth = growthPercent(revenue, prevRevenue);

  return (
    <div className={`bg-card rounded-2xl border border-border/30 shadow-card hover:shadow-card-hover transition-all duration-300 p-5 relative overflow-hidden`}>
      <div className={`absolute top-0 left-0 right-0 h-1 ${color}`} />
      <div className="flex items-center gap-2 mb-4">
        <div className={`p-1.5 rounded-lg ${color} bg-opacity-10`}>
          {icon}
        </div>
        <span className="text-sm font-bold text-card-foreground">{name}</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xl font-extrabold text-card-foreground tracking-tight">{formatNumber(traffic)}</p>
          <div className="flex items-center gap-1 mt-0.5">
            {trafficGrowth >= 0 ? (
              <TrendingUp className="w-3 h-3 text-success" />
            ) : (
              <TrendingDown className="w-3 h-3 text-destructive" />
            )}
            <span className={`text-[10px] font-bold ${trafficGrowth >= 0 ? "text-success" : "text-destructive"}`}>
              {trafficGrowth >= 0 ? "+" : ""}{trafficGrowth.toFixed(0)}%
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">Traffic</p>
        </div>
        <div>
          <p className="text-sm font-bold text-card-foreground">{formatCurrencyFull(revenue)}</p>
          <div className="flex items-center gap-1 mt-0.5">
            {revenueGrowth >= 0 ? (
              <TrendingUp className="w-3 h-3 text-success" />
            ) : (
              <TrendingDown className="w-3 h-3 text-destructive" />
            )}
            <span className={`text-[10px] font-bold ${revenueGrowth >= 0 ? "text-success" : "text-destructive"}`}>
              {revenueGrowth >= 0 ? "+" : ""}{revenueGrowth.toFixed(1)}%
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">Revenue</p>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">Conversion</span>
        <span className="text-xs font-bold text-card-foreground">{conversionRate.toFixed(1)}%</span>
      </div>
    </div>
  );
}

// ============ CONVERSION FUNNEL ============
function ConversionFunnel({ impressions, clicks, leads, orders }: {
  impressions: number;
  clicks: number;
  leads: number;
  orders: number;
}) {
  const steps = [
    { label: "Impressions ADS", value: impressions, color: "from-[hsl(217,91%,55%)] to-[hsl(217,91%,65%)]", width: "100%" },
    { label: "Clicks", value: clicks, color: "from-[hsl(210,100%,55%)] to-[hsl(210,100%,65%)]", width: "78%" },
    { label: "Leads", value: leads, color: "from-[hsl(245,58%,51%)] to-[hsl(262,52%,60%)]", width: "55%" },
    { label: "Orders", value: orders, color: "from-[hsl(50,80%,50%)] to-[hsl(60,70%,55%)]", width: "35%" },
  ];

  return (
    <div className="bg-card rounded-2xl border border-border/30 shadow-card p-6">
      <h3 className="text-sm font-bold text-card-foreground mb-5">Conversion Funnel</h3>
      <div className="space-y-3">
        {steps.map((step, i) => {
          const dropOff = i > 0 ? ((1 - step.value / steps[i - 1].value) * 100).toFixed(1) : null;
          return (
            <div key={step.label} className="flex items-center gap-3">
              <div className="flex-1">
                <div
                  className={`bg-gradient-to-r ${step.color} rounded-lg py-2 px-3 flex items-center justify-center transition-all duration-500`}
                  style={{ width: step.width }}
                >
                  <span className="text-[11px] font-bold text-white truncate">{step.label}</span>
                </div>
              </div>
              <div className="w-16 text-right">
                <p className="text-sm font-extrabold text-card-foreground">{formatNumber(step.value)}</p>
                {dropOff && (
                  <p className="text-[9px] text-destructive font-medium">↓ {dropOff}%</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============ TOP PERFORMER CARD ============
function TopPerformerCard({ title, icon, productName, channel, metric, metricValue, gradient, prevWinner }: {
  title: string;
  icon: React.ReactNode;
  productName: string;
  channel: string;
  metric: string;
  metricValue: string;
  gradient: string;
  prevWinner?: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border/20 p-5 ${gradient}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-lg bg-white/60 text-foreground">
          {icon}
        </div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-foreground/70">{title}</span>
      </div>
      <p className="text-sm font-extrabold text-foreground truncate mb-1.5" title={productName}>{productName}</p>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/60 text-foreground font-semibold">{channel}</span>
        <span className="text-xs text-foreground/70 font-medium">{metricValue}</span>
      </div>
      {prevWinner && (
        <p className="text-[9px] text-foreground/40 truncate mt-2">Prev: {prevWinner}</p>
      )}
    </div>
  );
}

// ============ CUSTOM CHART TOOLTIP ============
function ChartTooltipContent({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border/40 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-bold text-card-foreground mb-1.5">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-bold text-card-foreground">
            {entry.name === "Revenue" ? formatCurrencyFull(entry.value) : formatNumber(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ============ YEARLY TARGETS ============
const YEARLY_TARGETS = {
  ecommerceRevenue: 1_500_000_000, // Rp 1,5 Miliar
  traffic: 15_000,
  conversionRate: 2.0, // 2.00%
};

function YTDTargetCard({ title, ytdValue, target, formatter, icon, gradient, unit }: {
  title: string;
  ytdValue: number;
  target: number;
  formatter: (n: number) => string;
  icon: React.ReactNode;
  gradient: string;
  unit?: string;
}) {
  const achievementPct = target > 0 ? (ytdValue / target) * 100 : 0;
  const clampedPct = Math.min(achievementPct, 100);
  const isOnTrack = achievementPct >= 50; // rough midpoint check

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-5 shadow-lg border border-white/10`}>
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/5 -translate-y-8 translate-x-8" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-white/20 text-white/90">{icon}</div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-white/80">{title}</span>
        </div>
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-2xl font-extrabold text-white tracking-tight">{formatter(ytdValue)}</p>
            <p className="text-[10px] text-white/50 mt-0.5">Target: {formatter(target)}{unit || ""}</p>
          </div>
          <div className="text-right">
            <p className={`text-3xl font-black ${achievementPct >= 100 ? "text-green-200" : "text-white"}`}>
              {achievementPct.toFixed(1)}%
            </p>
            <p className="text-[10px] text-white/50">achieved</p>
          </div>
        </div>
        <div className="relative">
          <div className="w-full h-2.5 rounded-full bg-white/15 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${achievementPct >= 100 ? "bg-green-300" : "bg-white/70"}`}
              style={{ width: `${clampedPct}%` }}
            />
          </div>
          {/* Quarter markers */}
          <div className="flex justify-between mt-1">
            <span className="text-[8px] text-white/30">0%</span>
            <span className="text-[8px] text-white/30">25%</span>
            <span className="text-[8px] text-white/30">50%</span>
            <span className="text-[8px] text-white/30">75%</span>
            <span className="text-[8px] text-white/30">100%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ MAIN PAGE ============
export default function OverviewPage() {
  const { selectedMonth, selectedYear, period } = useMonth();
  const { isAdmin } = useAuth();
  const prev = getPreviousMonthYear(selectedMonth, selectedYear);

  const webstore = useSourceData(period, "webstore-sales", selectedMonth, getWebstoreSalesData, transformWebstoreSales);
  const prevWebstore = useSourceData(prev.period, "webstore-sales", prev.month, getWebstoreSalesData, transformWebstoreSales);
  const marketplace = useSourceData(period, "marketplace", selectedMonth, getMarketplaceData, transformMarketplace);
  const prevMarketplace = useSourceData(prev.period, "marketplace", prev.month, getMarketplaceData, transformMarketplace);
  const roi = useSourceData(period, "roi-revenue", selectedMonth, getROIRevenueData, transformROIRevenue);
  const prevRoi = useSourceData(prev.period, "roi-revenue", prev.month, getROIRevenueData, transformROIRevenue);
  const website = useSourceData(period, "website-performance", selectedMonth, getWebsitePerformanceData, transformWebsitePerformance);
  const prevWebsite = useSourceData(prev.period, "website-performance", prev.month, getWebsitePerformanceData, transformWebsitePerformance);
  const shopeeAds = useSourceData(period, "shopee-ads", selectedMonth, getShopeeAdsData, transformShopeeAds);
  const adsBudget = useSourceData(period, "ads-budget", selectedMonth, getAdsBudgetData, transformAdsBudget);

  const { data: manualData, isLoading: manualLoading } = usePageData(period, "overview-manual");
  const { data: salesRecapData, isLoading: salesRecapLoading } = usePageData(period, "sales_recap_classified_by_channel");
  const { data: prevSalesRecapData } = usePageData(prev.period, "sales_recap_classified_by_channel");

  // ── YTD data: fetch all months up to selected month for the year ──
  const ytdMonths = useMemo(() => {
    const idx = MONTHS.indexOf(selectedMonth);
    return MONTHS.slice(0, idx + 1).map(m => `${m} ${selectedYear}`);
  }, [selectedMonth, selectedYear]);

  const { data: ytdWebstoreRows } = useQuery({
    queryKey: ["ytd-webstore", selectedYear, selectedMonth],
    queryFn: async () => {
      const { data } = await supabase.from("page_data").select("data, period")
        .eq("page_key", "webstore-sales").in("period", ytdMonths);
      return data || [];
    },
  });

  const { data: ytdMarketplaceRows } = useQuery({
    queryKey: ["ytd-marketplace", selectedYear, selectedMonth],
    queryFn: async () => {
      const { data } = await supabase.from("page_data").select("data, period")
        .eq("page_key", "marketplace").in("period", ytdMonths);
      return data || [];
    },
  });

  const { data: ytdWebsiteRows } = useQuery({
    queryKey: ["ytd-website", selectedYear, selectedMonth],
    queryFn: async () => {
      const { data } = await supabase.from("page_data").select("data, period")
        .eq("page_key", "website-performance").in("period", ytdMonths);
      return data || [];
    },
  });

  const ytd = useMemo(() => {
    let totalRevenue = 0;
    let totalTraffic = 0;
    let totalOrders = 0;

    // Webstore revenue
    (ytdWebstoreRows || []).forEach((row: any) => {
      const d = typeof row.data === "string" ? JSON.parse(row.data) : row.data;
      const transformed = transformWebstoreSales(d);
      totalRevenue += transformed?.totalRevenue || 0;
    });

    // Marketplace revenue + traffic + orders
    (ytdMarketplaceRows || []).forEach((row: any) => {
      const d = typeof row.data === "string" ? JSON.parse(row.data) : row.data;
      const transformed = transformMarketplace(d);
      totalRevenue += transformed?.totalCombinedRevenue || 0;
      totalTraffic += (transformed?.tokopedia?.visitors || 0) + (transformed?.shopee?.visitors || 0);
      totalOrders += (transformed?.tokopedia?.unitsSold || 0) + (transformed?.shopee?.orders || 0);
    });

    // Website traffic
    (ytdWebsiteRows || []).forEach((row: any) => {
      const d = typeof row.data === "string" ? JSON.parse(row.data) : row.data;
      const transformed = transformWebsitePerformance(d);
      totalTraffic += transformed?.totalSessions?.value || 0;
    });

    // Also include current month mock data if no DB data for it
    const hasWsDb = (ytdWebstoreRows || []).some((r: any) => r.period === period);
    const hasMpDb = (ytdMarketplaceRows || []).some((r: any) => r.period === period);
    const hasWebDb = (ytdWebsiteRows || []).some((r: any) => r.period === period);

    if (!hasWsDb && webstore.data) {
      totalRevenue += webstore.data.totalRevenue || 0;
    }
    if (!hasMpDb && marketplace.data) {
      totalRevenue += marketplace.data.totalCombinedRevenue || 0;
      totalTraffic += (marketplace.data.tokopedia?.visitors || 0) + (marketplace.data.shopee?.visitors || 0);
      totalOrders += (marketplace.data.tokopedia?.unitsSold || 0) + (marketplace.data.shopee?.orders || 0);
    }
    if (!hasWebDb && website.data) {
      totalTraffic += website.data.totalSessions?.value || 0;
    }

    const weightedCR = totalTraffic > 0 ? (totalOrders / totalTraffic) * 100 : 0;

    return { totalRevenue, totalTraffic, weightedCR };
  }, [ytdWebstoreRows, ytdMarketplaceRows, ytdWebsiteRows, webstore.data, marketplace.data, website.data, period]);

  const isLoading = webstore.isLoading || marketplace.isLoading || roi.isLoading || website.isLoading || manualLoading || salesRecapLoading;

  const agg = useMemo(() => {
    const ws = webstore.data;
    const mp = marketplace.data;
    const roiD = roi.data;
    const web = website.data;
    const pws = prevWebstore.data;
    const pmp = prevMarketplace.data;
    const proi = prevRoi.data;
    const pweb = prevWebsite.data;
    const ads = shopeeAds.data;
    const budget = adsBudget.data;

    // 1) Total Traffic — use embedded previous values from current period's data
    const webTraffic = web?.totalSessions?.value || 0;
    const tokVisitors = mp?.tokopedia?.visitors || 0;
    const shopVisitors = mp?.shopee?.visitors || 0;
    const totalTraffic = webTraffic + tokVisitors + shopVisitors;
    const prevTotalTraffic = (web?.totalSessions?.previousValue || 0) + (mp?.tokopedia?.previousVisitors || 0) + (mp?.shopee?.previousVisitors || 0);

    // 2) Est. Revenue (from ROI lead pipeline)
    const estRevenue = roiD?.estimatedRevenue?.value || 0;
    const prevEstRevenue = roiD?.estimatedRevenue?.previousValue || proi?.estimatedRevenue?.value || 0;

    // 3) Total Revenue — use embedded previous values from current period's data
    const webstoreRev = ws?.totalRevenue || 0;
    const mpRev = mp?.totalCombinedRevenue || 0;
    const totalRevenue = webstoreRev + mpRev;
    const prevTotalRevenue = (ws?.previousRevenue || 0) + (mp?.previousCombinedRevenue || 0);

    // 4) Weighted CR
    const tokOrders = mp?.tokopedia?.unitsSold || 0;
    const shopOrders = mp?.shopee?.orders || 0;
    const totalOrders = tokOrders + shopOrders;
    const weightedCR = totalTraffic > 0 ? (totalOrders / totalTraffic) * 100 : 0;
    const prevTokOrders = pmp?.tokopedia?.unitsSold || 0;
    const prevShopOrders = pmp?.shopee?.orders || 0;
    const prevTotalOrders = prevTokOrders + prevShopOrders;
    const prevWeightedCR = prevTotalTraffic > 0 ? (prevTotalOrders / prevTotalTraffic) * 100 : 0;

    // 5) Budget (manual)
    const manual = manualData as Record<string, any> | null;
    const totalBudget = manual?.totalBudgetAds || 0;
    const prevBudget = manual?.previousBudgetAds || 0;

    // 6) ROMI from Sales Recap
    const sr = salesRecapData as Record<string, any> | null;
    const srGrandTotal = (sr?.tokopedia || 0) + (sr?.webstore || 0) + (sr?.shopee || 0) + (sr?.kommo || 0) + (sr?.direct_selling_nongov || 0) + (sr?.inaproc || 0) + (sr?.e_catalogue || 0) + (sr?.direct_selling_gov || 0);
    const srMarketingExpense = sr?.marketing_expense || 0;
    const romi = srMarketingExpense > 0 ? ((srGrandTotal - srMarketingExpense) / srMarketingExpense) * 100 : 0;

    const psr = prevSalesRecapData as Record<string, any> | null;
    const psrGrandTotal = (psr?.tokopedia || 0) + (psr?.webstore || 0) + (psr?.shopee || 0) + (psr?.kommo || 0) + (psr?.direct_selling_nongov || 0) + (psr?.inaproc || 0) + (psr?.e_catalogue || 0) + (psr?.direct_selling_gov || 0);
    const psrMarketingExpense = psr?.marketing_expense || 0;
    const prevRomi = psrMarketingExpense > 0 ? ((psrGrandTotal - psrMarketingExpense) / psrMarketingExpense) * 100 : 0;

    // Top products
    const allProducts: { name: string; channel: string; revenue: number; units: number }[] = [];
    (ws?.topProductsSold || []).forEach((p: any) => allProducts.push({ name: p.name, channel: "Webstore", revenue: p.revenue || 0, units: p.units || 0 }));
    (mp?.tokopedia?.topProducts || []).forEach((p: any) => allProducts.push({ name: p.name, channel: "Tokopedia", revenue: p.revenue || 0, units: p.units || 0 }));
    (mp?.shopee?.topProducts || []).forEach((p: any) => allProducts.push({ name: p.name, channel: "Shopee", revenue: p.revenue || 0, units: p.units || 0 }));
    const topByRevenue = [...allProducts].sort((a, b) => b.revenue - a.revenue)[0] || null;
    const topByUnits = [...allProducts].sort((a, b) => b.units - a.units)[0] || null;

    const prevProducts: { name: string; channel: string; revenue: number; units: number }[] = [];
    (pws?.topProductsSold || []).forEach((p: any) => prevProducts.push({ name: p.name, channel: "Webstore", revenue: p.revenue || 0, units: p.units || 0 }));
    (pmp?.tokopedia?.topProducts || []).forEach((p: any) => prevProducts.push({ name: p.name, channel: "Tokopedia", revenue: p.revenue || 0, units: p.units || 0 }));
    (pmp?.shopee?.topProducts || []).forEach((p: any) => prevProducts.push({ name: p.name, channel: "Shopee", revenue: p.revenue || 0, units: p.units || 0 }));
    const prevTopByRevenue = [...prevProducts].sort((a, b) => b.revenue - a.revenue)[0] || null;
    const prevTopByUnits = [...prevProducts].sort((a, b) => b.units - a.units)[0] || null;

    // Funnel
    const impressions = ads?.impressions?.value || 0;
    const clicks = ads?.clicks?.value || 0;
    const leads = (roiD?.b2bLeads?.value || 0) + (roiD?.b2gLeads?.value || 0);
    const orders = totalOrders;

    // Channel details
    const webstoreCR = 0;
    const tokCR = tokVisitors > 0 ? (tokOrders / tokVisitors) * 100 : 0;
    const shopCR = shopVisitors > 0 ? (shopOrders / shopVisitors) * 100 : 0;
    const prevWebstoreCR = 0;
    const prevTokCR = (pmp?.tokopedia?.visitors || 0) > 0 ? (prevTokOrders / (pmp?.tokopedia?.visitors || 1)) * 100 : 0;
    const prevShopCR = (pmp?.shopee?.visitors || 0) > 0 ? (prevShopOrders / (pmp?.shopee?.visitors || 1)) * 100 : 0;

    const topChannel = manual?.topRevenueChannel || "";
    const topChannelNotes = manual?.topChannelNotes || "";

    // Chart data (simulate daily spread across month)
    const daysInMonth = new Date(selectedYear, MONTHS.indexOf(selectedMonth) + 1, 0).getDate();
    const chartData = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const progress = day / daysInMonth;
      const revBase = totalRevenue / daysInMonth;
      const trafficBase = totalTraffic / daysInMonth;
      const leadsBase = leads / daysInMonth;
      const jitter = 0.7 + Math.sin(day * 0.8) * 0.3 + Math.cos(day * 1.2) * 0.15;
      return {
        name: `${selectedMonth.slice(0, 3)} ${day}`,
        Revenue: Math.round(revBase * jitter * (0.8 + progress * 0.4)),
        Traffic: Math.round(trafficBase * jitter * (0.85 + progress * 0.3)),
        Leads: Math.max(0, Math.round(leadsBase * jitter * (0.7 + progress * 0.6))),
      };
    });

    return {
      totalTraffic, prevTotalTraffic,
      estRevenue, prevEstRevenue,
      totalRevenue, prevTotalRevenue,
      weightedCR, prevWeightedCR,
      totalBudget, prevBudget,
      romi, prevRomi,
      topByRevenue, topByUnits,
      prevTopByRevenue, prevTopByUnits,
      impressions, clicks, leads, orders,
      // Channel
      webTraffic, prevWebTraffic: pweb?.totalSessions?.value || 0,
      webstoreRev, prevWebstoreRev: pws?.totalRevenue || 0,
      webstoreCR, prevWebstoreCR,
      tokVisitors, prevTokVisitors: pmp?.tokopedia?.visitors || 0,
      tokRevenue: mp?.tokopedia?.revenue || 0, prevTokRevenue: pmp?.tokopedia?.revenue || 0,
      tokCR, prevTokCR,
      shopVisitors, prevShopVisitors: pmp?.shopee?.visitors || 0,
      shopRevenue: mp?.shopee?.revenue || 0, prevShopRevenue: pmp?.shopee?.revenue || 0,
      shopCR, prevShopCR,
      topChannel, topChannelNotes,
      chartData,
    };
  }, [webstore.data, marketplace.data, roi.data, website.data, prevWebstore.data, prevMarketplace.data, prevRoi.data, prevWebsite.data, manualData, shopeeAds.data, adsBudget.data, salesRecapData, prevSalesRecapData, selectedMonth, selectedYear]);

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading...</div>;
  const hasAnyData = webstore.data || marketplace.data || roi.data || website.data;
  if (!hasAnyData) return <NoData month={selectedMonth} />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <SectionHeader
          title={`Overview — ${selectedMonth} ${selectedYear}`}
          subtitle="Auto-aggregated from all channels"
          icon={<Globe className="w-4 h-4" />}
        />
        {isAdmin && <PageEditDialog schema={overviewManualSchema} />}
      </div>

      {/* Period + Sources */}
      <div className="flex items-center gap-4 text-[10px] text-muted-foreground/60">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>Period: {period}</span>
        </div>
        <span>·</span>
        <span>Sources: Webstore, Tokopedia, Shopee, Leads (ROI)</span>
      </div>

      {/* ─── SECTION 1: GRADIENT KPI ROW ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <GradientKPICard
          title="Total Traffic"
          value={agg.totalTraffic}
          previousValue={agg.prevTotalTraffic}
          formatter={formatNumber}
          icon={<Globe className="w-4 h-4" />}
          tooltip="Webstore + Tokopedia + Shopee visitors"
          gradientKey="traffic"
        />
        <GradientKPICard
          title="Est. Revenue"
          value={agg.estRevenue}
          previousValue={agg.prevEstRevenue}
          formatter={formatCurrencyFull}
          icon={<DollarSign className="w-4 h-4" />}
          tooltip="Estimated revenue from lead pipeline (ROI & Revenue)"
          gradientKey="leads"
        />
        <GradientKPICard
          title="Total Revenue"
          value={agg.totalRevenue}
          previousValue={agg.prevTotalRevenue}
          formatter={formatCurrencyFull}
          icon={<DollarSign className="w-4 h-4" />}
          tooltip="Webstore + Marketplace combined revenue"
          gradientKey="revenue"
        />
        <GradientKPICard
          title="Conversion Rate"
          value={agg.weightedCR}
          previousValue={agg.prevWeightedCR}
          formatter={(n) => n.toFixed(2) + "%"}
          icon={<Percent className="w-4 h-4" />}
          tooltip="Weighted: Total Orders / Total Visitors × 100"
          gradientKey="conversion"
        />
        <GradientKPICard
          title="Total Budget Ads"
          value={agg.totalBudget}
          previousValue={agg.prevBudget}
          formatter={formatCurrencyFull}
          icon={<Wallet className="w-4 h-4" />}
          tooltip="Manually entered overview budget"
          gradientKey="budget"
        />
        <div className="flex flex-col">
          <GradientKPICard
            title="ROMI"
            value={agg.romi}
            previousValue={agg.prevRomi}
            formatter={(n) => n.toFixed(1) + "%"}
            icon={<TrendingUp className="w-4 h-4" />}
            tooltip="ROMI = (Grand Total Revenue - Marketing Expense) / Marketing Expense × 100 — dari Sales Recap"
            gradientKey="roi"
          />
        </div>
      </div>

      {/* ─── SECTION 2 + FUNNEL (side by side) ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        {/* Performance Trend Chart */}
        <div className="bg-card rounded-2xl border border-border/30 shadow-card p-6">
          <h3 className="text-sm font-bold text-card-foreground mb-4">Revenue & Traffic Trends</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={agg.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradTraffic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(262, 52%, 56%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(262, 52%, 56%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(220, 9%, 46%)" }} interval="preserveStartEnd" />
                <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "hsl(160, 84%, 39%)" }} tickFormatter={(v) => formatNumber(v)} width={55} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "hsl(217, 91%, 60%)" }} tickFormatter={(v) => formatNumber(v)} width={55} />
                <RechartsTooltip content={<ChartTooltipContent />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Area yAxisId="left" type="monotone" dataKey="Revenue" stroke="hsl(160, 84%, 39%)" fill="url(#gradRevenue)" strokeWidth={2} dot={false} animationDuration={1200} />
                <Area yAxisId="right" type="monotone" dataKey="Traffic" stroke="hsl(217, 91%, 60%)" fill="url(#gradTraffic)" strokeWidth={2} dot={false} animationDuration={1400} />
                <Area yAxisId="right" type="monotone" dataKey="Leads" stroke="hsl(262, 52%, 56%)" fill="url(#gradLeads)" strokeWidth={2} dot={false} animationDuration={1600} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversion Funnel */}
        <ConversionFunnel
          impressions={agg.impressions}
          clicks={agg.clicks}
          leads={agg.leads}
          orders={agg.orders}
        />
      </div>

      {/* ─── SECTION 3: CHANNEL PERFORMANCE ─── */}
      <div>
        <h3 className="text-sm font-bold text-card-foreground mb-4">Channel Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ChannelCard
            name="Webstore"
            icon={<Store className="w-4 h-4 text-channel-website" />}
            traffic={agg.webTraffic}
            prevTraffic={agg.prevWebTraffic}
            revenue={agg.webstoreRev}
            prevRevenue={agg.prevWebstoreRev}
            conversionRate={agg.webstoreCR}
            prevCR={agg.prevWebstoreCR}
            color="bg-channel-website"
          />
          <ChannelCard
            name="Tokopedia"
            icon={<ShoppingBag className="w-4 h-4 text-channel-tokopedia" />}
            traffic={agg.tokVisitors}
            prevTraffic={agg.prevTokVisitors}
            revenue={agg.tokRevenue}
            prevRevenue={agg.prevTokRevenue}
            conversionRate={agg.tokCR}
            prevCR={agg.prevTokCR}
            color="bg-channel-tokopedia"
          />
          <ChannelCard
            name="Shopee"
            icon={<ShoppingCart className="w-4 h-4 text-channel-shopee" />}
            traffic={agg.shopVisitors}
            prevTraffic={agg.prevShopVisitors}
            revenue={agg.shopRevenue}
            prevRevenue={agg.prevShopRevenue}
            conversionRate={agg.shopCR}
            prevCR={agg.prevShopCR}
            color="bg-channel-shopee"
          />
        </div>
      </div>

      {/* ─── SECTION 5: TOP PERFORMERS ─── */}
      <div>
        <h3 className="text-sm font-bold text-card-foreground mb-4">Top Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {agg.topByRevenue ? (
            <TopPerformerCard
              title="#1 Product by Revenue"
              icon={<Trophy className="w-4 h-4" />}
              productName={agg.topByRevenue.name}
              channel={agg.topByRevenue.channel}
              metric="Revenue"
              metricValue={formatCurrencyFull(agg.topByRevenue.revenue)}
              gradient="bg-gradient-to-br from-tint-green to-tint-blue"
              prevWinner={agg.prevTopByRevenue ? `${agg.prevTopByRevenue.name} (${agg.prevTopByRevenue.channel})` : undefined}
            />
          ) : (
            <div className="bg-card rounded-2xl border border-border/30 p-5 flex items-center justify-center text-xs text-muted-foreground">No product data</div>
          )}

          {agg.topByUnits ? (
            <TopPerformerCard
              title="#1 Product by Units"
              icon={<Package className="w-4 h-4" />}
              productName={agg.topByUnits.name}
              channel={agg.topByUnits.channel}
              metric="Units"
              metricValue={`${agg.topByUnits.units} units`}
              gradient="bg-gradient-to-br from-tint-blue to-tint-purple"
              prevWinner={agg.prevTopByUnits ? `${agg.prevTopByUnits.name} (${agg.prevTopByUnits.channel})` : undefined}
            />
          ) : (
            <div className="bg-card rounded-2xl border border-border/30 p-5 flex items-center justify-center text-xs text-muted-foreground">No product data</div>
          )}

          {/* Top Revenue Channel (manual) */}
          <div className="relative overflow-hidden rounded-2xl border border-border/20 p-5 bg-gradient-to-br from-tint-orange to-tint-red">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-white/60 text-foreground">
                <Star className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-foreground/70">Top Revenue Channel</span>
            </div>
            <p className="text-lg font-extrabold text-foreground mb-1">{agg.topChannel || "—"}</p>
            {agg.topChannelNotes && (
              <p className="text-[10px] text-foreground/50 leading-relaxed">{agg.topChannelNotes}</p>
            )}
            <ChevronRight className="absolute bottom-4 right-4 w-4 h-4 text-foreground/20" />
          </div>
        </div>
      </div>
    </div>
  );
}
