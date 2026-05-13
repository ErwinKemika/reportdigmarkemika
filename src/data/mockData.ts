// Mock data layer — designed to be replaced by database
// All data is keyed by month for the global month filter

import type { MonthName } from "@/contexts/MonthContext";

export type Month = MonthName;

export const MONTHS: Month[] = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

export interface KPIValue {
  value: number;
  previousValue: number;
  format?: "number" | "currency" | "percent" | "duration";
  prefix?: string;
  suffix?: string;
}

// Helper to compute growth %
export function growthPercent(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

export function formatCurrency(n: number): string {
  if (n >= 1_000_000_000) return "Rp " + (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return "Rp " + (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return "Rp " + (n / 1_000).toFixed(1) + "K";
  return "Rp " + n.toLocaleString("id-ID");
}

export function formatCurrencyFull(n: number): string {
  return "Rp " + n.toLocaleString("id-ID");
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

// ==================== PAGE 1 — OVERVIEW ====================
export interface OverviewData {
  website: {
    objective: string;
    sessions: KPIValue;
    users: KPIValue;
    conversionRate: KPIValue;
    revenue: KPIValue;
    avgDuration: KPIValue;
  };
  tokopedia: {
    visitorToko: KPIValue;
    visitorProduk: KPIValue;
    soldProducts: KPIValue;
    ratingToko: KPIValue;
  };
  shopee: {
    visitorToko: KPIValue;
    chatResponse: KPIValue;
    conversionRate: KPIValue;
    totalOrders: KPIValue;
  };
  monthlyTarget: string;
}

// ==================== PAGE 2 — WEBSITE PERFORMANCE ====================
export interface WebsitePerformanceData {
  totalSessions: KPIValue;
  totalUsers: KPIValue;
  engagedSessions: KPIValue;
  eventClickWA: KPIValue;
  avgDuration: KPIValue;
  topKeywords: { keyword: string; sessions: number }[];
  trafficSources: { source: string; sessions: number; percentage: number }[];
}

// ==================== PAGE 3 — WEBSTORE SALES ====================
export interface TrackingPlatform {
  name: string;
  totalClicks: number;
  previousClicks: number;
  topProducts: { name: string; sessions: number }[];
}

export interface WebstoreSalesData {
  totalRevenue: number;
  previousRevenue: number;
  topProductsViewed: { name: string; sessions: number }[];
  topProductsSold: { name: string; units: number; price: number; revenue: number }[];
  trackingPlatforms?: TrackingPlatform[];
}

// ==================== PAGE 4 — MARKETPLACE OVERVIEW ====================
export interface MarketplaceData {
  totalCombinedRevenue: number;
  previousCombinedRevenue: number;
  totalUnitsSold: number;
  previousUnitsSold: number;
  totalProductCount: number;
  tokopedia: {
    revenue: number;
    previousRevenue: number;
    gmv: number;
    previousGmv: number;
    unitsSold: number;
    previousUnitsSold: number;
    visitors: number;
    previousVisitors: number;
    pageViews: number;
    previousPageViews: number;
    topProducts: { name: string; units: number; revenue: number }[];
  };
  shopee: {
    revenue: number;
    previousRevenue: number;
    orders: number;
    previousOrders: number;
    visitors: number;
    previousVisitors: number;
    pageViews: number;
    previousPageViews: number;
    productClick: number;
    previousProductClick: number;
    cancelledOrders: number;
    previousCancelledOrders: number;
    topProducts: { name: string; units: number; revenue: number }[];
  };
  webstore?: {
    totalRevenue: number;
    previousRevenue: number;
    topProductsViewed: { name: string; sessions: number }[];
    topProductsSold: { name: string; units: number; price: number; revenue: number }[];
  };
}

// ==================== PAGE 5 — SHOPEE ADS ====================
export interface ShopeeAdsData {
  impressions: KPIValue;
  clicks: KPIValue;
  ctr: KPIValue;
  orders: KPIValue;
  unitsSold: KPIValue;
  revenueFromAds: KPIValue;
  adSpend: KPIValue;
  roas: number;
  previousRoas: number;
  products: {
    name: string;
    revenue: number;
    unitsSold: number;
    views: number;
    clicks: number;
    budget: number;
    imageUrl?: string;
  }[];
}

// ==================== PAGE 6 — ADS BUDGET ====================
export interface AdsBudgetData {
  google: { budget: number; clicks: number; conversions: number; revenue: number };
  meta: { budget: number; clicks: number; conversions: number; revenue: number };
  shopee: { budget: number; clicks: number; conversions: number; revenue: number };
}

// ==================== PLATFORM ADS DETAIL (Google/Meta) ====================
export interface CampaignRow {
  name: string;
  cost: number;
  convRate: number;
  conversions: number;
  costPerConv: number;
  impressions?: number;
  landingPageViews?: number;
}

export interface PlatformAdsDetailData {
  cost: number;
  previousCost: number;
  impressions: number;
  previousImpressions: number;
  clicks: number;
  previousClicks: number;
  conversions: number;
  previousConversions: number;
  ctr: number;
  previousCtr: number;
  convRate: number;
  previousConvRate: number;
  avgCpm: number;
  previousAvgCpm: number;
  avgCpc: number;
  previousAvgCpc: number;
  costPerConv: number;
  previousCostPerConv: number;
  revenue: number;
  previousRevenue: number;
  // Optional: Landing Page View (Meta Ads 5-step funnel)
  landingPageView?: number;
  previousLandingPageView?: number;
  lpvRate?: number;
  previousLpvRate?: number;
  costPerLpv?: number;
  previousCostPerLpv?: number;
  campaigns: CampaignRow[];
  insight: string;
}

// ==================== PAGE 7 — INSIGHTS ====================
export interface InsightsData {
  keyInsights: string[];
  supportingFactors: string[];
  limitingFactors: string[];
  bestChannel: string;
  achievementPercent: number;
  insightSummary: string;
}

// ==================== PAGE 8 — RECOMMENDATIONS ====================
export interface RecommendationsData {
  quarter?: string;
  quarterObjectives?: { objective: string }[];
  quarterChecklist?: { task: string }[];
  optimasiWebsite: string[];
  optimasiMarketplace: string[];
  actionPlan30: { action: string; tag: string; pic?: string; notes?: string }[];
  actionPlan60: { action: string; tag: string; pic?: string; notes?: string }[];
  actionPlan90: { action: string; tag: string; pic?: string; notes?: string }[];
}

// ==================== PAGE 10 — ROI & REVENUE IMPACT ====================
export interface ROIRevenueData {
  b2bLeads: KPIValue;
  b2gLeads: KPIValue;
  totalLeads: KPIValue;
  estimatedRevenue: KPIValue;
  investment: {
    ads: number;
    websiteSEO: number;
    maintenanceWebSosmed: number;
  };
  actualMarketplaceRevenue: number;
  leadPipeline: {
    projectName: string;
    project: "Non-Gov" | "Gov";
    leadSource: string;
    stage: "Processing" | "Qualified" | "Won";
    estimatedRevenue: number;
  }[];
  insightSummary: string;
}

// ==================== PAGE 9 — CLOSING ====================
export interface ClosingData {
  monthlySummary: string;
  highlights: string[];
  focusAreaNextMonth: string;
  targetTrafficGrowth: number;
  targetConversionImprovement: number;
  targetROAS: number;
}

// ==================== MOCK DATASET ====================
function kpi(value: number, previousValue: number): KPIValue {
  return { value, previousValue };
}

const overviewJan: OverviewData = {
  website: {
    objective: "Increase website traffic by 20% and improve conversion rates through SEO and content optimization.",
    sessions: kpi(45200, 38900),
    users: kpi(32100, 28400),
    conversionRate: kpi(3.2, 2.8),
    revenue: kpi(185000000, 156000000),
    avgDuration: kpi(195, 180),
  },
  tokopedia: {
    visitorToko: kpi(28500, 24200),
    visitorProduk: kpi(18700, 16100),
    soldProducts: kpi(1240, 1080),
    ratingToko: kpi(4.8, 4.7),
  },
  shopee: {
    visitorToko: kpi(35200, 31800),
    chatResponse: kpi(92, 88),
    conversionRate: kpi(4.1, 3.6),
    totalOrders: kpi(1850, 1620),
  },
  monthlyTarget: "Achieve Rp 500M combined revenue across all channels. Focus on improving ROAS above 5x for all paid channels.",
};

const overviewFeb: OverviewData = {
  website: {
    objective: "Scale paid campaigns and optimize landing pages for higher conversion.",
    sessions: kpi(48900, 45200),
    users: kpi(34800, 32100),
    conversionRate: kpi(3.5, 3.2),
    revenue: kpi(210000000, 185000000),
    avgDuration: kpi(205, 195),
  },
  tokopedia: {
    visitorToko: kpi(31200, 28500),
    visitorProduk: kpi(20500, 18700),
    soldProducts: kpi(1380, 1240),
    ratingToko: kpi(4.9, 4.8),
  },
  shopee: {
    visitorToko: kpi(38600, 35200),
    chatResponse: kpi(94, 92),
    conversionRate: kpi(4.5, 4.1),
    totalOrders: kpi(2050, 1850),
  },
  monthlyTarget: "Push for Rp 550M target. Launch Valentine campaign on Shopee & Tokopedia.",
};

const websitePerfJan: WebsitePerformanceData = {
  totalSessions: kpi(45200, 38900),
  totalUsers: kpi(32100, 28400),
  engagedSessions: kpi(28600, 24100),
  eventClickWA: kpi(1240, 980),
  avgDuration: kpi(195, 180),
  topKeywords: [
    { keyword: "skincare terbaik", sessions: 4200 },
    { keyword: "serum wajah", sessions: 3800 },
    { keyword: "cream pemutih", sessions: 2900 },
    { keyword: "sunscreen spf 50", sessions: 2400 },
    { keyword: "moisturizer kulit kering", sessions: 1800 },
  ],
  trafficSources: [
    { source: "Organic", sessions: 18900, percentage: 41.8 },
    { source: "Direct", sessions: 12400, percentage: 27.4 },
    { source: "Referral", sessions: 8200, percentage: 18.1 },
    { source: "Social", sessions: 5700, percentage: 12.6 },
  ],
};

const websitePerfFeb: WebsitePerformanceData = {
  totalSessions: kpi(48900, 45200),
  totalUsers: kpi(34800, 32100),
  engagedSessions: kpi(31200, 28600),
  eventClickWA: kpi(1450, 1240),
  avgDuration: kpi(205, 195),
  topKeywords: [
    { keyword: "skincare terbaik", sessions: 4800 },
    { keyword: "serum wajah", sessions: 4200 },
    { keyword: "valentine gift set", sessions: 3500 },
    { keyword: "sunscreen spf 50", sessions: 2800 },
    { keyword: "cream pemutih", sessions: 2600 },
  ],
  trafficSources: [
    { source: "Organic", sessions: 20500, percentage: 41.9 },
    { source: "Direct", sessions: 13200, percentage: 27.0 },
    { source: "Referral", sessions: 9100, percentage: 18.6 },
    { source: "Social", sessions: 6100, percentage: 12.5 },
  ],
};

const webstoreJan: WebstoreSalesData = {
  totalRevenue: 185000000,
  previousRevenue: 156000000,
  topProductsViewed: [
    { name: "Brightening Serum 30ml", sessions: 4200 },
    { name: "Daily Moisturizer SPF30", sessions: 3800 },
    { name: "Anti-Aging Night Cream", sessions: 3100 },
    { name: "Gentle Cleanser Foam", sessions: 2600 },
    { name: "Vitamin C Booster", sessions: 2200 },
  ],
  topProductsSold: [
    { name: "Brightening Serum 30ml", units: 320, price: 189000, revenue: 60480000 },
    { name: "Daily Moisturizer SPF30", units: 280, price: 145000, revenue: 40600000 },
    { name: "Gentle Cleanser Foam", units: 250, price: 98000, revenue: 24500000 },
    { name: "Anti-Aging Night Cream", units: 180, price: 225000, revenue: 40500000 },
    { name: "Vitamin C Booster", units: 150, price: 129000, revenue: 19350000 },
  ],
};

const webstoreFeb: WebstoreSalesData = {
  totalRevenue: 210000000,
  previousRevenue: 185000000,
  topProductsViewed: [
    { name: "Valentine Gift Set", sessions: 5200 },
    { name: "Brightening Serum 30ml", sessions: 4600 },
    { name: "Daily Moisturizer SPF30", sessions: 4100 },
    { name: "Anti-Aging Night Cream", sessions: 3400 },
    { name: "Gentle Cleanser Foam", sessions: 2800 },
  ],
  topProductsSold: [
    { name: "Valentine Gift Set", units: 420, price: 299000, revenue: 125580000 },
    { name: "Brightening Serum 30ml", units: 350, price: 189000, revenue: 66150000 },
    { name: "Daily Moisturizer SPF30", units: 300, price: 145000, revenue: 43500000 },
    { name: "Anti-Aging Night Cream", units: 200, price: 225000, revenue: 45000000 },
    { name: "Gentle Cleanser Foam", units: 270, price: 98000, revenue: 26460000 },
  ],
};

const marketplaceJan: MarketplaceData = {
  totalCombinedRevenue: 425000000,
  previousCombinedRevenue: 380000000,
  totalUnitsSold: 3090,
  previousUnitsSold: 2700,
  totalProductCount: 6,
  tokopedia: {
    revenue: 195000000, previousRevenue: 170000000, gmv: 220000000, previousGmv: 195000000, unitsSold: 1240, previousUnitsSold: 1050, visitors: 28500, previousVisitors: 25000, pageViews: 85200, previousPageViews: 75000,
    topProducts: [
      { name: "Brightening Serum 30ml", units: 280, revenue: 52920000 },
      { name: "Daily Moisturizer SPF30", units: 220, revenue: 31900000 },
      { name: "Gentle Cleanser Foam", units: 180, revenue: 17640000 },
    ],
  },
  shopee: {
    revenue: 230000000, previousRevenue: 210000000, orders: 1850, previousOrders: 1600, visitors: 35200, previousVisitors: 30000, pageViews: 95000, previousPageViews: 82000, productClick: 22400, previousProductClick: 19000, cancelledOrders: 85, previousCancelledOrders: 95,
    topProducts: [
      { name: "Brightening Serum 30ml", units: 350, revenue: 66150000 },
      { name: "Daily Moisturizer SPF30", units: 310, revenue: 44950000 },
      { name: "Anti-Aging Night Cream", units: 240, revenue: 54000000 },
    ],
  },
};

const marketplaceFeb: MarketplaceData = {
  totalCombinedRevenue: 480000000,
  previousCombinedRevenue: 425000000,
  totalUnitsSold: 3430,
  previousUnitsSold: 3090,
  totalProductCount: 6,
  tokopedia: {
    revenue: 215000000, previousRevenue: 195000000, gmv: 245000000, previousGmv: 220000000, unitsSold: 1380, previousUnitsSold: 1240, visitors: 31200, previousVisitors: 28500, pageViews: 92400, previousPageViews: 85200,
    topProducts: [
      { name: "Valentine Gift Set", units: 320, revenue: 95680000 },
      { name: "Brightening Serum 30ml", units: 300, revenue: 56700000 },
      { name: "Daily Moisturizer SPF30", units: 240, revenue: 34800000 },
    ],
  },
  shopee: {
    revenue: 265000000, previousRevenue: 230000000, orders: 2050, previousOrders: 1850, visitors: 38600, previousVisitors: 35200, pageViews: 105000, previousPageViews: 95000, productClick: 25800, previousProductClick: 22400, cancelledOrders: 72, previousCancelledOrders: 85,
    topProducts: [
      { name: "Valentine Gift Set", units: 380, revenue: 113620000 },
      { name: "Brightening Serum 30ml", units: 360, revenue: 68040000 },
      { name: "Daily Moisturizer SPF30", units: 330, revenue: 47850000 },
    ],
  },
};

const shopeeAdsJan: ShopeeAdsData = {
  impressions: kpi(520000, 440000),
  clicks: kpi(18200, 15400),
  ctr: kpi(3.5, 3.5),
  orders: kpi(890, 720),
  unitsSold: kpi(1240, 1020),
  revenueFromAds: kpi(145000000, 118000000),
  adSpend: kpi(28000000, 24000000),
  roas: 5.18,
  previousRoas: 4.92,
  products: [
    { name: "Brightening Serum 30ml", revenue: 42000000, unitsSold: 220, views: 85000, clicks: 4200, budget: 6500000 },
    { name: "Daily Moisturizer SPF30", revenue: 35000000, unitsSold: 240, views: 72000, clicks: 3800, budget: 5800000 },
    { name: "Anti-Aging Night Cream", revenue: 28000000, unitsSold: 125, views: 58000, clicks: 2900, budget: 5200000 },
    { name: "Gentle Cleanser Foam", revenue: 22000000, unitsSold: 225, views: 48000, clicks: 2400, budget: 4500000 },
    { name: "Vitamin C Booster", revenue: 18000000, unitsSold: 140, views: 42000, clicks: 2100, budget: 3800000 },
  ],
};

const shopeeAdsFeb: ShopeeAdsData = {
  impressions: kpi(610000, 520000),
  clicks: kpi(21500, 18200),
  ctr: kpi(3.52, 3.5),
  orders: kpi(1050, 890),
  unitsSold: kpi(1480, 1240),
  revenueFromAds: kpi(178000000, 145000000),
  adSpend: kpi(32000000, 28000000),
  roas: 5.56,
  previousRoas: 5.18,
  products: [
    { name: "Valentine Gift Set", revenue: 58000000, unitsSold: 195, views: 110000, clicks: 5800, budget: 8500000 },
    { name: "Brightening Serum 30ml", revenue: 48000000, unitsSold: 255, views: 92000, clicks: 4800, budget: 7200000 },
    { name: "Daily Moisturizer SPF30", revenue: 38000000, unitsSold: 260, views: 78000, clicks: 4100, budget: 6200000 },
    { name: "Anti-Aging Night Cream", revenue: 20000000, unitsSold: 90, views: 52000, clicks: 2600, budget: 4800000 },
    { name: "Gentle Cleanser Foam", revenue: 14000000, unitsSold: 180, views: 40000, clicks: 2200, budget: 3500000 },
  ],
};

const adsBudgetJan: AdsBudgetData = {
  google: { budget: 35000000, clicks: 22400, conversions: 680, revenue: 198000000 },
  meta: { budget: 25000000, clicks: 18600, conversions: 520, revenue: 142000000 },
  shopee: { budget: 28000000, clicks: 18200, conversions: 890, revenue: 145000000 },
};

const adsBudgetFeb: AdsBudgetData = {
  google: { budget: 38000000, clicks: 25800, conversions: 780, revenue: 225000000 },
  meta: { budget: 28000000, clicks: 21200, conversions: 610, revenue: 168000000 },
  shopee: { budget: 32000000, clicks: 21500, conversions: 1050, revenue: 178000000 },
};

const insightsJan: InsightsData = {
  keyInsights: [
    "Organic traffic grew 18% MoM driven by SEO improvements",
    "Shopee became the highest revenue channel for the first time",
    "WhatsApp click events increased 26.5% indicating strong purchase intent",
    "Tokopedia rating improved to 4.8 stars boosting trust signals",
  ],
  supportingFactors: [
    "Year-end campaign momentum carried into January",
    "New product launches attracted fresh traffic",
    "Improved page speed (2.1s → 1.4s) reduced bounce rate",
  ],
  limitingFactors: [
    "Meta Ads CPM increased 15% due to election season",
    "Stock shortage on top 2 SKUs for 5 days mid-month",
    "Shopee cancelled orders at 4.6% — above 3% target",
  ],
  bestChannel: "Shopee",
  achievementPercent: 85,
  insightSummary: "January showed strong growth across all channels with Shopee leading revenue. Key focus should be reducing cancelled orders and maintaining stock levels for top-performing SKUs.",
};

const insightsFeb: InsightsData = {
  keyInsights: [
    "Valentine Gift Set drove 35% of total webstore revenue",
    "Combined marketplace revenue crossed Rp 480M — new record",
    "Shopee Ads ROAS improved to 5.56x from 5.18x",
    "Website conversion rate reached 3.5% — highest in 6 months",
  ],
  supportingFactors: [
    "Valentine campaign executed across all channels simultaneously",
    "Gift set bundling strategy increased average order value 22%",
    "Shopee Flash Sale participation boosted visibility",
  ],
  limitingFactors: [
    "Google Ads CPC increased 8% in beauty category",
    "Logistics delays in Kalimantan & Sulawesi regions",
    "Chat response rate still below 95% target",
  ],
  bestChannel: "Shopee",
  achievementPercent: 92,
  insightSummary: "February was an exceptional month driven by Valentine campaign success. Gift set strategy proved highly effective and should be replicated for upcoming seasonal events.",
};

const recommendationsJan: RecommendationsData = {
  optimasiWebsite: [
    "Implement structured data markup for product pages",
    "Add exit-intent popup with discount offer",
    "Optimize mobile checkout flow — reduce steps from 4 to 2",
    "Create comparison landing pages for top keywords",
  ],
  optimasiMarketplace: [
    "Update product photos with lifestyle imagery",
    "Implement auto-reply chatbot for common questions",
    "Increase Shopee Flash Sale participation frequency",
    "Bundle top products as gift sets for Valentine season",
  ],
  actionPlan30: [
    { action: "Launch Valentine campaign creative across all channels", tag: "Campaign" },
    { action: "Fix mobile checkout UX issues identified in heatmap", tag: "UX" },
    { action: "Increase Shopee Ads budget by 15% for top performers", tag: "Ads" },
  ],
  actionPlan60: [
    { action: "Implement product recommendation engine on website", tag: "UX" },
    { action: "Launch SEO content hub for skincare education", tag: "SEO" },
    { action: "A/B test Meta Ads creative formats (video vs carousel)", tag: "Ads" },
  ],
  actionPlan90: [
    { action: "Build loyalty program with points system", tag: "Campaign" },
    { action: "Expand to TikTok Shop marketplace", tag: "Campaign" },
    { action: "Develop mobile app MVP for repeat customers", tag: "UX" },
  ],
};

const recommendationsFeb: RecommendationsData = {
  optimasiWebsite: [
    "Implement A/B testing on product page layouts",
    "Add video reviews section to build social proof",
    "Create Ramadan-themed landing page",
    "Improve site search with autocomplete suggestions",
  ],
  optimasiMarketplace: [
    "Prepare Ramadan bundle products for March campaign",
    "Optimize product titles with trending search keywords",
    "Improve Shopee chat response time with quick-reply templates",
    "Register for Tokopedia Ramadan Sale event",
  ],
  actionPlan30: [
    { action: "Launch early Ramadan awareness campaign", tag: "Campaign" },
    { action: "Optimize Google Ads landing pages for lower CPC", tag: "Ads" },
    { action: "Implement quick-reply templates for Shopee chat", tag: "UX" },
  ],
  actionPlan60: [
    { action: "Full Ramadan campaign execution across all channels", tag: "Campaign" },
    { action: "Publish 10 SEO-optimized blog articles", tag: "SEO" },
    { action: "Test TikTok Ads for awareness campaigns", tag: "Ads" },
  ],
  actionPlan90: [
    { action: "Post-Ramadan retention campaign with loyalty points", tag: "Campaign" },
    { action: "Launch influencer partnership program", tag: "Campaign" },
    { action: "Website redesign Phase 1 — homepage & product pages", tag: "UX" },
  ],
};

const closingJan: ClosingData = {
  monthlySummary: "January 2024 delivered solid performance across all digital channels with a combined revenue of Rp 610M. Organic traffic growth of 18% and marketplace expansion indicate strong brand momentum heading into Q1.",
  highlights: [
    "Shopee revenue exceeded Tokopedia for the first time",
    "Website conversion rate improved to 3.2%",
    "WhatsApp engagement up 26.5%",
    "Tokopedia store rating reached 4.8 stars",
  ],
  focusAreaNextMonth: "Valentine campaign execution, mobile checkout optimization, and Shopee Ads ROAS improvement are the three critical focus areas for February.",
  targetTrafficGrowth: 15,
  targetConversionImprovement: 10,
  targetROAS: 5.5,
};

const closingFeb: ClosingData = {
  monthlySummary: "February 2024 was a record-breaking month with Rp 690M combined revenue driven by the Valentine Gift Set campaign. All KPIs showed improvement with the achievement rate reaching 92% of targets.",
  highlights: [
    "Valentine Gift Set became #1 product across all channels",
    "Combined marketplace revenue hit Rp 480M — new record",
    "Shopee Ads ROAS improved to 5.56x",
    "Website conversion rate peaked at 3.5%",
  ],
  focusAreaNextMonth: "Ramadan campaign preparation, expanding to TikTok Shop, and reducing Shopee cancelled orders below 3%.",
  targetTrafficGrowth: 20,
  targetConversionImprovement: 12,
  targetROAS: 6.0,
};

const roiRevenueJanPipeline = [
  { projectName: "PT Mandiri Konstruksi", project: "Non-Gov" as const, leadSource: "Google Ads", stage: "Won" as const, estimatedRevenue: 450000000 },
  { projectName: "Dinas Kesehatan Jabar", project: "Gov" as const, leadSource: "Website", stage: "Qualified" as const, estimatedRevenue: 320000000 },
  { projectName: "RS Premier Bintaro", project: "Non-Gov" as const, leadSource: "Referral", stage: "Processing" as const, estimatedRevenue: 280000000 },
  { projectName: "PT Astra Infra", project: "Non-Gov" as const, leadSource: "Meta Ads", stage: "Qualified" as const, estimatedRevenue: 520000000 },
  { projectName: "Kemenkes RI", project: "Gov" as const, leadSource: "Website", stage: "Processing" as const, estimatedRevenue: 180000000 },
];
const roiRevenueJan: ROIRevenueData = {
  b2bLeads: kpi(24, 18),
  b2gLeads: kpi(8, 5),
  totalLeads: kpi(32, 23),
  estimatedRevenue: kpi(roiRevenueJanPipeline.reduce((s, l) => s + l.estimatedRevenue, 0), 1200000000),
  investment: { ads: 53000000, websiteSEO: 12000000, maintenanceWebSosmed: 8000000 },
  actualMarketplaceRevenue: 425000000,
  leadPipeline: roiRevenueJanPipeline,
  insightSummary: "January generated 32 total leads with Rp 1.75B estimated pipeline value. B2B leads dominate the funnel with Google Ads and Website as top-performing lead sources. Two deals are in qualified stage worth Rp 840M combined.",
};

const roiRevenueFebPipeline = [
  { projectName: "PT Mandiri Konstruksi", project: "Non-Gov" as const, leadSource: "Google Ads", stage: "Won" as const, estimatedRevenue: 450000000 },
  { projectName: "Dinas Kesehatan Jabar", project: "Gov" as const, leadSource: "Website", stage: "Won" as const, estimatedRevenue: 320000000 },
  { projectName: "RS Premier Bintaro", project: "Non-Gov" as const, leadSource: "Referral", stage: "Qualified" as const, estimatedRevenue: 280000000 },
  { projectName: "PT Astra Infra", project: "Non-Gov" as const, leadSource: "Meta Ads", stage: "Won" as const, estimatedRevenue: 520000000 },
  { projectName: "Kemenkes RI", project: "Gov" as const, leadSource: "Website", stage: "Qualified" as const, estimatedRevenue: 180000000 },
  { projectName: "PT Pelindo III", project: "Non-Gov" as const, leadSource: "Google Ads", stage: "Processing" as const, estimatedRevenue: 600000000 },
];
const roiRevenueFeb: ROIRevenueData = {
  b2bLeads: kpi(31, 24),
  b2gLeads: kpi(11, 8),
  totalLeads: kpi(42, 32),
  estimatedRevenue: kpi(roiRevenueFebPipeline.reduce((s, l) => s + l.estimatedRevenue, 0), roiRevenueJanPipeline.reduce((s, l) => s + l.estimatedRevenue, 0)),
  investment: { ads: 60000000, websiteSEO: 14000000, maintenanceWebSosmed: 9000000 },
  actualMarketplaceRevenue: 480000000,
  leadPipeline: roiRevenueFebPipeline,
  insightSummary: "February saw a 31% increase in total leads (42 vs 32). Three deals closed worth Rp 1.29B. The Valentine campaign indirectly boosted B2B inquiries through increased brand visibility. Projected digital ROI stands at a healthy level with marketplace ROAS at 5.78x.",
};

// ==================== BENCHMARK E-COMMERCE & WEBSTORE ====================
export interface BenchmarkChannelData {
  channel: string;
  traffic: number;
  targetTraffic: number;
  conversionRate: number;
  targetCR: number;
  achievement: number;
}

export interface BenchmarkData {
  channels: BenchmarkChannelData[];
}

const benchmarkJan: BenchmarkData = {
  channels: [
    { channel: "Tokopedia", traffic: 28500, targetTraffic: 30000, conversionRate: 4.4, targetCR: 4.0, achievement: 95.0 },
    { channel: "Shopee", traffic: 35200, targetTraffic: 33000, conversionRate: 4.1, targetCR: 4.5, achievement: 106.7 },
    { channel: "Webstore", traffic: 45200, targetTraffic: 50000, conversionRate: 3.2, targetCR: 3.5, achievement: 90.4 },
  ],
};

const benchmarkFeb: BenchmarkData = {
  channels: [
    { channel: "Tokopedia", traffic: 31200, targetTraffic: 32000, conversionRate: 4.8, targetCR: 4.2, achievement: 97.5 },
    { channel: "Shopee", traffic: 38600, targetTraffic: 36000, conversionRate: 4.5, targetCR: 4.5, achievement: 107.2 },
    { channel: "Webstore", traffic: 48900, targetTraffic: 52000, conversionRate: 3.5, targetCR: 3.8, achievement: 94.0 },
  ],
};

const benchmarkMap: MonthlyDataMap<BenchmarkData> = { January: benchmarkJan, February: benchmarkFeb };

// ==================== GOOGLE ADS DETAIL ====================
const googleAdsJan: PlatformAdsDetailData = {
  cost: 35000000, previousCost: 32000000,
  impressions: 125000, previousImpressions: 108000,
  clicks: 22400, previousClicks: 19800,
  conversions: 680, previousConversions: 610,
  ctr: 17.92, previousCtr: 18.33,
  convRate: 3.04, previousConvRate: 3.08,
  avgCpm: 280000, previousAvgCpm: 296296,
  avgCpc: 1563, previousAvgCpc: 1616,
  costPerConv: 51471, previousCostPerConv: 52459,
  revenue: 0, previousRevenue: 0,
  campaigns: [
    { name: "K/Kemicraft - Industry", cost: 22500000, convRate: 3.2, conversions: 480, costPerConv: 46875 },
    { name: "K/Kemicraft - Tools", cost: 7200000, convRate: 2.8, conversions: 120, costPerConv: 60000 },
    { name: "K/Kemicraft - Hama", cost: 3800000, convRate: 2.9, conversions: 55, costPerConv: 69091 },
    { name: "K/Kemicraft - Malaria", cost: 1500000, convRate: 4.0, conversions: 25, costPerConv: 60000 },
  ],
  insight: "Di bulan Januari dengan peningkatan budget +9%, campaign Google Ads berhasil meningkatkan jangkauan secara signifikan.\n\nImpressions naik +16% dan clicks naik +13%, meskipun CTR sedikit menurun -2%. Hal ini menunjukkan bahwa ads menjangkau audiens lebih luas.\n\nKonversi meningkat +11% dengan cost per conversion turun -2%, membuktikan campaign tetap cost-effective dan optimal.",
};

const googleAdsFeb: PlatformAdsDetailData = {
  cost: 38000000, previousCost: 35000000,
  impressions: 142000, previousImpressions: 125000,
  clicks: 25800, previousClicks: 22400,
  conversions: 780, previousConversions: 680,
  ctr: 18.17, previousCtr: 17.92,
  convRate: 3.02, previousConvRate: 3.04,
  avgCpm: 267606, previousAvgCpm: 280000,
  avgCpc: 1473, previousAvgCpc: 1563,
  costPerConv: 48718, previousCostPerConv: 51471,
  revenue: 0, previousRevenue: 0,
  campaigns: [
    { name: "K/Kemicraft - Industry", cost: 24000000, convRate: 3.3, conversions: 540, costPerConv: 44444 },
    { name: "K/Kemicraft - Tools", cost: 8200000, convRate: 2.9, conversions: 145, costPerConv: 56552 },
    { name: "K/Kemicraft - Hama", cost: 4100000, convRate: 2.7, conversions: 65, costPerConv: 63077 },
    { name: "K/Kemicraft - Malaria", cost: 1700000, convRate: 5.0, conversions: 30, costPerConv: 56667 },
  ],
  insight: "Februari menunjukkan peningkatan efisiensi campaign Google Ads secara keseluruhan.\n\nDengan budget naik +9%, impressions meningkat +14% dan clicks naik +15%. CTR membaik ke 18.17% dari 17.92%.\n\nCost per conversion turun -5% ke Rp48,718 yang membuktikan optimalisasi bidding strategy berhasil. Campaign Industry tetap menjadi kontributor terbesar dengan 69% total conversions.",
};

// ==================== META ADS DETAIL ====================
const metaAdsJan: PlatformAdsDetailData = {
  cost: 25000000, previousCost: 23000000,
  impressions: 95000, previousImpressions: 81000,
  clicks: 18600, previousClicks: 16700,
  conversions: 520, previousConversions: 480,
  ctr: 19.58, previousCtr: 20.62,
  convRate: 2.80, previousConvRate: 2.87,
  avgCpm: 263158, previousAvgCpm: 283951,
  avgCpc: 1344, previousAvgCpc: 1377,
  costPerConv: 48077, previousCostPerConv: 47917,
  revenue: 0, previousRevenue: 0,
  campaigns: [
    { name: "K/Kemicraft - Industry", cost: 16500000, convRate: 3.0, conversions: 370, costPerConv: 44595 },
    { name: "K/Kemicraft - Brand Awareness", cost: 5200000, convRate: 2.4, conversions: 95, costPerConv: 54737 },
    { name: "K/Kemicraft - Retargeting", cost: 2300000, convRate: 3.5, conversions: 40, costPerConv: 57500 },
    { name: "K/Kemicraft - Lookalike", cost: 1000000, convRate: 2.0, conversions: 15, costPerConv: 66667 },
  ],
  insight: "Di bulan Januari, campaign Meta Ads mencatatkan peningkatan jangkauan yang solid.\n\nImpressions naik +17% dan clicks naik +11%, meskipun CTR menurun -5%. Penurunan CTR mengindikasikan ads menjangkau audiens lebih luas namun relevansinya sedikit berkurang.\n\nMeskipun demikian, jumlah konversi meningkat +8% dengan biaya per konversi relatif stabil, membuktikan campaign tetap memberikan hasil yang optimal.",
};

const metaAdsFeb: PlatformAdsDetailData = {
  cost: 28000000, previousCost: 25000000,
  impressions: 112000, previousImpressions: 95000,
  clicks: 21200, previousClicks: 18600,
  conversions: 610, previousConversions: 520,
  ctr: 18.93, previousCtr: 19.58,
  convRate: 2.88, previousConvRate: 2.80,
  avgCpm: 250000, previousAvgCpm: 263158,
  avgCpc: 1321, previousAvgCpc: 1344,
  costPerConv: 45902, previousCostPerConv: 48077,
  revenue: 0, previousRevenue: 0,
  campaigns: [
    { name: "K/Kemicraft - Industry", cost: 18000000, convRate: 3.1, conversions: 420, costPerConv: 42857 },
    { name: "K/Kemicraft - Brand Awareness", cost: 5800000, convRate: 2.5, conversions: 110, costPerConv: 52727 },
    { name: "K/Kemicraft - Retargeting", cost: 2800000, convRate: 3.8, conversions: 55, costPerConv: 50909 },
    { name: "K/Kemicraft - Lookalike", cost: 1400000, convRate: 2.3, conversions: 25, costPerConv: 56000 },
  ],
  insight: "Februari menunjukkan peningkatan signifikan pada efisiensi Meta Ads campaign.\n\nDengan budget naik +12%, impressions meningkat +18% dan clicks naik +14%. Cost per conversion turun -5% ke Rp45,902.\n\nCampaign Retargeting mencatat conversion rate tertinggi (3.8%) meskipun budget-nya kecil. Rekomendasi untuk alokasi budget lebih besar ke retargeting di bulan selanjutnya.",
};

// ==================== MARCH 2026 — FROM PDF REPORT ====================
const googleAdsMar: PlatformAdsDetailData = {
  cost: 4702388, previousCost: 4478000,
  impressions: 8160, previousImpressions: 9100,
  clicks: 632, previousClicks: 665,
  conversions: 138, previousConversions: 108,
  ctr: 7.75, previousCtr: 7.75,
  convRate: 21.84, previousConvRate: 16.24,
  avgCpm: 576273, previousAvgCpm: 605714,
  avgCpc: 7440, previousAvgCpc: 7825,
  costPerConv: 34075, previousCostPerConv: 41463,
  revenue: 0, previousRevenue: 0,
  campaigns: [
    { name: "K/Kemicraft - Industry", cost: 4036146, convRate: 22.95, conversions: 123, costPerConv: 32814 },
    { name: "K/Kemicraft - Hama", cost: 640786, convRate: 15.22, conversions: 14, costPerConv: 45770 },
    { name: "K/Kemicraft - Malaria", cost: 25456, convRate: 25, conversions: 1, costPerConv: 25456 },
    { name: "K/Kemicraft - Tools", cost: 0, convRate: 0, conversions: 0, costPerConv: 0 },
  ],
  insight: "Pada bulan Maret menjadi bulan yang cukup baik untuk campaign pada platform Google, dikarenakan terjadi peningkatan pada setiap keymetrics, meskipun budget spending yang bisa dikatakan stabil dari bulan sebelumnya.\n\nHal ini dapat terjadi dikarenakan campaign bisa digolongkan sudah melewati fase learning setelah di beberapa bulan terakhir sempat berhenti dan mendapatkan pengurangan budget iklan yang cukup signifikan.\n\nHasil pada bulan Maret menjadi conversion paling tinggi (Highest record 138) dalam periode berjalannya campaign pada platform Google, dengan conversion rate yang juga sangat tinggi mendekati 22%.",
};

const metaAdsMar: PlatformAdsDetailData = {
  cost: 1531058, previousCost: 1988000,
  impressions: 132276, previousImpressions: 159400,
  clicks: 2447, previousClicks: 3263,
  conversions: 96, previousConversions: 113,
  ctr: 2.04, previousCtr: 2.40,
  convRate: 7.36, previousConvRate: 7.21,
  avgCpm: 15558, previousAvgCpm: 15860,
  avgCpc: 1046, previousAvgCpc: 1204,
  costPerConv: 15949, previousCostPerConv: 17593,
  revenue: 0, previousRevenue: 0,
  landingPageView: 1305, previousLandingPageView: 1975,
  lpvRate: 57.62, previousLpvRate: 60.53,
  costPerLpv: 1746, previousCostPerLpv: 1840,
  campaigns: [
    { name: "K/Kemicraft - Pest Control (broad)", cost: 763428, convRate: 7.94, conversions: 55, costPerConv: 13881, impressions: 71023, landingPageViews: 693 },
    { name: "K/Kemicraft - Car enthusiast", cost: 707952, convRate: 6.47, conversions: 38, costPerConv: 18630, impressions: 57677, landingPageViews: 587 },
    { name: "K/Kemicraft - Farm", cost: 59678, convRate: 12.00, conversions: 3, costPerConv: 19893, impressions: 3576, landingPageViews: 25 },
  ],
  insight: "Pada Campaign Meta, terjadi penurunan pada tiap keymetrics, hal ini terjadi dikarenakan faktor utama (spending) berkurang cukup tinggi yaitu 23%.\n\nMeskipun demikian penurunan yang terjadi tidak terlalu tinggi (under 15% avg.).\n\nCVR yang sangat tinggi di angka lebih dari 7% tetap bertahan meskipun budget spend yang berkurang ini menandakan bahwa sebagian besar audience tetap melakukan action yang sangat tinggi terhadap campaign kemika.",
};

// ==================== APRIL 2026 — FROM PDF REPORT ====================
const googleAdsApr: PlatformAdsDetailData = {
  cost: 4375019, previousCost: 4700000,
  impressions: 7943, previousImpressions: 8188,
  clicks: 698, previousClicks: 634,
  conversions: 174, previousConversions: 138,
  ctr: 8.79, previousCtr: 7.74,
  convRate: 24.93, previousConvRate: 21.77,
  avgCpm: 550802, previousAvgCpm: 573800,
  avgCpc: 6268, previousAvgCpc: 7413,
  costPerConv: 25144, previousCostPerConv: 34058,
  revenue: 0, previousRevenue: 0,
  campaigns: [
    { name: "K/Kemicraft - Industry", cost: 4143763, convRate: 24.2, conversions: 158, costPerConv: 26226 },
    { name: "K/Kemicraft - Hama", cost: 212822, convRate: 26.19, conversions: 11, costPerConv: 19347 },
    { name: "K/Kemicraft - Malaria", cost: 18434, convRate: 166.67, conversions: 5, costPerConv: 3687 },
    { name: "K/Kemicraft - Tools", cost: 0, convRate: 0, conversions: 0, costPerConv: 0 },
  ],
  insight: "Meskipun impressions sedikit menurun (-3%), campaign menunjukkan peningkatan kualitas performa yang signifikan, terlihat dari kenaikan CTR (+13%) dan conversion rate (+14%) yang mengindikasikan traffic lebih relevan dan memiliki intent tinggi.\n\nEfisiensi juga semakin optimal dengan penurunan CPC (-16%) dan cost per conversion (-26%), sehingga total conversions meningkat cukup kuat (+26%).\n\nHal ini menunjukkan bahwa meskipun dengan budget yang lebih rendah, campaign tetap mampu menghasilkan performa yang lebih efektif dan efisien secara keseluruhan.",
};

const metaAdsApr: PlatformAdsDetailData = {
  cost: 1777421, previousCost: 1531397,
  impressions: 87461, previousImpressions: 132300,
  clicks: 1411, previousClicks: 2523,
  conversions: 106, previousConversions: 96,
  ctr: 2.11, previousCtr: 3.24,
  convRate: 14.60, previousConvRate: 7.37,
  avgCpm: 25223, previousAvgCpm: 15630,
  avgCpc: 1501, previousAvgCpc: 1047,
  costPerConv: 16768, previousCostPerConv: 15952,
  revenue: 0, previousRevenue: 0,
  landingPageView: 726, previousLandingPageView: 1173,
  lpvRate: 57.75, previousLpvRate: 57.75,
  costPerLpv: 2828, previousCostPerLpv: 2828,
  campaigns: [
    { name: "K/Kemicraft - Car enthusiast", cost: 960553, convRate: 13.46, conversions: 56, costPerConv: 17153, impressions: 53693, landingPageViews: 416 },
    { name: "K/Kemicraft - Pest Control (broad)", cost: 816868, convRate: 16.13, conversions: 50, costPerConv: 16337, impressions: 33768, landingPageViews: 310 },
  ],
  insight: "Meskipun budget meningkat (+16%), terjadi penurunan pada impressions dan klik akibat kenaikan biaya iklan (CPM & CPC) yang cukup signifikan, sehingga jangkauan menjadi lebih terbatas.\n\nNamun, kualitas traffic tetap terjaga dengan LPV Rate yang stabil dan peningkatan CVR (+98%), yang mendorong total konversi tetap tumbuh (+10%).\n\nHal ini menunjukkan bahwa campaign masih efektif di bagian bawah funnel, meskipun efisiensi di bagian atas funnel menurun.",
};

const googleAdsMap: MonthlyDataMap<PlatformAdsDetailData> = { January: googleAdsJan, February: googleAdsFeb, March: googleAdsMar, April: googleAdsApr };
const metaAdsMap: MonthlyDataMap<PlatformAdsDetailData> = { January: metaAdsJan, February: metaAdsFeb, March: metaAdsMar, April: metaAdsApr };

// ==================== DATA ACCESS ====================
type MonthlyDataMap<T> = Partial<Record<Month, T>>;

const overviewMap: MonthlyDataMap<OverviewData> = { January: overviewJan, February: overviewFeb };
const websitePerfMap: MonthlyDataMap<WebsitePerformanceData> = { January: websitePerfJan, February: websitePerfFeb };
const webstoreMap: MonthlyDataMap<WebstoreSalesData> = { January: webstoreJan, February: webstoreFeb };
const marketplaceMap: MonthlyDataMap<MarketplaceData> = { January: marketplaceJan, February: marketplaceFeb };
const shopeeAdsMap: MonthlyDataMap<ShopeeAdsData> = { January: shopeeAdsJan, February: shopeeAdsFeb };
const adsBudgetMap: MonthlyDataMap<AdsBudgetData> = { January: adsBudgetJan, February: adsBudgetFeb };
const insightsMap: MonthlyDataMap<InsightsData> = { January: insightsJan, February: insightsFeb };
const recommendationsMap: MonthlyDataMap<RecommendationsData> = { January: recommendationsJan, February: recommendationsFeb };
const closingMap: MonthlyDataMap<ClosingData> = { January: closingJan, February: closingFeb };
const roiRevenueMap: MonthlyDataMap<ROIRevenueData> = { January: roiRevenueJan, February: roiRevenueFeb };

// ==================== QUARTERLY INSIGHT ====================
export interface QuarterlyInsightData {
  quarter: "Q1" | "Q2" | "Q3" | "Q4";
  year: number;
  months: [string, string, string];
  totalAdSpend: number;
  totalRevenue: number;
  blendedROAS: number;
  totalTraffic: number;
  avgConversionRate: number;
  achievementPercent: number;
  prevQuarterRevenue: number;
  prevQuarterAdSpend: number;
  prevQuarterROAS: number;
  monthTrend: { month: string; revenue: number; adSpend: number; traffic: number }[];
  channels: { name: string; revenue: number; traffic: number; conversionRate: number; contribution: number }[];
  wins: string[];
  challenges: string[];
  nextQuarterFocus: string[];
  summary: string;
}

const quarterlyInsightQ1: QuarterlyInsightData = {
  quarter: "Q1", year: 2026, months: ["January", "February", "March"],
  totalAdSpend: 14500000, totalRevenue: 278000000, blendedROAS: 19.2,
  totalTraffic: 38400, avgConversionRate: 2.4, achievementPercent: 85,
  prevQuarterRevenue: 315000000, prevQuarterAdSpend: 17000000, prevQuarterROAS: 18.5,
  monthTrend: [
    { month: "Jan", revenue: 85000000, adSpend: 4800000, traffic: 12000 },
    { month: "Feb", revenue: 98000000, adSpend: 5100000, traffic: 13500 },
    { month: "Mar", revenue: 95000000, adSpend: 4600000, traffic: 12900 },
  ],
  channels: [
    { name: "Webstore", revenue: 120000000, traffic: 18000, conversionRate: 3.2, contribution: 43 },
    { name: "Tokopedia", revenue: 95000000, traffic: 12500, conversionRate: 2.1, contribution: 34 },
    { name: "Shopee", revenue: 63000000, traffic: 7900, conversionRate: 1.8, contribution: 23 },
  ],
  wins: [
    "Webstore conversion rate meningkat ke 3.2% — tertinggi sepanjang sejarah channel ini.",
    "Google Ads berhasil menurunkan CPC sebesar 18% dibanding Q4 2025 melalui optimasi audience targeting.",
    "Kampanye Harbolnas Februari menghasilkan spike traffic +42% di Shopee dan Tokopedia.",
  ],
  challenges: [
    "Revenue Q1 turun 11.7% dibanding Q4 2025 akibat pola musiman pasca-akhir tahun yang lebih sepi.",
    "Meta Ads mengalami penurunan CTR di bulan Maret — konten iklan perlu direfresh.",
    "Closing rate dari lead B2B masih rendah di 14% — funnel perlu diperkuat di stage Qualified.",
  ],
  nextQuarterFocus: [
    "Tingkatkan budget Google Ads 20% untuk kuartal Ramadan & Lebaran (Q2) yang biasanya peak season.",
    "Refresh creative Meta Ads dengan pendekatan video-first untuk memperbaiki CTR.",
    "Implementasi live chat di Webstore untuk mengurangi cart abandonment dan mendorong CR ke 3.5%.",
  ],
  summary: "Q1 2026 menunjukkan performa yang solid meskipun berada di periode post-holiday. Webstore memimpin sebagai channel terkuat dengan CR tertinggi, sementara channel marketplace stabil. Fokus Q2 harus diarahkan pada momentum Ramadan untuk menutup gap pencapaian dan melampaui performa Q4 2025.",
};

const quarterlyInsightQ2: QuarterlyInsightData = {
  quarter: "Q2", year: 2026, months: ["April", "May", "June"],
  totalAdSpend: 18200000, totalRevenue: 342000000, blendedROAS: 18.8,
  totalTraffic: 47800, avgConversionRate: 2.6, achievementPercent: 94,
  prevQuarterRevenue: 278000000, prevQuarterAdSpend: 14500000, prevQuarterROAS: 19.2,
  monthTrend: [
    { month: "Apr", revenue: 108000000, adSpend: 5800000, traffic: 14800 },
    { month: "May", revenue: 118000000, adSpend: 6300000, traffic: 16500 },
    { month: "Jun", revenue: 116000000, adSpend: 6100000, traffic: 16500 },
  ],
  channels: [
    { name: "Webstore", revenue: 148000000, traffic: 21000, conversionRate: 3.5, contribution: 43 },
    { name: "Tokopedia", revenue: 118000000, traffic: 15800, conversionRate: 2.3, contribution: 35 },
    { name: "Shopee", revenue: 76000000, traffic: 11000, conversionRate: 2.0, contribution: 22 },
  ],
  wins: [
    "Revenue tumbuh 23% QoQ — periode Ramadan & Lebaran (Mei) menjadi bulan terkuat sepanjang tahun.",
    "Kampanye Super Sale Tokopedia berhasil menghasilkan 1,200+ orders dalam 3 hari — rekor tertinggi.",
    "Webstore mencapai CR 3.5% di bulan Mei, melampaui target 3% untuk pertama kalinya.",
  ],
  challenges: [
    "ROAS turun dari 19.2 di Q1 ke 18.8 — peningkatan spend Ramadan belum sepenuhnya efisien.",
    "Shopee CR masih di bawah target 2.5% meski traffic meningkat — perlu optimasi halaman produk.",
    "Biaya iklan peak season (Lebaran) naik 30% sehingga menekan margin campaign.",
  ],
  nextQuarterFocus: [
    "Manfaatkan momentum post-Lebaran untuk program loyalty dan retargeting pelanggan baru Q2.",
    "Optimalkan halaman produk Shopee (gambar, deskripsi, review) untuk mendorong CR ke 2.5%.",
    "Diversifikasi konten organik (SEO & media sosial) untuk mengurangi ketergantungan pada paid ads.",
  ],
  summary: "Q2 2026 adalah kuartal terkuat dengan revenue Rp 342 juta — naik 23% dari Q1. Momentum Ramadan berhasil dimanfaatkan dengan baik melalui kampanye yang tepat sasaran. Tantangan utama adalah menjaga efisiensi spend saat biaya iklan naik di peak season. Q3 perlu fokus pada retensi pelanggan baru yang acquired di Q2.",
};

const quarterlyInsightMap: Record<string, QuarterlyInsightData> = {
  q1: quarterlyInsightQ1,
  q2: quarterlyInsightQ2,
};

export function getQuarterlyInsightData(quarter: string): QuarterlyInsightData | undefined {
  return quarterlyInsightMap[quarter.toLowerCase()];
}

export function getOverviewData(month: Month): OverviewData | undefined { return overviewMap[month]; }
export function getWebsitePerformanceData(month: Month): WebsitePerformanceData | undefined { return websitePerfMap[month]; }
export function getWebstoreSalesData(month: Month): WebstoreSalesData | undefined { return webstoreMap[month]; }
export function getMarketplaceData(month: Month): MarketplaceData | undefined { return marketplaceMap[month]; }
export function getShopeeAdsData(month: Month): ShopeeAdsData | undefined { return shopeeAdsMap[month]; }
export function getAdsBudgetData(month: Month): AdsBudgetData | undefined { return adsBudgetMap[month]; }
export function getInsightsData(month: Month): InsightsData | undefined { return insightsMap[month]; }
export function getRecommendationsData(month: Month): RecommendationsData | undefined { return recommendationsMap[month]; }
export function getClosingData(month: Month): ClosingData | undefined { return closingMap[month]; }
export function getROIRevenueData(month: Month): ROIRevenueData | undefined { return roiRevenueMap[month]; }
export function getBenchmarkData(month: Month): BenchmarkData | undefined { return benchmarkMap[month]; }
export function getGoogleAdsData(month: Month): PlatformAdsDetailData | undefined { return googleAdsMap[month]; }
export function getMetaAdsData(month: Month): PlatformAdsDetailData | undefined { return metaAdsMap[month]; }
