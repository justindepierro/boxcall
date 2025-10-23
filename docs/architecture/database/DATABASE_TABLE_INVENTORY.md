# Database Table Inventory & Domain Mapping (2025-08-09)

> Consolidated view of all tables appearing across current `schema.sql` and migration files (including legacy / superseded versions). Duplicate appearance across versioned migrations counts once.

## Summary

- Total distinct logical tables referenced: 52
- Core active domain clusters: Team Mgmt, Playbook & Game Planning, Practice Planning, Player Performance & Achievements, Family/Communication, Customization & Metadata, Supporting/Utility
- Redundancy candidates: older variant names (e.g., `depth_chart` vs `depth_charts`), multiple game plan migration series (v2/v3/fixed), overlapping achievement/performance tables.

## Domain Clusters

### 1. Team & Organization Management

| Table                      | Purpose                                 | Notes                               |
| -------------------------- | --------------------------------------- | ----------------------------------- |
| teams                      | Team identity + subscription/settings   | Core                                |
| organizations              | Higher-level org container (if adopted) | Appears once (008_step1)            |
| team_members               | Coaches/staff membership & roles        | RLS core                            |
| coaching_staff             | Potentially overlaps team_members       | Evaluate merge (008_step1 / roster) |
| team_players               | Player roster (baseline)                | Superseded by roster variants?      |
| player_roster              | Enhanced roster (positions, metadata)   | Harmonize with team_players         |
| depth_charts / depth_chart | Positional depth ordering               | Standardize singular/plural         |
| team_captains              | Captains designation                    | Could be attribute on player table  |
| player_eligibility         | Academic/eligibility tracking           | Consider performance cluster        |
| team_invites               | Invitation workflow                     | Core onboarding                     |
| parent_guardians           | Parent/guardian records                 | Family communication link           |
| profiles                   | User profile extras                     | May overlap Supabase auth metadata  |

### 2. Playbook & Game Planning

| Table                | Purpose                                | Notes                                      |
| -------------------- | -------------------------------------- | ------------------------------------------ |
| playbooks            | Container for plays                    | In `schema.sql`                            |
| plays                | Canonical play records                 | Add duplicate_key & custom_fields (future) |
| game_plans           | Weekly / opponent prep                 | Multiple rebuild migrations exist          |
| game_plan_situations | Situational buckets                    |                                            |
| game_plan_plays      | Association plays ↔ situations        |                                            |
| coach_cards          | Printable sideline reference           |                                            |
| game_plan_templates  | Reusable plan patterns                 |                                            |
| game_plan_analytics  | Execution/performance per play in plan |                                            |

### 3. Practice Planning System

| Table                 | Purpose                                        | Notes                                        |
| --------------------- | ---------------------------------------------- | -------------------------------------------- |
| practice_schedules    | Scheduled practice sessions                    | sometimes `practice_scripts` in earlier docs |
| practice_blocks       | Major segments (warmup, team)                  |                                              |
| practice_activities   | Drill / activity detail                        |                                              |
| practice_templates    | Reusable practice blueprints                   |                                              |
| practice_executions   | Actual execution logs                          |                                              |
| practice_layout_boxes | 8-box field layout                             |                                              |
| practice_analytics    | Aggregated practice stats                      |                                              |
| practice_attendance   | Attendance tracking (legacy in critical fixes) | Overlaps with executions metrics             |

### 4. Player Performance, Progress & Achievements

| Table                    | Purpose                            | Notes                            |
| ------------------------ | ---------------------------------- | -------------------------------- |
| player_performance       | Raw performance metrics            | Appears in two migration series  |
| player_progress_tracking | Longitudinal progress              |                                  |
| player_skill_assessments | Skill eval snapshots               |                                  |
| performance_analytics    | Aggregated analytics               |                                  |
| performance_benchmarks   | Benchmark reference values         |                                  |
| achievement_definitions  | Achievement catalog                | Newer structured version         |
| achievements             | Earlier achievement table (legacy) | Candidate deprecation            |
| achievement_criteria     | Criteria mapping for achievements  |                                  |
| player_achievements      | Player ↔ achievement mapping      |                                  |
| player_milestones        | Milestone events                   | Possibly merge into achievements |
| player_awards            | Awards distinct from achievements  |                                  |
| helmet_stickers          | Micro recognition tokens           | Roll-up to achievements?         |

### 5. Communication & Engagement

