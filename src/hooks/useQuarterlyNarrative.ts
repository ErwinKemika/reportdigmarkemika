import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface QuarterNarrative {
  wins: string[];
  challenges: string[];
  nextQuarterFocus: string[];
  summary: string;
}

const PAGE_KEY = "quarterly_narrative";

function periodKey(quarter: string, year: number) {
  return `${quarter}-${year}`;
}

export function useQuarterlyNarrative(quarter: string, year: number, fallback: QuarterNarrative) {
  const [narrative, setNarrative] = useState<QuarterNarrative>(fallback);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const period = periodKey(quarter, year);
    supabase
      .from("page_data")
      .select("data")
      .eq("period", period)
      .eq("page_key", PAGE_KEY)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.data) {
          setNarrative(data.data as unknown as QuarterNarrative);
        }
      });
  }, [quarter, year]);

  const save = useCallback(async (updated: QuarterNarrative): Promise<boolean> => {
    setSaving(true);
    const period = periodKey(quarter, year);
    const { error } = await supabase
      .from("page_data")
      .upsert(
        { period, page_key: PAGE_KEY, data: updated as unknown as Record<string, unknown> },
        { onConflict: "period,page_key" }
      );
    setSaving(false);
    if (!error) setNarrative(updated);
    return !error;
  }, [quarter, year]);

  return { narrative, saving, save };
}
