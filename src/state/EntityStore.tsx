import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { minutesAgo } from "@/data/mockTime";
import type { ActivityEntry, ActivityKind, Entity } from "@/types/entity";
import { entityService } from "@/services/entityService";
import { activityService } from "@/services/activityService";

export type EntityInput = Omit<Entity, "id" | "createdAt" | "updatedAt">;

interface EntityStoreValue {
  entities: Entity[];
  activities: ActivityEntry[];
  addEntity: (input: EntityInput) => Entity;
  updateEntity: (id: string, input: EntityInput) => Entity | undefined;
  deleteEntity: (id: string) => void;
  refreshData: () => Promise<void>;
  isLoading: boolean;
}

const EntityStoreContext = createContext<EntityStoreValue | null>(null);

let localIdCounter = 0;
function nextLocalId() {
  localIdCounter += 1;
  return `local-${Date.now()}-${localIdCounter}`;
}

export function EntityStoreProvider({
  initialEntities = [],
  initialActivities = [],
  children,
}: {
  initialEntities?: Entity[];
  initialActivities?: ActivityEntry[];
  children: ReactNode;
}) {
  const [entities, setEntities] = useState<Entity[]>(initialEntities);
  const [activities, setActivities] = useState<ActivityEntry[]>(initialActivities);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    const minWait = new Promise((resolve) => setTimeout(resolve, 500));
    try {
      const [fetchedEntities, fetchedActivities] = await Promise.allSettled([
        entityService.getAllEntities(),
        activityService.getActivities(),
        minWait,
      ]);

      if (fetchedEntities.status === "fulfilled") {
        setEntities(fetchedEntities.value);
      }
      if (fetchedActivities.status === "fulfilled") {
        setActivities(fetchedActivities.value);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      refreshData();
    }
  }, [refreshData]);

  const pushActivity = useCallback(
    (kind: ActivityKind, entity: { code: string; name: string }, detail?: string) => {
      setActivities((prev) => [
        {
          id: nextLocalId(),
          kind,
          entityCode: entity.code,
          entityName: entity.name,
          detail,
          timestamp: minutesAgo(0),
        },
        ...prev,
      ]);
    },
    [],
  );

  const addEntity = useCallback(
    (input: EntityInput) => {
      const entity: Entity = {
        ...input,
        id: nextLocalId(),
        createdAt: minutesAgo(0),
        updatedAt: minutesAgo(0),
      };
      setEntities((prev) => [entity, ...prev]);
      pushActivity("created", entity);

      entityService
        .createEntity(input)
        .then((created) => {
          if (created && created.id && !created.id.startsWith("local-")) {
            setEntities((prev) => prev.map((e) => (e.id === entity.id ? created : e)));
          }
        })
        .catch(() => {
          // Keep local optimistic entity on error/offline
        });

      return entity;
    },
    [pushActivity],
  );

  const updateEntity = useCallback(
    (id: string, input: EntityInput) => {
      let updated: Entity | undefined;
      let existing: Entity | undefined;

      setEntities((prev) => {
        existing = prev.find((e) => e.id === id);
        return prev.map((entity) => {
          if (entity.id !== id) return entity;
          updated = { ...entity, ...input, updatedAt: minutesAgo(0) };
          return updated;
        });
      });

      if (updated && existing) {
        const changes: string[] = [];
        if (existing.type !== input.type) {
          changes.push(`Type changed from ${existing.type} to ${input.type}`);
        }
        if (existing.status !== input.status) {
          changes.push(`Status changed from ${existing.status} to ${input.status}`);
        }
        if (existing.name !== input.name) {
          changes.push(`Name changed from "${existing.name}" to "${input.name}"`);
        }
        if (existing.code !== input.code) {
          changes.push(`Code changed from ${existing.code} to ${input.code}`);
        }
        if (existing.latitude !== input.latitude || existing.longitude !== input.longitude) {
          changes.push(`Coordinates updated to (${input.latitude}, ${input.longitude})`);
        }

        const kind: ActivityKind =
          existing.status !== input.status ? "status_changed" : "updated";
        const detail =
          changes.length > 0
            ? changes.join("; ")
            : "Entity attributes updated";

        pushActivity(kind, updated, detail);

        entityService
          .updateEntity(id, input)
          .then(() => {
            activityService.getActivities().then((acts) => {
              if (acts.length > 0) setActivities(acts);
            });
          })
          .catch(() => {
            // Keep local optimistic entity on error/offline
          });
      }
      return updated;
    },
    [pushActivity],
  );

  const deleteEntity = useCallback(
    (id: string) => {
      setEntities((prev) => {
        const target = prev.find((entity) => entity.id === id);
        if (target) pushActivity("deleted", target);
        return prev.filter((entity) => entity.id !== id);
      });

      entityService.deleteEntity(id).catch(() => {
        // Keep local optimistic entity on error/offline
      });
    },
    [pushActivity],
  );

  const value = useMemo(
    () => ({ entities, activities, addEntity, updateEntity, deleteEntity, refreshData, isLoading }),
    [entities, activities, addEntity, updateEntity, deleteEntity, refreshData, isLoading],
  );

  return <EntityStoreContext.Provider value={value}>{children}</EntityStoreContext.Provider>;
}

export function useEntityStore(): EntityStoreValue {
  const ctx = useContext(EntityStoreContext);
  if (!ctx) throw new Error("useEntityStore must be used within EntityStoreProvider");
  return ctx;
}
