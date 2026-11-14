import type { EventStatus } from "@/features/events/dates";

const statusContent = {
  past: {
    classes: "border border-border bg-surface text-foreground",
    label: "Past event",
  },
  upcoming: {
    classes: "bg-accent text-accent-foreground",
    label: "Upcoming",
  },
} as const satisfies Record<
  EventStatus,
  Readonly<{ classes: string; label: string }>
>;

export function EventStatusBadge({
  status,
  locale = "en",
}: Readonly<{ status: EventStatus; locale?: "en" | "vi" }>) {
  const content = statusContent[status];

  return (
    <p
      className={`w-fit rounded-small px-2 py-1 font-label text-label font-bold uppercase ${content.classes}`}
    >
      <span className="sr-only">
        {locale === "vi" ? "Trạng thái: " : "Event status: "}
      </span>
      {locale === "vi"
        ? status === "upcoming"
          ? "Sắp diễn ra"
          : "Đã diễn ra"
        : content.label}
    </p>
  );
}
