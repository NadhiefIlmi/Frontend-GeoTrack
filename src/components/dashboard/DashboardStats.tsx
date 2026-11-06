import { useMemo } from "react";
import { MapPin, Wifi, WifiOff, Wrench } from "lucide-react";
import { useLanguage } from "@/i18n/language";
import { useEntityStore } from "@/state/EntityStore";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: typeof MapPin;
  label: string;
  value: number;
  color: string;
  bgColor: string;
  isLoading?: boolean;
}

function StatCard({ icon: Icon, label, value, color, bgColor, isLoading }: StatCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
      <div className={cn("flex size-9 items-center justify-center rounded-lg shrink-0", bgColor)}>
        <Icon className={cn("size-4", color)} />
      </div>
      <div className="min-w-0 flex-1">
        {isLoading ? (
          <div className="h-6 w-12 rounded bg-slate-200/80 animate-pulse my-0.5" />
        ) : (
          <p className="font-display text-xl font-bold leading-tight text-foreground">{value}</p>
        )}
        <p className="text-[11px] text-muted-foreground truncate">{label}</p>
      </div>
    </div>
  );
}

export function DashboardStats() {
  const { t } = useLanguage();
  const { entities, isLoading } = useEntityStore();

  const stats = useMemo(
    () => ({
      total: entities.length,
      active: entities.filter((e) => e.status === "active").length,
      inactive: entities.filter((e) => e.status === "inactive").length,
      maintenance: entities.filter((e) => e.status === "maintenance").length,
    }),
    [entities],
  );

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard
        icon={MapPin}
        label={t("stat.total")}
        value={stats.total}
        color="text-primary"
        bgColor="bg-primary/15"
        isLoading={isLoading}
      />
      <StatCard
        icon={Wifi}
        label={t("stat.active")}
        value={stats.active}
        color="text-status-active"
        bgColor="bg-status-active/15"
        isLoading={isLoading}
      />
      <StatCard
        icon={WifiOff}
        label={t("stat.inactive")}
        value={stats.inactive}
        color="text-muted-foreground"
        bgColor="bg-muted/40"
        isLoading={isLoading}
      />
      <StatCard
        icon={Wrench}
        label={t("stat.maintenance")}
        value={stats.maintenance}
        color="text-status-maintenance"
        bgColor="bg-status-maintenance/15"
        isLoading={isLoading}
      />
    </div>
  );
}
