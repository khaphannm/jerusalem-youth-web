# Code Review Prompt

Review the current diff for `[STORY/PR]`.

Read the story, acceptance criteria, `AGENTS.md`, and relevant project standards.

Find material issues only:
1. requirement/behavior defects
2. security/privacy defects
3. incorrect CMS/data assumptions
4. type-safety/runtime-validation issues
5. performance regressions
6. accessibility defects
7. SEO regressions
8. missing important tests
9. unnecessary complexity or scope expansion

Do not produce cosmetic refactoring suggestions unless they hide a real maintenance defect.

For each finding:
- Severity: blocker/high/medium/low
- File/location
- Why it is a problem
- Smallest recommended fix

If there are no material findings, explicitly say so.
