import { Menu } from "lucide-react";
import { useState } from "react";
import { Brand } from "./AppSidebar";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { NotificationsPopover } from "./NotificationsPopover";
import { SidebarNav } from "./SidebarNav";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useLanguage } from "@/i18n/language";

export function AppHeader() {
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="z-40 flex h-14 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-4 text-slate-800 shadow-xs">
      {/* Mobile menu trigger */}
      <div className="flex items-center gap-2">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              aria-label={t("header.openMenu")}
            >
              <Menu className="size-4.5 text-slate-700" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[240px] border-r border-slate-200 bg-white p-0 text-slate-800"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>GeoTrack</SheetTitle>
            </SheetHeader>
            <div className="flex h-full flex-col">
              <Brand />
              <SidebarNav
                className="min-h-0 flex-1 overflow-y-auto py-2"
                onNavigate={() => setMenuOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Right controls: Language, Notifications, Admin User Profile */}
      <div className="ml-auto flex items-center gap-2">
        <LanguageSwitcher />
        <NotificationsPopover />

        {/* Admin User Profile */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <Avatar className="size-8 ring-1 ring-pink-100">
            <AvatarFallback className="bg-pink-100 text-[11px] font-bold text-[#D56673]">
              AU
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block min-w-0 text-left">
            <p className="truncate text-xs font-semibold leading-tight text-slate-900">
              {t("user.name")}
            </p>
            <p className="truncate text-[10px] leading-tight text-slate-500">{t("user.role")}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
