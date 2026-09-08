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

### External link rendering

- All CMS-driven destinations pass through the shared safe-link renderer after
  their content-specific schema validation. This final rendering boundary
  supports root-relative site paths, page fragments, credential-free HTTP(S),
  email, and telephone links without broadening any CMS field contract.
- Internal site paths use framework navigation. Other supported destinations
  use standard anchors and stay in the current tab unless the content contract
  explicitly requests a new tab.
- A requested new tab always adds `target="_blank"` with
  `rel="noopener noreferrer"`; existing safe relationship values are
  preserved and an unsafe `opener` token is removed.
- Empty, malformed, protocol-relative, credentialed, and unsupported-scheme
  destinations render no interactive control. The CMS validation boundary
  remains responsible for rejecting malformed source documents. Rich content
  preserves the link label as non-interactive text if this final guard rejects
  a destination.

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
- The shared event-status domain function treats an event as upcoming through
  its exact effective end instant and as past only afterward. Explicit offsets
  are compared as UTC instants.
- Homepage upcoming-event queries mirror the domain rule: a multi-time event is
  included while `endDateTime` has not passed, while a single-time event uses
  `startDateTime`.
- Event cards and event details display labels from the shared domain status;
  registration closure also consumes that status instead of reimplementing
  past-event logic.

Listing behavior:
- `/events` requests published entries explicitly and retrieves every CMS page.
- An event remains upcoming through its `endDateTime`; a single-time event uses
  `startDateTime` as its effective end.
- Upcoming events are ordered by `startDateTime` ascending. Past events are
  separated and ordered by `startDateTime` descending.
- Public event date-times are formatted consistently in UTC.

Detail behavior:
- `/events/[slug]` accepts lowercase, hyphen-separated public slugs and requests
  an exact match with `status=published`; invalid and empty results resolve
  through the route's not-found boundary.
- `mapURL` and `registrationURL` must be credential-free absolute HTTP(S)
  URLs. `contactLink` supports safe site-relative, HTTP(S), email, and telephone
  links. Unsafe values reject the event payload at the CMS boundary.
- Registration is open only while the event has not ended, its optional
  deadline has not passed, and a validated `registrationURL` is configured.
  Closed and unavailable states remain visible without a registration CTA.
- Event metadata uses optional SEO overrides when supplied, otherwise the event
  title, summary, and banner. JSON-LD contains only facts supported by the event
  contract and does not infer attendance mode, schedule status, or ticket
  offers.

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

Listing behavior:
- `/sermons` requests published entries explicitly and orders them by sermon
  `date` descending, with `publishedAt` descending as a stable tie-breaker.
- The public listing uses six-entry server-rendered pages selected by a
  validated `page` query parameter.
- Sermon cards display the title, speaker, sermon date, optional thumbnail, and
  optional series. Missing thumbnails use a stable text fallback without
  fabricating media.

Detail behavior:
- `/sermons/[slug]` accepts lowercase, hyphen-separated public slugs and
  requests an exact match with `status=published`; invalid and empty results
  resolve through the route's not-found boundary.
- Sermon video, audio, and notes URLs must be credential-free absolute HTTP(S)
  URLs. Unsafe values reject the sermon payload at the CMS boundary.
- YouTube and Vimeo URLs receive an embedded player. The third-party iframe is
  not mounted until the visitor presses Play; supported YouTube URLs use the
  privacy-enhanced `youtube-nocookie.com` origin. Other validated providers use
  a normal external link instead of an untrusted embed.
- Optional Bible passage, series, audio, notes, and thumbnail fields are shown
  only when configured. Sermon metadata uses optional SEO overrides and falls
  back to the sermon title, summary, and thumbnail.

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

Listing behavior:
- `/stories` requests published entries explicitly and orders them by
  `publishedAt` descending.
- The public listing uses six-entry server-rendered pages selected by a
  validated `page` query parameter.
- Every card displays the story image, title, and summary. The first story on
  each page receives a wider responsive editorial treatment while the remaining
  stories use a compact grid.

