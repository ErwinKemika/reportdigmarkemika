import { useMonth } from "@/contexts/MonthContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePageData, useUpsertPageData } from "@/hooks/usePageData";
import { getWebstoreSalesData, getMarketplaceData, getROIRevenueData, getWebsitePerformanceData, formatCurrency, formatNumber, growthPercent, type KPIValue } from "@/data/mockData";
import { transformWebstoreSales, transformMarketplace, transformROIRevenue, transformWebsitePerformance } from "@/lib/dataTransformers";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { NoData } from "@/components/dashboard/NoData";
import { PageEditDialog } from "@/components/dashboard/PageEditDialog";
import { overviewManualSchema } from "@/components/dashboard/pageEditSchemas";
import { TrendingUp, TrendingDown, Minus, Globe, Users, DollarSign, Percent, Wallet, Trophy, Package, Star, Info, Clock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useMemo } from "react";
import type { MonthName } from "@/contexts/MonthContext";
import { MONTHS } from "@/contexts/MonthContext";

function getPreviousMonthYear(month: MonthName, year: number): { month: MonthName; year: number; period: string } {
  const idx = MONTHS.indexOf(month);
  if (idx === 0) {
    return { month: MONTHS[11], year: year - 1, period: `${MONTHS[11]} ${year - 1}` };
  }
  return { month: MONTHS[idx - 1], year, period: `${MONTHS[idx - 1]} ${year}` };
}

// Helper to safely get data from DB or mock
function useSourceData(period: string, pageKey: string, mockMonth: MonthName, mockGetter: (m: MonthName) => any, transformer: (d: Record<string, any>) => any) {
  const { data: dbData, isLoading } = usePageData(period, pageKey);
  const mock = mockGetter(mockMonth);
  if (isLoading) return { data: undefined, isLoading: true };
  if (dbData && transformer) return { data: transformer(dbData as Record<string, any>), isLoading: false };
  return { data: mock, isLoading: false };
}

interface AggregatedKPI {
  value: number;
  previousValue: number;
}

function kpi(v: number, pv: number): AggregatedKPI { return { value: v, previousValue: pv }; }

