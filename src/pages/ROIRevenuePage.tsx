import { useMonth } from "@/contexts/MonthContext";
import { getROIRevenueData, formatCurrency, formatNumber } from "@/data/mockData";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { NoData } from "@/components/dashboard/NoData";
import { Users, Briefcase, Landmark, DollarSign, TrendingUp, PieChart, Lightbulb } from "lucide-react";

export default function ROIRevenuePage() {
  const { selectedMonth } = useMonth();
  const data = getROIRevenueData(selectedMonth);
  if (!data) return <NoData month={selectedMonth} />;

  const totalInvestment =
    data.investment.socialAds +
    data.investment.websiteSEO +
    data.investment.webstoreOps +
    data.investment.marketplaceAds;

  const projectedROI =
    ((data.actualMarketplaceRevenue - totalInvestment) / totalInvestment) * 100;

  const roas = data.actualMarketplaceRevenue / totalInvestment;

  const stageBadge = (stage: string) => {
    const styles: Record<string, string> = {
      Won: "bg-success/15 text-success",
      Qualified: "bg-primary/15 text-primary",
      Processing: "bg-warning/15 text-warning",
    };
    return (
      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${styles[stage] || "bg-muted text-muted-foreground"}`}>
        {stage}
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* SECTION 1 — Lead Performance */}
      <section>
        <SectionHeader title="Lead Performance" subtitle="B2B & B2G lead tracking" icon={<Users className="w-4 h-4" />} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="B2B Leads" data={data.b2bLeads} icon={<Briefcase className="w-4 h-4" />} />
          <KPICard title="B2G Leads" data={data.b2gLeads} icon={<Landmark className="w-4 h-4" />} />
          <KPICard title="Total Leads" data={data.totalLeads} icon={<Users className="w-4 h-4" />} />
          <KPICard title="Est. Revenue" data={data.estimatedRevenue} format="currency" icon={<DollarSign className="w-4 h-4" />} />
        </div>
      </section>

      {/* SECTION 2 — Investment & Revenue */}
      <section>
        <SectionHeader title="Investment & Revenue" subtitle="Digital spend vs returns" icon={<PieChart className="w-4 h-4" />} />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Left — 3 cards */}
          <div className="lg:col-span-2 space-y-5">
            {/* Total Digital Investment */}
            <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Total Digital Investment</p>
              <p className="text-3xl font-extrabold text-card-foreground">{formatCurrency(totalInvestment)}</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <span>Social Ads: {formatCurrency(data.investment.socialAds)}</span>
                <span>Website/SEO: {formatCurrency(data.investment.websiteSEO)}</span>
                <span>Webstore Ops: {formatCurrency(data.investment.webstoreOps)}</span>
                <span>Marketplace Ads: {formatCurrency(data.investment.marketplaceAds)}</span>
              </div>
            </div>

            {/* Actual Marketplace Revenue */}
            <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Actual Marketplace Revenue</p>
              <p className="text-3xl font-extrabold text-card-foreground">{formatCurrency(data.actualMarketplaceRevenue)}</p>
              <p className="mt-2 text-xs font-semibold text-primary">ROAS {roas.toFixed(2)}x</p>
            </div>

            {/* Projected Digital ROI */}
            <div className="gradient-primary rounded-xl p-6 shadow-card text-primary-foreground">
              <p className="text-xs font-medium uppercase tracking-wider opacity-80 mb-1">Projected Digital ROI</p>
              <p className="text-4xl font-extrabold">{projectedROI.toFixed(1)}%</p>
              <p className="mt-2 text-xs opacity-70">(Revenue − Investment) ÷ Investment × 100</p>
            </div>
          </div>

          {/* Right — Lead Pipeline Table */}
          <div className="lg:col-span-3 bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-border/50">
              <h3 className="text-sm font-semibold text-card-foreground">Lead Pipeline</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="text-left px-6 py-3 font-medium">Project Name</th>
                    <th className="text-left px-6 py-3 font-medium">Lead Source</th>
                    <th className="text-left px-6 py-3 font-medium">Stage</th>
                    <th className="text-right px-6 py-3 font-medium">Est. Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {data.leadPipeline.map((lead, i) => (
                    <tr key={i} className="border-b border-border/30 hover:bg-muted/40 transition-colors">
                      <td className="px-6 py-3.5 font-medium text-card-foreground">{lead.projectName}</td>
                      <td className="px-6 py-3.5 text-muted-foreground">{lead.leadSource}</td>
                      <td className="px-6 py-3.5">{stageBadge(lead.stage)}</td>
                      <td className="px-6 py-3.5 text-right font-semibold text-card-foreground">{formatCurrency(lead.estimatedRevenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Insight Summary */}
      <section>
        <div className="bg-card rounded-xl p-6 shadow-card border-l-4 border-l-primary border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-card-foreground">Insight Summary</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{data.insightSummary}</p>
        </div>
      </section>
    </div>
  );
}
