import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMonth } from "@/contexts/MonthContext";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { FileSpreadsheet, TrendingUp, DollarSign, Megaphone, RefreshCw } from "lucide-react";
import { useGoogleSheetSalesRecap } from "@/hooks/useGoogleSheetSalesRecap";

const PAGE_KEY = "sales_recap_classified_by_channel";

export interface SalesRecapMonthData {
  tokopedia: number;
  webstore: number;
  shopee: number;
  kommo: number;
  direct_selling_nongov: number;
  inaproc: number;
  e_catalogue: number;
  direct_selling_gov: number;
  marketing_expense: number;
  digital_marketing_expenses: number;
}

const emptyRow: SalesRecapMonthData = {
  tokopedia: 0, webstore: 0, shopee: 0,
  kommo: 0, direct_selling_nongov: 0,
  inaproc: 0, e_catalogue: 0, direct_selling_gov: 0,
  marketing_expense: 0, digital_marketing_expenses: 0,
};

function calc(d: SalesRecapMonthData) {
  const ecommerce_total = d.tokopedia + d.webstore + d.shopee;
  const nongov_total = d.kommo + d.direct_selling_nongov;
  const gov_total = d.inaproc + d.e_catalogue + d.direct_selling_gov;
  const grand_total = ecommerce_total + nongov_total + gov_total;
  const romi_percent = d.marketing_expense > 0 ? ((grand_total - d.marketing_expense) / d.marketing_expense) * 100 : 0;
  const roi_ecommerce_percent = d.digital_marketing_expenses > 0 ? ((ecommerce_total - d.digital_marketing_expenses) / d.digital_marketing_expenses) * 100 : 0;
  const roi_nongov_percent = d.marketing_expense > 0 ? ((nongov_total - d.marketing_expense) / d.marketing_expense) * 100 : 0;
  return { ecommerce_total, nongov_total, gov_total, grand_total, romi_percent, roi_ecommerce_percent, roi_nongov_percent };
}

function formatRp(val: number) {
  if (!val) return "–";
  return `Rp ${val.toLocaleString("id-ID")}`;
}

function formatPct(val: number) {
  if (val === 0) return "–";
  const sign = val > 0 ? "+" : "";
  return `${sign}${val.toFixed(2)}%`;
}

interface SectionCardProps {
  title: string;
  gradientFrom: string;
  gradientTo: string;
  rows: { label: string; value: string; isBold?: boolean; isHighlight?: boolean }[];
  footer?: { label: string; value: string };
}

