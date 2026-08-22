# Content Model

The CMS is the editorial source of truth. Frontend code must not hardcode content that belongs in these models.

## Shared conventions

Every publishable content type should consider:
- `title`
- `slug`
- `summary`/`excerpt`
- `featuredImage`
- `publishedAt`
- SEO fields
- status/draft-publish support

Exact Strapi field names are contracts once implemented. Any change must update types, validators, tests, and documentation.

CMS-002 implements reusable component contracts as follows:
- `seo`: `metaTitle`, `metaDescription`, `canonical`, `socialImage`, `noIndex`
- `tag`: required `name`
- `bibleReference`: required `reference`
- `navigationItem`: required `label`, required `url`, `openInNewTab`
- `socialLink`: required `platform`, required `url`, required `displayOrder`
- `contact`: `email`, `phone`, `address`
- `cta`: required `label`, required `url`
- `ministryValue`: required `title`, required `description`

CTA URLs must be either root-relative site paths or absolute HTTP(S) URLs.
The frontend rejects unsupported schemes at the CMS boundary.

## Article

Required:
- title
- slug
- excerpt
- body/rich content
- featuredImage
- author
- category
- publishedAt

Optional:
- tags[]
- bibleReferences[]
- featured
- seo

Listing behavior:
- `/articles` requests published entries explicitly and orders them by
  `publishedAt` descending.
- The public listing uses six-entry server-rendered pages selected by the
  validated `page` query parameter.
- Article cards expose their category name and link to its category landing
  page for topic discovery.

Detail behavior:
- `/articles/[slug]` accepts lowercase, hyphen-separated public slugs and
  requests an exact match with `status=published`; invalid and empty results
  resolve through the route's not-found boundary.
- The frontend validates Strapi Blocks at the CMS boundary and server-renders
  paragraphs, headings, quotes, code, ordered/unordered lists, links, formatted
  text, and embedded images. Unsupported blocks and unsafe link schemes reject
  the payload instead of being rendered.
- Embedded image URLs and responsive formats are normalized through the same
  media boundary as featured images.
- Article metadata uses optional SEO overrides when supplied, otherwise the
  article title, excerpt, and featured image. JSON-LD contains only fields
  supported by the article contract; it does not infer an author type,
  publisher, or modified date.

Category behavior:
- `/articles/category/[slug]` validates lowercase, hyphen-separated public
  slugs and resolves the category separately from its article collection so an
  existing category with no articles remains distinct from a missing category.
- Category article requests filter by `category.slug`, explicitly request
  `status=published`, order by `publishedAt` descending, and use the same
  six-entry server-rendered pagination as the main listing.
- Category titles and descriptions supply page and social metadata. When the
  current category page contains an article, its first featured image supplies
  the social preview image; no image is fabricated for an empty category.

## Event

Required:
- title
- slug
- summary
- description
- banner
- startDateTime
- endDateTime or explicit single-time rule
- locationName
- publishedAt

Optional:
- address/map URL
- registrationURL
- registrationDeadline
- contactName/contactLink
- gallery[]
- featured
- seo

Derived behavior:
- upcoming/past is derived from dates, not manually duplicated when practical.
- omitting `endDateTime` represents a single-time event; otherwise it cannot precede `startDateTime`.
- date-times require an explicit ISO 8601 offset and represent UTC instants consistently.

## Sermon

Required:
- title
- slug
- speaker
- date
- summary
- videoURL or supported media source

Optional:
- series
- biblePassage
- audioURL
- thumbnail
- notes/resource link
- seo

## Testimony / Story

Required:
- title
- slug
- summary
- story body
- featuredImage
- publishedAt

Optional:
- person display name
- videoURL
- featured
- seo

Privacy rule: never publish sensitive personal information merely because it exists in submitted source material.

## Resource

Required:
- title
- slug
- description
- category
- publishedAt

One of:
- file asset
- externalURL

Exactly one source is required; entries with neither or both are rejected.

Optional:
- author
- thumbnail
- seo

## Taxonomy/supporting types

### Author
- displayName
- slug
- avatar optional
- bio optional

### Category
- name
- slug
- description optional

### Series
- name
- slug
- description optional
- cover image optional

## Single types

### About Page
- `vision` as required plain text
- `mission` as required plain text
- `values` as one or more `ministryValue` components
- `primaryCta` as a required `cta` component

The published About Page single type is the editorial source of truth for the
ministry's vision, mission, values, and About-page action. Site Settings remains
the source for the ministry name and concise identity description used in the
About-page hero.

### Site Settings
- siteName
- siteDescription
- defaultSeo
- defaultSocialImage
- organizationContact using the `contact` component
- primaryCta using the `cta` component
- footerContent as rich content

### Navigation
- `primaryItems`
- `utilityItems`
- `footerItems`

Each field is a repeatable `navigationItem` component.

Navigation URLs must be either root-relative site paths or absolute HTTP(S)
URLs. The frontend rejects unsupported URL schemes at the CMS boundary.

### Social Links
- `links`, a repeatable `socialLink` component

Social-link URLs must be absolute HTTP(S) URLs. The frontend rejects
unsupported schemes and embedded credentials at the CMS boundary.

## SEO component

Reusable component:
- metaTitle
- metaDescription
- canonical optional
- socialImage optional
- noIndex boolean default false

Canonical URLs, when supplied, must be absolute HTTP(S) URLs.

## Frontend contract

The frontend must map CMS payloads into domain models such as:
- `AboutPage`
- `Article`
- `Event`
- `Sermon`
- `Story`
- `Resource`

UI components receive domain models, not raw Strapi payloads.
When Strapi supplies responsive media formats, the frontend maps and uses them
as width-based image candidates while retaining the original asset as fallback.
