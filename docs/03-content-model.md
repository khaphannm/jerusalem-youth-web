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

## SEO component

Reusable component:
- metaTitle
- metaDescription
- canonical optional
- socialImage optional
- noIndex boolean default false

## Frontend contract

The frontend must map CMS payloads into domain models such as:
- `Article`
- `Event`
- `Sermon`
- `Story`
- `Resource`

UI components receive domain models, not raw Strapi payloads.
