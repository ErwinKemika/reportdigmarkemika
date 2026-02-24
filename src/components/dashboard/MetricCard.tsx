import { formatNumber, formatCurrency, growthPercent } from "@/data/mockData";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: number;
  previousValue?: number;
  format?: "number" | "currency" | "percent";
  className?: string;
}

export function MetricCard({ title, value, previousValue, format = "number", className = "" }: MetricCardProps) {
  const growth = previousValue !== undefined ? growthPercent(value, previousValue) : null;

  const displayValue = () => {
    switch (format) {
      case "currency": return formatCurrency(value);
      case "percent": return value.toFixed(1) + "%";
      default: return formatNumber(value);
    }
  };

  return (
    <div className={`text-center p-5 ${className}`}>
      <p className="text-label text-muted-foreground uppercase tracking-wider mb-2">{title}</p>
      <p className="text-lg font-bold text-card-foreground tracking-tight">{displayValue()}</p>
      {growth !== null && (
        <div className="flex items-center justify-center gap-1.5 mt-2">
          {growth >= 0 ? (
            <TrendingUp className="w-3.5 h-3.5 text-success" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-destructive" />
          )}
          <span className={`text-xs font-semibold ${growth >= 0 ? "text-success" : "text-destructive"}`}>
            {growth >= 0 ? "+" : ""}{growth.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
}
