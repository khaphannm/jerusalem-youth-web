import type { Event } from "@/lib/cms/domain";

export const buildEventStructuredData = (event: Event) => ({
  "@context": "https://schema.org",
  "@type": "Event",
  description: event.summary,
  image: [event.banner.url],
  location: {
    "@type": "Place",
    ...(event.address ? { address: event.address } : {}),
    name: event.locationName,
  },
  name: event.title,
  startDate: event.startDateTime,
  ...(event.endDateTime ? { endDate: event.endDateTime } : {}),
  ...(event.seo?.canonical
    ? {
        mainEntityOfPage: event.seo.canonical,
        url: event.seo.canonical,
      }
    : {}),
});
