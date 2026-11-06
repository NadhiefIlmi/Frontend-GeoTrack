import { useLanguage } from "@/i18n/language";
import { ENTITY_STATUSES, ENTITY_TYPES, type EntityStatus, type EntityType } from "@/types/entity";
import { cn } from "@/lib/utils";
import { STATUS_LABELS, TYPE_LABELS } from "@/components/entities/labels";
import { TypeIcon } from "@/components/entities/TypeIcon";

export function MapLegend({ className }: { className?: string }) {
  const { t } = useLanguage();
  return (
    <div
      className={cn(
        "rounded-lg border border-border/80 bg-card/95 px-3 py-2.5 shadow-xl backdrop-blur-md space-y-2.5",
        className,
      )}
    >
      <div>
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {t("field.status")}
        </p>
        <ul className="space-y-1">
          {ENTITY_STATUSES.map((status: EntityStatus) => (
            <li key={status} className="flex items-center gap-2 text-[11px] text-foreground">
              <span className={`marker-dot marker-dot--${status} !m-0 !h-2.5 !w-2.5`} />
              <span>{t(STATUS_LABELS[status])}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="h-px bg-border/60" />

      <div>
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {t("field.type")}
        </p>
        <ul className="space-y-1">
          {ENTITY_TYPES.map((type: EntityType) => (
            <li key={type} className="flex items-center gap-2 text-[11px] text-foreground">
              <span className="flex size-4 items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
                <TypeIcon type={type} className="size-2.5" />
              </span>
              <span>{t(TYPE_LABELS[type])}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
