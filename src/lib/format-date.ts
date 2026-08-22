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

export const formatEventDateTime = (value: string) =>
  eventDateFormatter.format(new Date(value));

export const formatPublicationDate = (value: string) =>
  publicationDateFormatter.format(new Date(value));
