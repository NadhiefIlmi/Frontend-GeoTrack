import { useState, useRef, useEffect } from "react";
import { Layers, ChevronDown, Check } from "lucide-react";
import { useLanguage } from "@/i18n/language";
import { cn } from "@/lib/utils";

export type MapStyle = "dark" | "standard" | "satellite";

export const MAP_STYLE_STORAGE_KEY = "geotrack-map-style";

interface MapStyleSwitcherProps {
  currentStyle: MapStyle;
  onStyleChange: (style: MapStyle) => void;
  className?: string;
}

/** Standard OpenStreetMap road illustration with river and Coral Pink landmark */
function StandardThumbnail({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-lg border border-slate-200/90 bg-[#F1F5F9] shadow-xs",
        className,
      )}
    >
      <svg className="absolute inset-0 size-full" viewBox="0 0 44 44" fill="none">
        {/* River */}
        <path
          d="M-2 16 C 12 12, 16 26, 46 22"
          stroke="#93C5FD"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
        {/* Secondary roads */}
        <path d="M10 -2 L10 46 M32 -2 L32 46" stroke="#FFFFFF" strokeWidth="3" />
        <path d="M-2 30 L46 30" stroke="#FFFFFF" strokeWidth="3" />
        {/* Primary avenue */}
        <path d="M-2 8 L46 8" stroke="#FDBA74" strokeWidth="3.5" />
        {/* Landmarks */}
        <rect x="22" y="11" width="6" height="5" rx="1" fill="#CBD5E1" />
        {/* Center Coral Pink pin matching brand */}
        <circle cx="22" cy="22" r="5.5" fill="#D56673" />
        <circle cx="22" cy="22" r="2.2" fill="#FFFFFF" />
      </svg>
    </div>
  );
}

/** High-contrast Cyber GIS Dark Matter illustration with glowing neon traces */
function DarkMatterThumbnail({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-lg border border-pink-500/40 bg-[#0B0F19] shadow-xs",
        className,
      )}
    >
      <svg className="absolute inset-0 size-full" viewBox="0 0 44 44" fill="none">
        {/* Cyber grid */}
        <path
          d="M0 11 H44 M0 22 H44 M0 33 H44 M11 0 V44 M22 0 V44 M33 0 V44"
          stroke="#1E293B"
          strokeWidth="0.8"
        />
        {/* Glowing neon road traces */}
        <path d="M-2 14 Q 22 8, 46 28" stroke="#38BDF8" strokeWidth="2.2" opacity="0.9" />
        <path d="M12 -2 L26 46" stroke="#A855F7" strokeWidth="2" opacity="0.85" />
        {/* Glowing pulse radar center */}
        <circle cx="22" cy="22" r="8.5" fill="#D56673" opacity="0.28" />
        <circle cx="22" cy="22" r="5" fill="#D56673" />
        <circle cx="22" cy="22" r="2" fill="#FFFFFF" />
      </svg>
    </div>
  );
}

/** Esri Satellite terrain with photographic topography, orbital ring and emerald radar */
function SatelliteThumbnail({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-lg border border-emerald-500/40 bg-[#082F49] shadow-xs",
        className,
      )}
    >
      <svg className="absolute inset-0 size-full" viewBox="0 0 44 44" fill="none">
        {/* Deep ocean + landmass contours */}
        <path d="M-2 12 Q 16 6, 22 20 T 46 16 L46 46 L-2 46 Z" fill="#14532D" />
        <path d="M14 26 Q 24 20, 38 30 L46 46 L8 46 Z" fill="#15803D" />
        <path d="M-2 13 Q 16 8, 22 21" stroke="#CA8A04" strokeWidth="1.2" opacity="0.7" />
        {/* Orbital scan ring */}
        <circle
          cx="22"
          cy="22"
          r="13"
          stroke="#FFFFFF"
          strokeWidth="1"
          strokeDasharray="3 3"
          opacity="0.45"
        />
        {/* Emerald sensor point */}
        <circle cx="22" cy="22" r="7.5" fill="#10B981" opacity="0.3" />
        <circle cx="22" cy="22" r="5" fill="#10B981" />
        <circle cx="22" cy="22" r="2" fill="#FFFFFF" />
      </svg>
    </div>
  );
}

export function MapStyleSwitcher({
  currentStyle,
  onStyleChange,
  className,
}: MapStyleSwitcherProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const styles: Array<{
    id: MapStyle;
    label: string;
    desc: string;
    renderThumbnail: (props: { className?: string }) => React.JSX.Element;
  }> = [
    {
      id: "standard",
      label: t("map.styleStandard"),
      desc: t("map.styleStandardDesc"),
      renderThumbnail: (p) => <StandardThumbnail {...p} />,
    },
    {
      id: "dark",
      label: t("map.styleDark"),
      desc: t("map.styleDarkDesc"),
      renderThumbnail: (p) => <DarkMatterThumbnail {...p} />,
    },
    {
      id: "satellite",
      label: t("map.styleSatellite"),
      desc: t("map.styleSatelliteDesc"),
      renderThumbnail: (p) => <SatelliteThumbnail {...p} />,
    },
  ];

  const currentOption = styles.find((s) => s.id === currentStyle) ?? styles[0]!;

  return (
    <div ref={containerRef} className={cn("relative z-[1000]", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        title={t("map.style")}
        className={cn(
          "flex items-center gap-2.5 rounded-xl border border-slate-200/90 bg-white/95 px-2.5 py-1.5 text-[12px] font-bold text-slate-800 shadow-md backdrop-blur-md transition-all hover:bg-white hover:border-[#D56673]/60",
          open && "border-[#D56673] ring-2 ring-[#D56673]/20",
        )}
      >
        {currentOption.renderThumbnail({ className: "size-6.5 rounded-md" })}
        <span className="font-bold tracking-tight">{currentOption.label}</span>
        <ChevronDown
          className={cn(
            "size-3.5 text-slate-400 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {/* Floating Dropdown Card */}
      {open && (
        <div className="absolute left-0 top-full mt-2 w-72 rounded-2xl border border-slate-200/90 bg-white/98 p-2 shadow-2xl backdrop-blur-lg animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center gap-2 px-2.5 py-1.5 border-b border-slate-100 mb-1.5">
            <Layers className="size-3.5 text-[#D56673]" />
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#D56673]">
              {t("map.style")}
            </p>
          </div>

          <div className="space-y-1">
            {styles.map((option) => {
              const isSelected = option.id === currentStyle;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onStyleChange(option.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl p-2 text-left transition-all",
                    isSelected
                      ? "bg-pink-50/80 border border-[#D56673]/40 text-[#D56673] shadow-xs"
                      : "hover:bg-slate-50 border border-transparent text-slate-700",
                  )}
                >
                  {/* Rich Realistic Thumbnail */}
                  {option.renderThumbnail({ className: "size-11 rounded-lg" })}

                  {/* Text details */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-[12.5px] font-bold leading-tight",
                        isSelected ? "text-[#D56673]" : "text-slate-900",
                      )}
                    >
                      {option.label}
                    </p>
                    <p className="text-[10.5px] text-slate-500 leading-snug truncate mt-0.5">
                      {option.desc}
                    </p>
                  </div>

                  {/* Solid checkmark pill when selected */}
                  {isSelected && (
                    <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#D56673] text-white shadow-xs">
                      <Check className="size-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
