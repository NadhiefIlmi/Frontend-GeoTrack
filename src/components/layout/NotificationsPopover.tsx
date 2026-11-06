import { Link } from "@tanstack/react-router";
import { Bell, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useEntityStore } from "@/state/EntityStore";
import { relativeTime } from "@/lib/format";
import { useLanguage } from "@/i18n/language";
import type { TranslationKey } from "@/i18n/translations";
import type { ActivityKind } from "@/types/entity";

const KIND_ICONS: Record<ActivityKind, typeof Plus> = {
  created: Plus,
  updated: Pencil,
  status_changed: RefreshCw,
  deleted: Trash2,
};

const KIND_LABELS: Record<ActivityKind, TranslationKey> = {
  created: "activity.kind.created",
  updated: "activity.kind.updated",
  status_changed: "activity.kind.status_changed",
  deleted: "activity.kind.deleted",
};

export function NotificationsPopover() {
  const { activities } = useEntityStore();
  const { t, lang } = useLanguage();
  const recent = (activities || []).slice(0, 4);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-lg"
          aria-label={t("header.notifications")}
        >
          <Bell className="size-4 text-slate-600" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-[#D56673] ring-2 ring-white" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 border-border bg-popover p-0 z-[9999] shadow-xl">
        <p className="border-b border-border px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t("header.notifications")}
        </p>
        <div className="max-h-72 overflow-y-auto scroll-thin">
          {recent.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">{t("activity.empty")}</p>
          ) : (
            recent.map((entry) => {
              const Icon = KIND_ICONS[entry.kind];
              return (
                <div key={entry.id} className="flex gap-2.5 px-3 py-2.5 text-[13px]">
                  <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="truncate text-foreground">{t(KIND_LABELS[entry.kind])}</p>
                    <p suppressHydrationWarning className="truncate text-xs text-muted-foreground">
                      {entry.entityCode} · {relativeTime(entry.timestamp, lang)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <Link
          to="/activity"
          className="block border-t border-border px-3 py-2 text-center text-xs font-medium text-primary hover:bg-accent/60"
        >
          {t("activity.pageTitle")}
        </Link>
      </PopoverContent>
    </Popover>
  );
}
