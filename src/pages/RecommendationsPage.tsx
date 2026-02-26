import { useMergedPageData } from "@/hooks/useMergedPageData";
import { getRecommendationsData, type RecommendationsData } from "@/data/mockData";
import { transformRecommendations } from "@/lib/dataTransformers";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { NoData } from "@/components/dashboard/NoData";
import { ClipboardList, CheckCircle2, Loader2, Clock, AlertTriangle, LayoutList, LayoutGrid, TrendingUp, Plus } from "lucide-react";
import { useMonth } from "@/contexts/MonthContext";
import { useState, useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { PageEditDialog } from "@/components/dashboard/PageEditDialog";
import { recommendationsSchema } from "@/components/dashboard/pageEditSchemas";

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

// Warm pastel color scheme matching reference image
const STATUS_STYLES: Record<Status, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
  Done:    { bg: "bg-[hsl(145,60%,92%)]", text: "text-[hsl(145,55%,35%)]", border: "border-[hsl(145,50%,80%)]", icon: <CheckCircle2 className="w-3 h-3" /> },
  Ongoing: { bg: "bg-[hsl(210,70%,92%)]", text: "text-[hsl(210,60%,40%)]", border: "border-[hsl(210,60%,82%)]", icon: <Loader2 className="w-3 h-3" /> },
  Pending: { bg: "bg-[hsl(30,90%,92%)]",  text: "text-[hsl(25,80%,42%)]",  border: "border-[hsl(30,80%,82%)]",  icon: <Clock className="w-3 h-3" /> },
  Blocked: { bg: "bg-[hsl(0,70%,93%)]",   text: "text-[hsl(0,60%,45%)]",   border: "border-[hsl(0,60%,83%)]",   icon: <AlertTriangle className="w-3 h-3" /> },
};

const PRIORITY_STYLES: Record<Priority, { bg: string; text: string; border: string }> = {
  High:   { bg: "bg-[hsl(0,75%,93%)]",   text: "text-[hsl(0,65%,45%)]",   border: "border-[hsl(0,60%,85%)]" },
  Medium: { bg: "bg-[hsl(35,85%,91%)]",  text: "text-[hsl(30,70%,40%)]",  border: "border-[hsl(35,70%,82%)]" },
  Low:    { bg: "bg-[hsl(220,15%,94%)]",  text: "text-[hsl(220,10%,50%)]", border: "border-[hsl(220,12%,86%)]" },
};

const CATEGORY_COLORS: Record<Category, { border: string; bg: string; text: string; accent: string; progressBar: string }> = {
  Immediate: {
    border: "border-l-[hsl(145,55%,50%)]",
    bg: "bg-[hsl(145,55%,92%)]",
    text: "text-[hsl(145,55%,32%)]",
    accent: "hsl(145,55%,50%)",
    progressBar: "[&>div]:bg-[hsl(145,55%,50%)]",
  },
  Tactical: {
    border: "border-l-[hsl(25,85%,55%)]",
    bg: "bg-[hsl(25,85%,93%)]",
    text: "text-[hsl(25,70%,35%)]",
    accent: "hsl(25,85%,55%)",
    progressBar: "[&>div]:bg-[hsl(25,85%,55%)]",
  },
  Strategic: {
    border: "border-l-[hsl(160,60%,45%)]",
    bg: "bg-[hsl(160,55%,92%)]",
    text: "text-[hsl(160,55%,30%)]",
    accent: "hsl(160,60%,45%)",
    progressBar: "[&>div]:bg-[hsl(160,60%,45%)]",
  },
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
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold border ${s.bg} ${s.text} ${s.border}`}>
      {s.icon} {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const s = PRIORITY_STYLES[priority];
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold border ${s.bg} ${s.text} ${s.border}`}>
      {priority}
    </span>
  );
}

