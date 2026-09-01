import type { Event } from "@/lib/cms/domain";

export type EventStatus = "past" | "upcoming";

export const getEventEffectiveEndTime = (event: Event) =>
  Date.parse(event.endDateTime ?? event.startDateTime);

export const getEventStatus = (event: Event, now: Date): EventStatus =>
  getEventEffectiveEndTime(event) < now.getTime() ? "past" : "upcoming";
