import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { growthPercent, formatNumber, formatCurrency, formatDuration } from "@/data/mockData";
import type { KPIValue } from "@/data/mockData";

interface KPICardProps {
  title: string;
  data: KPIValue;
  format?: "number" | "currency" | "percent" | "duration";
  icon?: React.ReactNode;
  accentColor?: "blue" | "green" | "orange" | "purple" | "navy";
  hero?: boolean;
  currencyFormatter?: (n: number) => string;
}

const accentBorders: Record<string, string> = {
  blue: "border-l-[3px] border-l-channel-google",
  green: "border-l-[3px] border-l-channel-tokopedia",
  orange: "border-l-[3px] border-l-channel-shopee",
  purple: "border-l-[3px] border-l-channel-meta",
  navy: "border-l-[3px] border-l-channel-website",
};

export function KPICard({ title, data, format = "number", icon, accentColor, hero, currencyFormatter }: KPICardProps) {
  const growth = growthPercent(data.value, data.previousValue);
  const isPositive = growth > 0;
  const isNeutral = growth === 0;

  const displayValue = () => {
    switch (format) {
      case "currency": return (currencyFormatter || formatCurrency)(data.value);
      case "percent": return data.value.toFixed(1) + "%";
      case "duration": return formatDuration(data.value);
      default: return formatNumber(data.value);
    }
  };

  const accent = accentColor ? accentBorders[accentColor] : "";

  return (
    <div className={`bg-card rounded-xl p-5 shadow-card hover:shadow-card-hover transition-all duration-300 border border-border/40 animate-fade-in overflow-hidden ${accent} ${hero ? "py-7" : ""}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-label uppercase tracking-wider text-muted-foreground">{title}</span>
        {icon && <div className="text-muted-foreground/50">{icon}</div>}
      </div>
      <div className={`font-extrabold text-card-foreground mb-2 tracking-tight leading-tight ${hero ? "text-2xl" : "text-xl"}`}>
        {displayValue()}
      </div>
      <div className="flex items-center gap-1.5">
        {isNeutral ? (
          <Minus className="w-3.5 h-3.5 text-muted-foreground" />
        ) : isPositive ? (
          <TrendingUp className="w-3.5 h-3.5 text-success" />
        ) : (
          <TrendingDown className="w-3.5 h-3.5 text-destructive" />
        )}
        <span className={`text-xs font-semibold ${isNeutral ? "text-muted-foreground" : isPositive ? "text-success" : "text-destructive"}`}>
          {isPositive ? "+" : ""}{growth.toFixed(1)}%
        </span>
        <span className="text-xs text-muted-foreground/70">vs prev</span>
      </div>
    </div>
  );
}
