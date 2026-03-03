// Transforms flat DB form data into the nested structures each page expects
import type {
  OverviewData, WebsitePerformanceData, WebstoreSalesData,
  MarketplaceData, ShopeeAdsData, AdsBudgetData, InsightsData,
  RecommendationsData, ClosingData, ROIRevenueData, BenchmarkData, KPIValue,
  PlatformAdsDetailData,
} from "@/data/mockData";

function kpi(value: number, previousValue: number): KPIValue {
  return { value, previousValue };
}

export function transformOverview(d: Record<string, any>): OverviewData {
  return {
    website: {
      objective: d.websiteObjective || "",
      sessions: kpi(d.websiteSessions || 0, d.websitePrevSessions || 0),
      users: kpi(d.websiteUsers || 0, d.websitePrevUsers || 0),
      conversionRate: kpi(d.websiteCR || 0, d.websitePrevCR || 0),
      revenue: kpi(d.websiteRevenue || 0, d.websitePrevRevenue || 0),
      avgDuration: kpi(d.websiteAvgDuration || 0, d.websitePrevAvgDuration || 0),
    },
    tokopedia: {
      visitorToko: kpi(d.tokopediaVisitorToko || 0, d.tokopediaPrevVisitorToko || 0),
      visitorProduk: kpi(d.tokopediaVisitorProduk || 0, d.tokopediaPrevVisitorProduk || 0),
      soldProducts: kpi(d.tokopediaSoldProducts || 0, d.tokopediaPrevSoldProducts || 0),
      ratingToko: kpi(d.tokopediaRating || 0, d.tokopediaPrevRating || 0),
    },
    shopee: {
      visitorToko: kpi(d.shopeeVisitorToko || 0, d.shopeePrevVisitorToko || 0),
      chatResponse: kpi(d.shopeeChatResponse || 0, d.shopeePrevChatResponse || 0),
      conversionRate: kpi(d.shopeeCR || 0, d.shopeePrevCR || 0),
      totalOrders: kpi(d.shopeeTotalOrders || 0, d.shopeePrevTotalOrders || 0),
    },
    monthlyTarget: d.monthlyTarget || "",
  };
}

export function transformWebsitePerformance(d: Record<string, any>): WebsitePerformanceData {
  const totalSessions = (d.organicSessions || 0) + (d.directSessions || 0) + (d.referralSessions || 0) + (d.socialSessions || 0) + (d.paidSessions || 0);
  return {
    totalSessions: kpi(d.sessions || 0, d.previousSessions || 0),
    totalUsers: kpi(d.users || 0, d.previousUsers || 0),
    engagedSessions: kpi(d.engagedSessions || 0, d.previousEngagedSessions || 0),
    eventClickWA: kpi(d.waClicks || 0, d.previousWaClicks || 0),
    avgDuration: kpi(d.avgSessionDuration || 0, d.previousAvgSessionDuration || 0),
    topKeywords: (d.topKeywords || []).map((k: any) => ({ keyword: k.keyword || "", sessions: k.sessions || 0 })),
    trafficSources: (() => {
      const sources = [
        { source: "Organic", sessions: d.organicSessions || 0 },
        { source: "Direct", sessions: d.directSessions || 0 },
        { source: "Referral", sessions: d.referralSessions || 0 },
        { source: "Social", sessions: d.socialSessions || 0 },
        { source: "Paid", sessions: d.paidSessions || 0 },
      ].filter(s => s.sessions > 0);
      const total = sources.reduce((s, x) => s + x.sessions, 0) || 1;
      return sources.map(s => ({ ...s, percentage: parseFloat(((s.sessions / total) * 100).toFixed(1)) }));
    })(),
  };
}

