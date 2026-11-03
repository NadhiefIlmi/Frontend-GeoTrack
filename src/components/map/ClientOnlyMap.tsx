import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function MapSkeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-muted/30", className)} aria-hidden />;
}

/**
 * Client-only wrapper for Leaflet-based maps. Leaflet touches `window` at
 * import time, so the inner module is dynamically imported only after mount.
 */
export function ClientOnlyMap({
  importInner,
  className,
  render,
}: {
  importInner: () => Promise<{ default: (props: never) => JSX.Element }>;
  className?: string;
  render: (Inner: (props: never) => JSX.Element) => React.ReactNode;
}) {
  const [Inner, setInner] = useState<((props: never) => JSX.Element) | null>(null);

  useEffect(() => {
    let active = true;
    importInner().then((mod) => {
      if (active) setInner(() => mod.default);
    });
    return () => {
      active = false;
    };
  }, [importInner]);

  if (!Inner) return <MapSkeleton className={className} />;
  return <>{render(Inner)}</>;
}
