import { formatCurrencyFull, formatNumber, growthPercent } from "@/data/mockData";
import type { PlatformAdsDetailData, CampaignRow } from "@/data/mockData";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Props {
  data: PlatformAdsDetailData;
  accentColor: string; // tailwind color class prefix e.g. "blue" or "purple"
}

function GrowthBadge({ current, previous, invert = false }: { current: number; previous: number; invert?: boolean }) {
  const g = growthPercent(current, previous);
  const isPositive = invert ? g <= 0 : g >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${isPositive ? "text-success" : "text-destructive"}`}>
      {g >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {g >= 0 ? "+" : ""}{g.toFixed(0)}%
    </span>
  );
}

function FunnelLayer({ label, value, growth, color, width }: { label: string; value: string; growth: React.ReactNode; color: string; width: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`${color} rounded-2xl flex flex-col items-center justify-center py-4 transition-all`} style={{ width }}>
        <span className="text-xs font-medium text-white/80 uppercase tracking-wider">{label}</span>
        <span className="text-xl font-extrabold text-white">{value}</span>
        <div className="mt-0.5">{growth}</div>
      </div>
    </div>
  );
}

function SideMetric({ label, value, growth }: { label: string; value: string; growth: React.ReactNode }) {
  return (
    <div className="text-center">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
      <p className="text-base font-bold text-card-foreground">{value}</p>
      <div className="mt-0.5">{growth}</div>
    </div>
  );
}

export function AdsFunnelView({ data, accentColor }: Props) {
  const d = data;

  return (
    <div className="space-y-10">
      {/* Funnel Section */}
      <div className="bg-card rounded-2xl border border-border/40 p-6 md:p-8 shadow-card">
        {/* Cost header */}
        <div className="text-center mb-6">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Cost</span>
          <div className="text-2xl font-extrabold text-card-foreground">{formatCurrencyFull(d.cost)}</div>
          <GrowthBadge current={d.cost} previous={d.previousCost} invert />
        </div>

        <div className="grid grid-cols-[1fr_2fr_1fr] gap-4 items-center">
          {/* Left side metrics */}
          <div className="flex flex-col gap-6 items-end pr-2">
            <SideMetric label="Avg. CPM" value={formatCurrencyFull(d.avgCpm)} growth={<GrowthBadge current={d.avgCpm} previous={d.previousAvgCpm} invert />} />
            <SideMetric label="Avg. CPC" value={formatCurrencyFull(d.avgCpc)} growth={<GrowthBadge current={d.avgCpc} previous={d.previousAvgCpc} invert />} />
            <SideMetric label="Cost / conv." value={formatCurrencyFull(d.costPerConv)} growth={<GrowthBadge current={d.costPerConv} previous={d.previousCostPerConv} invert />} />
          </div>

          {/* Center funnel */}
          <div className="flex flex-col items-center gap-2">
            <FunnelLayer
              label="Impressions" value={formatNumber(d.impressions)}
              growth={<GrowthBadge current={d.impressions} previous={d.previousImpressions} />}
              color={accentColor === "blue" ? "bg-blue-800" : "bg-indigo-800"} width="100%"
            />
            <FunnelLayer
              label="Clicks" value={formatNumber(d.clicks)}
              growth={<GrowthBadge current={d.clicks} previous={d.previousClicks} />}
              color={accentColor === "blue" ? "bg-teal-600" : "bg-teal-600"} width="75%"
            />
            <FunnelLayer
              label="Conversions" value={formatNumber(d.conversions)}
              growth={<GrowthBadge current={d.conversions} previous={d.previousConversions} />}
              color={accentColor === "blue" ? "bg-amber-500" : "bg-amber-500"} width="55%"
            />
          </div>

          {/* Right side metrics */}
          <div className="flex flex-col gap-6 items-start pl-2">
            <div className="h-[68px]" /> {/* spacer to align with impressions */}
            <SideMetric label="CTR" value={d.ctr.toFixed(2) + "%"} growth={<GrowthBadge current={d.ctr} previous={d.previousCtr} />} />
            <SideMetric label="Conv. rate" value={d.convRate.toFixed(2) + "%"} growth={<GrowthBadge current={d.convRate} previous={d.previousConvRate} />} />
          </div>
        </div>
      </div>

      {/* Insight Box */}
      <div className="bg-card rounded-2xl border-2 border-success/40 p-6 shadow-card">
        <h3 className="font-bold text-sm text-card-foreground mb-3">Insight :</h3>
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{d.insight}</p>
      </div>

      {/* Campaign Breakdown Table */}
      <div className="bg-card rounded-2xl border border-border/40 p-6 md:p-8 shadow-card">
        <h3 className="text-xl font-extrabold text-card-foreground mb-6 uppercase tracking-wide">Campaign Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`${accentColor === "blue" ? "bg-blue-600" : "bg-purple-600"} text-white`}>
                <th className="text-left py-3 px-4 rounded-l-lg font-semibold">Campaign</th>
                <th className="text-right py-3 px-4 font-semibold">Cost</th>
                <th className="text-right py-3 px-4 font-semibold">Conv. rate</th>
                <th className="text-right py-3 px-4 font-semibold">Conversions</th>
                <th className="text-right py-3 px-4 rounded-r-lg font-semibold">Cost / conv.</th>
              </tr>
            </thead>
            <tbody>
              {d.campaigns.map((c: CampaignRow, i: number) => (
                <tr key={c.name} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 text-card-foreground">
                    <span className="text-muted-foreground mr-2">{i + 1}.</span>
                    {c.name}
                  </td>
                  <td className="py-3 px-4 text-right text-card-foreground">{formatCurrencyFull(c.cost)}</td>
                  <td className="py-3 px-4 text-right text-card-foreground">{c.convRate.toFixed(2)}%</td>
                  <td className="py-3 px-4 text-right text-card-foreground">{c.conversions}</td>
                  <td className="py-3 px-4 text-right text-card-foreground">{formatCurrencyFull(c.costPerConv)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-bold">
                <td className="py-3 px-4 text-success">Grand total</td>
                <td className="py-3 px-4 text-right text-card-foreground font-extrabold">{formatCurrencyFull(d.cost)}</td>
                <td className="py-3 px-4 text-right text-card-foreground font-extrabold">{d.convRate.toFixed(2)}%</td>
                <td className="py-3 px-4 text-right text-card-foreground font-extrabold">{d.conversions}</td>
                <td className="py-3 px-4 text-right text-card-foreground font-extrabold">{formatCurrencyFull(d.costPerConv)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
