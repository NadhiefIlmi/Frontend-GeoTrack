import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { ArrowRight, Minus, Plus, RotateCcw } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { StatusBadge } from "@/components/entities/StatusBadge";
import { TypeBadge } from "@/components/entities/TypeIcon";
import type { Entity } from "@/types/entity";
import { MapLegend } from "./MapLegend";
import { MapStyleSwitcher, type MapStyle, MAP_STYLE_STORAGE_KEY } from "./MapStyleSwitcher";
import {
  DARK_ATTRIBUTION,
  DARK_TILES,
  INITIAL_ZOOM,
  JAKARTA_CENTER,
  STANDARD_ATTRIBUTION,
  STANDARD_TILES,
  SATELLITE_TILES,
  SATELLITE_LABELS,
  SATELLITE_ATTRIBUTION,
  getEntityIcon,
} from "./mapIcons";
import { useLanguage } from "@/i18n/language";
import { cn } from "@/lib/utils";
import type { EntityMapProps } from "./LazyEntityMap";

function MapInstanceSetter({ onReady }: { onReady: (map: L.Map) => void }) {
  const map = useMap();
  useEffect(() => {
    onReady(map);
  }, [map, onReady]);
  return null;
}

function AutoResizeHandler() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    if (!container || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [map]);
  return null;
}

function FocusHandler({ focus }: { focus: EntityMapProps["focus"] }) {
  const map = useMap();
  useEffect(() => {
    if (!focus) return;
    map.flyTo([focus.lat, focus.lng], Math.max(map.getZoom(), 14), { duration: 0.8 });
  }, [focus, map]);
  return null;
}

function EntityPopupCard({
  entity,
  onSelect,
}: {
  entity: Entity;
  onSelect?: ((id: string) => void) | undefined;
}) {
  const { t } = useLanguage();
  const map = useMap();

  return (
    <div className="w-[210px] text-slate-800">
      {/* Header: Type Badge & Entity Code */}
      <div className="flex items-center justify-between gap-2 pr-4">
        <TypeBadge type={entity.type} className="text-[10px] px-1.5 py-0.5" />
        <span className="font-mono text-[10px] font-semibold text-slate-400">{entity.code}</span>
      </div>

      {/* Entity Name */}
      <h4
        className="mt-1 font-display text-[13px] font-bold leading-tight text-slate-900 line-clamp-2"
        title={entity.name}
      >
        {entity.name}
      </h4>

      {/* Bottom row: Status badge + Compact Action button */}
      <div className="mt-2 flex items-center justify-between gap-1.5 border-t border-slate-100 pt-1.5">
        <StatusBadge status={entity.status} className="!text-[10px] !py-0.5 !px-2 !leading-none" />
        <button
          type="button"
          onClick={() => {
            onSelect?.(entity.id);
            map.closePopup();
          }}
          className="inline-flex h-6.5 items-center gap-1 rounded-md bg-[#D56673] px-2.5 text-[11px] font-semibold text-white shadow-xs transition-all hover:bg-[#c25562] active:scale-95 cursor-pointer shrink-0"
        >
          <span>{t("action.viewDetails")}</span>
          <ArrowRight className="size-3" />
        </button>
      </div>
    </div>
  );
}

function ControlButton({
  label,
  disabled,
  onClick,
  children,
  withDivider,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
  withDivider?: boolean;
}) {
  return (
    <>
      {withDivider && <div className="h-px w-full bg-border" />}
      <button
        type="button"
        title={label}
        aria-label={label}
        disabled={disabled}
        onClick={onClick}
        className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:bg-accent/70 hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
      >
        {children}
      </button>
    </>
  );
}

function PopupManager({ selectedId }: { selectedId?: string | null | undefined }) {
  const map = useMap();
  useEffect(() => {
    if (selectedId) {
      map.closePopup();
    }
  }, [selectedId, map]);
  return null;
}

function MapStyleEffect({ style }: { style: MapStyle }) {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    if (style === "dark") {
      container.classList.add("map-dark-tiles");
    } else {
      container.classList.remove("map-dark-tiles");
    }
  }, [style, map]);
  return null;
}

