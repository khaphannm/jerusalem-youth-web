# Content Model Change Prompt

Evaluate requested CMS/content-model change:

`[CHANGE]`

Do not edit schema yet.

Check:
- `docs/03-content-model.md`
- frontend domain types/mappers
- existing content
- SEO/search impact
- migration/data-loss impact
- editorial workflow

Return:
1. proposed schema delta
2. affected code/content
3. migration/backfill requirement
4. compatibility risks
5. recommended rollout

A destructive change requires an explicit backup/migration/rollback plan.
