import { minutesAgo } from "@/data/mockTime";
import type { ActivityEntry } from "@/types/entity";

const seeds: Array<Omit<ActivityEntry, "id" | "timestamp"> & { minutesAgo: number }> = [
  { kind: "status_changed", entityCode: "IOT-001", entityName: "Temperature Sensor - Sudirman", detail: "inactive -> active", minutesAgo: 8 },
  { kind: "updated", entityCode: "VEH-002", entityName: "Logistics Truck 07", minutesAgo: 24 },
  { kind: "created", entityCode: "IOT-013", entityName: "GPS Tracker - Cakung", minutesAgo: 41 },
  { kind: "status_changed", entityCode: "IOT-004", entityName: "Flood Sensor - Manggarai", detail: "active -> maintenance", minutesAgo: 62 },
  { kind: "updated", entityCode: "FAC-001", entityName: "Jakarta Main Facility", minutesAgo: 96 },
  { kind: "deleted", entityCode: "VEH-009", entityName: "Delivery Van - Cengkareng", minutesAgo: 140 },
  { kind: "created", entityCode: "INF-007", entityName: "Pump Station Controller - Penjaringan", minutesAgo: 210 },
  { kind: "status_changed", entityCode: "INF-003", entityName: "Smart Streetlight - Kelapa Gading", detail: "active -> inactive", minutesAgo: 300 },
  { kind: "updated", entityCode: "IOT-002", entityName: "Air Quality Sensor - Kemang", minutesAgo: 430 },
  { kind: "created", entityCode: "FAC-005", entityName: "Service Hub - Tebet", minutesAgo: 640 },
  { kind: "status_changed", entityCode: "VEH-001", entityName: "Operational Vehicle 01", detail: "active -> maintenance", minutesAgo: 905 },
  { kind: "deleted", entityCode: "IOT-011", entityName: "Noise Sensor - Grogol", minutesAgo: 1_280 },
  { kind: "updated", entityCode: "VEH-004", entityName: "Patrol Vehicle 12", minutesAgo: 1_500 },
  { kind: "created", entityCode: "IOT-006", entityName: "Humidity Sensor - Cengkareng", minutesAgo: 2_100 },
];

export const mockActivities: ActivityEntry[] = seeds.map((seed, i) => ({
  id: `act-${String(i + 1).padStart(3, "0")}`,
  kind: seed.kind,
  entityCode: seed.entityCode,
  entityName: seed.entityName,
  detail: seed.detail,
  timestamp: minutesAgo(seed.minutesAgo),
}));
