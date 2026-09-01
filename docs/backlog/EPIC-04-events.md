# EPIC-04 — Events

## EVT-001 Events listing
Status: Implemented

Acceptance criteria:
- route `/events`
- upcoming events ordered chronologically
- past events clearly separated or accessible
- title, banner, date/time, location displayed
- timezone formatting consistent
- empty states

## EVT-002 Event detail
Status: Implemented

Acceptance criteria:
- route `/events/[slug]`
- event details from CMS
- registration CTA shown only when valid/configured
- deadline/status represented clearly
- not-found for invalid/unpublished event
- Event structured data reflects actual CMS facts
- social metadata

## EVT-003 Event date/status logic
Status: Implemented

Acceptance criteria:
- domain function determines upcoming/past consistently
- edge cases around end time/timezone are tested
- status is not duplicated inconsistently across UI components
