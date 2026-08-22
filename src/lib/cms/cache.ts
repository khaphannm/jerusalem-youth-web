export const cmsCacheTags = {
  aboutPage: "cms:about-page",
  articles: "cms:articles",
  authors: "cms:authors",
  categories: "cms:categories",
  events: "cms:events",
  navigation: "cms:navigation",
  resources: "cms:resources",
  sermonSeries: "cms:sermon-series",
  sermons: "cms:sermons",
  siteSettings: "cms:site-settings",
  socialLinks: "cms:social-links",
  stories: "cms:stories",
} as const;

export type CmsCacheTag = (typeof cmsCacheTags)[keyof typeof cmsCacheTags];

export const cmsUidCacheTags = {
  "api::about-page.about-page": cmsCacheTags.aboutPage,
  "api::article.article": cmsCacheTags.articles,
  "api::author.author": cmsCacheTags.authors,
  "api::category.category": cmsCacheTags.categories,
  "api::event.event": cmsCacheTags.events,
  "api::navigation.navigation": cmsCacheTags.navigation,
  "api::resource.resource": cmsCacheTags.resources,
  "api::sermon-series.sermon-series": cmsCacheTags.sermonSeries,
  "api::sermon.sermon": cmsCacheTags.sermons,
  "api::site-setting.site-setting": cmsCacheTags.siteSettings,
  "api::social-links.social-links": cmsCacheTags.socialLinks,
  "api::story.story": cmsCacheTags.stories,
} as const;

export type CmsContentUid = keyof typeof cmsUidCacheTags;

export const eventCacheLifetimeSeconds = 5 * 60;