export function transformWebstoreSales(d: Record<string, any>): WebstoreSalesData {
  const products = (d.topProductsSold || []).map((p: any) => {
    const units = p.units || 0;
    const pricePerUnit = p.pricePerUnit || p.price || 0;
    const revenue = units * pricePerUnit;
    return { name: p.name || "", units, price: pricePerUnit, revenue };
  });
  const totalRevenue = d.totalRevenue || products.reduce((sum: number, p: any) => sum + p.revenue, 0);
  return {
    totalRevenue,
    previousRevenue: d.previousRevenue || 0,
    topProductsViewed: (d.topProductsViewed || []).map((p: any) => ({ name: p.name || "", sessions: p.sessions || 0 })),
    topProductsSold: products,
    trackingPlatforms: [
      {
        name: "Shopee Official",
        totalClicks: d.trackingShopeeClicks || 0,
        previousClicks: d.trackingShopeePrevClicks || 0,
        topProducts: (d.trackingShopee || []).map((p: any) => ({ name: p.name || "", sessions: p.sessions || 0 })),
      },
      {
        name: "Tokopedia Store",
        totalClicks: d.trackingTokopediaClicks || 0,
        previousClicks: d.trackingTokopediaPrevClicks || 0,
        topProducts: (d.trackingTokopedia || []).map((p: any) => ({ name: p.name || "", sessions: p.sessions || 0 })),
      },
      {
        name: "Inaproc (B2B)",
        totalClicks: d.trackingInaprocClicks || 0,
        previousClicks: d.trackingInaprocPrevClicks || 0,
        topProducts: (d.trackingInaproc || []).map((p: any) => ({ name: p.name || "", sessions: p.sessions || 0 })),
      },
    ],
  };
}

export function transformMarketplace(d: Record<string, any>): MarketplaceData {
  // Auto-calc top products revenue
  const tokProducts = (d.tokopediaTopProducts || []).map((p: any) => {
    const units = p.units || 0;
    const pricePerUnit = p.pricePerUnit || 0;
    const revenue = p.revenue || (units * pricePerUnit);
    return { name: p.name || "", units, revenue };
  });
  const shopProducts = (d.shopeeTopProducts || []).map((p: any) => {
    const units = p.units || 0;
    const pricePerUnit = p.pricePerUnit || 0;
    const revenue = p.revenue || (units * pricePerUnit);
    return { name: p.name || "", units, revenue };
  });

  const tokRevenue = d.tokopediaRevenue || 0;
  const shopRevenue = d.shopeeRevenue || 0;
  const prevTokRevenue = d.previousTokopediaRevenue || 0;
  const prevShopRevenue = d.previousShopeeRevenue || 0;

  const totalProductCount = tokProducts.length + shopProducts.length;
  const autoTotalUnitsSold = tokProducts.reduce((s: number, p: any) => s + p.units, 0) + shopProducts.reduce((s: number, p: any) => s + p.units, 0);

  return {
    totalCombinedRevenue: tokRevenue + shopRevenue,
    previousCombinedRevenue: prevTokRevenue + prevShopRevenue,
    totalUnitsSold: autoTotalUnitsSold || d.totalUnitsSold || 0,
    previousUnitsSold: d.previousUnitsSold || 0,
    totalProductCount,
    tokopedia: {
      revenue: tokRevenue,
      previousRevenue: prevTokRevenue,
      gmv: d.tokopediaGmv || 0,
      previousGmv: d.previousTokopediaGmv || 0,
      unitsSold: d.tokopediaUnitsSold || 0,
      previousUnitsSold: d.previousTokopediaUnitsSold || 0,
      visitors: d.tokopediaVisitors || 0,
      previousVisitors: d.previousTokopediaVisitors || 0,
      pageViews: d.tokopediaPageViews || 0,
      previousPageViews: d.previousTokopediaPageViews || 0,
      topProducts: tokProducts,
    },
    shopee: {
      revenue: shopRevenue,
      previousRevenue: prevShopRevenue,
      orders: d.shopeeOrders || 0,
      previousOrders: d.previousShopeeOrders || 0,
      visitors: d.shopeeVisitors || 0,
      previousVisitors: d.previousShopeeVisitors || 0,
      pageViews: d.shopeePageViews || 0,
      previousPageViews: d.previousShopeePageViews || 0,
      productClick: d.shopeeProductClick || 0,
      previousProductClick: d.previousShopeeProductClick || 0,
      cancelledOrders: d.shopeeCancelledOrders || 0,
      previousCancelledOrders: d.previousShopeeCancelledOrders || 0,
      topProducts: shopProducts,
    },
  };
}

