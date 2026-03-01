import { useMergedPageData } from "@/hooks/useMergedPageData";
import { getMetaAdsData } from "@/data/mockData";
import { transformPlatformAdsDetail } from "@/lib/dataTransformers";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { NoData } from "@/components/dashboard/NoData";
import { AdsFunnelView } from "@/components/dashboard/AdsFunnelView";
import { Target } from "lucide-react";
import { useMonth } from "@/contexts/MonthContext";

export default function MetaAdsPage() {
  const { selectedMonth } = useMonth();
  const { data, isLoading } = useMergedPageData("meta-ads", getMetaAdsData, transformPlatformAdsDetail);

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading...</div>;
  if (!data) return <NoData month={selectedMonth} />;

  return (
    <div className="space-y-10 animate-fade-in">
      <SectionHeader title="Meta Ads Performance" subtitle={selectedMonth} icon={<Target className="w-4 h-4 text-purple-500" />} />
      <AdsFunnelView data={data} accentColor="purple" />
    </div>
  );
}
