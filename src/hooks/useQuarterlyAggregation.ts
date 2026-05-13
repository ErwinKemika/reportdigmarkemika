import { usePageData } from "@/hooks/usePageData";
import { useMonth } from "@/contexts/MonthContext";
import {
  getMarketplaceData,
  getWebstoreSalesData,
  getGoogleAdsData,
  getMetaAdsData,
  getShopeeAdsData,
  getBenchmarkData,
  getQuarterlyInsightData,
} from "@/data/mockData";
import {
  transformMarketplace,
  transformWebstoreSales,
  transformShopeeAds,
  transformBenchmark,
} from "@/lib/dataTransformers";

const QUARTER_MONTHS: Record<"Q1" | "Q2" | "Q3" | "Q4", [string, string, string]> = {
  Q1: ["January", "February", "March"],
  Q2: ["April", "May", "June"],
  Q3: ["July", "August", "September"],
  Q4: ["October", "November", "December"],
};

type ChannelKey = "Tokopedia" | "Shopee" | "Webstore";

function pickDb<T>(db: any, fallback: T | undefined, transformer?: (d: any) => T): T | undefined {
  if (db && Object.keys(db).length > 0) {
    return transformer ? transformer(db) : (db as T);
  }
  return fallback;
}

export function useQuarterlyAggregation(quarter: "Q1" | "Q2" | "Q3" | "Q4") {
  const { selectedYear } = useMonth();
  const months = QUARTER_MONTHS[quarter];
  const baseMock = getQuarterlyInsightData(quarter.toLowerCase());

  // Fixed-order hooks: 3 months × 6 page keys = 18 queries
  const periods = months.map((m) => `${m} ${selectedYear}`);

  const m0Marketplace = usePageData(periods[0], "marketplace");
  const m0Webstore = usePageData(periods[0], "webstore-sales");
  const m0Google = usePageData(periods[0], "google-ads");
  const m0Meta = usePageData(periods[0], "meta-ads");
  const m0Shopee = usePageData(periods[0], "shopee-ads");
  const m0Bench = usePageData(periods[0], "benchmark");

  const m1Marketplace = usePageData(periods[1], "marketplace");
  const m1Webstore = usePageData(periods[1], "webstore-sales");
  const m1Google = usePageData(periods[1], "google-ads");
  const m1Meta = usePageData(periods[1], "meta-ads");
  const m1Shopee = usePageData(periods[1], "shopee-ads");
  const m1Bench = usePageData(periods[1], "benchmark");

  const m2Marketplace = usePageData(periods[2], "marketplace");
  const m2Webstore = usePageData(periods[2], "webstore-sales");
  const m2Google = usePageData(periods[2], "google-ads");
  const m2Meta = usePageData(periods[2], "meta-ads");
  const m2Shopee = usePageData(periods[2], "shopee-ads");
  const m2Bench = usePageData(periods[2], "benchmark");

  const isLoading = [
    m0Marketplace, m0Webstore, m0Google, m0Meta, m0Shopee, m0Bench,
    m1Marketplace, m1Webstore, m1Google, m1Meta, m1Shopee, m1Bench,
    m2Marketplace, m2Webstore, m2Google, m2Meta, m2Shopee, m2Bench,
  ].some((q) => q.isLoading);

  if (!baseMock) return { data: undefined, isLoading };

  const monthSlots = [
    { name: months[0], mp: m0Marketplace.data, ws: m0Webstore.data, gg: m0Google.data, mt: m0Meta.data, sh: m0Shopee.data, bm: m0Bench.data },
    { name: months[1], mp: m1Marketplace.data, ws: m1Webstore.data, gg: m1Google.data, mt: m1Meta.data, sh: m1Shopee.data, bm: m1Bench.data },
    { name: months[2], mp: m2Marketplace.data, ws: m2Webstore.data, gg: m2Google.data, mt: m2Meta.data, sh: m2Shopee.data, bm: m2Bench.data },
  ];

  let totalAdSpend = 0;
  let totalRevenue = 0;
  let totalTraffic = 0;
  const monthTrend: { month: string; revenue: number; adSpend: number; traffic: number }[] = [];

  const channelRevenue: Record<ChannelKey, number> = { Tokopedia: 0, Shopee: 0, Webstore: 0 };
  const channelVisits: Record<ChannelKey, number> = { Tokopedia: 0, Shopee: 0, Webstore: 0 };
  const channelConversions: Record<ChannelKey, number> = { Tokopedia: 0, Shopee: 0, Webstore: 0 };

  let totalAchievement = 0;
  let achievementCount = 0;

  for (const slot of monthSlots) {
    const monthName = slot.name as any;
    const marketplace = pickDb(slot.mp, getMarketplaceData(monthName), transformMarketplace);
    const webstore = pickDb(slot.ws, getWebstoreSalesData(monthName), transformWebstoreSales);
    const googleAds = pickDb<any>(slot.gg, getGoogleAdsData(monthName));
    const metaAds = pickDb<any>(slot.mt, getMetaAdsData(monthName));
    const shopeeAds = pickDb(slot.sh, getShopeeAdsData(monthName), transformShopeeAds);
    const benchmark = pickDb(slot.bm, getBenchmarkData(monthName), transformBenchmark);

    // Ad spend: DB google/meta have raw 'cost'; mock has 'cost' on PlatformAdsDetailData
    const ggCost = (slot.gg as any)?.cost ?? googleAds?.cost ?? 0;
    const mtCost = (slot.mt as any)?.cost ?? metaAds?.cost ?? 0;
    const shCost = shopeeAds?.adSpend?.value ?? (slot.sh as any)?.spend ?? 0;
    const monthAdSpend = ggCost + mtCost + shCost;

    const tokRevenue = marketplace?.tokopedia.revenue ?? 0;
    const shopRevenue = marketplace?.shopee.revenue ?? 0;
    const webRevenue = webstore?.totalRevenue ?? 0;
    const monthRevenue = tokRevenue + shopRevenue + webRevenue;

    const tokTraffic = benchmark?.channels.find((c) => c.channel === "Tokopedia")?.traffic ?? 0;
    const shopTraffic = benchmark?.channels.find((c) => c.channel === "Shopee")?.traffic ?? 0;
    const webTraffic = benchmark?.channels.find((c) => c.channel === "Webstore")?.traffic ?? 0;
    const monthTraffic = tokTraffic + shopTraffic + webTraffic;

    totalAdSpend += monthAdSpend;
    totalRevenue += monthRevenue;
    totalTraffic += monthTraffic;

    channelRevenue.Tokopedia += tokRevenue;
    channelRevenue.Shopee += shopRevenue;
    channelRevenue.Webstore += webRevenue;

    if (benchmark) {
      for (const ch of benchmark.channels) {
        const key = ch.channel as ChannelKey;
        if (key in channelVisits) {
          channelVisits[key] += ch.traffic;
          channelConversions[key] += Math.round((ch.traffic * ch.conversionRate) / 100);
        }
      }
      const avgAch =
        benchmark.channels.reduce((s, c) => s + c.achievement, 0) / benchmark.channels.length;
      totalAchievement += avgAch;
      achievementCount++;
    }

    monthTrend.push({
      month: slot.name.slice(0, 3),
      revenue: monthRevenue,
      adSpend: monthAdSpend,
      traffic: monthTraffic,
    });
  }

  const blendedROAS = totalAdSpend > 0 ? totalRevenue / totalAdSpend : 0;
  const achievementPercent = achievementCount > 0 ? totalAchievement / achievementCount : 0;

  const channelKeys: ChannelKey[] = ["Tokopedia", "Shopee", "Webstore"];
  const channels = channelKeys
    .map((name) => {
      const revenue = channelRevenue[name];
      const traffic = channelVisits[name];
      const conversionRate = traffic > 0 ? (channelConversions[name] / traffic) * 100 : 0;
      const contribution = totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100) : 0;
      return { name, revenue, traffic, conversionRate, contribution };
    })
    .filter((c) => c.revenue > 0 || c.traffic > 0);

  const avgConversionRate =
    totalTraffic > 0
      ? channels.reduce((sum, c) => sum + c.conversionRate * c.traffic, 0) / totalTraffic
      : 0;

  return {
    data: {
      ...baseMock,
      year: selectedYear,
      months,
      totalAdSpend,
      totalRevenue,
      blendedROAS,
      totalTraffic,
      avgConversionRate,
      achievementPercent,
      monthTrend,
      channels,
    },
    isLoading: false,
  };
}
