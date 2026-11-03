import type { Entity, EntityStatus, EntityType } from "@/types/entity";

const now = Date.now();
const minutesAgo = (m: number) => new Date(now - m * 60_000).toISOString();

interface Seed {
  code: string;
  name: string;
  type: EntityType;
  description: string;
  status: EntityStatus;
  lat: number;
  lng: number;
  updatedMinutesAgo: number;
}

/** Hand-crafted seed entities covering the five regions of Jakarta. */
const curated: Seed[] = [
  { code: "IOT-001", name: "Temperature Sensor - Sudirman", type: "iot_device", description: "Temperature monitoring sensor.", status: "active", lat: -6.2088, lng: 106.8456, updatedMinutesAgo: 12 },
  { code: "VEH-001", name: "Operational Vehicle 01", type: "vehicle", description: "Company operational vehicle.", status: "maintenance", lat: -6.2297, lng: 106.8295, updatedMinutesAgo: 95 },
  { code: "FAC-001", name: "Jakarta Main Facility", type: "facility", description: "Main operational facility.", status: "active", lat: -6.1754, lng: 106.8272, updatedMinutesAgo: 240 },
  { code: "INF-001", name: "Fiber Optic Node - Thamrin", type: "infrastructure", description: "Backbone fiber distribution node.", status: "active", lat: -6.2015, lng: 106.831, updatedMinutesAgo: 60 },
  { code: "IOT-002", name: "Air Quality Sensor - Kemang", type: "iot_device", description: "Air quality monitoring station.", status: "active", lat: -6.276, lng: 106.817, updatedMinutesAgo: 35 },
  { code: "VEH-002", name: "Logistics Truck 07", type: "vehicle", description: "North route logistics truck.", status: "active", lat: -6.143, lng: 106.839, updatedMinutesAgo: 4 },
  { code: "IOT-003", name: "Water Level Sensor - Pluit", type: "iot_device", description: "Flood early-warning water sensor.", status: "inactive", lat: -6.115, lng: 106.799, updatedMinutesAgo: 1440 },
  { code: "FAC-002", name: "West Jakarta Depot", type: "facility", description: "Vehicle fleet depot and workshop.", status: "active", lat: -6.168, lng: 106.74, updatedMinutesAgo: 420 },
  { code: "INF-002", name: "Traffic Camera - Semanggi", type: "infrastructure", description: "Adaptive traffic camera unit.", status: "active", lat: -6.2215, lng: 106.814, updatedMinutesAgo: 18 },
  { code: "VEH-003", name: "Operational Vehicle 03", type: "vehicle", description: "East division patrol car.", status: "inactive", lat: -6.26, lng: 106.88, updatedMinutesAgo: 2880 },
  { code: "IOT-004", name: "Flood Sensor - Manggarai", type: "iot_device", description: "River gate water level sensor.", status: "maintenance", lat: -6.209, lng: 106.856, updatedMinutesAgo: 150 },
  { code: "FAC-003", name: "East Jakarta Warehouse", type: "facility", description: "Distribution warehouse.", status: "active", lat: -6.225, lng: 106.9, updatedMinutesAgo: 600 },
  { code: "IOT-005", name: "GPS Tracker - Bekasi Route", type: "iot_device", description: "Mobile asset GPS tracker.", status: "active", lat: -6.238, lng: 106.935, updatedMinutesAgo: 2 },
  { code: "INF-003", name: "Smart Streetlight - Kelapa Gading", type: "infrastructure", description: "Remote-controlled streetlight bank.", status: "inactive", lat: -6.158, lng: 106.905, updatedMinutesAgo: 4320 },
  { code: "VEH-004", name: "Patrol Vehicle 12", type: "vehicle", description: "West region patrol vehicle.", status: "active", lat: -6.19, lng: 106.79, updatedMinutesAgo: 7 },
  { code: "IOT-006", name: "Humidity Sensor - Cengkareng", type: "iot_device", description: "Warehouse humidity monitor.", status: "inactive", lat: -6.145, lng: 106.74, updatedMinutesAgo: 2010 },
];

/** Exactly 25 active, 8 inactive, 2 maintenance for the generated set. */
const generatedStatuses: EntityStatus[] = [
  "active", "inactive", "active", "active", "maintenance", "active", "inactive", "active", "active", "inactive",
  "active", "maintenance", "active", "active", "inactive", "active", "active", "inactive", "active", "active",
  "inactive", "active", "active", "inactive", "active", "active", "active", "active", "active", "inactive",
  "active", "active", "active", "active", "active",
];

