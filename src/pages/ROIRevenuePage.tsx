import { useMergedPageData } from "@/hooks/useMergedPageData";
import { getROIRevenueData, formatCurrencyFull } from "@/data/mockData";
import { transformROIRevenue } from "@/lib/dataTransformers";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { NoData } from "@/components/dashboard/NoData";
import { Users, Briefcase, Landmark, DollarSign, PieChart, Lightbulb, Sparkles, Loader2 } from "lucide-react";
import { useMonth } from "@/contexts/MonthContext";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const STAGE_STYLES: Record<string, string> = {
  Won: "bg-status-won/10 text-status-won border border-status-won/20",
  Qualified: "bg-status-qualified/10 text-status-qualified border border-status-qualified/20",
  Processing: "bg-status-processing/10 text-status-processing border border-status-processing/20",
  Cancelled: "bg-status-cancelled/10 text-status-cancelled border border-status-cancelled/20",
  Drop: "bg-status-cancelled/10 text-status-cancelled border border-status-cancelled/20",
};

export default function ROIRevenuePage() {
  const { selectedMonth } = useMonth();
  const { data, isLoading } = useMergedPageData("roi-revenue", getROIRevenueData, transformROIRevenue);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading...</div>;
  if (!data) return <NoData month={selectedMonth} />;

  const totalInvestment = data.investment.socialAds + data.investment.websiteSEO + data.investment.webstoreOps + data.investment.marketplaceAds;
  const projectedROI = totalInvestment > 0 ? ((data.actualMarketplaceRevenue - totalInvestment) / totalInvestment) * 100 : 0;
  const roas = totalInvestment > 0 ? data.actualMarketplaceRevenue / totalInvestment : 0;

  const generateInsight = async () => {
    setIsGenerating(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("generate-roi-insight", {
        body: {
          data: {
            b2bLeads: data.b2bLeads,
            b2gLeads: data.b2gLeads,
            totalLeads: data.totalLeads,
            estimatedRevenue: data.estimatedRevenue,
            investment: data.investment,
            actualMarketplaceRevenue: data.actualMarketplaceRevenue,
            projectedROI,
            roas,
            leadPipeline: data.leadPipeline,
          },
        },
      });
      if (error) throw error;
      if (result?.error) {
        toast.error(result.error);
      } else {
        setAiInsight(result.insight);
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Gagal generate insight. Coba lagi nanti.");
    } finally {
      setIsGenerating(false);
    }
  };

  const stageBadge = (stage: string) => {
    const style = STAGE_STYLES[stage] || "bg-muted text-muted-foreground";
    return <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-md ${style}`}>{stage}</span>;
  };

  return (
    <div className="space-y-10 animate-fade-in">
      <section className="bg-tint-purple/50 rounded-2xl p-8">
        <SectionHeader title="Lead Performance" subtitle="B2B & B2G lead tracking" icon={<Users className="w-4 h-4" />} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="B2B Leads" data={data.b2bLeads} icon={<Briefcase className="w-4 h-4" />} accentColor="blue" />
          <KPICard title="B2G Leads" data={data.b2gLeads} icon={<Landmark className="w-4 h-4" />} accentColor="purple" />
          <KPICard title="Total Leads" data={data.totalLeads} icon={<Users className="w-4 h-4" />} accentColor="navy" />
          <KPICard title="Est. Revenue" data={data.estimatedRevenue} format="currency" icon={<DollarSign className="w-4 h-4" />} accentColor="green" hero currencyFormatter={formatCurrencyFull} />
        </div>
      </section>

      <section>
        <SectionHeader title="Investment & Revenue" subtitle="Digital spend vs returns" icon={<PieChart className="w-4 h-4" />} />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-card rounded-xl p-6 shadow-card border border-border/40 border-l-[3px] border-l-channel-shopee">
              <p className="text-label text-muted-foreground uppercase tracking-wider mb-2">Total Digital Investment</p>
              <p className="text-kpi font-extrabold text-card-foreground tracking-tight">{formatCurrencyFull(totalInvestment)}</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <span>Social Ads: {formatCurrencyFull(data.investment.socialAds)}</span>
                <span>Website/SEO: {formatCurrencyFull(data.investment.websiteSEO)}</span>
                <span>Webstore Ops: {formatCurrencyFull(data.investment.webstoreOps)}</span>
                <span>Marketplace Ads: {formatCurrencyFull(data.investment.marketplaceAds)}</span>
              </div>
            </div>
            <div className="bg-card rounded-xl p-6 shadow-card border border-border/40 border-l-[3px] border-l-success">
              <p className="text-label text-muted-foreground uppercase tracking-wider mb-2">Actual Marketplace Revenue</p>
              <p className="text-kpi font-extrabold text-success tracking-tight">{formatCurrencyFull(data.actualMarketplaceRevenue)}</p>
              <p className="mt-2 text-xs font-semibold text-foreground/70">ROAS {roas.toFixed(2)}x</p>
            </div>
            <div className={`rounded-xl p-6 shadow-hero text-primary-foreground ${projectedROI >= 0 ? "gradient-success" : "gradient-danger"}`}>
              <p className="text-label uppercase tracking-wider opacity-80 mb-2">Projected Digital ROI</p>
              <p className="text-kpi-lg font-extrabold tracking-tight">{projectedROI.toFixed(1)}%</p>
              <p className="mt-2 text-xs opacity-60">(Revenue − Investment) ÷ Investment × 100</p>
            </div>
          </div>
          <div className="lg:col-span-3 bg-card rounded-xl shadow-card border border-border/40 overflow-hidden">
            <div className="px-6 py-5 border-b border-border/40"><h3 className="text-section-title text-card-foreground">Lead Pipeline</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40 text-label uppercase tracking-wider text-muted-foreground">
                    <th className="text-left px-6 py-3.5 font-medium">Project Name</th>
                    <th className="text-left px-6 py-3.5 font-medium">Lead Source</th>
                    <th className="text-left px-6 py-3.5 font-medium">Stage</th>
                    <th className="text-right px-6 py-3.5 font-medium">Est. Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {data.leadPipeline.map((lead, i) => (
                    <tr key={i} className="border-b border-border/20 hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-card-foreground">{lead.projectName}</td>
                      <td className="px-6 py-4 text-muted-foreground">{lead.leadSource}</td>
                      <td className="px-6 py-4">{stageBadge(lead.stage)}</td>
                      <td className="px-6 py-4 text-right font-semibold text-card-foreground">{formatCurrencyFull(lead.estimatedRevenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="bg-tint-blue rounded-xl p-6 shadow-card border-l-4 border-l-channel-google border border-channel-google/15">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <Lightbulb className="w-4 h-4 text-channel-google" />
              <h3 className="text-sm font-semibold text-card-foreground">Insight Summary</h3>
            </div>
            <button
              onClick={generateInsight}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-channel-google/10 text-channel-google hover:bg-channel-google/20 transition-colors disabled:opacity-50"
            >
              {isGenerating ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</>
              ) : (
                <><Sparkles className="w-3.5 h-3.5" /> Generate dengan AI</>
              )}
            </button>
          </div>
          {isGenerating ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>AI sedang menganalisis data...</span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground leading-relaxed">{aiInsight || data.insightSummary}</p>
          )}
        </div>
      </section>
    </div>
  );
}
