import "server-only";

import { getCmsClient } from "@/lib/cms";
import type {
  AboutPage,
  Article,
  CollectionResult,
  Event,
  Sermon,
  SiteSettings,
  Story,
} from "@/lib/cms/domain";

export type HomePageData = Readonly<{
  aboutPage: AboutPage | null;
  featuredEvent: Event | null;
  latestArticle: Article | null;
  latestSermon: Sermon | null;
  siteSettings: SiteSettings | null;
  stories: readonly Story[];
  upcomingEvents: readonly Event[];
}>;

const emptyCollection = <T>(): CollectionResult<T> => ({
  items: [],
  pagination: { page: 1, pageCount: 0, pageSize: 1, total: 0 },
});

const emptyHomePageData: HomePageData = {
  aboutPage: null,
  featuredEvent: null,
  latestArticle: null,
  latestSermon: null,
  siteSettings: null,
  stories: [],
  upcomingEvents: [],
};

function logHomeDataError(source: string, error: unknown) {
  const reason = error instanceof Error ? error.message : "Unknown error.";

  console.error(`Homepage ${source} could not be loaded: ${reason}`);
}

function settledValue<T>(
  source: string,
  result: PromiseSettledResult<T>,
  fallback: T,
): T {
  if (result.status === "fulfilled") {
    return result.value;
  }

  logHomeDataError(source, result.reason);
  return fallback;
}

export async function loadHomePageData(
  now = new Date(),
): Promise<HomePageData> {
  try {
    const client = getCmsClient();
    const from = now.toISOString();
    const [
      siteSettingsResult,
      featuredEventsResult,
      upcomingEventsResult,
      latestArticleResult,
      latestSermonResult,
      storiesResult,
      aboutPageResult,
    ] = await Promise.allSettled([
      client.siteSettings(),
      client.events.upcoming({ featured: true, from, pageSize: 1 }),
      client.events.upcoming({ from, pageSize: 4 }),
      client.articles.latest(),
      client.sermons.latest(),
      client.stories.latest({ pageSize: 3 }),
      client.aboutPage(),
    ]);
    const featuredEvents = settledValue(
      "featured event",
      featuredEventsResult,
      emptyCollection<Event>(),
    ).items;
    const upcomingEvents = settledValue(
      "upcoming events",
      upcomingEventsResult,
      emptyCollection<Event>(),
    ).items;
    const featuredEvent = featuredEvents[0] ?? upcomingEvents[0] ?? null;

    return {
      aboutPage: settledValue("about page", aboutPageResult, null),
      featuredEvent,
      latestArticle: settledValue("latest article", latestArticleResult, null),
      latestSermon: settledValue("latest sermon", latestSermonResult, null),
      siteSettings: settledValue("site settings", siteSettingsResult, null),
      stories: settledValue("stories", storiesResult, emptyCollection<Story>())
        .items,
      upcomingEvents: upcomingEvents
        .filter((event) => event.id !== featuredEvent?.id)
        .slice(0, 2),
    };
  } catch (error) {
    logHomeDataError("CMS data", error);
    return emptyHomePageData;
  }
}

export async function loadHomeSiteSettings(): Promise<SiteSettings | null> {
  try {
    return await getCmsClient().siteSettings();
  } catch (error) {
    logHomeDataError("metadata", error);
    return null;
  }
}