| Table                 | Purpose                      | Notes                    |
| --------------------- | ---------------------------- | ------------------------ |
| family_communications | Messages to families         |                          |
| family_engagement     | Engagement metrics           |                          |
| equipment             | Equipment inventory/tracking | Could be separate domain |

### 6. Scheduling & Calendar

| Table           | Purpose                                     | Notes                           |
| --------------- | ------------------------------------------- | ------------------------------- |
| calendar_events | Unified event store (practice/game/meeting) | Source for planning integration |

### 7. Customization & Metadata

| Table                    | Purpose                              | Notes                                                                   |
| ------------------------ | ------------------------------------ | ----------------------------------------------------------------------- |
| custom_field_definitions | Early custom field concept (generic) | Likely superseded by more specific play custom fields plan (Section 18) |

### 8. Security / Admin (Referenced)

| Table        | Purpose                    | Notes                                              |
| ------------ | -------------------------- | -------------------------------------------------- |
| super_admins | Referenced in RLS policies | Not defined in migrations shown; confirm existence |

## Redundancy / Consolidation Opportunities

| Area                             | Observed Issue                                                                                   | Recommendation                                                                        |
| -------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| Roster vs Player Tables          | `team_players` and `player_roster` both exist                                                    | Choose richer schema (player_roster) and deprecate other via view for backward compat |
| Depth Chart Naming               | `depth_charts` vs `depth_chart` vs `depth_charts` references                                     | Standardize to `depth_charts` (plural)                                                |
| Achievements Duplication         | `achievements` (legacy) vs structured `achievement_definitions` + criteria + player_achievements | Migrate data then drop legacy `achievements` & unify naming                           |
| Performance Tables Proliferation | Many granular analytics tables (performance_analytics, practice_analytics)                       | Evaluate a generic `metric_events` + derived materialized views                       |
| Coaching Staff vs Team Members   | Overlap in role storage                                                                          | Keep `team_members`; model extra attributes as extension columns or JSONB subobject   |
| Custom Fields Table              | Generic `custom_field_definitions` (not scoped clearly)                                          | Replace with domain-specific `play_custom_field_definitions` (proposed)               |
| Helmet Stickers & Player Awards  | Similar recognition artifacts                                                                    | Merge into `player_recognitions` with type enum                                       |
| Milestones vs Achievements       | Potential conceptual overlap                                                                     | Consider milestone as type or dimension of achievement                                |

## Proposed Deprecation Sequence (Low-Risk First)

1. Standardize depth chart table naming; create view for old name.
2. Introduce unified roster table; deprecate duplicate after migration.
3. Consolidate achievement legacy tables into structured set.
4. Merge recognition artifacts (helmet_stickers, player_awards) into a single polymorphic table.
5. Replace generic custom field table with domain-specific definitions (play) and remove unused generic entries.
6. Introduce metrics event stream (if needed) to reduce table sprawl (practice/performance analytics).

## Table Count Justification

| Domain                  | Distinct Tables | Rationale                                                                  |
| ----------------------- | --------------- | -------------------------------------------------------------------------- |
| Team/Org                | 11              | Multi-layer roster, roles, eligibility, guardians; can be trimmed to 6–7   |
| Playbook/Game Plan      | 8               | Core strategic planning lifecycle                                          |
| Practice                | 8               | Complex scheduling + execution analytics; could trim 1–2 via consolidation |
| Performance/Achievement | 13              | High granularity; strongest consolidation target                           |
| Communication/Equipment | 3               | Distinct functional areas                                                  |
| Scheduling              | 1               | Central calendar                                                           |
| Customization           | 1               | Replace with scoped variant                                                |
| Security/Admin          | 1               | RLS reference                                                              |

## Next Actions

1. Confirm which tables are actually provisioned in current Supabase (run introspection) – mark absent/legacy.
2. Draft consolidation migration plan (views first, then data copy, then drop).
3. Update master roadmap Section 5 with deprecation sub-list.
4. Prepare ERD focusing only on target retained tables.
5. Implement `play_custom_field_definitions` (avoid name collision with existing generic table).

## Quick ERD Targets (Post-Consolidation Goal)

Approximate retained core tables after consolidation: **~28–32**.

## Open Questions

- Are parent communication features active yet? If not, postpone related tables creation until feature sprint.
- Is `organizations` required for near-term multi-team needs? If not, delay migration.
- Confirm actual usage of `profiles` vs Supabase auth metadata.

---

Generated: 2025-08-09
