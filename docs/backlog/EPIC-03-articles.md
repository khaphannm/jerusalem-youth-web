# EPIC-03 — Articles / Devotionals

## ART-001 Articles listing
Acceptance criteria:
- published articles only
- newest-first default
- card shows image/title/excerpt/author or approved subset
- category discovery
- pagination or scalable loading strategy
- empty state
- SEO metadata

## ART-002 Article detail
Acceptance criteria:
- route `/articles/[slug]`
- title, metadata, author, rich content, image as available
- rich text rendered safely
- related/next action when useful
- not-found for invalid/unpublished slug
- Article structured data only with truthful fields
- social metadata

## ART-003 Category page
Acceptance criteria:
- route `/articles/category/[slug]`
- only matching published articles
- empty/not-found behavior defined
- metadata derived from category
