import { useMonth } from "@/contexts/MonthContext";
import { getOverviewData } from "@/data/mockData";
import { KPICard } from "@/components/dashboard/KPICard";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { NoData } from "@/components/dashboard/NoData";
import { Globe, ShoppingBag, Store, Target } from "lucide-react";

export default function OverviewPage() {
  const { selectedMonth } = useMonth();
  const data = getOverviewData(selectedMonth);

  if (!data) return <NoData month={selectedMonth} />;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Website Section */}
      <section>
        <SectionHeader title="Website" subtitle="Performance overview" icon={<Globe className="w-4 h-4" />} />
        <div className="bg-card rounded-lg border border-border/50 p-5 mb-4 shadow-card">
          <div className="flex items-start gap-2 mb-1">
            <Target className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Objective</p>
              <p className="text-sm text-card-foreground">{data.website.objective}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <KPICard title="Sessions" data={data.website.sessions} />
          <KPICard title="Users" data={data.website.users} />
          <KPICard title="Conversion Rate" data={data.website.conversionRate} format="percent" />
          <KPICard title="Revenue" data={data.website.revenue} format="currency" />
          <KPICard title="Avg Duration" data={data.website.avgDuration} format="duration" />
        </div>
      </section>

      {/* Tokopedia Section */}
      <section>
        <SectionHeader title="Tokopedia" subtitle="Marketplace metrics" icon={<Store className="w-4 h-4" />} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard title="Visitor Toko" data={data.tokopedia.visitorToko} />
          <KPICard title="Visitor Produk" data={data.tokopedia.visitorProduk} />
          <KPICard title="Sold Products" data={data.tokopedia.soldProducts} />
          <KPICard title="Rating Toko" data={data.tokopedia.ratingToko} format="percent" />
        </div>
      </section>

      {/* Shopee Section */}
      <section>
        <SectionHeader title="Shopee" subtitle="Marketplace metrics" icon={<ShoppingBag className="w-4 h-4" />} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard title="Visitor Toko" data={data.shopee.visitorToko} />
          <KPICard title="Chat Response %" data={data.shopee.chatResponse} format="percent" />
          <KPICard title="Conversion Rate" data={data.shopee.conversionRate} format="percent" />
          <KPICard title="Total Orders" data={data.shopee.totalOrders} />
        </div>
      </section>

      {/* Monthly Target */}
      <section>
        <div className="bg-card rounded-lg border border-primary/20 p-5 shadow-card">
          <div className="flex items-start gap-3">
            <div className="gradient-primary p-2 rounded-lg shrink-0">
              <Target className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs font-medium text-primary uppercase tracking-wider mb-1">Monthly Target</p>
              <p className="text-sm text-card-foreground leading-relaxed">{data.monthlyTarget}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
