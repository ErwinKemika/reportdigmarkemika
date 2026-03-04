import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SalesRecapMonthData } from "@/pages/SalesRecapPage";

const PAGE_KEY = "sales_recap_classified_by_channel";

const emptyRow: SalesRecapMonthData = {
  tokopedia: 0, webstore: 0, shopee: 0,
  kommo: 0, direct_selling_nongov: 0,
  inaproc: 0, e_catalogue: 0, direct_selling_gov: 0,
  marketing_expense: 0, digital_marketing_expenses: 0,
};

interface Props {
  month: string;
  year: number;
  initialData?: SalesRecapMonthData;
  onClose: () => void;
  onSaved: () => void;
}

type FieldKey = keyof SalesRecapMonthData;
interface FieldDef { key: FieldKey; label: string; }

const sections: { title: string; color: string; fields: FieldDef[] }[] = [
  {
    title: "Non-gov", color: "bg-[hsl(38_92%_50%/0.08)]",
    fields: [
      { key: "kommo", label: "Kommo (Rp)" },
      { key: "direct_selling_nongov", label: "Direct Selling (Rp)" },
    ],
  },
  {
    title: "Government", color: "bg-[hsl(210_100%_60%/0.08)]",
    fields: [
      { key: "inaproc", label: "INAPROC (Rp)" },
      { key: "e_catalogue", label: "E-Catalogue (Rp)" },
      { key: "direct_selling_gov", label: "Direct Selling Gov (Rp)" },
    ],
  },
  {
    title: "Expenses", color: "bg-[hsl(262_52%_56%/0.08)]",
    fields: [
      { key: "marketing_expense", label: "Marketing Expense (Rp)" },
      { key: "digital_marketing_expenses", label: "Digital Marketing Expense (Rp)" },
    ],
  },
];

export function SalesRecapEditDialog({ month, year, initialData, onClose, onSaved }: Props) {
  const [values, setValues] = useState<SalesRecapMonthData>({ ...emptyRow, ...initialData });
  const [saving, setSaving] = useState(false);

  const handleChange = (key: FieldKey, raw: string) => {
    const num = raw === "" ? 0 : Number(raw);
    if (isNaN(num)) return;
    setValues(prev => ({ ...prev, [key]: num }));
  };

  // Live preview calculations
  const preview = useMemo(() => {
    const d = values;
    const ecommerce_total = d.tokopedia + d.webstore + d.shopee;
    const nongov_total = d.kommo + d.direct_selling_nongov;
    const gov_total = d.inaproc + d.e_catalogue + d.direct_selling_gov;
    const grand_total = ecommerce_total + nongov_total + gov_total;
    const romi = d.marketing_expense > 0 ? ((grand_total - d.marketing_expense) / d.marketing_expense) * 100 : 0;
    const roi_ecom = d.digital_marketing_expenses > 0 ? ((ecommerce_total - d.digital_marketing_expenses) / d.digital_marketing_expenses) * 100 : 0;
    const roi_nongov = d.marketing_expense > 0 ? ((nongov_total - d.marketing_expense) / d.marketing_expense) * 100 : 0;
    return { ecommerce_total, nongov_total, gov_total, grand_total, romi, roi_ecom, roi_nongov };
  }, [values]);

  const formatRp = (v: number) => `Rp ${v.toLocaleString("id-ID")}`;

  const handleSave = async () => {
    setSaving(true);
    const period = `${month} ${year}`;
    const { error } = await supabase
      .from("page_data")
      .upsert({ period, page_key: PAGE_KEY, data: values as any }, { onConflict: "period,page_key" });
    setSaving(false);
    if (error) {
      toast.error("Gagal menyimpan: " + error.message);
    } else {
      toast.success("Data berhasil disimpan!");
      onSaved();
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Sales Recap — {month} {year}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-5 pr-1">
          {sections.map(section => (
            <div key={section.title} className={`rounded-lg p-4 ${section.color}`}>
              <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">{section.title}</p>
              <div className="grid grid-cols-2 gap-3">
                {section.fields.map(f => (
                  <div key={f.key} className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{f.label}</Label>
                    <Input
                      type="number"
                      min="0"
                      value={values[f.key] || ""}
                      onChange={e => handleChange(f.key, e.target.value)}
                      className="bg-card"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Live Preview */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Auto-Calculated Preview</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span>E-Commerce Total: <strong>{formatRp(preview.ecommerce_total)}</strong></span>
              <span>Non-gov Total: <strong>{formatRp(preview.nongov_total)}</strong></span>
              <span>Government Total: <strong>{formatRp(preview.gov_total)}</strong></span>
              <span className="font-extrabold">Grand Total: <strong>{formatRp(preview.grand_total)}</strong></span>
            </div>
            <div className="border-t border-border/40 pt-2 mt-2 grid grid-cols-3 gap-2 text-sm">
              <span>ROMI: <strong className={preview.romi > 0 ? "text-[hsl(var(--success))]" : ""}>{preview.romi.toFixed(2)}%</strong></span>
              <span>ROI E-com: <strong className={preview.roi_ecom > 0 ? "text-[hsl(var(--success))]" : ""}>{preview.roi_ecom.toFixed(2)}%</strong></span>
              <span>ROI Non-gov: <strong className={preview.roi_nongov > 0 ? "text-[hsl(var(--success))]" : ""}>{preview.roi_nongov.toFixed(2)}%</strong></span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-3 border-t border-border/40">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            {saving ? "Saving..." : "Simpan Data"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
