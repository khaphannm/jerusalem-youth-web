# Codex Instructions — Youth Ministry Website V1

This file is the routing table for Codex. Keep it concise. The authoritative project knowledge is under `/docs`.

## Mission

Build a production-quality Youth Ministry website that is:
- fast,
- mobile-first,
- accessible,
- SEO-friendly,
- secure,
- visually intentional,
- easy for non-developers to manage,
- easy for engineers to extend.

## Source of truth

Before changing code, read only what is relevant:
- Product and scope: `docs/00-project-charter.md`, `docs/01-product-scope-v1.md`
- Information architecture: `docs/02-information-architecture.md`
- Content model: `docs/03-content-model.md`
- Design/UI: `docs/04-design-system.md`
- Architecture: `docs/05-technical-architecture.md`
- Coding standards: `docs/06-coding-standards.md`
- Performance/SEO/a11y: `docs/07-performance-seo-accessibility.md`
- Security/privacy: `docs/08-security-privacy.md`
- Testing: `docs/09-testing-quality-gates.md`
- Git/release: `docs/10-git-cicd-release.md`
- Content operations: `docs/11-content-operations.md`
- Definition of Done: `docs/12-definition-of-done.md`
- Backlog: `docs/backlog/`

## Non-negotiable engineering rules

1. Inspect existing code before editing it.
2. Implement only the requested story/task.
3. Do not invent CMS fields, APIs, routes, environment variables, design tokens, or conventions.
4. Reuse existing components and utilities before creating new ones.
5. Do not refactor unrelated code.
6. Do not add a dependency unless the benefit is concrete and the existing stack cannot solve the requirement cleanly.
7. Keep CMS/vendor details behind a typed adapter/data-access layer.
8. Prefer Server Components and server-side data access. Use Client Components only for actual browser interactivity.
9. Never expose CMS secrets or privileged tokens to the browser.
10. Validate external/CMS data at boundaries and handle malformed/missing data safely.
11. Handle loading, empty, error, and not-found states where applicable.
12. Preserve accessibility: semantic HTML, keyboard operation, visible focus, labels, alt text, reduced-motion support.
13. Preserve performance budgets. Avoid unnecessary JavaScript and large client bundles.
14. Use the approved design system in `docs/04-design-system.md`. Do not invent arbitrary colors, spacing, radii, shadows, typography, or animation styles.
15. Visible brand colors must come from approved semantic tokens. Do not use arbitrary Tailwind palette colors or raw brand hex values in components.
16. The approved V1 visual direction is **Modern Editorial Youth Ministry**. Do not redesign it without an explicit design-system change.
17. Update tests and documentation when behavior/contracts change.
18. Never implement future backlog items unless explicitly requested.

## Working loop

For each task:
1. Read the story and acceptance criteria.
2. Inspect directly related code and docs.
3. If the task is complex, write a short execution plan before coding.
4. Implement the smallest complete solution.
5. Run the relevant checks.
6. Review the diff against the story, architecture, design system, and Definition of Done.
7. Report concisely:
   - changed files,
   - checks run and pass/fail,
   - unresolved issues/risks only.

## Ambiguity rule

- Minor ambiguity with no architectural or user-visible consequence: choose the simplest option consistent with existing patterns.
- Stop and surface ambiguity before implementation when it affects data schema, public APIs, security/privacy, architecture, destructive changes, or significant user-visible behavior.

## Quality rule

Do not call a task complete because code was written. It is complete only when the relevant checks in `docs/12-definition-of-done.md` pass.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
