# Playbook + Analytics Audit & Roadmap (Dec 2025)

## Goal

Make BoxCall the best playbook + football statistics platform by turning the playbook into an analytics-grade system:

- **Clean, consistent, validated data** (no schema drift, no ambiguous fields).
- **Event-based execution tracking** as the source of truth.
- **Fast, coach-friendly insights** (tendencies, efficiency, situation breakdowns, install/practice readiness).

## Current State (What You Already Have)

### ✅ Execution tracking foundation exists

- Tables (migrations): `practice_sessions`, `game_sessions`, `play_executions`.
- Client logging: `ExecutionTrackingService.logExecution()` used by `usePracticeSession` + `useGameSession`.
- Offline support: `offlineExecutionQueue` exists and replays later.
- Analytics services already query `play_executions` (e.g., `playConfidenceService`, `sessionAnalyticsService`, `situationalRecommender`).

### ✅ Playbook feature depth is strong

- Play cards capture a lot of tactical detail (formation, tags, strength, motion, protection, etc.).
- Custom play types are supported (play type CHECK constraint removed; trigger now only enforces non-empty).

### ⚠️ Data model drift / duplication signals

- There are multiple “analytics-ish” paths:
  - Legacy counters on `plays` (`times_called`, `times_successful`) and services built around them.
  - New event log: `play_executions` (better for analytics).
- Schema references in repo can be out of date relative to later migrations (e.g., `database/schema.sql` vs later “bulletproof” migrations).

## Audit Findings (Key Gaps to Fix)

### 1) Choose a single source of truth for stats

**Problem:** Some analytics are derived from `plays.times_called/times_successful`, while real tracking is in `play_executions`.

**Decision:**

- Make `play_executions` the canonical truth.
- Keep `plays.times_called/times_successful` only if maintained by DB triggers as a **cache** (never updated from client code).

### 2) Normalize taxonomy without losing “custom” flexibility

Custom play types are good, but analytics need consistent grouping.

**Add canonical dimensions** (per team/playbook):

- `play_type` (custom label) + `play_family` (canonical bucket: run/pass/rpo/play_action/screen/...)
- Concepts (e.g., `inside_zone`, `power`, `stick`, `mesh`, `flood`)
- Tags (coach tags) vs system tags (analytics tags)

### 3) Close context gaps in execution events

`play_executions` already stores many fields, but analytics gets dramatically better when we ensure these are captured consistently:

- **Opponent** (currently text on `game_sessions`)
- **Situation buckets** (down/distance bucket, field zone, hash, personnel)
- **Personnel + formation linkage** (FKs exist; ensure they’re always populated)
- **Result definition** (success/failure/neutral should be configurable by coaches, but still queryable)

### 4) Standardize naming + generated types

There are signs of field naming divergence (e.g., `p_type` vs `play_type` patterns across older/newer code).

**Goal:** “One name per concept” across:

- DB column
- generated types
- domain type
- UI form

## Roadmap (Phased)

### Phase 0 — “Data Hygiene” (1–3 days)

**Outcome:** one consistent schema + one stats source of truth.

✅ Completed (implemented in repo)

- Canonical truth is `play_executions`.
- `plays.times_called/times_successful` are treated as derived/cache-only and are no longer writable from client code.
- DB enforces single-source-of-truth:
  - `play_execution_stats` view aggregates from `play_executions`.
  - Triggers keep `plays.times_called/times_successful` in sync with `play_executions`.
  - Guardrail trigger blocks manual counter edits.
  - Migration: `20251224120000_play_execution_stats_single_source_of_truth.sql`.
- Legacy `play_calls` is deprecated and downstream dependencies removed:
  - Migration: `20251224123000_deprecate_play_calls_and_season_stats.sql`.
- Indexes exist for analytics reads (already present in earlier migrations), including `play_executions(team_id)`, `play_executions(play_id)`, `play_executions(executed_at desc)`, and session FK indexes.

Still worth validating (quick sanity checks)

- Ensure every execution event always carries `team_id` (and ideally server-enforced).
- Confirm RLS policies for `play_executions` + session tables match team isolation expectations.

### Phase 1 — “Analytics-Ready Event Model” (3–7 days)

**Outcome:** every execution has enough context for meaningful breakdowns.

- Expand/validate `play_executions`:
  - Always capture: `recorded_by`, `recorded_mode`, `executed_at`, `result`, `yards_gained` (game), `rep_number` (practice).
  - Store computed **bucket fields** for fast queries (or compute via view):
    - `down_distance_bucket` (e.g., `1st_10`, `3rd_short`, `4th_medium`)
    - `field_zone` (`backed_up`, `open_field`, `plus`, `red_zone`, `goal_line`)
- Create read-optimized views:
  - `v_play_stats_overall`
  - `v_play_stats_by_down`
  - `v_play_stats_by_zone`
  - `v_play_stats_by_coverage`

