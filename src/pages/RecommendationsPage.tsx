import { useMergedPageData } from "@/hooks/useMergedPageData";
import { getRecommendationsData, type RecommendationsData } from "@/data/mockData";
import { transformRecommendations } from "@/lib/dataTransformers";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { NoData } from "@/components/dashboard/NoData";
import { ClipboardList, CheckCircle2, Loader2, Clock, AlertTriangle, LayoutList, LayoutGrid } from "lucide-react";
import { useMonth } from "@/contexts/MonthContext";
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
  timeline: string;
  progress: number;
  tag: string;
}

const STATUS_STYLES: Record<Status, { bg: string; text: string; icon: React.ReactNode }> = {
  Done: { bg: "bg-success/15", text: "text-success", icon: <CheckCircle2 className="w-3 h-3" /> },
  Ongoing: { bg: "bg-primary/15", text: "text-primary", icon: <Loader2 className="w-3 h-3" /> },
  Pending: { bg: "bg-warning/15", text: "text-warning", icon: <Clock className="w-3 h-3" /> },
  Blocked: { bg: "bg-destructive/15", text: "text-destructive", icon: <AlertTriangle className="w-3 h-3" /> },
};

const PRIORITY_STYLES: Record<Priority, { bg: string; text: string }> = {
  High: { bg: "bg-destructive/10", text: "text-destructive" },
  Medium: { bg: "bg-warning/10", text: "text-warning" },
  Low: { bg: "bg-muted", text: "text-muted-foreground" },
};

const CATEGORY_BORDER: Record<Category, string> = {
  Immediate: "border-l-success",
  Tactical: "border-l-primary",
  Strategic: "border-l-warning",
};

const CATEGORY_BG: Record<Category, string> = {
  Immediate: "bg-success/10 text-success",
  Tactical: "bg-primary/10 text-primary",
  Strategic: "bg-warning/10 text-warning",
};

const PROGRESS_COLORS: Record<Category, string> = {
  Immediate: "[&>div]:bg-success",
  Tactical: "[&>div]:bg-primary",
  Strategic: "[&>div]:bg-warning",
};

function convertMockToActions(data: RecommendationsData, month: string): ActionItem[] {
  const items: ActionItem[] = [];
  const priorities: Priority[] = ["High", "Medium", "Low"];
  const statuses: Status[] = ["Done", "Ongoing", "Pending"];

  data.actionPlan30.forEach((item, i) => {
    items.push({
      category: "Immediate",
      task: item.action,
      priority: priorities[i % 3],
      status: statuses[i % 3],
      timeline: `${month.slice(0, 3)} 1–10`,
      progress: statuses[i % 3] === "Done" ? 100 : statuses[i % 3] === "Ongoing" ? 60 : 0,
      tag: item.tag,
    });
  });

  data.actionPlan60.forEach((item, i) => {
    items.push({
      category: "Tactical",
      task: item.action,
      priority: priorities[(i + 1) % 3],
      status: statuses[(i + 1) % 3],
      timeline: `${month.slice(0, 3)} 5–20`,
      progress: statuses[(i + 1) % 3] === "Done" ? 100 : statuses[(i + 1) % 3] === "Ongoing" ? 45 : 0,
      tag: item.tag,
    });
  });

  data.actionPlan90.forEach((item, i) => {
    items.push({
      category: "Strategic",
      task: item.action,
      priority: priorities[(i + 2) % 3],
      status: statuses[(i + 2) % 3],
      timeline: `${month.slice(0, 3)} 1–30`,
      progress: statuses[(i + 2) % 3] === "Done" ? 100 : statuses[(i + 2) % 3] === "Ongoing" ? 30 : 0,
      tag: item.tag,
    });
  });

  return items;
}

function StatusBadge({ status }: { status: Status }) {
  const s = STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      {s.icon} {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const s = PRIORITY_STYLES[priority];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      {priority}
    </span>
  );
}

