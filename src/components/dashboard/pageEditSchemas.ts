// Page edit form schemas - defines fields for each page's Edit Data modal

export type FieldType = "number" | "currency" | "percent" | "text" | "textarea" | "image" | "date";

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
}

export interface FieldGroup {
  title: string;
  fields: FieldDef[];
}

export interface ArrayFieldDef {
  key: string;
  label: string;
  columns: { key: string; label: string; type: FieldType }[];
  maxRows?: number;
}

export interface PageSchema {
  pageKey: string;
  pageTitle: string;
  groups: FieldGroup[];
  arrayFields?: ArrayFieldDef[];
}

// ===== WEBSITE PERFORMANCE =====
export const websitePerformanceSchema: PageSchema = {
  pageKey: "website-performance",
  pageTitle: "Website Performance",
  groups: [
    {
      title: "Traffic Metrics",
      fields: [
        { key: "sessions", label: "Sessions", type: "number" },
        { key: "previousSessions", label: "Previous Sessions", type: "number" },
        { key: "users", label: "Users", type: "number" },
        { key: "previousUsers", label: "Previous Users", type: "number" },
        { key: "engagedSessions", label: "Engaged Sessions", type: "number" },
        { key: "previousEngagedSessions", label: "Previous Engaged Sessions", type: "number" },
        { key: "avgSessionDuration", label: "Avg Session Duration (sec)", type: "number" },
        { key: "previousAvgSessionDuration", label: "Previous Duration (sec)", type: "number" },
        { key: "waClicks", label: "WA Clicks", type: "number" },
        { key: "previousWaClicks", label: "Previous WA Clicks", type: "number" },
      ],
    },
    {
      title: "Traffic Sources",
      fields: [
        { key: "organicSessions", label: "Organic Sessions", type: "number" },
        { key: "directSessions", label: "Direct Sessions", type: "number" },
        { key: "referralSessions", label: "Referral Sessions", type: "number" },
        { key: "socialSessions", label: "Social Sessions", type: "number" },
        { key: "paidSessions", label: "Paid Sessions", type: "number" },
      ],
    },
  ],
  arrayFields: [
    {
      key: "topKeywords",
      label: "Top Keywords",
      columns: [
        { key: "keyword", label: "Keyword", type: "text" },
        { key: "sessions", label: "Sessions", type: "number" },
      ],
      maxRows: 5,
    },
  ],
};

// ===== WEBSTORE SALES =====
export const webstoreSalesSchema: PageSchema = {
  pageKey: "webstore-sales",
  pageTitle: "Webstore Sales",
  groups: [
    {
      title: "Sales Metrics",
      fields: [
        { key: "previousRevenue", label: "Previous Revenue (Rp)", type: "currency" },
        { key: "orders", label: "Orders", type: "number" },
        { key: "conversionRate", label: "Conversion Rate (%)", type: "percent" },
      ],
    },
  ],
  arrayFields: [
    {
      key: "topProductsViewed",
      label: "Top Products Viewed",
      columns: [
        { key: "name", label: "Product Name", type: "text" },
        { key: "sessions", label: "Views", type: "number" },
      ],
      maxRows: 5,
    },
    {
      key: "topProductsSold",
      label: "Top Products Sold",
      columns: [
        { key: "name", label: "Product Name", type: "text" },
        { key: "units", label: "Units Sold", type: "number" },
        { key: "pricePerUnit", label: "Price/Unit (Rp)", type: "currency" },
      ],
      maxRows: 5,
    },
  ],
};