export function transformShopeeAds(d: Record<string, any>): ShopeeAdsData {
  const adRevenue = d.adRevenue || 0;
  const spend = d.spend || 0;
  const prevAdRevenue = d.previousAdRevenue || 0;
  const prevSpend = d.previousSpend || 0;
  return {
    impressions: kpi(d.impressions || 0, d.previousImpressions || 0),
    clicks: kpi(d.clicks || 0, d.previousClicks || 0),
    ctr: kpi(d.ctr || 0, d.previousCtr || 0),
    orders: kpi(d.orders || 0, d.previousOrders || 0),
    unitsSold: kpi(d.orders || 0, d.previousOrders || 0), // approximate
    revenueFromAds: kpi(adRevenue, prevAdRevenue),
    adSpend: kpi(spend, prevSpend),
    roas: spend > 0 ? adRevenue / spend : 0,
    previousRoas: prevSpend > 0 ? prevAdRevenue / prevSpend : 0,
    products: (d.products || []).map((p: any) => ({
      name: p.name || "", revenue: p.revenue || 0, unitsSold: p.units || 0,
      views: p.views || 0, clicks: p.clicks || 0, budget: p.spend || 0,
      imageUrl: p.imageUrl || "",
    })),
  };
}

export function transformAdsBudget(d: Record<string, any>): AdsBudgetData {
  return {
    google: { budget: d.googleSpend || 0, clicks: d.googleClicks || 0, conversions: d.googleConversions || 0, revenue: d.googleRevenue || 0 },
    meta: { budget: d.metaSpend || 0, clicks: d.metaClicks || 0, conversions: d.metaConversions || 0, revenue: d.metaRevenue || 0 },
    shopee: { budget: d.shopeeSpend || 0, clicks: d.shopeeClicks || 0, conversions: d.shopeeConversions || 0, revenue: d.shopeeRevenue || 0 },
  };
}

export function transformInsights(d: Record<string, any>): InsightsData {
  return {
    keyInsights: (d.keyInsights || []).map((x: any) => typeof x === "string" ? x : (x.text ?? "")),
    supportingFactors: (d.supportingFactors || []).map((x: any) => typeof x === "string" ? x : (x.text ?? "")),
    limitingFactors: (d.limitingFactors || []).map((x: any) => typeof x === "string" ? x : (x.text ?? "")),
    bestChannel: d.bestChannel || "",
    achievementPercent: d.achievementPercent || 0,
    insightSummary: d.insightSummary || "",
  };
}

export function transformRecommendations(d: Record<string, any>): RecommendationsData {
  return {
    optimasiWebsite: (d.optimasiWebsite || []).map((x: any) => typeof x === "string" ? x : (x.text ?? "")),
    optimasiMarketplace: (d.optimasiMarketplace || []).map((x: any) => typeof x === "string" ? x : (x.text ?? "")),
    actionPlan30: (d.actionPlan30 || []).map((x: any) => ({ action: x.action || "", tag: x.tag || "" })),
    actionPlan60: (d.actionPlan60 || []).map((x: any) => ({ action: x.action || "", tag: x.tag || "" })),
    actionPlan90: (d.actionPlan90 || []).map((x: any) => ({ action: x.action || "", tag: x.tag || "" })),
  };
}

export function transformClosing(d: Record<string, any>): ClosingData {
  return {
    monthlySummary: d.monthlySummary || "",
    highlights: (d.highlights || []).map((x: any) => x.text || x),
    focusAreaNextMonth: d.focusAreaNextMonth || "",
    targetTrafficGrowth: d.targetTrafficGrowth || 0,
    targetConversionImprovement: d.targetConversionImprovement || 0,
    targetROAS: d.targetROAS || 0,
  };
}

