# Implement Story Prompt

Implement `[STORY-ID]` from `[BACKLOG-FILE]`.

Workflow:
1. Read `AGENTS.md`, the story, and only directly relevant docs.
2. Inspect directly related source files and existing patterns.
3. If complexity is non-trivial, create/update a concise execution plan in `docs/exec-plans/active/`.
4. Implement only this story.
5. Run all relevant Definition-of-Done checks.
6. Review `git diff` for requirement violations, accidental scope changes, security, accessibility, and performance regressions.

Do not:
- refactor unrelated code,
- add dependencies without concrete justification,
- invent CMS fields/APIs,
- redesign approved UI,
- mark complete while relevant checks are failing.

Completion report only:
- Changed: files
- Validation: command/check -> pass/fail
- Remaining: unresolved issues/risks only