function CategoryBadge({ category }: { category: Category }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${CATEGORY_BG[category]}`}>
      {category}
    </span>
  );
}

// ========== BOARD VIEW ==========
function BoardView({ items }: { items: ActionItem[] }) {
  const categories: Category[] = ["Immediate", "Tactical", "Strategic"];
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {categories.map(cat => {
        const catItems = items.filter(i => i.category === cat);
        return (
          <div key={cat} className={`rounded-xl border border-border/40 bg-card shadow-card overflow-hidden`}>
            <div className={`px-4 py-3 border-b border-border/30 flex items-center gap-2`}>
              <CategoryBadge category={cat} />
              <span className="text-xs text-muted-foreground ml-auto">{catItems.length} items</span>
            </div>
            <div className="p-3 space-y-3">
              {catItems.map((item, i) => (
                <div key={i} className={`rounded-lg border border-border/30 bg-background p-4 space-y-3 border-l-4 ${CATEGORY_BORDER[cat]} hover:shadow-md transition-shadow duration-200`}>
                  <p className="text-sm font-medium text-card-foreground leading-relaxed">{item.task}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <PriorityBadge priority={item.priority} />
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="bg-muted px-2 py-0.5 rounded-full">{item.timeline}</span>
                    <span className="font-semibold">{item.progress}%</span>
                  </div>
                  <Progress value={item.progress} className={`h-1.5 ${PROGRESS_COLORS[cat]}`} />
                </div>
              ))}
              {catItems.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-6 italic">No actions</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ========== TABLE VIEW ==========
function TableView({ items }: { items: ActionItem[] }) {
  const categories: Category[] = ["Immediate", "Tactical", "Strategic"];
  const grouped = categories.map(cat => ({
    category: cat,
    items: items.filter(i => i.category === cat),
  }));

  return (
    <div className="bg-card rounded-xl border border-border/40 shadow-card overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[1fr_2.5fr_100px_110px_110px_120px] gap-0 px-5 py-3 bg-muted/50 border-b border-border/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <span>Category</span>
        <span>Task</span>
        <span>Priority</span>
        <span>Status</span>
        <span>Timeline</span>
        <span className="text-right">Progress</span>
      </div>

      {/* Rows grouped by category */}
      {grouped.map(group => (
        <div key={group.category}>
          {/* Category row */}
          <div className={`grid grid-cols-[1fr_2.5fr_100px_110px_110px_120px] gap-0 px-5 py-2.5 bg-muted/30 border-b border-border/20 border-l-4 ${CATEGORY_BORDER[group.category]}`}>
            <div className="col-span-6 flex items-center gap-3">
              <CategoryBadge category={group.category} />
              <span className="text-xs text-muted-foreground">{group.items.length} actions</span>
            </div>
          </div>

          {/* Action rows */}
          {group.items.map((item, i) => (
            <div
              key={i}
              className={`grid grid-cols-[1fr_2.5fr_100px_110px_110px_120px] gap-0 px-5 py-3 border-b border-border/15 hover:bg-muted/20 transition-colors duration-150 items-center`}
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">{i + 1}</span>
              </div>
              <p className="text-sm text-card-foreground pr-3">{item.task}</p>
              <div><PriorityBadge priority={item.priority} /></div>
              <div><StatusBadge status={item.status} /></div>
              <span className="text-xs text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full w-fit">{item.timeline}</span>
              <div className="flex items-center gap-2 justify-end">
                <Progress value={item.progress} className={`h-2 w-20 ${PROGRESS_COLORS[item.category]}`} />
                <span className="text-xs font-semibold text-card-foreground w-8 text-right">{item.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ========== MAIN PAGE ==========
export default function RecommendationsPage() {
  const { selectedMonth, selectedYear } = useMonth();
  const { data, isLoading } = useMergedPageData("recommendations", getRecommendationsData, transformRecommendations);
  const [view, setView] = useState<"table" | "board">("table");

  const actions = useMemo(() => {
    if (!data) return [];
    return convertMockToActions(data, selectedMonth);
  }, [data, selectedMonth]);

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading...</div>;
  if (!data) return <NoData month={selectedMonth} />;

  const completed = actions.filter(a => a.status === "Done").length;
  const ongoing = actions.filter(a => a.status === "Ongoing").length;
  const pending = actions.filter(a => a.status === "Pending").length;
  const blocked = actions.filter(a => a.status === "Blocked").length;
  const completionRate = actions.length > 0 ? Math.round((completed / actions.length) * 100) : 0;

  const kpis = [
    { label: "Total Actions", value: actions.length, icon: <ClipboardList className="w-3.5 h-3.5" />, color: "text-foreground" },
    { label: "Completed", value: completed, icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: "text-success" },
    { label: "Ongoing", value: ongoing, icon: <Loader2 className="w-3.5 h-3.5" />, color: "text-primary" },
    { label: "Pending", value: pending, icon: <Clock className="w-3.5 h-3.5" />, color: "text-warning" },
    { label: "Completion Rate", value: `${completionRate}%`, icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: "text-success" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <SectionHeader
        title={`Action Plan — ${selectedMonth} ${selectedYear}`}
        subtitle=""
        icon={<ClipboardList className="w-4 h-4" />}
      />

      {/* Summary KPI Chips */}
      <div className="flex flex-wrap gap-3">
        {kpis.map((kpi, i) => (
          <div key={i} className="flex items-center gap-2.5 bg-card border border-border/40 rounded-xl px-4 py-3 shadow-card hover:shadow-card-hover transition-shadow duration-200">
            <span className={`${kpi.color}`}>{kpi.icon}</span>
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider leading-none mb-1">{kpi.label}</p>
              <p className={`text-lg font-bold ${kpi.color} leading-none`}>{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* View Toggle */}
      <div className="flex justify-end">
        <div className="inline-flex bg-muted rounded-lg p-1 gap-0.5">
          <button
            onClick={() => setView("table")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
              view === "table" ? "bg-card text-card-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutList className="w-3.5 h-3.5" /> Table View
          </button>
          <button
            onClick={() => setView("board")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
              view === "board" ? "bg-card text-card-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Board View
          </button>
        </div>
      </div>

      {/* Content */}
      {view === "table" ? <TableView items={actions} /> : <BoardView items={actions} />}
    </div>
  );
}
