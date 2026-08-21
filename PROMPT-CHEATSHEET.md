# Codex Prompt Cheatsheet

## Start
`Read AGENTS.md. Work on [STORY-ID] from [file]. Inspect relevant code first.`

## Implement
`Implement [STORY-ID]. Follow its acceptance criteria and the Definition of Done. Do not modify unrelated functionality.`

## Plan only
`Read [STORY-ID] and inspect related code. Do not edit. Give a concise implementation plan, affected files, risks, and material ambiguities.`

## Fix
`Investigate [bug]. Find the root cause first, then implement the smallest safe fix and add a regression test where practical.`

## Review
`Review the current git diff against [STORY-ID], AGENTS.md, and the Definition of Done. Report material defects only.`

## UI
`Polish [page] within the existing design system. Improve hierarchy, spacing, responsive composition, and accessibility. Do not invent a new visual style.`

## Performance
`Audit [page] using docs/07-performance-seo-accessibility.md. Measure/inspect first; implement only high-confidence improvements.`

## Security
`Review [scope] using docs/08-security-privacy.md. Focus on concrete exposure paths and smallest safe fixes.`

## Finish
`Run all relevant checks, inspect git diff, update the execution plan/docs if needed, and report only changed files, validation, and unresolved risks.`

## Visual review
`Review [page] using prompts/12-visual-consistency-review.md. Do not redesign; report material visual-contract violations only.`
