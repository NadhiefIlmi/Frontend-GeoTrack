import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { LayersControl, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { StatusBadge } from "@/components/entities/StatusBadge";
import { TYPE_LABELS } from "@/components/entities/labels";
import { MapLegend } from "./MapLegend";
import {
  DARK_ATTRIBUTION,
  DARK_TILES,
  INITIAL_ZOOM,
  JAKARTA_CENTER,
  STANDARD_ATTRIBUTION,
  STANDARD_TILES,
  getEntityIcon,
} from "./mapIcons";
import { useLanguage } from "@/i18n/language";
import type { EntityMapProps } from "./LazyEntityMap";

function MapInstanceSetter({ onReady }: { onReady: (map: L.Map) => void }) {
  const map = useMap();
  useEffect(() => {
    onReady(map);
  }, [map, onReady]);
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

function PopupActions({ entityId, onSelect }: { entityId: string; onSelect?: (id: string) => void }) {
  const { t } = useLanguage();
  const map = useMap();
  return (
    <button
      type="button"
      onClick={() => {
        onSelect?.(entityId);
        map.closePopup();
      }}
      className="mt-2 inline-flex w-full items-center justify-center rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
    >
      {t("action.viewDetails")}
    </button>
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

export default function EntityMapInner({ entities, selectedId, onSelect, focus }: EntityMapProps) {
  const { t } = useLanguage();
  const [map, setMap] = useState<L.Map | null>(null);

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={JAKARTA_CENTER}
        zoom={INITIAL_ZOOM}
        zoomControl={false}
        scrollWheelZoom
        className="z-0 h-full w-full"
      >
        <MapInstanceSetter onReady={setMap} />
        <FocusHandler focus={focus} />

        <LayersControl position="topleft">
          <LayersControl.BaseLayer checked name={t("map.dark")}>
            <TileLayer url={DARK_TILES} attribution={DARK_ATTRIBUTION} />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name={t("map.standard")}>
            <TileLayer url={STANDARD_TILES} attribution={STANDARD_ATTRIBUTION} />
          </LayersControl.BaseLayer>
        </LayersControl>

        {entities.map((entity) => (
          <Marker
            key={entity.id}
            position={[entity.latitude, entity.longitude]}
            icon={getEntityIcon(entity.status, selectedId === entity.id)}
            eventHandlers={{ click: () => onSelect?.(entity.id) }}
          >
            <Popup>
              <div className="min-w-44 space-y-1.5">
                <p className="font-display text-[13px] font-semibold leading-snug text-foreground">{entity.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {entity.code} · {t(TYPE_LABELS[entity.type])}
                </p>
                <StatusBadge status={entity.status} />
                <PopupActions entityId={entity.id} onSelect={onSelect} />
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="absolute right-3 top-3 z-[1000] flex flex-col overflow-hidden rounded-lg border border-border bg-card/90 shadow-lg backdrop-blur-sm">
        <ControlButton label={t("map.zoomIn")} disabled={!map} onClick={() => map?.zoomIn()}>
          <Plus className="size-4" />
        </ControlButton>
        <ControlButton label={t("map.zoomOut")} disabled={!map} onClick={() => map?.zoomOut()} withDivider>
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
