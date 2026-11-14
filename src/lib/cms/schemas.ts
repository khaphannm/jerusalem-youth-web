import { z } from "zod";

const requiredString = z.string().trim().min(1);
const nullableString = requiredString.nullable().optional();
const httpUrl = requiredString
  .refine((value) => {
    try {
      const url = new URL(value);
      return (
        ["http:", "https:"].includes(url.protocol) &&
        !url.username &&
        !url.password
      );
    } catch {
      return false;
    }
  }, "URL must be an absolute HTTP URL.");
const nullableHttpUrl = httpUrl.nullable().optional();
const dateTime = z.iso.datetime({ offset: true });
const mediaUrl = requiredString.refine((value) => {
  try {
    const url = new URL(value, "https://cms.example.invalid");
    return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password;
  } catch {
    return false;
  }
}, "Media URL must be an HTTP URL or a relative path.");

const documentSchema = z.object({
  documentId: requiredString,
});

const mediaVariantSchema = z.object({
  height: z.number().int().positive(),
  url: mediaUrl,
  width: z.number().int().positive(),
});

export const mediaSchema = documentSchema.extend({
  name: requiredString,
  url: mediaUrl,
  alternativeText: nullableString,
  mime: requiredString,
  width: z.number().int().positive().nullable().optional(),
  height: z.number().int().positive().nullable().optional(),
  size: z.number().nonnegative(),
  formats: z
    .record(z.string(), mediaVariantSchema)
    .nullable()
    .optional(),
});

const contentLinkUrl = requiredString.refine((value) => {
  if (value.startsWith("#")) {
    return /^#[^\s#]+$/.test(value);
  }

  try {
    const siteOrigin = "https://site.example.invalid";
    const url = new URL(value, siteOrigin);

    if (value.startsWith("/")) {
      return !value.startsWith("//") && url.origin === siteOrigin;
    }

    return (
      ["http:", "https:", "mailto:", "tel:"].includes(url.protocol) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}, "Content link must use a supported safe URL.");

const richTextTextSchema = z.object({
  bold: z.boolean().optional(),
  code: z.boolean().optional(),
  italic: z.boolean().optional(),
  strikethrough: z.boolean().optional(),
  text: z.string(),
  type: z.literal("text"),
  underline: z.boolean().optional(),
});

const richTextLinkSchema = z.object({
  children: z.array(richTextTextSchema).min(1),
  type: z.literal("link"),
  url: contentLinkUrl,
});

const richTextInlineSchema = z.discriminatedUnion("type", [
  richTextTextSchema,
  richTextLinkSchema,
]);

const richTextListItemSchema = z.object({
  children: z.array(richTextInlineSchema).min(1),
  type: z.literal("list-item"),
});

export type RawRichTextList = Readonly<{
  children: readonly (
    | z.infer<typeof richTextListItemSchema>
    | RawRichTextList
  )[];
  format: "ordered" | "unordered";
  type: "list";
}>;

const richTextListSchema: z.ZodType<RawRichTextList> = z.lazy(() =>
  z.object({
    children: z
      .array(z.union([richTextListItemSchema, richTextListSchema]))
      .min(1),
    format: z.enum(["ordered", "unordered"]),
    type: z.literal("list"),
  }),
);

const richTextContainerSchema = z.object({
  children: z.array(richTextInlineSchema).min(1),
  type: z.enum(["paragraph", "quote", "code"]),
});

const richTextHeadingSchema = z.object({
  children: z.array(richTextInlineSchema).min(1),
  level: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
    z.literal(6),
  ]),
  type: z.literal("heading"),
});

const richTextImageSchema = z.object({
  children: z.array(richTextTextSchema).max(1),
  image: z.object({
    alternativeText: nullableString,
    caption: nullableString,
    formats: z
      .record(z.string(), mediaVariantSchema)
      .nullable()
      .optional(),
    hash: requiredString,
    height: z.number().int().positive(),
    mime: requiredString,
    name: requiredString,
    size: z.number().nonnegative(),
    url: mediaUrl,
    width: z.number().int().positive(),
  }),
  type: z.literal("image"),
});

export const richTextSchema = z.array(
  z.union([
    richTextContainerSchema,
    richTextHeadingSchema,
    richTextListSchema,
    richTextImageSchema,
  ]),
);

