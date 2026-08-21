# Definition of Done

A story is done only when all applicable items are true.

## Product
- Acceptance criteria pass.
- No unapproved scope expansion.
- Empty/error/not-found behavior is defined where relevant.

## Code
- Follows architecture and coding standards.
- No unrelated refactor.
- No accidental duplication.
- Types are sound; no unjustified `any`.
- External data is validated where appropriate.
- No secrets exposed.

## UI/UX
- Mobile-first behavior works.
- Uses design-system tokens/components.
- Keyboard interaction works.
- Focus/labels/alt text are correct.
- No arbitrary visual styling outside approved system.
- Visible UI changes have reviewable screenshots.

## Performance
- No unnecessary Client Component.
- No avoidable client-side content fetching.
- Images/media are optimized.
- No obvious N+1/serial request regression.
- Performance budgets remain credible.

## SEO
- Metadata is correct for indexable pages.
- Canonical/OG behavior is considered.
- Page is crawlable and semantic.

## Testing
- Relevant tests added/updated.
- Lint passes.
- Typecheck passes.
- Tests pass.
- Production build passes.
- Relevant E2E passes when applicable.

## Documentation
- Data/API/schema/architecture behavior changes are documented.
- ADR added for material architectural decisions.
- Story/execution plan status updated.

## Release safety
- No unresolved critical/high security issue introduced.
- No destructive migration without backup/rollback plan.
