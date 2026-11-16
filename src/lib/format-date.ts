const eventDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  month: "short",
  timeZone: "UTC",
  timeZoneName: "short",
  year: "numeric",
});

const publicationDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
  year: "numeric",
});

const vietnameseEventDateParts = new Intl.DateTimeFormat("vi-VN", {
  day: "numeric",
  month: "numeric",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "Asia/Ho_Chi_Minh",
});

// Built from parts so the wording is the same on every runtime:
// "18:30, 4 tháng 9, 2099", always in Vietnam time.
const formatVietnameseEventDateTime = (date: Date) => {
  const parts = Object.fromEntries(
    vietnameseEventDateParts
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );

  return `${parts.hour}:${parts.minute}, ${parts.day} tháng ${parts.month}, ${parts.year}`;
};

const vietnamesePublicationDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Ho_Chi_Minh",
});

export const formatEventDateTime = (
  value: string,
  locale: "en" | "vi" = "en",
) =>
  locale === "vi"
    ? formatVietnameseEventDateTime(new Date(value))
    : eventDateFormatter.format(new Date(value));

export const formatPublicationDate = (
  value: string,
  locale: "en" | "vi" = "en",
) =>
  (locale === "vi"
    ? vietnamesePublicationDateFormatter
    : publicationDateFormatter
  ).format(new Date(value));
