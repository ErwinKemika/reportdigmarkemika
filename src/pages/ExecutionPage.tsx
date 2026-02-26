import { useMonth, MONTHS, type MonthName } from "@/contexts/MonthContext";
import { usePageData } from "@/hooks/usePageData";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { NoData } from "@/components/dashboard/NoData";
import { ActionTag } from "@/components/dashboard/ActionTag";
import {
  CheckCircle2, Clock, Loader2, XCircle, ListChecks, Target,
  FileText, Calendar, AlertTriangle, Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useRef, useState, useMemo } from "react";

type ActionStatus = "Completed" | "Ongoing" | "Pending" | "Cancelled";

const STATUS_GRADIENT: Record<ActionStatus, string> = {
  Completed: "from-emerald-400/80 to-emerald-500/60",
  Ongoing: "from-sky-400/80 to-sky-500/60",
  Pending: "from-amber-400/80 to-amber-500/60",
  Cancelled: "from-rose-400/80 to-rose-500/60",
};

const STATUS_BADGE_STYLE: Record<ActionStatus, string> = {
  Completed: "bg-success/15 text-success border-success/30",
  Ongoing: "bg-primary/15 text-primary border-primary/30",
  Pending: "bg-warning/15 text-warning border-warning/30",
  Cancelled: "bg-destructive/15 text-destructive border-destructive/30",
};

const STATUS_ICON: Record<ActionStatus, React.ReactNode> = {
  Completed: <CheckCircle2 className="w-3 h-3" />,
  Ongoing: <Loader2 className="w-3 h-3" />,
  Pending: <Clock className="w-3 h-3" />,
  Cancelled: <XCircle className="w-3 h-3" />,
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string; ring: string; num: string }> = {
  Immediate: { bg: "bg-success/10", text: "text-success", ring: "ring-success/20", num: "bg-success text-success-foreground" },
  Tactical: { bg: "bg-primary/10", text: "text-primary", ring: "ring-primary/20", num: "bg-primary text-primary-foreground" },
  Strategic: { bg: "bg-warning/10", text: "text-warning", ring: "ring-warning/20", num: "bg-warning text-warning-foreground" },
};

function getPreviousPeriod(month: MonthName, year: number): { period: string; label: string } {
  const idx = MONTHS.indexOf(month);
  if (idx === 0) return { period: `December ${year - 1}`, label: `December ${year - 1}` };
  return { period: `${MONTHS[idx - 1]} ${year}`, label: `${MONTHS[idx - 1]} ${year}` };
}

function getDaysInMonth(month: MonthName, year: number): number {
  const idx = MONTHS.indexOf(month);
  return new Date(year, idx + 1, 0).getDate();
}

/* Circular progress ring */
function CompletionRing({ value, size = 72 }: { value: number; size?: number }) {
  const stroke = 6;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const color = value >= 70 ? "hsl(var(--success))" : value >= 40 ? "hsl(var(--primary))" : value >= 20 ? "hsl(var(--warning))" : "hsl(var(--destructive))";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-extrabold text-card-foreground tracking-tight">{value}<span className="text-xs">%</span></span>
      </div>
    </div>
  );
}

