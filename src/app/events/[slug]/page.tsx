import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { RichText } from "@/components/content/rich-text";
import { Container } from "@/components/ui/container";
import { ContentImage } from "@/components/ui/content-image";
import { LinkButton } from "@/components/ui/link-button";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { loadEventDetail } from "@/features/events/data";
import { getEventStatus } from "@/features/events/dates";
import { EventStatusBadge } from "@/features/events/event-status-badge";
import { getEventRegistrationState } from "@/features/events/registration";
import { RegistrationPanel } from "@/features/events/registration-panel";
import { buildEventStructuredData } from "@/features/events/structured-data";
import type { Event } from "@/lib/cms/domain";
import { formatEventDateTime } from "@/lib/format-date";
import { serializeStructuredData } from "@/lib/seo/structured-data";

type EventPageProps = Readonly<{
  params: Promise<{ slug: string }>;
}>;

const metadataImage = (event: Event, title: string) => {
  const image = event.seo?.socialImage ?? event.banner;

  return {
    alt: image.alternativeText ?? title,
    height: image.height ?? undefined,
    url: image.url,
    width: image.width ?? undefined,
  };
};

export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await loadEventDetail(slug);

  if (result.status === "not-found") {
    return {
      description: "The requested event could not be found.",
      robots: { follow: false, index: false },
      title: "Event not found",
    };
  }

  if (result.status === "error") {
    return {
      description: "Find youth ministry gatherings and community events.",
      robots: { follow: false, index: false },
      title: "Event",
    };
  }

  const { event } = result;
  const title = event.seo?.metaTitle ?? event.title;
  const description = event.seo?.metaDescription ?? event.summary;
  const image = metadataImage(event, title);
  const canonical = event.seo?.canonical ?? undefined;

  return {
    alternates: canonical ? { canonical } : undefined,
    description,
    openGraph: {
      description,
      images: [image],
      title,
      type: "website",
      url: canonical,
    },
    robots: event.seo?.noIndex
      ? { follow: true, index: false }
      : undefined,
    title,
    twitter: {
      card: "summary_large_image",
      description,
      images: [image.url],
      title,
    },
  };
}

