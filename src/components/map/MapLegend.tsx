import { useLanguage } from "@/i18n/language";
import { ENTITY_STATUSES, type EntityStatus } from "@/types/entity";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<EntityStatus, "status.active" | "status.inactive" | "status.maintenance"> = {
  active: "status.active",
  inactive: "status.inactive",
  maintenance: "status.maintenance",
};

export function MapLegend({ className }: { className?: string }) {
  const { t } = useLanguage();
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card/90 px-3 py-2.5 shadow-lg backdrop-blur-sm",
        className,
      )}
    >
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {t("legend.title")}
      </p>
      <ul className="space-y-1">
        {ENTITY_STATUSES.map((status) => (
          <li key={status} className="flex items-center gap-2 text-[11px] text-foreground">
            <span className={`marker-dot marker-dot--${status} !m-0 !h-2.5 !w-2.5`} />
            {t(STATUS_LABELS[status])}
          </li>
        ))}
      </ul>
    </div>
  );
}
