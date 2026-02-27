import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle({ collapsed = false }: { collapsed?: boolean }) {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-200 hover:bg-white/50 dark:hover:bg-white/10 w-full"
      style={{ color: "hsl(220, 12%, 45%)" }}
      title={theme === "dark" ? "Switch to Light" : "Switch to Dark"}
    >
      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0">
        {theme === "dark" ? (
          <Sun className="w-4 h-4" />
        ) : (
          <Moon className="w-4 h-4" />
        )}
      </div>
      {!collapsed && (
        <span className="truncate">
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </span>
      )}
    </button>
  );
}
