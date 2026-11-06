import { apiClient } from "./api";
import type { DashboardStats } from "@/types/dashboard";

function computeFallbackStats(): DashboardStats {
  return {
    totalEntities: 0,
    statusSummary: {
      active: 0,
      inactive: 0,
      maintenance: 0,
    },
    typeSummary: {
      vehicles: 0,
      iot_devices: 0,
      facilities: 0,
      infrastructures: 0,
    },
    recentActivities: [],
  };
}

export const dashboardService = {
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await apiClient.get<any>("/dashboard/stats");
      const d = response.data;
      if (d && typeof d === "object" && "total_entities" in d) {
        return {
          totalEntities: d.total_entities,
          statusSummary: d.status_summary,
          typeSummary: d.type_summary,
          recentActivities: Array.isArray(d.recent_activities)
            ? d.recent_activities.map((a: any) => ({
                id: a.id,
                kind: a.action || a.kind || "created",
                entityCode: a.entity_code || a.entityCode || "",
                entityName: a.entity_name || a.entityName || "",
                detail: a.details || a.detail,
                timestamp: a.created_at || a.timestamp || new Date().toISOString(),
              }))
            : [],
        };
      }
      return computeFallbackStats();
    } catch {
      return computeFallbackStats();
    }
  },
};

