# Performance, SEO, and Accessibility

These are product requirements, not post-launch cleanup tasks.

## Performance budgets

Target representative mobile experience:
- LCP: <= 2.5 s
- INP: <= 200 ms
- CLS: <= 0.1

Additional engineering budgets:
- minimize JavaScript shipped to anonymous content visitors;
- avoid client-side fetching for content that can be rendered on the server;
- optimize all significant images;
- lazy-load below-the-fold media;
- avoid render-blocking third-party scripts;
- load heavy embeds on demand when practical.

Treat the budgets as regression guards. Measure rather than claim.

## Performance checklist

For every new page/feature:
- Is it a Server Component by default?
- Is client JavaScript necessary?
- Is the LCP element optimized?
- Are image width/height/aspect ratio stable?
- Is `sizes` correct for responsive images?
- Is third-party code deferred or avoided?
- Does the feature create N+1 CMS requests?
- Can requests be parallelized safely?
- Does caching match content freshness?

## SEO requirements

Every indexable content page:
- unique title
- meta description
- canonical URL policy
- Open Graph metadata
- share image policy
- crawlable semantic content
- meaningful heading structure

Canonical and origin policy:
- `SITE_URL` defines the production metadata origin and must be a public HTTPS
  origin in production;
- indexable pages use self-referencing canonicals unless a validated CMS
  canonical explicitly overrides a content detail page or the homepage;
- paginated pages retain their page parameter after page one;
- non-indexable search results omit canonicals;
- the root metadata supplies the default title template, description, and
  social image from Site Settings with checked-in fallbacks.

Platform:
- sitemap
- robots
- clean URLs
- redirect strategy
- not-found behavior
- structured data when it truthfully describes the page

Recommended structured data:
- Organization where appropriate
- Article for articles/stories
- Event for events
- VideoObject only when data is sufficient and accurate

Never emit fabricated structured-data fields.

### Structured-data validation

- Every route receives one Organization entity built from the validated site
  origin, Site Settings, approved organization contact fields, and official
  Social Links. Optional properties are omitted when their source is absent.
- Article and Event entities are emitted only by their corresponding published
  detail routes. Other routes must not emit those entity types.
- Automated tests verify entity types, required source-backed values, omitted
  unsupported claims, route placement, and safe serialization of `<`.
- Before production release, validate the homepage and one representative
  published Article and Event URL with Schema.org's Schema Markup Validator.
  Also validate the Article and Event URLs with Google's Rich Results Test.
  Record the tested URLs, date, result, warnings, and reviewer in the release
  notes; warnings must be confirmed as optional rather than fixed with
  fabricated values.

### Sitemap and crawler policy

- `/sitemap.xml` contains the public static routes plus Article, Event, Sermon,
  Story, and Resource details returned by the CMS adapter's published-only
  collection methods.
- Article-category routes are derived only from categories attached to
  published articles. Search, API, not-found, draft/private, and item-level
  `noIndex` routes are excluded.
- A same-origin CMS canonical replaces a detail route in the sitemap. A route
  canonicalized to another origin is omitted because a sitemap may only list
  URLs belonging to its own origin.
- The global Site Settings `noIndex` switch produces an empty sitemap. If one
  CMS collection is unavailable, static routes and other available published
  collections remain present.
- Sitemap content is refreshed at most every five minutes and uses publication
  timestamps as `lastmod` values. Listing pagination is crawlable through the
  semantic pagination links and is not duplicated in the sitemap.
- `/robots.txt` allows the public site in production, blocks `/api/`, and
  advertises the production sitemap and host. Every non-production
  `NODE_ENV` blocks all crawlers and does not advertise a sitemap.

## Accessibility target

Target WCAG 2.2 AA.

Minimum:
- semantic landmarks
- one clear page heading
- keyboard-accessible navigation and controls
- visible focus states
- accessible mobile menu
- sufficient contrast
- form labels and error association
- meaningful alt text
- no information conveyed by color alone
- reduced-motion support
- touch targets suitable for mobile

## Automated checks are not enough

Automated a11y tests should be supplemented with:
- keyboard walkthrough,
- screen-reader spot checks on critical flows,
- zoom/reflow check,
- mobile interaction review.
