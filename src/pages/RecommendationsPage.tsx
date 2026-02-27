import { usePageData } from "@/hooks/usePageData";
import { useMergedPageData } from "@/hooks/useMergedPageData";
import { getRecommendationsData, type RecommendationsData } from "@/data/mockData";
import { transformRecommendations } from "@/lib/dataTransformers";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { NoData } from "@/components/dashboard/NoData";
import { format as fmtDate, parseISO, isValid } from "date-fns";
import { ClipboardList, CheckCircle2, Loader2, Clock, AlertTriangle, LayoutList, LayoutGrid, TrendingUp, Plus } from "lucide-react";
import { useMonth, MONTHS, type MonthName } from "@/contexts/MonthContext";
import { useState, useMemo } from "react";
import { Progress } from "@/components/ui/progress";

type Priority = "High" | "Medium" | "Low";
type Status = "Done" | "Ongoing" | "Pending" | "Blocked";
type Category = "Immediate" | "Tactical" | "Strategic";

interface ActionItem {
  category: Category;
  task: string;
  priority: Priority;
  status: Status;
  startDate: string;
  endDate: string;
  progress: number;
  tag: string;
}

// Warm pastel color scheme
const STATUS_STYLES: Record<Status, {bg: string;text: string;border: string;icon: React.ReactNode;}> = {
  Done: { bg: "bg-[hsl(145,60%,92%)]", text: "text-[hsl(145,55%,35%)]", border: "border-[hsl(145,50%,80%)]", icon: <CheckCircle2 className="w-3 h-3" /> },
  Ongoing: { bg: "bg-[hsl(210,70%,92%)]", text: "text-[hsl(210,60%,40%)]", border: "border-[hsl(210,60%,82%)]", icon: <Loader2 className="w-3 h-3" /> },
  Pending: { bg: "bg-[hsl(30,90%,92%)]", text: "text-[hsl(25,80%,42%)]", border: "border-[hsl(30,80%,82%)]", icon: <Clock className="w-3 h-3" /> },
  Blocked: { bg: "bg-[hsl(0,70%,93%)]", text: "text-[hsl(0,60%,45%)]", border: "border-[hsl(0,60%,83%)]", icon: <AlertTriangle className="w-3 h-3" /> }
};

const PRIORITY_STYLES: Record<Priority, {bg: string;text: string;border: string;}> = {
  High: { bg: "bg-[hsl(0,75%,93%)]", text: "text-[hsl(0,65%,45%)]", border: "border-[hsl(0,60%,85%)]" },
  Medium: { bg: "bg-[hsl(35,85%,91%)]", text: "text-[hsl(30,70%,40%)]", border: "border-[hsl(35,70%,82%)]" },
  Low: { bg: "bg-[hsl(220,15%,94%)]", text: "text-[hsl(220,10%,50%)]", border: "border-[hsl(220,12%,86%)]" }
};

const CATEGORY_COLORS: Record<Category, {border: string;bg: string;text: string;accent: string;progressBar: string;}> = {
  Immediate: {
    border: "border-l-[hsl(145,55%,50%)]",
    bg: "bg-[hsl(145,55%,92%)]",
    text: "text-[hsl(145,55%,32%)]",
    accent: "hsl(145,55%,50%)",
    progressBar: "[&>div]:bg-[hsl(145,55%,50%)]"
  },
  Tactical: {
    border: "border-l-[hsl(25,85%,55%)]",
    bg: "bg-[hsl(25,85%,93%)]",
    text: "text-[hsl(25,70%,35%)]",
    accent: "hsl(25,85%,55%)",
    progressBar: "[&>div]:bg-[hsl(25,85%,55%)]"
  },
  Strategic: {
    border: "border-l-[hsl(160,60%,45%)]",
    bg: "bg-[hsl(160,55%,92%)]",
    text: "text-[hsl(160,55%,30%)]",
    accent: "hsl(160,60%,45%)",
    progressBar: "[&>div]:bg-[hsl(160,60%,45%)]"
  }
};

