import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/link-button";
import { Section } from "@/components/ui/section";

export default function ResourceNotFound() {
  return (
    <main className="flex-1" id="main-content" tabIndex={-1}>
      <Section aria-labelledby="resource-not-found-title" tone="surface">
        <Container size="reading">
          <p className="font-label text-label font-bold uppercase text-primary">
            Resources
          </p>
          <h1
            className="mt-5 text-balance font-display text-display font-extrabold"
            id="resource-not-found-title"
          >
            Resource not found
          </h1>
          <p className="mt-6 text-pretty text-body-large text-muted">
            This resource may have moved or may not be published. Browse the
            resource library to find another helpful guide or link.
          </p>
          <div className="mt-8">
            <LinkButton href="/resources">Browse all resources</LinkButton>
          </div>
        </Container>
      </Section>
    </main>
  );
}
