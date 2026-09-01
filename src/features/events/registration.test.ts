import { describe, expect, it } from "vitest";

import { getEventRegistrationState } from "@/features/events/registration";
import type { Event } from "@/lib/cms/domain";

const event = {
  startDateTime: "2026-09-01T10:00:00.000Z",
  endDateTime: "2026-09-01T12:00:00.000Z",
  registrationUrl: "https://register.example.test/gathering",
  registrationDeadline: "2026-08-31T12:00:00.000Z",
} as Event;

describe("event registration state", () => {
  it("keeps registration open through the configured deadline", () => {
    expect(
      getEventRegistrationState(
        event,
        new Date("2026-08-31T12:00:00.000Z"),
      ),
    ).toEqual({
      deadline: event.registrationDeadline,
      kind: "open",
      registrationUrl: event.registrationUrl,
    });
  });

  it("closes registration after the deadline", () => {
    expect(
      getEventRegistrationState(
        event,
        new Date("2026-08-31T12:00:00.001Z"),
      ),
    ).toEqual({
      deadline: event.registrationDeadline,
      kind: "closed",
      reason: "deadline-passed",
    });
  });

  it("closes registration after the event ends", () => {
    expect(
      getEventRegistrationState(
        { ...event, registrationDeadline: null },
        new Date("2026-09-01T12:00:00.001Z"),
      ),
    ).toEqual({
      deadline: null,
      kind: "closed",
      reason: "event-ended",
    });
  });

  it("uses the start as the effective end for a single-time event", () => {
    expect(
      getEventRegistrationState(
        { ...event, endDateTime: null, registrationDeadline: null },
        new Date("2026-09-01T10:00:00.001Z"),
      ),
    ).toMatchObject({
      kind: "closed",
      reason: "event-ended",
    });
  });

  it("does not offer registration without a configured URL", () => {
    expect(
      getEventRegistrationState(
        { ...event, registrationUrl: null },
        new Date("2026-08-30T12:00:00.000Z"),
      ),
    ).toEqual({
      deadline: event.registrationDeadline,
      kind: "unavailable",
    });
  });
});
