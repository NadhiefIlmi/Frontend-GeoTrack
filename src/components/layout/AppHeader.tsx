import { useRouterState } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Brand, AppSidebar } from "./AppSidebar";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { NotificationsPopover } from "./NotificationsPopover";
import { SidebarNav, isNavActive } from "./SidebarNav";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useLanguage } from "@/i18n/language";
import type { TranslationKey } from "@/i18n/translations";

const TITLE_BY_PATH: Array<{ path: string; key: TranslationKey }> = [
  { path: "/entities", key: "nav.entities" },
  { path: "/map", key: "nav.map" },
  { path: "/activity", key: "nav.activity" },
  { path: "/settings", key: "nav.settings" },
  { path: "/", key: "nav.dashboard" },
];

export function AppHeader() {
  const { t } = useLanguage();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);

  const match = TITLE_BY_PATH.find((entry) => isNavActive(pathname, entry.path));

  return (
    <header className="z-20 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur">
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground" aria-label={t("header.openMenu")}>
            <Menu className="size-4.5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[240px] border-r border-border bg-sidebar p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>GeoTrack</SheetTitle>
          </SheetHeader>
          <div className="flex h-full flex-col">
            <Brand />
            <SidebarNav className="min-h-0 flex-1 overflow-y-auto py-2" onNavigate={() => setMenuOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <h1 className="truncate text-sm font-medium text-foreground">{match ? t(match.key) : "GeoTrack"}</h1>

      <div className="ml-auto flex items-center gap-1">
        <LanguageSwitcher />
        <NotificationsPopover />
      </div>
    </header>
  );
}
