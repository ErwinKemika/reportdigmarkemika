import { useQuery } from "@tanstack/react-query";

const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSrd6L0Cux-Hyz3D_jqAedqCkavzoJ66bhzAFPIQGrCQOVqDujgKU-j1pXNdoGTh_vqDEIwlYGpONVs/pub?gid=1857309551&single=true&output=csv";

export interface SheetSalesRecapRow {
  month: string;          // "January", "February", etc.
  tokopedia: number;
  webstore: number;
  shopee: number;
  kommo: number;
  direct_selling_nongov: number;
  inaproc: number;
  e_catalogue: number;
  direct_selling_gov: number;
  ecommerce_total: number;
  nongov_total: number;
  gov_total: number;
  grand_total: number;
  marketing_expense: number;
  digital_marketing_expenses: number;
  romi_percent: number;
  roi_ecommerce_percent: number;
  roi_nongov_percent: number;
}

/**
 * Parse an Indonesian Rupiah string like " Rp 5,556,048 " or " Rp 70,740,925.00 " into a number.
 * Returns 0 for empty, "Rp -", or unparseable strings.
 */
function parseRp(raw: string): number {
  if (!raw) return 0;
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "-" || trimmed === "Rp -" || trimmed === "Rp -") return 0;
  // Remove "Rp" prefix and all whitespace
  const cleaned = trimmed.replace(/Rp/gi, "").replace(/\s/g, "").replace(/,/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Parse a percentage string like "1025.70%" or "-53.15%" into a number.
 * Returns 0 for "#DIV/0!" or unparseable strings.
 */
function parsePct(raw: string): number {
  if (!raw) return 0;
  const trimmed = raw.trim();
  if (trimmed.includes("DIV/0") || trimmed === "-" || !trimmed) return 0;
  const num = parseFloat(trimmed.replace("%", ""));
  return isNaN(num) ? 0 : num;
}

/**
 * Simple CSV row parser that handles quoted fields with commas and newlines inside.
 */
function parseCSVRow(row: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (inQuotes) {
      if (char === '"') {
        // Check for escaped quote ""
        if (i + 1 < row.length && row[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }
  }
  result.push(current);
  return result;
}

/**
 * Normalize month name: "JANUARY" → "January", "FEBRUARY" → "February", etc.
 */
function normalizeMonth(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

/**
 * Fetch and parse the published Google Sheet CSV into structured sales recap rows.
 */
async function fetchSheetData(): Promise<SheetSalesRecapRow[]> {
  const response = await fetch(SHEET_CSV_URL);
  if (!response.ok) throw new Error(`Failed to fetch sheet: ${response.status}`);
  const text = await response.text();

  // The CSV has multi-line quoted fields, so we need to join them first.
  // Replace \r\n inside quotes with spaces, then split by actual row boundaries.
  const lines = text.split(/\r?\n/);

  // Reassemble lines that are part of multi-line quoted fields
  const rows: string[] = [];
  let currentRow = "";
  let openQuotes = 0;
  for (const line of lines) {
    currentRow += (currentRow ? " " : "") + line;
    // Count unescaped quotes
    for (const char of line) {
      if (char === '"') openQuotes++;
    }
    if (openQuotes % 2 === 0) {
      rows.push(currentRow);
      currentRow = "";
      openQuotes = 0;
    }
  }
  if (currentRow) rows.push(currentRow);

  const result: SheetSalesRecapRow[] = [];

  for (const row of rows) {
    const cols = parseCSVRow(row);
    // Data rows have a number in col[2] (No: 1-12) and a month name in col[3]
    const noVal = cols[2]?.trim();
    const monthVal = cols[3]?.trim();
    if (!noVal || !monthVal) continue;
    const noNum = parseInt(noVal, 10);
    if (isNaN(noNum) || noNum < 1 || noNum > 12) continue;

    const month = normalizeMonth(monthVal);
    if (!month) continue;

    result.push({
      month,
      tokopedia: parseRp(cols[4] || ""),
      webstore: parseRp(cols[5] || ""),
      shopee: parseRp(cols[6] || ""),
      kommo: parseRp(cols[7] || ""),
      direct_selling_nongov: parseRp(cols[8] || ""),
      inaproc: parseRp(cols[9] || ""),
      e_catalogue: parseRp(cols[10] || ""),
      direct_selling_gov: parseRp(cols[11] || ""),
      ecommerce_total: parseRp(cols[12] || ""),
      nongov_total: parseRp(cols[13] || ""),
      gov_total: parseRp(cols[14] || ""),
      grand_total: parseRp(cols[15] || ""),
      marketing_expense: parseRp(cols[16] || ""),
      digital_marketing_expenses: parseRp(cols[17] || ""),
      romi_percent: parsePct(cols[18] || ""),
      roi_ecommerce_percent: parsePct(cols[19] || ""),
      roi_nongov_percent: parsePct(cols[20] || ""),
    });
  }

  return result;
}

/**
 * React hook to fetch sales recap data from the published Google Sheet.
 * Data is cached for 5 minutes to avoid excessive requests.
 *
 * @param selectedMonth - e.g. "January", "February"
 * @returns The sales recap data for the selected month, or null if not found.
 */
export function useGoogleSheetSalesRecap(selectedMonth: string) {
  const query = useQuery({
    queryKey: ["google-sheet-sales-recap"],
    queryFn: fetchSheetData,
    staleTime: 5 * 60 * 1000,     // Cache for 5 minutes
    gcTime: 10 * 60 * 1000,       // Keep in garbage collection for 10 minutes
    refetchOnWindowFocus: false,
  });

  const monthData = query.data?.find(
    (row) => row.month.toLowerCase() === selectedMonth.toLowerCase()
  ) ?? null;

  return {
    allMonths: query.data ?? [],
    monthData,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
