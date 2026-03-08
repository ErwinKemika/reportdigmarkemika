import { useMergedPageData } from "@/hooks/useMergedPageData";
import { getWebsitePerformanceData, getWebstoreSalesData } from "@/data/mockData";
import { transformWebsitePerformance, websitePerformancePrevMapper, transformWebstoreSales } from "@/lib/dataTransformers";
import { KPICard } from "@/components/dashboard/KPICard";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { NoData } from "@/components/dashboard/NoData";
import { TrackingButtonPerformance } from "@/components/dashboard/TrackingButtonPerformance";
import { Globe, Search, Share2 } from "lucide-react";
import { useMonth } from "@/contexts/MonthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { useTheme } from "next-themes";

const CHART_COLORS_LIGHT = ["hsl(222,47%,25%)", "hsl(217,91%,60%)", "hsl(160,84%,39%)", "hsl(25,95%,53%)"];
const CHART_COLORS_DARK = ["hsl(199,89%,68%)", "hsl(262,83%,68%)", "hsl(160,84%,55%)", "hsl(25,95%,65%)"];

export default function WebsitePerformancePage() {
  const { selectedMonth } = useMonth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const CHART_COLORS = isDark ? CHART_COLORS_DARK : CHART_COLORS_LIGHT;
  const { data, isLoading } = useMergedPageData("website-performance", getWebsitePerformanceData, transformWebsitePerformance, websitePerformancePrevMapper);
  const { data: wsData } = useMergedPageData("webstore-sales", getWebstoreSalesData, transformWebstoreSales);

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading...</div>;
  if (!data) return <NoData month={selectedMonth} />;

  return (
    <div className="space-y-10 animate-fade-in">
      <section className="gradient-hero rounded-2xl p-8">
        <SectionHeader title="Website KPIs" subtitle={selectedMonth + " performance"} icon={<Globe className="w-4 h-4" />} />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <KPICard title="Total Sessions" data={data.totalSessions} accentColor="navy" hero />
          <KPICard title="Total Users" data={data.totalUsers} accentColor="navy" />
          <KPICard title="Engaged Sessions" data={data.engagedSessions} accentColor="blue" />
          <KPICard title="Conversion" data={data.eventClickWA} accentColor="green" />
          <KPICard title="Avg Duration" data={data.avgDuration} format="duration" accentColor="navy" />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-card rounded-xl border border-border/40 p-6 shadow-card hover:shadow-card-hover transition-all duration-300">
          <SectionHeader title="Top 5 Keyword Trend" icon={<Search className="w-4 h-4" />} />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.topKeywords} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "hsl(220,13%,25%)" : "hsl(220,13%,91%)"} />
              <XAxis type="number" tick={{ fontSize: 11, fill: isDark ? "hsl(220,9%,70%)" : "hsl(220,9%,46%)" }} />
              <YAxis dataKey="keyword" type="category" tick={{ fontSize: 11, fill: isDark ? "hsl(220,9%,70%)" : "hsl(220,9%,46%)" }} width={140} />
              <Tooltip contentStyle={{ backgroundColor: isDark ? "hsl(222,47%,11%)" : "hsl(0,0%,100%)", border: `1px solid ${isDark ? "hsl(220,13%,25%)" : "hsl(220,13%,91%)"}`, borderRadius: 12, fontSize: 12, color: isDark ? "hsl(0,0%,90%)" : "inherit", boxShadow: "0 4px 12px hsl(222,47%,11%,0.08)" }} />
              <Bar dataKey="sessions" fill={CHART_COLORS[0]} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        <section className="bg-card rounded-xl border border-border/40 p-6 shadow-card hover:shadow-card-hover transition-all duration-300">
          <SectionHeader title="Traffic Source Breakdown" icon={<Share2 className="w-4 h-4" />} />
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={data.trafficSources} dataKey="sessions" nameKey="source" cx="50%" cy="50%" outerRadius={100} innerRadius={50} paddingAngle={3} label={({ source, percentage }) => `${source} ${percentage}%`} labelLine={false}>
                {data.trafficSources.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: isDark ? "hsl(222,47%,11%)" : "hsl(0,0%,100%)", border: `1px solid ${isDark ? "hsl(220,13%,25%)" : "hsl(220,13%,91%)"}`, borderRadius: 12, fontSize: 12, color: isDark ? "hsl(0,0%,90%)" : "inherit", boxShadow: "0 4px 12px hsl(222,47%,11%,0.08)" }} />
              <Legend wrapperStyle={{ fontSize: 12, color: isDark ? "hsl(0,0%,80%)" : undefined }} />
            </PieChart>
          </ResponsiveContainer>
        </section>
      </div>

      {/* Tracking Button Performance */}
      <TrackingButtonPerformance
        platforms={wsData?.trackingPlatforms || [
          { name: "Shopee Official", totalClicks: 0, previousClicks: 0, topProducts: [] },
          { name: "Tokopedia Store", totalClicks: 0, previousClicks: 0, topProducts: [] },
          { name: "Inaproc (B2B)", totalClicks: 0, previousClicks: 0, topProducts: [] },
        ]}
      />
    </div>
  );
}
