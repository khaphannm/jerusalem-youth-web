# Performance Audit Prompt

Audit `[PAGE/FEATURE]` against `docs/07-performance-seo-accessibility.md`.

Do not optimize blindly. Measure/inspect first.

Check:
- Server vs Client Component boundaries
- client bundle causes
- LCP element
- image loading/sizes
- fonts
- third-party scripts/embeds
- serial/N+1 data fetching
- caching/revalidation
- hydration work
- layout shift
- unnecessary rerenders

Rank findings by expected user impact.
Implement only high-confidence improvements that do not change behavior unless explicitly asked.

Report:
- finding
- evidence
- change
- expected impact
- validation
