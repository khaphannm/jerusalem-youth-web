import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/link-button";
import { Section } from "@/components/ui/section";

export default function StoryNotFound() {
  return (
    <main className="flex-1" id="main-content" tabIndex={-1}>
      <Section aria-labelledby="story-not-found-title" tone="calm">
        <Container size="reading">
          <p className="font-label text-label font-bold uppercase text-secondary">
            Stories
          </p>
          <h1
            className="mt-5 text-balance font-display text-display font-extrabold"
            id="story-not-found-title"
          >
            Story not found
          </h1>
          <p className="mt-6 text-pretty text-body-large text-calm-foreground">
            This story may have moved or may not be published. Browse the story
            library to find more moments from our community.
          </p>
          <div className="mt-8">
            <LinkButton href="/stories">Browse all stories</LinkButton>
          </div>
        </Container>
      </Section>
    </main>
  );
}