// ===== MARKETPLACE OVERVIEW =====
export const marketplaceSchema: PageSchema = {
  pageKey: "marketplace",
  pageTitle: "Marketplace Overview",
  groups: [
    {
      title: "Combined Metrics",
      fields: [
        { key: "totalUnitsSold", label: "Total Units Sold", type: "number" },
        { key: "previousUnitsSold", label: "Previous Units Sold", type: "number" },
      ],
    },
    {
      title: "Tokopedia",
      fields: [
        { key: "tokopediaRevenue", label: "Revenue (Rp)", type: "currency" },
        { key: "previousTokopediaRevenue", label: "Previous Revenue (Rp)", type: "currency" },
        { key: "tokopediaGmv", label: "GMV (Rp)", type: "currency" },
        { key: "previousTokopediaGmv", label: "Previous GMV (Rp)", type: "currency" },
        { key: "tokopediaUnitsSold", label: "Products Sold", type: "number" },
        { key: "previousTokopediaUnitsSold", label: "Previous Products Sold", type: "number" },
        { key: "tokopediaVisitors", label: "Visitors", type: "number" },
        { key: "previousTokopediaVisitors", label: "Previous Visitors", type: "number" },
        { key: "tokopediaPageViews", label: "Page Views", type: "number" },
        { key: "previousTokopediaPageViews", label: "Previous Page Views", type: "number" },
      ],
    },
    {
      title: "Shopee",
      fields: [
        { key: "shopeeRevenue", label: "Revenue (Rp)", type: "currency" },
        { key: "previousShopeeRevenue", label: "Previous Revenue (Rp)", type: "currency" },
        { key: "shopeeOrders", label: "Orders", type: "number" },
        { key: "previousShopeeOrders", label: "Previous Orders", type: "number" },
        { key: "shopeeVisitors", label: "Visitors", type: "number" },
        { key: "previousShopeeVisitors", label: "Previous Visitors", type: "number" },
        { key: "shopeeProductClick", label: "Product Clicks", type: "number" },
        { key: "previousShopeeProductClick", label: "Previous Product Clicks", type: "number" },
        { key: "shopeeCancelledOrders", label: "Cancelled Orders", type: "number" },
        { key: "previousShopeeCancelledOrders", label: "Previous Cancelled", type: "number" },
      ],
    },
  ],
  arrayFields: [
    {
      key: "tokopediaTopProducts",
      label: "Tokopedia Top Products",
      columns: [
        { key: "name", label: "Product Name", type: "text" },
        { key: "units", label: "Units Sold", type: "number" },
        { key: "pricePerUnit", label: "Price/Unit (Rp)", type: "currency" },
      ],
      maxRows: 15,
    },
    {
      key: "shopeeTopProducts",
      label: "Shopee Top Products",
      columns: [
        { key: "name", label: "Product Name", type: "text" },
        { key: "units", label: "Units Sold", type: "number" },
        { key: "pricePerUnit", label: "Price/Unit (Rp)", type: "currency" },
      ],
      maxRows: 15,
    },
  ],
};

// ===== SHOPEE ADS =====
export const shopeeAdsSchema: PageSchema = {
  pageKey: "shopee-ads",
  pageTitle: "Shopee Ads",
  groups: [
    {
      title: "Shopee Ads KPIs",
      fields: [
        { key: "impressions", label: "Iklan Dilihat", type: "number" },
        { key: "previousImpressions", label: "Previous Iklan Dilihat", type: "number" },
        { key: "clicks", label: "Jumlah Klik", type: "number" },
        { key: "previousClicks", label: "Previous Jumlah Klik", type: "number" },
        { key: "ctr", label: "Persentase Klik (%)", type: "percent" },
        { key: "previousCtr", label: "Previous Persentase Klik (%)", type: "percent" },
        { key: "orders", label: "Pesanan", type: "number" },
        { key: "previousOrders", label: "Previous Pesanan", type: "number" },
        { key: "unitsSold", label: "Produk Terjual", type: "number" },
        { key: "previousUnitsSold", label: "Previous Produk Terjual", type: "number" },
        { key: "adRevenue", label: "Penjualan dari Iklan (Rp)", type: "currency" },
        { key: "previousAdRevenue", label: "Previous Penjualan dari Iklan", type: "currency" },
        { key: "spend", label: "Biaya Iklan (Rp)", type: "currency" },
        { key: "previousSpend", label: "Previous Biaya Iklan", type: "currency" },
      ],
    },
  ],
  arrayFields: [
    {
      key: "products",
      label: "Product Ads",
      columns: [
        { key: "imageUrl", label: "Product Image", type: "image" as FieldType },
        { key: "name", label: "Product Name", type: "text" },
        { key: "spend", label: "Spend (Rp)", type: "currency" },
        { key: "revenue", label: "Revenue (Rp)", type: "currency" },
        { key: "clicks", label: "Clicks", type: "number" },
        { key: "units", label: "Units", type: "number" },
        { key: "views", label: "Views", type: "number" },
      ],
      maxRows: 10,
    },
  ],
};

