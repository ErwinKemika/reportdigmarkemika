import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMonth } from "@/contexts/MonthContext";
import { useAuth } from "@/contexts/AuthContext";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { Button } from "@/components/ui/button";
import { Pencil, FileSpreadsheet, TrendingUp, DollarSign, Megaphone } from "lucide-react";
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
  const { selectedMonth, selectedYear, period } = useMonth();
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);

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

  const d: SalesRecapMonthData = { ...emptyRow, ...(monthData ?? {}) };
  const c = calc(d);
  const show = c.grand_total > 0 || d.marketing_expense > 0;

  const thBase = "px-4 py-3 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap border-b border-r border-border/40";
  const cellBase = "px-4 py-3 text-right whitespace-nowrap border-b border-r border-border/20";

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
          <p className="text-2xl font-extrabold text-foreground">{formatRp(c.grand_total)}</p>
        </div>
        <div className="bg-card rounded-xl border border-border/40 shadow-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Megaphone className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Marketing Expense</p>
          </div>
          <p className="text-2xl font-extrabold text-foreground">{formatRp(d.marketing_expense)}</p>
        </div>
        <div className="bg-card rounded-xl border border-border/40 shadow-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Digital Marketing Expense</p>
          </div>
          <p className="text-2xl font-extrabold text-foreground">{formatRp(d.digital_marketing_expenses)}</p>
        </div>
        <div className="bg-card rounded-xl border border-border/40 shadow-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">ROMI (%)</p>
          </div>
          <p className={`text-2xl font-extrabold ${c.romi_percent > 0 ? "text-[hsl(var(--success))]" : "text-foreground"}`}>
            {c.romi_percent !== 0 ? formatPct(c.romi_percent) : "–"}
          </p>
        </div>
      </div>

      {/* Admin Edit Button */}
      {isAdmin && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setEditOpen(true)}>
            <Pencil className="w-4 h-4" /> Edit Data
          </Button>
        </div>
      )}

      {/* Main Table — single month row */}
      <div className="bg-card rounded-xl border border-border/40 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30">
                <th rowSpan={2} className={`${thBase} sticky left-0 z-20 bg-card text-foreground min-w-[120px]`}>Month</th>
                <th colSpan={3} className={`${thBase} text-center bg-[hsl(160_84%_39%/0.15)] text-[hsl(var(--success))]`}>E-commerce</th>
                <th colSpan={2} className={`${thBase} text-center bg-[hsl(38_92%_50%/0.12)] text-[hsl(var(--warning))]`}>Non-gov</th>
                <th colSpan={3} className={`${thBase} text-center bg-[hsl(210_100%_60%/0.12)] text-[hsl(var(--chart-2))]`}>Government</th>
                <th colSpan={4} className={`${thBase} text-center bg-muted/50 text-foreground`}>Subtotals & Total</th>
                <th colSpan={2} className={`${thBase} text-center bg-[hsl(262_52%_56%/0.12)] text-[hsl(var(--chart-5))]`}>Investment</th>
                <th colSpan={3} className={`${thBase} text-center bg-[hsl(var(--success)/0.1)] text-[hsl(var(--success))]`}>ROI</th>
              </tr>
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
              <tr className={`${show ? "bg-card" : "bg-muted/10"} hover:bg-muted/20 transition-colors`}>
                <td className={`px-4 py-3 font-semibold text-foreground border-b border-r border-border/20 sticky left-0 z-10 ${show ? "bg-card" : "bg-muted/10"}`}>
                  {selectedMonth}
                </td>
                <td className={cellBase}>{show ? formatRp(d.tokopedia) : "–"}</td>
                <td className={cellBase}>{show ? formatRp(d.webstore) : "–"}</td>
                <td className={cellBase}>{show ? formatRp(d.shopee) : "–"}</td>
                <td className={cellBase}>{show ? formatRp(d.kommo) : "–"}</td>
                <td className={cellBase}>{show ? formatRp(d.direct_selling_nongov) : "–"}</td>
                <td className={cellBase}>{show ? formatRp(d.inaproc) : "–"}</td>
                <td className={cellBase}>{show ? formatRp(d.e_catalogue) : "–"}</td>
                <td className={cellBase}>{show ? formatRp(d.direct_selling_gov) : "–"}</td>
                <td className={`${cellBase} font-bold bg-[hsl(160_84%_39%/0.04)]`}>{show ? formatRp(c.ecommerce_total) : "–"}</td>
                <td className={`${cellBase} font-bold bg-[hsl(38_92%_50%/0.04)]`}>{show ? formatRp(c.nongov_total) : "–"}</td>
                <td className={`${cellBase} font-bold bg-[hsl(210_100%_60%/0.04)]`}>{show ? formatRp(c.gov_total) : "–"}</td>
                <td className={`${cellBase} font-extrabold bg-muted/20`}>{show ? formatRp(c.grand_total) : "–"}</td>
                <td className={cellBase}>{show ? formatRp(d.marketing_expense) : "–"}</td>
                <td className={cellBase}>{show ? formatRp(d.digital_marketing_expenses) : "–"}</td>
                <td className={`${cellBase} font-bold ${c.romi_percent > 0 ? "text-[hsl(var(--success))]" : ""}`}>{show ? formatPct(c.romi_percent) : "–"}</td>
                <td className={`${cellBase} font-bold ${c.roi_ecommerce_percent > 0 ? "text-[hsl(var(--success))]" : ""}`}>{show ? formatPct(c.roi_ecommerce_percent) : "–"}</td>
                <td className={`${cellBase} font-bold ${c.roi_nongov_percent > 0 ? "text-[hsl(var(--success))]" : ""}`}>{show ? formatPct(c.roi_nongov_percent) : "–"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Dialog */}
      {editOpen && (
        <SalesRecapEditDialog
          month={selectedMonth}
          year={selectedYear}
          initialData={monthData ?? undefined}
          onClose={() => setEditOpen(false)}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ["sales_recap", period] });
            setEditOpen(false);
          }}
        />
      )}
    </div>
  );
}
