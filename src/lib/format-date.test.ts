import { describe, expect, it } from "vitest";
import { formatEventDateTime, formatPublicationDate } from "./format-date";

describe("localized content dates", () => {
  it("shows Vietnamese event times in Vietnam, crossing midnight correctly", () => {
    const formatted = formatEventDateTime("2026-11-15T18:00:00Z", "vi");
    expect(formatted).toContain("01:00");
    expect(formatted).toContain("16 tháng 11");
  });

  it("keeps the existing English UTC display for other pages", () => {
    expect(formatEventDateTime("2026-11-15T18:00:00Z")).toContain("UTC");
    expect(formatPublicationDate("2026-11-15")).toBe("November 15, 2026");
  });
});