export const seoSchema = z.object({
  metaTitle: nullableString,
  metaDescription: nullableString,
  canonical: nullableHttpUrl,
  socialImage: mediaSchema.nullable().optional(),
  noIndex: z.boolean(),
});

export const authorSchema = documentSchema.extend({
  displayName: requiredString,
  slug: requiredString,
  avatar: mediaSchema.nullable().optional(),
  bio: nullableString,
});

export const categorySchema = documentSchema.extend({
  name: requiredString,
  slug: requiredString,
  description: nullableString,
});

export const sermonSeriesSchema = documentSchema.extend({
  name: requiredString,
  slug: requiredString,
  description: nullableString,
  coverImage: mediaSchema.nullable().optional(),
});

const publishedDocumentSchema = documentSchema.extend({
  publishedAt: dateTime,
});

export const articleSchema = publishedDocumentSchema.extend({
  title: requiredString,
  slug: requiredString,
  excerpt: requiredString,
  body: richTextSchema.min(1),
  featuredImage: mediaSchema,
  author: authorSchema,
  category: categorySchema,
  tags: z.array(z.object({ name: requiredString })),
  bibleReferences: z.array(z.object({ reference: requiredString })),
  featured: z.boolean(),
  seo: seoSchema.nullable().optional(),
});

export const eventSchema = publishedDocumentSchema
  .extend({
    title: requiredString,
    slug: requiredString,
    summary: requiredString,
    description: richTextSchema.min(1),
    banner: mediaSchema,
    startDateTime: dateTime,
    endDateTime: dateTime.nullable().optional(),
    locationName: requiredString,
    address: nullableString,
    mapURL: nullableHttpUrl,
    registrationURL: nullableHttpUrl,
    registrationDeadline: dateTime.nullable().optional(),
    contactName: nullableString,
    contactLink: contentLinkUrl.nullable().optional(),
    gallery: z.array(mediaSchema),
    featured: z.boolean(),
    seo: seoSchema.nullable().optional(),
  })
  .superRefine((event, context) => {
    if (
      event.endDateTime &&
      Date.parse(event.endDateTime) < Date.parse(event.startDateTime)
    ) {
      context.addIssue({
        code: "custom",
        message: "Event end date cannot precede its start date.",
        path: ["endDateTime"],
      });
    }
  });

export const sermonSchema = publishedDocumentSchema.extend({
  title: requiredString,
  slug: requiredString,
  speaker: requiredString,
  date: z.iso.date(),
  summary: requiredString,
  videoURL: httpUrl,
  series: sermonSeriesSchema.nullable().optional(),
  biblePassage: nullableString,
  audioURL: nullableHttpUrl,
  thumbnail: mediaSchema.nullable().optional(),
  notesURL: nullableHttpUrl,
  seo: seoSchema.nullable().optional(),
});

export const storySchema = publishedDocumentSchema.extend({
  title: requiredString,
  slug: requiredString,
  summary: requiredString,
  body: richTextSchema.min(1),
  featuredImage: mediaSchema,
  personDisplayName: nullableString,
  videoURL: nullableHttpUrl,
  featured: z.boolean(),
  seo: seoSchema.nullable().optional(),
});

export const resourceSchema = publishedDocumentSchema
  .extend({
    title: requiredString,
    slug: requiredString,
    description: requiredString,
    category: categorySchema,
    file: mediaSchema.nullable().optional(),
    externalURL: nullableHttpUrl,
    author: authorSchema.nullable().optional(),
    thumbnail: mediaSchema.nullable().optional(),
    seo: seoSchema.nullable().optional(),
  })
  .superRefine((resource, context) => {
    if (Boolean(resource.file) === Boolean(resource.externalURL)) {
      context.addIssue({
        code: "custom",
        message: "Resource must contain exactly one source.",
        path: ["file"],
      });
    }
  });

