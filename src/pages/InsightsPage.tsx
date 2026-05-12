import { useState, useEffect, useRef } from "react";
import { useMergedPageData } from "@/hooks/useMergedPageData";
import { getInsightsData } from "@/data/mockData";
import { transformInsights } from "@/lib/dataTransformers";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { Lightbulb, ThumbsUp, ThumbsDown, Award, Target, FileText, Loader2 } from "lucide-react";
import { useMonth } from "@/contexts/MonthContext";
import { usePageData, useUpsertPageData } from "@/hooks/usePageData";
import { toast } from "sonner";
import { useGoogleSheetSalesRecap } from "@/hooks/useGoogleSheetSalesRecap";
import { useGoogleSheetROILeads } from "@/hooks/useGoogleSheetROILeads";
import { useGoogleSheetInvestment } from "@/hooks/useGoogleSheetInvestment";
import { supabase } from "@/integrations/supabase/client";

export default function InsightsPage() {
  const { selectedMonth, period } = useMonth();
  const { data, isLoading, refetch } = useMergedPageData("insights", getInsightsData, transformInsights);

  const { data: webData } = usePageData(period, "website");
  const { data: mkpData } = usePageData(period, "marketplace");
  const { data: adsGoogleData } = usePageData(period, "google-ads");
  const { data: adsMetaData } = usePageData(period, "meta-ads");
  const { data: adsShopeeData } = usePageData(period, "shopee-ads");
  
  const { monthData: salesData } = useGoogleSheetSalesRecap(selectedMonth);
  const { leads: roiLeads } = useGoogleSheetROILeads(selectedMonth);
  const { investment: roiInvestment } = useGoogleSheetInvestment(selectedMonth);

  const [isGenerating, setIsGenerating] = useState(false);
  const upsertMutation = useUpsertPageData();
  const payloadRef = useRef<any>({});

  // Keep payload reference updated
  useEffect(() => {
    payloadRef.current = {
      website: webData,
      marketplace: mkpData,
      ads: { google: adsGoogleData, meta: adsMetaData, shopee: adsShopeeData },
      salesRecap: salesData,
      roi: { leads: roiLeads, investment: roiInvestment }
    };
  }, [webData, mkpData, adsGoogleData, adsMetaData, adsShopeeData, salesData, roiLeads, roiInvestment]);

  const handleGenerate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    
    try {
      const { data: result, error } = await supabase.functions.invoke("generate-roi-insight", {
        body: { type: "global", month: selectedMonth, payload: payloadRef.current }
      });
      
      if (error) throw error;
      
      if (result && !result.error) {
         await upsertMutation.mutateAsync({ period, pageKey: "insights", data: result });
         refetch();
         toast.success("Laporan berhasil disusun!");
      } else if (result?.error) {
         throw new Error(result.error);
      }
    } catch (error: any) {
       console.error("Auto generation failed", error);
       toast.error(error.message || "Gagal menyusun laporan otomatis.");
    } finally {
       setIsGenerating(false);
    }
  };

  if (isLoading) return <div className="p-8 text-muted-foreground flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/> Loading data...</div>;
  
  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4 animate-fade-in">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-foreground">Menyusun Rekapitulasi Data Pemasaran...</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Sedang mengumpulkan metrik dari Website, Marketplace, Ads, dan Sales untuk menyusun laporan Eksekutif bulan {selectedMonth}. Harap tunggu sebentar.
          </p>
        </div>
      </div>
    );
  }

  // Jika belum ada data, tampilkan tombol untuk men-generate
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-border/40 rounded-xl bg-card/30">
        <Lightbulb className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Belum Ada Laporan</h3>
        <p className="text-sm text-muted-foreground max-w-md mb-6">
          Laporan Eksekutif untuk bulan {selectedMonth} belum disusun. Klik tombol di bawah ini untuk merangkum data dari seluruh halaman secara otomatis.
        </p>
        <button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-white transition-colors rounded-lg bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:pointer-events-none"
        >
          <Lightbulb className="w-4 h-4" />
          ✨ Generate Laporan AI
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in">
      <SectionHeader title="Insight & Analysis" subtitle={selectedMonth} icon={<Lightbulb className="w-4 h-4" />} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-tint-blue rounded-xl border border-channel-google/15 p-6 shadow-card">
          <div className="flex items-center gap-2.5 mb-5">
            <Lightbulb className="w-4 h-4 text-channel-google" />
            <h3 className="font-semibold text-sm text-card-foreground">Key Insights</h3>
          </div>
          <ul className="space-y-3">
            {data.keyInsights?.map((item: string, i: number) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-card-foreground leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-channel-google mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-tint-green rounded-xl border border-success/15 p-6 shadow-card">
          <div className="flex items-center gap-2.5 mb-5">
            <ThumbsUp className="w-4 h-4 text-success" />
            <h3 className="font-semibold text-sm text-card-foreground">Supporting Factors</h3>
          </div>
          <ul className="space-y-3">
            {data.supportingFactors?.map((item: string, i: number) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-card-foreground leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-success mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-tint-red rounded-xl border border-destructive/15 p-6 shadow-card">
          <div className="flex items-center gap-2.5 mb-5">
            <ThumbsDown className="w-4 h-4 text-destructive" />
            <h3 className="font-semibold text-sm text-card-foreground">Limiting Factors</h3>
          </div>
          <ul className="space-y-3">
            {data.limitingFactors?.map((item: string, i: number) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-card-foreground leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-5">
          <div className="bg-card rounded-xl border border-border/40 p-6 shadow-card">
            <div className="flex items-center gap-2.5 mb-3">
              <Award className="w-4 h-4 text-warning" />
              <h3 className="font-semibold text-sm text-card-foreground">Best Channel of the Month</h3>
            </div>
            <p className="text-kpi font-extrabold text-foreground tracking-tight">{data.bestChannel}</p>
          </div>
          <div className="bg-card rounded-xl border border-border/40 p-6 shadow-card">
            <div className="flex items-center gap-2.5 mb-3">
              <Target className="w-4 h-4 text-foreground" />
              <h3 className="font-semibold text-sm text-card-foreground">Achievement vs Target</h3>
            </div>
            <p className={`text-kpi font-extrabold tracking-tight ${data.achievementPercent >= 100 ? "text-success" : data.achievementPercent >= 75 ? "text-warning" : "text-destructive"}`}>{data.achievementPercent || 0}%</p>
            <div className="w-full bg-muted rounded-full h-2.5 mt-4 overflow-hidden">
              <div className="gradient-primary h-2.5 rounded-full transition-all duration-700 ease-out" style={{ width: `${Math.min(data.achievementPercent || 0, 100)}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-tint-blue rounded-xl border-l-4 border-l-channel-google border border-channel-google/15 p-6 shadow-card">
        <div className="flex items-center gap-2.5 mb-3">
          <FileText className="w-4 h-4 text-channel-google" />
          <h3 className="font-semibold text-sm text-card-foreground">Executive Summary</h3>
        </div>
        <p className="text-sm text-card-foreground leading-relaxed">{data.insightSummary}</p>
      </div>
    </div>
  );
}
