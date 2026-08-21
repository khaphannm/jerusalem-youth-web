# Technical Architecture

## System context

```text
Visitor
  |
  v
CDN / Next.js deployment
  |
  v
Next.js App Router
  |
  +--> server-only CMS client / domain adapter
  |        |
  |        v
  |      Strapi 5
  |        |
  |        +--> PostgreSQL
  |        +--> Object storage / media CDN
  |
  +--> External services (analytics, error monitoring, external forms)
```

## Architectural goals

- fast public reads;
- minimal client JavaScript;
- CMS independence at UI level;
- safe server-side credentials;
- predictable cache invalidation;
- testable domain/data boundaries;
- easy addition of content types.

## Frontend structure

Recommended shape:

```text
src/
├── app/
├── components/
│   ├── ui/
│   ├── layout/
│   └── content/
├── features/
│   ├── articles/
│   ├── events/
│   ├── sermons/
│   ├── stories/
│   └── resources/
├── lib/
│   ├── cms/
│   ├── seo/
│   ├── analytics/
│   └── utils/
├── types/
└── config/
```

Prefer feature-local code when behavior is feature-specific. Do not create generic abstractions before there are at least two clear consumers.

## CMS boundary

`src/lib/cms/` owns:
- HTTP/API calls
- authentication
- request parameters
- Strapi response mapping
- validation
- error normalization
- cache/revalidation integration

CMS-004 implements this boundary through the server-only `getCmsClient()` entry
point. It validates flattened Strapi 5 REST envelopes with Zod, maps them into
the domain contracts in `src/lib/cms/domain.ts`, resolves relative media URLs,
and exposes normalized `CmsError` failures. UI code imports domain types but
must perform reads only through this client. Publication caching and webhook
revalidation remain CMS-005 scope.

Public UI must not import raw Strapi generated/request types directly.

Example logical flow:

```text
Strapi payload
  -> runtime validation
  -> mapper
  -> domain model
  -> page/component
```

## Rendering strategy

Default:
- Server Components for public content pages.
- Static generation/cached rendering for stable public content.
- Dynamic rendering only where required.
- Client Components only for actual browser interactions.

Do not turn a parent tree into a Client Component merely for a small interactive child.

## Caching

Principles:
- cache public CMS reads when safe;
- use framework-supported revalidation for the installed Next.js version;
- invalidate/revalidate on CMS publication through a secured webhook where supported;
- avoid long-lived stale content for time-sensitive events;
- never cache privileged/admin responses publicly.

Before using a specific cache API, verify it against the installed Next.js documentation instead of relying on memory.

## Media architecture

Do not serve large original media from the application server.
Use a media service/object storage/CDN.

Production uses the S3-compatible storage and CDN strategy defined in `docs/decisions/ADR-002-s3-media-storage.md`.

Video:
- prefer YouTube/external video hosting for V1;
- embed responsibly and avoid loading heavy players until needed where practical.

## Configuration

Environment variables are validated at startup/server boundary.
Separate:
- public browser-safe values,
- server-only secrets.

Never prefix a secret as public.

## Failure behavior

CMS outage must not cause undefined behavior.
Where reasonable:
- cached content remains available;
- pages provide a controlled error/fallback;
- errors are captured by monitoring without exposing secrets.

## Scalability model

V1 scales primarily through:
- CDN caching,
- static/cached server rendering,
- optimized media,
- managed PostgreSQL,
- stateless frontend instances,
- independent CMS scaling.

Do not introduce queues, microservices, Kubernetes, or custom distributed infrastructure without a measured need.
