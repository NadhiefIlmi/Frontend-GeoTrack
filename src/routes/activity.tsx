import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useRef, useEffect } from "react";
import {
  History,
  Plus,
  RefreshCw,
  Pencil,
  AlertCircle,
  Trash2,
  Search,
  Clock,
  ArrowRight,
  Calendar,
  ExternalLink,
  X,
  TrendingUp,
  Filter,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { StatusBadge } from "@/components/entities/StatusBadge";
import { TypeBadge } from "@/components/entities/TypeIcon";
import { useEntityStore } from "@/state/EntityStore";
import { useLanguage } from "@/i18n/language";
import { relativeTime, formatDateTime } from "@/lib/format";
import type { ActivityKind, ActivityEntry, EntityStatus, EntityType } from "@/types/entity";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/activity")({
  component: ActivityLogsPage,
});

const KIND_THEMES: Record<
  ActivityKind,
  {
    icon: typeof Plus;
    badgeBg: string;
    badgeColor: string;
    badgeBorder: string;
    nodeBg: string;
    nodeColor: string;
    nodeBorder: string;
    labelKey: string;
  }
> = {
  created: {
    icon: Plus,
    badgeBg: "bg-emerald-50",
    badgeColor: "text-emerald-700",
    badgeBorder: "border-emerald-200/80",
    nodeBg: "bg-emerald-500",
    nodeColor: "text-white",
    nodeBorder: "border-white ring-4 ring-emerald-500/15",
    labelKey: "activity.kind.created",
  },
  updated: {
    icon: Pencil,
    badgeBg: "bg-[#D56673]/10",
    badgeColor: "text-[#D56673]",
    badgeBorder: "border-[#D56673]/25",
    nodeBg: "bg-[#D56673]",
    nodeColor: "text-white",
    nodeBorder: "border-white ring-4 ring-[#D56673]/15",
    labelKey: "activity.kind.updated",
  },
  status_changed: {
    icon: AlertCircle,
    badgeBg: "bg-amber-50",
    badgeColor: "text-amber-700",
    badgeBorder: "border-amber-200/80",
    nodeBg: "bg-amber-500",
    nodeColor: "text-white",
    nodeBorder: "border-white ring-4 ring-amber-500/15",
    labelKey: "activity.kind.status_changed",
  },
  deleted: {
    icon: Trash2,
    badgeBg: "bg-rose-50",
    badgeColor: "text-rose-700",
    badgeBorder: "border-rose-200/80",
    nodeBg: "bg-rose-500",
    nodeColor: "text-white",
    nodeBorder: "border-white ring-4 ring-rose-500/15",
    labelKey: "activity.kind.deleted",
  },
};

function SingleDetailBadge({ text }: { text: string }) {
  const arrowMatch = text.includes("->") ? text.split("->").map((s) => s.trim().toLowerCase()) : null;
  const statusRegexMatch = text.match(/status (?:changed )?from (\w+) to (\w+)/i);

  if (arrowMatch && arrowMatch.length === 2) {
    const from = arrowMatch[0] as EntityStatus;
    const to = arrowMatch[1] as EntityStatus;
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        <StatusBadge status={from} className="!text-[10px] !py-0.5 !px-2 !leading-none shadow-2xs" />
        <ArrowRight className="size-3 text-slate-400 shrink-0" />
        <StatusBadge status={to} className="!text-[10px] !py-0.5 !px-2 !leading-none shadow-2xs" />
      </div>
    );
  }

  if (statusRegexMatch) {
    const from = statusRegexMatch[1]?.toLowerCase() as EntityStatus;
    const to = statusRegexMatch[2]?.toLowerCase() as EntityStatus;
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        <StatusBadge status={from} className="!text-[10px] !py-0.5 !px-2 !leading-none shadow-2xs" />
        <ArrowRight className="size-3 text-slate-400 shrink-0" />
        <StatusBadge status={to} className="!text-[10px] !py-0.5 !px-2 !leading-none shadow-2xs" />
      </div>
    );
  }

  const typeRegexMatch =
    text.match(/type (?:changed )?from (\w+) to (\w+)/i) ||
    text.match(/type:?\s*(\w+)\s*->\s*(\w+)/i);
  if (typeRegexMatch) {
    const from = typeRegexMatch[1]?.toLowerCase() as EntityType;
    const to = typeRegexMatch[2]?.toLowerCase() as EntityType;
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        <TypeBadge type={from} className="!text-[10px] !py-0.5 !px-2 !leading-none shadow-2xs" />
        <ArrowRight className="size-3 text-slate-400 shrink-0" />
        <TypeBadge type={to} className="!text-[10px] !py-0.5 !px-2 !leading-none shadow-2xs" />
      </div>
    );
  }

  return (
    <span className="font-mono text-[11px] text-slate-600 bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded-md">
      {text}
    </span>
  );
}

