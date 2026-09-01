import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/link-button";
import { Section } from "@/components/ui/section";

export default function EventNotFound() {
  return (
    <main className="flex-1" id="main-content" tabIndex={-1}>
      <Section aria-labelledby="event-not-found-title" tone="surface">
        <Container size="reading">
          <p className="font-label text-label font-bold uppercase text-accent">
            Events
          </p>
          <h1
            className="mt-5 text-balance font-display text-display font-extrabold"
            id="event-not-found-title"
          >
            Event not found
          </h1>
          <p className="mt-6 text-pretty text-body-large text-muted">
            This event may have moved or may not be published. Browse the event
            calendar to find the next gathering.
          </p>
          <div className="mt-8">
            <LinkButton href="/events">Browse all events</LinkButton>
          </div>
        </Container>
      </Section>
    </main>
  );
}
