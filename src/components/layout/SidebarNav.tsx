import { Link, useRouterState } from "@tanstack/react-router";
import { Boxes, History, LayoutDashboard, Map, Settings } from "lucide-react";
import { useLanguage } from "@/i18n/language";
import type { TranslationKey } from "@/i18n/translations";
import { cn } from "@/lib/utils";

const NAV_ITEMS: Array<{ path: string; labelKey: TranslationKey; icon: typeof Map }> = [
  { path: "/", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { path: "/entities", labelKey: "nav.entities", icon: Boxes },
  { path: "/map", labelKey: "nav.map", icon: Map },
  { path: "/activity", labelKey: "nav.activity", icon: History },
  { path: "/settings", labelKey: "nav.settings", icon: Settings },
];

export function isNavActive(currentPath: string, itemPath: string): boolean {
  if (itemPath === "/") return currentPath === "/";
  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
}

export function SidebarNav({ onNavigate, className }: { onNavigate?: () => void; className?: string }) {
  const { t } = useLanguage();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className={cn("flex flex-col gap-1 px-2", className)}>
      {NAV_ITEMS.map((item) => {
        const active = isNavActive(pathname, item.path);
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
              active
                ? "bg-primary/12 text-foreground"
                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
            )}
          >
            {active && <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary" />}
            <item.icon className={cn("size-4 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
            <span className="truncate">{t(item.labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
