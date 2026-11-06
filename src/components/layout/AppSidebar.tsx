import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import logoUrl from "@/assets/logo.png";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLanguage } from "@/i18n/language";
import { cn } from "@/lib/utils";
import { SidebarNav } from "./SidebarNav";
import { useSidebarState } from "./SidebarContext";

export function Brand({
  collapsed = false,
  onToggle,
}: {
  collapsed?: boolean;
  onToggle?: () => void;
}) {
  const { t } = useLanguage();

  if (collapsed) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 border-b border-[#c45360] px-2 py-4">
        <Link
          to="/"
          title="GeoTrack"
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white p-1 shadow-sm transition-transform hover:scale-105"
        >
          <img src={logoUrl} alt="GeoTrack" className="size-full object-contain" />
        </Link>
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            title={t("sidebar.expand")}
            aria-label={t("sidebar.expand")}
            className="flex size-7 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/15 hover:text-white"
          >
            <ChevronRight className="size-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between border-b border-[#c45360] px-4 py-4.5">
      <Link to="/" className="flex min-w-0 items-center gap-2.5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white p-1 shadow-sm">
          <img src={logoUrl} alt="GeoTrack" className="size-full object-contain" />
        </div>
        <div className="min-w-0">
          <p className="font-display text-[15px] font-black tracking-wider text-white uppercase">
            GeoTrack
          </p>
          <p className="whitespace-nowrap text-[9px] uppercase tracking-widest text-white/90 font-bold">
            {t("brand.tagline")}
          </p>
        </div>
      </Link>
      {onToggle && (
        <button
          type="button"
          onClick={onToggle}
          title={t("sidebar.collapse")}
          aria-label={t("sidebar.collapse")}
          className="ml-2 flex size-7 shrink-0 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/15 hover:text-white"
        >
          <ChevronLeft className="size-4" />
        </button>
      )}
    </div>
  );
}

function SidebarFooter({ collapsed = false }: { collapsed?: boolean }) {
  const { t } = useLanguage();

  if (collapsed) {
    return (
      <TooltipProvider delayDuration={50}>
        <div className="border-t border-[#c45360] p-2.5 flex justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to="/entities"
                aria-label={t("entities.add")}
                className="flex size-10 items-center justify-center rounded-xl bg-white text-slate-900 shadow-md transition-all hover:bg-slate-100 active:scale-95"
              >
                <Plus className="size-5 stroke-[2.5]" />
              </Link>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="bg-slate-900 text-white font-semibold text-xs px-2.5 py-1.5 shadow-md"
            >
              + {t("entities.add")}
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <div className="border-t border-[#c45360] p-3">
      <Link
        to="/entities"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 px-3 text-[13px] font-black text-slate-900 shadow-md transition-all hover:bg-slate-100 active:scale-[0.98]"
      >
        <Plus className="size-4 stroke-[2.5]" />
        <span>+ {t("entities.add")}</span>
      </Link>
    </div>
  );
}

export function AppSidebar() {
  const { isCollapsed, toggleSidebar } = useSidebarState();

  return (
    <aside
      className={cn(
        "relative z-30 hidden shrink-0 flex-col bg-[#D56673] text-white transition-[width] duration-300 ease-in-out md:flex",
        isCollapsed ? "w-[76px]" : "w-[240px]",
      )}
    >
      <Brand collapsed={isCollapsed} onToggle={toggleSidebar} />
      <SidebarNav
        collapsed={isCollapsed}
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden scroll-thin py-2"
      />
      <SidebarFooter collapsed={isCollapsed} />
    </aside>
  );
}