Detail behavior:
- `/stories/[slug]` accepts only normalized public slugs and requests an exact
  published entry. Invalid, missing, draft, and unpublished stories resolve to
  the not-found boundary.
- Story body Blocks are validated at the CMS boundary and rendered through the
  shared rich-content renderer. Unsafe links and unsupported blocks reject the
  CMS response instead of reaching the page.
- The optional person display name is rendered exactly as approved in the CMS
  and omitted entirely when absent. The page does not infer or expose any
  additional identity, contact, or attribution details.
- Optional video URLs must be credential-free absolute HTTP(S) URLs. YouTube
  and Vimeo use the shared click-to-load player, including YouTube's
  privacy-enhanced origin; other validated providers use an external link. No
  video section is rendered when the field is absent.
- Social metadata uses optional SEO overrides and falls back to the story title,
  summary, featured image, and publication time. Missing and failed detail
  states are not indexable.

## Media page

Media behavior:
- `/media` is derived from images and video URLs attached to published Events,
  Sermons, and Stories. Publication is the editorial approval boundary; the
  frontend does not expose the raw Media Library or draft content.
- Public media images must be validated image assets with non-empty alternative
  text. Event banners and galleries, Story featured images, and Sermon/Story
  video thumbnails are eligible. Duplicate image and video sources are removed.
- Media requests are bounded per source, combined newest-first, and rendered as
  a responsive server-rendered grid. A failure in one source does not hide
  available approved media from the others.
- Images use explicit responsive `sizes`, mapped Strapi width variants capped
  at 1600 pixels, stable dimensions, and lazy loading. An oversized original
  without a bounded variant is omitted. Video iframes are never mounted until
  the visitor presses Play; unsupported but validated providers remain normal
  external links.

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

Listing behavior:
- `/resources` requests published entries explicitly, orders them by
  `publishedAt` descending, and uses nine-entry server-rendered pagination.
- Each card shows category, title, description, and a type derived from the
  validated source contract. It links both to the site detail page and directly
  to the configured source with a specific accessible action label.

Detail behavior:
- `/resources/[slug]` accepts lowercase, hyphen-separated public slugs and
  requests an exact match with `status=published`; invalid, missing, draft, and
  unpublished resources resolve through the route's not-found boundary.
- External destinations must be credential-free absolute HTTP(S) URLs. File
  URLs pass through the shared media URL boundary, and the UI derives type and
  action language from the validated MIME type rather than the filename.
- Resource links do not force a download, new tab, or inline viewer. The
  visitor's browser decides how a file opens or saves, avoiding assumptions
  about provider headers and file support.
- Detail metadata uses optional SEO overrides and falls back to title,
  description, and thumbnail. An image file may serve as the fallback share
  image when no thumbnail exists. Missing and failed states are not indexable.

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

## Site search behavior

- `/search` uses the server-rendered `q` query parameter and searches only the
  published Article, Event, Sermon, Story, and Resource collections.
- Search fields are deliberately limited for V1: Article title/excerpt; Event
  title/summary/location; Sermon title/summary/speaker/Bible passage; Story
  title/summary; and Resource title/description. Rich bodies and private or
  administrative content are not searched.
- Query parsing takes only the first repeated `q` value, applies Unicode NFKC
  normalization, replaces control characters and repeated whitespace, and
  limits input to 80 Unicode code points. Empty queries show guidance and
  queries shorter than two characters do not reach the CMS.
- Each CMS request explicitly uses published status, case-insensitive contains
  filters on controlled field paths, a five-result-per-type limit, and
  `cache: "no-store"` so arbitrary query variants do not accumulate in the
  persistent data cache.
- Results are grouped and labeled by content type. Each group exposes its CMS
  total while rendering at most five items; V1 does not add cross-type ranking,
  search pagination, or a dedicated search service.
- Collection searches run concurrently. A failed content type is identified
  without discarding available groups; failure of every source produces a
  controlled unavailable state.
- Search result pages are marked `noindex,follow` to avoid indexing arbitrary
  query combinations while allowing result links to be crawled.

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

### Join Page behavior

