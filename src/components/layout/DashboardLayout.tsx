import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useMonth } from "@/contexts/MonthContext";
import { MONTHS } from "@/data/mockData";
import {
  LayoutDashboard, Globe, ShoppingCart, Store, ShoppingBag,
  Megaphone, DollarSign, Lightbulb, ClipboardList, Flag,
  ChevronLeft, ChevronRight, Calendar,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const navItems = [
  { label: "Overview", path: "/", icon: LayoutDashboard },
  { label: "Website Performance", path: "/website", icon: Globe },
  { label: "Webstore Sales", path: "/webstore", icon: ShoppingCart },
  { label: "Marketplace", path: "/marketplace", icon: Store },
  { label: "Shopee Ads", path: "/shopee-ads", icon: ShoppingBag },
  { label: "Ads Budget", path: "/ads-budget", icon: DollarSign },
  { label: "Insights", path: "/insights", icon: Lightbulb },
  { label: "Recommendations", path: "/recommendations", icon: ClipboardList },
  { label: "Closing & Summary", path: "/closing", icon: Flag },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { selectedMonth, setSelectedMonth } = useMonth();

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <aside
        className={`${collapsed ? "w-16" : "w-60"} bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-200 shrink-0 border-r border-sidebar-border`}
      >
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <Megaphone className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-sm text-sidebar-primary-foreground">DigiDash</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md hover:bg-sidebar-accent transition-colors text-sidebar-foreground"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={item.label}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                    : "hover:bg-sidebar-accent text-sidebar-foreground"
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="p-4 border-t border-sidebar-border text-xs text-sidebar-foreground/50">
            Digital Marketing Dashboard v1.0
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-card border-b border-border px-6 py-3 flex items-center justify-between shrink-0">
          <h1 className="text-base font-semibold text-foreground">
            {navItems.find((n) => n.path === location.pathname)?.label || "Dashboard"}
          </h1>
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Select value={selectedMonth} onValueChange={(v) => setSelectedMonth(v as any)}>
              <SelectTrigger className="w-40 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
