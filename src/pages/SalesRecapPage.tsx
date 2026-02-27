import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMonth, MONTHS } from "@/contexts/MonthContext";
import { useAuth } from "@/contexts/AuthContext";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, FileSpreadsheet, TrendingUp, DollarSign, BarChart3, Megaphone } from "lucide-react";
import { SalesRecapEditDialog } from "@/components/dashboard/SalesRecapEditDialog";

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

export default function SalesRecapPage() {
  const { selectedYear } = useMonth();
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [editMonth, setEditMonth] = useState<string | null>(null);

  // Fetch all 12 months data for the selected year
  const { data: allData, isLoading } = useQuery({
    queryKey: ["sales_recap", selectedYear],
    queryFn: async () => {
      const periods = MONTHS.map(m => `${m} ${selectedYear}`);
      const { data, error } = await supabase
        .from("page_data")
        .select("*")
        .eq("page_key", PAGE_KEY)
        .in("period", periods);
      if (error) throw error;
      const map: Record<string, SalesRecapMonthData> = {};
      (data ?? []).forEach(row => {
        map[row.period] = row.data as unknown as SalesRecapMonthData;
      });
      return map;
    },
  });

  const rows = useMemo(() => {
    return MONTHS.map(month => {
      const period = `${month} ${selectedYear}`;
      const raw = allData?.[period] ?? emptyRow;
      const d: SalesRecapMonthData = { ...emptyRow, ...raw };
      return { month, period, raw: d, ...calc(d) };
    });
  }, [allData, selectedYear]);

  // Summary totals
  const summary = useMemo(() => {
    const totals = rows.reduce(
      (acc, r) => ({
        grand_total: acc.grand_total + r.grand_total,
        marketing_expense: acc.marketing_expense + r.raw.marketing_expense,
        digital_marketing_expenses: acc.digital_marketing_expenses + r.raw.digital_marketing_expenses,
        tokopedia: acc.tokopedia + r.raw.tokopedia,
        webstore: acc.webstore + r.raw.webstore,
        shopee: acc.shopee + r.raw.shopee,
        kommo: acc.kommo + r.raw.kommo,
        direct_selling_nongov: acc.direct_selling_nongov + r.raw.direct_selling_nongov,
        inaproc: acc.inaproc + r.raw.inaproc,
        e_catalogue: acc.e_catalogue + r.raw.e_catalogue,
        direct_selling_gov: acc.direct_selling_gov + r.raw.direct_selling_gov,
        ecommerce_total: acc.ecommerce_total + r.ecommerce_total,
        nongov_total: acc.nongov_total + r.nongov_total,
        gov_total: acc.gov_total + r.gov_total,
      }),
      {
        grand_total: 0, marketing_expense: 0, digital_marketing_expenses: 0,
        tokopedia: 0, webstore: 0, shopee: 0,
        kommo: 0, direct_selling_nongov: 0,
        inaproc: 0, e_catalogue: 0, direct_selling_gov: 0,
        ecommerce_total: 0, nongov_total: 0, gov_total: 0,
      }
    );
    const avg_romi = totals.marketing_expense > 0 ? ((totals.grand_total - totals.marketing_expense) / totals.marketing_expense) * 100 : 0;
    return { ...totals, avg_romi };
  }, [rows]);

  const hasData = (r: typeof rows[0]) => r.grand_total > 0 || r.raw.marketing_expense > 0;

  const thBase = "px-4 py-3 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap border-b border-r border-border/40";

  return (
    <div className="space-y-8 animate-fade-in">
      <SectionHeader
        title="Sales Recap Classified by Channel"
        subtitle={`Marketing Performance by Revenue ${selectedYear}`}
        icon={<FileSpreadsheet className="w-5 h-5" />}
      />

      {/* Executive Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border/40 shadow-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-[hsl(var(--success))]" />
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Revenue</p>
          </div>
          <p className="text-2xl font-extrabold text-foreground">{formatRp(summary.grand_total)}</p>
        </div>
        <div className="bg-card rounded-xl border border-border/40 shadow-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Megaphone className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Marketing Expense</p>
          </div>
          <p className="text-2xl font-extrabold text-foreground">{formatRp(summary.marketing_expense)}</p>
        </div>
        <div className="bg-card rounded-xl border border-border/40 shadow-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Digital Marketing Expense</p>
          </div>
          <p className="text-2xl font-extrabold text-foreground">{formatRp(summary.digital_marketing_expenses)}</p>
        </div>
        <div className="bg-card rounded-xl border border-border/40 shadow-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Average ROMI (%)</p>
          </div>
          <p className={`text-2xl font-extrabold ${summary.avg_romi > 0 ? "text-[hsl(var(--success))]" : "text-foreground"}`}>
            {summary.avg_romi !== 0 ? formatPct(summary.avg_romi) : "–"}
          </p>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-card rounded-xl border border-border/40 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {/* Group header row */}
              <tr className="bg-muted/30">
                <th rowSpan={2} className={`${thBase} sticky left-0 z-20 bg-card text-foreground min-w-[120px]`}>Month</th>
                <th colSpan={3} className={`${thBase} text-center bg-[hsl(160_84%_39%/0.15)] text-[hsl(var(--success))]`}>E-commerce</th>
                <th colSpan={2} className={`${thBase} text-center bg-[hsl(38_92%_50%/0.12)] text-[hsl(var(--warning))]`}>Non-gov</th>
                <th colSpan={3} className={`${thBase} text-center bg-[hsl(210_100%_60%/0.12)] text-[hsl(var(--chart-2))]`}>Government</th>
                <th colSpan={4} className={`${thBase} text-center bg-muted/50 text-foreground`}>Subtotals & Total</th>
                <th colSpan={2} className={`${thBase} text-center bg-[hsl(262_52%_56%/0.12)] text-[hsl(var(--chart-5))]`}>Investment</th>
                <th colSpan={3} className={`${thBase} text-center bg-[hsl(var(--success)/0.1)] text-[hsl(var(--success))]`}>ROI</th>
                {isAdmin && <th rowSpan={2} className={`${thBase} bg-card text-center`}>Action</th>}
              </tr>
              {/* Sub header row */}
              <tr className="bg-muted/20">
                <th className={`${thBase} text-right`}>Tokopedia</th>
                <th className={`${thBase} text-right`}>Webstore</th>
                <th className={`${thBase} text-right`}>Shopee</th>
                <th className={`${thBase} text-right`}>Kommo</th>
                <th className={`${thBase} text-right`}>Direct Selling</th>
                <th className={`${thBase} text-right`}>INAPROC</th>
                <th className={`${thBase} text-right`}>E-Catalogue</th>
                <th className={`${thBase} text-right`}>Direct Selling</th>
                <th className={`${thBase} text-right font-bold bg-[hsl(160_84%_39%/0.08)]`}>E-Commerce</th>
                <th className={`${thBase} text-right font-bold bg-[hsl(38_92%_50%/0.06)]`}>Non-gov</th>
                <th className={`${thBase} text-right font-bold bg-[hsl(210_100%_60%/0.06)]`}>Government</th>
                <th className={`${thBase} text-right font-extrabold bg-muted/40`}>TOTAL</th>
                <th className={`${thBase} text-right`}>Marketing Exp.</th>
                <th className={`${thBase} text-right`}>Digital Mktg Exp.</th>
                <th className={`${thBase} text-right`}>ROMI (%)</th>
                <th className={`${thBase} text-right`}>ROI E-comm (%)</th>
                <th className={`${thBase} text-right`}>ROI Non-gov (%)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const show = hasData(r);
                const cellBase = "px-4 py-3 text-right whitespace-nowrap border-b border-r border-border/20";
                return (
                  <tr key={r.month} className={`${show ? "bg-card" : "bg-muted/10"} hover:bg-muted/20 transition-colors`}>
                    <td className={`px-4 py-3 font-semibold text-foreground border-b border-r border-border/20 sticky left-0 z-10 ${show ? "bg-card" : "bg-muted/10"}`}>
                      {r.month}
                    </td>
                    <td className={cellBase}>{show ? formatRp(r.raw.tokopedia) : "–"}</td>
                    <td className={cellBase}>{show ? formatRp(r.raw.webstore) : "–"}</td>
                    <td className={cellBase}>{show ? formatRp(r.raw.shopee) : "–"}</td>
                    <td className={cellBase}>{show ? formatRp(r.raw.kommo) : "–"}</td>
                    <td className={cellBase}>{show ? formatRp(r.raw.direct_selling_nongov) : "–"}</td>
                    <td className={cellBase}>{show ? formatRp(r.raw.inaproc) : "–"}</td>
                    <td className={cellBase}>{show ? formatRp(r.raw.e_catalogue) : "–"}</td>
                    <td className={cellBase}>{show ? formatRp(r.raw.direct_selling_gov) : "–"}</td>
                    <td className={`${cellBase} font-bold bg-[hsl(160_84%_39%/0.04)]`}>{show ? formatRp(r.ecommerce_total) : "–"}</td>
                    <td className={`${cellBase} font-bold bg-[hsl(38_92%_50%/0.04)]`}>{show ? formatRp(r.nongov_total) : "–"}</td>
                    <td className={`${cellBase} font-bold bg-[hsl(210_100%_60%/0.04)]`}>{show ? formatRp(r.gov_total) : "–"}</td>
                    <td className={`${cellBase} font-extrabold bg-muted/20`}>{show ? formatRp(r.grand_total) : "–"}</td>
                    <td className={cellBase}>{show ? formatRp(r.raw.marketing_expense) : "–"}</td>
                    <td className={cellBase}>{show ? formatRp(r.raw.digital_marketing_expenses) : "–"}</td>
                    <td className={`${cellBase} font-bold ${r.romi_percent > 0 ? "text-[hsl(var(--success))]" : ""}`}>{show ? formatPct(r.romi_percent) : "–"}</td>
                    <td className={`${cellBase} font-bold ${r.roi_ecommerce_percent > 0 ? "text-[hsl(var(--success))]" : ""}`}>{show ? formatPct(r.roi_ecommerce_percent) : "–"}</td>
                    <td className={`${cellBase} font-bold ${r.roi_nongov_percent > 0 ? "text-[hsl(var(--success))]" : ""}`}>{show ? formatPct(r.roi_nongov_percent) : "–"}</td>
                    {isAdmin && (
                      <td className={`px-4 py-3 border-b border-border/20 text-center ${show ? "bg-card" : "bg-muted/10"}`}>
                        <Button variant="ghost" size="sm" onClick={() => setEditMonth(r.month)} className="gap-1 text-xs">
                          <Pencil className="w-3 h-3" /> Edit
                        </Button>
                      </td>
                    )}
                  </tr>
                );
              })}
              {/* Total row */}
              <tr className="bg-primary/5 font-bold border-t-2 border-primary/20">
                <td className="px-4 py-4 font-extrabold text-foreground border-r border-border/20 sticky left-0 z-10 bg-primary/5">
                  TOTAL
                </td>
                <td className="px-4 py-4 text-right border-r border-border/20">{formatRp(summary.tokopedia)}</td>
                <td className="px-4 py-4 text-right border-r border-border/20">{formatRp(summary.webstore)}</td>
                <td className="px-4 py-4 text-right border-r border-border/20">{formatRp(summary.shopee)}</td>
                <td className="px-4 py-4 text-right border-r border-border/20">{formatRp(summary.kommo)}</td>
                <td className="px-4 py-4 text-right border-r border-border/20">{formatRp(summary.direct_selling_nongov)}</td>
                <td className="px-4 py-4 text-right border-r border-border/20">{formatRp(summary.inaproc)}</td>
                <td className="px-4 py-4 text-right border-r border-border/20">{formatRp(summary.e_catalogue)}</td>
                <td className="px-4 py-4 text-right border-r border-border/20">{formatRp(summary.direct_selling_gov)}</td>
                <td className="px-4 py-4 text-right border-r border-border/20 bg-[hsl(160_84%_39%/0.06)]">{formatRp(summary.ecommerce_total)}</td>
                <td className="px-4 py-4 text-right border-r border-border/20 bg-[hsl(38_92%_50%/0.06)]">{formatRp(summary.nongov_total)}</td>
                <td className="px-4 py-4 text-right border-r border-border/20 bg-[hsl(210_100%_60%/0.06)]">{formatRp(summary.gov_total)}</td>
                <td className="px-4 py-4 text-right border-r border-border/20 font-extrabold bg-muted/30">{formatRp(summary.grand_total)}</td>
                <td className="px-4 py-4 text-right border-r border-border/20">{formatRp(summary.marketing_expense)}</td>
                <td className="px-4 py-4 text-right border-r border-border/20">{formatRp(summary.digital_marketing_expenses)}</td>
                <td className={`px-4 py-4 text-right border-r border-border/20 ${summary.avg_romi > 0 ? "text-[hsl(var(--success))]" : ""}`}>{formatPct(summary.avg_romi)}</td>
                <td className="px-4 py-4 text-right border-r border-border/20">–</td>
                <td className="px-4 py-4 text-right border-r border-border/20">–</td>
                {isAdmin && <td className="px-4 py-4 border-border/20" />}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Dialog */}
      {editMonth && (
        <SalesRecapEditDialog
          month={editMonth}
          year={selectedYear}
          initialData={allData?.[`${editMonth} ${selectedYear}`] as SalesRecapMonthData | undefined}
          onClose={() => setEditMonth(null)}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ["sales_recap", selectedYear] });
            setEditMonth(null);
          }}
        />
      )}
    </div>
  );
}
