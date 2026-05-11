import { usePageData } from "@/hooks/usePageData";
import { useMonth, MONTHS, MonthName } from "@/contexts/MonthContext";

function getPreviousPeriod(month: MonthName, year: number): string {
  const idx = MONTHS.indexOf(month);
  if (idx === 0) return `December ${year - 1}`;
  return `${MONTHS[idx - 1]} ${year}`;
}

/**
 * Fetches page data from DB. If DB has data, transforms it via transformer.
 * Falls back to mockData getter if DB is empty.
 * 
 * If previousMapper is provided, it auto-fetches data from the previous month
 * and merges "previous" fields so admin doesn't need to input them manually.
 */
export function useMergedPageData<T>(
  pageKey: string,
  mockGetter: (month: string) => T | undefined,
  transformer?: (dbData: Record<string, any>) => T,
  previousMapper?: (prevData: Record<string, any>) => Record<string, any>
): { data: T | undefined; isLoading: boolean } {
  const { period, selectedMonth, selectedYear } = useMonth();
  const prevPeriod = getPreviousPeriod(selectedMonth, selectedYear);

  const { data: dbData, isLoading } = usePageData(period, pageKey);
  const { data: prevDbData, isLoading: prevLoading } = usePageData(prevPeriod, pageKey);

  const mockData = mockGetter(selectedMonth);
  const loading = isLoading || prevLoading;

  if (loading) return { data: undefined, isLoading: true };

  if (dbData && Object.keys(dbData).length > 0 && transformer) {
    // Start with mockData as the base (if it exists) to ensure hardcoded data is preserved
    // Then override with whatever is in dbData
    const baseData = mockData ? (mockData as Record<string, any>) : {};
    const merged = { ...baseData, ...(dbData as Record<string, any>) };

    // Auto-fill "previous" fields from previous month's data
    if (previousMapper && prevDbData) {
      const prevFields = previousMapper(prevDbData as Record<string, any>);
      for (const [key, value] of Object.entries(prevFields)) {
        if (value !== undefined && value !== null) {
          merged[key] = value;
        }
      }
    }

    return { data: transformer(merged), isLoading: false };
  }

  return { data: mockData, isLoading: false };
}
