import { useState } from "react";
import {
  X,
  Pencil,
  Trash2,
  MapPin,
  Navigation,
  Copy,
  Check,
  ExternalLink,
  Calendar,
  Clock,
  AlignLeft,
  Activity,
  Plus,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { TypeBadge, TYPE_CONFIG } from "./TypeIcon";
import { useLanguage } from "@/i18n/language";
import { formatDateTime, formatCoord, relativeTime } from "@/lib/format";
import { MapPicker } from "@/components/map/MapPicker";
import { useEntityStore } from "@/state/EntityStore";
import { cn } from "@/lib/utils";
import type { Entity, ActivityKind, EntityStatus } from "@/types/entity";

interface EntityDetailPanelProps {
  entity: Entity | null;
  onClose: () => void;
  onEdit: (entity: Entity) => void;
  onDelete: (entity: Entity) => void;
}

const ACTIVITY_KIND_CONFIG: Record<
  ActivityKind,
  { icon: typeof Plus; color: string; bg: string; border: string; labelKey: string }
> = {
  created: {
    icon: Plus,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200/80",
    labelKey: "activity.kind.created",
  },
  updated: {
    icon: Pencil,
    color: "text-[#D56673]",
    bg: "bg-[#D56673]/10",
    border: "border-[#D56673]/25",
    labelKey: "activity.kind.updated",
  },
  status_changed: {
    icon: AlertCircle,
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200/80",
    labelKey: "activity.kind.status_changed",
  },
  deleted: {
    icon: Trash2,
    color: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200/80",
    labelKey: "activity.kind.deleted",
  },
};

function MiniActivityBadge({ text }: { text: string }) {
  // Check for status change pattern
  const statusRegex = text.match(/status (?:changed )?from (\w+) to (\w+)/i);
  if (statusRegex) {
    const from = statusRegex[1]?.toLowerCase() as EntityStatus;
    const to = statusRegex[2]?.toLowerCase() as EntityStatus;
    return (
      <div className="flex items-center gap-1 mt-0.5">
        <StatusBadge status={from} className="!text-[9.5px] !py-0.5 !px-1.5 !leading-none" />
        <ArrowRight className="size-2.5 text-slate-400" />
        <StatusBadge status={to} className="!text-[9.5px] !py-0.5 !px-1.5 !leading-none" />
      </div>
    );
  }

  // Check for type change pattern
  const typeRegex =
    text.match(/type (?:changed )?from (\w+) to (\w+)/i) ||
    text.match(/type:?\s*(\w+)\s*->\s*(\w+)/i);
  if (typeRegex) {
    const from = typeRegex[1]?.toLowerCase() as EntityType;
    const to = typeRegex[2]?.toLowerCase() as EntityType;
    return (
      <div className="flex items-center gap-1 mt-0.5 flex-wrap">
        <TypeBadge type={from} className="!text-[9px] !py-0.5 !px-1.5 !leading-none shadow-2xs" />
        <ArrowRight className="size-2.5 text-slate-400 shrink-0" />
        <TypeBadge type={to} className="!text-[9px] !py-0.5 !px-1.5 !leading-none shadow-2xs" />
      </div>
    );
  }

  return (
    <p className="mt-0.5 font-mono text-[10px] text-slate-500 truncate" title={text}>
      {text}
    </p>
  );
}

export function EntityDetailPanel({ entity, onClose, onEdit, onDelete }: EntityDetailPanelProps) {
  const { t, lang } = useLanguage();
  const { activities } = useEntityStore();
  const [copied, setCopied] = useState(false);

  if (!entity) return null;

  const cfg = TYPE_CONFIG[entity.type] ?? TYPE_CONFIG.iot_device;
  const TypeHeroIcon = cfg.icon;

  const relatedActivities = activities.filter((a) => a.entityCode === entity.code);

  const handleCopyCoord = () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(`${entity.latitude}, ${entity.longitude}`).catch(() => {});
      }
    } catch {
      // fallback
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside
      aria-label={t("detail.title")}
      className="flex h-full w-[380px] max-w-[92vw] shrink-0 flex-col border-l border-slate-200/80 bg-slate-50/50 shadow-2xl backdrop-blur-sm"
    >
      {/* 1. Header Bar */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md">
            {entity.code}
          </span>
          <span className="text-xs font-semibold text-slate-400">•</span>
          <h2 className="font-display text-xs font-bold uppercase tracking-wider text-slate-500">
            {t("detail.title")}
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label={t("detail.close")}
          className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* 2. Scrollable Body */}
      <div className="scroll-thin flex-1 overflow-y-auto p-4 space-y-4">
        {/* Hero Card */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-xl border shadow-xs mt-0.5",
                cfg.bg,
                cfg.color,
                cfg.border,
              )}
            >
              <TypeHeroIcon className="size-5" />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-display text-[15px] font-bold text-slate-900 leading-snug">
                {entity.name}
              </h3>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <StatusBadge
                  status={entity.status}
                  className="!text-[10px] !py-0.5 !px-2 !leading-none shadow-2xs"
                />
                <TypeBadge type={entity.type} className="text-[10.5px] px-2 py-0.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Location & Map Preview Section */}
        <div className="rounded-xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 px-3.5 py-2.5 bg-slate-50/60">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <MapPin className="size-3.5 text-[#D56673]" />
              <span>{t("detail.location")}</span>
            </div>
            <a
              href={`https://www.google.com/maps?q=${entity.latitude},${entity.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#D56673] hover:text-[#b04a56] hover:underline transition-colors"
            >
              <span>{t("detail.openMaps")}</span>
              <ExternalLink className="size-3" />
            </a>
          </div>

          {/* Map Preview */}
          <div className="h-36 w-full border-b border-slate-100">
            <MapPicker lat={entity.latitude} lng={entity.longitude} readOnly />
          </div>

          {/* Coordinates Bar */}
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-white">
            <div className="flex items-center gap-3 font-mono text-xs text-slate-700">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 mr-1.5">Lat:</span>
                <span className="font-semibold">{formatCoord(entity.latitude)}</span>
              </div>
              <span className="text-slate-300">|</span>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 mr-1.5">Lng:</span>
                <span className="font-semibold">{formatCoord(entity.longitude)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyCoord}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 hover:text-[#D56673] transition-colors border border-slate-200/70"
            >
              {copied ? (
                <Check className="size-3 text-emerald-600" />
              ) : (
                <Copy className="size-3 text-slate-400" />
              )}
              <span>{copied ? t("detail.copied") : t("detail.copyCoord")}</span>
            </button>
          </div>
        </div>

        {/* Description Section */}
        {entity.description && (
          <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1.5">
              <AlignLeft className="size-3.5 text-slate-400" />
              <span>{t("field.description")}</span>
            </div>
            <p className="text-[12.5px] leading-relaxed text-slate-600 border-l-2 border-[#D56673]/60 pl-2.5 py-0.5">
              {entity.description}
            </p>
          </div>
        )}

        {/* System & Timeline Info */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2.5">
            <Calendar className="size-3.5 text-slate-400" />
            <span>{t("detail.systemInfo")}</span>
          </div>

          <div className="space-y-2 text-xs divide-y divide-slate-100">
            <div className="flex items-center justify-between pt-1 first:pt-0">
              <span className="text-slate-400 font-medium">{t("field.createdAt")}</span>
              <span suppressHydrationWarning className="font-medium text-slate-700">
                {formatDateTime(entity.createdAt, lang)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-slate-400 font-medium">{t("field.updatedAt")}</span>
              <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                <span suppressHydrationWarning>{formatDateTime(entity.updatedAt, lang)}</span>
                <span suppressHydrationWarning className="text-[10.5px] text-slate-400 font-normal">
                  ({relativeTime(entity.updatedAt, lang)})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Recent Activity */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Activity className="size-3.5 text-[#D56673]" />
              <span>{t("detail.activityHistory")}</span>
            </div>
            <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-2 py-0.5 text-[10.5px] font-bold text-slate-600">
              {relatedActivities.length}
            </span>
          </div>

          {relatedActivities.length === 0 ? (
            <p className="py-2.5 text-center text-xs text-slate-400 italic">
              {t("detail.noActivity")}
            </p>
          ) : (
            <div className="space-y-2">
              {relatedActivities.slice(0, 3).map((act) => {
                const aCfg = ACTIVITY_KIND_CONFIG[act.kind] ?? ACTIVITY_KIND_CONFIG.updated;
                const AIcon = aCfg.icon;
                return (
                  <div
                    key={act.id}
                    className="flex items-start gap-2.5 rounded-lg border border-slate-100 bg-slate-50/50 p-2.5 hover:bg-slate-50 transition-colors"
                  >
                    <div
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-md border mt-0.5",
                        aCfg.bg,
                        aCfg.color,
                        aCfg.border,
                      )}
                    >
                      <AIcon className="size-3" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-bold text-slate-800">
                          {t(aCfg.labelKey as Parameters<typeof t>[0])}
                        </span>
                        <span suppressHydrationWarning className="text-[10px] text-slate-400 whitespace-nowrap">
                          {relativeTime(act.timestamp, lang)}
                        </span>
                      </div>
                      {act.detail && <MiniActivityBadge text={act.detail} />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. Footer Action Buttons */}
      <div className="flex gap-2.5 border-t border-slate-200/80 bg-white p-3.5 shadow-lg">
        <Button
          type="button"
          size="sm"
          className="flex-1 gap-1.5 rounded-xl bg-[#D56673] py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#c25562] transition-all cursor-pointer"
          onClick={() => onEdit(entity)}
        >
          <Pencil className="size-3.5" />
          {t("action.edit")}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5 rounded-xl border-rose-200 bg-rose-50/50 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-all cursor-pointer"
          onClick={() => onDelete(entity)}
        >
          <Trash2 className="size-3.5" />
          {t("action.delete")}
        </Button>
      </div>
    </aside>
  );
}
