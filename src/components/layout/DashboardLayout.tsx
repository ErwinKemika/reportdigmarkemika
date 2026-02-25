import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useMonth, MONTHS, YEARS } from "@/contexts/MonthContext";
import { useAuth } from "@/contexts/AuthContext";
import { PageEditDialog } from "@/components/dashboard/PageEditDialog";
import { PAGE_SCHEMA_MAP } from "@/components/dashboard/pageEditSchemas";
import {
  LayoutDashboard, Globe, ShoppingCart, Store, ShoppingBag,
  Megaphone, DollarSign, Lightbulb, ClipboardList, ListChecks,
  ChevronLeft, ChevronRight, Calendar, TrendingUp, BarChart3,
  LogOut, Shield,
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { label: "Overview", path: "/", icon: LayoutDashboard },
  { label: "Website Performance", path: "/website", icon: Globe },
  { label: "Webstore Sales", path: "/webstore", icon: ShoppingCart },
  { label: "Marketplace", path: "/marketplace", icon: Store },
  { label: "Benchmark", path: "/benchmark", icon: BarChart3 },
  { label: "Shopee Ads", path: "/shopee-ads", icon: ShoppingBag },
  { label: "Ads Budget", path: "/ads-budget", icon: DollarSign },
  { label: "ROI & Revenue", path: "/roi-revenue", icon: TrendingUp },
  { label: "Insights", path: "/insights", icon: Lightbulb },
  { label: "Action Plan", path: "/recommendations", icon: ClipboardList },
  { label: "Execution & Realization", path: "/execution", icon: ListChecks },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { selectedMonth, selectedYear, setSelectedMonth, setSelectedYear } = useMonth();
  const { user, role, isAdmin, signOut } = useAuth();

  // Get schema for current page
  const currentSchema = PAGE_SCHEMA_MAP[location.pathname];

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <aside
        className={`${collapsed ? "w-[68px]" : "w-[240px]"} bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 ease-in-out shrink-0`}
      >
        <div className="flex items-center justify-between px-4 py-5 border-b border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center shadow-card">
                <Megaphone className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-[13px] text-sidebar-accent-foreground tracking-tight">DigiDash</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={item.label}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-all duration-150 ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-card"
                    : "hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground"
                }`}
              >
                <item.icon className="w-[18px] h-[18px] shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="px-4 py-4 border-t border-sidebar-border space-y-3">
            {user ? (
              <>
                <div className="flex items-center gap-2">
                  {isAdmin && <Shield className="w-3.5 h-3.5 text-sidebar-primary" />}
                  <span className="text-[11px] text-sidebar-foreground/60 truncate">{user.email}</span>
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-sidebar-border text-sidebar-foreground/50">
                    {role}
                  </Badge>
                </div>
                <button
                  onClick={signOut}
                  className="flex items-center gap-2 text-[11px] text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/admin-login"
                className="flex items-center gap-2 text-[11px] text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors"
              >
                <Shield className="w-3.5 h-3.5" /> Admin Login
              </Link>
            )}
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-card/80 backdrop-blur-sm border-b border-border/60 px-8 py-4 flex items-center justify-between shrink-0 sticky top-0 z-10">
          <h1 className="text-page-title text-foreground tracking-tight">
            {navItems.find((n) => n.path === location.pathname)?.label || "Dashboard"}
          </h1>
          <div className="flex items-center gap-3">
            {currentSchema && <PageEditDialog schema={currentSchema} />}
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Select value={selectedMonth} onValueChange={(v) => setSelectedMonth(v as any)}>
              <SelectTrigger className="w-32 h-9 text-sm rounded-lg border-border/60 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
              <SelectTrigger className="w-20 h-9 text-sm rounded-lg border-border/60 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-8 py-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
