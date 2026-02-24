import { useMonth } from "@/contexts/MonthContext";
import { getWebsitePerformanceData } from "@/data/mockData";
import { KPICard } from "@/components/dashboard/KPICard";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { NoData } from "@/components/dashboard/NoData";
import { Globe, Search, Share2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const CHART_COLORS = ["hsl(222,47%,25%)", "hsl(217,91%,60%)", "hsl(160,84%,39%)", "hsl(25,95%,53%)"];

export default function WebsitePerformancePage() {
  const { selectedMonth } = useMonth();
  const data = getWebsitePerformanceData(selectedMonth);

  if (!data) return <NoData month={selectedMonth} />;

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Hero KPI Cards */}
      <section className="gradient-hero rounded-2xl p-8">
        <SectionHeader title="Website KPIs" subtitle={selectedMonth + " performance"} icon={<Globe className="w-4 h-4" />} />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <KPICard title="Total Sessions" data={data.totalSessions} accentColor="navy" hero />
          <KPICard title="Total Users" data={data.totalUsers} accentColor="navy" />
          <KPICard title="Engaged Sessions" data={data.engagedSessions} accentColor="blue" />
          <KPICard title="Event Click WA" data={data.eventClickWA} accentColor="green" />
          <KPICard title="Avg Duration" data={data.avgDuration} format="duration" accentColor="navy" />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Keywords */}
        <section className="bg-card rounded-xl border border-border/40 p-6 shadow-card hover:shadow-card-hover transition-all duration-300">
          <SectionHeader title="Top 5 Keyword Trend" icon={<Search className="w-4 h-4" />} />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.topKeywords} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
              <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(220,9%,46%)" }} />
              <YAxis dataKey="keyword" type="category" tick={{ fontSize: 11, fill: "hsl(220,9%,46%)" }} width={140} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(0,0%,100%)",
                  border: "1px solid hsl(220,13%,91%)",
                  borderRadius: 12,
                  fontSize: 12,
                  boxShadow: "0 4px 12px hsl(222,47%,11%,0.08)",
                }}
              />
              <Bar dataKey="sessions" fill="hsl(222,47%,25%)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* Traffic Source */}
        <section className="bg-card rounded-xl border border-border/40 p-6 shadow-card hover:shadow-card-hover transition-all duration-300">
          <SectionHeader title="Traffic Source Breakdown" icon={<Share2 className="w-4 h-4" />} />
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data.trafficSources}
                dataKey="sessions"
                nameKey="source"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={50}
                paddingAngle={3}
                label={({ source, percentage }) => `${source} ${percentage}%`}
                labelLine={false}
              >
                {data.trafficSources.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(0,0%,100%)",
                  border: "1px solid hsl(220,13%,91%)",
                  borderRadius: 12,
                  fontSize: 12,
                  boxShadow: "0 4px 12px hsl(222,47%,11%,0.08)",
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </section>
      </div>
    </div>
  );
}
