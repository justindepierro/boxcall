# NOT NULL Migration Plan — plays.duplicate_key

Goal: Enforce `NOT NULL` on `plays.duplicate_key` after confirming all active (non-archived) rows possess a value and generation is guaranteed.

## Preconditions

1. Partial unique index live: `idx_plays_playbook_duplicate_key_active`.
2. `scripts/verify_duplicate_key_health.ts` reports 0 active duplicate clusters.
3. Readiness script (`scripts/duplicate_key_readiness.ts`) exit code 0 for 3 consecutive daily runs.
4. All create/update paths pass through `PlaysDomainService` (ensures canonicalization + duplicate_key).

## Procedure

| Step | Action                                                                         | Verification                                |
| ---- | ------------------------------------------------------------------------------ | ------------------------------------------- |
| 1    | Add CI step `dup:readiness` (or direct tsx invocation) daily                   | History shows 3 green runs                  |
| 2    | Spot check: sample recent plays have non-null duplicate_key                    | Manual SQL selects                          |
| 3    | Create migration: `ALTER TABLE plays ALTER COLUMN duplicate_key SET NOT NULL;` | Migration applies cleanly                   |
| 4    | (Optional) Add CHECK `duplicate_key <> ''` if empty strings possible           | SELECT count(\*) WHERE duplicate_key='' = 0 |
| 5    | Deploy; monitor errors & telemetry                                             | No create/update failures                   |

## Rollback

If failures appear post‑deploy:

1. `ALTER TABLE plays ALTER COLUMN duplicate_key DROP NOT NULL;`
2. Capture failing payload + add test.
3. Patch offending path; re-run readiness script until green.

## Telemetry Enhancement (Future)

Add counter `play.duplicate_key.missing` (should remain 0). Alert if >0 within 24h window.

## Success Criteria

- 0 runtime errors related to NOT NULL over 48h.
- Telemetry: zero missing generation events.
- Readiness script stays green post migration.