// ===== ADS BUDGET PERFORMANCE =====
export const adsBudgetSchema: PageSchema = {
  pageKey: "ads-budget",
  pageTitle: "Ads Budget Performance",
  groups: [
    {
      title: "Google Ads",
      fields: [
        { key: "googleSpend", label: "Spend (Rp)", type: "currency" },
        { key: "googleClicks", label: "Clicks", type: "number" },
        { key: "googleConversions", label: "Conversions", type: "number" },
        { key: "googleRevenue", label: "Revenue (Rp)", type: "currency" },
      ],
    },
    {
      title: "Meta Ads",
      fields: [
        { key: "metaSpend", label: "Spend (Rp)", type: "currency" },
        { key: "metaClicks", label: "Clicks", type: "number" },
        { key: "metaConversions", label: "Conversions", type: "number" },
        { key: "metaRevenue", label: "Revenue (Rp)", type: "currency" },
      ],
    },
    {
      title: "Shopee Ads",
      fields: [
        { key: "shopeeSpend", label: "Spend (Rp)", type: "currency" },
        { key: "shopeeClicks", label: "Clicks", type: "number" },
        { key: "shopeeConversions", label: "Conversions", type: "number" },
        { key: "shopeeRevenue", label: "Revenue (Rp)", type: "currency" },
      ],
    },
  ],
};

// ===== ROI & REVENUE =====
export const roiRevenueSchema: PageSchema = {
  pageKey: "roi-revenue",
  pageTitle: "ROI & Revenue",
  groups: [
    {
      title: "Lead KPIs",
      fields: [
        { key: "b2bLeads", label: "B2B Leads", type: "number" },
        { key: "previousB2bLeads", label: "Previous B2B Leads", type: "number" },
        { key: "b2gLeads", label: "B2G Leads", type: "number" },
        { key: "previousB2gLeads", label: "Previous B2G Leads", type: "number" },
        { key: "previousEstimatedRevenue", label: "Previous Est. Revenue", type: "currency" },
      ],
    },
    {
      title: "Investment Breakdown",
      fields: [
        { key: "websiteSEO", label: "Website/SEO (Rp)", type: "currency" },
        { key: "ads", label: "Ads (Rp)", type: "currency" },
        { key: "maintenanceWebSosmed", label: "Maintenance Web&Sosmed (Rp)", type: "currency" },
      ],
    },
    {
      title: "Revenue",
      fields: [
        { key: "actualMarketplaceRevenue", label: "Actual Marketplace Revenue (Rp)", type: "currency" },
        { key: "insightSummary", label: "Insight Summary", type: "textarea" },
      ],
    },
  ],
  arrayFields: [
    {
      key: "leadPipeline",
      label: "Lead Pipeline",
      columns: [
        { key: "projectName", label: "Project Name", type: "text" },
        { key: "leadSource", label: "Lead Source", type: "text" },
        { key: "stage", label: "Stage", type: "text" },
        { key: "estimatedRevenue", label: "Est. Revenue (Rp)", type: "currency" },
      ],
      maxRows: 10,
    },
  ],
};

// ===== BENCHMARK =====
export const benchmarkSchema: PageSchema = {
  pageKey: "benchmark",
  pageTitle: "Benchmark",
  groups: [
    {
      title: "Tokopedia",
      fields: [
        { key: "tokopediaTraffic", label: "Traffic Actual", type: "number" },
        { key: "tokopediaTargetTraffic", label: "Traffic Target", type: "number" },
        { key: "tokopediaCR", label: "Conversion Rate (%)", type: "percent" },
        { key: "tokopediaTargetCR", label: "Target CR (%)", type: "percent" },
      ],
    },
    {
      title: "Shopee",
      fields: [
        { key: "shopeeTraffic", label: "Traffic Actual", type: "number" },
        { key: "shopeeTargetTraffic", label: "Traffic Target", type: "number" },
        { key: "shopeeCR", label: "Conversion Rate (%)", type: "percent" },
        { key: "shopeeTargetCR", label: "Target CR (%)", type: "percent" },
      ],
    },
    {
      title: "Webstore",
      fields: [
        { key: "webstoreTraffic", label: "Traffic Actual", type: "number" },
        { key: "webstoreTargetTraffic", label: "Traffic Target", type: "number" },
        { key: "webstoreCR", label: "Conversion Rate (%)", type: "percent" },
        { key: "webstoreTargetCR", label: "Target CR (%)", type: "percent" },
      ],
    },
  ],
};