const VALID_PRIORITIES: Priority[] = ["High", "Medium", "Low"];
const VALID_STATUSES: Status[] = ["Done", "Ongoing", "Pending", "Blocked"];

function parsePriority(val?: string): Priority {
  if (val && VALID_PRIORITIES.includes(val as Priority)) return val as Priority;
  return "Medium";
}

function parseStatus(val?: string): Status {
  if (val && VALID_STATUSES.includes(val as Status)) return val as Status;
  return "Pending";
}

/** Convert saved DB data or mock data into ActionItems */
function convertToActions(data: any, selectedMonth: string): ActionItem[] {
  const items: ActionItem[] = [];

  const categoryMap: {key: string;category: Category;}[] = [
  { key: "actionPlan30", category: "Immediate" },
  { key: "actionPlan60", category: "Tactical" },
  { key: "actionPlan90", category: "Strategic" }];


  for (const { key, category } of categoryMap) {
    const arr = data?.[key] || [];
    arr.forEach((item: any) => {
      items.push({
        category,
        task: item.action || item.task || "",
        priority: parsePriority(item.priority),
        status: parseStatus(item.status),
        startDate: item.startDate || "",
        endDate: item.endDate || "",
        progress: Number(item.progress) || 0,
        tag: item.tag || ""
      });
    });
  }

  return items;
}

/** Check if an action's timeline overlaps with a given month/year */
function actionVisibleInPeriod(item: ActionItem, month: MonthName, year: number): boolean {
  // Always show if no dates set
  if (!item.startDate && !item.endDate) return true;

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const fullMonthNames = [...MONTHS];
  const targetMonthIdx = fullMonthNames.indexOf(month);

  // Try parsing dates like "Feb 1", "March 15", "2026-03-15", etc.
  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    // Try ISO format
    const iso = new Date(dateStr);
    if (!isNaN(iso.getTime())) return iso;
    // Try "Mon DD" format
    const parts = dateStr.trim().split(/\s+/);
    if (parts.length >= 2) {
      const monthPart = parts[0];
      const dayPart = parseInt(parts[1]);
      if (isNaN(dayPart)) return null;
      let mIdx = monthNames.findIndex((m) => monthPart.toLowerCase().startsWith(m.toLowerCase()));
      if (mIdx === -1) mIdx = fullMonthNames.findIndex((m) => monthPart.toLowerCase().startsWith(m.toLowerCase()));
      if (mIdx >= 0) return new Date(year, mIdx, dayPart);
    }
    return null;
  };

  const start = parseDate(item.startDate);
  const end = parseDate(item.endDate);

  const periodStart = new Date(year, targetMonthIdx, 1);
  const periodEnd = new Date(year, targetMonthIdx + 1, 0); // last day of month

  if (start && end) {
    // Action overlaps if start <= periodEnd AND end >= periodStart
    return start <= periodEnd && end >= periodStart;
  }
  if (start) return start.getMonth() === targetMonthIdx;
  if (end) return end.getMonth() === targetMonthIdx;
  return true;
}

function StatusBadge({ status }: {status: Status;}) {
  const s = STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold border ${s.bg} ${s.text} ${s.border}`}>
      {s.icon} {status}
    </span>);

}

function PriorityBadge({ priority }: {priority: Priority;}) {
  const s = PRIORITY_STYLES[priority];
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold border ${s.bg} ${s.text} ${s.border}`}>
      {priority}
    </span>);

}

