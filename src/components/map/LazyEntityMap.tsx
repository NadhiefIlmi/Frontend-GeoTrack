import { useEffect, useState } from "react";
import { lazy, Suspense } from "react";
import type { Entity } from "@/types/entity";
import { MapSkeleton } from "./MapSkeleton";

const EntityMapInner = lazy(() => import("./EntityMapInner"));

export interface EntityMapProps {
  entities: Entity[];
  selectedId?: string | null | undefined;
  onSelect?: ((id: string) => void) | undefined;
  /** Pan + zoom to this entity when it changes. */
  focus?: { lat: number; lng: number; id: string } | null | undefined;
  detailOpen?: boolean | undefined;
  isLoading?: boolean;
}

/**
 * Client-only wrapper: Leaflet is browser-only, so the inner map module is
 * dynamically imported after the component mounts (never during SSR).
 */
export function LazyEntityMap({ className, isLoading = false, ...props }: EntityMapProps & { className?: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className={className}>
      {mounted && !isLoading ? (
        <Suspense fallback={<MapSkeleton />}>
          <EntityMapInner {...props} />
        </Suspense>
      ) : (
        <MapSkeleton />
      )}
    </div>
  );
}