// ===== INSIGHTS =====
export const insightsSchema: PageSchema = {
  pageKey: "insights",
  pageTitle: "Insights",
  groups: [
    {
      title: "Best Channel",
      fields: [
        { key: "bestChannel", label: "Best Channel", type: "text" },
        { key: "achievementPercent", label: "Achievement (%)", type: "percent" },
        { key: "insightSummary", label: "Insight Summary", type: "textarea" },
      ],
    },
  ],
  arrayFields: [
    {
      key: "keyInsights",
      label: "Key Insights",
      columns: [{ key: "text", label: "Insight", type: "text" }],
      maxRows: 8,
    },
    {
      key: "supportingFactors",
      label: "Supporting Factors",
      columns: [{ key: "text", label: "Factor", type: "text" }],
      maxRows: 6,
    },
    {
      key: "limitingFactors",
      label: "Blocking Factors",
      columns: [{ key: "text", label: "Factor", type: "text" }],
      maxRows: 6,
    },
  ],
};

// ===== ACTION PLAN =====
export const recommendationsSchema: PageSchema = {
  pageKey: "recommendations",
  pageTitle: "Action Plan",
  groups: [],
  arrayFields: [
    {
      key: "actionPlan30",
      label: "Immediate Actions (30 Days)",
      columns: [
        { key: "action", label: "Task", type: "text" },
        { key: "tag", label: "Tag (Ads/SEO/UX/Campaign)", type: "text" },
        { key: "priority", label: "Priority (High/Medium/Low)", type: "text" },
        { key: "status", label: "Status (Done/Ongoing/Pending/Blocked)", type: "text" },
        { key: "startDate", label: "Start Date", type: "date" },
        { key: "endDate", label: "End Date", type: "date" },
        { key: "progress", label: "Progress (0-100)", type: "number" },
      ],
      maxRows: 10,
    },
    {
      key: "actionPlan60",
      label: "Tactical Actions (60 Days)",
      columns: [
        { key: "action", label: "Task", type: "text" },
        { key: "tag", label: "Tag", type: "text" },
        { key: "priority", label: "Priority (High/Medium/Low)", type: "text" },
        { key: "status", label: "Status (Done/Ongoing/Pending/Blocked)", type: "text" },
        { key: "startDate", label: "Start Date", type: "date" },
        { key: "endDate", label: "End Date", type: "date" },
        { key: "progress", label: "Progress (0-100)", type: "number" },
      ],
      maxRows: 10,
    },
    {
      key: "actionPlan90",
      label: "Strategic Actions (90 Days)",
      columns: [
        { key: "action", label: "Task", type: "text" },
        { key: "tag", label: "Tag", type: "text" },
        { key: "priority", label: "Priority (High/Medium/Low)", type: "text" },
        { key: "status", label: "Status (Done/Ongoing/Pending/Blocked)", type: "text" },
        { key: "startDate", label: "Start Date", type: "date" },
        { key: "endDate", label: "End Date", type: "date" },
        { key: "progress", label: "Progress (0-100)", type: "number" },
      ],
      maxRows: 10,
    },
  ],
};

// ===== OVERVIEW (Manual fields only — rest is auto-aggregated) =====
export const overviewManualSchema: PageSchema = {
  pageKey: "overview-manual",
  pageTitle: "Overview (Manual Fields)",
  groups: [
    {
      title: "Total Budget Ads (Manual)",
      fields: [
        { key: "totalBudgetAds", label: "Total Budget Ads (Rp)", type: "currency" },
        { key: "previousBudgetAds", label: "Previous Budget Ads (Rp)", type: "currency" },
      ],
    },
    {
      title: "Top Revenue Channel (Manual)",
      fields: [
        { key: "topRevenueChannel", label: "Top Revenue Channel", type: "text", placeholder: "Webstore / Tokopedia / Shopee / B2B-B2G / Other" },
        { key: "topChannelNotes", label: "Reason / Notes", type: "textarea", placeholder: "Why this channel is top..." },
      ],
    },
  ],
};

// Legacy overview schema kept for reference
export const overviewSchema: PageSchema = {
  pageKey: "overview",
  pageTitle: "Overview (Legacy)",
  groups: [],
};

// Map page routes to schemas
export const PAGE_SCHEMA_MAP: Record<string, PageSchema> = {
  "/website": websitePerformanceSchema,
  "/webstore": webstoreSalesSchema,
  "/marketplace": marketplaceSchema,
  "/shopee-ads": shopeeAdsSchema,
  "/ads-budget": adsBudgetSchema,
  "/roi-revenue": roiRevenueSchema,
  "/benchmark": benchmarkSchema,
  "/insights": insightsSchema,
  "/recommendations": recommendationsSchema,
};
