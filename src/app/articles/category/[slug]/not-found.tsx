import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/link-button";
import { Section } from "@/components/ui/section";

export default function ArticleCategoryNotFound() {
  return (
    <main className="flex-1" id="main-content" tabIndex={-1}>
      <Section aria-labelledby="category-not-found-title" tone="calm">
        <Container size="reading">
          <p className="font-label text-label font-bold uppercase text-secondary">
            Articles
          </p>
          <h1
            className="mt-5 text-balance font-display text-display font-extrabold"
            id="category-not-found-title"
          >
            Article category not found
          </h1>
          <p className="mt-6 text-pretty text-body-large text-calm-foreground">
            This category may have moved or may no longer be available. Browse
            all published articles to keep exploring.
          </p>
          <div className="mt-8">
            <LinkButton href="/articles">Browse all articles</LinkButton>
          </div>
        </Container>
      </Section>
    </main>
  );
}
