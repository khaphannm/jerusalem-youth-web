# Youth Ministry Website V1 — AI Development Kit for Codex

A repository-ready operating system for building a professional, scalable, fast, accessible, and visually polished Youth Ministry website with Codex.

## Baseline stack

- Frontend: Next.js App Router + TypeScript (strict)
- Styling: Tailwind CSS + CSS design tokens
- UI primitives: shadcn/ui where it reduces custom boilerplate
- CMS: Strapi 5
- Database: PostgreSQL
- Media: S3-compatible object storage/CDN
- Validation: Zod at external-data boundaries
- Tests: unit/component + Playwright end-to-end
- CI/CD: GitHub Actions + deployment-provider checks
- Observability: error monitoring + web analytics
- Architecture principle: CMS is behind a typed data-access layer; UI does not depend directly on Strapi response shapes

Do not hard-pin framework/package versions in documentation. At project initialization, use current stable versions, commit the lockfile, and let Renovate/Dependabot manage updates.

## Local frontend setup

Copy `.env.example` to `.env.local` and set `CMS_BASE_URL` to the Strapi origin.
The value is server-only, must not contain credentials, and must use HTTPS
outside local development. Start the CMS before running frontend routes that
read content.

To reproduce the live Strapi/PostgreSQL endpoint checks and frontend contract
tests, follow [`docs/cms-boundary-verification.md`](docs/cms-boundary-verification.md).

## How to use this kit

1. Copy the entire kit into the root of the Git repository.
2. Keep `AGENTS.md` at repository root.
3. Treat `/docs` as the system of record.
4. Start Codex with `prompts/01-session-start.md`.
5. Execute one backlog story at a time.
6. For complex stories, create an execution plan under `docs/exec-plans/active/`.
7. After implementation, use the review prompt and quality gates before merge.
8. Move completed execution plans to `docs/exec-plans/completed/`.

## Recommended first sequence

1. Review and approve `docs/00-project-charter.md`.
2. Confirm `docs/01-product-scope-v1.md`.
3. Confirm `docs/03-content-model.md`.
4. Run backlog `EPIC-00-foundation`.
5. Run `EPIC-01-cms`.
6. Build shared UI foundation.
7. Implement content verticals one story at a time.
8. Run quality/launch epic.

## Token-efficiency rules

- Do not paste large files into prompts when Codex can read the repository.
- Prompt by story ID and file path.
- Keep `AGENTS.md` short; deep detail belongs in `/docs`.
- Ask Codex to read only relevant docs/source files.
- Prefer a fresh task/session per story.
- Use Git history and repository docs as memory, not chat history.
- Require concise completion reports.

## Definition of success

V1 is successful when:
- ministry staff can manage content without developer intervention;
- visitors can quickly discover who the ministry is, upcoming events, articles, sermons, stories, and ways to connect;
- key pages meet the performance, accessibility, SEO, and security gates in this kit;
- the architecture can add new content types and integrations without rewriting the frontend.


## Visual identity

The V1 visual direction is **Modern Editorial Youth Ministry**.

Approved palette:
- Warm Ivory `#FFF9F2`
- Midnight `#111827`
- Electric Blue `#3657F5`
- Deep Navy `#1F3A5F`
- Warm Coral `#FF6B4A`
- Soft Sage `#A8C7A1`

Codex must use semantic design tokens rather than inventing colors.

See:
- `docs/04-design-system.md`
- `docs/13-visual-consistency-checklist.md`
- `docs/14-design-token-implementation.md`
- `prompts/12-visual-consistency-review.md`