function CategoryBadge({ category }: {category: Category;}) {
  const c = CATEGORY_COLORS[category];
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-bold ${c.bg} ${c.text}`}>
      {category}
    </span>);

}

function TimelinePill({ startDate, endDate }: {startDate: string;endDate: string;}) {
  if (!startDate && !endDate) return <span className="text-xs text-muted-foreground">—</span>;

  const formatDate = (d: string) => {
    if (!d) return "";
    try {
      const parsed = parseISO(d);
      if (isValid(parsed)) return fmtDate(parsed, "MMM d");
    } catch {}
    return d;
  };

  const start = formatDate(startDate);
  const end = formatDate(endDate);
  const display = start && end ? `${start} – ${end}` : start || end;
  return (
    <span className="text-[11px] leading-tight text-muted-foreground bg-[hsl(220,15%,95%)] dark:bg-white/10 px-2 py-1 rounded-full inline-block max-w-[140px] truncate text-center" title={display}>
      {display}
    </span>);

}

// ========== BOARD VIEW ==========
function BoardView({ items }: {items: ActionItem[];}) {
  const categories: Category[] = ["Immediate", "Tactical", "Strategic"];
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {categories.map((cat) => {
        const c = CATEGORY_COLORS[cat];
        const catItems = items.filter((i) => i.category === cat);
        return (
          <div key={cat} className="rounded-xl border border-border/40 dark:border-white/[0.08] bg-card dark:bg-white/[0.06] dark:backdrop-blur-xl shadow-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border/30 flex items-center gap-2">
              <CategoryBadge category={cat} />
              <span className="text-xs text-muted-foreground ml-auto">{catItems.length} items</span>
            </div>
            <div className="p-3 space-y-3">
              {catItems.map((item, i) =>
              <div key={i} className={`rounded-lg border border-border/30 dark:border-white/[0.08] bg-background dark:bg-white/[0.04] p-4 space-y-3 border-l-4 ${c.border} hover:shadow-md transition-shadow duration-200`}>
                  <p className="text-sm font-medium text-card-foreground leading-relaxed">{item.task}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <PriorityBadge priority={item.priority} />
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <TimelinePill startDate={item.startDate} endDate={item.endDate} />
                    <span className="font-semibold">{item.progress}%</span>
                  </div>
                  <Progress value={item.progress} className={`h-1.5 ${c.progressBar}`} />
                </div>
              )}
              {catItems.length === 0 &&
              <p className="text-xs text-muted-foreground text-center py-6 italic">No actions</p>
              }
            </div>
          </div>);

      })}
    </div>);

}

// ========== TABLE VIEW ==========
function TableView({ items }: {items: ActionItem[];}) {
  const categories: Category[] = ["Immediate", "Tactical", "Strategic"];
  const grouped = categories.map((cat) => ({
    category: cat,
    items: items.filter((i) => i.category === cat)
  }));

  return (
    <div className="bg-card dark:bg-white/[0.06] dark:backdrop-blur-xl rounded-xl border border-border/40 dark:border-white/[0.08] shadow-card overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[1fr_2.5fr_100px_110px_160px_130px] gap-2 px-5 py-3.5 bg-[hsl(220,15%,96%)] dark:bg-white/[0.06] border-b border-border/30 dark:border-white/[0.08] text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <span>Category</span>
        <span>Task</span>
        <span>Priority</span>
        <span>Status</span>
        <span>Timeline</span>
        <span className="text-right">Progress</span>
      </div>

      {/* Rows grouped by category */}
      {grouped.map((group) => {
        const c = CATEGORY_COLORS[group.category];
        if (group.items.length === 0) return null;
        return (
          <div key={group.category}>
            {/* Category header row */}
            <div className={`grid grid-cols-[1fr_2.5fr_100px_110px_160px_130px] gap-2 px-5 py-3 bg-[hsl(220,15%,97%)] dark:bg-white/[0.04] border-b border-border/20 dark:border-white/[0.06] border-l-4 ${c.border}`}>
              <div className="col-span-2 flex items-center gap-3">
                <CategoryBadge category={group.category} />
                <span className="text-xs text-muted-foreground">{group.items.length} actions</span>
              </div>
              <div />
              <div />
              <div />
              <div className="flex items-center gap-2 justify-end">
                <Progress
                  value={Math.round(group.items.reduce((s, i) => s + i.progress, 0) / group.items.length)}
                  className={`h-2 w-20 ${c.progressBar}`} />

                <span className="text-xs font-semibold text-card-foreground w-8 text-right">
                  {Math.round(group.items.reduce((s, i) => s + i.progress, 0) / group.items.length)}%
                </span>
              </div>
            </div>

            {/* Action rows */}
            {group.items.map((item, i) =>
            <div
              key={i}
              className="grid grid-cols-[1fr_2.5fr_100px_110px_160px_130px] gap-2 px-5 py-3 border-b border-border/15 dark:border-white/[0.06] hover:bg-[hsl(220,15%,97.5%)] dark:hover:bg-white/[0.04] transition-colors duration-150 items-center">

                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">{i + 1}</span>
                </div>
                <p className="text-sm text-card-foreground pr-3">{item.task}</p>
                <div><PriorityBadge priority={item.priority} /></div>
                <div><StatusBadge status={item.status} /></div>
                <TimelinePill startDate={item.startDate} endDate={item.endDate} />
                <div className="flex items-center gap-2 justify-end">
                  <Progress value={item.progress} className={`h-2 w-20 ${c.progressBar}`} />
                  <span className="text-xs font-semibold text-card-foreground w-8 text-right">{item.progress}%</span>
                </div>
              </div>
            )}
          </div>);

      })}
    </div>);

}

// ========== COMPLETION RATE RING ==========
function CompletionRing({ rate }: {rate: number;}) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const offset = circ - rate / 100 * circ;
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-16 h-16">
        <svg viewBox="0 0 90 90" className="w-full h-full -rotate-90">
          <circle cx="45" cy="45" r={r} fill="none" stroke="hsl(220,15%,92%)" strokeWidth="6" />
          <circle cx="45" cy="45" r={r} fill="none" stroke="hsl(262,52%,56%)" strokeWidth="6"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-700" />

        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold text-foreground">{rate}%</span>
        </div>
      </div>
    </div>);

}

// ========== MAIN PAGE ==========
export default function RecommendationsPage() {
  const { selectedMonth, selectedYear, period } = useMonth();
  const { data: dbData, isLoading: loadingDb } = usePageData(period, "recommendations");
  const { data: mockFallback } = useMergedPageData("recommendations", getRecommendationsData, transformRecommendations);
  const [view, setView] = useState<"table" | "board">("table");

  // Also load actions from up to 4 previous months that may span into this month
  const currentMonthIdx = MONTHS.indexOf(selectedMonth);
  const prevPeriods = useMemo(() => {
    const periods: string[] = [];
    for (let i = 1; i <= 4; i++) {
      let mIdx = currentMonthIdx - i;
      let yr = selectedYear;
      while (mIdx < 0) { mIdx += 12; yr -= 1; }
      periods.push(`${MONTHS[mIdx]} ${yr}`);
    }
    return periods;
  }, [currentMonthIdx, selectedYear]);

  const { data: prevData1 } = usePageData(prevPeriods[0], "recommendations");
  const { data: prevData2 } = usePageData(prevPeriods[1], "recommendations");
  const { data: prevData3 } = usePageData(prevPeriods[2], "recommendations");
  const { data: prevData4 } = usePageData(prevPeriods[3], "recommendations");

  const isLoading = loadingDb;

  const actions = useMemo(() => {
    // Primary: current month's data from DB
    const currentData = dbData || mockFallback;
    const currentActions = convertToActions(currentData, selectedMonth);

    // Cross-month: get actions from previous months that extend into this month
    const allPrevData = [prevData1, prevData2, prevData3, prevData4];
    const currentTaskNames = new Set(currentActions.map((a) => a.task));

    for (const pData of allPrevData) {
      if (!pData) continue;
      const prevActions = convertToActions(pData, selectedMonth);
      for (const a of prevActions) {
        if (a.status === "Done") continue;
        if (currentTaskNames.has(a.task)) continue;
        if (actionVisibleInPeriod(a, selectedMonth, selectedYear)) {
          currentActions.push(a);
          currentTaskNames.add(a.task);
        }
      }
    }

    return currentActions;
  }, [dbData, mockFallback, prevData1, prevData2, prevData3, prevData4, selectedMonth, selectedYear]);

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading...</div>;
  if (actions.length === 0) return <NoData month={selectedMonth} />;

  const completed = actions.filter((a) => a.status === "Done").length;
  const ongoing = actions.filter((a) => a.status === "Ongoing").length;
  const pending = actions.filter((a) => a.status === "Pending").length;
  const completionRate = actions.length > 0 ? Math.round(completed / actions.length * 100) : 0;

  const kpis = [
  { label: "Total Actions", value: actions.length, icon: <ClipboardList className="w-4 h-4" />, color: "text-foreground" },
  { label: "Completed", value: completed, icon: <CheckCircle2 className="w-4 h-4" />, color: "text-[hsl(145,55%,35%)]" },
  { label: "Ongoing", value: ongoing, icon: <Loader2 className="w-4 h-4" />, color: "text-[hsl(210,60%,40%)]" },
  { label: "Pending", value: pending, icon: <Clock className="w-4 h-4" />, color: "text-[hsl(30,80%,42%)]" }];


  return (
    <div className="space-y-8 animate-fade-in">
      <SectionHeader
        title={`Action Plan — ${selectedMonth} ${selectedYear}`}
        subtitle=""
        icon={<ClipboardList className="w-4 h-4" />} />


      {/* Summary KPI Row */}
      <div className="bg-card dark:bg-white/[0.06] dark:backdrop-blur-xl rounded-xl border border-border/40 dark:border-white/[0.08] shadow-card p-5">
        <div className="flex items-center gap-4 flex-wrap">
          {kpis.map((kpi, i) =>
          <div key={i} className="flex items-center gap-3 bg-[hsl(220,15%,97%)] dark:bg-white/[0.06] dark:border dark:border-white/[0.08] rounded-xl px-5 py-4 min-w-[150px]">
              <span className={`${kpi.color} opacity-70`}>{kpi.icon}</span>
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider leading-none mb-1.5">{kpi.label}</p>
                <p className={`text-xl font-bold ${kpi.color} leading-none`}>{kpi.value}</p>
              </div>
            </div>
          )}

          {/* Completion Rate Ring */}
          <div className="flex items-center gap-3 bg-[hsl(220,15%,97%)] dark:bg-white/[0.06] dark:border dark:border-white/[0.08] rounded-xl px-5 py-4 ml-auto">
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider leading-none mb-1.5">Completion Rate</p>
              <p className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                <TrendingUp className="w-2.5 h-2.5" /> {completionRate}%
              </p>
            </div>
            <CompletionRing rate={completionRate} />
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex justify-end">
        <div className="inline-flex bg-[hsl(220,15%,95%)] dark:bg-white/[0.06] rounded-lg p-1 gap-0.5 border border-border/30 dark:border-white/[0.08]">
          <button
            onClick={() => setView("table")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
            view === "table" ? "bg-card text-card-foreground shadow-sm border border-border/40" : "text-muted-foreground hover:text-foreground"}`
            }>

            <LayoutList className="w-3.5 h-3.5" /> Table View
          </button>
          <button
            onClick={() => setView("board")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
            view === "board" ? "bg-card text-card-foreground shadow-sm border border-border/40" : "text-muted-foreground hover:text-foreground"}`
            }>

            <LayoutGrid className="w-3.5 h-3.5" /> Board View
          </button>
        </div>
      </div>

      {/* Content */}
      {view === "table" ? <TableView items={actions} /> : <BoardView items={actions} />}
    </div>);

}