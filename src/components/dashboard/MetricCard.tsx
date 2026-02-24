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
    <div className={`text-center p-4 ${className}`}>
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{title}</p>
      <p className="text-xl font-bold text-card-foreground">{displayValue()}</p>
      {growth !== null && (
        <div className="flex items-center justify-center gap-1 mt-1">
          {growth >= 0 ? (
            <TrendingUp className="w-3 h-3 text-success" />
          ) : (
            <TrendingDown className="w-3 h-3 text-destructive" />
          )}
          <span className={`text-xs font-semibold ${growth >= 0 ? "text-success" : "text-destructive"}`}>
            {growth >= 0 ? "+" : ""}{growth.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
}