function ActivityDetailBadge({ detail }: { detail?: string; kind: ActivityKind }) {
  if (!detail) return null;
  const parts = detail.split(";").map((s) => s.trim()).filter(Boolean);
  if (parts.length > 1) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {parts.map((p, idx) => (
          <SingleDetailBadge key={idx} text={p} />
        ))}
      </div>
    );
  }
  return <SingleDetailBadge text={detail} />;
}

function ActivityLogsPage() {
  const { t, lang } = useLanguage();
  const { activities, isLoading } = useEntityStore();
  const [filter, setFilter] = useState<ActivityKind | "all">("all");
  const [search, setSearch] = useState("");
  const rightColRef = useRef<HTMLDivElement>(null);
  const [rightHeight, setRightHeight] = useState<number | null>(null);

  useEffect(() => {
    const el = rightColRef.current;
    if (!el) return;

    const updateHeight = () => {
      if (window.innerWidth >= 1024) {
        const h = Math.round(el.getBoundingClientRect().height);
        if (h > 0) setRightHeight(h);
      } else {
        setRightHeight(null);
      }
    };

    updateHeight();
    const ro = new ResizeObserver(updateHeight);
    ro.observe(el);
    window.addEventListener("resize", updateHeight);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  const stats = useMemo(() => {
    return {
      total: activities.length,
      created: activities.filter((a) => a.kind === "created").length,
      updated: activities.filter((a) => a.kind === "updated").length,
      status_changed: activities.filter((a) => a.kind === "status_changed").length,
      deleted: activities.filter((a) => a.kind === "deleted").length,
    };
  }, [activities]);

  const topEntities = useMemo(() => {
    const map = new Map<string, { code: string; name: string; count: number }>();
    for (const act of activities) {
      const prev = map.get(act.entityCode);
      if (prev) {
        prev.count += 1;
      } else {
        map.set(act.entityCode, { code: act.entityCode, name: act.entityName, count: 1 });
      }
    }
    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [activities]);

  const filtered = useMemo(() => {
    let list = activities;
    if (filter !== "all") {
      list = list.filter((a) => a.kind === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.entityName.toLowerCase().includes(q) ||
          a.entityCode.toLowerCase().includes(q) ||
          (a.detail && a.detail.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [activities, filter, search]);

  const grouped = useMemo(() => {
    const today = new Date();
    const groups: { today: ActivityEntry[]; yesterday: ActivityEntry[]; older: ActivityEntry[] } = {
      today: [],
      yesterday: [],
      older: [],
    };

    const isToday = (date: Date) =>
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    const isYesterday = (date: Date) => {
      const yest = new Date(today);
      yest.setDate(yest.getDate() - 1);
      return (
        date.getDate() === yest.getDate() &&
        date.getMonth() === yest.getMonth() &&
        date.getFullYear() === yest.getFullYear()
      );
    };

    for (const act of filtered) {
      const d = new Date(act.timestamp);
      if (isNaN(d.getTime()) || isToday(d)) {
        groups.today.push(act);
      } else if (isYesterday(d)) {
        groups.yesterday.push(act);
      } else {
        groups.older.push(act);
      }
    }

    return groups;
  }, [filtered]);

  const filterTabs = [
    {
      key: "all" as const,
      label: t("activity.filterAll"),
      count: activities.length,
      color: "bg-[#D56673]",
    },
    {
      key: "status_changed" as const,
      label: t("activity.kind.status_changed"),
      count: stats.status_changed,
      color: "bg-amber-500",
    },
    {
      key: "updated" as const,
      label: t("activity.kind.updated"),
      count: stats.updated,
      color: "bg-[#D56673]",
    },
    {
      key: "created" as const,
      label: t("activity.kind.created"),
      count: stats.created,
      color: "bg-emerald-500",
    },
    {
      key: "deleted" as const,
      label: t("activity.kind.deleted"),
      count: stats.deleted,
      color: "bg-rose-500",
    },
  ];

  return (
    <div className="scroll-thin h-full overflow-y-auto bg-background p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Authoritative Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="flex size-11 items-center justify-center rounded-2xl border border-[#D56673]/30 bg-[#D56673]/10 text-[#D56673] shadow-xs">
              <History className="size-5.5" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
                {t("activity.pageTitle")}
              </h1>
              <p className="mt-0.5 text-[13px] font-medium text-slate-500">
                {t("activity.pageDesc")}
              </p>
            </div>
          </div>
        </div>

        {/* Integrated Command & Telemetry Filter Ribbon */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xs space-y-3">
          {/* Top Row: Interactive Telemetry Pills */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {filterTabs.map((tTab) => {
                const active = filter === tTab.key;
                return (
                  <button
                    key={tTab.key}
                    type="button"
                    onClick={() => setFilter(tTab.key)}
                    className={cn(
                      "group flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer border",
                      active
                        ? "border-[#D56673] bg-[#D56673] text-white shadow-xs"
                        : "border-slate-200/80 bg-slate-50/70 text-slate-700 hover:border-[#D56673]/40 hover:bg-[#D56673]/5 hover:text-[#D56673]",
                    )}
                  >
                    <span>{tTab.label}</span>
                    {isLoading ? (
                      <span className="h-4.5 w-5 rounded-full bg-slate-200 animate-pulse" />
                    ) : (
                      <span
                        className={cn(
                          "flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1.5 text-[10.5px] font-bold transition-colors",
                          active
                            ? "bg-white/20 text-white"
                            : "bg-white text-slate-600 border border-slate-200/80 group-hover:border-[#D56673]/30 group-hover:text-[#D56673]",
                        )}
                      >
                        {tTab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Filter Reset */}
            {(search || filter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setFilter("all");
                  setSearch("");
                }}
                className="flex items-center gap-1 text-xs font-bold text-[#D56673] hover:underline cursor-pointer px-2 py-1"
              >
                <X className="size-3" />
                <span>{t("activity.resetFilter")}</span>
              </button>
            )}
          </div>

          {/* Bottom Row: Search Box & Result Counter */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-2.5">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("activity.searchPlaceholder")}
                className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-8 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#D56673] focus:ring-2 focus:ring-[#D56673]/15 transition-all"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            <p className="text-[12px] font-medium text-slate-500">
              {isLoading ? (
                <span className="h-4 w-36 rounded bg-slate-200 animate-pulse inline-block" />
              ) : lang === "id" ? (
                <>
                  Menampilkan{" "}
                  <strong className="text-slate-900 font-bold">{filtered.length}</strong> dari{" "}
                  <span className="font-bold">{activities.length}</span> total aktivitas
                </>
              ) : (
                <>
                  Showing <strong className="text-slate-900 font-bold">{filtered.length}</strong> of{" "}
                  <span className="font-bold">{activities.length}</span> total activities
                </>
              )}
            </p>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
          {/* Main Feed Column (8 Cols): Continuous Audit Trail */}
          <div className="space-y-6 lg:col-span-8">
            {isLoading ? (
              <div
                style={rightHeight ? { height: `${rightHeight}px` } : undefined}
                className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden flex flex-col p-4 divide-y divide-slate-100"
              >
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-start gap-4 py-4 animate-pulse">
                    <div className="size-8.5 rounded-xl bg-slate-200 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="h-4 w-44 rounded bg-slate-200" />
                        <div className="h-3 w-16 rounded bg-slate-100" />
                      </div>
                      <div className="h-4 w-32 rounded bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div
                style={rightHeight ? { height: `${rightHeight}px` } : undefined}
                className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center"
              >
                <RefreshCw className="mb-3 size-8 text-slate-400" />
                <h3 className="font-display text-base font-bold text-slate-800">
                  {t("activity.empty")}
                </h3>
                <p className="mt-1 text-xs text-slate-500 max-w-sm">{t("activity.noMatch")}</p>
                {(search || filter !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setFilter("all");
                      setSearch("");
                    }}
                    className="mt-4 rounded-xl border border-[#D56673] bg-[#D56673] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#c45360] transition-colors cursor-pointer"
                  >
                    {t("activity.showAll")}
                  </button>
                )}
              </div>
            ) : (
              <div
                style={rightHeight ? { height: `${rightHeight}px` } : undefined}
                className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden flex flex-col"
              >
                {/* Timeline Stream Container */}
                <div className="flex-1 min-h-0 overflow-y-auto scroll-thin divide-y divide-slate-100">
                  {/* Today Section */}
                  {grouped.today.length > 0 && (
                    <div>
                      {/* Section Header */}
                      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-slate-50/95 backdrop-blur-xs px-5 py-2.5">
                        <div className="flex items-center gap-2">
                          <Calendar className="size-3.5 text-[#D56673]" />
                          <span className="text-xs font-bold text-slate-800">
                            {t("activity.group.today")}
                          </span>
                        </div>
                        <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10.5px] font-bold text-slate-600 shadow-2xs">
                          {t("activity.activitiesCount", { count: grouped.today.length })}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="divide-y divide-slate-100/80">
                        {grouped.today.map((act) => (
                          <ActivityTimelineRow key={act.id} act={act} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Yesterday Section */}
                  {grouped.yesterday.length > 0 && (
                    <div>
                      {/* Section Header */}
                      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-slate-50/95 backdrop-blur-xs px-5 py-2.5">
                        <div className="flex items-center gap-2">
                          <Calendar className="size-3.5 text-slate-500" />
                          <span className="text-xs font-bold text-slate-800">
                            {t("activity.group.yesterday")}
                          </span>
                        </div>
                        <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10.5px] font-bold text-slate-600 shadow-2xs">
                          {t("activity.activitiesCount", { count: grouped.yesterday.length })}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="divide-y divide-slate-100/80">
                        {grouped.yesterday.map((act) => (
                          <ActivityTimelineRow key={act.id} act={act} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Older Section */}
                  {grouped.older.length > 0 && (
                    <div>
                      {/* Section Header */}
                      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-slate-50/95 backdrop-blur-xs px-5 py-2.5">
                        <div className="flex items-center gap-2">
                          <Calendar className="size-3.5 text-slate-500" />
                          <span className="text-xs font-bold text-slate-800">
                            {t("activity.group.earlier")}
                          </span>
                        </div>
                        <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10.5px] font-bold text-slate-600 shadow-2xs">
                          {t("activity.activitiesCount", { count: grouped.older.length })}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="divide-y divide-slate-100/80">
                        {grouped.older.map((act) => (
                          <ActivityTimelineRow key={act.id} act={act} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar Column (4 Cols): Analytics & Compliance */}
          <div ref={rightColRef} className="space-y-5 lg:col-span-4">
            {/* Action Distribution Breakdown Card */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-7.5 items-center justify-center rounded-lg bg-[#D56673]/10 text-[#D56673]">
                    <TrendingUp className="size-4" />
                  </div>
                  <h3 className="font-display text-sm font-bold text-slate-900">
                    {t("activity.distribution")}
                  </h3>
                </div>
                {isLoading ? (
                  <span className="h-4 w-14 rounded bg-slate-200 animate-pulse inline-block" />
                ) : (
                  <span className="font-mono text-xs font-bold text-slate-500">
                    {stats.total} {t("activity.total")}
                  </span>
                )}
              </div>

              {/* Segmented Progress Line in GeoTrack theme */}
              <div className="space-y-1.5">
                <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  {isLoading ? (
                    <div className="h-full w-full bg-slate-200 animate-pulse" />
                  ) : (
                    <>
                      <div
                        className="bg-[#D56673] transition-all"
                        style={{
                          width: `${stats.total ? (stats.updated / stats.total) * 100 : 0}%`,
                        }}
                        title={`${t("activity.kind.updated")}: ${stats.updated}`}
                      />
                      <div
                        className="bg-amber-500 transition-all"
                        style={{
                          width: `${stats.total ? (stats.status_changed / stats.total) * 100 : 0}%`,
                        }}
                        title={`${t("activity.kind.status_changed")}: ${stats.status_changed}`}
                      />
                      <div
                        className="bg-emerald-500 transition-all"
                        style={{
                          width: `${stats.total ? (stats.created / stats.total) * 100 : 0}%`,
                        }}
                        title={`${t("activity.kind.created")}: ${stats.created}`}
                      />
                      <div
                        className="bg-rose-500 transition-all"
                        style={{
                          width: `${stats.total ? (stats.deleted / stats.total) * 100 : 0}%`,
                        }}
                        title={`${t("activity.kind.deleted")}: ${stats.deleted}`}
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Individual Breakdown Bars */}
              <div className="space-y-2.5 pt-1">
                {/* Updated */}
                <button
                  type="button"
                  onClick={() => setFilter("updated")}
                  className="flex w-full items-center justify-between text-left rounded-lg p-1.5 -mx-1.5 hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-[#D56673]" />
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-[#D56673]">
                      {t("activity.kind.updated")}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-slate-500 group-hover:text-slate-800">
                    {isLoading ? (
                      <span className="h-3.5 w-12 rounded bg-slate-200 animate-pulse inline-block" />
                    ) : (
                      <>
                        {stats.updated}{" "}
                        <span className="text-slate-400">
                          ({stats.total ? Math.round((stats.updated / stats.total) * 100) : 0}%)
                        </span>
                      </>
                    )}
                  </span>
                </button>

                {/* Status Changed */}
                <button
                  type="button"
                  onClick={() => setFilter("status_changed")}
                  className="flex w-full items-center justify-between text-left rounded-lg p-1.5 -mx-1.5 hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-amber-500" />
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-amber-700">
                      {t("activity.kind.status_changed")}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-slate-500 group-hover:text-slate-800">
                    {isLoading ? (
                      <span className="h-3.5 w-12 rounded bg-slate-200 animate-pulse inline-block" />
                    ) : (
                      <>
                        {stats.status_changed}{" "}
                        <span className="text-slate-400">
                          ({stats.total ? Math.round((stats.status_changed / stats.total) * 100) : 0}%)
                        </span>
                      </>
                    )}
                  </span>
                </button>

                {/* Created */}
                <button
                  type="button"
                  onClick={() => setFilter("created")}
                  className="flex w-full items-center justify-between text-left rounded-lg p-1.5 -mx-1.5 hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-emerald-700">
                      {t("activity.kind.created")}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-slate-500 group-hover:text-slate-800">
                    {isLoading ? (
                      <span className="h-3.5 w-12 rounded bg-slate-200 animate-pulse inline-block" />
                    ) : (
                      <>
                        {stats.created}{" "}
                        <span className="text-slate-400">
                          ({stats.total ? Math.round((stats.created / stats.total) * 100) : 0}%)
                        </span>
                      </>
                    )}
                  </span>
                </button>

                {/* Deleted */}
                <button
                  type="button"
                  onClick={() => setFilter("deleted")}
                  className="flex w-full items-center justify-between text-left rounded-lg p-1.5 -mx-1.5 hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-rose-500" />
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-rose-700">
                      {t("activity.kind.deleted")}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-slate-500 group-hover:text-slate-800">
                    {isLoading ? (
                      <span className="h-3.5 w-12 rounded bg-slate-200 animate-pulse inline-block" />
                    ) : (
                      <>
                        {stats.deleted}{" "}
                        <span className="text-slate-400">
                          ({stats.total ? Math.round((stats.deleted / stats.total) * 100) : 0}%)
                        </span>
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>

            {/* Most Active Entities Card */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-bold text-slate-900">
                  {t("activity.mostActive")}
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">
                  {t("activity.clickToSearch")}
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {isLoading ? (
                  [1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between py-2.5 animate-pulse">
                      <div className="flex items-center gap-2.5">
                        <div className="size-5 rounded-md bg-slate-200" />
                        <div className="space-y-1">
                          <div className="h-3.5 w-28 rounded bg-slate-200" />
                          <div className="h-2.5 w-14 rounded bg-slate-100" />
                        </div>
                      </div>
                      <div className="h-5 w-14 rounded-full bg-slate-200" />
                    </div>
                  ))
                ) : (
                  topEntities.map((ent, idx) => (
                    <button
                      key={ent.code}
                      type="button"
                      onClick={() => setSearch(ent.code)}
                      className="flex w-full items-center justify-between py-2.5 text-left transition-colors hover:text-[#D56673] cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[10px] font-bold text-slate-500 group-hover:bg-[#D56673]/10 group-hover:text-[#D56673]">
                          #{idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-slate-800 group-hover:text-[#D56673]">
                            {ent.name}
                          </p>
                          <span className="font-mono text-[10px] text-slate-400">{ent.code}</span>
                        </div>
                      </div>
                      <span className="flex h-5 items-center justify-center rounded-full bg-slate-100 px-2 text-[10.5px] font-bold text-slate-600 group-hover:bg-[#D56673] group-hover:text-white transition-colors">
                        {t("activity.eventsCount", { count: ent.count })}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityTimelineRow({ act }: { act: ActivityEntry }) {
  const { t, lang } = useLanguage();
  const theme = KIND_THEMES[act.kind] ?? KIND_THEMES.updated;
  const Icon = theme.icon;

  return (
    <div
      key={act.id}
      className="group relative flex items-start gap-4 px-5 py-3.5 transition-colors hover:bg-slate-50/70"
    >
      {/* Semantic Icon Squircle */}
      <div
        className={cn(
          "flex size-8.5 shrink-0 items-center justify-center rounded-xl border mt-0.5 shadow-2xs transition-transform group-hover:scale-105",
          theme.badgeBg,
          theme.badgeColor,
          theme.badgeBorder,
        )}
      >
        <Icon className="size-4" />
      </div>

      {/* Row Content */}
      <div className="min-w-0 flex-1">
        {/* Line 1: Code + Name + Timestamp + Consistently Placed Manage Entity */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md">
              {act.entityCode}
            </span>
            <span className="font-display text-[13px] font-bold text-slate-900 truncate">
              {act.entityName}
            </span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium whitespace-nowrap">
              <Clock className="size-3 text-slate-400" />
              <span suppressHydrationWarning title={formatDateTime(act.timestamp, lang)}>
                {relativeTime(act.timestamp, lang)}
              </span>
            </div>

            {/* Quick 1-click Link to Entities (Consistently top-right aligned) */}
            <Link
              to="/entities"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#D56673] hover:text-[#b04a56] hover:underline transition-colors whitespace-nowrap px-2 py-0.5 rounded-md hover:bg-[#D56673]/10 border border-transparent hover:border-[#D56673]/20"
              title={t("activity.manageEntity")}
            >
              <span>{t("activity.manageEntity")}</span>
              <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>

        {/* Line 2: Transition Badge & Detailed Attribute Changes */}
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          {(() => {
            const isTypeChange = !!act.detail && /type (?:changed )?from/i.test(act.detail);
            const badgeLabel = isTypeChange
              ? t("activity.kind.type_changed" as Parameters<typeof t>[0])
              : t(theme.labelKey as Parameters<typeof t>[0]);
            const badgeClass = isTypeChange
              ? "bg-purple-50 text-purple-700 border-purple-200/80"
              : cn(theme.badgeBg, theme.badgeColor, theme.badgeBorder);

            return (
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-md border shrink-0",
                  badgeClass,
                )}
              >
                {badgeLabel}
              </span>
            );
          })()}

          <ActivityDetailBadge detail={act.detail} kind={act.kind} />
        </div>
      </div>
    </div>
  );
}