const navigationUrl = requiredString.refine((value) => {
  try {
    const siteOrigin = "https://site.example.invalid";
    const url = new URL(value, siteOrigin);

    if (value.startsWith("/")) {
      return url.origin === siteOrigin;
    }

    return (
      ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}, "Navigation URL must be a root-relative path or an HTTP URL.");

const navigationItemSchema = z.object({
  label: requiredString,
  url: navigationUrl,
  openInNewTab: z.boolean(),
});

export const navigationSchema = publishedDocumentSchema.extend({
  primaryItems: z.array(navigationItemSchema),
  utilityItems: z.array(navigationItemSchema),
  footerItems: z.array(navigationItemSchema),
});

const socialLinkSchema = z.object({
  platform: requiredString,
  url: requiredString.refine((value) => {
    try {
      const url = new URL(value);
      return (
        ["http:", "https:"].includes(url.protocol) &&
        !url.username &&
        !url.password
      );
    } catch {
      return false;
    }
  }, "Social URL must be an HTTP URL."),
  displayOrder: z.number().int(),
});

export const socialLinksSchema = publishedDocumentSchema.extend({
  links: z.array(socialLinkSchema),
});

const contactSchema = z.object({
  email: z.email().nullable().optional(),
  phone: nullableString,
  address: nullableString,
});

const callToActionSchema = z.object({
  label: requiredString,
  url: navigationUrl,
});

export const ministryValueSchema = z.object({
  description: requiredString,
  title: requiredString,
});

export const aboutPageSchema = publishedDocumentSchema.extend({
  mission: requiredString,
  primaryCta: callToActionSchema,
  values: z.array(ministryValueSchema).min(1),
  vision: requiredString,
});

const sectionIntroSchema = z.object({
  eyebrow: z.string().trim().max(80).nullable().optional(),
  title: requiredString.max(120),
  description: z.string().trim().max(400).nullable().optional(),
});

export const homePageSchema = publishedDocumentSchema.extend({
  heroHeadline: requiredString.max(80),
  heroDescription: requiredString.max(400),
  primaryCta: callToActionSchema,
  introduction: sectionIntroSchema,
  community: sectionIntroSchema,
  communityThemes: z.array(ministryValueSchema).min(1).max(6),
  gathering: sectionIntroSchema,
  gatheringEmptyMessage: requiredString.max(400),
  stories: sectionIntroSchema,
  teaching: sectionIntroSchema,
  newcomer: sectionIntroSchema,
  newcomerSteps: z.array(ministryValueSchema).min(1).max(4),
  invitation: sectionIntroSchema,
});

export const heroSlideSchema = z.object({
  image: mediaSchema.refine((image) => image.mime.startsWith("image/"), "Hero media must be an image."),
  label: requiredString.max(40),
  caption: z.string().trim().max(160).nullable().optional(),
});

export const siteSettingsSchema = publishedDocumentSchema.extend({
  heroSlides: z.array(heroSlideSchema).max(5).nullable().optional(),
  siteName: requiredString,
  siteDescription: requiredString,
  defaultSeo: seoSchema.nullable().optional(),
  defaultSocialImage: mediaSchema.nullable().optional(),
  organizationContact: contactSchema.nullable().optional(),
  primaryCta: callToActionSchema.nullable().optional(),
  footerContent: richTextSchema.nullable().optional(),
});

export const paginationSchema = z.object({
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  pageCount: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
});

export const collectionEnvelopeSchema = <Schema extends z.ZodType>(
  itemSchema: Schema,
) =>
  z.object({
    data: z.array(itemSchema),
    meta: z.object({ pagination: paginationSchema }),
  });

export const singleEnvelopeSchema = <Schema extends z.ZodType>(
  itemSchema: Schema,
) => z.object({ data: itemSchema.nullable() });

export type RawMedia = z.infer<typeof mediaSchema>;
export type RawRichTextInline = z.infer<typeof richTextInlineSchema>;
export type RawRichText = z.infer<typeof richTextSchema>;
export type RawSeo = z.infer<typeof seoSchema>;
export type RawAuthor = z.infer<typeof authorSchema>;
export type RawCategory = z.infer<typeof categorySchema>;
export type RawSermonSeries = z.infer<typeof sermonSeriesSchema>;
export type RawArticle = z.infer<typeof articleSchema>;
export type RawEvent = z.infer<typeof eventSchema>;
export type RawSermon = z.infer<typeof sermonSchema>;
export type RawStory = z.infer<typeof storySchema>;
export type RawResource = z.infer<typeof resourceSchema>;
export type RawNavigation = z.infer<typeof navigationSchema>;
export type RawSocialLinks = z.infer<typeof socialLinksSchema>;
export type RawAboutPage = z.infer<typeof aboutPageSchema>;
export type RawHomePage = z.infer<typeof homePageSchema>;
export type RawSiteSettings = z.infer<typeof siteSettingsSchema>;
