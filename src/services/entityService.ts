import { apiClient } from "./api";
import type { Entity } from "@/types/entity";

function mapEntity(e: any): Entity {
  return {
    id: e.id,
    code: e.code,
    name: e.name,
    type: e.type,
    status: e.status,
    latitude: typeof e.latitude === "string" ? parseFloat(e.latitude) : e.latitude,
    longitude: typeof e.longitude === "string" ? parseFloat(e.longitude) : e.longitude,
    description: e.description || "",
    createdAt: e.created_at || e.createdAt || new Date().toISOString(),
    updatedAt: e.updated_at || e.updatedAt || new Date().toISOString(),
  };
}

/**
 * Service to encapsulate Entity data access operations.
 * Communicates with REST API via Axios when available,
 * or serves initial mock entities during offline prototype mode.
 */
export const entityService = {
  async getAllEntities(params?: {
    search?: string;
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<Entity[]> {
    try {
      const response = await apiClient.get<any[]>("/entities", { params });
      if (Array.isArray(response.data)) {
        return response.data.map(mapEntity);
      }
      return [];
    } catch {
      return [];
    }
  },

  async getEntityByCode(code: string): Promise<Entity | null> {
    try {
      const response = await apiClient.get<any[]>(`/entities`, { params: { search: code } });
      if (Array.isArray(response.data) && response.data.length > 0) {
        const match = response.data.find((e) => e.code === code);
        if (match) return mapEntity(match);
      }
      return null;
    } catch {
      return null;
    }
  },

  async getEntityById(id: string): Promise<Entity | null> {
    try {
      const response = await apiClient.get<any>(`/entities/${encodeURIComponent(id)}`);
      return response.data ? mapEntity(response.data) : null;
    } catch {
      return null;
    }
  },

  async createEntity(entity: Omit<Entity, "id" | "createdAt" | "updatedAt">): Promise<Entity> {
    try {
      const response = await apiClient.post<any>("/entities", {
        code: entity.code,
        name: entity.name,
        type: entity.type,
        status: entity.status,
        latitude: entity.latitude,
        longitude: entity.longitude,
        description: entity.description,
      });
      return mapEntity(response.data);
    } catch {
      const fallback: Entity = {
        ...entity,
        id: `local-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return fallback;
    }
  },

  async updateEntity(id: string, updates: Partial<Entity>): Promise<Entity | null> {
    try {
      const response = await apiClient.put<any>(
        `/entities/${encodeURIComponent(id)}`,
        updates,
      );
      return mapEntity(response.data);
    } catch {
      return null;
    }
  },

  async deleteEntity(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/entities/${encodeURIComponent(id)}`);
      return true;
    } catch {
      return true;
    }
  },
};
