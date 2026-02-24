import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { growthPercent, formatNumber, formatCurrency, formatDuration } from "@/data/mockData";
import type { KPIValue } from "@/data/mockData";

interface KPICardProps {
  title: string;
  data: KPIValue;
  format?: "number" | "currency" | "percent" | "duration";
  icon?: React.ReactNode;
  accentColor?: "blue" | "green" | "orange" | "purple" | "navy";
}

const accentBorders: Record<string, string> = {
  blue: "border-l-[3px] border-l-channel-google",
  green: "border-l-[3px] border-l-channel-tokopedia",
  orange: "border-l-[3px] border-l-channel-shopee",
  purple: "border-l-[3px] border-l-channel-meta",
  navy: "border-l-[3px] border-l-channel-website",
};

export function KPICard({ title, data, format = "number", icon, accentColor }: KPICardProps) {
  const growth = growthPercent(data.value, data.previousValue);
  const isPositive = growth > 0;
  const isNeutral = growth === 0;

  const displayValue = () => {
    switch (format) {
      case "currency": return formatCurrency(data.value);
      case "percent": return data.value.toFixed(1) + "%";
      case "duration": return formatDuration(data.value);
      default: return formatNumber(data.value);
    }
  };

  const accent = accentColor ? accentBorders[accentColor] : "";

  return (
    <div className={`bg-card rounded-lg p-5 shadow-card hover:shadow-card-hover transition-shadow duration-200 border border-border/50 animate-fade-in ${accent}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</span>
        {icon && <div className="text-primary/60">{icon}</div>}
      </div>
      <div className="text-2xl font-extrabold text-card-foreground mb-2">{displayValue()}</div>
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
        <span className="text-xs text-muted-foreground">vs prev month</span>
      </div>
    </div>
  );
}