- `/join` is a server-rendered guidance page and does not introduce a new CMS
  content type. It presents stable next steps into Events, Stories, and
  Resources using existing public routes.
- Site Settings `primaryCta` supplies the visually primary action when present.
  Its existing CMS boundary permits only a root-relative path or a
  credential-free absolute HTTP(S) URL. A CTA pointing back to `/join` is
  replaced with the Events fallback to avoid a navigation loop.
- Social Links supplies optional official external community destinations.
  Invalid or empty URLs are rejected by the existing CMS validator; unavailable
  links produce a useful Events fallback instead of an empty control.
- The page contains no registration or contact form and stores no visitor data.
  Registration, community, and contact activity remains on the approved linked
  destination for V1.
- Metadata uses Site Settings for the ministry name, default social image, and
  indexing preference while preserving safe fallbacks during CMS outages.

### Contact Page behavior

- `/contact` is a server-rendered directory of approved organization-level
  contact details and does not introduce a new CMS content type.
- Site Settings `organizationContact` supplies the official email, phone, and
  postal address. The page does not consume event contacts, author profiles, or
  other staff-level details.
- Email and phone values render as labeled `mailto:` and `tel:` links. The
  address remains plain text because the Contact contract has no approved map
  URL field.
- Social Links supplies optional official public community destinations. Empty
  or invalid social URLs are handled by the existing CMS boundary and missing
  channels produce a useful Join-page fallback.
- V1 uses direct organization contact and public channel links instead of a
  native or external form, so the page collects and stores no visitor data.
- Metadata uses Site Settings for the ministry name, default social image, and
  indexing preference while preserving safe fallbacks during CMS outages.

### Site Settings
- siteName
- siteDescription
- defaultSeo
- defaultSocialImage
- organizationContact using the `contact` component
- primaryCta using the `cta` component
- footerContent as rich content
- `heroSlides`: optional ordered repeatable `shared.hero-slide` component (maximum 5)

Each hero slide has a required image-only `image`, a required `label` (maximum
40 characters), and an optional `caption` (maximum 160 characters). Image alt
text and dimensions come from the media library. Component order determines
display order; absent or empty slides preserve the text-only homepage hero.

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

### Global metadata policy

- Site Settings supplies the global site name, description, default SEO title
  and description, indexing preference, and default social image. Checked-in
  site configuration remains the controlled fallback when the CMS is
  unavailable.
- `SITE_URL` is the server-only web origin used as the metadata base. It must be
  origin-only. Production requires HTTPS and rejects local hostnames so relative
  canonical and social URLs cannot resolve to a development deployment.
- Every indexable route emits a self-referencing canonical. A validated CMS SEO
  canonical overrides that route canonical for the homepage and content detail
  pages. Paginated listings and categories preserve `?page=N` for pages after
  the first; the first page uses the clean route.
- Search result pages are `noindex,follow` and intentionally omit a canonical
  because arbitrary query combinations are not indexable pages.
- Page-specific social images override the global image. Pages without a
  content image preserve the parent default rather than replacing it with an
  empty Open Graph or Twitter image field.

### Structured-data policy

- The approved V1 Organization baseline is emitted site-wide. Its name and
  description come from Site Settings with checked-in identity fallbacks; its
  optional email, telephone, and address come only from the approved
  organization-level Contact component; and `sameAs` contains only validated
  Social Links. `SITE_URL` supplies its stable URL and identifier.
- No logo, legal name, founding date, staff identity, or other Organization
  property is inferred when the content model does not provide it.
- Article JSON-LD appears only on published Article detail pages and uses the
  title, excerpt, category, featured image, tags, publication timestamp, and
  optional validated canonical supplied by that Article contract. It does not
  infer an author type, publisher, or modified timestamp.
- Event JSON-LD appears only on published Event detail pages and uses the title,
  summary, banner, dates, location, optional address, and optional validated
  canonical supplied by that Event contract. It does not infer attendance
  mode, schedule status, organizer, tickets, prices, or offers.
- All JSON-LD is serialized through the shared escaping boundary before it is
  inserted into a native `application/ld+json` script.

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