export function transformROIRevenue(d: Record<string, any>): ROIRevenueData {
  const b2b = d.b2bLeads || 0;
  const b2g = d.b2gLeads || 0;
  const prevB2b = d.previousB2bLeads || 0;
  const prevB2g = d.previousB2gLeads || 0;
  const leadPipeline = (d.leadPipeline || []).map((l: any) => ({
    projectName: l.projectName || "", leadSource: l.leadSource || "",
    stage: l.stage || "Processing", estimatedRevenue: l.estimatedRevenue || 0,
  }));
  const autoEstRevenue = leadPipeline.reduce((sum: number, l: any) => sum + l.estimatedRevenue, 0);
  // If new keys exist, use them directly; otherwise fallback to legacy keys
  const hasNewAds = d.ads !== undefined && d.ads !== null;
  const hasNewMaintenance = d.maintenanceWebSosmed !== undefined && d.maintenanceWebSosmed !== null;
  return {
    b2bLeads: kpi(b2b, prevB2b),
    b2gLeads: kpi(b2g, prevB2g),
    totalLeads: kpi(b2b + b2g, prevB2b + prevB2g),
    estimatedRevenue: kpi(autoEstRevenue || d.estimatedRevenue || 0, d.previousEstimatedRevenue || 0),
    investment: {
      ads: hasNewAds ? d.ads : (d.socialAds || 0) + (d.marketplaceAds || 0),
      websiteSEO: d.websiteSEO || 0,
      maintenanceWebSosmed: hasNewMaintenance ? d.maintenanceWebSosmed : (d.webstoreOps || 0),
    },
    actualMarketplaceRevenue: d.actualMarketplaceRevenue || 0,
    leadPipeline,
    insightSummary: d.insightSummary || "",
  };
}

// Fixed benchmark targets
const BENCHMARK_TARGET_TRAFFIC = 1250;
const BENCHMARK_TARGET_CR = 0.17;

export function transformBenchmark(d: Record<string, any>): BenchmarkData {
  return {
    channels: [
      {
        channel: "Tokopedia",
        traffic: d.tokopediaTraffic || 0,
        targetTraffic: BENCHMARK_TARGET_TRAFFIC,
        conversionRate: d.tokopediaCR || 0,
        targetCR: BENCHMARK_TARGET_CR,
        achievement: BENCHMARK_TARGET_TRAFFIC > 0 ? ((d.tokopediaTraffic || 0) / BENCHMARK_TARGET_TRAFFIC) * 100 : 0,
      },
      {
        channel: "Shopee",
        traffic: d.shopeeTraffic || 0,
        targetTraffic: BENCHMARK_TARGET_TRAFFIC,
        conversionRate: d.shopeeCR || 0,
        targetCR: BENCHMARK_TARGET_CR,
        achievement: BENCHMARK_TARGET_TRAFFIC > 0 ? ((d.shopeeTraffic || 0) / BENCHMARK_TARGET_TRAFFIC) * 100 : 0,
      },
      {
        channel: "Webstore",
        traffic: d.webstoreTraffic || 0,
        targetTraffic: BENCHMARK_TARGET_TRAFFIC,
        conversionRate: d.webstoreCR || 0,
        targetCR: BENCHMARK_TARGET_CR,
        achievement: BENCHMARK_TARGET_TRAFFIC > 0 ? ((d.webstoreTraffic || 0) / BENCHMARK_TARGET_TRAFFIC) * 100 : 0,
      },
    ],
  };
}

// ===== Previous-month field mappers =====
// These extract current-month values and return them as "previous*" fields

export const websitePerformancePrevMapper = (prev: Record<string, any>) => ({
  previousSessions: prev.sessions,
  previousUsers: prev.users,
  previousEngagedSessions: prev.engagedSessions,
  previousWaClicks: prev.waClicks,
  previousAvgSessionDuration: prev.avgSessionDuration,
});

