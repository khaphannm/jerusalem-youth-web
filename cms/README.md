# Youth Ministry CMS

Strapi 5 content-management service backed by PostgreSQL with S3-compatible production media storage and a least-privilege public Content API.

## Requirements

- Node.js 20–26
- npm 6 or newer
- PostgreSQL

## Local PostgreSQL

Use an existing PostgreSQL instance or start an ephemeral local container:

```bash
docker run --name jerusalem-youth-postgres --rm \
  -e POSTGRES_DB=jerusalem_youth \
  -e POSTGRES_USER=strapi \
  -e POSTGRES_PASSWORD=strapi-local \
  -p 5432:5432 \
  postgres:17-alpine
```

The password above is for isolated local development only. Do not reuse it in a shared or production environment.

## Environment setup

```bash
cd cms
cp .env.example .env
```

Set the local server values (`HOST=0.0.0.0`, `PORT=1337`), PostgreSQL connection values matching your database, and `DATABASE_CLIENT=postgres`. `DATABASE_URL` can replace the discrete host, port, database, username, and password settings.

Generate independent random values for every secret. `APP_KEYS` requires four comma-separated values; the remaining secret variables, including `JWT_SECRET`, require one value each:

```bash
openssl rand -base64 32
```

For production, inject secrets through the hosting platform, use environment-specific database credentials, enable PostgreSQL SSL according to the provider's certificate requirements, and configure the S3/CDN variables described in `docs/media-permissions-operations.md`. Never commit `.env`.

## Install and run

```bash
npm ci
npm run develop
```

Open the administrator setup at [http://localhost:1337/admin](http://localhost:1337/admin). The unauthenticated startup health check is available at `http://localhost:1337/_health` and should return HTTP 204.

## Quality checks

```bash
npm run typecheck
npm test
npm run build
```

## Core content schemas

CMS-002 defines these collection types:

- Article, Event, Sermon, Story / Testimony, and Resource
- Author, Category, and Series

It also defines the Site Settings, Navigation, and Social Links single types, plus reusable SEO, navigation, contact, CTA, tag, Bible-reference, and social-link components.

All public editorial content types use draft/publish. Authors, categories, and series are supporting taxonomy records and do not use draft/publish.

The schema has two cross-field rules:

- Omitting an event's `endDateTime` makes it a single-time event. When present, it cannot precede `startDateTime`.
- A resource must contain exactly one source: `file` or `externalURL`.

Event date-times use Strapi `datetime` fields. Editors and API clients must provide an explicit ISO 8601 offset; persisted API values are treated consistently as UTC instants.

Schema JSON and generated Strapi declarations are committed so contract changes remain reviewable. After an intentional schema change, regenerate declarations with:

```bash
npm run strapi -- ts:generate-types
```

## Media and permissions

Production media, upload constraints, the exact anonymous read allowlist, and the administrator-role setup checklist are documented in [`docs/media-permissions-operations.md`](docs/media-permissions-operations.md).

## Dependency compatibility note

Strapi 5.52.1 pins Vite 5.4.21, which is affected by the high-severity development-server path traversal advisory [GHSA-fx2h-pf6j-xcff](https://github.com/advisories/GHSA-fx2h-pf6j-xcff). `package.json` overrides only that transitive dependency to patched Vite 6.4.3; Strapi's bundled React-SWC plugin supports Vite 6. Remove the override after Strapi ships a patched compatible version, and rerun the full CMS build/startup gates whenever it changes.
