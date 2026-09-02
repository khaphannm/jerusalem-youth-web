import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { SafeLink } from "@/components/ui/safe-link";
import { SearchInput } from "@/components/ui/search-input";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  parseSearchQuery,
  searchPublicContent,
  type SearchData,
  type SearchResultGroup,
} from "@/features/search/data";

type SearchPageProps = Readonly<{
  searchParams: Promise<{
    q?: string | string[];
  }>;
}>;

const searchDescription =
  "Search published articles, events, sermons, stories, and resources from across the site.";

export const metadata: Metadata = {
  description: searchDescription,
  robots: { follow: true, index: false },
  title: "Search",
};

function ResultGroup({ group }: Readonly<{ group: SearchResultGroup }>) {
  const visibleDescription =
    group.total > group.items.length
      ? `Showing ${group.items.length} of ${group.total}`
      : `${group.total} ${group.total === 1 ? "result" : "results"}`;

  return (
    <section aria-labelledby={`search-${group.id}-title`} className="mt-12">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
        <h3
          className="font-heading text-heading-3 font-bold"
          id={`search-${group.id}-title`}
        >
          {group.label}
        </h3>
        <p className="text-body-small text-muted">{visibleDescription}</p>
      </div>

      <ul className="mt-6 grid gap-5 md:grid-cols-2">
        {group.items.map((result) => (
          <li className="h-full" key={`${group.id}-${result.id}`}>
            <article className="flex h-full flex-col rounded-medium border border-border bg-surface p-6 sm:p-8">
              <p className="font-label text-label font-bold uppercase text-primary">
                {result.typeLabel}
                {result.context ? (
                  <>
                    <span aria-hidden="true"> · </span>
                    <span className="text-secondary">{result.context}</span>
                  </>
                ) : null}
              </p>
              <h4 className="mt-4 font-heading text-body-large font-bold">
                <SafeLink
                  className="rounded-small transition-colors duration-fast ease-standard hover:text-primary motion-reduce:transition-none"
                  href={result.href}
                >
                  {result.title}
                </SafeLink>
              </h4>
              <p className="mt-3 flex-1 text-muted">{result.summary}</p>
              <SafeLink
                className="mt-5 inline-flex min-h-11 w-fit items-center gap-2 rounded-small py-2 font-label text-label font-bold text-primary transition-colors duration-fast ease-standard hover:text-secondary motion-reduce:transition-none"
                href={result.href}
              >
                View {result.typeLabel.toLowerCase()}
                <span aria-hidden="true">→</span>
              </SafeLink>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SearchResults({
  data,
  query,
}: Readonly<{ data: SearchData | null; query: ReturnType<typeof parseSearchQuery> }>) {
  if (query.status === "empty") {
    return (
      <EmptyState
        description="Enter a topic, event name, speaker, or resource title to search published content."
        title="Start with a search"
      />
    );
  }

  if (query.status === "too-short") {
    return (
      <EmptyState
        description="Add another character so the search is specific enough to be useful."
        title="Search needs at least two characters"
      />
    );
  }

  if (!data || data.status === "error") {
    return (
      <EmptyState
        description="Published content could not be searched right now. Please try again in a moment."
        title="Search is temporarily unavailable"
      />
    );
  }

  const availabilityNotice =
    data.unavailableTypes.length > 0 ? (
      <p
        className="mb-6 rounded-medium border border-border bg-background p-4 text-body-small text-muted"
        role="status"
      >
        Some results are temporarily unavailable: {data.unavailableTypes.join(", ")}.
      </p>
    ) : null;

  if (data.matchedTotal === 0) {
    return (
      <>
        {availabilityNotice}
        <EmptyState
          description="Try a broader topic, check the spelling, or search for a different event, message, story, or resource."
          title={`No results for “${query.value}”`}
        />
      </>
    );
  }

  return (
    <>
      {availabilityNotice}
      {data.groups.map((group) => (
        <ResultGroup group={group} key={group.id} />
      ))}
    </>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = parseSearchQuery(params.q);
  const data =
    query.status === "ready" ? await searchPublicContent(query.value) : null;
  const resultsDescription =
    query.status !== "ready"
      ? "Submit a search above to explore published content."
      : data?.status === "ready"
        ? `${data.matchedTotal} ${data.matchedTotal === 1 ? "result" : "results"} for “${query.value}”.`
        : `Results for “${query.value}” could not be loaded.`;

  return (
    <main className="flex-1" id="main-content" tabIndex={-1}>
      <Section aria-labelledby="search-title" tone="secondary">
        <Container size="wide">
          <div className="max-w-reading">
            <p className="font-label text-label font-bold uppercase text-calm">
              Find what you need
            </p>
            <h1
              className="mt-5 text-balance font-display text-display font-extrabold"
              id="search-title"
            >
              Search the site
            </h1>
            <p className="mt-6 text-pretty text-body-large text-secondary-foreground">
              {searchDescription}
            </p>
          </div>
          <SearchInput defaultValue={query.value} />
        </Container>
      </Section>

      <Section aria-labelledby="search-results-title" tone="white">
        <Container size="wide">
          <SectionHeading
            description={resultsDescription}
            eyebrow="Published content"
            id="search-results-title"
            tone="white"
            title="Search results"
          />
          <div className="mt-10">
            <SearchResults data={data} query={query} />
          </div>
        </Container>
      </Section>
    </main>
  );
}
