import { useState } from "react";
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
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);

  // Fetch sales recap data
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

  // Fetch Webstore revenue
  const { data: webstoreData } = useQuery({
    queryKey: ["page_data", period, "webstore_sales"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_data")
        .select("data")
        .eq("period", period)
        .eq("page_key", "webstore_sales")
        .maybeSingle();
      if (error) throw error;
      return data?.data as Record<string, any> | null;
    },
  });

  // Fetch Marketplace revenue (Tokopedia & Shopee)
  const { data: marketplaceData } = useQuery({
    queryKey: ["page_data", period, "marketplace"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_data")
        .select("data")
        .eq("period", period)
        .eq("page_key", "marketplace")
        .maybeSingle();
      if (error) throw error;
      return data?.data as Record<string, any> | null;
    },
  });

  // Auto-fill E-Commerce from channel data
  const autoTokopedia = marketplaceData?.tokopediaRevenue || 0;
  const autoShopee = marketplaceData?.shopeeRevenue || 0;
  const autoWebstore = (() => {
    if (!webstoreData) return 0;
    const products = webstoreData.topProductsSold || [];
    return webstoreData.totalRevenue || products.reduce((s: number, p: any) => s + (p.units || 0) * (p.pricePerUnit || p.price || 0), 0);
  })();

  const d: SalesRecapMonthData = {
    ...emptyRow,
    ...(monthData ?? {}),
    tokopedia: autoTokopedia,
    webstore: autoWebstore,
    shopee: autoShopee,
  };
  const c = calc(d);
  const show = c.grand_total > 0 || d.marketing_expense > 0;

  return (
    <div className="space-y-8 animate-fade-in">
      <SectionHeader
        title="Sales Recap Classified by Channel"
        subtitle={`Marketing Performance by Revenue — ${selectedMonth} ${selectedYear}`}
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
              value: show ? formatPct(c.romi_percent) : "–",
              isBold: true,
              isHighlight: c.romi_percent > 0,
            },
            {
              label: "ROI E-Commerce (%)",
              value: show ? formatPct(c.roi_ecommerce_percent) : "–",
              isBold: true,
              isHighlight: c.roi_ecommerce_percent > 0,
            },
            {
              label: "ROI Non-gov (%)",
              value: show ? formatPct(c.roi_nongov_percent) : "–",
              isBold: true,
              isHighlight: c.roi_nongov_percent > 0,
            },
          ]}
        />
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
