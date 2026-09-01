import type { Metadata } from "next";

import { EventCard } from "@/components/content/event-card";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/link-button";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/config/site";
import {
  loadEventListing,
  loadEventSiteSettings,
} from "@/features/events/data";
import type { EventStatus } from "@/features/events/dates";
import type { Event } from "@/lib/cms/domain";

const listingDescription =
  "Find upcoming youth ministry gatherings, see when and where we meet, and revisit past events.";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await loadEventSiteSettings();
  const siteName = settings?.siteName ?? siteConfig.name;
  const socialTitle = `Events | ${siteName}`;
  const socialImage =
    settings?.defaultSeo?.socialImage ?? settings?.defaultSocialImage;
  const image = socialImage
    ? {
        alt: socialImage.alternativeText ?? socialTitle,
        height: socialImage.height ?? undefined,
        url: socialImage.url,
        width: socialImage.width ?? undefined,
      }
    : undefined;

  return {
    description: listingDescription,
    openGraph: {
      description: listingDescription,
      images: image ? [image] : undefined,
      siteName,
      title: socialTitle,
      type: "website",
    },
    robots: settings?.defaultSeo?.noIndex
      ? { follow: true, index: false }
      : undefined,
    title: "Events",
    twitter: {
      card: image ? "summary_large_image" : "summary",
      description: listingDescription,
      images: image ? [image.url] : undefined,
      title: socialTitle,
    },
  };
}

function EventGrid({
  events,
  status,
}: Readonly<{ events: readonly Event[]; status: EventStatus }>) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <li className="h-full" key={event.id}>
          <EventCard event={event} status={status} />
        </li>
      ))}
    </ul>
  );
}

export default async function EventsPage() {
  const listing = await loadEventListing();

  return (
    <main className="flex-1" id="main-content" tabIndex={-1}>
      <Section aria-labelledby="events-title" tone="surface">
        <Container size="wide">
          <div className="max-w-reading">
            <p className="font-label text-label font-bold uppercase text-accent">
              Gather with us
            </p>
            <h1
              className="mt-5 text-balance font-display text-display font-extrabold"
              id="events-title"
            >
              Events worth showing up for
            </h1>
            <p className="mt-6 text-pretty text-body-large text-muted">
              Find the next gathering, make plans with friends, and see where
              our community has been. All event times are shown in UTC.
            </p>
          </div>
        </Container>
      </Section>

      <Section aria-labelledby="upcoming-events-list-title" tone="white">
        <Container size="wide">
          <SectionHeading
            description={
              listing.status === "ready"
                ? `${listing.groups.upcoming.length} ${
                    listing.groups.upcoming.length === 1 ? "event" : "events"
                  }, ordered by date and time.`
                : "Published events will appear here when the connection is restored."
            }
            eyebrow="Coming up"
            id="upcoming-events-list-title"
            tone="white"
            title="Upcoming events"
          />
          <div className="mt-10">
            {listing.status === "error" ? (
              <EmptyState
                action={<LinkButton href="/events">Try again</LinkButton>}
                description="We could not load the events right now. Please try again in a little while."
                title="Events are temporarily unavailable"
              />
            ) : listing.groups.upcoming.length > 0 ? (
              <EventGrid events={listing.groups.upcoming} status="upcoming" />
            ) : (
              <EmptyState
                description="There are no upcoming dates to share right now. New gatherings will appear here when they are published."
                title="The next event is on the way"
              />
            )}
          </div>
        </Container>
      </Section>

      {listing.status === "ready" ? (
        <Section aria-labelledby="past-events-list-title" tone="surface">
          <Container size="wide">
            <SectionHeading
              description={`${listing.groups.past.length} ${
                listing.groups.past.length === 1 ? "event" : "events"
              }, most recent first.`}
              eyebrow="From the archive"
              id="past-events-list-title"
              tone="surface"
              title="Past events"
            />
            <div className="mt-10">
              {listing.groups.past.length > 0 ? (
                <EventGrid events={listing.groups.past} status="past" />
              ) : (
                <EmptyState
                  description="Past gatherings will collect here after their dates have passed."
                  title="No past events yet"
                />
              )}
            </div>
          </Container>
        </Section>
      ) : null}
    </main>
  );
}
