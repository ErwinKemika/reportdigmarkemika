import { useMergedPageData } from "@/hooks/useMergedPageData";
import { getGoogleAdsData } from "@/data/mockData";
import { transformPlatformAdsDetail, platformAdsPrevMapper } from "@/lib/dataTransformers";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { NoData } from "@/components/dashboard/NoData";
import { AdsFunnelView } from "@/components/dashboard/AdsFunnelView";
import { PageEditDialog } from "@/components/dashboard/PageEditDialog";
import { googleAdsSchema } from "@/components/dashboard/pageEditSchemas";
import { Search } from "lucide-react";
import { useMonth } from "@/contexts/MonthContext";

export default function GoogleAdsPage() {
  const { selectedMonth } = useMonth();
  const { data, isLoading } = useMergedPageData("google-ads", getGoogleAdsData, transformPlatformAdsDetail, platformAdsPrevMapper);

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading...</div>;
  if (!data) return <NoData month={selectedMonth} />;

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex items-center justify-between">
        <SectionHeader title="Google Ads Performance" subtitle={selectedMonth} icon={<Search className="w-4 h-4 text-blue-500" />} />
        <PageEditDialog schema={googleAdsSchema} />
      </div>
      <AdsFunnelView data={data} accentColor="blue" />
    </div>
  );
}
