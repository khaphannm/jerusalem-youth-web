# Codex Operating Guide

## Recommended task granularity

Give Codex one coherent story at a time: roughly a reviewable pull request, not an entire epic.

Good:
- implement event detail page
- add Strapi event mapper and tests
- fix incorrect timezone classification
- review current PR

Too broad:
- build the whole website
- improve performance everywhere
- redesign the UI
- refactor the entire CMS layer

## Context discipline

Start with:
1. `AGENTS.md`
2. story file
3. directly related code

Read more only for a concrete dependency.

## Project environment

Configure Codex so it can run the same core commands as developers/CI:
- dependency install from lockfile
- lint
- typecheck
- unit/component tests
- production build
- Playwright where browser support exists

Supply required non-secret test environment values.
Do not give production write credentials to ordinary coding tasks.

## Parallel Codex work

Parallelize only tasks that do not touch the same contracts/files.

Good parallel tracks:
- CMS schema implementation
- design token/UI primitive work
- CI setup

Avoid parallel agents changing:
- the same schema,
- the same route/component,
- shared types with incompatible assumptions.

Integrate one contract change before dependent work.

## Prompt style

Write tasks like a good GitHub issue:
- desired behavior
- file/module context when known
- acceptance criteria
- explicit non-goals

Use the templates under `/prompts`.

## Completion behavior

Require Codex to run checks and inspect its diff.
Do not accept "implemented" as proof of correctness.
