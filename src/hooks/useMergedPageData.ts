import { usePageData } from "@/hooks/usePageData";
import { useMonth } from "@/contexts/MonthContext";

/**
 * Fetches page data from DB. If DB has data, transforms it via transformer.
 * Falls back to mockData getter if DB is empty.
 */
export function useMergedPageData<T>(
  pageKey: string,
  mockGetter: (month: string) => T | undefined,
  transformer?: (dbData: Record<string, any>) => T
): { data: T | undefined; isLoading: boolean } {
  const { period, selectedMonth } = useMonth();
  const { data: dbData, isLoading } = usePageData(period, pageKey);
  const mockData = mockGetter(selectedMonth);

  if (isLoading) return { data: undefined, isLoading: true };

  if (dbData && transformer) {
    return { data: transformer(dbData as Record<string, any>), isLoading: false };
  }

  return { data: mockData, isLoading: false };
}
