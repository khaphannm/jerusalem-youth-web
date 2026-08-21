# EPIC-01 — CMS

## CMS-001 Initialize Strapi and PostgreSQL
Acceptance criteria:
- Strapi 5 project created with current stable packages
- PostgreSQL configured per environment
- no production secret committed
- local setup documented
- basic health/startup verified

## CMS-002 Implement core content types
Status: Implemented

Implement models defined in `docs/03-content-model.md`.

Acceptance criteria:
- Article, Event, Sermon, Story/Testimony, Resource
- Author, Category, Series
- Site Settings, Navigation, Social Links
- relationships and required validation configured
- draft/publish enabled where applicable
- schema changes are reviewable in source control

## CMS-003 Configure media and permissions
Status: Implemented

Acceptance criteria:
- media provider/storage strategy configured
- anonymous/public read permissions are least-privilege
- editorial roles documented/configured as platform permits
- upload constraints documented
- no anonymous write access

## CMS-004 Typed frontend CMS boundary
Status: Implemented

Acceptance criteria:
- all CMS reads route through one server-side module
- raw Strapi payload is validated and mapped
- domain models are independent of Strapi response nesting
- normalized errors
- tests for representative valid and malformed payloads

## CMS-005 Publication revalidation
Status: Implemented

Acceptance criteria:
- published content can trigger secure site revalidation using APIs appropriate to installed Next.js
- webhook is authenticated
- invalid webhook calls rejected
- event/date freshness behavior documented
