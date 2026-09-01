# EPIC-05 — Sermons

## SER-001 Sermons listing
Status: Implemented

Acceptance criteria:
- published sermons ordered newest-first
- display title, speaker, date, thumbnail, series when available
- responsive cards
- empty state
- scalable pagination strategy

## SER-002 Sermon detail
Status: Implemented

Acceptance criteria:
- route `/sermons/[slug]`
- title, speaker, date, Bible passage, series, summary
- supported external video embed
- embed does not unnecessarily degrade initial page load
- optional notes/audio links handled
- social metadata
- invalid/unpublished slug -> not found
