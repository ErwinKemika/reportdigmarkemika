import { TrendingUp, ShoppingBag, Store, Briefcase } from "lucide-react";
import { NoData } from "./NoData";

interface PlatformProduct {
  name: string;
  sessions: number;
}

interface PlatformData {
  name: string;
  totalClicks: number;
  previousClicks: number;
  topProducts: PlatformProduct[];
}

interface TrackingButtonPerformanceProps {
  platforms: PlatformData[];
}

const PLATFORM_CONFIG: Record<string, {borderColor: string;iconBg: string;icon: React.ReactNode;}> = {
  "Shopee Official": {
    borderColor: "border-t-orange-500",
    iconBg: "bg-orange-500",
    icon: <ShoppingBag className="w-5 h-5 text-white" />
  },
  "Tokopedia Store": {
    borderColor: "border-t-emerald-500",
    iconBg: "bg-emerald-500",
    icon: <Store className="w-5 h-5 text-white" />
  },
  "Inaproc (B2B)": {
    borderColor: "border-t-blue-500",
    iconBg: "bg-blue-500",
    icon: <Briefcase className="w-5 h-5 text-white" />
  }
};

function getGrowth(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return (current - previous) / previous * 100;
}

export function TrackingButtonPerformance({ platforms }: TrackingButtonPerformanceProps) {
  if (!platforms || platforms.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-primary tracking-tight text-left">Tracking Button Performance</h2>
        <p className="text-sm text-muted-foreground text-left">
          Analisis detail trafik tombol CTA, dipecah berdasarkan platform tujuan dan perbandingan performa antar periode.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {platforms.map((platform) => {
          const config = PLATFORM_CONFIG[platform.name] || PLATFORM_CONFIG["Inaproc (B2B)"];
          const growth = getGrowth(platform.totalClicks, platform.previousClicks);

          return (
            <div
              key={platform.name}
              className={`bg-card rounded-2xl border border-border/40 border-t-[3px] ${config.borderColor} shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col`}>

              {/* Header */}
              <div className="p-6 text-center space-y-3">
                <div className={`w-12 h-12 ${config.iconBg} rounded-xl flex items-center justify-center mx-auto`}>
                  {config.icon}
                </div>
                <h3 className="text-lg font-bold text-card-foreground">{platform.name}</h3>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Clicks</p>
                <p className="text-4xl font-black text-card-foreground">{platform.totalClicks.toLocaleString("id-ID")}</p>
                <div className="flex items-center justify-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-success" />
                  <span className="text-xs font-bold text-success">
                    ↑ {growth.toFixed(0)} % Growth
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  vs Bulan Lalu: {platform.previousClicks.toLocaleString("id-ID")}
                </p>
              </div>

              {/* Divider */}
              <div className="border-t border-border/40 mx-4" />

              {/* Top Products */}
              <div className="p-4 flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-card-foreground flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${config.iconBg}`} />
                    Top Products
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Sessions</span>
                </div>
                {platform.topProducts && platform.topProducts.length > 0 ?
                <div className="space-y-0">
                    {platform.topProducts.map((product, i) =>
                  <div key={i} className="flex items-center justify-between py-2.5 border-b border-border/20 last:border-0">
                        <span className="text-sm text-card-foreground">{product.name}</span>
                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                          {product.sessions}
                        </span>
                      </div>
                  )}
                  </div> :

                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Store className="w-8 h-8 mb-2 opacity-30" />
                    <span className="text-sm italic">Data belum tersedia</span>
                  </div>
                }
              </div>
            </div>);

        })}
      </div>
    </div>);

}