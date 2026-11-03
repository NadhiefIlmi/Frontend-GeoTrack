import type { EntityStatus, EntityType } from "@/types/entity";

export const STATUS_LABELS: Record<EntityStatus, "status.active" | "status.inactive" | "status.maintenance"> = {
  active: "status.active",
  inactive: "status.inactive",
  maintenance: "status.maintenance",
};

export const TYPE_LABELS: Record<EntityType, "type.vehicle" | "type.iot_device" | "type.facility" | "type.infrastructure"> = {
  vehicle: "type.vehicle",
  iot_device: "type.iot_device",
  facility: "type.facility",
  infrastructure: "type.infrastructure",
};
