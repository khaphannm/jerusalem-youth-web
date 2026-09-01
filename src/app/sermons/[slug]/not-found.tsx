import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/link-button";
import { Section } from "@/components/ui/section";

export default function SermonNotFound() {
  return (
    <main className="flex-1" id="main-content" tabIndex={-1}>
      <Section aria-labelledby="sermon-not-found-title" tone="surface">
        <Container size="reading">
          <p className="font-label text-label font-bold uppercase text-primary">
            Sermons
          </p>
          <h1
            className="mt-5 text-balance font-display text-display font-extrabold"
            id="sermon-not-found-title"
          >
            Sermon not found
          </h1>
          <p className="mt-6 text-pretty text-body-large text-muted">
            This sermon may have moved or may not be published. Browse the
            sermon library to find another message.
          </p>
          <div className="mt-8">
            <LinkButton href="/sermons">Browse all sermons</LinkButton>
          </div>
        </Container>
      </Section>
    </main>
  );
}
