import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import {
  DARK_ATTRIBUTION,
  DARK_TILES,
  JAKARTA_CENTER,
  getPinIcon,
  roundCoord,
} from "./mapIcons";

export interface MapPickerProps {
  lat: number | null;
  lng: number | null;
  readOnly?: boolean;
  onChange?: (lat: number, lng: number) => void;
}

function ClickHandler({ readOnly, onChange }: Pick<MapPickerProps, "readOnly" | "onChange">) {
  useMapEvents({
    click: (event) => {
      if (readOnly) return;
      onChange?.(roundCoord(event.latlng.lat), roundCoord(event.latlng.lng));
    },
  });
  return null;
}

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.panTo([lat, lng], { animate: true });
  }, [lat, lng, map]);
  return null;
}

export default function MapPickerInner({ lat, lng, readOnly, onChange }: MapPickerProps) {
  const hasPosition = lat !== null && lng !== null;
  const center: [number, number] = hasPosition ? [lat, lng] : JAKARTA_CENTER;
  const interactive = !readOnly;

  return (
    <MapContainer
      center={center}
      zoom={13}
      zoomControl={false}
      attributionControl={false}
      dragging={interactive}
      scrollWheelZoom={false}
      doubleClickZoom={interactive}
      touchZoom={interactive}
      keyboard={interactive}
      className="z-0 h-full w-full"
    >
      <TileLayer url={DARK_TILES} attribution={DARK_ATTRIBUTION} />
      <ClickHandler readOnly={readOnly} onChange={onChange} />
      {hasPosition && <Recenter lat={lat} lng={lng} />}
      {hasPosition && <Marker position={[lat, lng]} icon={getPinIcon()} interactive={false} />}
    </MapContainer>
  );
}