// ============ KPI Card Component for Overview ============
function OverviewKPICard({ title, value, previousValue, formatter, icon, tooltip, large }: {
  title: string;
  value: number;
  previousValue: number;
  formatter: (n: number) => string;
  icon: React.ReactNode;
  tooltip?: string;
  large?: boolean;
}) {
  const growth = growthPercent(value, previousValue);
  const isPositive = growth > 0;
  const isNeutral = growth === 0;

  return (
    <div className={`bg-card rounded-xl border border-border/40 shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in overflow-hidden ${large ? "p-6" : "p-5"}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
          <span className="text-label uppercase tracking-wider text-muted-foreground">{title}</span>
        </div>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-3.5 h-3.5 text-muted-foreground/40 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-xs">
                {tooltip}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className={`font-extrabold text-card-foreground mb-1 tracking-tight leading-tight ${large ? "text-2xl" : "text-xl"}`}>
        {formatter(value)}
      </div>
      <div className="flex items-center gap-1.5">
        {isNeutral ? (
          <Minus className="w-3.5 h-3.5 text-muted-foreground" />
        ) : isPositive ? (
          <TrendingUp className="w-3.5 h-3.5 text-success" />
        ) : (
          <TrendingDown className="w-3.5 h-3.5 text-destructive" />
        )}
        <span className={`text-xs font-semibold ${isNeutral ? "text-muted-foreground" : isPositive ? "text-success" : "text-destructive"}`}>
          {isPositive ? "+" : ""}{growth.toFixed(1)}%
        </span>
        <span className="text-xs text-muted-foreground/70">vs prev</span>
      </div>
    </div>
  );
}

// ============ Product Winner Card ============
function ProductWinnerCard({ title, icon, productName, channel, metricLabel, metricValue, metricFormatter, prevWinner }: {
  title: string;
  icon: React.ReactNode;
  productName: string;
  channel: string;
  metricLabel: string;
  metricValue: number;
  metricFormatter: (n: number) => string;
  prevWinner?: string;
}) {
  return (
    <div className="bg-card rounded-xl border border-border/40 shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-lg bg-accent/50 text-accent-foreground">
          {icon}
        </div>
        <span className="text-label uppercase tracking-wider text-muted-foreground">{title}</span>
      </div>
      <p className="text-sm font-bold text-card-foreground truncate mb-0.5" title={productName}>{productName}</p>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{channel}</span>
        <span className="text-xs text-muted-foreground">{metricLabel}: {metricFormatter(metricValue)}</span>
      </div>
      {prevWinner && (
        <p className="text-[10px] text-muted-foreground/60 truncate">Prev winner: {prevWinner}</p>
      )}
    </div>
  );
}

// ============ Manual Field Card ============
function ManualChannelCard({ channel, notes }: { channel: string; notes: string }) {
  return (
    <div className="bg-card rounded-xl border border-border/40 shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-lg bg-accent/50 text-accent-foreground">
          <Star className="w-4 h-4" />
        </div>
        <span className="text-label uppercase tracking-wider text-muted-foreground">Top Revenue Channel</span>
      </div>
      <p className="text-lg font-extrabold text-card-foreground mb-1">{channel || "—"}</p>
      {notes && <p className="text-xs text-muted-foreground leading-relaxed">{notes}</p>}
    </div>
  );
}

export default function OverviewPage() {
  const { selectedMonth, selectedYear, period } = useMonth();
  const { isAdmin } = useAuth();
  const prev = getPreviousMonthYear(selectedMonth, selectedYear);

  // Fetch current & previous from each source page
  const webstore = useSourceData(period, "webstore-sales", selectedMonth, getWebstoreSalesData, transformWebstoreSales);
  const prevWebstore = useSourceData(prev.period, "webstore-sales", prev.month, getWebstoreSalesData, transformWebstoreSales);
  const marketplace = useSourceData(period, "marketplace", selectedMonth, getMarketplaceData, transformMarketplace);
  const prevMarketplace = useSourceData(prev.period, "marketplace", prev.month, getMarketplaceData, transformMarketplace);
  const roi = useSourceData(period, "roi-revenue", selectedMonth, getROIRevenueData, transformROIRevenue);
  const prevRoi = useSourceData(prev.period, "roi-revenue", prev.month, getROIRevenueData, transformROIRevenue);
  const website = useSourceData(period, "website-performance", selectedMonth, getWebsitePerformanceData, transformWebsitePerformance);
  const prevWebsite = useSourceData(prev.period, "website-performance", prev.month, getWebsitePerformanceData, transformWebsitePerformance);

  // Manual overview data (budget + top channel)
  const { data: manualData, isLoading: manualLoading } = usePageData(period, "overview-manual");

  const isLoading = webstore.isLoading || marketplace.isLoading || roi.isLoading || website.isLoading || manualLoading;

  // ============ COMPUTE AGGREGATED KPIs ============
  const agg = useMemo(() => {
    const ws = webstore.data;
    const mp = marketplace.data;
    const roiD = roi.data;
    const web = website.data;
    const pws = prevWebstore.data;
    const pmp = prevMarketplace.data;
    const proi = prevRoi.data;
    const pweb = prevWebsite.data;

    // 1) Total Traffic
    const webTraffic = web?.totalSessions?.value || 0;
    const tokVisitors = mp?.tokopedia?.visitors || 0;
    const shopVisitors = mp?.shopee?.visitors || 0;
    const totalTraffic = webTraffic + tokVisitors + shopVisitors;

    const prevWebTraffic = pweb?.totalSessions?.value || 0;
    const prevTokVisitors = pmp?.tokopedia?.visitors || 0;
    const prevShopVisitors = pmp?.shopee?.visitors || 0;
    const prevTotalTraffic = prevWebTraffic + prevTokVisitors + prevShopVisitors;

    // 2) Total Leads
    const totalLeads = (roiD?.b2bLeads?.value || 0) + (roiD?.b2gLeads?.value || 0);
    const prevTotalLeads = (proi?.b2bLeads?.value || 0) + (proi?.b2gLeads?.value || 0);

    // 3) Total Actual Revenue
    const webstoreRev = ws?.totalRevenue || 0;
    const mpRev = mp?.totalCombinedRevenue || 0;
    const totalRevenue = webstoreRev + mpRev;

    const prevWebstoreRev = pws?.totalRevenue || 0;
    const prevMpRev = pmp?.totalCombinedRevenue || 0;
    const prevTotalRevenue = prevWebstoreRev + prevMpRev;

    // 4) Weighted Conversion Rate
    // Orders
    const webOrders = web?.eventClickWA?.value || 0; // fallback to WA clicks as webstore "orders"
    const tokOrders = mp?.tokopedia?.unitsSold || 0;
    const shopOrders = mp?.shopee?.orders || 0;
    const totalOrders = webOrders + tokOrders + shopOrders;
    const totalVisitors = totalTraffic;
    const weightedCR = totalVisitors > 0 ? (totalOrders / totalVisitors) * 100 : 0;

    const prevWebOrders = pweb?.eventClickWA?.value || 0;
    const prevTokOrders = pmp?.tokopedia?.unitsSold || 0;
    const prevShopOrders = pmp?.shopee?.orders || 0;
    const prevTotalOrders = prevWebOrders + prevTokOrders + prevShopOrders;
    const prevTotalVisitors = prevTotalTraffic;
    const prevWeightedCR = prevTotalVisitors > 0 ? (prevTotalOrders / prevTotalVisitors) * 100 : 0;

    // 5) Total Budget Ads (manual)
    const manual = manualData as Record<string, any> | null;
    const totalBudget = manual?.totalBudgetAds || 0;
    const prevBudget = manual?.previousBudgetAds || 0;

    // 6) Top Product by Revenue
    const allProducts: { name: string; channel: string; revenue: number; units: number }[] = [];
    // Webstore
    (ws?.topProductsSold || []).forEach((p: any) => allProducts.push({ name: p.name, channel: "Webstore", revenue: p.revenue || 0, units: p.units || 0 }));
    // Tokopedia
    (mp?.tokopedia?.topProducts || []).forEach((p: any) => allProducts.push({ name: p.name, channel: "Tokopedia", revenue: p.revenue || 0, units: p.units || 0 }));
    // Shopee
    (mp?.shopee?.topProducts || []).forEach((p: any) => allProducts.push({ name: p.name, channel: "Shopee", revenue: p.revenue || 0, units: p.units || 0 }));

    const topByRevenue = [...allProducts].sort((a, b) => b.revenue - a.revenue)[0] || null;
    const topByUnits = [...allProducts].sort((a, b) => b.units - a.units)[0] || null;

    // Previous period products for "prev winner"
    const prevProducts: { name: string; channel: string; revenue: number; units: number }[] = [];
    (pws?.topProductsSold || []).forEach((p: any) => prevProducts.push({ name: p.name, channel: "Webstore", revenue: p.revenue || 0, units: p.units || 0 }));
    (pmp?.tokopedia?.topProducts || []).forEach((p: any) => prevProducts.push({ name: p.name, channel: "Tokopedia", revenue: p.revenue || 0, units: p.units || 0 }));
    (pmp?.shopee?.topProducts || []).forEach((p: any) => prevProducts.push({ name: p.name, channel: "Shopee", revenue: p.revenue || 0, units: p.units || 0 }));
    const prevTopByRevenue = [...prevProducts].sort((a, b) => b.revenue - a.revenue)[0] || null;
    const prevTopByUnits = [...prevProducts].sort((a, b) => b.units - a.units)[0] || null;

    // 8) Top Revenue Channel (manual)
    const topChannel = manual?.topRevenueChannel || "";
    const topChannelNotes = manual?.topChannelNotes || "";

    return {
      totalTraffic: kpi(totalTraffic, prevTotalTraffic),
      totalLeads: kpi(totalLeads, prevTotalLeads),
      totalRevenue: kpi(totalRevenue, prevTotalRevenue),
      weightedCR: kpi(weightedCR, prevWeightedCR),
      totalBudget: kpi(totalBudget, prevBudget),
      topByRevenue,
      topByUnits,
      prevTopByRevenue,
      prevTopByUnits,
      topChannel,
      topChannelNotes,
    };
  }, [webstore.data, marketplace.data, roi.data, website.data, prevWebstore.data, prevMarketplace.data, prevRoi.data, prevWebsite.data, manualData]);

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading...</div>;

  const hasAnyData = webstore.data || marketplace.data || roi.data || website.data;
  if (!hasAnyData) return <NoData month={selectedMonth} />;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <SectionHeader title={`Overview — ${selectedMonth} ${selectedYear}`} subtitle="Auto-aggregated from all channels" icon={<Globe className="w-4 h-4" />} />
        {isAdmin && <PageEditDialog schema={overviewManualSchema} />}
      </div>

      {/* Last Updated + Data Sources */}
      <div className="flex items-center gap-4 text-[10px] text-muted-foreground/60">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>Period: {period}</span>
        </div>
        <span>•</span>
        <span>Sources: Website, Webstore, Tokopedia, Shopee, Leads (ROI)</span>
      </div>

      {/* KPI Grid — Row 1: Traffic, Leads, Revenue, CR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <OverviewKPICard
          title="Total Traffic"
          value={agg.totalTraffic.value}
          previousValue={agg.totalTraffic.previousValue}
          formatter={formatNumber}
          icon={<Globe className="w-4 h-4" />}
          tooltip="Webstore Traffic + Tokopedia Visitors + Shopee Visitors"
        />
        <OverviewKPICard
          title="Total Leads"
          value={agg.totalLeads.value}
          previousValue={agg.totalLeads.previousValue}
          formatter={(n) => n.toLocaleString()}
          icon={<Users className="w-4 h-4" />}
          tooltip="B2B Leads + B2G Leads from ROI & Revenue page"
        />
        <OverviewKPICard
          title="Total Revenue"
          value={agg.totalRevenue.value}
          previousValue={agg.totalRevenue.previousValue}
          formatter={formatCurrency}
          icon={<DollarSign className="w-4 h-4" />}
          tooltip="Webstore Revenue + Marketplace Combined Revenue (Tokopedia + Shopee)"
          large
        />
        <OverviewKPICard
          title="Conversion Rate"
          value={agg.weightedCR.value}
          previousValue={agg.weightedCR.previousValue}
          formatter={(n) => n.toFixed(2) + "%"}
          icon={<Percent className="w-4 h-4" />}
          tooltip="Weighted: Total Orders / Total Visitors × 100 across all channels"
        />
      </div>

      {/* KPI Grid — Row 2: Budget (manual), Top Product Revenue, Top Product Units, Top Channel (manual) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <OverviewKPICard
          title="Total Budget Ads"
          value={agg.totalBudget.value}
          previousValue={agg.totalBudget.previousValue}
          formatter={formatCurrency}
          icon={<Wallet className="w-4 h-4" />}
          tooltip="Manually entered overview headline budget"
        />

        {agg.topByRevenue ? (
          <ProductWinnerCard
            title="#1 by Revenue"
            icon={<Trophy className="w-4 h-4" />}
            productName={agg.topByRevenue.name}
            channel={agg.topByRevenue.channel}
            metricLabel="Revenue"
            metricValue={agg.topByRevenue.revenue}
            metricFormatter={formatCurrency}
            prevWinner={agg.prevTopByRevenue ? `${agg.prevTopByRevenue.name} (${agg.prevTopByRevenue.channel})` : undefined}
          />
        ) : (
          <div className="bg-card rounded-xl border border-border/40 p-5 flex items-center justify-center text-xs text-muted-foreground">No product data</div>
        )}

        {agg.topByUnits ? (
          <ProductWinnerCard
            title="#1 by Units Sold"
            icon={<Package className="w-4 h-4" />}
            productName={agg.topByUnits.name}
            channel={agg.topByUnits.channel}
            metricLabel="Units"
            metricValue={agg.topByUnits.units}
            metricFormatter={formatNumber}
            prevWinner={agg.prevTopByUnits ? `${agg.prevTopByUnits.name} (${agg.prevTopByUnits.channel})` : undefined}
          />
        ) : (
          <div className="bg-card rounded-xl border border-border/40 p-5 flex items-center justify-center text-xs text-muted-foreground">No product data</div>
        )}

        <ManualChannelCard channel={agg.topChannel} notes={agg.topChannelNotes} />
      </div>
    </div>
  );
}
