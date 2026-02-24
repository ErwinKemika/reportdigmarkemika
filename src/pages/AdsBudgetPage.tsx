import { useMonth } from "@/contexts/MonthContext";
import { getAdsBudgetData, formatCurrency, formatNumber } from "@/data/mockData";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { NoData } from "@/components/dashboard/NoData";
import { DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

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
    <div className="space-y-8 animate-fade-in">
      <SectionHeader title="Ads Budget Performance" subtitle={selectedMonth} icon={<DollarSign className="w-4 h-4" />} />

      {/* Channel Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {channels.map((c) => (
          <div key={c.name} className="bg-card rounded-lg border border-border/50 p-5 shadow-card">
            <h3 className="font-semibold text-sm text-card-foreground mb-4">{c.name}</h3>
            <div className="space-y-3 text-sm">
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
                <span className="font-semibold text-card-foreground">{formatCurrency(c.revenue)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="text-primary font-medium">ROAS</span>
                <span className="font-bold text-primary">{c.roas.toFixed(2)}x</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg border border-border/50 p-5 shadow-card">
          <h3 className="font-semibold text-sm text-card-foreground mb-5">Performance Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Budget</span>
              <span className="text-lg font-bold text-card-foreground">{formatCurrency(totalBudget)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Revenue</span>
              <span className="text-lg font-bold text-card-foreground">{formatCurrency(totalRevenue)}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-border">
              <span className="text-sm font-medium text-primary">Total ROI</span>
              <span className={`text-lg font-bold ${totalROI >= 0 ? "text-success" : "text-destructive"}`}>
                {totalROI.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border/50 p-5 shadow-card">
          <h3 className="font-semibold text-sm text-card-foreground mb-5">ROAS Comparison</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={roasChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(216,20%,90%)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(220,10%,50%)" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(220,10%,50%)" }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(0,0%,100%)", border: "1px solid hsl(216,20%,90%)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="ROAS" fill="hsl(220,70%,45%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
