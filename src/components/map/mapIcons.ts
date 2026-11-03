import L from "leaflet";
import type { EntityStatus } from "@/types/entity";

export const JAKARTA_CENTER: [number, number] = [-6.2, 106.8456];
export const INITIAL_ZOOM = 12;

export const DARK_TILES =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
export const DARK_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>';

export const STANDARD_TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
export const STANDARD_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

function entityIcon(status: EntityStatus, selected: boolean): L.DivIcon {
  return L.divIcon({
    className: "entity-marker",
    html: `<span class="marker-dot marker-dot--${status}${selected ? " marker-dot--selected" : ""}"></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -8],
  });
}

const iconCache = new Map<string, L.DivIcon>();

export function getEntityIcon(status: EntityStatus, selected = false): L.DivIcon {
  const key = `${status}:${selected}`;
  let icon = iconCache.get(key);
  if (!icon) {
    icon = entityIcon(status, selected);
    iconCache.set(key, icon);
  }
  return icon;
}

export function getPinIcon(): L.DivIcon {
  let icon = iconCache.get("pin");
  if (!icon) {
    icon = L.divIcon({
      className: "entity-marker",
      html: '<span class="marker-dot marker-dot--pin"></span>',
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });
    iconCache.set("pin", icon);
  }
  return icon;
}

export function roundCoord(value: number, digits = 6): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
