import type { EntityStatus } from "@/types/entity";
import { useLanguage } from "@/i18n/language";

export const STATUS_LABELS: Record<EntityStatus, "status.active" | "status.inactive" | "status.maintenance"> = {
  active: "status.active",
  inactive: "status.inactive",
  maintenance: "status.maintenance",
};

export function StatusBadge({ status, className }: { status: EntityStatus; className?: string }) {
  const { t } = useLanguage();
  return <span className={`status-badge status-badge--${status} ${className ?? ""}`}>{t(STATUS_LABELS[status])}</span>;
}
