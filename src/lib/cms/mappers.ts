import type {
  AboutPage,
  Article,
  Author,
  Category,
  Event,
  HomePage,
  MediaAsset,
  Navigation,
  Resource,
  RichText,
  RichTextInline,
  RichTextList,
  SectionIntro,
  Seo,
  Sermon,
  SermonSeries,
  SiteSettings,
  SocialLinks,
  Story,
} from "./domain";
import type {
  RawAboutPage,
  RawArticle,
  RawAuthor,
  RawCategory,
  RawEvent,
  RawHomePage,
  RawMedia,
  RawNavigation,
  RawResource,
  RawRichText,
  RawRichTextInline,
  RawRichTextList,
  RawSeo,
  RawSermon,
  RawSermonSeries,
  RawSiteSettings,
  RawSocialLinks,
  RawStory,
} from "./schemas";

export const mapAboutPage = (aboutPage: RawAboutPage): AboutPage => ({
  id: aboutPage.documentId,
  vision: aboutPage.vision,
  mission: aboutPage.mission,
  values: aboutPage.values.map((value) => ({
    description: value.description,
    title: value.title,
  })),
  callToAction: {
    label: aboutPage.primaryCta.label,
    url: aboutPage.primaryCta.url,
  },
  publishedAt: aboutPage.publishedAt,
});

const mapSectionIntro = (
  intro: RawHomePage["introduction"],
): SectionIntro => ({
  eyebrow: intro.eyebrow || null,
  title: intro.title,
  description: intro.description || null,
});

export const mapHomePage = (homePage: RawHomePage): HomePage => ({
  visibleSections: {
    introduction: homePage.showIntroduction ?? true,
    community: homePage.showCommunity ?? true,
    gathering: homePage.showGathering ?? true,
    stories: homePage.showStories ?? true,
    teaching: homePage.showTeaching ?? true,
    newcomer: homePage.showNewcomer ?? true,
    invitation: homePage.showInvitation ?? true,
  },
  heroHeadline: homePage.heroHeadline,
  heroDescription: homePage.heroDescription,
  callToAction: {
    label: homePage.primaryCta.label,
    url: homePage.primaryCta.url,
  },
  introduction: mapSectionIntro(homePage.introduction),
  community: mapSectionIntro(homePage.community),
  communityThemes: homePage.communityThemes.map(({ description, title }) => ({
    description,
    title,
  })),
  gathering: mapSectionIntro(homePage.gathering),
  gatheringEmptyMessage: homePage.gatheringEmptyMessage,
  stories: mapSectionIntro(homePage.stories),
  teaching: mapSectionIntro(homePage.teaching),
  newcomer: mapSectionIntro(homePage.newcomer),
  newcomerSteps: homePage.newcomerSteps.map(({ description, title }) => ({
    description,
    title,
  })),
  invitation: mapSectionIntro(homePage.invitation),
});

export const mapMedia = (media: RawMedia, cmsBaseUrl: string): MediaAsset => ({
  id: media.documentId,
  name: media.name,
  url: new URL(media.url, `${cmsBaseUrl}/`).toString(),
  alternativeText: media.alternativeText ?? null,
  mimeType: media.mime,
  width: media.width ?? null,
  height: media.height ?? null,
  sizeInKilobytes: media.size,
  variants: Object.values(media.formats ?? {})
    .map((format) => ({
      height: format.height,
      url: new URL(format.url, `${cmsBaseUrl}/`).toString(),
      width: format.width,
    }))
    .sort((left, right) => left.width - right.width),
});

const mapRichTextInline = (inline: RawRichTextInline): RichTextInline => {
  if (inline.type === "link") {
    return {
      children: inline.children.map((child) => ({ ...child })),
      type: "link",
      url: inline.url,
    };
  }

  return { ...inline };
};

const mapRichTextList = (list: RawRichTextList): RichTextList => ({
  children: list.children.map((child) =>
    child.type === "list"
      ? mapRichTextList(child)
      : {
          children: child.children.map(mapRichTextInline),
          type: "list-item",
        },
  ),
  format: list.format,
  type: "list",
});

