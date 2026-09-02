# EPIC-07 — Media and Resources

## MED-001 Media page
Status: Implemented

Acceptance criteria:
- route `/media`
- approved image/video content only
- responsive layout
- lazy loading for below-fold media
- no giant original images
- useful empty state

## RES-001 Resources listing
Status: Implemented

Acceptance criteria:
- route `/resources`
- published resources
- category/title/description/type
- external/file destination handled accessibly
- no unsafe file assumptions

## RES-002 Resource detail
Status: Implemented

Acceptance criteria:
- route `/resources/[slug]`
- description and source/download link
- metadata/social sharing
- invalid/unpublished slug -> not found
