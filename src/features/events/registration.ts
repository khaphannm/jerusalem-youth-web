import { getEventStatus } from "@/features/events/dates";
import type { Event } from "@/lib/cms/domain";

export type EventRegistrationState =
  | Readonly<{
      deadline: string | null;
      kind: "open";
      registrationUrl: string;
    }>
  | Readonly<{
      deadline: string | null;
      kind: "closed";
      reason: "deadline-passed" | "event-ended";
    }>
  | Readonly<{
      deadline: string | null;
      kind: "unavailable";
    }>;

export function getEventRegistrationState(
  event: Event,
  now: Date,
): EventRegistrationState {
  const referenceTime = now.getTime();

  if (getEventStatus(event, now) === "past") {
    return {
      deadline: event.registrationDeadline,
      kind: "closed",
      reason: "event-ended",
    };
  }

  if (
    event.registrationDeadline &&
    Date.parse(event.registrationDeadline) < referenceTime
  ) {
    return {
      deadline: event.registrationDeadline,
      kind: "closed",
      reason: "deadline-passed",
    };
  }

  if (event.registrationUrl) {
    return {
      deadline: event.registrationDeadline,
      kind: "open",
      registrationUrl: event.registrationUrl,
    };
  }

  return {
    deadline: event.registrationDeadline,
    kind: "unavailable",
  };
}