const spots = [
  { area: "Kuningan", lat: -6.224, lng: 106.832 },
  { area: "Kemayoran", lat: -6.158, lng: 106.856 },
  { area: "Tebet", lat: -6.24, lng: 106.838 },
  { area: "Cempaka Putih", lat: -6.178, lng: 106.852 },
  { area: "Penjaringan", lat: -6.118, lng: 106.794 },
  { area: "Kebayoran Baru", lat: -6.238, lng: 106.799 },
  { area: "Ciracas", lat: -6.339, lng: 106.885 },
  { area: "Cengkareng", lat: -6.148, lng: 106.732 },
  { area: "Pasar Minggu", lat: -6.284, lng: 106.842 },
  { area: "Pulo Gadung", lat: -6.186, lng: 106.898 },
  { area: "Taman Sari", lat: -6.135, lng: 106.778 },
  { area: "Mampang", lat: -6.244, lng: 106.828 },
  { area: "Cilincing", lat: -6.108, lng: 106.885 },
  { area: "Kebon Jeruk", lat: -6.188, lng: 106.76 },
  { area: "Setiabudi", lat: -6.213, lng: 106.829 },
  { area: "Matraman", lat: -6.205, lng: 106.864 },
  { area: "Cakung", lat: -6.172, lng: 106.945 },
  { area: "Grogol", lat: -6.168, lng: 106.79 },
];

const namePools: Record<EntityType, string[]> = {
  vehicle: ["Operational Vehicle", "Logistics Truck", "Patrol Vehicle", "Delivery Van"],
  iot_device: ["Vibration Sensor", "Air Quality Sensor", "Water Level Sensor", "Noise Sensor", "GPS Tracker", "Temperature Sensor", "Smart Meter", "Humidity Sensor"],
  facility: ["Operations Facility", "Service Hub", "Warehouse", "Depot"],
  infrastructure: ["Traffic Camera", "Smart Streetlight", "Fiber Optic Node", "Cell Tower Monitor", "Pump Station Controller"],
};

const typeOrder: EntityType[] = ["vehicle", "iot_device", "facility", "infrastructure"];

function buildEntities(): Entity[] {
  const counters: Record<EntityType, number> = { vehicle: 4, iot_device: 6, facility: 3, infrastructure: 3 };
  const list: Entity[] = curated.map((seed, i) => ({
    id: `ent-${String(i + 1).padStart(3, "0")}`,
    code: seed.code,
    name: seed.name,
    type: seed.type,
    description: seed.description,
    status: seed.status,
    latitude: seed.lat,
    longitude: seed.lng,
    createdAt: minutesAgo(seed.updatedMinutesAgo + 40_000 + i * 350),
    updatedAt: minutesAgo(seed.updatedMinutesAgo),
  }));

  generatedStatuses.forEach((status, i) => {
    const type = typeOrder[i % 4];
    const pool = namePools[type];
    const spot = spots[(i * 5) % spots.length];
    const jitterLat = (((i * 7) % 13) - 6) * 0.0011;
    const jitterLng = (((i * 11) % 17) - 8) * 0.0013;
    counters[type] += 1;
    const prefix = type === "vehicle" ? "VEH" : type === "iot_device" ? "IOT" : type === "facility" ? "FAC" : "INF";
    const updatedMinutesAgo = 5 + ((i * 137) % 2_880);
    list.push({
      id: `ent-${String(list.length + 1).padStart(3, "0")}`,
      code: `${prefix}-${String(counters[type]).padStart(3, "0")}`,
      name: `${pool[i % pool.length]} - ${spot.area}`,
      type,
      description: `${pool[i % pool.length]} deployed in ${spot.area}, Jakarta.`,
      status,
      latitude: Number((spot.lat + jitterLat).toFixed(4)),
      longitude: Number((spot.lng + jitterLng).toFixed(4)),
      createdAt: minutesAgo(updatedMinutesAgo + 50_000 + i * 700),
      updatedAt: minutesAgo(updatedMinutesAgo),
    });
  });

  return list;
}

export const mockEntities: Entity[] = buildEntities();