export const mapRichText = (
  blocks: RawRichText,
  cmsBaseUrl: string,
): RichText =>
  blocks.map((block) => {
    if (block.type === "list") {
      return mapRichTextList(block);
    }

    if (block.type === "image") {
      return {
        caption: block.image.caption ?? null,
        image: {
          alternativeText: block.image.alternativeText ?? null,
          height: block.image.height,
          id: block.image.hash,
          mimeType: block.image.mime,
          name: block.image.name,
          sizeInKilobytes: block.image.size,
          url: new URL(block.image.url, `${cmsBaseUrl}/`).toString(),
          variants: Object.values(block.image.formats ?? {})
            .map((format) => ({
              height: format.height,
              url: new URL(format.url, `${cmsBaseUrl}/`).toString(),
              width: format.width,
            }))
            .sort((left, right) => left.width - right.width),
          width: block.image.width,
        },
        type: "image",
      };
    }

    if (block.type === "heading") {
      return {
        children: block.children.map(mapRichTextInline),
        level: block.level,
        type: "heading",
      };
    }

    return {
      children: block.children.map(mapRichTextInline),
      type: block.type,
    };
  });

const mapOptionalMedia = (
  media: RawMedia | null | undefined,
  cmsBaseUrl: string,
) => (media ? mapMedia(media, cmsBaseUrl) : null);

export const mapSeo = (seo: RawSeo, cmsBaseUrl: string): Seo => ({
  metaTitle: seo.metaTitle ?? null,
  metaDescription: seo.metaDescription ?? null,
  canonical: seo.canonical ?? null,
  socialImage: mapOptionalMedia(seo.socialImage, cmsBaseUrl),
  noIndex: seo.noIndex,
});

const mapOptionalSeo = (seo: RawSeo | null | undefined, cmsBaseUrl: string) =>
  seo ? mapSeo(seo, cmsBaseUrl) : null;

export const mapAuthor = (author: RawAuthor, cmsBaseUrl: string): Author => ({
  id: author.documentId,
  displayName: author.displayName,
  slug: author.slug,
  avatar: mapOptionalMedia(author.avatar, cmsBaseUrl),
  bio: author.bio ?? null,
});

export const mapCategory = (category: RawCategory): Category => ({
  id: category.documentId,
  name: category.name,
  slug: category.slug,
  description: category.description ?? null,
});

export const mapSermonSeries = (
  series: RawSermonSeries,
  cmsBaseUrl: string,
): SermonSeries => ({
  id: series.documentId,
  name: series.name,
  slug: series.slug,
  description: series.description ?? null,
  coverImage: mapOptionalMedia(series.coverImage, cmsBaseUrl),
});

export const mapArticle = (
  article: RawArticle,
  cmsBaseUrl: string,
): Article => ({
  id: article.documentId,
  title: article.title,
  slug: article.slug,
  excerpt: article.excerpt,
  body: mapRichText(article.body, cmsBaseUrl),
  featuredImage: mapMedia(article.featuredImage, cmsBaseUrl),
  author: mapAuthor(article.author, cmsBaseUrl),
  category: mapCategory(article.category),
  tags: article.tags.map(({ name }) => name),
  bibleReferences: article.bibleReferences.map(({ reference }) => reference),
  featured: article.featured,
  seo: mapOptionalSeo(article.seo, cmsBaseUrl),
  publishedAt: article.publishedAt,
});

export const mapEvent = (event: RawEvent, cmsBaseUrl: string): Event => ({
  id: event.documentId,
  title: event.title,
  slug: event.slug,
  summary: event.summary,
  description: mapRichText(event.description, cmsBaseUrl),
  banner: mapMedia(event.banner, cmsBaseUrl),
  startDateTime: event.startDateTime,
  endDateTime: event.endDateTime ?? null,
  locationName: event.locationName,
  address: event.address ?? null,
  mapUrl: event.mapURL ?? null,
  registrationUrl: event.registrationURL ?? null,
  registrationDeadline: event.registrationDeadline ?? null,
  contactName: event.contactName ?? null,
  contactLink: event.contactLink ?? null,
  gallery: event.gallery.map((media) => mapMedia(media, cmsBaseUrl)),
  featured: event.featured,
  seo: mapOptionalSeo(event.seo, cmsBaseUrl),
  publishedAt: event.publishedAt,
});

