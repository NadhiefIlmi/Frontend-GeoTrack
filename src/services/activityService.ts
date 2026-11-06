import { apiClient } from "./api";
import type { ActivityEntry } from "@/types/entity";

function mapActivity(a: any): ActivityEntry {
  return {
    id: a.id,
    kind: a.action || a.kind || "created",
    entityCode: a.entity_code || a.entityCode || "",
    entityName: a.entity_name || a.entityName || "",
    detail: a.details || a.detail || undefined,
    timestamp: a.created_at || a.timestamp || new Date().toISOString(),
  };
}

export const activityService = {
  async getActivities(params?: {
    search?: string;
    action?: string;
    entity_id?: string;
    page?: number;
    limit?: number;
  }): Promise<ActivityEntry[]> {
    try {
      const response = await apiClient.get<any[]>("/activities", { params });
      if (Array.isArray(response.data)) {
        return response.data.map(mapActivity);
      }
      return [];
    } catch {
      return [];
    }
  },

  async getActivityById(id: string): Promise<ActivityEntry | null> {
    try {
      const response = await apiClient.get<any>(`/activities/${encodeURIComponent(id)}`);
      return response.data ? mapActivity(response.data) : null;
    } catch {
      return null;
    }
  },
};

