import { cn } from "@/lib/utils";

export function MapSkeleton({ className }: { className?: string }) {
  return <div className={cn("h-full w-full animate-pulse bg-muted/30", className)} aria-hidden />;
}
