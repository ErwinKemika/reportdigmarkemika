import { useQuery } from "@tanstack/react-query";

const BASE_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT0UYJDCwLZdMYx7jvwHfj2mtzle6qXpyYMPzo0UqXWLkXAo2tJSbK4ZdizhqgWcyUCEjq-wWDbn9d5/pub?output=csv";

const GID_MAP: Record<string, string> = {
  January: "342062276",
  February: "1474230895",
  March: "1686695547",
  April: "1922057038",
  May: "702196815",
};

export interface SheetROILead {
  projectName: string;
  project: "Non-Gov" | "Gov";
  leadSource: string;
  stage: string;
  estimatedRevenue: number;
  date: string;
  items?: string;
  qty?: string;
}

/**
 * Parse an Indonesian Rupiah string like " Rp 271,000 " into a number.
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

async function fetchMonthLeads(month: string): Promise<SheetROILead[]> {
  const gid = GID_MAP[month];
  if (!gid) return [];

  const url = `${BASE_URL}&gid=${gid}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch leads for ${month}`);
  
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

  const leads: SheetROILead[] = [];
  const header = parseCSVRow(rows[0] || "");
  
  // Find indices based on header names (case insensitive)
  const idx = {
    source: header.findIndex(h => h.toLowerCase().includes("campaign")),
    name: header.findIndex(h => h.toLowerCase().includes("leads name")),
    date: header.findIndex(h => h.toLowerCase().includes("date")),
    items: header.findIndex(h => h.toLowerCase().includes("items")),
    qty: header.findIndex(h => h.toLowerCase().includes("qty")),
    revenue: header.findIndex(h => h.toLowerCase().includes("estimated revenue")),
    project: header.findIndex(h => h.toLowerCase().includes("project")),
    status: header.findIndex(h => h.toLowerCase().includes("status")),
  };

  // If we can't find basic columns, use defaults based on Jan (11 cols) or others (13 cols)
  const isJan = gid === "342062276";

  for (let i = 1; i < rows.length; i++) {
    const cols = parseCSVRow(rows[i]);
    if (cols.length < 5) continue;

    const leadName = cols[idx.name !== -1 ? idx.name : 4]?.trim();
    if (!leadName) continue;

    const projectRaw = cols[idx.project !== -1 ? idx.project : (isJan ? 9 : 10)]?.trim() || "NonGov";
    const project: "Non-Gov" | "Gov" = projectRaw.toLowerCase().includes("gov") && !projectRaw.toLowerCase().includes("non") ? "Gov" : "Non-Gov";

    leads.push({
      projectName: leadName,
      project,
      leadSource: cols[idx.source !== -1 ? idx.source : 1]?.trim() || "Website",
      stage: cols[idx.status !== -1 ? idx.status : (isJan ? 10 : 11)]?.trim() || "Qualified",
      estimatedRevenue: parseRp(cols[idx.revenue !== -1 ? idx.revenue : (isJan ? 8 : 9)] || ""),
      date: cols[idx.date !== -1 ? idx.date : 5]?.trim() || "",
      items: cols[idx.items !== -1 ? idx.items : 6]?.trim(),
      qty: cols[idx.qty !== -1 ? idx.qty : 7]?.trim(),
    });
  }

  return leads;
}

export function useGoogleSheetROILeads(selectedMonth: string) {
  const query = useQuery({
    queryKey: ["google-sheet-roi-leads", selectedMonth],
    queryFn: () => fetchMonthLeads(selectedMonth),
    staleTime: 5 * 60 * 1000,
  });

  return {
    leads: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
