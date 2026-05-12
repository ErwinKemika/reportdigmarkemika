import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMonth } from "@/contexts/MonthContext";
import { useUpsertDashboardData, DashboardInsert } from "@/hooks/useDashboardData";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil } from "lucide-react";

const REQUIRED_FIELDS: { key: keyof DashboardInsert; label: string }[] = [
  { key: "revenue", label: "Revenue" },
  { key: "target_revenue", label: "Target Revenue" },
  { key: "traffic", label: "Traffic" },
  { key: "target_traffic", label: "Target Traffic" },
];

const CHANNELS = ["Tokopedia", "Shopee", "Webstore", "Google Ads", "Meta Ads"];

interface FieldDef {
  key: keyof DashboardInsert;
  label: string;
  type: "integer" | "decimal" | "currency";
}

const FIELDS: FieldDef[] = [
  { key: "traffic", label: "Traffic (Visitors)", type: "integer" },
  { key: "target_traffic", label: "Target Traffic", type: "integer" },
  { key: "conversion_rate", label: "Conversion Rate (%)", type: "decimal" },
  { key: "target_cr", label: "Target CR (%)", type: "decimal" },
  { key: "revenue", label: "Revenue (Rp)", type: "currency" },
  { key: "target_revenue", label: "Target Revenue (Rp)", type: "currency" },
  { key: "budget", label: "Budget (Rp)", type: "currency" },
  { key: "ad_spend", label: "Ad Spend (Rp)", type: "currency" },
  { key: "sessions", label: "Sessions", type: "integer" },
  { key: "users_count", label: "Users", type: "integer" },
  { key: "orders", label: "Orders", type: "integer" },
  { key: "units_sold", label: "Units Sold", type: "integer" },
  { key: "clicks", label: "Clicks", type: "integer" },
  { key: "impressions", label: "Impressions", type: "integer" },
];

const defaultValues: Omit<DashboardInsert, "period" | "channel"> = {
  traffic: 0, target_traffic: 0, conversion_rate: 0, target_cr: 0,
  revenue: 0, target_revenue: 0, budget: 0, ad_spend: 0,
  sessions: 0, users_count: 0, orders: 0, units_sold: 0, clicks: 0, impressions: 0,
};

interface EditDataDialogProps {
  defaultChannel?: string;
  relevantFields?: (keyof DashboardInsert)[];
}

export function EditDataDialog({ defaultChannel, relevantFields }: EditDataDialogProps) {
  const { user, isAdmin } = useAuth();
  const { selectedMonth } = useMonth();
  const upsert = useUpsertDashboardData();
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [zeroFields, setZeroFields] = useState<string[]>([]);
  const [channel, setChannel] = useState(defaultChannel || CHANNELS[0]);
  const [values, setValues] = useState(defaultValues);

  useEffect(() => {
    if (defaultChannel) setChannel(defaultChannel);
  }, [defaultChannel]);

  const isSuperAdmin = user?.email === "marketplacekemika@gmail.com" || isAdmin;
  if (!isSuperAdmin) return null;

  const fields = relevantFields
    ? FIELDS.filter(f => relevantFields.includes(f.key))
    : FIELDS;

  const handleChange = (key: keyof typeof defaultValues, raw: string) => {
    const num = raw === "" ? 0 : Number(raw);
    if (isNaN(num)) return;
    setValues(prev => ({ ...prev, [key]: num }));
  };

  const doSave = () => {
    upsert.mutate({ period: selectedMonth, channel, ...values });
    setOpen(false);
    setConfirmOpen(false);
  };

  const handleSave = () => {
    const emptyRequired = REQUIRED_FIELDS
      .filter(f => fields.some(ff => ff.key === f.key))
      .filter(f => !values[f.key as keyof typeof defaultValues]);
    if (emptyRequired.length > 0) {
      setZeroFields(emptyRequired.map(f => f.label));
      setConfirmOpen(true);
    } else {
      doSave();
    }
  };

  // Auto-calculated preview
  const achievementPct = values.target_revenue > 0 ? (values.revenue / values.target_revenue * 100) : 0;
  const roas = values.ad_spend > 0 ? (values.revenue / values.ad_spend) : 0;
  const roiPct = values.budget > 0 ? ((values.revenue - values.budget) / values.budget * 100) : 0;
  const trafficAchPct = values.target_traffic > 0 ? (values.traffic / values.target_traffic * 100) : 0;

  return (
    <>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Pencil className="w-4 h-4" /> Edit Data
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Data — {selectedMonth}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Channel</Label>
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CHANNELS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {fields.map(f => (
              <div key={f.key} className="space-y-1">
                <Label className="text-xs">{f.label}</Label>
                <Input
                  type="number"
                  step={f.type === "decimal" ? "0.01" : "1"}
                  min="0"
                  value={values[f.key as keyof typeof defaultValues] || ""}
                  onChange={e => handleChange(f.key as keyof typeof defaultValues, e.target.value)}
                />
              </div>
            ))}
          </div>

          {/* Auto-calculated preview */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Auto-Calculated</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span>Achievement: <strong>{achievementPct.toFixed(1)}%</strong></span>
              <span>ROAS: <strong>{roas.toFixed(2)}x</strong></span>
              <span>ROI: <strong>{roiPct.toFixed(1)}%</strong></span>
              <span>Traffic Ach: <strong>{trafficAchPct.toFixed(1)}%</strong></span>
            </div>
          </div>

          <Button onClick={handleSave} disabled={upsert.isPending} className="w-full">
            {upsert.isPending ? "Saving..." : "Simpan Data"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Konfirmasi Simpan</AlertDialogTitle>
          <AlertDialogDescription>
            Beberapa field penting masih bernilai 0: {zeroFields.join(", ")}. Yakin ingin menyimpan data ini?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={doSave}>Simpan Tetap</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
