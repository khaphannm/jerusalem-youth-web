# Git, CI/CD, and Release

## Branching

Prefer trunk-based development:
- `main` is releasable.
- Short-lived branches: `feature/...`, `fix/...`, `chore/...`.
- Merge through pull request.
- Keep PRs small enough to review.

## Commit guidance

Use clear, imperative commits.
Examples:
- `feat(events): add upcoming events listing`
- `fix(cms): handle missing event banner`
- `test(search): cover empty query`

Do not force many tiny commits solely for style; preserve meaningful review history.

## Pull request requirements

PR must include:
- problem/story
- implementation summary
- screenshots/video for visible UI changes
- validation performed
- known risks or follow-ups
- no unrelated changes

Use `templates/pr-template.md`.

## CI

Pull request pipeline:
1. install from lockfile
2. lint
3. typecheck
4. test
5. build
6. selected E2E/a11y checks when environment allows

Main branch:
- same gates
- deploy to production or release environment based on chosen provider flow

## Environments

Recommended:
- local
- preview/PR
- staging (optional but recommended before launch)
- production

Never share privileged production credentials with preview environments.

## Release

The selected [free-first deployment plan](production-deployment-guide.md)
requires snapshot publication work before launch; see the
[execution plan](exec-plans/free-first-deployment.md). The existing live-CMS
deployment path is retained as the
[always-on alternative](production-deployment-always-on.md). In snapshot mode,
release the exact validated content artifact with the web build and retain it
for rollback; cache-tag expiration alone does not publish content.

Before production:
- Definition of Done
- release-readiness prompt
- content review
- structured-data validation recorded for the homepage and representative
  published Article and Event URLs
- backup verification
- redirects
- analytics/error monitoring
- rollback path

Prefer reversible deployments and configuration changes.

## Dependency updates

Use automated dependency PRs.
Do not auto-merge major updates.
For framework/CMS major updates:
- read migration notes;
- run full quality gates;
- review generated/schema changes;
- validate CMS backup/restore if applicable.
