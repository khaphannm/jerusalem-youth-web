import type { z } from "zod";

import { populate } from "../populate.ts";
import {
  aboutPageSchema,
  articleSchema,
  authorSchema,
  categorySchema,
  eventSchema,
  homePageSchema,
  navigationSchema,
  resourceSchema,
  sermonSchema,
  sermonSeriesSchema,
  siteSettingsSchema,
  socialLinksSchema,
  storySchema,
} from "../schemas.ts";

type Entry = Readonly<{
  endpoint: string;
  populate: readonly string[];
  schema: z.ZodType;
}>;

/** Every public collection the website reads, by Strapi REST endpoint. */
export const snapshotCollections = [
  { endpoint: "articles", populate: populate.article, schema: articleSchema },
  { endpoint: "authors", populate: populate.author, schema: authorSchema },
  { endpoint: "categories", populate: [], schema: categorySchema },
  { endpoint: "events", populate: populate.event, schema: eventSchema },
  { endpoint: "resources", populate: populate.resource, schema: resourceSchema },
  { endpoint: "series", populate: populate.sermonSeries, schema: sermonSeriesSchema },
  { endpoint: "sermons", populate: populate.sermon, schema: sermonSchema },
  { endpoint: "stories", populate: populate.story, schema: storySchema },
] as const satisfies readonly Entry[];

/**
 * Every public single type. `required` ones must be published for a capture
 * to succeed; the others have checked-in fallbacks on the website.
 */
export const snapshotSingles = [
  { endpoint: "about-page", populate: populate.aboutPage, required: false, schema: aboutPageSchema },
  { endpoint: "home-page", populate: populate.homePage, required: false, schema: homePageSchema },
  { endpoint: "navigation", populate: populate.navigation, required: true, schema: navigationSchema },
  { endpoint: "site-setting", populate: populate.siteSettings, required: true, schema: siteSettingsSchema },
  { endpoint: "social-links", populate: populate.socialLinks, required: false, schema: socialLinksSchema },
] as const satisfies readonly (Entry & { required: boolean })[];

export type SnapshotCollectionEndpoint =
  (typeof snapshotCollections)[number]["endpoint"];
export type SnapshotSingleEndpoint =
  (typeof snapshotSingles)[number]["endpoint"];
