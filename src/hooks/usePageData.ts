import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function usePageData<T = any>(period: string, pageKey: string) {
  return useQuery({
    queryKey: ["page_data", period, pageKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_data")
        .select("*")
        .eq("period", period)
        .eq("page_key", pageKey)
        .maybeSingle();
      if (error) throw error;
      return data ? (data.data as T) : null;
    },
  });
}

export function useUpsertPageData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ period, pageKey, data }: { period: string; pageKey: string; data: any }) => {
      const { error } = await supabase
        .from("page_data")
        .upsert(
          { period, page_key: pageKey, data },
          { onConflict: "period,page_key" }
        );
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["page_data", variables.period, variables.pageKey] });
      toast.success("Data berhasil disimpan!");
    },
    onError: (error: Error) => {
      toast.error("Gagal menyimpan: " + error.message);
    },
  });
}
