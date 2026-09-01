import { describe, expect, it } from "vitest";

import { getEventStatus } from "@/features/events/dates";
import type { Event } from "@/lib/cms/domain";

const createEvent = (
  startDateTime: string,
  endDateTime: string | null,
): Event => ({
  id: "event-1",
  title: "Youth gathering",
  slug: "youth-gathering",
  summary: "A youth ministry gathering.",
  description: [],
  banner: {
    id: "banner-1",
    name: "gathering.jpg",
    url: "https://media.example.test/gathering.jpg",
    alternativeText: null,
    mimeType: "image/jpeg",
    width: 1_600,
    height: 900,
    sizeInKilobytes: 180,
    variants: [],
  },
  startDateTime,
  endDateTime,
  locationName: "Youth Hall",
  address: null,
  mapUrl: null,
  registrationUrl: null,
  registrationDeadline: null,
  contactName: null,
  contactLink: null,
  gallery: [],
  featured: false,
  seo: null,
  publishedAt: "2026-08-01T00:00:00.000Z",
});

describe("event status", () => {
  it("keeps a multi-time event upcoming through its exact end instant", () => {
    const event = createEvent(
      "2026-09-01T10:00:00.000Z",
      "2026-09-01T12:00:00.000Z",
    );

    expect(getEventStatus(event, new Date("2026-09-01T11:00:00.000Z"))).toBe(
      "upcoming",
    );
    expect(getEventStatus(event, new Date("2026-09-01T12:00:00.000Z"))).toBe(
      "upcoming",
    );
    expect(getEventStatus(event, new Date("2026-09-01T12:00:00.001Z"))).toBe(
      "past",
    );
  });

  it("uses the start instant as the end for a single-time event", () => {
    const event = createEvent("2026-09-01T10:00:00.000Z", null);

    expect(getEventStatus(event, new Date("2026-09-01T10:00:00.000Z"))).toBe(
      "upcoming",
    );
    expect(getEventStatus(event, new Date("2026-09-01T10:00:00.001Z"))).toBe(
      "past",
    );
  });

  it("compares explicit timezone offsets as the same UTC instant", () => {
    const event = createEvent(
      "2026-09-01T17:00:00.000+07:00",
      "2026-09-01T19:00:00.000+07:00",
    );

    expect(getEventStatus(event, new Date("2026-09-01T12:00:00.000Z"))).toBe(
      "upcoming",
    );
    expect(getEventStatus(event, new Date("2026-09-01T12:00:00.001Z"))).toBe(
      "past",
    );
  });

  it("handles an offset whose local calendar date differs from UTC", () => {
    const event = createEvent(
      "2026-09-02T00:00:00.000+07:00",
      "2026-09-02T00:30:00.000+07:00",
    );

    expect(getEventStatus(event, new Date("2026-09-01T17:30:00.000Z"))).toBe(
      "upcoming",
    );
    expect(getEventStatus(event, new Date("2026-09-01T17:30:00.001Z"))).toBe(
      "past",
    );
  });
});
