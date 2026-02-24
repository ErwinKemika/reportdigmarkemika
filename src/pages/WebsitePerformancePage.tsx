import { useMonth } from "@/contexts/MonthContext";
import { getWebsitePerformanceData } from "@/data/mockData";
import { KPICard } from "@/components/dashboard/KPICard";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { NoData } from "@/components/dashboard/NoData";
import { Globe, Search, Share2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const CHART_COLORS = ["hsl(220,70%,45%)", "hsl(210,90%,55%)", "hsl(152,60%,42%)", "hsl(38,92%,50%)"];

export default function WebsitePerformancePage() {
  const { selectedMonth } = useMonth();
  const data = getWebsitePerformanceData(selectedMonth);

  if (!data) return <NoData month={selectedMonth} />;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* KPI Cards */}
      <section>
        <SectionHeader title="Website KPIs" subtitle={selectedMonth + " performance"} icon={<Globe className="w-4 h-4" />} />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <KPICard title="Total Sessions" data={data.totalSessions} />
          <KPICard title="Total Users" data={data.totalUsers} />
          <KPICard title="Engaged Sessions" data={data.engagedSessions} />
          <KPICard title="Event Click WA" data={data.eventClickWA} />
          <KPICard title="Avg Duration" data={data.avgDuration} format="duration" />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Keywords */}
        <section className="bg-card rounded-lg border border-border/50 p-5 shadow-card">
          <SectionHeader title="Top 5 Keyword Trend" icon={<Search className="w-4 h-4" />} />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.topKeywords} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(216,20%,90%)" />
              <XAxis type="number" tick={{ fontSize: 12, fill: "hsl(220,10%,50%)" }} />
              <YAxis dataKey="keyword" type="category" tick={{ fontSize: 11, fill: "hsl(220,10%,50%)" }} width={140} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(0,0%,100%)", border: "1px solid hsl(216,20%,90%)", borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="sessions" fill="hsl(220,70%,45%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* Traffic Source */}
        <section className="bg-card rounded-lg border border-border/50 p-5 shadow-card">
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
                contentStyle={{ backgroundColor: "hsl(0,0%,100%)", border: "1px solid hsl(216,20%,90%)", borderRadius: 8, fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </section>
      </div>
    </div>
  );
}
