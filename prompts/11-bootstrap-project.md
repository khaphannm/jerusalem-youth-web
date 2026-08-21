# Bootstrap Project Prompt

Initialize the project foundation only.

Read:
- `AGENTS.md`
- `docs/decisions/ADR-001-platform-baseline.md`
- `docs/05-technical-architecture.md`
- `docs/06-coding-standards.md`
- `docs/09-testing-quality-gates.md`
- `docs/backlog/EPIC-00-foundation.md`

Implement stories `FND-001` through `FND-004` sequentially.

Use current stable package versions at initialization. Commit the lockfile.
Before adding any non-core package, justify it against project standards.

Do not implement:
- production homepage sections
- articles
- events
- sermons
- stories
- resources
- CMS content types

Goal: establish a clean, tested, buildable frontend foundation that subsequent stories can safely extend.