function CategoryBadge({ category }: { category: Category }) {
  const c = CATEGORY_COLORS[category];
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-bold ${c.bg} ${c.text}`}>
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
        const c = CATEGORY_COLORS[cat];
        const catItems = items.filter(i => i.category === cat);
        return (
          <div key={cat} className="rounded-xl border border-border/40 bg-card shadow-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border/30 flex items-center gap-2">
              <CategoryBadge category={cat} />
              <span className="text-xs text-muted-foreground ml-auto">{catItems.length} items</span>
            </div>
            <div className="p-3 space-y-3">
              {catItems.map((item, i) => (
                <div key={i} className={`rounded-lg border border-border/30 bg-background p-4 space-y-3 border-l-4 ${c.border} hover:shadow-md transition-shadow duration-200`}>
                  <p className="text-sm font-medium text-card-foreground leading-relaxed">{item.task}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <PriorityBadge priority={item.priority} />
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="bg-muted px-2 py-0.5 rounded-full">{item.timeline}</span>
                    <span className="font-semibold">{item.progress}%</span>
                  </div>
                  <Progress value={item.progress} className={`h-1.5 ${c.progressBar}`} />
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
      <div className="grid grid-cols-[1fr_2.5fr_100px_110px_110px_120px] gap-0 px-5 py-3.5 bg-[hsl(220,15%,96%)] border-b border-border/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <span>Category</span>
        <span>Task</span>
        <span>Priority</span>
        <span>Status</span>
        <span>Timeline</span>
        <span className="text-right">Progress</span>
      </div>

      {/* Rows grouped by category */}
      {grouped.map(group => {
        const c = CATEGORY_COLORS[group.category];
        return (
          <div key={group.category}>
            {/* Category header row */}
            <div className={`grid grid-cols-[1fr_2.5fr_100px_110px_110px_120px] gap-0 px-5 py-3 bg-[hsl(220,15%,97%)] border-b border-border/20 border-l-4 ${c.border}`}>
              <div className="col-span-2 flex items-center gap-3">
                <CategoryBadge category={group.category} />
                <span className="text-xs text-muted-foreground">{group.items.length} actions</span>
              </div>
              <div><PriorityBadge priority={group.items[0]?.priority || "Medium"} /></div>
              <div><StatusBadge status={group.items[0]?.status || "Ongoing"} /></div>
              <span className="text-xs text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full w-fit">
                {group.items[0]?.timeline || ""}
              </span>
              <div className="flex items-center gap-2 justify-end">
                <Progress
                  value={group.items.length > 0 ? Math.round(group.items.reduce((s, i) => s + i.progress, 0) / group.items.length) : 0}
                  className={`h-2 w-20 ${c.progressBar}`}
                />
                <span className="text-xs font-semibold text-card-foreground w-8 text-right">
                  {group.items.length > 0 ? Math.round(group.items.reduce((s, i) => s + i.progress, 0) / group.items.length) : 0}%
                </span>
              </div>
            </div>

            {/* Action rows */}
            {group.items.map((item, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_2.5fr_100px_110px_110px_120px] gap-0 px-5 py-3 border-b border-border/15 hover:bg-[hsl(220,15%,97.5%)] transition-colors duration-150 items-center"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">{i + 1}</span>
                </div>
                <p className="text-sm text-card-foreground pr-3">{item.task}</p>
                <div><PriorityBadge priority={item.priority} /></div>
                <div><StatusBadge status={item.status} /></div>
                <span className="text-xs text-muted-foreground bg-[hsl(220,15%,95%)] px-2.5 py-1 rounded-full w-fit">{item.timeline}</span>
                <div className="flex items-center gap-2 justify-end">
                  <Progress value={item.progress} className={`h-2 w-20 ${c.progressBar}`} />
                  <span className="text-xs font-semibold text-card-foreground w-8 text-right">{item.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        );
      })}

      {/* Add New Action footer */}
      <div className="flex justify-center py-4 border-t border-border/20">
        <span className="text-xs text-muted-foreground flex items-center gap-1.5 cursor-default">
          <Plus className="w-3.5 h-3.5" /> Add New Action
        </span>
      </div>
    </div>
  );
}

// ========== COMPLETION RATE RING ==========
function CompletionRing({ rate, prevRate }: { rate: number; prevRate?: number }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const offset = circ - (rate / 100) * circ;
  const diff = prevRate !== undefined ? rate - prevRate : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-16 h-16">
        <svg viewBox="0 0 90 90" className="w-full h-full -rotate-90">
          <circle cx="45" cy="45" r={r} fill="none" stroke="hsl(220,15%,92%)" strokeWidth="6" />
          <circle cx="45" cy="45" r={r} fill="none" stroke="hsl(262,52%,56%)" strokeWidth="6"
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold text-foreground">{rate}%</span>
          {diff !== 0 && (
            <span className={`text-[9px] font-semibold ${diff >= 0 ? "text-success" : "text-destructive"}`}>
              {diff >= 0 ? "+" : ""}{diff}%
            </span>
          )}
        </div>
      </div>
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
  const completionRate = actions.length > 0 ? Math.round((completed / actions.length) * 100) : 0;

  const kpis = [
    { label: "Total Actions", value: actions.length, icon: <ClipboardList className="w-4 h-4" />, color: "text-foreground", sub: `${actions.length}` },
    { label: "Completed", value: completed, icon: <CheckCircle2 className="w-4 h-4" />, color: "text-[hsl(145,55%,35%)]", sub: "100.0% vs prev" },
    { label: "Ongoing", value: ongoing, icon: <Loader2 className="w-4 h-4" />, color: "text-[hsl(210,60%,40%)]", sub: "100.0% vs prev" },
    { label: "Pending", value: pending, icon: <Clock className="w-4 h-4" />, color: "text-[hsl(30,80%,42%)]", sub: "100.0% vs prev" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <SectionHeader
          title={`Action Plan — ${selectedMonth} ${selectedYear}`}
          subtitle=""
          icon={<ClipboardList className="w-4 h-4" />}
        />
        <PageEditDialog schema={recommendationsSchema} />
      </div>

      {/* Summary KPI Row */}
      <div className="bg-card rounded-xl border border-border/40 shadow-card p-5">
        <div className="flex items-center gap-4 flex-wrap">
          {kpis.map((kpi, i) => (
            <div key={i} className="flex items-center gap-3 bg-[hsl(220,15%,97%)] rounded-xl px-5 py-4 min-w-[150px]">
              <span className={`${kpi.color} opacity-70`}>{kpi.icon}</span>
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider leading-none mb-1.5">{kpi.label}</p>
                <p className={`text-xl font-bold ${kpi.color} leading-none`}>{kpi.value}</p>
                {i > 0 && (
                  <p className="text-[9px] text-muted-foreground mt-1 flex items-center gap-0.5">
                    <TrendingUp className="w-2.5 h-2.5" /> {kpi.sub}
                  </p>
                )}
                {i === 0 && (
                  <p className="text-[9px] text-muted-foreground mt-1 flex items-center gap-0.5">
                    <ClipboardList className="w-2.5 h-2.5" /> {kpi.sub}
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* Completion Rate Ring */}
          <div className="flex items-center gap-3 bg-[hsl(220,15%,97%)] rounded-xl px-5 py-4 ml-auto">
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider leading-none mb-1.5">Completion Rate</p>
              <p className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                <TrendingUp className="w-2.5 h-2.5" /> {completionRate}% MoM
              </p>
            </div>
            <CompletionRing rate={completionRate} prevRate={0} />
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex justify-end">
        <div className="inline-flex bg-[hsl(220,15%,95%)] rounded-lg p-1 gap-0.5 border border-border/30">
          <button
            onClick={() => setView("table")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
              view === "table" ? "bg-card text-card-foreground shadow-sm border border-border/40" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutList className="w-3.5 h-3.5" /> Table View
          </button>
          <button
            onClick={() => setView("board")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
              view === "board" ? "bg-card text-card-foreground shadow-sm border border-border/40" : "text-muted-foreground hover:text-foreground"
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
