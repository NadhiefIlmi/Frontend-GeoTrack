import { Link, useRouterState } from "@tanstack/react-router";
import { Boxes, History, LayoutDashboard } from "lucide-react";
import { useLanguage } from "@/i18n/language";
import type { TranslationKey } from "@/i18n/translations";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const NAV_ITEMS: Array<{
  path: string;
  labelKey: TranslationKey;
  icon: typeof LayoutDashboard;
  badgeBg: string;
}> = [
  { path: "/", labelKey: "nav.dashboard", icon: LayoutDashboard, badgeBg: "bg-[#D56673]" },
  { path: "/entities", labelKey: "nav.entities", icon: Boxes, badgeBg: "bg-[#F59E0B]" },
  { path: "/activity", labelKey: "nav.activity", icon: History, badgeBg: "bg-[#A855F7]" },
];

export function isNavActive(currentPath: string, itemPath: string): boolean {
  if (itemPath === "/") return currentPath === "/";
  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
}

/** Top concave curved SVG connecting the pink sidebar to the active gray tab */
function TopCurve({ color = "#F4F5F8" }: { color?: string }) {
  return (
    <svg
      className="absolute -top-4 right-0 size-4 pointer-events-none z-20"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M16 0 A 16 16 0 0 1 0 16 H 16 Z" fill={color} />
    </svg>
  );
}

/** Bottom concave curved SVG connecting the pink sidebar to the active gray tab */
function BottomCurve({ color = "#F4F5F8" }: { color?: string }) {
  return (
    <svg
      className="absolute -bottom-4 right-0 size-4 pointer-events-none z-20"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M0 0 A 16 16 0 0 1 16 16 V 0 Z" fill={color} />
    </svg>
  );
}

export function SidebarNav({
  onNavigate,
  className,
  collapsed = false,
}: {
  onNavigate?: () => void;
  className?: string;
  collapsed?: boolean;
}) {
  const { t } = useLanguage();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <TooltipProvider delayDuration={50}>
      <nav className={cn("flex flex-col gap-1 py-3", className)}>
        {NAV_ITEMS.map((item) => {
          const active = isNavActive(pathname, item.path);
          const label = t(item.labelKey);

          if (collapsed) {
            if (active) {
              return (
                <div key={item.path} className="relative z-20 my-1 w-full pl-2">
                  <TopCurve color="#F4F5F8" />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        to={item.path}
                        onClick={onNavigate}
                        aria-label={label}
                        aria-current="page"
                        className="relative flex h-13 w-full items-center justify-center rounded-l-full bg-[#F4F5F8] shadow-sm"
                      >
                        <div
                          className={cn(
                            "flex size-10 items-center justify-center rounded-full text-white shadow-sm transition-transform hover:scale-105",
                            item.badgeBg,
                          )}
                        >
                          <item.icon className="size-5 stroke-[2.2] text-white" />
                        </div>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="bg-slate-900 text-white font-semibold text-xs px-2.5 py-1.5 shadow-md"
                    >
                      {label}
                    </TooltipContent>
                  </Tooltip>
                  <BottomCurve color="#F4F5F8" />
                </div>
              );
            }

            return (
              <div key={item.path} className="flex justify-center px-2 py-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      to={item.path}
                      onClick={onNavigate}
                      aria-label={label}
                      className="group flex size-11 items-center justify-center rounded-xl text-white transition-all hover:bg-white/15"
                    >
                      <item.icon className="size-5 stroke-[2] text-white transition-transform group-hover:scale-110" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="bg-slate-900 text-white font-semibold text-xs px-2.5 py-1.5 shadow-md"
                  >
                    {label}
                  </TooltipContent>
                </Tooltip>
              </div>
            );
          }

          // Expanded mode
          if (active) {
            return (
              <div key={item.path} className="relative z-20 my-1 pl-3 w-full">
                <TopCurve color="#F4F5F8" />
                <Link
                  to={item.path}
                  onClick={onNavigate}
                  aria-current="page"
                  className="relative flex items-center gap-3.5 pl-2.5 pr-4 py-2 bg-[#F4F5F8] rounded-l-full shadow-sm transition-all w-full"
                >
                  <div
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-full text-white shadow-sm transition-transform",
                      item.badgeBg,
                    )}
                  >
                    <item.icon className="size-5 stroke-[2.2] text-white" />
                  </div>
                  <span className="truncate text-[11.5px] font-black tracking-wide uppercase text-slate-900">
                    {label}
                  </span>
                </Link>
                <BottomCurve color="#F4F5F8" />
              </div>
            );
          }

          return (
            <div key={item.path} className="px-3 py-0.5">
              <Link
                to={item.path}
                onClick={onNavigate}
                className="group relative flex items-center gap-3.5 rounded-xl pl-3 pr-3 py-2.5 text-white/95 transition-colors hover:bg-white/15 hover:text-white"
              >
                <item.icon className="size-5 stroke-[2] text-white transition-transform group-hover:scale-110" />
                <span className="truncate text-[12px] font-bold tracking-wider uppercase text-white">
                  {label}
                </span>
              </Link>
            </div>
          );
        })}
      </nav>
    </TooltipProvider>
  );
}