#### Phase 1.1 — “Single Taxonomy Contract” (add to Phase 1)

**Goal:** playbook labels, execution events, and analytics queries must share the same definitions.

Coach-configurable situation buckets (team-scoped)

- Field position markers (yardline thresholds): what counts as `goal_line`, `red_zone`, `plus`, `backed_up`.
- Down & distance thresholds: what counts as `short/medium/long` (and optionally “very long”).
- (Optional) Success rules by situation (ex: 3rd&1 success = >=1 yard).

Implementation principle

- Store raw event data once, bucketize deterministically in one place, and never let the UI invent its own thresholds.
- Prefer SQL functions used by analytics views (and optionally triggers if we later store cache columns).
- Make playbook filters/presets read from team settings (no hard-coded thresholds).

### Phase 2 — “Taxonomy & Dimensions” (1–2 weeks)

**Outcome:** coaches can enter data naturally while analytics stays clean.

- Add dimension tables (scoped by `team_id` or `playbook_id`):
  - `opponents` (name, league, metadata) and reference from `game_sessions`.
  - `play_types` (custom labels) + `play_families` (canonical buckets).
  - `concepts` + join table `play_concepts` (many-to-many).
  - `tags` + join table `play_tags` (many-to-many).
- Add “canonicalization” rules:
  - Store raw coach-entered label + normalized key (lowercase/trimmed) to prevent duplicates.

### Phase 3 — “Player-Level + Assignment-Level Analytics” (2–4 weeks)

**Outcome:** true football analytics (who did what, not just what was called).

- Connect executions to personnel/positions/players:
  - `execution_participants` (execution_id, player_id, position, role)
  - Optional: route-level execution results (Phase 3 in session types hints at this).
- Merge with roster (`team_players`) for reporting by player/position group.

### Phase 4 — “Coach Dashboards + Exports” (2–4 weeks)

**Outcome:** wow-factor insights, easy exports for staff meetings.

- Dashboards:
  - Tendencies by situation (down/distance/zone/personnel)
  - Explosive play rate, success rate, avg yards
  - “Top calls” and “most efficient calls” with sample-size warnings
  - Practice-to-game translation (practice success vs game success)
- Export:
  - CSV exports for Hudl/Excel
  - Printable “tendency cards”

## Audit Sweep Checklist (Use This to Verify Where You’re At)

### Database

- [x] Verify `play_executions` is the canonical source of truth (not `play_calls`).
- [ ] Confirm RLS policies exist + are team-scoped for session + execution tables.
- [ ] Confirm all FKs are indexed (or intentionally not).
- [ ] Confirm every table has `created_at`, `updated_at`, `created_by` where needed.
- [ ] Confirm validation triggers match current flexibility (custom play types allowed).

### App Data Flow

- [ ] Play creation/edit goes through one service layer (no direct fetch).
- [ ] Execution logging always includes team + session references.
- [ ] Offline queue replays are idempotent (no duplicate executions).

### Analytics Integrity

- [x] Stats shown in UI are derived from `play_executions` (or cached by DB triggers), not client-edited counters.
- [ ] Success definition is consistent (and configurable) across practice vs game.
- [ ] Sample-size awareness: don’t show “95% success” on 2 reps without a warning.

## “Make It Amazing” Ideas (High ROI)

- Coach-defined success rules per situation (e.g., 3rd&1 success = >=1 yard).
- Automatic tendency detection + “self-scout” alerts.
- Opponent scouting inputs (coverage/front) from quick tags to build opponent profiles.
- Confidence model fed by real execution data (you already have confidence hooks/services).

## Brainstorming (What You Mean by “Same in Playbook, Collection, and Stats”)

If we want breakdowns like “3rd & Long” or “Red Zone”, we need one shared taxonomy so we don’t end up with:

- Playbook UI using one definition
- Execution logging capturing different inputs
- Analytics grouping with a third definition

Add team-level “Situation Definitions” (Phase 1.1)

- Field zones: coach-defined yardline thresholds for `goal_line`, `red_zone`, `plus`, `backed_up`.
- Down & distance buckets: coach-defined thresholds for `short/medium/long/very_long` (especially for “3rd & X”).
- (Optional) Success rules: coach-defined success by situation (yards-to-gain rules), but stored/queryable.

Make playbook tags use the same keys

- When a coach marks a play as “good in Red Zone / 3rd & Short”, those labels should be generated from (or validated against) the same team definitions used by execution bucketing.
- This keeps “what we planned”, “what we ran”, and “what worked” speaking the same language.

---

Next step: Phase 1 punch-list (analytics-ready events)

- Decide whether bucket fields are stored (columns) vs computed (views).
- If stored: add bucket columns (and backfill) for `down_distance_bucket` and `field_zone`.
- If computed: add read-optimized views for breakdowns (overall/by-down/by-zone) that are team-scoped.
- Define and enforce a single `result`/success model (configurable coach rules, but queryable).
