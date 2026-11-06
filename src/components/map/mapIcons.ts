import L from "leaflet";
import type { EntityStatus, EntityType } from "@/types/entity";

export const JAKARTA_CENTER: [number, number] = [-6.2088, 106.8456];
export const INITIAL_ZOOM = 12;

export const DARK_TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
export const DARK_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export const STANDARD_TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
export const STANDARD_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export const SATELLITE_TILES =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
export const SATELLITE_LABELS =
  "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";
export const SATELLITE_ATTRIBUTION =
  "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and GIS User Community";

const TYPE_SVGS: Record<EntityType, string> = {
  vehicle:
    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>',
  iot_device:
    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>',
  facility:
    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>',
  infrastructure:
    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/></svg>',
};

const STATUS_COLORS: Record<EntityStatus, { border: string; glow: string; pip: string }> = {
  active: { border: "#10b981", glow: "rgba(16, 185, 129, 0.4)", pip: "#10b981" },
  inactive: { border: "#64748b", glow: "rgba(100, 116, 139, 0.2)", pip: "#94a3b8" },
  maintenance: { border: "#f59e0b", glow: "rgba(245, 158, 11, 0.45)", pip: "#f59e0b" },
};

function entityIcon(
  status: EntityStatus,
  type: EntityType = "iot_device",
  selected = false,
): L.DivIcon {
  const sc = STATUS_COLORS[status] ?? STATUS_COLORS.active;
  const svg = TYPE_SVGS[type] ?? TYPE_SVGS.iot_device;

  const selectedStyles = selected
    ? "box-shadow: 0 0 0 3px #D56673, 0 0 16px rgba(213, 102, 115, 0.85); transform: scale(1.2); z-index: 1000;"
    : `box-shadow: 0 2px 8px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05);`;

  const html = `
    <div class="custom-entity-marker ${selected ? "custom-entity-marker--selected" : ""}" style="
      position: relative;
      width: 28px;
      height: 28px;
      border-radius: 9999px;
      background: #FFFFFF;
      border: 2px solid ${sc.border};
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${sc.border};
      transition: all 0.2s ease-in-out;
      cursor: pointer;
      ${selectedStyles}
    ">
      ${svg}
      <span style="
        position: absolute;
        top: -2px;
        right: -2px;
        width: 9px;
        height: 9px;
        border-radius: 9999px;
        background: ${sc.pip};
        border: 1.5px solid #FFFFFF;
      "></span>
    </div>
  `;

  return L.divIcon({
    className: "entity-custom-div-icon",
    html,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

const iconCache = new Map<string, L.DivIcon>();

export function getEntityIcon(
  status: EntityStatus,
  type: EntityType = "iot_device",
  selected = false,
): L.DivIcon {
  const key = `${status}:${type}:${selected}`;
  let icon = iconCache.get(key);
  if (!icon) {
    icon = entityIcon(status, type, selected);
    iconCache.set(key, icon);
  }
  return icon;
}

export function getPinIcon(): L.DivIcon {
  let icon = iconCache.get("pin");
  if (!icon) {
    icon = L.divIcon({
      className: "entity-marker",
      html: `
        <div style="
          width: 22px;
          height: 22px;
          border-radius: 9999px;
          background: #D56673;
          border: 3px solid #ffffff;
          box-shadow: 0 0 0 2px rgba(15,23,42,0.3), 0 0 12px rgba(213,102,115,0.8);
        "></div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });
    iconCache.set("pin", icon);
  }
  return icon;
}

export function roundCoord(value: number, digits = 6): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
