<!-- allow-empty -->

# DB Linter Recommendations Roadmap (Dec 22, 2025)

This roadmap is specifically for the “recommendations”-style lints currently coming from Supabase (ex: `unindexed_foreign_keys`, `unused_index`, `no_primary_key`).

The key goal is to separate:

1. **Real performance work we should do now** (tables actually used in the app)
2. **Future-facing work** (tables present but not currently exercised by UI flows)
3. **Do-not-touch-yet** items (indexes marked “unused” due to low traffic / staging stats)

## Current Findings (evidence-based)

### App table usage is broader than `.from('...')`

A quick source scan that includes both `.from('table')` and the `table('table')` wrapper found **47** unique tables referenced in `src/`.

This matters because earlier “only 4 tables used” conclusions were an artifact of searching only `.from()`.

### “Achievements tables don’t exist” is likely stale

`src/services/achievementService.ts` currently hard-disables the system:

- `const ACHIEVEMENT_SYSTEM_ENABLED = false`
- A header comment says `achievement_definitions` / `achievement_progress` “don’t exist in current schema”

However, repo migrations already include these tables:

- `supabase/migrations/20251211210000_add_missing_tables.sql` creates `achievement_definitions` and `achievement_progress`.

So the service is behaving like “scaffolded feature,” but the database schema appears to have moved on.

## Track A — Fix Now (used tables + missing FK indexes)

These are `unindexed_foreign_keys` items where the **table is referenced in app code** (so the missing index can become a real query hot spot).

Recommended action for each: add a normal btree index on the FK column(s) referenced by the foreign key.

- `play_executions` (used heavily)
  - Missing FK indexes per lint: `formation_id`, `recorded_by`
  - Why now: execution tracking and analytics are active features (`src/services/executionTrackingService.ts`, `src/services/sessionAnalyticsService.ts`).

- `notifications` (used)
  - Missing FK indexes per lint: `comment_id`, `triggered_by_user_id`
  - Why now: notifications polling/subscriptions and feed interactions rely on this.

- `comments` (used)
  - Missing FK indexes per lint: `parent_id`, `user_id`
  - Why now: social/comment threads and reactions are active.

- `post_comments` (used)
  - Missing FK indexes per lint: `author_id`, `parent_comment_id`
  - Why now: posts/comments UI is active.

- `invitation_attempts` (used)
  - Missing FK indexes per lint: `attempted_by`, `player_id`
  - Why now: roster invitation flows are implemented (`src/services/invitationService.ts`).

- `practice_templates` (used)
  - Missing FK indexes per lint: `created_by`, `team_id`
  - Why now: templates appear in practice planning flows.

- `plays` (used heavily)
  - Missing FK indexes per lint: `version_created_by`

- `play_calls` (legacy; deprecated in favor of `play_executions`)
- `play_executions` (canonical)
  - Missing FK indexes per lint: `play_id`

- `formations` (used heavily)
  - Missing FK indexes per lint: `created_by`

- Achievements tables (`achievement_definitions`, `achievement_progress`, `achievements`) (used in code, but feature-flagged off)
  - Missing FK indexes per lint: `team_id`, `achievement_id`, `player_id`
  - Recommendation: do the schema/index work now (cheap), but decide separately whether to flip the feature flag.

### Deliverable

- Create a single migration that adds only the FK indexes above.
- Re-run Supabase lints to confirm `unindexed_foreign_keys` drops meaningfully.

## Track B — Defer (unindexed FKs on unused tables)

These showed up as `unindexed_foreign_keys`, but the tables currently have **0 references in app code**, so they’re likely not on hot paths yet.

- `game_sessions` (0 references)
- `practice_sessions` (0 references)
- `play_versions` (0 references)

Recommendation:

- Don’t churn the schema purely to satisfy advisory lints.
- Revisit when UI routes/services are merged in and we can verify query patterns.

## Track C — “unused_index” (do not aggressively drop)

There are currently **148** `unused_index` warnings.

Important nuance: these warnings are based on index usage stats (ex: `pg_stat_user_indexes`) which can be misleading in:

- low traffic environments
- recently created indexes
- query plans that _should_ use the index in production but haven’t yet due to limited workload

Recommendation:

- Treat `unused_index` as a **review queue**, not an auto-fix.
- Only consider dropping an index when all of these are true:
  - It is not backing a constraint (PK/unique)
  - It is not needed for an FK enforcement strategy you care about
  - It is not a known hot-path filter/join
  - It stays unused under realistic production workload for an extended window
  - You have a rollback migration ready

Deliverable:

- A follow-up doc or checklist-driven review where we:
  - group indexes by table
  - mark “keep” for access patterns we know are real
  - mark “candidate to drop” for provably dead indexes

## Track D — Schema / Types / Reality alignment

There are hints of drift between “schema snapshot” and “actual migrations / types.”

- `database/schema.sql` appears to be a snapshot, not necessarily current.
- Code comments claim tables don’t exist that _do_ exist in migrations.

Recommended alignment work:

- Ensure the “source of truth” is `supabase/migrations/`.
- Update `database/schema.sql` snapshot if you rely on it for audits.
- Regenerate types from the live DB (or from migrations, if that’s your chosen pipeline) and remove stale “tables don’t exist” comments.

## Suggested Next Steps (minimal + high leverage)

1. Add FK indexes for Track A tables in one migration.
2. If you use the “Missing Foreign-Key Indexes” snippet, consider indexing all `public` FKs (not `auth`/`storage`) and then clean up any resulting `duplicate_index` warnings.
3. Re-run Supabase lints to confirm `unindexed_foreign_keys` clears.
4. Open a follow-up PR to address the Achievements feature toggle once the DB schema is confirmed in the target environment.
5. Start an index review queue for `unused_index` instead of removing them immediately.

## Recent Applied Migrations (Dec 22, 2025)

- FK index subset (from lints list): [supabase/migrations/20251222220000_add_fk_indexes_for_unindexed_foreign_keys.sql](supabase/migrations/20251222220000_add_fk_indexes_for_unindexed_foreign_keys.sql)
- FK index all `public` foreign keys: [supabase/migrations/20251222223500_add_fk_indexes_for_all_public_foreign_keys.sql](supabase/migrations/20251222223500_add_fk_indexes_for_all_public_foreign_keys.sql)
- Drop duplicate generated `idx_fk_*` indexes: [supabase/migrations/20251222225500_drop_duplicate_idx_fk_indexes.sql](supabase/migrations/20251222225500_drop_duplicate_idx_fk_indexes.sql)
