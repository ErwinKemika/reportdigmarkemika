import { formatCurrency, formatCurrencyFull, formatNumber } from "@/data/mockData";
import { useQuarterlyAggregation } from "@/hooks/useQuarterlyAggregation";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import {
  BarChart2, TrendingUp, TrendingDown, Award, AlertTriangle,
  Target, FileText, CheckCircle2, ArrowRight,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from "recharts";

interface Props {
  quarter: "Q1" | "Q2" | "Q3" | "Q4";
}

const channelColors: Record<string, string> = {
  Webstore: "hsl(222, 47%, 25%)",
  Tokopedia: "hsl(160, 84%, 39%)",
  Shopee: "hsl(25, 95%, 53%)",
};

function DeltaBadge({ current, prev, invert = false }: { current: number; prev: number; invert?: boolean }) {
  if (prev === 0) return null;
  const pct = ((current - prev) / prev) * 100;
  const isUp = pct >= 0;
  const isGood = invert ? !isUp : isUp;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
      isGood ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
    }`}>
      {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {Math.abs(pct).toFixed(1)}% vs Q sebelumnya
    </span>
  );
}

function progressColor(pct: number) {
  if (pct >= 100) return "bg-success";
  if (pct >= 85) return "bg-warning";
  return "bg-destructive";
}

export default function QuarterlyInsightPage({ quarter }: Props) {
  const data = getQuarterlyInsightData(quarter.toLowerCase());

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
          <BarChart2 className="w-6 h-6 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-card-foreground mb-1">
            Data {quarter} belum tersedia
          </p>
          <p className="text-sm text-muted-foreground">
            Laporan kuartal ini akan muncul setelah periode {quarter} selesai.
          </p>
        </div>
      </div>
    );
  }

  const chartData = data.monthTrend.map((m) => ({
    month: m.month,
    Revenue: m.revenue,
    "Ad Spend": m.adSpend,
  }));

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-label text-muted-foreground uppercase tracking-wider mb-1">Quarterly Report</p>
          <h2 className="text-page-title text-foreground">
            {quarter} {data.year}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {data.months[0]} – {data.months[2]} {data.year}
          </p>
        </div>
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
          data.achievementPercent >= 100
            ? "bg-success/10 text-success border-success/20"
            : data.achievementPercent >= 85
            ? "bg-warning/10 text-warning border-warning/20"
            : "bg-destructive/10 text-destructive border-destructive/20"
        }`}>
          {data.achievementPercent}% Achievement
        </span>
      </div>

      {/* KPI Summary */}
      <section>
        <SectionHeader title="Quarter Summary" subtitle="Agregasi performa 3 bulan" icon={<BarChart2 className="w-4 h-4" />} />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border border-border/40 shadow-card p-5">
            <p className="text-label text-muted-foreground uppercase tracking-wider mb-1">Total Revenue</p>
            <p className="text-xl font-extrabold text-card-foreground">{formatCurrencyFull(data.totalRevenue)}</p>
            <div className="mt-2">
              <DeltaBadge current={data.totalRevenue} prev={data.prevQuarterRevenue} />
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border/40 shadow-card p-5">
            <p className="text-label text-muted-foreground uppercase tracking-wider mb-1">Total Ad Spend</p>
            <p className="text-xl font-extrabold text-card-foreground">{formatCurrencyFull(data.totalAdSpend)}</p>
            <div className="mt-2">
              <DeltaBadge current={data.totalAdSpend} prev={data.prevQuarterAdSpend} invert />
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border/40 shadow-card p-5">
            <p className="text-label text-muted-foreground uppercase tracking-wider mb-1">Blended ROAS</p>
            <p className="text-xl font-extrabold text-card-foreground">{data.blendedROAS.toFixed(1)}x</p>
            <div className="mt-2">
              <DeltaBadge current={data.blendedROAS} prev={data.prevQuarterROAS} />
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border/40 shadow-card p-5">
            <p className="text-label text-muted-foreground uppercase tracking-wider mb-1">Total Traffic</p>
            <p className="text-xl font-extrabold text-card-foreground">{formatNumber(data.totalTraffic)}</p>
          </div>
          <div className="bg-card rounded-xl border border-border/40 shadow-card p-5">
            <p className="text-label text-muted-foreground uppercase tracking-wider mb-1">Avg. Conversion Rate</p>
            <p className="text-xl font-extrabold text-card-foreground">{data.avgConversionRate.toFixed(1)}%</p>
          </div>
          <div className="bg-card rounded-xl border border-border/40 shadow-card p-5">
            <p className="text-label text-muted-foreground uppercase tracking-wider mb-2">Achievement vs Target</p>
            <p className={`text-xl font-extrabold ${
              data.achievementPercent >= 100 ? "text-success" : data.achievementPercent >= 85 ? "text-warning" : "text-destructive"
            }`}>{data.achievementPercent}%</p>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-2">
              <div
                className={`h-full rounded-full transition-all duration-500 ${progressColor(data.achievementPercent)}`}
                style={{ width: `${Math.min(data.achievementPercent, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Month-by-Month Trend */}
      <section>
        <SectionHeader title="Tren Bulanan" subtitle={`Performa 3 bulan dalam ${quarter}`} icon={<TrendingUp className="w-4 h-4" />} />
        <div className="bg-card rounded-xl border border-border/40 shadow-card p-4 md:p-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} barGap={6} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }} />
              <YAxis
                axisLine={false} tickLine={false}
                tick={{ fontSize: 11, fill: "hsl(220, 9%, 46%)" }}
                tickFormatter={(v) => formatCurrency(v)}
                width={72}
              />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "1px solid hsl(220, 13%, 91%)", fontSize: "12px" }}
                formatter={(value: number) => formatCurrencyFull(value)}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />
              <Bar dataKey="Revenue" fill="hsl(222, 47%, 35%)" radius={[5, 5, 0, 0]} />
              <Bar dataKey="Ad Spend" fill="hsl(25, 90%, 55%)" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Channel Breakdown */}
      <section>
        <SectionHeader title="Channel Performance" subtitle="Kontribusi revenue per channel" icon={<Target className="w-4 h-4" />} />
        <div className="bg-card rounded-xl border border-border/40 shadow-hero overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[480px]">
              <div className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr] gap-4 px-6 py-4 bg-muted/50 border-b border-border/40">
                <span className="text-label text-muted-foreground uppercase tracking-wider">Channel</span>
                <span className="text-label text-muted-foreground uppercase tracking-wider">Revenue</span>
                <span className="text-label text-muted-foreground uppercase tracking-wider">Traffic</span>
                <span className="text-label text-muted-foreground uppercase tracking-wider">CR</span>
                <span className="text-label text-muted-foreground uppercase tracking-wider">Kontribusi</span>
              </div>
              {data.channels.map((ch) => (
                <div key={ch.name} className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr] gap-4 px-6 py-5 border-b border-border/20 last:border-0 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: channelColors[ch.name] ?? "hsl(220, 14%, 60%)" }}
                    />
                    <span className="text-sm font-semibold text-card-foreground">{ch.name}</span>
                  </div>
                  <p className="text-sm font-bold text-card-foreground">{formatCurrencyFull(ch.revenue)}</p>
                  <p className="text-sm text-card-foreground">{formatNumber(ch.traffic)}</p>
                  <p className="text-sm text-card-foreground">{ch.conversionRate.toFixed(1)}%</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-[60px]">
                      <div
                        className="h-full rounded-full bg-primary/60"
                        style={{ width: `${ch.contribution}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-card-foreground">{ch.contribution}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* QoQ Comparison */}
      <section>
        <SectionHeader title="Quarter-over-Quarter" subtitle="Dibandingkan kuartal sebelumnya" icon={<BarChart2 className="w-4 h-4" />} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Revenue", current: data.totalRevenue, prev: data.prevQuarterRevenue, fmt: formatCurrencyFull, invert: false },
            { label: "Ad Spend", current: data.totalAdSpend, prev: data.prevQuarterAdSpend, fmt: formatCurrencyFull, invert: true },
            { label: "Blended ROAS", current: data.blendedROAS, prev: data.prevQuarterROAS, fmt: (v: number) => `${v.toFixed(1)}x`, invert: false },
          ].map(({ label, current, prev, fmt, invert }) => {
            const pct = prev > 0 ? ((current - prev) / prev) * 100 : 0;
            const isUp = pct >= 0;
            const isGood = invert ? !isUp : isUp;
            return (
              <div key={label} className="bg-card rounded-xl border border-border/40 shadow-card p-5">
                <p className="text-label text-muted-foreground uppercase tracking-wider mb-3">{label}</p>
                <div className="flex items-end justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Sebelumnya</p>
                    <p className="text-sm text-muted-foreground">{fmt(prev)}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 mb-1" />
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-0.5">Sekarang</p>
                    <p className="text-base font-extrabold text-card-foreground">{fmt(current)}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-1.5 mt-3 text-xs font-semibold ${isGood ? "text-success" : "text-destructive"}`}>
                  {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {Math.abs(pct).toFixed(1)}% {isUp ? "naik" : "turun"} dari kuartal sebelumnya
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Wins & Challenges */}
      <section>
        <SectionHeader title="Wins & Challenges" subtitle="Apa yang berhasil dan apa yang perlu diperbaiki" icon={<Award className="w-4 h-4" />} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-tint-green rounded-xl border border-success/15 p-6 shadow-card">
            <div className="flex items-center gap-2.5 mb-4">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <h3 className="font-semibold text-sm text-card-foreground">Wins {quarter}</h3>
            </div>
            <ul className="space-y-3">
              {data.wins.map((win, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-card-foreground leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-success mt-2 shrink-0" />
                  {win}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-tint-red rounded-xl border border-destructive/15 p-6 shadow-card">
            <div className="flex items-center gap-2.5 mb-4">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <h3 className="font-semibold text-sm text-card-foreground">Challenges {quarter}</h3>
            </div>
            <ul className="space-y-3">
              {data.challenges.map((ch, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-card-foreground leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 shrink-0" />
                  {ch}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Next Quarter Focus */}
      <section>
        <SectionHeader
          title={`Focus & Rekomendasi ${quarter === "Q4" ? "Q1 Tahun Depan" : `Q${Number(quarter[1]) + 1}`}`}
          subtitle="Prioritas strategis kuartal berikutnya"
          icon={<Target className="w-4 h-4" />}
        />
        <div className="bg-tint-blue rounded-xl border border-channel-google/15 p-6 shadow-card">
          <ul className="space-y-3">
            {data.nextQuarterFocus.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-card-foreground leading-relaxed">
                <span className="w-5 h-5 rounded-full bg-channel-google/15 text-channel-google flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Summary */}
      <div className="bg-tint-blue rounded-xl border-l-4 border-l-channel-google border border-channel-google/15 p-6 shadow-card">
        <div className="flex items-center gap-2.5 mb-3">
          <FileText className="w-4 h-4 text-channel-google" />
          <h3 className="font-semibold text-sm text-card-foreground">Ringkasan {quarter} {data.year}</h3>
        </div>
        <p className="text-sm text-card-foreground leading-relaxed">{data.summary}</p>
      </div>
    </div>
  );
}
