import { useQuery } from "@tanstack/react-query";

const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSrd6L0Cux-Hyz3D_jqAedqCkavzoJ66bhzAFPIQGrCQOVqDujgKU-j1pXNdoGTh_vqDEIwlYGpONVs/pub?gid=422224935&single=true&output=csv";

export interface SheetInvestmentData {
  ads: number;
  websiteSEO: number;
  maintenanceWebSosmed: number;
  total: number;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

/**
 * Parse an Indonesian Rupiah string like " Rp 12,500,000 " or "  54,400,000 " into a number.
 */
function parseRp(raw: string): number {
  if (!raw) return 0;
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "-" || trimmed.includes("Rp -")) return 0;
  const cleaned = trimmed.replace(/Rp/gi, "").replace(/\s/g, "").replace(/,/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Simple CSV row parser.
 */
function parseCSVRow(row: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (inQuotes) {
      if (char === '"') {
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

async function fetchInvestmentData(): Promise<Record<string, SheetInvestmentData>> {
  const response = await fetch(SHEET_CSV_URL);
  if (!response.ok) throw new Error("Failed to fetch investment sheet");
  
  const text = await response.text();
  const lines = text.split(/\r?\n/);
  
  const rows: string[] = [];
  let currentRow = "";
  let openQuotes = 0;
  for (const line of lines) {
    currentRow += (currentRow ? "\n" : "") + line;
    for (const char of line) {
      if (char === '"') openQuotes++;
    }
    if (openQuotes % 2 === 0) {
      rows.push(currentRow);
      currentRow = "";
      openQuotes = 0;
    }
  }

  // Find where REALIZATION BUDGET starts
  let realizationStartIndex = -1;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].includes("REALIZATION BUDGET")) {
      realizationStartIndex = i;
      break;
    }
  }

  if (realizationStartIndex === -1) {
    return {};
  }

  const result: Record<string, SheetInvestmentData> = {};
  
  // Initialize result object for each month
  MONTH_NAMES.forEach(month => {
    result[month] = { ads: 0, websiteSEO: 0, maintenanceWebSosmed: 0, total: 0 };
  });

  // Start reading items under REALIZATION BUDGET
  // Assuming items start a few rows below REALIZATION BUDGET and end at "Total"
  let inDataSection = false;
  
  for (let i = realizationStartIndex + 1; i < rows.length; i++) {
    const cols = parseCSVRow(rows[i]);
    
    // Check if we reached the data rows (Column 1 has "No" in header, data has numbers)
    const col1 = cols[1]?.trim();
    if (col1 === "1") {
      inDataSection = true;
    }

    if (inDataSection) {
      // Check if we reached the total row
      if (col1 === "Total" || cols[2]?.trim() === "Total") {
        // We can use the total row to set the absolute total if we want,
        // but it's safer to sum the categories we mapped.
        break;
      }

      // If it's a valid data row (has a number in col 1)
      if (!isNaN(parseInt(col1))) {
        const itemName = (cols[2] || "").toLowerCase();
        
        let category: keyof SheetInvestmentData | null = null;
        
        if (itemName.includes("seo") || itemName.includes("website") || itemName.includes("domain") || itemName.includes("hosting") || itemName.includes("elementor")) {
          category = "websiteSEO";
        } else if (itemName.includes("ads") || itemName.includes("ad ")) {
          category = "ads";
        } else if (itemName.includes("digital marketing campaign") || itemName.includes("kommo") || itemName.includes("big seller")) {
          category = "maintenanceWebSosmed";
        }

        if (category) {
          // Add amounts for each month
          MONTH_NAMES.forEach((month, idx) => {
            const amountColIndex = 6 + (idx * 2);
            const amount = parseRp(cols[amountColIndex] || "");
            result[month][category] += amount;
            result[month].total += amount;
          });
        }
      }
    }
  }

  return result;
}

export function useGoogleSheetInvestment(selectedMonth: string) {
  const query = useQuery({
    queryKey: ["google-sheet-investment"],
    queryFn: fetchInvestmentData,
    staleTime: 5 * 60 * 1000,
  });

  const monthData = query.data?.[selectedMonth] ?? null;

  return {
    investment: monthData,
    isLoading: query.isLoading,
    error: query.error,
  };
}
