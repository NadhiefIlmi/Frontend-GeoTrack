import { cn } from "@/lib/utils";

export function MapSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden bg-slate-300 select-none",
        className,
      )}
      aria-hidden
    >
      {/* High-contrast smooth shimmer beam */}
      <div
        className="pointer-events-none absolute top-0 -bottom-0 -skew-x-12 opacity-95"
        style={{
          width: "60%",
          height: "100%",
          background:
            "linear-gradient(90deg, rgba(203, 213, 225, 0) 0%, rgba(255, 255, 255, 0.95) 50%, rgba(203, 213, 225, 0) 100%)",
          animation: "mapShimmerSweep 1.4s infinite ease-in-out",
        }}
      />
      <style>{`
        @keyframes mapShimmerSweep {
          0% {
            left: -70%;
          }
          100% {
            left: 130%;
          }
        }
      `}</style>
    </div>
  );
}
