import { ReactNode, useState, useCallback, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useMonth, MONTHS, YEARS } from "@/contexts/MonthContext";
import { useAuth } from "@/contexts/AuthContext";
import { PageEditDialog } from "@/components/dashboard/PageEditDialog";
import { PAGE_SCHEMA_MAP } from "@/components/dashboard/pageEditSchemas";
import {
  LayoutDashboard, Globe, ShoppingCart, Store, ShoppingBag,
  Megaphone, DollarSign, Lightbulb, ClipboardList,
  ChevronLeft, ChevronRight, ChevronDown, Calendar, TrendingUp, BarChart3,
  LogOut, Shield, FileSpreadsheet, Search, Target,
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";

interface NavItem {
  label: string;
  path: string;
  icon: any;
  children?: { label: string; path: string; icon: any }[];
}

const navItems: NavItem[] = [
  { label: "Overview", path: "/", icon: LayoutDashboard },
  { label: "Website Performance", path: "/website", icon: Globe },
  
  { label: "Marketplace", path: "/marketplace", icon: Store },
  { label: "Benchmark", path: "/benchmark", icon: BarChart3 },
  {
    label: "Ads Budget", path: "/ads-budget", icon: DollarSign,
    children: [
      { label: "Google Ads", path: "/ads-budget/google", icon: Search },
      { label: "Meta Ads", path: "/ads-budget/meta", icon: Target },
      { label: "Shopee Ads", path: "/ads-budget/shopee", icon: ShoppingBag },
    ],
  },
  { label: "ROI & Revenue", path: "/roi-revenue", icon: TrendingUp },
  { label: "Sales Recap", path: "/sales-recap", icon: FileSpreadsheet },
  { label: "Insights", path: "/insights", icon: Lightbulb },
  { label: "Action Plan", path: "/recommendations", icon: ClipboardList },
];

function getPageTitle(pathname: string): string {
  for (const item of navItems) {
    if (item.path === pathname) return item.label;
    if (item.children) {
      const child = item.children.find(c => c.path === pathname);
      if (child) return child.label;
    }
  }
  return "Dashboard";
}

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();
  const { selectedMonth, selectedYear, setSelectedMonth, setSelectedYear } = useMonth();
  const { user, role, isAdmin, signOut } = useAuth();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const closeMobileDrawer = useCallback(() => {
    if (isMobile) setDrawerOpen(false);
  }, [isMobile]);

  // Ads Budget group expanded state — auto-expand when on child route
  const isOnAdsBudgetChild = location.pathname.startsWith("/ads-budget/");
  const [adsBudgetExpanded, setAdsBudgetExpanded] = useState(isOnAdsBudgetChild);
  // Keep expanded when navigating to child
  useEffect(() => {
    if (isOnAdsBudgetChild) {
      setAdsBudgetExpanded(true);
    }
  }, [isOnAdsBudgetChild]);

  const currentSchema = PAGE_SCHEMA_MAP[location.pathname];

  const renderNavItem = (item: NavItem) => {
    const hasChildren = item.children && item.children.length > 0;
    const isActive = location.pathname === item.path;
    const isChildActive = hasChildren && item.children!.some(c => location.pathname === c.path);
    const isGroupActive = isActive || isChildActive;
    const isExpanded = hasChildren && (adsBudgetExpanded || isChildActive);

    if (hasChildren) {
      return (
        <div key={item.path}>
          {/* Parent row: label navigates, chevron toggles */}
          <div className="flex items-center relative">
            <Link
              to={item.path}
              onClick={closeMobileDrawer}
              title={item.label}
              className={`flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-200 relative ${
                isActive ? "font-semibold" : isChildActive ? "font-medium" : "hover:bg-white/50 dark:hover:bg-white/10"
              }`}
              style={isActive ? {
                background: isDark
                  ? "linear-gradient(135deg, hsla(160, 40%, 25%, 0.4), hsla(180, 30%, 20%, 0.3))"
                  : "linear-gradient(135deg, hsla(160, 50%, 90%, 0.7), hsla(180, 40%, 92%, 0.5))",
                color: isDark ? "hsl(160, 40%, 80%)" : "hsl(220, 20%, 15%)",
                boxShadow: isDark ? "0 1px 4px hsla(160, 40%, 30%, 0.15)" : "0 1px 4px hsla(160, 40%, 50%, 0.12)",
              } : isChildActive ? {
                background: isDark
                  ? "hsla(160, 30%, 20%, 0.2)"
                  : "hsla(160, 40%, 94%, 0.5)",
                color: isDark ? "hsl(160, 30%, 75%)" : "hsl(220, 20%, 20%)",
              } : {
                color: isDark ? "hsl(220, 12%, 60%)" : "hsl(220, 12%, 45%)",
              }}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={isActive ? {
                  background: "linear-gradient(135deg, hsla(160, 50%, 85%, 0.8), hsla(200, 50%, 90%, 0.6))",
                } : {}}
              >
                <item.icon className="w-[16px] h-[16px]" />
              </div>
              {!collapsed && <span className="truncate">{item.label}</span>}
              {isActive && !collapsed && (
                <div className="ml-auto w-2 h-2 rounded-full" style={{ background: "hsl(38, 90%, 55%)" }} />
              )}
            </Link>
            {/* Chevron toggle button — separate click target */}
            {!collapsed && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setAdsBudgetExpanded(!isExpanded);
                }}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/40 dark:hover:bg-white/10"
                style={{ color: isDark ? "hsl(220, 12%, 55%)" : "hsl(220, 12%, 50%)" }}
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "rotate-0" : "-rotate-90"}`} />
              </button>
            )}
          </div>

          {/* Children with tree connector lines */}
          {isExpanded && !collapsed && (
            <div className="relative ml-[22px] mt-0.5 mb-1">
              {/* Vertical connector line */}
              <div
                className="absolute left-[11px] top-0 w-px"
                style={{
                  height: "calc(100% - 16px)",
                  background: isDark ? "hsla(160, 30%, 40%, 0.3)" : "hsla(160, 40%, 70%, 0.5)",
                }}
              />
              {item.children!.map((child, idx) => {
                const isChildItemActive = location.pathname === child.path;
                return (
                  <div key={child.path} className="relative flex items-center">
                    {/* Horizontal connector */}
                    <div
                      className="absolute left-[11px] top-1/2 -translate-y-1/2"
                      style={{
                        width: "12px",
                        height: "1px",
                        background: isDark ? "hsla(160, 30%, 40%, 0.3)" : "hsla(160, 40%, 70%, 0.5)",
                      }}
                    />
                    <Link
                      to={child.path}
                      onClick={closeMobileDrawer}
                      title={child.label}
                      className={`flex items-center gap-2.5 ml-[26px] px-3 py-2 rounded-xl text-[12.5px] transition-all duration-200 w-full ${
                        isChildItemActive ? "font-semibold" : "hover:bg-white/40 dark:hover:bg-white/10"
                      }`}
                      style={isChildItemActive ? {
                        background: isDark
                          ? "linear-gradient(135deg, hsla(160, 40%, 25%, 0.35), hsla(180, 30%, 20%, 0.25))"
                          : "linear-gradient(135deg, hsla(160, 50%, 90%, 0.6), hsla(180, 40%, 92%, 0.4))",
                        color: isDark ? "hsl(160, 40%, 80%)" : "hsl(220, 20%, 15%)",
                        boxShadow: isDark ? "0 1px 3px hsla(160, 40%, 30%, 0.1)" : "0 1px 3px hsla(160, 40%, 50%, 0.08)",
                      } : {
                        color: isDark ? "hsl(220, 12%, 55%)" : "hsl(220, 12%, 48%)",
                      }}
                    >
                      <child.icon className="w-[14px] h-[14px] shrink-0" />
                      <span className="truncate">{child.label}</span>
                      {isChildItemActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "hsl(38, 90%, 55%)" }} />
                      )}
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    // Regular nav item (no children)
    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={closeMobileDrawer}
        title={item.label}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-200 relative ${
          isActive ? "font-semibold" : "hover:bg-white/50 dark:hover:bg-white/10"
        }`}
        style={isActive ? {
          background: isDark
            ? "linear-gradient(135deg, hsla(160, 40%, 25%, 0.4), hsla(180, 30%, 20%, 0.3))"
            : "linear-gradient(135deg, hsla(160, 50%, 90%, 0.7), hsla(180, 40%, 92%, 0.5))",
          color: isDark ? "hsl(160, 40%, 80%)" : "hsl(220, 20%, 15%)",
          boxShadow: isDark ? "0 1px 4px hsla(160, 40%, 30%, 0.15)" : "0 1px 4px hsla(160, 40%, 50%, 0.12)",
        } : {
          color: isDark ? "hsl(220, 12%, 60%)" : "hsl(220, 12%, 45%)",
        }}
      >
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={isActive ? {
            background: "linear-gradient(135deg, hsla(160, 50%, 85%, 0.8), hsla(200, 50%, 90%, 0.6))",
          } : {}}
        >
          <item.icon className="w-[16px] h-[16px]" />
        </div>
        {!collapsed && <span className="truncate">{item.label}</span>}
        {isActive && !collapsed && (
          <div className="ml-auto w-2 h-2 rounded-full" style={{ background: "hsl(38, 90%, 55%)" }} />
        )}
      </Link>
    );
  };

  const sidebarContent = (
    <>
      {/* Sparkle accents */}
      <div className="absolute top-0 left-0 right-0 h-24 pointer-events-none overflow-hidden rounded-tr-2xl">
        <div className="absolute top-4 right-8 w-20 h-20 rounded-full opacity-30" style={{ background: isDark ? "radial-gradient(circle, hsla(160, 60%, 40%, 0.3), transparent 70%)" : "radial-gradient(circle, hsla(160, 80%, 70%, 0.4), transparent 70%)" }} />
        <div className="absolute top-2 left-12 w-12 h-12 rounded-full opacity-20" style={{ background: isDark ? "radial-gradient(circle, hsla(200, 60%, 50%, 0.3), transparent 70%)" : "radial-gradient(circle, hsla(200, 80%, 75%, 0.5), transparent 70%)" }} />
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none overflow-hidden">
        <div className="absolute bottom-3 right-6 w-16 h-16 rounded-full opacity-25" style={{ background: isDark ? "radial-gradient(circle, hsla(160, 50%, 35%, 0.3), transparent 70%)" : "radial-gradient(circle, hsla(160, 70%, 65%, 0.4), transparent 70%)" }} />
        <div className="absolute bottom-5 left-8 w-10 h-10 rounded-full opacity-15" style={{ background: isDark ? "radial-gradient(circle, hsla(40, 70%, 45%, 0.3), transparent 70%)" : "radial-gradient(circle, hsla(40, 90%, 70%, 0.4), transparent 70%)" }} />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-5 relative z-10">
        {!(isMobile ? false : collapsed) && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ background: isDark ? "linear-gradient(135deg, hsla(160, 40%, 20%, 0.6), hsla(200, 40%, 22%, 0.6))" : "linear-gradient(135deg, hsla(160, 50%, 92%, 0.9), hsla(200, 50%, 94%, 0.9))" }}>
              <Megaphone className="w-5 h-5" style={{ color: isDark ? "hsl(160, 50%, 60%)" : "hsl(160, 50%, 40%)" }} />
            </div>
            <span className="font-bold text-[15px] tracking-tight" style={{ color: isDark ? "hsl(210, 20%, 88%)" : "hsl(220, 20%, 18%)" }}>DigiDash</span>
          </div>
        )}
        {isMobile ? (
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-1.5 rounded-lg transition-colors hover:bg-white/60"
            style={{ color: "hsl(220, 15%, 50%)" }}
          >
            <X className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg transition-colors hover:bg-white/60"
            style={{ color: "hsl(220, 15%, 50%)" }}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 px-3 space-y-0.5 overflow-y-auto relative z-10">
        {navItems.map(renderNavItem)}
      </nav>

      {/* Footer */}
      {!(isMobile ? false : collapsed) && (
        <div className="px-5 py-4 relative z-10" style={{ borderTop: isDark ? "1px solid hsla(222, 25%, 20%, 0.5)" : "1px solid hsla(160, 20%, 88%, 0.5)" }}>
          {user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {isAdmin && <Shield className="w-3.5 h-3.5" style={{ color: "hsl(160, 50%, 40%)" }} />}
                <span className="text-[11px] truncate" style={{ color: "hsl(220, 12%, 55%)" }}>{user.email}</span>
                <Badge variant="outline" className="text-[9px] px-1.5 py-0" style={{ borderColor: "hsla(160, 20%, 85%, 0.6)", color: "hsl(220, 12%, 55%)" }}>
                  {role}
                </Badge>
              </div>
              <button
                onClick={signOut}
                className="flex items-center gap-2 text-[11px] transition-colors hover:opacity-80"
                style={{ color: "hsl(220, 12%, 60%)" }}
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          ) : (
            <Link
              to="/admin-login"
              onClick={closeMobileDrawer}
              className="flex items-center gap-2 text-[11px] transition-colors hover:opacity-80"
              style={{ color: "hsl(220, 12%, 55%)" }}
            >
              <Shield className="w-3.5 h-3.5" style={{ color: "hsl(160, 50%, 40%)" }} /> Admin Login
              <div className="ml-auto w-2 h-2 rounded-full" style={{ background: "hsl(38, 90%, 55%)" }} />
            </Link>
          )}
        </div>
      )}
    </>
  );

  const sidebarStyles = {
    background: isDark
      ? "linear-gradient(180deg, hsla(222, 40%, 10%, 0.92) 0%, hsla(222, 45%, 8%, 0.95) 50%, hsla(222, 40%, 10%, 0.92) 100%)"
      : "linear-gradient(180deg, hsla(160, 40%, 96%, 0.85) 0%, hsla(0, 0%, 100%, 0.92) 30%, hsla(0, 0%, 100%, 0.95) 70%, hsla(180, 30%, 96%, 0.85) 100%)",
    backdropFilter: "blur(24px)" as const,
    WebkitBackdropFilter: "blur(24px)",
    borderRight: isDark ? "1px solid hsla(222, 25%, 20%, 0.6)" : "1px solid hsla(160, 20%, 88%, 0.6)",
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Mobile overlay */}
      {isMobile && drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Sidebar */}
      {isMobile ? (
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-[260px] flex flex-col transition-transform duration-300 ease-in-out ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          style={sidebarStyles}
        >
          {sidebarContent}
        </aside>
      ) : (
        <aside
          className={`${collapsed ? "w-[68px]" : "w-[260px]"} flex flex-col transition-all duration-300 ease-in-out shrink-0 relative`}
          style={sidebarStyles}
        >
          {sidebarContent}
        </aside>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-card/80 backdrop-blur-sm border-b border-border/60 px-3 md:px-8 py-3 md:py-4 flex items-center justify-between shrink-0 sticky top-0 z-10 gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {isMobile && (
              <button
                onClick={() => setDrawerOpen(true)}
                className="p-1.5 rounded-lg transition-colors hover:bg-muted shrink-0"
              >
                <Menu className="w-5 h-5 text-foreground" />
              </button>
            )}
            <h1 className="text-base md:text-page-title text-foreground tracking-tight truncate">
              {getPageTitle(location.pathname)}
            </h1>
          </div>
          <div className="flex items-center gap-1 md:gap-3 shrink-0">
            {currentSchema && <PageEditDialog schema={currentSchema} />}
            <ThemeToggle />
            <Calendar className="w-4 h-4 text-muted-foreground hidden md:block" />
            <Select value={selectedMonth} onValueChange={(v) => setSelectedMonth(v as any)}>
              <SelectTrigger className="w-[72px] sm:w-24 md:w-32 h-8 md:h-9 text-xs md:text-sm rounded-lg border-border/60 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
              <SelectTrigger className="w-[60px] sm:w-16 md:w-20 h-8 md:h-9 text-xs md:text-sm rounded-lg border-border/60 bg-background">
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

        <main className="flex-1 px-3 md:px-8 py-4 md:py-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
