# EPIC-00 — Foundation

## FND-001 Initialize frontend
As an engineer, I want a clean Next.js TypeScript foundation so features share reliable conventions.

Acceptance criteria:
- current stable Next.js App Router project
- TypeScript strict
- lint/typecheck/build scripts
- Tailwind and design-token foundation
- application import alias
- no feature pages beyond minimal shell
- lockfile committed
- README updated with local setup

## FND-002 Establish application shell
Acceptance criteria:
- root layout
- header/footer placeholders using semantic HTML
- responsive container primitives
- accessible skip link
- base metadata/site config abstraction
- no hardcoded ministry content that belongs in CMS

## FND-003 Establish quality tooling
Acceptance criteria:
- unit/component test runner configured
- Playwright configured
- CI workflow runs lint, typecheck, tests, build
- at least one smoke test proves pipeline

## FND-004 Environment validation
Acceptance criteria:
- example env file contains names only/no secrets
- server-only vs public variables documented
- required variables validated with clear startup errors