export const marketplacePrevMapper = (prev: Record<string, any>) => {
  const tokProducts = prev.tokopediaTopProducts || [];
  const shopProducts = prev.shopeeTopProducts || [];
  const prevTotalUnits =
    tokProducts.reduce((s: number, p: any) => s + (p.units || 0), 0) +
    shopProducts.reduce((s: number, p: any) => s + (p.units || 0), 0);
  return {
    previousTokopediaRevenue: prev.tokopediaRevenue,
    previousShopeeRevenue: prev.shopeeRevenue,
    previousTokopediaGmv: prev.tokopediaGmv,
    previousTokopediaUnitsSold: prev.tokopediaUnitsSold,
    previousTokopediaVisitors: prev.tokopediaVisitors,
    previousTokopediaPageViews: prev.tokopediaPageViews,
    previousShopeeOrders: prev.shopeeOrders,
    previousShopeeVisitors: prev.shopeeVisitors,
    previousShopeeProductClick: prev.shopeeProductClick,
    previousShopeeCancelledOrders: prev.shopeeCancelledOrders,
    previousUnitsSold: prevTotalUnits,
  };
};

export const webstoreSalesPrevMapper = (prev: Record<string, any>) => {
  const products = prev.topProductsSold || [];
  const totalRev =
    prev.totalRevenue ||
    products.reduce((s: number, p: any) => s + (p.units || 0) * (p.pricePerUnit || p.price || 0), 0);
  return {
    previousRevenue: totalRev,
    trackingShopeePrevClicks: prev.trackingShopeeClicks,
    trackingTokopediaPrevClicks: prev.trackingTokopediaClicks,
    trackingInaprocPrevClicks: prev.trackingInaprocClicks,
  };
};

export const shopeeAdsPrevMapper = (prev: Record<string, any>) => ({
  previousImpressions: prev.impressions,
  previousClicks: prev.clicks,
  previousCtr: prev.ctr,
  previousOrders: prev.orders,
  previousAdRevenue: prev.adRevenue,
  previousSpend: prev.spend,
});

export const platformAdsPrevMapper = (prev: Record<string, any>) => ({
  previousCost: prev.cost,
  previousImpressions: prev.impressions,
  previousClicks: prev.clicks,
  previousConversions: prev.conversions,
  previousCtr: prev.ctr,
  previousConvRate: prev.convRate,
  previousAvgCpm: prev.avgCpm,
  previousAvgCpc: prev.avgCpc,
  previousCostPerConv: prev.costPerConv,
  previousRevenue: prev.revenue,
});

export const roiRevenuePrevMapper = (prev: Record<string, any>) => {
  const pipeline = prev.leadPipeline || [];
  const prevEstRevenue = pipeline.reduce((s: number, l: any) => s + (l.estimatedRevenue || 0), 0);
  return {
    previousB2bLeads: prev.b2bLeads,
    previousB2gLeads: prev.b2gLeads,
    previousEstimatedRevenue: prevEstRevenue || prev.estimatedRevenue,
  };
};

export function transformPlatformAdsDetail(d: Record<string, any>): PlatformAdsDetailData {
  return {
    cost: d.cost || 0,
    previousCost: d.previousCost || 0,
    impressions: d.impressions || 0,
    previousImpressions: d.previousImpressions || 0,
    clicks: d.clicks || 0,
    previousClicks: d.previousClicks || 0,
    conversions: d.conversions || 0,
    previousConversions: d.previousConversions || 0,
    ctr: d.ctr || 0,
    previousCtr: d.previousCtr || 0,
    convRate: d.convRate || 0,
    previousConvRate: d.previousConvRate || 0,
    avgCpm: d.avgCpm || 0,
    previousAvgCpm: d.previousAvgCpm || 0,
    avgCpc: d.avgCpc || 0,
    previousAvgCpc: d.previousAvgCpc || 0,
    costPerConv: d.costPerConv || 0,
    previousCostPerConv: d.previousCostPerConv || 0,
    revenue: d.revenue || 0,
    previousRevenue: d.previousRevenue || 0,
    campaigns: (d.campaigns || []).map((c: any) => ({
      name: c.name || "",
      cost: c.cost || 0,
      convRate: c.convRate || 0,
      conversions: c.conversions || 0,
      costPerConv: c.costPerConv || 0,
    })),
    insight: d.insight || "",
  };
}
