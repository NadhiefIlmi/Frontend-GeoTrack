import { useState } from "react";
import { Search, Filter, X, ArrowUpDown, Eye, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "./StatusBadge";
import { TypeBadge } from "./TypeIcon";
import { TYPE_LABELS } from "./labels";
import { useLanguage } from "@/i18n/language";
import { relativeTime, formatCoord } from "@/lib/format";
import type { Entity, EntityStatus, EntityType } from "@/types/entity";
import { ENTITY_TYPES, ENTITY_STATUSES } from "@/types/entity";

interface EntityTableProps {
  entities: Entity[];
  showCoords?: boolean;
  onView?: (entity: Entity) => void;
  onEdit?: (entity: Entity) => void;
  onDelete?: (entity: Entity) => void;
  isLoading?: boolean;
}

type SortKey = "code" | "name" | "type" | "status" | "updatedAt";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 10;

export function EntityTable({
  entities,
  showCoords = true,
  onView,
  onEdit,
  onDelete,
  isLoading = false,
}: EntityTableProps) {
  const { t, lang } = useLanguage();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<EntityType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<EntityStatus | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  const filtered = entities.filter((e) => {
    const q = search.toLowerCase();
    const matchQ = !q || e.name.toLowerCase().includes(q) || e.code.toLowerCase().includes(q);
    const matchType = typeFilter === "all" || e.type === typeFilter;
    const matchStatus = statusFilter === "all" || e.status === statusFilter;
    return matchQ && matchType && matchStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    const valA = a?.updatedAt ? String(a.updatedAt) : "";
    const valB = b?.updatedAt ? String(b.updatedAt) : "";
    if (sortKey === "updatedAt") {
      cmp = valA.localeCompare(valB);
    } else {
      const fieldA = a?.[sortKey] != null ? String(a[sortKey]) : "";
      const fieldB = b?.[sortKey] != null ? String(b[sortKey]) : "";
      cmp = fieldA.localeCompare(fieldB);
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const from = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const to = Math.min(safePage * PAGE_SIZE, filtered.length);

  function SortableHeader({ label, col }: { label: string; col: SortKey }) {
    return (
      <button
        type="button"
        onClick={() => toggleSort(col)}
        className="flex items-center gap-1 text-left text-[11px] font-medium uppercase tracking-widest text-muted-foreground hover:text-foreground"
      >
        {label}
        <ArrowUpDown className={`size-3 ${sortKey === col ? "text-primary" : "opacity-40"}`} />
      </button>
    );
  }

  const hasFilters = typeFilter !== "all" || statusFilter !== "all" || search !== "";

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[180px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={t("search.placeholder")}
            className="h-8 pl-8 text-[13px]"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className={`h-8 gap-1.5 border-border text-[13px] ${filtersOpen ? "bg-accent/60" : "bg-transparent"}`}
          onClick={() => setFiltersOpen((v) => !v)}
        >
          <Filter className="size-3.5" />
          {t("filter.button")}
          {hasFilters && <span className="size-1.5 rounded-full bg-primary" />}
        </Button>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-[12px] text-muted-foreground hover:text-foreground"
            onClick={() => {
              setSearch("");
              setTypeFilter("all");
              setStatusFilter("all");
              setPage(1);
            }}
          >
            <X className="size-3" />
            {t("filter.clear")}
          </Button>
        )}
      </div>

      {/* Filter row */}
      {filtersOpen && (
        <div className="flex flex-wrap gap-2">
          <Select
            value={typeFilter}
            onValueChange={(v) => {
              setTypeFilter(v as EntityType | "all");
              setPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-40 text-[13px]">
              <SelectValue placeholder={t("filter.allTypes")} />
            </SelectTrigger>
            <SelectContent className="border-border bg-popover">
              <SelectItem value="all" className="text-[13px]">
                {t("filter.allTypes")}
              </SelectItem>
              {ENTITY_TYPES.map((tp) => (
                <SelectItem key={tp} value={tp} className="text-[13px]">
                  {t(TYPE_LABELS[tp])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v as EntityStatus | "all");
              setPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-40 text-[13px]">
              <SelectValue placeholder={t("filter.allStatuses")} />
            </SelectTrigger>
            <SelectContent className="border-border bg-popover">
              <SelectItem value="all" className="text-[13px]">
                {t("filter.allStatuses")}
              </SelectItem>
              {ENTITY_STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="text-[13px]">
                  {t(`status.${s}` as Parameters<typeof t>[0])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="px-3 py-2.5 text-left">
                  <SortableHeader label={t("col.code")} col="code" />
                </th>
                <th className="px-3 py-2.5 text-left">
                  <SortableHeader label={t("col.name")} col="name" />
                </th>
                <th className="px-3 py-2.5 text-left">
                  <SortableHeader label={t("col.type")} col="type" />
                </th>
                {showCoords && (
                  <>
                    <th className="px-3 py-2.5 text-left text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                      {t("col.latitude")}
                    </th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                      {t("col.longitude")}
                    </th>
                  </>
                )}
                <th className="px-3 py-2.5 text-left">
                  <SortableHeader label={t("col.status")} col="status" />
                </th>
                <th className="px-3 py-2.5 text-left">
                  <SortableHeader label={t("col.lastUpdated")} col="updatedAt" />
                </th>
                <th className="px-3 py-2.5 text-right text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                  {t("col.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={idx} className="border-b border-border/40 animate-pulse">
                    <td className="px-3 py-3"><div className="h-3.5 w-16 rounded bg-slate-200" /></td>
                    <td className="px-3 py-3"><div className="h-3.5 w-36 rounded bg-slate-200" /></td>
                    <td className="px-3 py-3"><div className="h-5 w-20 rounded-md bg-slate-200" /></td>
                    {showCoords && (
                      <>
                        <td className="px-3 py-3"><div className="h-3.5 w-16 rounded bg-slate-100" /></td>
                        <td className="px-3 py-3"><div className="h-3.5 w-16 rounded bg-slate-100" /></td>
                      </>
                    )}
                    <td className="px-3 py-3"><div className="h-5 w-16 rounded-md bg-slate-200" /></td>
                    <td className="px-3 py-3"><div className="h-3.5 w-20 rounded bg-slate-100" /></td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-1">
                        <div className="size-6 rounded bg-slate-200" />
                        <div className="size-6 rounded bg-slate-200" />
                        <div className="size-6 rounded bg-slate-200" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : paged.length === 0 ? (
                <tr>
                  <td
                    colSpan={showCoords ? 8 : 6}
                    className="px-3 py-8 text-center text-[13px] text-muted-foreground"
                  >
                    {t("misc.noData")}
                  </td>
                </tr>
              ) : (
                paged.map((entity, i) => (
                  <tr
                    key={entity.id}
                    className={`border-b border-border/60 transition-colors hover:bg-pink-50/60 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}
                  >
                    <td className="px-3 py-2.5">
                      <span className="font-mono text-[12px] text-muted-foreground">
                        {entity.code}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-[13px] font-medium text-foreground">{entity.name}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <TypeBadge type={entity.type} />
                    </td>
                    {showCoords && (
                      <>
                        <td className="px-3 py-2.5 font-mono text-[12px] text-muted-foreground">
                          {formatCoord(entity.latitude)}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-[12px] text-muted-foreground">
                          {formatCoord(entity.longitude)}
                        </td>
                      </>
                    )}
                    <td className="px-3 py-2.5">
                      <StatusBadge status={entity.status} />
                    </td>
                    <td suppressHydrationWarning className="px-3 py-2.5 text-[12px] text-muted-foreground">
                      {relativeTime(entity.updatedAt, lang)}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        {onView && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-muted-foreground hover:text-foreground"
                            onClick={() => onView(entity)}
                            title={t("action.viewDetails")}
                          >
                            <Eye className="size-3.5" />
                          </Button>
                        )}
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-muted-foreground hover:text-foreground"
                            onClick={() => onEdit(entity)}
                            title={t("action.edit")}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-destructive/70 hover:text-destructive"
                            onClick={() => onDelete(entity)}
                            title={t("action.delete")}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-[12px] text-muted-foreground">
        {isLoading ? (
          <div className="h-3.5 w-32 rounded bg-slate-200 animate-pulse" />
        ) : (
          <span>{t("pagination.showing", { from, to, total: filtered.length })}</span>
        )}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-7 border-border bg-transparent px-2 text-[12px] disabled:opacity-40"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            {t("pagination.prev")}
          </Button>
          <span className="px-2">
            {safePage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-7 border-border bg-transparent px-2 text-[12px] disabled:opacity-40"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            {t("pagination.next")}
          </Button>
        </div>
      </div>
    </div>
  );
}
