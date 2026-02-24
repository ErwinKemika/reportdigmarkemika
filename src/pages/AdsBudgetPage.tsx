import { useMonth } from "@/contexts/MonthContext";
import { getAdsBudgetData, formatCurrency, formatNumber } from "@/data/mockData";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { NoData } from "@/components/dashboard/NoData";
import { DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const CHANNEL_COLORS: Record<string, string> = {
  "Google Ads": "hsl(217,91%,60%)",
  "Meta Ads": "hsl(245,58%,51%)",
  "Shopee Ads": "hsl(25,95%,53%)",
};

const CHANNEL_BORDER: Record<string, string> = {
  "Google Ads": "border-l-[3px] border-l-channel-google",
  "Meta Ads": "border-l-[3px] border-l-channel-meta",
  "Shopee Ads": "border-l-[3px] border-l-channel-shopee",
};

export default function AdsBudgetPage() {
  const { selectedMonth } = useMonth();
  const data = getAdsBudgetData(selectedMonth);

  if (!data) return <NoData month={selectedMonth} />;

  const channels = [
    { name: "Google Ads", ...data.google, roas: data.google.revenue / data.google.budget },
    { name: "Meta Ads", ...data.meta, roas: data.meta.revenue / data.meta.budget },
    { name: "Shopee Ads", ...data.shopee, roas: data.shopee.revenue / data.shopee.budget },
  ];

  const totalBudget = channels.reduce((s, c) => s + c.budget, 0);
  const totalRevenue = channels.reduce((s, c) => s + c.revenue, 0);
  const totalROI = ((totalRevenue - totalBudget) / totalBudget) * 100;

  const roasChartData = channels.map((c) => ({ name: c.name, ROAS: parseFloat(c.roas.toFixed(2)) }));

  return (
    <div className="space-y-10 animate-fade-in">
      <SectionHeader title="Ads Budget Performance" subtitle={selectedMonth} icon={<DollarSign className="w-4 h-4" />} />

      {/* Channel Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {channels.map((c) => (
          <div key={c.name} className={`bg-card rounded-xl border border-border/40 p-6 shadow-card hover:shadow-card-hover transition-all duration-300 ${CHANNEL_BORDER[c.name] || ""}`}>
            <h3 className="font-semibold text-sm text-card-foreground mb-5">{c.name}</h3>
            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Budget</span>
                <span className="font-semibold text-card-foreground">{formatCurrency(c.budget)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Clicks</span>
                <span className="font-semibold text-card-foreground">{formatNumber(c.clicks)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Conversions</span>
                <span className="font-semibold text-card-foreground">{formatNumber(c.conversions)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Revenue</span>
                <span className="font-semibold text-success">{formatCurrency(c.revenue)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-border/30">
                <span className="font-semibold" style={{ color: CHANNEL_COLORS[c.name] }}>ROAS</span>
                <span className="text-lg font-extrabold tracking-tight" style={{ color: CHANNEL_COLORS[c.name] }}>{c.roas.toFixed(2)}x</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border/40 p-6 shadow-card">
          <h3 className="font-semibold text-sm text-card-foreground mb-6">Performance Summary</h3>
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Budget</span>
              <span className="text-base font-bold text-card-foreground">{formatCurrency(totalBudget)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Revenue</span>
              <span className="text-base font-bold text-card-foreground">{formatCurrency(totalRevenue)}</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-border/40">
              <span className="text-sm font-semibold text-foreground">Total ROI</span>
              <span className={`text-base font-bold ${totalROI >= 0 ? "text-card-foreground" : "text-destructive"}`}>
                {totalROI.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border/40 p-6 shadow-card">
          <h3 className="font-semibold text-sm text-card-foreground mb-6">ROAS Comparison</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={roasChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(220,9%,46%)" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(220,9%,46%)" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(0,0%,100%)",
                  border: "1px solid hsl(220,13%,91%)",
                  borderRadius: 12,
                  fontSize: 12,
                  boxShadow: "0 4px 12px hsl(222,47%,11%,0.08)",
                }}
              />
              <Bar dataKey="ROAS" radius={[6, 6, 0, 0]}>
                {roasChartData.map((entry) => (
                  <Cell key={entry.name} fill={CHANNEL_COLORS[entry.name] || "hsl(222,47%,20%)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