function SectionCard({ title, gradientFrom, gradientTo, rows, footer }: SectionCardProps) {
  return (
    <div className="rounded-xl overflow-hidden border border-border/30 shadow-card flex flex-col">
      {/* Gradient Header */}
      <div
        className="px-5 py-4 text-white font-bold text-sm uppercase tracking-wider"
        style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
      >
        {title}
      </div>
      {/* Rows */}
      <div className="flex-1 bg-card">
        {rows.map((row, i) => (
          <div
            key={i}
            className={`flex items-center justify-between px-5 py-3 border-b border-border/15 transition-colors hover:bg-muted/30 ${
              i % 2 === 0 ? "bg-card" : "bg-muted/10"
            }`}
          >
            <span className={`text-sm ${row.isBold ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
              {row.label}
            </span>
            <span
              className={`text-sm font-mono tabular-nums ${
                row.isBold
                  ? "font-bold text-foreground"
                  : row.isHighlight
                  ? "font-semibold text-[hsl(var(--success))]"
                  : "text-foreground"
              }`}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>
      {/* Footer */}
      {footer && (
        <div
          className="flex items-center justify-between px-5 py-3.5 font-bold text-sm border-t-2"
          style={{ borderColor: gradientFrom, background: `linear-gradient(135deg, ${gradientFrom}12, ${gradientTo}08)` }}
        >
          <span className="text-foreground">{footer.label}</span>
          <span className="font-mono tabular-nums text-foreground">{footer.value}</span>
        </div>
      )}
    </div>
  );
}

export default function SalesRecapPage() {
  const { selectedMonth, selectedYear, period } = useMonth();
  const queryClient = useQueryClient();

  // ── Primary source: Google Sheets CSV ──
  const { monthData: sheetData, isLoading: sheetLoading, refetch: refetchSheet } = useGoogleSheetSalesRecap(selectedMonth);

  // ── Fallback source: Supabase manual entries ──
  const { data: monthData } = useQuery({
    queryKey: ["sales_recap", period],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_data")
        .select("*")
        .eq("page_key", PAGE_KEY)
        .eq("period", period)
        .maybeSingle();
      if (error) throw error;
      return data ? (data.data as unknown as SalesRecapMonthData) : null;
    },
  });

  // ── Merge: Google Sheets → Supabase → empty ──
  // Google Sheets is the primary source of truth
  const hasSheetData = sheetData && sheetData.grand_total > 0;

  const d: SalesRecapMonthData = hasSheetData
    ? {
        tokopedia: sheetData.tokopedia,
        webstore: sheetData.webstore,
        shopee: sheetData.shopee,
        kommo: sheetData.kommo,
        direct_selling_nongov: sheetData.direct_selling_nongov,
        inaproc: sheetData.inaproc,
        e_catalogue: sheetData.e_catalogue,
        direct_selling_gov: sheetData.direct_selling_gov,
        marketing_expense: sheetData.marketing_expense,
        digital_marketing_expenses: sheetData.digital_marketing_expenses,
      }
    : {
        ...emptyRow,
        ...(monthData ?? {}),
      };

  const c = calc(d);

  // Use ROI percentages from Google Sheets if available (they match the spreadsheet formulas)
  const displayRomi = hasSheetData ? sheetData.romi_percent : c.romi_percent;
  const displayRoiEcom = hasSheetData ? sheetData.roi_ecommerce_percent : c.roi_ecommerce_percent;
  const displayRoiNongov = hasSheetData ? sheetData.roi_nongov_percent : c.roi_nongov_percent;

  const show = c.grand_total > 0 || d.marketing_expense > 0;

  return (
    <div className="space-y-8 animate-fade-in">
      <SectionHeader
        title="Sales Recap Classified by Channel"
        subtitle={`Marketing Performance by Revenue — ${selectedMonth} ${selectedYear}`}
        icon={<FileSpreadsheet className="w-5 h-5" />}
      />

      {/* Google Sheets Sync Indicator */}
      {hasSheetData && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg w-fit">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Synced from Google Sheets</span>
          <button onClick={() => refetchSheet()} className="ml-1 p-0.5 rounded hover:bg-emerald-200/50 dark:hover:bg-emerald-500/20 transition-colors">
            <RefreshCw className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          </button>
        </div>
      )}
      {sheetLoading && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 border border-border/40 rounded-lg w-fit">
          <RefreshCw className="w-3 h-3 text-muted-foreground animate-spin" />
          <span className="text-xs text-muted-foreground">Loading from Google Sheets...</span>
        </div>
      )}

      {/* Executive Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border/40 shadow-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-[hsl(var(--success))]" />
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Revenue</p>
          </div>
          <p className="text-2xl font-extrabold text-foreground">{formatRp(c.grand_total)}</p>
        </div>
        <div className="bg-card rounded-xl border border-border/40 shadow-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Megaphone className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Marketing Expense</p>
          </div>
          <p className="text-2xl font-extrabold text-foreground">{formatRp(d.marketing_expense)}</p>
        </div>
        <div className="bg-card rounded-xl border border-border/40 shadow-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Digital Mktg Expense</p>
          </div>
          <p className="text-2xl font-extrabold text-foreground">{formatRp(d.digital_marketing_expenses)}</p>
        </div>
        <div className="bg-card rounded-xl border border-border/40 shadow-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">ROMI (%)</p>
          </div>
          <p className={`text-2xl font-extrabold ${displayRomi > 0 ? "text-[hsl(var(--success))]" : "text-foreground"}`}>
            {displayRomi !== 0 ? formatPct(displayRomi) : "–"}
          </p>
        </div>
      </div>


      {/* Vertical Card Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {/* E-commerce */}
        <SectionCard
          title="E-Commerce"
          gradientFrom="#0ea5e9"
          gradientTo="#2563eb"
          rows={[
            { label: "Tokopedia", value: show ? formatRp(d.tokopedia) : "–" },
            { label: "Webstore", value: show ? formatRp(d.webstore) : "–" },
            { label: "Shopee", value: show ? formatRp(d.shopee) : "–" },
          ]}
          footer={{ label: "Subtotal", value: show ? formatRp(c.ecommerce_total) : "–" }}
        />

        {/* Non-gov */}
        <SectionCard
          title="Non-Government"
          gradientFrom="#f59e0b"
          gradientTo="#ef4444"
          rows={[
            { label: "Kommo", value: show ? formatRp(d.kommo) : "–" },
            { label: "Direct Selling", value: show ? formatRp(d.direct_selling_nongov) : "–" },
          ]}
          footer={{ label: "Subtotal", value: show ? formatRp(c.nongov_total) : "–" }}
        />

        {/* Government */}
        <SectionCard
          title="Government"
          gradientFrom="#6366f1"
          gradientTo="#8b5cf6"
          rows={[
            { label: "INAPROC", value: show ? formatRp(d.inaproc) : "–" },
            { label: "E-Catalogue", value: show ? formatRp(d.e_catalogue) : "–" },
            { label: "Direct Selling", value: show ? formatRp(d.direct_selling_gov) : "–" },
          ]}
          footer={{ label: "Subtotal", value: show ? formatRp(c.gov_total) : "–" }}
        />

        {/* Investment */}
        <SectionCard
          title="Investment / Expenses"
          gradientFrom="#8b5cf6"
          gradientTo="#a855f7"
          rows={[
            { label: "Marketing Expense", value: show ? formatRp(d.marketing_expense) : "–" },
            { label: "Digital Marketing Exp.", value: show ? formatRp(d.digital_marketing_expenses) : "–" },
          ]}
        />

        {/* Grand Total */}
        <SectionCard
          title="Grand Total"
          gradientFrom="#059669"
          gradientTo="#10b981"
          rows={[
            { label: "E-Commerce Total", value: show ? formatRp(c.ecommerce_total) : "–" },
            { label: "Non-gov Total", value: show ? formatRp(c.nongov_total) : "–" },
            { label: "Government Total", value: show ? formatRp(c.gov_total) : "–" },
          ]}
          footer={{ label: "GRAND TOTAL", value: show ? formatRp(c.grand_total) : "–" }}
        />

        {/* ROI */}
        <SectionCard
          title="Return on Investment"
          gradientFrom="#0891b2"
          gradientTo="#06b6d4"
          rows={[
            {
              label: "ROMI (%)",
              value: show ? formatPct(displayRomi) : "–",
              isBold: true,
              isHighlight: displayRomi > 0,
            },
            {
              label: "ROI E-Commerce (%)",
              value: show ? formatPct(displayRoiEcom) : "–",
              isBold: true,
              isHighlight: displayRoiEcom > 0,
            },
            {
              label: "ROI Non-gov (%)",
              value: show ? formatPct(displayRoiNongov) : "–",
              isBold: true,
              isHighlight: displayRoiNongov > 0,
            },
          ]}
        />
      </div>


    </div>
  );
}
