import type { ActivityEntry } from "./entity";

export interface StatusSummary {
  active: number;
  inactive: number;
  maintenance: number;
}

export interface TypeSummary {
  vehicles: number;
  iot_devices: number;
  facilities: number;
  infrastructures: number;
}

export interface DashboardStats {
  totalEntities: number;
  statusSummary: StatusSummary;
  typeSummary: TypeSummary;
  recentActivities: ActivityEntry[];
}

