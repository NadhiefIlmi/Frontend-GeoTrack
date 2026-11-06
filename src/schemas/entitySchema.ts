import { z } from "zod";

export const entityTypeEnum = z.enum(["vehicle", "iot_device", "facility", "infrastructure"]);

export const entityStatusEnum = z.enum(["active", "inactive", "maintenance"]);

export const entityFormSchema = z.object({
  code: z
    .string()
    .min(1, "err.code")
    .max(30, "Code must be at most 30 characters")
    .regex(/^[A-Za-z0-9_-]+$/, "Code must contain only letters, numbers, hyphens, and underscores"),
  name: z.string().min(3, "err.name").max(100, "Name must be between 3 and 100 characters"),
  type: entityTypeEnum,
  status: entityStatusEnum,
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .optional()
    .default(""),
  latitude: z.number({ invalid_type_error: "err.lat" }).min(-90, "err.lat").max(90, "err.lat"),
  longitude: z.number({ invalid_type_error: "err.lng" }).min(-180, "err.lng").max(180, "err.lng"),
});

export type EntityFormValues = z.infer<typeof entityFormSchema>;
