import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DashboardRow {
  id: string;
  period: string;
  channel: string;
  traffic: number;
  target_traffic: number;
  conversion_rate: number;
  target_cr: number;
  revenue: number;
  target_revenue: number;
  budget: number;
  ad_spend: number;
  sessions: number;
  users_count: number;
  orders: number;
  units_sold: number;
  clicks: number;
  impressions: number;
  // Auto-calculated
  achievement_pct: number;
  roas: number;
  roi_pct: number;
  traffic_achievement_pct: number;
}

export type DashboardInsert = Omit<DashboardRow, "id" | "achievement_pct" | "roas" | "roi_pct" | "traffic_achievement_pct">;

export function useDashboardDataByPeriod(period: string) {
  return useQuery({
    queryKey: ["dashboard_data", period],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dashboard_data")
        .select("*")
        .eq("period", period);
      if (error) throw error;
      return (data ?? []) as DashboardRow[];
    },
  });
}

export function useUpsertDashboardData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (row: DashboardInsert) => {
      const { error } = await supabase
        .from("dashboard_data")
        .upsert(row, { onConflict: "period,channel" });
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["dashboard_data", variables.period] });
      toast.success("Data berhasil disimpan!");
    },
    onError: (error: Error) => {
      toast.error("Gagal menyimpan: " + error.message);
    },
  });
}
