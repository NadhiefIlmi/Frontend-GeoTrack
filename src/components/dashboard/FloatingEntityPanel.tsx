import { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Eye,
  X,
  Layers,
  LayoutGrid,
  Clock,
  ArrowRight,
  Plus,
  Pencil,
  AlertCircle,
  Trash2,
  Wifi,
  WifiOff,
  Wrench,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { StatusBadge } from "@/components/entities/StatusBadge";
import { TypeBadge, TypeIcon, TYPE_CONFIG } from "@/components/entities/TypeIcon";
import { TYPE_LABELS } from "@/components/entities/labels";
import { useLanguage } from "@/i18n/language";
import { relativeTime } from "@/lib/format";
import { useEntityStore } from "@/state/EntityStore";
import { cn } from "@/lib/utils";
import type { Entity, EntityType, ActivityEntry, ActivityKind, EntityStatus } from "@/types/entity";
import { ENTITY_TYPES } from "@/types/entity";
import { Button } from "@/components/ui/button";

interface FloatingEntityPanelProps {
  onSelectEntity?: ((id: string) => void) | undefined;
  selectedId?: string | null | undefined;
  detailOpen?: boolean | undefined;
  hidden?: boolean | undefined;
}

const ACTIVITY_KIND_CONFIG: Record<
  ActivityKind,
  { icon: typeof Plus; color: string; bg: string; border: string }
> = {
  created: {
    icon: Plus,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200/80",
  },
  updated: {
    icon: Pencil,
    color: "text-[#D56673]",
    bg: "bg-[#D56673]/10",
    border: "border-[#D56673]/25",
  },
  status_changed: {
    icon: AlertCircle,
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200/80",
  },
  deleted: {
    icon: Trash2,
    color: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200/80",
  },
};

function ActivityTransitionMini({ detail }: { detail?: string }) {
  if (!detail) return null;

  // Check type change
  const typeMatch =
    detail.match(/type (?:changed )?from (\w+) to (\w+)/i) ||
    detail.match(/type:?\s*(\w+)\s*->\s*(\w+)/i);
  if (typeMatch) {
    const from = typeMatch[1]?.toLowerCase() as EntityType;
    const to = typeMatch[2]?.toLowerCase() as EntityType;
    return (
      <div className="flex items-center gap-1 text-[10px]">
        <TypeBadge type={from} className="!text-[9px] !py-0 !px-1.5 !h-4 !leading-none shadow-2xs" />
        <ArrowRight className="size-2.5 text-slate-400 shrink-0" />
        <TypeBadge type={to} className="!text-[9px] !py-0 !px-1.5 !h-4 !leading-none shadow-2xs" />
      </div>
    );
  }

  // Check status change
  const statusMatch = detail.match(/status (?:changed )?from (\w+) to (\w+)/i);
  if (statusMatch) {
    const from = statusMatch[1]?.toLowerCase() as EntityStatus;
    const to = statusMatch[2]?.toLowerCase() as EntityStatus;
    return (
      <div className="flex items-center gap-1 text-[10px]">
        <StatusBadge status={from} className="!text-[9px] !py-0 !px-1.5 !h-4 !leading-none" />
        <ArrowRight className="size-2.5 text-slate-400 shrink-0" />
        <StatusBadge status={to} className="!text-[9px] !py-0 !px-1.5 !h-4 !leading-none" />
      </div>
    );
  }

  const parts = detail.split("->").map((s) => s.trim().toLowerCase());
  if (parts.length === 2) {
    const from = parts[0] as EntityStatus;
    const to = parts[1] as EntityStatus;
    return (
      <div className="flex items-center gap-1 text-[10px]">
        <StatusBadge status={from} className="!text-[9px] !py-0 !px-1.5 !h-4 !leading-none" />
        <ArrowRight className="size-2.5 text-slate-400 shrink-0" />
        <StatusBadge status={to} className="!text-[9px] !py-0 !px-1.5 !h-4 !leading-none" />
      </div>
    );
  }
  return <span className="font-mono text-[10px] text-slate-500">{detail}</span>;
}

export function FloatingEntityPanel({
  onSelectEntity,
  selectedId,
  detailOpen,
  hidden,
}: FloatingEntityPanelProps) {
  const { t, lang } = useLanguage();
  const { entities, activities, isLoading } = useEntityStore();
  const [collapsed, setCollapsed] = useState(false);
  const [tab, setTab] = useState<"overview" | "activity">("overview");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<EntityType | "all">("all");
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  const [statusFilter, setStatusFilter] = useState<EntityStatus | "all">("all");

  const stats = useMemo(
    () => ({
      active: entities.filter((e) => e.status === "active").length,
      inactive: entities.filter((e) => e.status === "inactive").length,
      maintenance: entities.filter((e) => e.status === "maintenance").length,
    }),
    [entities],
  );

  const totalCount = entities.length || 1;
  const activePct = Math.round((stats.active / totalCount) * 100);
  const inactivePct = Math.round((stats.inactive / totalCount) * 100);
  const maintenancePct = Math.max(0, 100 - activePct - inactivePct);

  const filtered = useMemo(() => {
    let list = entities;
    if (statusFilter !== "all") {
      list = list.filter((e) => e.status === statusFilter);
    }
    if (typeFilter !== "all") {
      list = list.filter((e) => e.type === typeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) => e.name.toLowerCase().includes(q) || e.code.toLowerCase().includes(q),
      );
    }
    return list.slice(0, 6);
  }, [entities, search, typeFilter, statusFilter]);

  return (
    <div
      className={cn(
        "pointer-events-none absolute bottom-4 z-[1000] w-[96vw] max-w-[490px] sm:max-w-[500px] transition-all duration-300 ease-in-out",
        detailOpen ? "right-4 md:right-[376px]" : "right-4",
        hidden && "opacity-0 pointer-events-none translate-y-6 scale-95",
      )}
    >
      <div className="pointer-events-auto flex max-h-[calc(100vh-5rem)] sm:max-h-[540px] flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-xl backdrop-blur-md">
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-lg bg-[#D56673]/10 text-[#D56673]">
              <Layers className="size-4" />
            </div>
            <span className="font-display text-[14px] font-bold text-slate-900 tracking-tight">
              {t("panel.title")}
            </span>
            {isLoading ? (
              <span className="h-5 w-7 rounded-full bg-slate-200 animate-pulse" />
            ) : (
              <span className="flex h-5 items-center justify-center rounded-full bg-[#D56673]/10 px-2 text-[11px] font-bold text-[#D56673]">
                {entities.length}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            aria-label="Toggle panel"
            className="flex size-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
          >
            {collapsed ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
        </div>

        {!collapsed && (
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {/* Status Statistics Cards (Telemetry Cards with Icons & Progress Trackers) */}
            {isLoading ? (
              <div className="shrink-0 grid grid-cols-3 gap-2 border-b border-slate-100 bg-slate-50/50 p-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-xl border border-slate-200/60 bg-white p-2.5 animate-pulse space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="size-7 rounded-lg bg-slate-200" />
                      <div className="h-3.5 w-7 rounded bg-slate-100" />
                    </div>
                    <div className="space-y-1">
                      <div className="h-5 w-10 rounded bg-slate-200" />
                      <div className="h-2.5 w-12 rounded bg-slate-100" />
                    </div>
                    <div className="h-1 w-full rounded bg-slate-100" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="shrink-0 grid grid-cols-3 gap-2 border-b border-slate-100 bg-slate-50/50 p-3">
                {/* Active */}
                <button
                  type="button"
                  onClick={() => setStatusFilter((prev) => (prev === "active" ? "all" : "active"))}
                  className={cn(
                    "group flex flex-col justify-between rounded-xl border bg-white p-2.5 text-left transition-all cursor-pointer shadow-2xs hover:shadow-xs",
                    statusFilter === "active"
                      ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/30"
                      : "border-slate-200/80 hover:border-emerald-300",
                  )}
                >
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex size-7 items-center justify-center rounded-lg border border-emerald-200/80 bg-emerald-50 text-emerald-600 shadow-2xs transition-transform group-hover:scale-105">
                      <Wifi className="size-3.5" />
                    </div>
                    <span className="rounded-md border border-emerald-200/70 bg-emerald-50/80 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                      {activePct}%
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="font-display text-xl font-bold leading-none text-slate-900">
                      {stats.active}
                    </span>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {t("status.active")}
                    </p>
                  </div>
                  <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${activePct}%` }}
                    />
                  </div>
                </button>

                {/* Inactive */}
                <button
                  type="button"
                  onClick={() =>
                    setStatusFilter((prev) => (prev === "inactive" ? "all" : "inactive"))
                  }
                  className={cn(
                    "group flex flex-col justify-between rounded-xl border bg-white p-2.5 text-left transition-all cursor-pointer shadow-2xs hover:shadow-xs",
                    statusFilter === "inactive"
                      ? "border-slate-500 ring-2 ring-slate-400/20 bg-slate-50"
                      : "border-slate-200/80 hover:border-slate-400",
                  )}
                >
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex size-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-600 shadow-2xs transition-transform group-hover:scale-105">
                      <WifiOff className="size-3.5" />
                    </div>
                    <span className="rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                      {inactivePct}%
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="font-display text-xl font-bold leading-none text-slate-900">
                      {stats.inactive}
                    </span>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {t("status.inactive")}
                    </p>
                  </div>
                  <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-slate-400 transition-all duration-500"
                      style={{ width: `${inactivePct}%` }}
                    />
                  </div>
                </button>

                {/* Maintenance */}
                <button
                  type="button"
                  onClick={() =>
                    setStatusFilter((prev) => (prev === "maintenance" ? "all" : "maintenance"))
                  }
                  className={cn(
                    "group flex flex-col justify-between rounded-xl border bg-white p-2.5 text-left transition-all cursor-pointer shadow-2xs hover:shadow-xs",
                    statusFilter === "maintenance"
                      ? "border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/30"
                      : "border-slate-200/80 hover:border-amber-300",
                  )}
                >
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex size-7 items-center justify-center rounded-lg border border-amber-200/80 bg-amber-50 text-amber-600 shadow-2xs transition-transform group-hover:scale-105">
                      <Wrench className="size-3.5" />
                    </div>
                    <span className="rounded-md border border-amber-200/70 bg-amber-50/80 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                      {maintenancePct}%
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="font-display text-xl font-bold leading-none text-slate-900">
                      {stats.maintenance}
                    </span>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {t("status.maintenance")}
                    </p>
                  </div>
                  <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-amber-500 transition-all duration-500"
                      style={{ width: `${maintenancePct}%` }}
                    />
                  </div>
                </button>
              </div>
            )}

            {/* Segmented Switcher Tabs */}
            <div className="shrink-0 border-b border-slate-100 bg-white px-3 pt-2.5 pb-2">
              <div className="flex rounded-xl bg-slate-100/90 p-1 text-[12px]">
                <button
                  type="button"
                  onClick={() => setTab("overview")}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 font-bold transition-all cursor-pointer",
                    tab === "overview"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-800",
                  )}
                >
                  <LayoutGrid className="size-3.5" />
                  <span>{t("panel.tabOverview")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTab("activity")}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 font-bold transition-all cursor-pointer",
                    tab === "activity"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-800",
                  )}
                >
                  <Clock className="size-3.5" />
                  <span>{t("panel.tabActivity")}</span>
                  {isLoading ? (
                    <span className="size-4 rounded-full bg-slate-200 animate-pulse" />
                  ) : activities.length > 0 ? (
                    <span className="flex size-4.5 items-center justify-center rounded-full bg-[#D56673]/15 text-[10px] font-bold text-[#D56673]">
                      {activities.length > 9 ? "9+" : activities.length}
                    </span>
                  ) : null}
                </button>
              </div>
            </div>

            {/* Tab content */}
            {tab === "overview" ? (
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                {/* Search & Filter Toolbar */}
                <div className="shrink-0 flex items-center gap-2 border-b border-slate-100 px-3 py-2 bg-white">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={t("search.placeholder")}
                      className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50/70 pl-8 pr-2 text-[12px] text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#D56673] focus:ring-2 focus:ring-[#D56673]/15 transition-all"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFilterMenuOpen((v) => !v)}
                    className={cn(
                      "h-8 gap-1.5 border-slate-200 text-[12px] rounded-lg transition-colors cursor-pointer",
                      typeFilter !== "all" || filterMenuOpen
                        ? "border-[#D56673]/40 bg-[#D56673]/10 text-[#D56673] font-semibold"
                        : "bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                    )}
                  >
                    <Filter className="size-3" />
                    <span>{t("filter.button")}</span>
                    {typeFilter !== "all" && (
                      <span className="size-1.5 rounded-full bg-[#D56673]" />
                    )}
                  </Button>
                </div>

                {/* Status Filter Active Indicator */}
                {statusFilter !== "all" && (
                  <div className="shrink-0 flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-3 py-1.5 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">{t("field.status")}:</span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-white border border-slate-200 px-2 py-0.5 font-bold text-slate-800 shadow-2xs">
                        {t(`status.${statusFilter}` as Parameters<typeof t>[0])}
                        <button
                          type="button"
                          onClick={() => setStatusFilter("all")}
                          className="text-slate-400 hover:text-slate-700 cursor-pointer ml-0.5"
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStatusFilter("all")}
                      className="text-[10px] font-semibold text-[#D56673] hover:underline cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                )}

                {/* Filter Options Popup */}
                {filterMenuOpen && (
                  <div className="shrink-0 flex flex-wrap items-center gap-1.5 border-b border-slate-100 bg-slate-50/80 p-2.5 text-[11px]">
                    <span className="text-slate-500 font-medium mr-1">{t("col.type")}:</span>
                    <button
                      type="button"
                      onClick={() => setTypeFilter("all")}
                      className={cn(
                        "rounded-md px-2 py-0.5 font-medium transition-colors cursor-pointer",
                        typeFilter === "all"
                          ? "bg-[#D56673] text-white shadow-xs"
                          : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900",
                      )}
                    >
                      {t("filter.allTypes")}
                    </button>
                    {ENTITY_TYPES.map((tp) => (
                      <button
                        key={tp}
                        type="button"
                        onClick={() => setTypeFilter(tp)}
                        className={cn(
                          "rounded-md px-2 py-0.5 font-medium transition-colors cursor-pointer",
                          typeFilter === tp
                            ? "bg-[#D56673] text-white shadow-xs"
                            : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900",
                        )}
                      >
                        {t(TYPE_LABELS[tp])}
                      </button>
                    ))}
                    {typeFilter !== "all" && (
                      <button
                        type="button"
                        onClick={() => setTypeFilter("all")}
                        className="ml-auto text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                      >
                        <X className="size-3.5" />
                      </button>
                    )}
                  </div>
                )}

                {/* Entity Table */}
                <div className="flex-1 min-h-0 max-h-[200px] overflow-y-auto scroll-thin overflow-x-auto">
                  <table className="w-full table-fixed text-left text-[12px]">
                    <thead className="sticky top-0 z-10">
                      <tr className="border-b border-slate-100 bg-slate-50/90 text-[10px] font-bold uppercase tracking-wider text-slate-500 backdrop-blur-sm">
                        <th className="w-[50%] px-3 py-2 text-left">{t("col.name")}</th>
                        <th className="w-[14%] px-2 py-2 text-center">{t("col.type")}</th>
                        <th className="w-[24%] px-2 py-2 text-left">{t("col.status")}</th>
                        <th className="w-[12%] px-1 py-2 text-center">{t("col.action")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {isLoading ? (
                        Array.from({ length: 4 }).map((_, idx) => (
                          <tr key={idx} className="animate-pulse">
                            <td className="w-[50%] px-3 py-2.5">
                              <div className="h-3.5 w-28 rounded bg-slate-200" />
                              <div className="h-2.5 w-14 rounded bg-slate-100 mt-1" />
                            </td>
                            <td className="w-[14%] px-2 py-2.5 text-center">
                              <div className="size-6 rounded-lg bg-slate-200 mx-auto" />
                            </td>
                            <td className="w-[24%] px-2 py-2.5">
                              <div className="h-4.5 w-14 rounded-md bg-slate-200" />
                            </td>
                            <td className="w-[12%] px-1 py-2.5 text-center">
                              <div className="h-4 w-7 rounded bg-slate-100 mx-auto" />
                            </td>
                          </tr>
                        ))
                      ) : filtered.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-slate-400">
                            {t("panel.empty")}
                          </td>
                        </tr>
                      ) : (
                        filtered.map((entity: Entity) => {
                          const isSelected = selectedId === entity.id;
                          const typeCfg = TYPE_CONFIG[entity.type] ?? TYPE_CONFIG.iot_device;
                          return (
                            <tr
                              key={entity.id}
                              onClick={() => onSelectEntity?.(entity.id)}
                              className={cn(
                                "cursor-pointer transition-colors hover:bg-slate-50/80",
                                isSelected
                                  ? "bg-[#D56673]/8 text-slate-900 font-medium border-l-[3px] border-l-[#D56673]"
                                  : "",
                              )}
                            >
                              <td className="w-[50%] px-3 py-2.5 overflow-hidden">
                                <p className="truncate font-bold text-slate-900">{entity.name}</p>
                                <p className="truncate font-mono text-[10px] text-slate-400">
                                  {entity.code}
                                </p>
                              </td>
                              <td className="w-[14%] px-2 py-2.5 text-center overflow-hidden">
                                <div
                                  className={cn(
                                    "inline-flex size-6.5 items-center justify-center rounded-lg border shadow-2xs mx-auto transition-transform hover:scale-110",
                                    typeCfg.bg,
                                    typeCfg.color,
                                    typeCfg.border,
                                  )}
                                  title={t(TYPE_LABELS[entity.type])}
                                >
                                  <TypeIcon
                                    type={entity.type}
                                    className={cn("size-3.5", typeCfg.color)}
                                  />
                                </div>
                              </td>
                              <td className="w-[24%] px-2 py-2.5 overflow-hidden">
                                <div className="flex items-center">
                                  <StatusBadge
                                    status={entity.status}
                                    className="text-[10px] px-1.5 py-0.5"
                                  />
                                </div>
                              </td>
                              <td className="w-[12%] px-1 py-2.5 text-center overflow-hidden">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectEntity?.(entity.id);
                                  }}
                                  title={t("action.view")}
                                  className="inline-flex size-6.5 items-center justify-center rounded-lg text-slate-400 hover:bg-[#D56673]/10 hover:text-[#D56673] mx-auto transition-colors cursor-pointer"
                                >
                                  <Eye className="size-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* View All Button */}
                <div className="shrink-0 border-t border-slate-100 p-2.5 bg-slate-50/50">
                  <Link
                    to="/entities"
                    className="group flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200/90 bg-white py-2 text-[12px] font-bold text-slate-700 shadow-xs transition-all hover:border-[#D56673] hover:bg-[#D56673] hover:text-white cursor-pointer"
                  >
                    <span>
                      {t("panel.viewAll")}{" "}
                      {isLoading ? "" : `(${entities.length})`}
                    </span>
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            ) : (
              /* Recent Activity Tab */
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                <div className="flex-1 min-h-0 max-h-[240px] overflow-y-auto scroll-thin divide-y divide-slate-100/80 px-2 py-1">
                  {isLoading ? (
                    <div className="space-y-2 p-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center gap-2.5 rounded-xl p-2 animate-pulse bg-slate-50/50">
                          <div className="size-7 rounded-lg bg-slate-200 shrink-0" />
                          <div className="flex-1 space-y-1">
                            <div className="h-3.5 w-28 rounded bg-slate-200" />
                            <div className="h-2.5 w-16 rounded bg-slate-100" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : activities.slice(0, 8).length === 0 ? (
                    <p className="py-8 text-center text-[12px] text-slate-400">
                      {t("activity.empty")}
                    </p>
                  ) : (
                    activities.slice(0, 8).map((act: ActivityEntry) => {
                      const cfg = ACTIVITY_KIND_CONFIG[act.kind] ?? ACTIVITY_KIND_CONFIG.updated;
                      const Icon = cfg.icon;
                      const entity = entities.find((e) => e.code === act.entityCode);
                      const isSelected = selectedId === entity?.id;
                      return (
                        <div
                          key={act.id}
                          onClick={() => entity && onSelectEntity?.(entity.id)}
                          className={cn(
                            "group flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition-all cursor-pointer",
                            entity ? "hover:bg-slate-50/90 active:scale-[0.99]" : "cursor-default",
                            isSelected
                              ? "bg-[#D56673]/8 border border-[#D56673]/30"
                              : "border border-transparent",
                          )}
                        >
                          <div
                            className={cn(
                              "flex size-7 shrink-0 items-center justify-center rounded-lg border shadow-2xs transition-transform group-hover:scale-105",
                              cfg.bg,
                              cfg.color,
                              cfg.border,
                            )}
                          >
                            <Icon className="size-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1.5">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="shrink-0 font-mono text-[10.5px] font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200/70">
                                  {act.entityCode}
                                </span>
                                <span className="truncate text-[12px] font-bold text-slate-900">
                                  {act.entityName}
                                </span>
                              </div>
                              <span suppressHydrationWarning className="flex shrink-0 items-center gap-1 text-[10px] font-medium text-slate-400 whitespace-nowrap">
                                <Clock className="size-2.5" />
                                {relativeTime(act.timestamp, lang)}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5">
                                {act.detail && (/status (?:changed )?from|type (?:changed )?from|->/i.test(act.detail)) ? (
                                  <ActivityTransitionMini detail={act.detail} />
                                ) : (
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className={cn(
                                        "inline-flex items-center rounded-md px-1.5 py-0.5 text-[9.5px] font-bold border",
                                        cfg.bg,
                                        cfg.color,
                                        cfg.border,
                                      )}
                                    >
                                      {t(`activity.kind.${act.kind}` as Parameters<typeof t>[0])}
                                    </span>
                                    {act.detail && (
                                      <span className="font-mono text-[10px] text-slate-500 truncate max-w-[150px]">
                                        {act.detail}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              {entity && (
                                <span className="text-[10px] font-semibold text-slate-400 opacity-0 group-hover:opacity-100 group-hover:text-[#D56673] transition-all flex items-center gap-0.5 shrink-0">
                                  <span>{t("action.view")}</span>
                                  <ArrowRight className="size-2.5" />
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* View All Button */}
                <div className="shrink-0 border-t border-slate-100 p-2.5 bg-slate-50/50">
                  <Link
                    to="/activity"
                    className="group flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200/90 bg-white py-2 text-[12px] font-bold text-slate-700 shadow-xs transition-all hover:border-[#D56673] hover:bg-[#D56673] hover:text-white cursor-pointer"
                  >
                    <span>
                      {t("panel.viewAll")} ({activities.length})
                    </span>
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