/* Timeline bar component */
function TimelineBar({
  action, tag, status, startDay, endDay, totalDays, progress
}: {
  action: string; tag: string; status: ActionStatus;
  startDay: number; endDay: number; totalDays: number; progress: number;
}) {
  const left = ((startDay - 1) / totalDays) * 100;
  const width = ((endDay - startDay + 1) / totalDays) * 100;

  return (
    <div className="relative h-10 group" style={{ marginLeft: `${left}%`, width: `${Math.max(width, 8)}%` }}>
      <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${STATUS_GRADIENT[status]} backdrop-blur-sm border border-white/20 shadow-sm transition-all duration-200 group-hover:shadow-md group-hover:scale-[1.02] group-hover:brightness-105 overflow-hidden`}>
        {/* Progress fill for ongoing */}
        {status === "Ongoing" && progress > 0 && progress < 100 && (
          <div className="absolute inset-y-0 left-0 bg-white/20 rounded-l-lg" style={{ width: `${progress}%` }} />
        )}
        <div className="absolute inset-0 flex items-center px-3 gap-2 overflow-hidden">
          <span className="text-[11px] font-medium text-foreground truncate flex-1">
            {action}
          </span>
          <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-black/10 text-foreground backdrop-blur-sm">
            {tag}
          </span>
          <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-black/10 text-foreground backdrop-blur-sm">
            {STATUS_ICON[status]}
            {status}
          </span>
        </div>
      </div>
      {/* Date label below */}
      <div className="absolute -bottom-4 left-0 text-[9px] text-muted-foreground font-medium">
        {startDay} – {endDay}
      </div>
    </div>
  );
}

export default function ExecutionPage() {
  const { selectedMonth, selectedYear, period } = useMonth();
  const prev = getPreviousPeriod(selectedMonth, selectedYear);
  const totalDays = getDaysInMonth(selectedMonth, selectedYear);
  const today = new Date();
  const currentDay = (today.getFullYear() === selectedYear && MONTHS.indexOf(selectedMonth) === today.getMonth()) ? today.getDate() : null;

  const { data: prevRecommendations, isLoading: loadingRec } = usePageData(prev.period, "recommendations");
  const { data: rawExecutionData, isLoading: loadingExec } = usePageData<any>(period, "execution");

  if (loadingRec || loadingExec) return <div className="p-8 text-muted-foreground">Loading...</div>;

  const immediateActions: { action: string; tag: string }[] = prevRecommendations?.actionPlan30 || [];
  const tacticalActions: { action: string; tag: string }[] = prevRecommendations?.actionPlan60 || [];
  const strategicActions: { action: string; tag: string }[] = prevRecommendations?.actionPlan90 || [];
  const totalActions = immediateActions.length + tacticalActions.length + strategicActions.length;

  if (totalActions === 0) {
    return (
      <div className="space-y-10 animate-fade-in">
        <SectionHeader title="Execution Timeline" subtitle={`${selectedMonth} ${selectedYear}`} icon={<Calendar className="w-4 h-4" />} />
        <NoData month={prev.label as any} />
        <p className="text-sm text-muted-foreground text-center">
          No action plan found for <strong>{prev.label}</strong>.
        </p>
      </div>
    );
  }

  // Parse execution data
  const parseStatuses = (data: any) => {
    if (!data) return { immediate: [] as ActionStatus[], tactical: [] as ActionStatus[], strategic: [] as ActionStatus[] };
    const parse = (key: string) => (data[key] || []).map((x: any) => x.status || "Pending");
    const imm = parse("immediateStatuses");
    const tac = parse("tacticalStatuses");
    const str = parse("strategicStatuses");
    if (imm.length || tac.length || str.length) return { immediate: imm, tactical: tac, strategic: str };
    return data.statuses || { immediate: [], tactical: [], strategic: [] };
  };

  const statuses = parseStatuses(rawExecutionData);
  const executionNotes = rawExecutionData?.executionNotes || [];
  const impactNotes = rawExecutionData?.impactNotes || "";

  const getStatus = (cat: "immediate" | "tactical" | "strategic", i: number): ActionStatus => {
    const s = statuses[cat]?.[i];
    const valid: ActionStatus[] = ["Completed", "Ongoing", "Pending", "Cancelled"];
    return valid.includes(s as ActionStatus) ? (s as ActionStatus) : "Pending";
  };

  // Parse timeline data (start_day, end_day, progress)
  const getTimelineData = (cat: string, i: number) => {
    const items = rawExecutionData?.[`${cat}Statuses`] || [];
    const item = items[i] || {};
    return {
      startDay: item.startDay || 1,
      endDay: item.endDay || totalDays,
      progress: item.progress || 0,
    };
  };

  const allStatuses: ActionStatus[] = [
    ...immediateActions.map((_, i) => getStatus("immediate", i)),
    ...tacticalActions.map((_, i) => getStatus("tactical", i)),
    ...strategicActions.map((_, i) => getStatus("strategic", i)),
  ];

  const completed = allStatuses.filter(s => s === "Completed").length;
  const ongoing = allStatuses.filter(s => s === "Ongoing").length;
  const pending = allStatuses.filter(s => s === "Pending").length;
  const completionRate = totalActions > 0 ? Math.round((completed / totalActions) * 100) : 0;

  // Day axis markers
  const dayMarkers = Array.from({ length: totalDays }, (_, i) => i + 1);
  // Show a subset of day labels to avoid clutter
  const showDayLabel = (d: number) => d === 1 || d % 5 === 0 || d === totalDays;

  const categories = [
    { key: "immediate" as const, label: "Immediate", num: "01", actions: immediateActions },
    { key: "tactical" as const, label: "Tactical", num: "02", actions: tacticalActions },
    { key: "strategic" as const, label: "Strategic", num: "03", actions: strategicActions },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <SectionHeader
          title="Execution Timeline"
          subtitle={`${selectedMonth} ${selectedYear}`}
          icon={<Calendar className="w-4 h-4" />}
        />
        <p className="text-sm text-muted-foreground -mt-4 ml-[52px]">
          Realization of <strong className="text-foreground">{prev.label}</strong> Action Plan
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "TOTAL PLANNED", value: totalActions, icon: <Target className="w-5 h-5" />, iconBg: "bg-muted-foreground" },
          { label: "COMPLETED", value: completed, icon: <CheckCircle2 className="w-5 h-5" />, iconBg: "gradient-success" },
          { label: "ONGOING", value: ongoing, icon: <Loader2 className="w-5 h-5" />, iconBg: "gradient-primary" },
          { label: "PENDING", value: pending, icon: <Clock className="w-5 h-5" />, iconBg: "gradient-warning" },
        ].map((kpi, i) => (
          <div key={i} className="bg-card rounded-xl border border-border/40 p-5 shadow-card text-center hover:shadow-card-hover transition-shadow duration-200">
            <div className={`w-10 h-10 ${kpi.iconBg} rounded-xl flex items-center justify-center mx-auto mb-3 text-primary-foreground shadow-sm`}>
              {kpi.icon}
            </div>
            <p className="text-2xl font-extrabold text-card-foreground tracking-tight">{kpi.value}</p>
            <p className="text-label text-muted-foreground uppercase tracking-wider mt-1">{kpi.label}</p>
          </div>
        ))}
        {/* Completion Rate with ring */}
        <div className="bg-card rounded-xl border border-border/40 p-5 shadow-card hover:shadow-card-hover transition-shadow duration-200">
          <div className="flex items-center gap-4">
            <CompletionRing value={completionRate} />
            <div>
              <p className="text-label text-muted-foreground uppercase tracking-wider mb-1">COMPLETION RATE</p>
              <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden mt-2" style={{ minWidth: 80 }}>
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${completionRate >= 70 ? "gradient-success" : completionRate >= 40 ? "gradient-primary" : completionRate >= 20 ? "gradient-warning" : "gradient-danger"}`}
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline + Notes Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Timeline Area */}
        <div className="bg-card rounded-xl border border-border/40 shadow-card overflow-hidden">
          {/* Month label + Day axis */}
          <div className="px-6 pt-5 pb-0">
            <p className="text-sm font-semibold text-card-foreground mb-3">{selectedMonth} {selectedYear}</p>
          </div>

          {/* Day axis */}
          <div className="px-6 relative">
            <div className="flex items-end border-b border-border/30 pb-2 relative">
              {dayMarkers.map(d => (
                <div key={d} className="flex-1 text-center relative">
                  {showDayLabel(d) && (
                    <span className="text-[10px] text-muted-foreground font-medium">{d}</span>
                  )}
                </div>
              ))}
              {/* Current day indicator */}
              {currentDay && (
                <div
                  className="absolute top-0 bottom-0 w-px bg-primary/50 z-10"
                  style={{ left: `${((currentDay - 0.5) / totalDays) * 100}%` }}
                >
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary shadow-sm" />
                </div>
              )}
            </div>
          </div>

          {/* Timeline rows by category */}
          <div className="px-6 py-4 space-y-6">
            {categories.map((cat) => {
              if (cat.actions.length === 0) return null;
              const colors = CATEGORY_COLORS[cat.label];
              return (
                <div key={cat.key}>
                  {/* Category header */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`w-7 h-7 rounded-lg ${colors.num} flex items-center justify-center text-xs font-bold shadow-sm`}>
                      {cat.num}
                    </span>
                    <div>
                      <span className="text-sm font-semibold text-card-foreground">{cat.label}</span>
                      {/* Count badge */}
                      <span className={`ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${colors.bg} ${colors.text}`}>
                        {cat.actions.filter((_, i) => getStatus(cat.key, i) === "Ongoing").length > 0 ? "⏳ Ongoing" :
                         cat.actions.every((_, i) => getStatus(cat.key, i) === "Completed") ? "✅ Done" : "📋 Planned"}
                      </span>
                    </div>
                  </div>

                  {/* Action bars */}
                  <div className="space-y-6 relative ml-10">
                    {/* Vertical current day line across bars */}
                    {currentDay && (
                      <div
                        className="absolute top-0 bottom-0 w-px bg-primary/20 z-0"
                        style={{ left: `${((currentDay - 0.5) / totalDays) * 100}%` }}
                      />
                    )}
                    {cat.actions.map((item, i) => {
                      const status = getStatus(cat.key, i);
                      const timeline = getTimelineData(cat.key, i);
                      return (
                        <div key={i} className="relative z-10">
                          <TimelineBar
                            action={item.action}
                            tag={item.tag}
                            status={status}
                            startDay={timeline.startDay}
                            endDay={timeline.endDay}
                            totalDays={totalDays}
                            progress={timeline.progress}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel — Execution Notes */}
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border/40 shadow-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-card-foreground">Execution Notes</h3>
            </div>
            {executionNotes.length > 0 ? (
              <ul className="space-y-3">
                {executionNotes.map((note: any, i: number) => {
                  const dotColor = note.type === "completed" ? "bg-success" :
                                   note.type === "delayed" ? "bg-warning" : "bg-primary";
                  return (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-card-foreground leading-relaxed">
                      <span className={`w-2 h-2 rounded-full ${dotColor} mt-1.5 shrink-0`} />
                      {note.text}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                No execution notes yet. Use Edit Data to add notes.
              </p>
            )}
          </div>

          {/* Impact section */}
          <div className="bg-card rounded-xl border border-border/40 shadow-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-success" />
              <h3 className="text-sm font-semibold text-card-foreground">Impact</h3>
            </div>
            {impactNotes ? (
              <p className="text-sm text-card-foreground leading-relaxed">{impactNotes}</p>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                No impact notes yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
