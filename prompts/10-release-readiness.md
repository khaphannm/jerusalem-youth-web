# Release Readiness Prompt

Assess the repository for V1 production release.

Use:
- `docs/12-definition-of-done.md`
- `docs/backlog/EPIC-10-quality-launch.md`
- CI results
- current production/staging configuration available to you

Check:
- unresolved stories
- lint/typecheck/test/build
- critical E2E
- accessibility
- performance
- SEO
- security/privacy
- CMS permissions
- content readiness
- backups/rollback
- monitoring/analytics
- placeholders/debug code/secrets

Output a release decision:
- READY
- READY WITH ACCEPTED RISKS
- NOT READY

Then list only blockers and explicit accepted risks.
Do not invent evidence for checks you cannot run.
