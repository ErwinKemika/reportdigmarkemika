import { useMergedPageData } from "@/hooks/useMergedPageData";
import { getBenchmarkData, formatNumber } from "@/data/mockData";
import { transformBenchmark } from "@/lib/dataTransformers";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { NoData } from "@/components/dashboard/NoData";
import { BarChart3, Store, ShoppingBag, Globe, TrendingUp, AlertTriangle, Award } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { useMonth } from "@/contexts/MonthContext";

const channelConfig = {
  Tokopedia: { color: "hsl(160, 84%, 39%)", bgTint: "bg-tint-green", textColor: "text-channel-tokopedia", icon: Store },
  Shopee: { color: "hsl(25, 95%, 53%)", bgTint: "bg-tint-orange", textColor: "text-channel-shopee", icon: ShoppingBag },
  Webstore: { color: "hsl(222, 47%, 25%)", bgTint: "bg-tint-blue", textColor: "text-channel-website", icon: Globe },
};

function achievementBadge(pct: number) {
  if (pct >= 100) return { label: "On Target", className: "bg-success/10 text-success border-success/20" };
  if (pct >= 90) return { label: "Near Target", className: "bg-warning/10 text-warning border-warning/20" };
  return { label: "Below Target", className: "bg-destructive/10 text-destructive border-destructive/20" };
}

function progressColor(pct: number) {
  if (pct >= 100) return "bg-success";
  if (pct >= 90) return "bg-warning";
  return "bg-destructive";
}