export const mapSermon = (
  sermon: RawSermon,
  cmsBaseUrl: string,
): Sermon => ({
  id: sermon.documentId,
  title: sermon.title,
  slug: sermon.slug,
  speaker: sermon.speaker,
  date: sermon.date,
  summary: sermon.summary,
  videoUrl: sermon.videoURL,
  series: sermon.series ? mapSermonSeries(sermon.series, cmsBaseUrl) : null,
  biblePassage: sermon.biblePassage ?? null,
  audioUrl: sermon.audioURL ?? null,
  thumbnail: mapOptionalMedia(sermon.thumbnail, cmsBaseUrl),
  notesUrl: sermon.notesURL ?? null,
  seo: mapOptionalSeo(sermon.seo, cmsBaseUrl),
  publishedAt: sermon.publishedAt,
});

export const mapStory = (story: RawStory, cmsBaseUrl: string): Story => ({
  id: story.documentId,
  title: story.title,
  slug: story.slug,
  summary: story.summary,
  body: mapRichText(story.body, cmsBaseUrl),
  featuredImage: mapMedia(story.featuredImage, cmsBaseUrl),
  personDisplayName: story.personDisplayName ?? null,
  videoUrl: story.videoURL ?? null,
  featured: story.featured,
  seo: mapOptionalSeo(story.seo, cmsBaseUrl),
  publishedAt: story.publishedAt,
});

export const mapResource = (
  resource: RawResource,
  cmsBaseUrl: string,
): Resource => {
  let source: Resource["source"];

  if (resource.file) {
    source = { kind: "file", asset: mapMedia(resource.file, cmsBaseUrl) };
  } else if (resource.externalURL) {
    source = { kind: "external", url: resource.externalURL };
  } else {
    throw new Error("Validated resource did not contain a source.");
  }

  return {
    id: resource.documentId,
    title: resource.title,
    slug: resource.slug,
    description: resource.description,
    category: mapCategory(resource.category),
    source,
    author: resource.author ? mapAuthor(resource.author, cmsBaseUrl) : null,
    thumbnail: mapOptionalMedia(resource.thumbnail, cmsBaseUrl),
    seo: mapOptionalSeo(resource.seo, cmsBaseUrl),
    publishedAt: resource.publishedAt,
  };
};

export const mapNavigation = (navigation: RawNavigation): Navigation => ({
  primaryItems: navigation.primaryItems.map((item) => ({
    label: item.label,
    url: item.url,
    openInNewTab: item.openInNewTab,
  })),
  utilityItems: navigation.utilityItems.map((item) => ({
    label: item.label,
    url: item.url,
    openInNewTab: item.openInNewTab,
  })),
  footerItems: navigation.footerItems.map((item) => ({
    label: item.label,
    url: item.url,
    openInNewTab: item.openInNewTab,
  })),
});

export const mapSocialLinks = (socialLinks: RawSocialLinks): SocialLinks => ({
  links: socialLinks.links
    .map((link) => ({
      platform: link.platform,
      url: link.url,
      displayOrder: link.displayOrder,
    }))
    .sort((left, right) => left.displayOrder - right.displayOrder),
});

export const mapSiteSettings = (
  settings: RawSiteSettings,
  cmsBaseUrl: string,
): SiteSettings => ({
  heroSlides: (settings.heroSlides ?? []).map((slide) => ({
    image: mapMedia(slide.image, cmsBaseUrl),
    label: slide.label,
    caption: slide.caption || null,
  })),
  siteName: settings.siteName,
  siteDescription: settings.siteDescription,
  defaultSeo: mapOptionalSeo(settings.defaultSeo, cmsBaseUrl),
  defaultSocialImage: mapOptionalMedia(settings.defaultSocialImage, cmsBaseUrl),
  organizationContact: settings.organizationContact
    ? {
        email: settings.organizationContact.email ?? null,
        phone: settings.organizationContact.phone ?? null,
        address: settings.organizationContact.address ?? null,
      }
    : null,
  primaryCallToAction: settings.primaryCta
    ? { label: settings.primaryCta.label, url: settings.primaryCta.url }
    : null,
  footerContent: settings.footerContent
    ? mapRichText(settings.footerContent, cmsBaseUrl)
    : null,
});
