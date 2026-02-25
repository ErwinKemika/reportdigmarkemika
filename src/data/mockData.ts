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
export interface WebstoreSalesData {
  totalRevenue: number;
  previousRevenue: number;
  topProductsViewed: { name: string; sessions: number }[];
  topProductsSold: { name: string; units: number; price: number; revenue: number }[];
}

// ==================== PAGE 4 — MARKETPLACE OVERVIEW ====================
export interface MarketplaceData {
  totalCombinedRevenue: number;
  previousCombinedRevenue: number;
  totalUnitsSold: number;
  previousUnitsSold: number;
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
    productClick: number;
    previousProductClick: number;
    cancelledOrders: number;
    previousCancelledOrders: number;
    topProducts: { name: string; units: number; revenue: number }[];
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
  }[];
}

// ==================== PAGE 6 — ADS BUDGET ====================
export interface AdsBudgetData {
  google: { budget: number; clicks: number; conversions: number; revenue: number };
  meta: { budget: number; clicks: number; conversions: number; revenue: number };
  shopee: { budget: number; clicks: number; conversions: number; revenue: number };
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
  optimasiWebsite: string[];
  optimasiMarketplace: string[];
  actionPlan30: { action: string; tag: string }[];
  actionPlan60: { action: string; tag: string }[];
  actionPlan90: { action: string; tag: string }[];
}

// ==================== PAGE 10 — ROI & REVENUE IMPACT ====================
export interface ROIRevenueData {
  b2bLeads: KPIValue;
  b2gLeads: KPIValue;
  totalLeads: KPIValue;
  estimatedRevenue: KPIValue;
  investment: {
    socialAds: number;
    websiteSEO: number;
    webstoreOps: number;
    marketplaceAds: number;
  };
  actualMarketplaceRevenue: number;
  leadPipeline: {
    projectName: string;
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
  tokopedia: {
    revenue: 195000000, previousRevenue: 170000000, gmv: 220000000, previousGmv: 195000000, unitsSold: 1240, previousUnitsSold: 1050, visitors: 28500, previousVisitors: 25000, pageViews: 85200, previousPageViews: 75000,
    topProducts: [
      { name: "Brightening Serum 30ml", units: 280, revenue: 52920000 },
      { name: "Daily Moisturizer SPF30", units: 220, revenue: 31900000 },
      { name: "Gentle Cleanser Foam", units: 180, revenue: 17640000 },
    ],
  },
  shopee: {
    revenue: 230000000, previousRevenue: 210000000, orders: 1850, previousOrders: 1600, visitors: 35200, previousVisitors: 30000, productClick: 22400, previousProductClick: 19000, cancelledOrders: 85, previousCancelledOrders: 95,
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
  tokopedia: {
    revenue: 215000000, previousRevenue: 195000000, gmv: 245000000, previousGmv: 220000000, unitsSold: 1380, previousUnitsSold: 1240, visitors: 31200, previousVisitors: 28500, pageViews: 92400, previousPageViews: 85200,
    topProducts: [
      { name: "Valentine Gift Set", units: 320, revenue: 95680000 },
      { name: "Brightening Serum 30ml", units: 300, revenue: 56700000 },
      { name: "Daily Moisturizer SPF30", units: 240, revenue: 34800000 },
    ],
  },
  shopee: {
    revenue: 265000000, previousRevenue: 230000000, orders: 2050, previousOrders: 1850, visitors: 38600, previousVisitors: 35200, productClick: 25800, previousProductClick: 22400, cancelledOrders: 72, previousCancelledOrders: 85,
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

const roiRevenueJan: ROIRevenueData = {
  b2bLeads: kpi(24, 18),
  b2gLeads: kpi(8, 5),
  totalLeads: kpi(32, 23),
  estimatedRevenue: kpi(1850000000, 1200000000),
  investment: { socialAds: 25000000, websiteSEO: 12000000, webstoreOps: 8000000, marketplaceAds: 28000000 },
  actualMarketplaceRevenue: 425000000,
  leadPipeline: [
    { projectName: "PT Mandiri Konstruksi", leadSource: "Google Ads", stage: "Won", estimatedRevenue: 450000000 },
    { projectName: "Dinas Kesehatan Jabar", leadSource: "Website", stage: "Qualified", estimatedRevenue: 320000000 },
    { projectName: "RS Premier Bintaro", leadSource: "Referral", stage: "Processing", estimatedRevenue: 280000000 },
    { projectName: "PT Astra Infra", leadSource: "Meta Ads", stage: "Qualified", estimatedRevenue: 520000000 },
    { projectName: "Kemenkes RI", leadSource: "Website", stage: "Processing", estimatedRevenue: 180000000 },
  ],
  insightSummary: "January generated 32 total leads with Rp 1.85B estimated pipeline value. B2B leads dominate the funnel with Google Ads and Website as top-performing lead sources. Two deals are in qualified stage worth Rp 840M combined.",
};

const roiRevenueFeb: ROIRevenueData = {
  b2bLeads: kpi(31, 24),
  b2gLeads: kpi(11, 8),
  totalLeads: kpi(42, 32),
  estimatedRevenue: kpi(2350000000, 1850000000),
  investment: { socialAds: 28000000, websiteSEO: 14000000, webstoreOps: 9000000, marketplaceAds: 32000000 },
  actualMarketplaceRevenue: 480000000,
  leadPipeline: [
    { projectName: "PT Mandiri Konstruksi", leadSource: "Google Ads", stage: "Won", estimatedRevenue: 450000000 },
    { projectName: "Dinas Kesehatan Jabar", leadSource: "Website", stage: "Won", estimatedRevenue: 320000000 },
    { projectName: "RS Premier Bintaro", leadSource: "Referral", stage: "Qualified", estimatedRevenue: 280000000 },
    { projectName: "PT Astra Infra", leadSource: "Meta Ads", stage: "Won", estimatedRevenue: 520000000 },
    { projectName: "Kemenkes RI", leadSource: "Website", stage: "Qualified", estimatedRevenue: 180000000 },
    { projectName: "PT Pelindo III", leadSource: "Google Ads", stage: "Processing", estimatedRevenue: 600000000 },
  ],
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
