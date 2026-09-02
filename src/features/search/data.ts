import "server-only";

import { getCmsClient } from "@/lib/cms";
import type {
  Article,
  CollectionResult,
  Event,
  Resource,
  Sermon,
  Story,
} from "@/lib/cms/domain";
import {
  minimumSearchQueryLength,
  normalizeSearchQuery,
} from "@/lib/search-query";

export const searchResultsPerType = 5;

export type ParsedSearchQuery =
  | Readonly<{ status: "empty"; value: "" }>
  | Readonly<{ status: "too-short"; value: string }>
  | Readonly<{ status: "ready"; value: string }>;

export type SearchResult = Readonly<{
  context: string | null;
  href: string;
  id: string;
  summary: string;
  title: string;
  typeLabel: string;
}>;

export type SearchResultGroup = Readonly<{
  id: "articles" | "events" | "resources" | "sermons" | "stories";
  items: readonly SearchResult[];
  label: string;
  total: number;
}>;

export type SearchData =
  | Readonly<{
      groups: readonly SearchResultGroup[];
      matchedTotal: number;
      status: "ready";
      unavailableTypes: readonly string[];
    }>
  | Readonly<{ status: "error" }>;

export function parseSearchQuery(
  value: string | readonly string[] | undefined,
): ParsedSearchQuery {
  const candidate = Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
  const normalized = normalizeSearchQuery(candidate);

  if (!normalized) {
    return { status: "empty", value: "" };
  }

  if ([...normalized].length < minimumSearchQueryLength) {
    return { status: "too-short", value: normalized };
  }

  return { status: "ready", value: normalized };
}

const resultOptions = { page: 1, pageSize: searchResultsPerType } as const;

const articleResult = (article: Article): SearchResult => ({
  context: article.category.name,
  href: `/articles/${encodeURIComponent(article.slug)}`,
  id: article.id,
  summary: article.excerpt,
  title: article.title,
  typeLabel: "Article",
});

const eventResult = (event: Event): SearchResult => ({
  context: event.locationName,
  href: `/events/${encodeURIComponent(event.slug)}`,
  id: event.id,
  summary: event.summary,
  title: event.title,
  typeLabel: "Event",
});

const resourceResult = (resource: Resource): SearchResult => ({
  context: resource.category.name,
  href: `/resources/${encodeURIComponent(resource.slug)}`,
  id: resource.id,
  summary: resource.description,
  title: resource.title,
  typeLabel: "Resource",
});

const sermonResult = (sermon: Sermon): SearchResult => ({
  context: sermon.speaker,
  href: `/sermons/${encodeURIComponent(sermon.slug)}`,
  id: sermon.id,
  summary: sermon.summary,
  title: sermon.title,
  typeLabel: "Sermon",
});

const storyResult = (story: Story): SearchResult => ({
  context: story.personDisplayName,
  href: `/stories/${encodeURIComponent(story.slug)}`,
  id: story.id,
  summary: story.summary,
  title: story.title,
  typeLabel: "Story",
});

function logSearchError(source: string, error: unknown) {
  const reason = error instanceof Error ? error.message : "Unknown error.";

  console.error(`Search ${source} could not be loaded: ${reason}`);
}

export async function searchPublicContent(query: string): Promise<SearchData> {
  try {
    const client = getCmsClient();
    const results = await Promise.allSettled([
      client.articles.search(query, resultOptions),
      client.events.search(query, resultOptions),
      client.sermons.search(query, resultOptions),
      client.stories.search(query, resultOptions),
      client.resources.search(query, resultOptions),
    ]);
    const groups: SearchResultGroup[] = [];
    const unavailableTypes: string[] = [];
    let successfulSourceCount = 0;

    const collect = <T>(
      result: PromiseSettledResult<CollectionResult<T>>,
      definition: Readonly<{
        id: SearchResultGroup["id"];
        label: string;
        map: (item: T) => SearchResult;
      }>,
    ) => {
      if (result.status === "rejected") {
        unavailableTypes.push(definition.label);
        logSearchError(definition.label.toLowerCase(), result.reason);
        return;
      }

      successfulSourceCount += 1;

      if (result.value.items.length > 0) {
        groups.push({
          id: definition.id,
          items: result.value.items.map(definition.map),
          label: definition.label,
          total: result.value.pagination.total,
        });
      }
    };

    collect(results[0], {
      id: "articles",
      label: "Articles",
      map: articleResult,
    });
    collect(results[1], { id: "events", label: "Events", map: eventResult });
    collect(results[2], {
      id: "sermons",
      label: "Sermons",
      map: sermonResult,
    });
    collect(results[3], { id: "stories", label: "Stories", map: storyResult });
    collect(results[4], {
      id: "resources",
      label: "Resources",
      map: resourceResult,
    });

    if (successfulSourceCount === 0) {
      return { status: "error" };
    }

    return {
      groups,
      matchedTotal: groups.reduce((total, group) => total + group.total, 0),
      status: "ready",
      unavailableTypes,
    };
  } catch (error) {
    logSearchError("CMS data", error);
    return { status: "error" };
  }
}
