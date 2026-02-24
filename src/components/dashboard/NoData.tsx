import { Database } from "lucide-react";

export function NoData({ month }: { month: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground animate-fade-in">
      <Database className="w-12 h-12 mb-4 opacity-40" />
      <p className="text-lg font-medium">No data available for {month}</p>
      <p className="text-sm mt-1">Data will appear once connected to Google Sheets</p>
    </div>
  );
}
