export type EntityType = "vehicle" | "iot_device" | "facility" | "infrastructure";

export type EntityStatus = "active" | "inactive" | "maintenance";

export interface Entity {
  id: string;
  code: string;
  name: string;
  type: EntityType;
  description: string;
  status: EntityStatus;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
}

export type ActivityKind = "created" | "updated" | "status_changed" | "deleted";

export interface ActivityEntry {
  id: string;
  kind: ActivityKind;
  entityCode: string;
  entityName: string;
  /** Extra context, e.g. "active -> inactive" for status changes. */
  detail?: string;
  timestamp: string;
}

export const ENTITY_TYPES: EntityType[] = ["vehicle", "iot_device", "facility", "infrastructure"];
export const ENTITY_STATUSES: EntityStatus[] = ["active", "inactive", "maintenance"];
