import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { minutesAgo } from "@/data/mockTime";
import type { ActivityEntry, ActivityKind, Entity } from "@/types/entity";

export type EntityInput = Omit<Entity, "id" | "createdAt" | "updatedAt">;

interface EntityStoreValue {
  entities: Entity[];
  activities: ActivityEntry[];
  addEntity: (input: EntityInput) => Entity;
  updateEntity: (id: string, input: EntityInput) => Entity | undefined;
  deleteEntity: (id: string) => void;
}

const EntityStoreContext = createContext<EntityStoreValue | null>(null);

let localIdCounter = 0;
function nextLocalId() {
  localIdCounter += 1;
  return `local-${Date.now()}-${localIdCounter}`;
}

export function EntityStoreProvider({
  initialEntities,
  initialActivities,
  children,
}: {
  initialEntities: Entity[];
  initialActivities: ActivityEntry[];
  children: ReactNode;
}) {
  const [entities, setEntities] = useState<Entity[]>(initialEntities);
  const [activities, setActivities] = useState<ActivityEntry[]>(initialActivities);

  const pushActivity = useCallback((kind: ActivityKind, entity: { code: string; name: string }, detail?: string) => {
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
  }, []);

  const addEntity = useCallback(
    (input: EntityInput) => {
      const entity: Entity = { ...input, id: nextLocalId(), createdAt: minutesAgo(0), updatedAt: minutesAgo(0) };
      setEntities((prev) => [entity, ...prev]);
      pushActivity("created", entity);
      return entity;
    },
    [pushActivity],
  );

  const updateEntity = useCallback(
    (id: string, input: EntityInput) => {
      let updated: Entity | undefined;
      setEntities((prev) =>
        prev.map((entity) => {
          if (entity.id !== id) return entity;
          updated = { ...entity, ...input, updatedAt: minutesAgo(0) };
          return updated;
        }),
      );
      if (updated) {
        pushActivity(
          updated.status !== input.status ? "status_changed" : "updated",
          updated,
          updated.status !== input.status ? `${updated.status} -> ${input.status}` : undefined,
        );
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
    },
    [pushActivity],
  );

  const value = useMemo(
    () => ({ entities, activities, addEntity, updateEntity, deleteEntity }),
    [entities, activities, addEntity, updateEntity, deleteEntity],
  );

  return <EntityStoreContext.Provider value={value}>{children}</EntityStoreContext.Provider>;
}

export function useEntityStore(): EntityStoreValue {
  const ctx = useContext(EntityStoreContext);
  if (!ctx) throw new Error("useEntityStore must be used within EntityStoreProvider");
  return ctx;
}
