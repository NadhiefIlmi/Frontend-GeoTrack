import { Link } from "@tanstack/react-router";
import { Bell, MapPinned } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLanguage } from "@/i18n/language";
import { SidebarNav } from "./SidebarNav";

export function Brand() {
  const { t } = useLanguage();
  return (
    <div className="flex items-center gap-2.5 px-4 py-5">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <MapPinned className="size-4.5" />
      </div>
      <div className="min-w-0">
        <p className="font-display text-[15px] font-bold leading-tight tracking-wide text-foreground">GeoTrack</p>
        <p className="truncate text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{t("brand.tagline")}</p>
      </div>
    </div>
  );
}

function SidebarFooter() {
  const { t } = useLanguage();
  return (
    <div className="border-t border-border px-3 py-3">
      <Link
        to="/activity"
        aria-label={t("header.notifications")}
        className="mb-2 flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
      >
        <Bell className="size-4" />
        <span>{t("header.notifications")}</span>
      </Link>
      <div className="flex items-center gap-2.5 rounded-md px-1 py-1">
        <Avatar className="size-8">
          <AvatarFallback className="bg-primary/20 text-[11px] font-semibold text-primary">AU</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium leading-tight text-foreground">{t("user.name")}</p>
          <p className="truncate text-[11px] leading-tight text-muted-foreground">{t("user.role")}</p>
        </div>
      </div>
    </div>
  );
}

export function AppSidebar() {
  return (
    <aside className="hidden w-[220px] shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground md:flex">
      <Brand />
      <SidebarNav className="min-h-0 flex-1 overflow-y-auto py-2" />
      <SidebarFooter />
    </aside>
  );
}
