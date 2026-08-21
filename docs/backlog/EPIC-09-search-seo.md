# EPIC-09 — Search and SEO

## SEA-001 Site search
Acceptance criteria:
- route `/search`
- searches approved public content types
- handles empty/short query
- safe query parsing
- meaningful result types
- no unpublished content leakage
- implementation remains simple for V1

Start with a CMS-backed or server-side search suitable for current content scale. Do not introduce a dedicated search cluster without measured need.

## SEO-001 Global metadata
Acceptance criteria:
- site defaults
- title template
- default social image
- canonical policy
- environment-safe production URL

## SEO-002 Sitemap and robots
Acceptance criteria:
- sitemap includes intended indexable published routes
- excludes drafts/private routes
- robots behavior differs safely for non-production if required

## SEO-003 Structured data
Acceptance criteria:
- Organization baseline if approved
- Article/Event schema only on relevant pages
- fields sourced from real content
- validation included in release review