export default function EntityMapInner({
  entities,
  selectedId,
  onSelect,
  focus,
  detailOpen,
}: EntityMapProps) {
  const { t } = useLanguage();
  const [map, setMap] = useState<L.Map | null>(null);
  const [mapStyle, setMapStyle] = useState<MapStyle>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(MAP_STYLE_STORAGE_KEY) as MapStyle | null;
        if (stored === "dark" || stored === "standard" || stored === "satellite") {
          return stored;
        }
      } catch {
        // Ignore localStorage read errors in SSR/sandboxed environment
      }
    }
    return "dark";
  });

  function handleStyleChange(style: MapStyle) {
    setMapStyle(style);
    try {
      localStorage.setItem(MAP_STYLE_STORAGE_KEY, style);
    } catch {
      // Ignore localStorage write errors in private mode
    }
  }

  // Keep popups safely to the left and top of floating dashboard / detail panels
  const autoPanRight = detailOpen ? 880 : 540;
  const autoPanBottom = 360;

  return (
    <div className={cn("relative h-full w-full", mapStyle === "dark" && "map-dark-tiles")}>
      <MapContainer
        center={JAKARTA_CENTER}
        zoom={INITIAL_ZOOM}
        zoomControl={false}
        scrollWheelZoom
        className="z-0 h-full w-full"
      >
        <MapInstanceSetter onReady={setMap} />
        <AutoResizeHandler />
        <MapStyleEffect style={mapStyle} />
        <FocusHandler focus={focus} />
        <PopupManager selectedId={selectedId} />

        {/* 100% Free Public Base Tile Providers */}
        {mapStyle === "dark" && (
          <TileLayer key="dark-tiles" url={DARK_TILES} attribution={DARK_ATTRIBUTION} />
        )}
        {mapStyle === "standard" && (
          <TileLayer key="standard-tiles" url={STANDARD_TILES} attribution={STANDARD_ATTRIBUTION} />
        )}
        {mapStyle === "satellite" && (
          <>
            <TileLayer
              key="satellite-base-tiles"
              url={SATELLITE_TILES}
              attribution={SATELLITE_ATTRIBUTION}
              maxZoom={19}
            />
            <TileLayer
              key="satellite-labels-tiles"
              url={SATELLITE_LABELS}
              maxZoom={19}
              opacity={0.88}
            />
          </>
        )}

        {entities.map((entity) => (
          <Marker
            key={entity.id}
            position={[entity.latitude, entity.longitude]}
            icon={getEntityIcon(entity.status, entity.type, selectedId === entity.id)}
          >
            <Popup
              autoPan
              autoPanPaddingTopLeft={[80, 80]}
              autoPanPaddingBottomRight={[autoPanRight, autoPanBottom]}
            >
              <EntityPopupCard entity={entity} onSelect={onSelect} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating Map Style Switcher (Top Left) */}
      <MapStyleSwitcher
        currentStyle={mapStyle}
        onStyleChange={handleStyleChange}
        className="absolute left-3 top-3"
      />

      <div className="absolute right-3 top-3 z-[1000] flex flex-col overflow-hidden rounded-lg border border-border bg-card/90 shadow-lg backdrop-blur-sm">
        <ControlButton label={t("map.zoomIn")} disabled={!map} onClick={() => map?.zoomIn()}>
          <Plus className="size-4" />
        </ControlButton>
        <ControlButton
          label={t("map.zoomOut")}
          disabled={!map}
          onClick={() => map?.zoomOut()}
          withDivider
        >
          <Minus className="size-4" />
        </ControlButton>
        <ControlButton
          label={t("map.reset")}
          disabled={!map}
          withDivider
          onClick={() => map?.flyTo(JAKARTA_CENTER, INITIAL_ZOOM, { duration: 0.8 })}
        >
          <RotateCcw className="size-4" />
        </ControlButton>
      </div>

      <MapLegend className="absolute bottom-3 left-3 z-[1000]" />
    </div>
  );
}
