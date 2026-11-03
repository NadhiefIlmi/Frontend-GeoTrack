import { lazy, Suspense, useEffect, useState } from "react";
import { MapSkeleton } from "./MapSkeleton";
import type { MapPickerProps } from "./MapPickerInner";

const MapPickerInner = lazy(() => import("./MapPickerInner"));

/**
 * Client-only wrapper around the Leaflet map picker: the Leaflet module is
 * dynamically imported only after mount so SSR never touches `window`.
 */
export function MapPicker({ className, ...props }: MapPickerProps & { className?: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className={className}>
      {mounted ? (
        <Suspense fallback={<MapSkeleton />}>
          <MapPickerInner {...props} />
        </Suspense>
      ) : (
        <MapSkeleton />
      )}
    </div>
  );
}
