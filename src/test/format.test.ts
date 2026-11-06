import { describe, expect, it } from "vitest";
import { relativeTime, formatDateTime, formatCoord } from "@/lib/format";

describe("Date formatting utilities (date-fns)", () => {
  it("formats relative time ago correctly in English", () => {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const formatted = relativeTime(tenMinutesAgo, "en");
    expect(formatted).toMatch(/minute|ago/i);
  });

  it("formats relative time ago correctly in Indonesian", () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const formatted = relativeTime(twoHoursAgo, "id");
    expect(formatted).toMatch(/jam|lalu/i);
  });

  it("formats absolute date time", () => {
    const testDate = "2026-11-05T09:00:00.000Z";
    const formatted = formatDateTime(testDate, "en");
    expect(typeof formatted).toBe("string");
    expect(formatted.length).toBeGreaterThan(0);
  });

  it("formats coordinates to 5 decimal places", () => {
    expect(formatCoord(-6.2087654)).toBe("-6.20877");
  });
});
