import { lazy, Suspense, useEffect, useState } from "react";
import type { MapPickerProps } from "./MapPickerInner";
import { MapSkeleton } from "./MapSkeleton";

const MapPickerInner = lazy(() => import("./MapPickerInner"));

/**
 * Client-only wrapper around the Leaflet map picker: the Leaflet module is
 * dynamically imported only after mount so SSR never touches `window`.
 */
export function MapPicker({ className, ...props }: MapPickerProps & { className?: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className={className ?? "h-full w-full"}>
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
