import { formatCurrencyFull, formatNumber, growthPercent } from "@/data/mockData";
import type { PlatformAdsDetailData, CampaignRow } from "@/data/mockData";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Props {
  data: PlatformAdsDetailData;
  accentColor: string;
  conversionLabel?: string;
  /** Enable 5-step funnel with Landing Page View layer */
  showLpv?: boolean;
}

function GrowthBadge({ current, previous, invert = false }: {current: number;previous: number;invert?: boolean;}) {
  const g = growthPercent(current, previous);
  const isPositive = invert ? g <= 0 : g >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${isPositive ? "text-success" : "text-destructive"}`}>
      {g >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {g >= 0 ? "+" : ""}{g.toFixed(0)}%
    </span>);
}

function FunnelLayer({ label, value, growth, color, widthTop, widthBottom }: {label: string;value: string;growth: React.ReactNode;color: string;widthTop: string;widthBottom: string;}) {
  return (
    <div className="relative flex flex-col items-center w-full" style={{ minHeight: 80 }}>
      <svg viewBox="0 0 400 80" preserveAspectRatio="none" className="w-full h-full absolute inset-0">
        <path
          d={`M${(400 - parseFloat(widthTop) * 4) / 2},0 L${(400 + parseFloat(widthTop) * 4) / 2},0 L${(400 + parseFloat(widthBottom) * 4) / 2},80 L${(400 - parseFloat(widthBottom) * 4) / 2},80 Z`}
          fill={color} />
      </svg>
      <div className="relative z-10 flex flex-col items-center justify-center h-full py-3">
        <span className="text-[11px] font-semibold text-white/80 uppercase tracking-wider">{label}</span>
        <span className="text-xl md:text-2xl font-extrabold text-white">{value}</span>
        <div className="mt-0.5">{growth}</div>
      </div>
    </div>);
}

function SideMetric({ label, value, growth }: {label: string;value: string;growth: React.ReactNode;}) {
  return (
    <div className="text-center">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
      <p className="text-base font-bold text-card-foreground">{value}</p>
      <div className="mt-0.5">{growth}</div>
    </div>);
}

function ConnectorDot() {
  return (
    <div className="flex items-center">
      <div className="w-6 h-px bg-blue-400/60" />
      <div className="w-2 h-2 rounded-full border-2 border-blue-400/60 bg-card" />
    </div>);
}

function ConnectorCurve() {
  return (
    <div className="flex items-center">
      <svg width="30" height="40" viewBox="0 0 30 40"><path d="M0 20 Q15 20 25 5" stroke="hsl(var(--destructive))" strokeWidth="1.5" fill="none" /><polygon points="23,2 28,5 23,8" fill="hsl(var(--destructive))" /></svg>
    </div>);
}

export function AdsFunnelView({ data, accentColor, conversionLabel = "Conversions", showLpv = false }: Props) {
  const d = data;
  const hasLpv = showLpv && d.landingPageView !== undefined;

  /* ─── Center funnel layers (shared between desktop grid and mobile view) ─── */
  const funnelCenter5 = (
    <div className="flex flex-col items-center -space-y-[1px] w-full">
      <FunnelLayer
        label="Impressions" value={formatNumber(d.impressions)}
        growth={<GrowthBadge current={d.impressions} previous={d.previousImpressions} />}
        color="#1a3a5c" widthTop="100" widthBottom="85" />
      <FunnelLayer
        label="Link Clicks" value={formatNumber(d.clicks)}
        growth={<GrowthBadge current={d.clicks} previous={d.previousClicks} />}
        color="#0d9488" widthTop="85" widthBottom="70" />
      <FunnelLayer
        label="Landing Page View" value={formatNumber(d.landingPageView || 0)}
        growth={<GrowthBadge current={d.landingPageView || 0} previous={d.previousLandingPageView || 0} />}
        color="#e9a030" widthTop="70" widthBottom="58" />
      <FunnelLayer
        label={conversionLabel} value={formatNumber(d.conversions)}
        growth={<GrowthBadge current={d.conversions} previous={d.previousConversions} />}
        color="#e07070" widthTop="58" widthBottom="46" />
      <div className="relative w-full" style={{ minHeight: 30 }}>
        <svg viewBox="0 0 400 30" preserveAspectRatio="none" className="w-full h-full">
          <path d="M108,0 L292,0 L260,30 L140,30 Z" fill="#c05050" />
        </svg>
      </div>
    </div>
  );

  const funnelCenter4 = (
    <div className="flex flex-col items-center -space-y-[1px] w-full">
      <FunnelLayer
        label="Impressions" value={formatNumber(d.impressions)}
        growth={<GrowthBadge current={d.impressions} previous={d.previousImpressions} />}
        color={accentColor === "blue" ? "#1e3a5f" : "#2d2b6b"} widthTop="100" widthBottom="82" />
      <FunnelLayer
        label="Clicks" value={formatNumber(d.clicks)}
        growth={<GrowthBadge current={d.clicks} previous={d.previousClicks} />}
        color="#0d9488" widthTop="82" widthBottom="64" />
      <FunnelLayer
        label={conversionLabel} value={formatNumber(d.conversions)}
        growth={<GrowthBadge current={d.conversions} previous={d.previousConversions} />}
        color="#e9a030" widthTop="64" widthBottom="50" />
      <div className="relative w-full" style={{ minHeight: 40 }}>
        <svg viewBox="0 0 400 40" preserveAspectRatio="none" className="w-full h-full">
          <path d="M100,0 L300,0 L260,40 L140,40 Z" fill="#e07070" />
        </svg>
      </div>
    </div>
  );

  return (
    <div className="space-y-10">
      {/* Funnel Section */}
      <div className="bg-card rounded-2xl border border-border/40 p-4 md:p-8 shadow-card">
        {/* Cost header with arrow */}
        <div className="text-center mb-2">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            {hasLpv ? "Amount spent (IDR)" : "Cost"}
          </span>
          <div className="text-2xl font-extrabold text-card-foreground">{formatCurrencyFull(d.cost)}</div>
          <GrowthBadge current={d.cost} previous={d.previousCost} invert />
          <div className="flex justify-center mt-2">
            <svg width="20" height="30" viewBox="0 0 20 30"><path d="M10 0 L10 22 M4 16 L10 24 L16 16" stroke="currentColor" strokeWidth="2" fill="none" className="text-destructive" /></svg>
          </div>
        </div>

        {hasLpv ? (
          <>
            {/* ===== 5-STEP FUNNEL — Desktop (md+): 3-column layout ===== */}
            <div className="hidden md:grid grid-cols-[1fr_2fr_1fr] gap-2 items-center">
              {/* Left side metrics */}
              <div className="flex flex-col gap-0 items-end">
                <div className="flex items-center gap-2 h-[80px]">
                  <SideMetric label="Avg. CPM" value={formatCurrencyFull(d.avgCpm)} growth={<GrowthBadge current={d.avgCpm} previous={d.previousAvgCpm} invert />} />
                  <ConnectorDot />
                </div>
                <div className="flex items-center gap-2 h-[80px]">
                  <SideMetric label="CPC (cost per link click)" value={formatCurrencyFull(d.avgCpc)} growth={<GrowthBadge current={d.avgCpc} previous={d.previousAvgCpc} invert />} />
                  <ConnectorDot />
                </div>
                <div className="flex items-center gap-2 h-[80px]">
                  <SideMetric label="Cost per LPV" value={formatCurrencyFull(d.costPerLpv || 0)} growth={<GrowthBadge current={d.costPerLpv || 0} previous={d.previousCostPerLpv || 0} invert />} />
                  <ConnectorDot />
                </div>
                <div className="flex items-center gap-2 h-[80px]">
                  <SideMetric label="Cost per Conv." value={formatCurrencyFull(d.costPerConv)} growth={<GrowthBadge current={d.costPerConv} previous={d.previousCostPerConv} invert />} />
                  <ConnectorDot />
                </div>
              </div>
              {/* Center funnel */}
              {funnelCenter5}
              {/* Right side metrics */}
              <div className="flex flex-col gap-0 items-start">
                <div className="h-[80px]" />
                <div className="flex items-center gap-2 h-[80px]">
                  <ConnectorCurve />
                  <SideMetric label="CTR (link clicks)" value={d.ctr.toFixed(2) + "%"} growth={<GrowthBadge current={d.ctr} previous={d.previousCtr} />} />
                </div>
                <div className="flex items-center gap-2 h-[80px]">
                  <ConnectorCurve />
                  <SideMetric label="LPV Rate" value={(d.lpvRate || 0).toFixed(2) + "%"} growth={<GrowthBadge current={d.lpvRate || 0} previous={d.previousLpvRate || 0} />} />
                </div>
                <div className="flex items-center gap-2 h-[80px]">
                  <ConnectorCurve />
                  <SideMetric label="CVR" value={d.convRate.toFixed(2) + "%"} growth={<GrowthBadge current={d.convRate} previous={d.previousConvRate} />} />
                </div>
              </div>
            </div>

            {/* ===== 5-STEP FUNNEL — Mobile: center funnel + metrics grid below ===== */}
            <div className="md:hidden">
              {funnelCenter5}
              <div className="grid grid-cols-2 gap-4 mt-6 px-2">
                <div className="space-y-5">
                  <SideMetric label="Avg. CPM" value={formatCurrencyFull(d.avgCpm)} growth={<GrowthBadge current={d.avgCpm} previous={d.previousAvgCpm} invert />} />
                  <SideMetric label="CPC (cost/link click)" value={formatCurrencyFull(d.avgCpc)} growth={<GrowthBadge current={d.avgCpc} previous={d.previousAvgCpc} invert />} />
                  <SideMetric label="Cost per LPV" value={formatCurrencyFull(d.costPerLpv || 0)} growth={<GrowthBadge current={d.costPerLpv || 0} previous={d.previousCostPerLpv || 0} invert />} />
                  <SideMetric label="Cost per Conv." value={formatCurrencyFull(d.costPerConv)} growth={<GrowthBadge current={d.costPerConv} previous={d.previousCostPerConv} invert />} />
                </div>
                <div className="space-y-5">
                  <SideMetric label="CTR (link clicks)" value={d.ctr.toFixed(2) + "%"} growth={<GrowthBadge current={d.ctr} previous={d.previousCtr} />} />
                  <SideMetric label="LPV Rate" value={(d.lpvRate || 0).toFixed(2) + "%"} growth={<GrowthBadge current={d.lpvRate || 0} previous={d.previousLpvRate || 0} />} />
                  <SideMetric label="CVR" value={d.convRate.toFixed(2) + "%"} growth={<GrowthBadge current={d.convRate} previous={d.previousConvRate} />} />
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* ===== 4-STEP FUNNEL — Desktop (md+): 3-column layout ===== */}
            <div className="hidden md:grid grid-cols-[1fr_2fr_1fr] gap-2 items-center">
              {/* Left side metrics */}
              <div className="flex flex-col gap-0 items-end">
                <div className="flex items-center gap-2 h-[80px]">
                  <SideMetric label="Avg. CPM" value={formatCurrencyFull(d.avgCpm)} growth={<GrowthBadge current={d.avgCpm} previous={d.previousAvgCpm} invert />} />
                  <ConnectorDot />
                </div>
                <div className="flex items-center gap-2 h-[80px]">
                  <SideMetric label="Avg. CPC" value={formatCurrencyFull(d.avgCpc)} growth={<GrowthBadge current={d.avgCpc} previous={d.previousAvgCpc} invert />} />
                  <ConnectorDot />
                </div>
                <div className="flex items-center gap-2 h-[80px]">
                  <SideMetric label={`Cost / ${conversionLabel.toLowerCase()}`} value={formatCurrencyFull(d.costPerConv)} growth={<GrowthBadge current={d.costPerConv} previous={d.previousCostPerConv} invert />} />
                  <ConnectorDot />
                </div>
              </div>
              {/* Center funnel */}
              {funnelCenter4}
              {/* Right side metrics */}
              <div className="flex flex-col gap-0 items-start">
                <div className="h-[80px]" />
                <div className="flex items-center gap-2 h-[80px]">
                  <ConnectorCurve />
                  <SideMetric label="CTR" value={d.ctr.toFixed(2) + "%"} growth={<GrowthBadge current={d.ctr} previous={d.previousCtr} />} />
                </div>
                <div className="flex items-center gap-2 h-[80px]">
                  <ConnectorCurve />
                  <SideMetric label={`${conversionLabel} rate`} value={d.convRate.toFixed(2) + "%"} growth={<GrowthBadge current={d.convRate} previous={d.previousConvRate} />} />
                </div>
              </div>
            </div>

            {/* ===== 4-STEP FUNNEL — Mobile: center funnel + metrics grid below ===== */}
            <div className="md:hidden">
              {funnelCenter4}
              <div className="grid grid-cols-2 gap-4 mt-6 px-2">
                <div className="space-y-5">
                  <SideMetric label="Avg. CPM" value={formatCurrencyFull(d.avgCpm)} growth={<GrowthBadge current={d.avgCpm} previous={d.previousAvgCpm} invert />} />
                  <SideMetric label="Avg. CPC" value={formatCurrencyFull(d.avgCpc)} growth={<GrowthBadge current={d.avgCpc} previous={d.previousAvgCpc} invert />} />
                  <SideMetric label={`Cost / ${conversionLabel.toLowerCase()}`} value={formatCurrencyFull(d.costPerConv)} growth={<GrowthBadge current={d.costPerConv} previous={d.previousCostPerConv} invert />} />
                </div>
                <div className="space-y-5">
                  <SideMetric label="CTR" value={d.ctr.toFixed(2) + "%"} growth={<GrowthBadge current={d.ctr} previous={d.previousCtr} />} />
                  <SideMetric label={`${conversionLabel} rate`} value={d.convRate.toFixed(2) + "%"} growth={<GrowthBadge current={d.convRate} previous={d.previousConvRate} />} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Insight Box */}
      <div className="bg-card rounded-2xl border-2 border-success/40 p-6 shadow-card">
        <h3 className="font-bold text-sm text-card-foreground mb-3">Insight :</h3>
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{d.insight}</p>
      </div>

      {/* Campaign Breakdown Table */}
      <div className="bg-card rounded-2xl border border-border/40 p-4 md:p-8 shadow-card">
        <h3 className="text-xl font-extrabold text-card-foreground mb-6 uppercase tracking-wide">AUDIENCE BREAKDOWN</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead>
              {hasLpv ? (
              <tr className="bg-green-600 text-white">
                <th className="text-left py-3 px-4 rounded-l-lg font-semibold">Ad set name</th>
                <th className="text-right py-3 px-4 font-semibold">Amount spent (IDR)</th>
                <th className="text-right py-3 px-4 font-semibold">Impressions</th>
                <th className="text-right py-3 px-4 font-semibold">Landing page views</th>
                <th className="text-right py-3 px-4 font-semibold">CVR</th>
                <th className="text-right py-3 px-4 rounded-r-lg font-semibold">Kemika - Click WA</th>
              </tr>
              ) : (
              <tr className={`${accentColor === "blue" ? "bg-blue-600" : "bg-purple-600"} text-white`}>
                <th className="text-left py-3 px-4 rounded-l-lg font-semibold">Campaign</th>
                <th className="text-right py-3 px-4 font-semibold">Cost</th>
                <th className="text-right py-3 px-4 font-semibold">{`${conversionLabel} rate`}</th>
                <th className="text-right py-3 px-4 font-semibold">{conversionLabel}</th>
                <th className="text-right py-3 px-4 rounded-r-lg font-semibold">Cost / {conversionLabel.toLowerCase()}</th>
              </tr>
              )}
            </thead>
            <tbody>
              {d.campaigns.map((c: CampaignRow, i: number) =>
              <tr key={c.name} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 text-card-foreground">
                    <span className="text-muted-foreground mr-2">{i + 1}.</span>
                    {c.name}
                  </td>
                  <td className="py-3 px-4 text-right text-card-foreground">{formatCurrencyFull(c.cost)}</td>
                  {hasLpv && <td className="py-3 px-4 text-right text-card-foreground">{formatNumber(c.impressions || 0)}</td>}
                  {hasLpv && <td className="py-3 px-4 text-right text-card-foreground">{formatNumber(c.landingPageViews || 0)}</td>}
                  <td className="py-3 px-4 text-right text-card-foreground">{c.convRate.toFixed(2)}%</td>
                  <td className="py-3 px-4 text-right text-card-foreground">{c.conversions}</td>
                  {!hasLpv && <td className="py-3 px-4 text-right text-card-foreground">{formatCurrencyFull(c.costPerConv)}</td>}
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="font-bold">
                <td className="py-3 px-4 text-success">Grand total</td>
                <td className="py-3 px-4 text-right text-card-foreground font-extrabold">{formatCurrencyFull(d.cost)}</td>
                {hasLpv && <td className="py-3 px-4 text-right text-card-foreground font-extrabold">{formatNumber(d.impressions)}</td>}
                {hasLpv && <td className="py-3 px-4 text-right text-card-foreground font-extrabold">{formatNumber(d.landingPageView || 0)}</td>}
                <td className="py-3 px-4 text-right text-card-foreground font-extrabold">
                  {d.campaigns.length > 0
                    ? (d.campaigns.reduce((sum: number, c: CampaignRow) => sum + (c.convRate || 0), 0) / d.campaigns.length).toFixed(2)
                    : "0.00"}%
                </td>
                <td className="py-3 px-4 text-right text-card-foreground font-extrabold">
                  {d.campaigns.reduce((sum: number, c: CampaignRow) => sum + (c.conversions || 0), 0)}
                </td>
                {!hasLpv && <td className="py-3 px-4 text-right text-card-foreground font-extrabold">{formatCurrencyFull(d.costPerConv)}</td>}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>);
}