function EventErrorState() {
  return (
    <main className="flex-1" id="main-content" tabIndex={-1}>
      <Section aria-labelledby="event-error-title" tone="surface">
        <Container size="reading">
          <p className="font-label text-label font-bold uppercase text-accent">
            Events
          </p>
          <h1
            className="mt-5 text-balance font-display text-display font-extrabold"
            id="event-error-title"
          >
            This event is temporarily unavailable
          </h1>
          <p className="mt-6 text-pretty text-body-large text-muted">
            We could not load the event right now. Please return to the event
            calendar and try again in a little while.
          </p>
          <div className="mt-8">
            <LinkButton href="/events">Browse all events</LinkButton>
          </div>
        </Container>
      </Section>
    </main>
  );
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const result = await loadEventDetail(slug);

  if (result.status === "not-found") {
    notFound();
  }

  if (result.status === "error") {
    return <EventErrorState />;
  }

  const { event } = result;
  const now = new Date();
  const eventStatus = getEventStatus(event, now);
  const registrationState = getEventRegistrationState(event, now);

  return (
    <main className="flex-1" id="main-content" tabIndex={-1}>
      <article>
        <script
          dangerouslySetInnerHTML={{
            __html: serializeStructuredData(buildEventStructuredData(event)),
          }}
          type="application/ld+json"
        />

        <Section aria-labelledby="event-title" tone="secondary">
          <Container size="reading">
            <Link
              className="inline-flex min-h-11 items-center rounded-small py-2 font-label text-label font-bold text-calm transition-colors duration-fast ease-standard hover:text-primary-foreground motion-reduce:transition-none"
              href="/events"
            >
              <span aria-hidden="true">←</span>
              All events
            </Link>
            <div className="mt-8">
              <EventStatusBadge status={eventStatus} />
            </div>
            <h1
              className="mt-5 text-balance font-display text-display font-extrabold"
              id="event-title"
            >
              {event.title}
            </h1>
            <p className="mt-6 text-pretty text-body-large text-secondary-foreground">
              {event.summary}
            </p>
          </Container>
        </Section>

        <Section aria-label="Event banner" spacing="compact" tone="white">
          <Container size="wide">
            <div className="overflow-hidden rounded-large border border-border bg-surface">
              <ContentImage
                asset={event.banner}
                className="aspect-[16/9] h-auto w-full object-cover"
                sizes="(min-width: 1280px) 1152px, 100vw"
              />
            </div>
          </Container>
        </Section>

        <Section aria-label="Event information" tone="white">
          <Container size="wide">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
              <div>
                <h2 className="font-heading text-heading-2 font-bold">
                  About this event
                </h2>
                <div className="mt-8">
                  <RichText content={event.description} />
                </div>
              </div>

              <div className="space-y-6">
                <aside
                  aria-labelledby="event-practical-details-title"
                  className="rounded-medium border border-border bg-background p-6 sm:p-8"
                >
                  <h2
                    className="font-heading text-heading-3 font-bold"
                    id="event-practical-details-title"
                  >
                    When and where
                  </h2>
                  <dl className="mt-6 space-y-6">
                    <div>
                      <dt className="font-label text-label font-bold uppercase text-primary">
                        Date and time
                      </dt>
                      <dd className="mt-2 text-body-small text-muted">
                        <time dateTime={event.startDateTime}>
                          {formatEventDateTime(event.startDateTime)}
                        </time>
                        {event.endDateTime ? (
                          <>
                            {" – "}
                            <time dateTime={event.endDateTime}>
                              {formatEventDateTime(event.endDateTime)}
                            </time>
                          </>
                        ) : null}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-label text-label font-bold uppercase text-primary">
                        Location
                      </dt>
                      <dd className="mt-2 font-semibold">
                        {event.locationName}
                      </dd>
                      {event.address ? (
                        <dd className="mt-1 whitespace-pre-line text-body-small text-muted">
                          {event.address}
                        </dd>
                      ) : null}
                    </div>
                    {event.contactName ? (
                      <div>
                        <dt className="font-label text-label font-bold uppercase text-primary">
                          Contact
                        </dt>
                        <dd className="mt-2 text-body-small text-muted">
                          {event.contactName}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                  {event.mapUrl || event.contactLink ? (
                    <div className="mt-6 flex flex-wrap gap-3">
                      {event.mapUrl ? (
                        <LinkButton href={event.mapUrl} variant="outline">
                          View map
                        </LinkButton>
                      ) : null}
                      {event.contactLink ? (
                        <LinkButton href={event.contactLink} variant="outline">
                          Contact {event.contactName ?? "event team"}
                        </LinkButton>
                      ) : null}
                    </div>
                  ) : null}
                </aside>

                <RegistrationPanel state={registrationState} />
              </div>
            </div>
          </Container>
        </Section>

        {event.gallery.length > 0 ? (
          <Section aria-labelledby="event-gallery-title" tone="surface">
            <Container size="wide">
              <SectionHeading
                description="More moments and details from this gathering."
                eyebrow="Event gallery"
                id="event-gallery-title"
                tone="surface"
                title="A closer look"
              />
              <ul className="mt-10 grid gap-6 sm:grid-cols-2">
                {event.gallery.map((image) => (
                  <li
                    className="overflow-hidden rounded-medium border border-border bg-background"
                    key={image.id}
                  >
                    <ContentImage
                      asset={image}
                      className="aspect-[4/3] h-full w-full object-cover"
                      sizes="(min-width: 640px) 50vw, 100vw"
                    />
                  </li>
                ))}
              </ul>
            </Container>
          </Section>
        ) : null}
      </article>

      <Section aria-labelledby="event-next-title" tone="secondary">
        <Container size="reading">
          <SectionHeading
            description="Find another gathering and make plans to join the community."
            eyebrow="Keep gathering"
            id="event-next-title"
            tone="secondary"
            title="Explore more events"
          />
          <div className="mt-8">
            <LinkButton href="/events">Browse all events</LinkButton>
          </div>
        </Container>
      </Section>
    </main>
  );
}
