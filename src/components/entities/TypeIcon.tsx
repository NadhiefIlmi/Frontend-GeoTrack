import { Building2, Cpu, Network, Truck } from "lucide-react";
import type { EntityType } from "@/types/entity";
import { useLanguage } from "@/i18n/language";
import { TYPE_LABELS } from "./labels";
import { cn } from "@/lib/utils";

export const TYPE_CONFIG: Record<
  EntityType,
  {
    icon: typeof Truck;
    color: string;
    bg: string;
    border: string;
    hex: string;
  }
> = {
  vehicle: {
    icon: Truck,
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    hex: "#2563eb",
  },
  iot_device: {
    icon: Cpu,
    color: "text-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-200",
    hex: "#9333ea",
  },
  facility: {
    icon: Building2,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    hex: "#059669",
  },
  infrastructure: {
    icon: Network,
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    hex: "#d97706",
  },
};

export function TypeIcon({
  type,
  className,
  size = 14,
}: {
  type: EntityType;
  className?: string;
  size?: number;
}) {
  const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.iot_device;
  const Icon = cfg.icon;
  return <Icon className={className} size={size} />;
}

export function TypeBadge({
  type,
  className,
  showLabel = true,
}: {
  type: EntityType;
  className?: string;
  showLabel?: boolean;
}) {
  const { t } = useLanguage();
  const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.iot_device;
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium leading-none max-w-full",
        cfg.bg,
        cfg.color,
        cfg.border,
        className,
      )}
    >
      <Icon className="size-3 shrink-0" />
      {showLabel && <span className="truncate">{t(TYPE_LABELS[type])}</span>}
    </span>
  );
}