export default function BenchmarkPage() {
  const { selectedMonth } = useMonth();
  const { data, isLoading } = useMergedPageData("benchmark", getBenchmarkData, transformBenchmark);

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading...</div>;
  if (!data) return <NoData month={selectedMonth} />;

  const chartData = data.channels.map((ch) => ({ name: ch.channel, Target: ch.targetTraffic, Actual: ch.traffic }));
  const highestAchievement = [...data.channels].sort((a, b) => b.achievement - a.achievement)[0];
  const highestCR = [...data.channels].sort((a, b) => b.conversionRate - a.conversionRate)[0];
  const largestGap = [...data.channels].sort((a, b) => a.achievement - b.achievement)[0];

  const totalTraffic = data.channels.reduce((sum, ch) => sum + ch.traffic, 0);
  const totalTargetTraffic = data.channels.reduce((sum, ch) => sum + ch.targetTraffic, 0);
  // Weighted Average CR: (sum of orders across channels) / totalTraffic * 100
  // Orders per channel = traffic * conversionRate / 100
  const totalOrders = data.channels.reduce((sum, ch) => sum + (ch.traffic * ch.conversionRate / 100), 0);
  const totalTargetOrders = data.channels.reduce((sum, ch) => sum + (ch.targetTraffic * ch.targetCR / 100), 0);
  const weightedCR = totalTraffic > 0 ? (totalOrders / totalTraffic) * 100 : 0;
  const weightedTargetCR = totalTargetTraffic > 0 ? (totalTargetOrders / totalTargetTraffic) * 100 : 0;
  const trafficAchievement = totalTargetTraffic > 0 ? (totalTraffic / totalTargetTraffic) * 100 : 0;

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Total KPI Cards */}
      <section>
        <SectionHeader title="Overview" subtitle="Aggregated metrics across all channels" icon={<BarChart3 className="w-4 h-4" />} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-card rounded-xl border border-border/40 shadow-card p-5">
            <p className="text-label text-muted-foreground uppercase tracking-wider mb-1">Total Traffic</p>
            <p className="text-2xl font-extrabold text-card-foreground">{formatNumber(totalTraffic)}</p>
            <p className="text-xs text-muted-foreground mt-1">Target: {formatNumber(totalTargetTraffic)}</p>
          </div>
          <div className="bg-card rounded-xl border border-border/40 shadow-card p-5">
            <p className="text-label text-muted-foreground uppercase tracking-wider mb-1">Weighted Conversion Rate</p>
            <p className="text-2xl font-extrabold text-card-foreground">{weightedCR.toFixed(2)}%</p>
            <p className="text-xs text-muted-foreground mt-1">Target: {weightedTargetCR.toFixed(2)}%</p>
          </div>
          <div className="bg-card rounded-xl border border-border/40 shadow-card p-5">
            <p className="text-label text-muted-foreground uppercase tracking-wider mb-1">Traffic Achievement</p>
            <p className="text-2xl font-extrabold text-card-foreground">{trafficAchievement.toFixed(1)}%</p>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-2">
              <div className={`h-full rounded-full transition-all duration-500 ${progressColor(trafficAchievement)}`} style={{ width: `${Math.min(trafficAchievement, 100)}%` }} />
            </div>
          </div>
        </div>
      </section>

      <section>
        <SectionHeader title="Channel Benchmark" subtitle="Comparative performance across all e-commerce channels" icon={<BarChart3 className="w-4 h-4" />} />
        <div className="bg-card rounded-xl border border-border/40 shadow-hero overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[480px]">
              <div className="grid grid-cols-[1.5fr_1fr_1fr_1.2fr] gap-4 px-6 py-4 bg-muted/50 border-b border-border/40">
                <span className="text-label text-muted-foreground uppercase tracking-wider">Channel</span>
                <span className="text-label text-muted-foreground uppercase tracking-wider">Traffic</span>
                <span className="text-label text-muted-foreground uppercase tracking-wider">Conversion Rate</span>
                <span className="text-label text-muted-foreground uppercase tracking-wider">Achievement</span>
              </div>
              {data.channels.map((ch) => {
                const config = channelConfig[ch.channel as keyof typeof channelConfig];
                const badge = achievementBadge(ch.achievement);
                const IconComp = config.icon;
                return (
                  <div key={ch.channel} className="grid grid-cols-[1.5fr_1fr_1fr_1.2fr] gap-4 px-6 py-5 border-b border-border/20 last:border-0 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-card" style={{ backgroundColor: config.color }}>
                        <IconComp className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <span className="text-sm font-semibold text-card-foreground">{ch.channel}</span>
                    </div>
                    <div>
                      <p className="text-base font-bold text-card-foreground">{formatNumber(ch.traffic)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Target: {formatNumber(ch.targetTraffic)}</p>
                    </div>
                    <div>
                      <p className="text-base font-bold text-card-foreground">{ch.conversionRate.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Target: {ch.targetCR.toFixed(1)}%</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-card-foreground">{ch.achievement.toFixed(1)}%</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.className}`}>{badge.label}</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${progressColor(ch.achievement)}`} style={{ width: `${Math.min(ch.achievement, 100)}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section>
        <SectionHeader title="Traffic Comparison: Target vs Actual" subtitle="Grouped comparison across channels" icon={<BarChart3 className="w-4 h-4" />} />
        <div className="bg-card rounded-xl border border-border/40 shadow-card p-6">
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={chartData} barGap={8} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }} tickFormatter={(v) => formatNumber(v)} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid hsl(220, 13%, 91%)", boxShadow: "0 4px 12px hsl(222, 47%, 11%, 0.08)", fontSize: "13px" }} formatter={(value: number) => formatNumber(value)} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />
              <Bar dataKey="Target" fill="hsl(220, 14%, 88%)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Actual" radius={[6, 6, 0, 0]}>
                {chartData.map((entry) => {
                  const cfg = channelConfig[entry.name as keyof typeof channelConfig];
                  return <Cell key={entry.name} fill={cfg.color} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <SectionHeader title="Performance Insights" subtitle="AI-driven analysis highlights" icon={<TrendingUp className="w-4 h-4" />} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-card rounded-xl border border-border/40 shadow-card p-5 border-l-[4px] border-l-success">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-tint-green flex items-center justify-center shrink-0"><Award className="w-4 h-4 text-success" /></div>
              <div>
                <p className="text-label text-muted-foreground uppercase tracking-wider mb-1">Highest Achievement</p>
                <p className="text-sm font-semibold text-card-foreground">{highestAchievement.channel}</p>
                <p className="text-xs text-muted-foreground mt-1">Achieved {highestAchievement.achievement.toFixed(1)}% of traffic target with {highestAchievement.conversionRate.toFixed(1)}% conversion rate.</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border/40 shadow-card p-5 border-l-[4px] border-l-channel-google">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-tint-blue flex items-center justify-center shrink-0"><TrendingUp className="w-4 h-4 text-channel-google" /></div>
              <div>
                <p className="text-label text-muted-foreground uppercase tracking-wider mb-1">Best Conversion Rate</p>
                <p className="text-sm font-semibold text-card-foreground">{highestCR.channel}</p>
                <p className="text-xs text-muted-foreground mt-1">Leading with {highestCR.conversionRate.toFixed(1)}% conversion rate vs {highestCR.targetCR.toFixed(1)}% target.</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border/40 shadow-card p-5 border-l-[4px] border-l-warning">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-tint-orange flex items-center justify-center shrink-0"><AlertTriangle className="w-4 h-4 text-warning" /></div>
              <div>
                <p className="text-label text-muted-foreground uppercase tracking-wider mb-1">Needs Attention</p>
                <p className="text-sm font-semibold text-card-foreground">{largestGap.channel}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {largestGap.achievement < 100 ? `At ${largestGap.achievement.toFixed(1)}% achievement — ${(100 - largestGap.achievement).toFixed(1)}% gap to close.` : "All channels are meeting or exceeding targets."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
