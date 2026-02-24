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
    <div className="space-y-10 animate-fade-in">
      {/* Website Section */}
      <section className="bg-tint-blue/50 rounded-2xl p-8">
        <SectionHeader title="Website" subtitle="Performance overview" icon={<Globe className="w-4 h-4" />} />
        <div className="bg-card rounded-xl border border-border/40 p-6 mb-5 shadow-card">
          <div className="flex items-start gap-3">
            <Target className="w-4 h-4 text-channel-website mt-0.5 shrink-0" />
            <div>
              <p className="text-label text-muted-foreground uppercase tracking-wider mb-1">Objective</p>
              <p className="text-sm text-card-foreground leading-relaxed">{data.website.objective}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <KPICard title="Sessions" data={data.website.sessions} accentColor="navy" />
          <KPICard title="Users" data={data.website.users} accentColor="navy" />
          <KPICard title="Conversion Rate" data={data.website.conversionRate} format="percent" accentColor="navy" />
          <KPICard title="Revenue" data={data.website.revenue} format="currency" accentColor="green" hero />
          <KPICard title="Avg Duration" data={data.website.avgDuration} format="duration" accentColor="navy" />
        </div>
      </section>

      {/* Tokopedia Section */}
      <section className="bg-tint-green/50 rounded-2xl p-8">
        <SectionHeader title="Tokopedia" subtitle="Marketplace metrics" icon={<Store className="w-4 h-4" />} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard title="Visitor Toko" data={data.tokopedia.visitorToko} accentColor="green" />
          <KPICard title="Visitor Produk" data={data.tokopedia.visitorProduk} accentColor="green" />
          <KPICard title="Sold Products" data={data.tokopedia.soldProducts} accentColor="green" />
          <KPICard title="Rating Toko" data={data.tokopedia.ratingToko} format="percent" accentColor="green" />
        </div>
      </section>

      {/* Shopee Section */}
      <section className="bg-tint-orange/50 rounded-2xl p-8">
        <SectionHeader title="Shopee" subtitle="Marketplace metrics" icon={<ShoppingBag className="w-4 h-4" />} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard title="Visitor Toko" data={data.shopee.visitorToko} accentColor="orange" />
          <KPICard title="Chat Response %" data={data.shopee.chatResponse} format="percent" accentColor="orange" />
          <KPICard title="Conversion Rate" data={data.shopee.conversionRate} format="percent" accentColor="orange" />
          <KPICard title="Total Orders" data={data.shopee.totalOrders} accentColor="orange" />
        </div>
      </section>

      {/* Monthly Target */}
      <section>
        <div className="bg-card rounded-xl border border-primary/15 p-6 shadow-hero">
          <div className="flex items-start gap-3">
            <div className="gradient-primary p-2.5 rounded-xl shrink-0 shadow-card">
              <Target className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-label text-primary uppercase tracking-wider mb-1.5">Monthly Target</p>
              <p className="text-sm text-card-foreground leading-relaxed">{data.monthlyTarget}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
