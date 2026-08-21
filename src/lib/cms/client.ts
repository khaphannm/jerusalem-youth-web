import "server-only";

import type { z } from "zod";

import type {
  Article,
  Author,
  Category,
  CollectionOptions,
  CollectionResult,
  Event,
  Navigation,
  Resource,
  Sermon,
  SermonSeries,
  SiteSettings,
  SocialLinks,
  Story,
} from "./domain";
import { CmsError } from "./errors";
import {
  mapArticle,
  mapAuthor,
  mapCategory,
  mapEvent,
  mapNavigation,
  mapResource,
  mapSermon,
  mapSermonSeries,
  mapSiteSettings,
  mapSocialLinks,
  mapStory,
} from "./mappers";
import {
  articleSchema,
  authorSchema,
  categorySchema,
  collectionEnvelopeSchema,
  eventSchema,
  navigationSchema,
  resourceSchema,
  sermonSchema,
  sermonSeriesSchema,
  singleEnvelopeSchema,
  siteSettingsSchema,
  socialLinksSchema,
  storySchema,
} from "./schemas";

type Fetch = typeof fetch;

type ClientConfiguration = Readonly<{
  baseUrl: string;
  fetch?: Fetch;
  timeoutMs?: number;
}>;

type CollectionDefinition<Raw, Domain> = Readonly<{
  endpoint: string;
  populate: readonly string[];
  schema: z.ZodType<Raw>;
  map: (value: Raw, cmsBaseUrl: string) => Domain;
}>;

type SingleDefinition<Raw, Domain> = Readonly<{
  endpoint: string;
  populate: readonly string[];
  schema: z.ZodType<Raw>;
  map: (value: Raw, cmsBaseUrl: string) => Domain;
}>;

const defaultTimeoutMs = 8_000;

const populate = {
  article: [
    "featuredImage",
    "author.avatar",
    "category",
    "tags",
    "bibleReferences",
    "seo.socialImage",
  ],
  author: ["avatar"],
  event: ["banner", "gallery", "seo.socialImage"],
  navigation: ["primaryItems", "utilityItems", "footerItems"],
  resource: [
    "category",
    "file",
    "author.avatar",
    "thumbnail",
    "seo.socialImage",
  ],
  sermon: ["series.coverImage", "thumbnail", "seo.socialImage"],
  sermonSeries: ["coverImage"],
  siteSettings: [
    "defaultSeo.socialImage",
    "defaultSocialImage",
    "organizationContact",
    "primaryCta",
  ],
  socialLinks: ["links"],
  story: ["featuredImage", "seo.socialImage"],
} as const;

const isLocalHostname = (hostname: string) =>
  hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";

export const normalizeCmsBaseUrl = (
  value: string | undefined,
  environment = process.env.NODE_ENV,
) => {
  const normalized = value?.trim();

  if (!normalized) {
    throw new CmsError(
      "CONFIGURATION",
      "CMS_BASE_URL is required. See .env.example.",
    );
  }

  let url: URL;

  try {
    url = new URL(normalized);
  } catch (cause) {
    throw new CmsError(
      "CONFIGURATION",
      "CMS_BASE_URL must be a valid HTTP or HTTPS URL.",
      { cause },
    );
  }

  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new CmsError(
      "CONFIGURATION",
      "CMS_BASE_URL must be an HTTP or HTTPS base URL without credentials, query, or fragment.",
    );
  }

  if (
    environment === "production" &&
    url.protocol !== "https:" &&
    !isLocalHostname(url.hostname)
  ) {
    throw new CmsError(
      "CONFIGURATION",
      "CMS_BASE_URL must use HTTPS in production.",
    );
  }

  return url.toString().replace(/\/$/, "");
};

const validateCollectionOptions = (options: CollectionOptions) => {
  for (const [name, value] of Object.entries(options)) {
    if (value !== undefined && (!Number.isInteger(value) || value <= 0)) {
      throw new CmsError(
        "CONFIGURATION",
        `${name} must be a positive integer.`,
      );
    }
  }
};

