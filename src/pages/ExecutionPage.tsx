import { useMonth, MONTHS, type MonthName } from "@/contexts/MonthContext";
import { usePageData } from "@/hooks/usePageData";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { NoData } from "@/components/dashboard/NoData";
import { ActionTag } from "@/components/dashboard/ActionTag";
import { CheckCircle2, Clock, Loader2, XCircle, ListChecks, Target, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type ActionStatus = "Completed" | "Ongoing" | "Pending" | "Cancelled";

interface ExecutionData {
  statuses: {
    immediate: ActionStatus[];
    tactical: ActionStatus[];
    strategic: ActionStatus[];
  };
  impactNotes?: string;
}

const STATUS_CONFIG: Record<ActionStatus, { color: string; icon: React.ReactNode }> = {
  Completed: { color: "bg-success/15 text-success border-success/30", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  Ongoing: { color: "bg-primary/15 text-primary border-primary/30", icon: <Loader2 className="w-3.5 h-3.5" /> },
  Pending: { color: "bg-warning/15 text-warning border-warning/30", icon: <Clock className="w-3.5 h-3.5" /> },
  Cancelled: { color: "bg-destructive/15 text-destructive border-destructive/30", icon: <XCircle className="w-3.5 h-3.5" /> },
};

function getPreviousPeriod(month: MonthName, year: number): { period: string; label: string } {
  const idx = MONTHS.indexOf(month);
  if (idx === 0) {
    return { period: `December ${year - 1}`, label: `December ${year - 1}` };
  }
  return { period: `${MONTHS[idx - 1]} ${year}`, label: `${MONTHS[idx - 1]} ${year}` };
}

function StatusBadge({ status }: { status: ActionStatus }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
  return (
    <Badge variant="outline" className={`gap-1 text-[11px] font-medium px-2 py-0.5 border ${config.color}`}>
      {config.icon}
      {status}
    </Badge>
  );
}

export default function ExecutionPage() {
  const { selectedMonth, selectedYear, period } = useMonth();
  const prev = getPreviousPeriod(selectedMonth, selectedYear);

  // Read previous month's action plan
  const { data: prevRecommendations, isLoading: loadingRec } = usePageData(prev.period, "recommendations");

  // Read execution statuses for the current period
  const { data: rawExecutionData, isLoading: loadingExec } = usePageData<any>(period, "execution");

  const isLoading = loadingRec || loadingExec;

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading...</div>;

  // Build action items from previous month's data
  const immediateActions: { action: string; tag: string }[] = prevRecommendations?.actionPlan30 || [];
  const tacticalActions: { action: string; tag: string }[] = prevRecommendations?.actionPlan60 || [];
  const strategicActions: { action: string; tag: string }[] = prevRecommendations?.actionPlan90 || [];

  const totalActions = immediateActions.length + tacticalActions.length + strategicActions.length;

  // Parse execution data - supports both array format from edit and nested format
  const parseStatuses = (data: any): { immediate: ActionStatus[]; tactical: ActionStatus[]; strategic: ActionStatus[] } => {
    if (!data) return { immediate: [], tactical: [], strategic: [] };
    // From edit form: immediateStatuses, tacticalStatuses, strategicStatuses arrays
    const imm = (data.immediateStatuses || []).map((x: any) => x.status || "Pending");
    const tac = (data.tacticalStatuses || []).map((x: any) => x.status || "Pending");
    const str = (data.strategicStatuses || []).map((x: any) => x.status || "Pending");
    if (imm.length || tac.length || str.length) return { immediate: imm, tactical: tac, strategic: str };
    // Fallback to nested statuses object
    return data.statuses || { immediate: [], tactical: [], strategic: [] };
  };

  const statuses = parseStatuses(rawExecutionData);
  const impactNotes = rawExecutionData?.impactNotes || "";
  if (totalActions === 0) {
    return (
      <div className="space-y-10 animate-fade-in">
        <SectionHeader
          title={`Execution & Realization`}
          subtitle={`${selectedMonth} ${selectedYear}`}
          icon={<ListChecks className="w-4 h-4" />}
        />
        <NoData month={prev.label as any} />
        <p className="text-sm text-muted-foreground text-center">
          No action plan found for <strong>{prev.label}</strong>. Please ensure the Action Plan data for the previous month is available.
        </p>
      </div>
    );
  }

  // Get statuses
  const getStatus = (category: "immediate" | "tactical" | "strategic", index: number): ActionStatus => {
    const s = statuses[category]?.[index];
    const valid: ActionStatus[] = ["Completed", "Ongoing", "Pending", "Cancelled"];
    return valid.includes(s as ActionStatus) ? (s as ActionStatus) : "Pending";
  };

  // Calculate KPIs
  const allStatuses: ActionStatus[] = [
    ...immediateActions.map((_, i) => getStatus("immediate", i)),
    ...tacticalActions.map((_, i) => getStatus("tactical", i)),
    ...strategicActions.map((_, i) => getStatus("strategic", i)),
  ];

  const completed = allStatuses.filter(s => s === "Completed").length;
  const ongoing = allStatuses.filter(s => s === "Ongoing").length;
  const pending = allStatuses.filter(s => s === "Pending").length;
  const completionRate = totalActions > 0 ? Math.round((completed / totalActions) * 100) : 0;

  const kpiCards = [
    { label: "Total Planned", value: totalActions, icon: <Target className="w-5 h-5" />, color: "bg-muted-foreground" },
    { label: "Completed", value: completed, icon: <CheckCircle2 className="w-5 h-5" />, color: "bg-success" },
    { label: "Ongoing", value: ongoing, icon: <Loader2 className="w-5 h-5" />, color: "bg-primary" },
    { label: "Pending", value: pending, icon: <Clock className="w-5 h-5" />, color: "bg-warning" },
    { label: "Completion Rate", value: `${completionRate}%`, icon: <ListChecks className="w-5 h-5" />, color: completionRate >= 80 ? "bg-success" : completionRate >= 50 ? "bg-warning" : "bg-destructive" },
  ];

  const columnColors: Record<string, string> = {
    Immediate: "border-l-4 border-l-success bg-success/5",
    Tactical: "border-l-4 border-l-primary bg-primary/5",
    Strategic: "border-l-4 border-l-warning bg-warning/5",
  };

  const renderColumn = (
    title: string,
    actions: { action: string; tag: string }[],
    category: "immediate" | "tactical" | "strategic"
  ) => (
    <div className={`bg-card rounded-xl border border-border/40 p-6 shadow-card ${columnColors[title] || ""}`}>
      <h3 className="text-section-title text-card-foreground mb-5">{title}</h3>
      <div className="space-y-1">
        {actions.map((item, i) => {
          const status = getStatus(category, i);
          return (
            <div key={i} className="flex items-start gap-3 py-2.5 border-b border-border/20 last:border-0">
              <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {i + 1}
              </span>
              <div className="flex-1 space-y-1.5">
                <p className="text-sm text-card-foreground leading-relaxed">{item.action}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <ActionTag tag={item.tag} />
                  <StatusBadge status={status} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-10 animate-fade-in">
      <SectionHeader
        title={`Execution & Realization`}
        subtitle={`${selectedMonth} ${selectedYear}`}
        icon={<ListChecks className="w-4 h-4" />}
      />

      {/* Reference info */}
      <div className="bg-muted/30 rounded-lg px-4 py-2.5 text-xs text-muted-foreground">
        Showing realization of <strong className="text-foreground">{prev.label}</strong> action plan
      </div>

      {/* Section 1 - KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {kpiCards.map((kpi, i) => (
          <div key={i} className="bg-card rounded-xl border border-border/40 p-5 shadow-card text-center">
            <div className={`w-10 h-10 ${kpi.color} rounded-xl flex items-center justify-center mx-auto mb-3 text-primary-foreground shadow-card`}>
              {kpi.icon}
            </div>
            <p className="text-xl font-extrabold text-card-foreground mb-1 tracking-tight">{kpi.value}</p>
            <p className="text-label text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Section 2 - Action Status Breakdown */}
      <div>
        <h3 className="text-section-title text-foreground mb-5">Action Status Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {renderColumn("Immediate", immediateActions, "immediate")}
          {renderColumn("Tactical", tacticalActions, "tactical")}
          {renderColumn("Strategic", strategicActions, "strategic")}
        </div>
      </div>

      {/* Section 3 - Impact Notes */}
      {impactNotes && (
        <div className="bg-tint-blue rounded-xl border border-channel-google/15 p-8 shadow-card">
          <div className="flex items-center gap-2.5 mb-4">
            <FileText className="w-4 h-4 text-channel-google" />
            <h3 className="font-semibold text-sm text-card-foreground">Impact Notes</h3>
          </div>
          <p className="text-sm text-card-foreground leading-relaxed">{impactNotes}</p>
        </div>
      )}
    </div>
  );
}
