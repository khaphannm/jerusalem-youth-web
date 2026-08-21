# Bug Fix Prompt

Investigate `[BUG-ID / DESCRIPTION]`.

Before editing:
1. Reproduce or trace the failure.
2. Identify the root cause.
3. Identify the smallest safe fix.
4. Check whether the same defect pattern exists in directly related code.

Then:
- implement the smallest safe fix;
- add/update a regression test when practical;
- run relevant checks;
- review the diff for unintended behavior changes.

Do not turn the bug fix into a general refactor.

Report:
- Root cause
- Changed files
- Validation
- Remaining risk