const buildUrl = (
  baseUrl: string,
  endpoint: string,
  populatePaths: readonly string[],
  options: CollectionOptions = {},
  slug?: string,
) => {
  validateCollectionOptions(options);
  const url = new URL(`api/${endpoint}`, `${baseUrl}/`);

  for (const path of populatePaths) {
    url.searchParams.append("populate", path);
  }

  if (options.page !== undefined) {
    url.searchParams.set("pagination[page]", String(options.page));
  }

  if (options.pageSize !== undefined) {
    url.searchParams.set("pagination[pageSize]", String(options.pageSize));
  }

  if (slug !== undefined) {
    const normalizedSlug = slug.trim();

    if (!normalizedSlug) {
      throw new CmsError("CONFIGURATION", "slug must not be blank.");
    }

    url.searchParams.set("filters[slug][$eq]", normalizedSlug);
    url.searchParams.set("pagination[pageSize]", "1");
  }

  return url;
};

const isAbortError = (error: unknown) =>
  error instanceof DOMException && error.name === "AbortError";

export const createCmsClient = ({
  baseUrl: unvalidatedBaseUrl,
  fetch: fetchImplementation = fetch,
  timeoutMs = defaultTimeoutMs,
}: ClientConfiguration) => {
  const baseUrl = normalizeCmsBaseUrl(unvalidatedBaseUrl);

  if (!Number.isInteger(timeoutMs) || timeoutMs <= 0) {
    throw new CmsError(
      "CONFIGURATION",
      "CMS request timeout must be a positive integer.",
    );
  }

  const request = async (
    url: URL,
    options: Readonly<{ notFoundAsNull?: boolean }> = {},
  ): Promise<unknown> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetchImplementation(url, {
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });

      if (response.status === 404 && options.notFoundAsNull) {
        return null;
      }

      if (!response.ok) {
        throw new CmsError(
          "HTTP",
          `CMS request failed with status ${response.status}.`,
          { status: response.status },
        );
      }

      try {
        return (await response.json()) as unknown;
      } catch (cause) {
        throw new CmsError(
          "INVALID_RESPONSE",
          "CMS returned a response that was not valid JSON.",
          { cause },
        );
      }
    } catch (error) {
      if (error instanceof CmsError) {
        throw error;
      }

      if (isAbortError(error)) {
        throw new CmsError("TIMEOUT", "CMS request timed out.", {
          cause: error,
        });
      }

      throw new CmsError("NETWORK", "CMS request could not be completed.", {
        cause: error,
      });
    } finally {
      clearTimeout(timeout);
    }
  };

  const readCollection = async <Raw, Domain>(
    definition: CollectionDefinition<Raw, Domain>,
    options: CollectionOptions = {},
  ): Promise<CollectionResult<Domain>> => {
    const payload = await request(
      buildUrl(baseUrl, definition.endpoint, definition.populate, options),
    );
    const result = collectionEnvelopeSchema(definition.schema).safeParse(payload);

    if (!result.success) {
      throw new CmsError(
        "INVALID_RESPONSE",
        `CMS returned an invalid ${definition.endpoint} collection payload.`,
        { cause: result.error },
      );
    }

    return {
      items: result.data.data.map((item) => definition.map(item, baseUrl)),
      pagination: result.data.meta.pagination,
    };
  };

  const findBySlug = async <Raw, Domain>(
    definition: CollectionDefinition<Raw, Domain>,
    slug: string,
  ): Promise<Domain | null> => {
    const payload = await request(
      buildUrl(baseUrl, definition.endpoint, definition.populate, {}, slug),
    );
    const result = collectionEnvelopeSchema(definition.schema).safeParse(payload);

    if (!result.success) {
      throw new CmsError(
        "INVALID_RESPONSE",
        `CMS returned an invalid ${definition.endpoint} detail payload.`,
        { cause: result.error },
      );
    }

    const item = result.data.data[0];
    return item ? definition.map(item, baseUrl) : null;
  };

  const readSingle = async <Raw, Domain>(
    definition: SingleDefinition<Raw, Domain>,
  ): Promise<Domain | null> => {
    const payload = await request(
      buildUrl(baseUrl, definition.endpoint, definition.populate),
      { notFoundAsNull: true },
    );

    if (payload === null) {
      return null;
    }
    const result = singleEnvelopeSchema(definition.schema).safeParse(payload);

    if (!result.success) {
      throw new CmsError(
        "INVALID_RESPONSE",
        `CMS returned an invalid ${definition.endpoint} payload.`,
        { cause: result.error },
      );
    }

    return result.data.data
      ? definition.map(result.data.data, baseUrl)
      : null;
  };

  const articles = {
    endpoint: "articles",
    populate: populate.article,
    schema: articleSchema,
    map: mapArticle,
  } satisfies CollectionDefinition<z.infer<typeof articleSchema>, Article>;
  const authors = {
    endpoint: "authors",
    populate: populate.author,
    schema: authorSchema,
    map: mapAuthor,
  } satisfies CollectionDefinition<z.infer<typeof authorSchema>, Author>;
  const categories = {
    endpoint: "categories",
    populate: [],
    schema: categorySchema,
    map: (category: z.infer<typeof categorySchema>) => mapCategory(category),
  } satisfies CollectionDefinition<z.infer<typeof categorySchema>, Category>;
  const events = {
    endpoint: "events",
    populate: populate.event,
    schema: eventSchema,
    map: mapEvent,
  } satisfies CollectionDefinition<z.infer<typeof eventSchema>, Event>;
  const resources = {
    endpoint: "resources",
    populate: populate.resource,
    schema: resourceSchema,
    map: mapResource,
  } satisfies CollectionDefinition<z.infer<typeof resourceSchema>, Resource>;
  const sermonSeries = {
    endpoint: "series",
    populate: populate.sermonSeries,
    schema: sermonSeriesSchema,
    map: mapSermonSeries,
  } satisfies CollectionDefinition<z.infer<typeof sermonSeriesSchema>, SermonSeries>;
  const sermons = {
    endpoint: "sermons",
    populate: populate.sermon,
    schema: sermonSchema,
    map: mapSermon,
  } satisfies CollectionDefinition<z.infer<typeof sermonSchema>, Sermon>;
  const stories = {
    endpoint: "stories",
    populate: populate.story,
    schema: storySchema,
    map: mapStory,
  } satisfies CollectionDefinition<z.infer<typeof storySchema>, Story>;

  return {
    articles: {
      list: (options?: CollectionOptions) => readCollection(articles, options),
      findBySlug: (slug: string) => findBySlug(articles, slug),
    },
    authors: {
      list: (options?: CollectionOptions) => readCollection(authors, options),
      findBySlug: (slug: string) => findBySlug(authors, slug),
    },
    categories: {
      list: (options?: CollectionOptions) => readCollection(categories, options),
      findBySlug: (slug: string) => findBySlug(categories, slug),
    },
    events: {
      list: (options?: CollectionOptions) => readCollection(events, options),
      findBySlug: (slug: string) => findBySlug(events, slug),
    },
    resources: {
      list: (options?: CollectionOptions) => readCollection(resources, options),
      findBySlug: (slug: string) => findBySlug(resources, slug),
    },
    sermonSeries: {
      list: (options?: CollectionOptions) =>
        readCollection(sermonSeries, options),
      findBySlug: (slug: string) => findBySlug(sermonSeries, slug),
    },
    sermons: {
      list: (options?: CollectionOptions) => readCollection(sermons, options),
      findBySlug: (slug: string) => findBySlug(sermons, slug),
    },
    stories: {
      list: (options?: CollectionOptions) => readCollection(stories, options),
      findBySlug: (slug: string) => findBySlug(stories, slug),
    },
    navigation: () =>
      readSingle({
        endpoint: "navigation",
        populate: populate.navigation,
        schema: navigationSchema,
        map: (navigation) => mapNavigation(navigation),
      } satisfies SingleDefinition<
        z.infer<typeof navigationSchema>,
        Navigation
      >),
    siteSettings: () =>
      readSingle({
        endpoint: "site-setting",
        populate: populate.siteSettings,
        schema: siteSettingsSchema,
        map: mapSiteSettings,
      } satisfies SingleDefinition<
        z.infer<typeof siteSettingsSchema>,
        SiteSettings
      >),
    socialLinks: () =>
      readSingle({
        endpoint: "social-links",
        populate: populate.socialLinks,
        schema: socialLinksSchema,
        map: (socialLinks) => mapSocialLinks(socialLinks),
      } satisfies SingleDefinition<
        z.infer<typeof socialLinksSchema>,
        SocialLinks
      >),
  };
};

let defaultClient: ReturnType<typeof createCmsClient> | undefined;

export const getCmsClient = () => {
  defaultClient ??= createCmsClient({ baseUrl: process.env.CMS_BASE_URL ?? "" });
  return defaultClient;
};
