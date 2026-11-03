import type { EntityStatus } from "@/types/entity";
import { useLanguage } from "@/i18n/language";
import { STATUS_LABELS } from "./labels";

export function StatusBadge({ status, className }: { status: EntityStatus; className?: string }) {
  const { t } = useLanguage();
  return <span className={`status-badge status-badge--${status} ${className ?? ""}`}>{t(STATUS_LABELS[status])}</span>;
}
