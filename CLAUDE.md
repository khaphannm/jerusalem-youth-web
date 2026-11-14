# Claude Code Instructions — Youth Ministry Website V1

This repository is an AI-assisted, production-grade Youth Ministry website.
Authoritative specifications and standards live in `/docs`. See `AGENTS.md` for project routing.

---

## 1. Commands

### Frontend (`./`)
- **Dev server:** `npm run dev` (starts on `http://localhost:3000`)
- **Typecheck:** `npm run typecheck` (`tsc --noEmit`)
- **Lint:** `npm run lint` (`eslint .`)
- **Unit / Component tests:** `npm test` (`vitest run`)
- **Test in watch mode:** `npm run test:watch`
- **E2E tests:** `npm run test:e2e` (`playwright test`)
- **Production build:** `npm run build`

### CMS (`./cms`)
- **CMS dev server:** `npm --prefix cms run dev` (starts on `http://localhost:1337`)
- **CMS typecheck:** `npm --prefix cms run typecheck`
- **CMS tests:** `npm --prefix cms test`
- **Seed launch data:** `npm run seed:launch`

---

## 2. Source of Truth (`/docs`)

Read only the relevant doc for the current task before writing code:

| Topic | Relevant Document |
| :--- | :--- |
| **Product Scope & Non-Goals** | `docs/00-project-charter.md`, `docs/01-product-scope-v1.md` |
| **Information Architecture & Routes** | `docs/02-information-architecture.md` |
| **Content Models & Strapi Schemas** | `docs/03-content-model.md` |
| **Design System & Semantic Tokens** | `docs/04-design-system.md`, `docs/14-design-token-implementation.md` |
| **Technical Architecture** | `docs/05-technical-architecture.md` |
| **Coding Standards** | `docs/06-coding-standards.md` |
| **Performance, SEO & A11y** | `docs/07-performance-seo-accessibility.md` |
| **Security & Privacy** | `docs/08-security-privacy.md` |
| **Definition of Done** | `docs/12-definition-of-done.md` |
| **Backlog Epics & Stories** | `docs/backlog/` |

---

## 3. Non-Negotiable Engineering Rules

1. **Inspect First:** Always read existing code, types, and caller components before making changes.
2. **Minimal & Targeted Diffs:** Implement only the requested story. Do not refactor unrelated files or add premature abstractions.
3. **Approved Design Tokens Only:**
   - Visual direction: **Modern Editorial Youth Ministry**.
   - Use semantic design tokens from `docs/04-design-system.md`.
   - Never invent arbitrary Tailwind palette colors or raw hex codes in components.
4. **Typed Data-Access Layer:**
   - UI components must **never** depend directly on raw Strapi responses.
   - All external/CMS data must pass through a typed repository/adapter layer and be validated with Zod at the boundary.
5. **Server Components First:**
   - Use React Server Components by default for performance, SEO, and bundle size.
   - Add `'use client'` only when client-side interactivity, state, or browser APIs are strictly necessary.
6. **Zero Secrets in Client:** Never expose CMS tokens, publication revalidation secrets, or database URLs to the browser.
7. **Accessibility & Core Web Vitals:** Maintain semantic HTML, visible focus states, proper labels, alt texts, and reduced-motion support.

---

## 4. Working Loop

For each task:
1. **Read & Inspect:** Review the story AC and inspect directly related files.
2. **Plan (if complex):** Propose a concise execution plan before writing code.
3. **Implement:** Write the smallest complete, type-safe solution adhering to design tokens.
4. **Verify:** Run verification commands:
   ```bash
   npm run typecheck && npm run lint && npm test
   ```
5. **Review:** Inspect the diff against the story's Acceptance Criteria and `docs/12-definition-of-done.md`.
6. **Report:** Concisely summarize changed files, test results, and any unresolved risks.
