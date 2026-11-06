import { describe, expect, it } from "vitest";
import { entityFormSchema } from "@/schemas/entitySchema";

describe("Entity Zod Schema Validation", () => {
  it("validates a correct entity object", () => {
    const validData = {
      code: "IOT-001",
      name: "Temperature Sensor - Sudirman",
      type: "iot_device",
      status: "active",
      description: "Sensor located at Sudirman intersection",
      latitude: -6.2088,
      longitude: 106.8456,
    };

    const result = entityFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("fails if entity code exceeds 30 characters", () => {
    const invalidData = {
      code: "THIS-IS-A-VERY-LONG-ENTITY-CODE-THAT-EXCEEDS-30-CHARS",
      name: "Sensor",
      type: "iot_device",
      status: "active",
      latitude: -6.2,
      longitude: 106.8,
    };

    const result = entityFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "code")).toBe(true);
    }
  });

  it("fails if entity name is shorter than 3 characters", () => {
    const invalidData = {
      code: "IOT-002",
      name: "AB",
      type: "iot_device",
      status: "active",
      latitude: -6.2,
      longitude: 106.8,
    };

    const result = entityFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("fails if latitude is out of [-90, 90] bounds", () => {
    const invalidData = {
      code: "IOT-003",
      name: "Sensor Out of Bounds",
      type: "iot_device",
      status: "active",
      latitude: 95.5,
      longitude: 106.8,
    };

    const result = entityFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("fails if longitude is out of [-180, 180] bounds", () => {
    const invalidData = {
      code: "IOT-004",
      name: "Sensor Out of Bounds",
      type: "iot_device",
      status: "active",
      latitude: -6.2,
      longitude: 195.2,
    };

    const result = entityFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("fails with invalid type or status", () => {
    const invalidData = {
      code: "IOT-005",
      name: "Invalid Sensor",
      type: "drone_unknown",
      status: "broken",
      latitude: -6.2,
      longitude: 106.8,
    };

    const result = entityFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
