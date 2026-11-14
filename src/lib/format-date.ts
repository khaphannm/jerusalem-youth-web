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

const vietnameseEventDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Ho_Chi_Minh",
  timeZoneName: "short",
});

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
  (locale === "vi" ? vietnameseEventDateFormatter : eventDateFormatter).format(
    new Date(value),
  );

export const formatPublicationDate = (
  value: string,
  locale: "en" | "vi" = "en",
) =>
  (locale === "vi"
    ? vietnamesePublicationDateFormatter
    : publicationDateFormatter
  ).format(new Date(value));
