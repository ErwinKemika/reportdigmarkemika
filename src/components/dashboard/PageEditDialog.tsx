import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMonth } from "@/contexts/MonthContext";
import { usePageData, useUpsertPageData } from "@/hooks/usePageData";
import { PageSchema, FieldGroup, ArrayFieldDef } from "./pageEditSchemas";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency } from "@/data/mockData";

interface PageEditDialogProps {
  schema: PageSchema;
}

export function PageEditDialog({ schema }: PageEditDialogProps) {
  const { isAdmin } = useAuth();
  const { period } = useMonth();
  const { data: existingData } = usePageData(period, schema.pageKey);
  const upsert = useUpsertPageData();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, any>>({});

  // Prefill when opening or data changes
  useEffect(() => {
    if (open && existingData) {
      setValues(existingData);
    } else if (open) {
      setValues({});
    }
  }, [open, existingData]);

  // Auto-calculated total revenue for webstore
  const autoTotalRevenue = useMemo(() => {
    if (schema.pageKey !== "webstore-sales") return null;
    const products: any[] = values.topProductsSold || [];
    return products.reduce((sum: number, p: any) => sum + ((p.units || 0) * (p.pricePerUnit || 0)), 0);
  }, [schema.pageKey, values.topProductsSold]);

  // Auto-calculated combined revenue for marketplace
  const autoMarketplaceCombinedRevenue = useMemo(() => {
    if (schema.pageKey !== "marketplace") return null;
    return (Number(values.tokopediaRevenue) || 0) + (Number(values.shopeeRevenue) || 0);
  }, [schema.pageKey, values.tokopediaRevenue, values.shopeeRevenue]);

  const autoMarketplacePrevCombinedRevenue = useMemo(() => {
    if (schema.pageKey !== "marketplace") return null;
    return (Number(values.previousTokopediaRevenue) || 0) + (Number(values.previousShopeeRevenue) || 0);
  }, [schema.pageKey, values.previousTokopediaRevenue, values.previousShopeeRevenue]);

  if (!isAdmin) return null;

  const handleFieldChange = (key: string, raw: string, type: string) => {
    if (type === "text" || type === "textarea") {
      setValues(prev => ({ ...prev, [key]: raw }));
    } else {
      const num = raw === "" ? 0 : Number(raw);
      if (isNaN(num)) return;
      setValues(prev => ({ ...prev, [key]: num }));
    }
  };

  const handleArrayChange = (arrayKey: string, rowIndex: number, colKey: string, value: string, colType: string) => {
    const arr = [...(values[arrayKey] || [])];
    if (!arr[rowIndex]) arr[rowIndex] = {};
    if (colType === "text" || colType === "textarea") {
      arr[rowIndex] = { ...arr[rowIndex], [colKey]: value };
    } else {
      const num = value === "" ? 0 : Number(value);
      if (isNaN(num)) return;
      arr[rowIndex] = { ...arr[rowIndex], [colKey]: num };
    }
    setValues(prev => ({ ...prev, [arrayKey]: arr }));
  };

  const addArrayRow = (arrayKey: string) => {
    const arr = [...(values[arrayKey] || [])];
    arr.push({});
    setValues(prev => ({ ...prev, [arrayKey]: arr }));
  };

  const removeArrayRow = (arrayKey: string, rowIndex: number) => {
    const arr = [...(values[arrayKey] || [])];
    arr.splice(rowIndex, 1);
    setValues(prev => ({ ...prev, [arrayKey]: arr }));
  };

  const handleSave = () => {
    upsert.mutate({ period, pageKey: schema.pageKey, data: values });
    setOpen(false);
  };

  // Build tabs: "Fields" + each array section
  const hasGroups = schema.groups.length > 0;
  const hasArrays = (schema.arrayFields?.length || 0) > 0;
  const needsTabs = hasGroups && hasArrays;

  const renderFieldGroups = () => (
    <div className="space-y-6">
      {/* Marketplace auto-calculated combined revenue */}
      {schema.pageKey === "marketplace" && (
        <div className="p-4 bg-muted/30 rounded-lg space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Combined Revenue (Auto)</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[10px] text-muted-foreground">Total Combined Revenue</Label>
              <div className="h-9 flex items-center text-sm font-bold text-success px-3 bg-muted/50 rounded-md">
                {formatCurrency(autoMarketplaceCombinedRevenue || 0)}
              </div>
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Previous Combined Revenue</Label>
              <div className="h-9 flex items-center text-sm font-bold text-muted-foreground px-3 bg-muted/50 rounded-md">
                {formatCurrency(autoMarketplacePrevCombinedRevenue || 0)}
              </div>
            </div>
          </div>
        </div>
      )}
      {schema.groups.map((group, gi) => (
        <div key={gi}>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{group.title}</h4>
          <div className="grid grid-cols-2 gap-3">
            {group.fields.map(f => (
              <div key={f.key} className={`space-y-1 ${f.type === "textarea" ? "col-span-2" : ""}`}>
                <Label className="text-xs">{f.label}</Label>
                {f.type === "textarea" ? (
                  <Textarea
                    value={values[f.key] || ""}
                    onChange={e => handleFieldChange(f.key, e.target.value, f.type)}
                    className="text-sm min-h-[80px]"
                    placeholder={f.placeholder}
                  />
                ) : (
                  <Input
                    type={f.type === "text" ? "text" : "number"}
                    step={f.type === "percent" ? "0.01" : "1"}
                    min="0"
                    value={values[f.key] ?? ""}
                    onChange={e => handleFieldChange(f.key, e.target.value, f.type)}
                    placeholder={f.placeholder}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderArrayField = (af: ArrayFieldDef) => {
    const rows: any[] = values[af.key] || [];
    const isWebstoreProducts = schema.pageKey === "webstore-sales" && af.key === "topProductsSold";
    const isMarketplaceProducts = schema.pageKey === "marketplace" && (af.key === "tokopediaTopProducts" || af.key === "shopeeTopProducts");
    const showAutoRevenue = isWebstoreProducts || isMarketplaceProducts;
    return (
      <div key={af.key} className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{af.label}</h4>
          {(!af.maxRows || rows.length < af.maxRows) && (
            <Button type="button" variant="outline" size="sm" onClick={() => addArrayRow(af.key)} className="gap-1 h-7 text-xs">
              <Plus className="w-3 h-3" /> Add Row
            </Button>
          )}
        </div>
        {rows.length === 0 && (
          <p className="text-xs text-muted-foreground italic">No items yet. Click "Add Row" to start.</p>
        )}
        {rows.map((row, ri) => {
          const rowRevenue = showAutoRevenue ? (row.units || 0) * (row.pricePerUnit || 0) : 0;
          return (
            <div key={ri} className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
              <div className="flex-1 grid grid-cols-2 gap-2">
                {af.columns.map(col => (
                  <div key={col.key} className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">{col.label}</Label>
                    <Input
                      type={col.type === "text" ? "text" : "number"}
                      step={col.type === "percent" ? "0.01" : "1"}
                      min="0"
                      value={row[col.key] ?? ""}
                      onChange={e => handleArrayChange(af.key, ri, col.key, e.target.value, col.type)}
                      className="h-8 text-sm"
                    />
                  </div>
                ))}
                {showAutoRevenue && (
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Revenue (auto)</Label>
                    <div className="h-8 flex items-center text-sm font-semibold text-success px-3 bg-muted/50 rounded-md">
                      {formatCurrency(rowRevenue)}
                    </div>
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeArrayRow(af.key, ri)}
                className="h-8 w-8 p-0 mt-5 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          );
        })}
        {isWebstoreProducts && rows.length > 0 && (
          <div className="flex justify-between items-center pt-2 border-t border-border/40">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Total Revenue</span>
            <span className="text-sm font-bold text-success">{formatCurrency(autoTotalRevenue || 0)}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Pencil className="w-4 h-4" /> Edit Data
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-base">
            Edit {schema.pageTitle} — {period}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          {needsTabs ? (
            <Tabs defaultValue="fields" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="fields">Fields</TabsTrigger>
                {schema.arrayFields?.map(af => (
                  <TabsTrigger key={af.key} value={af.key}>{af.label}</TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value="fields">{renderFieldGroups()}</TabsContent>
              {schema.arrayFields?.map(af => (
                <TabsContent key={af.key} value={af.key}>
                  {renderArrayField(af)}
                </TabsContent>
              ))}
            </Tabs>
          ) : hasGroups ? (
            renderFieldGroups()
          ) : hasArrays ? (
            <div className="space-y-6">
              {schema.arrayFields?.map(af => renderArrayField(af))}
            </div>
          ) : null}
        </ScrollArea>

        <div className="flex gap-3 pt-4 border-t border-border/40">
          <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={upsert.isPending} className="flex-1">
            {upsert.isPending ? "Saving..." : "Save Data"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
