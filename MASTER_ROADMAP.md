# 📘 MASTER PRODUCT & TECH ROADMAP (2025)

> Single source of truth unifying feature vision, architecture evolution, data normalization, performance, mobile, quality, and operational readiness.

---

## 1. PRODUCT VISION

| Pillar                       | Outcome                                  | Core KPI                        | 2025 Target |
| ---------------------------- | ---------------------------------------- | ------------------------------- | ----------- |
| Lightning Play Creation      | Idea → Saved in < 30s (mobile)           | Median play create time         | ≤ 0:30      |
| Integrated Coaching Workflow | Seamless Playbook → Practice → Game Plan | Cross-view task completion time | -40%        |
| Data Trust & Consistency     | Canonical normalized storage             | Duplicate / variant rate        | <0.5%       |
| Performance & Reliability    | Fast, resilient UI                       | P95 input latency               | <120ms      |
| Scalable Architecture        | Multi-team growth-ready                  | Ops escalations/mo              | <2          |
| Engagement & Retention       | Coaches return & expand usage            | 4‑week retention                | 55%         |

---

## 2. ARCHITECTURE SNAPSHOT

| Layer         | Current                                  | Target Evolution                              | Actions                                            |
| ------------- | ---------------------------------------- | --------------------------------------------- | -------------------------------------------------- |
| Frontend      | React + TS + Vite                        | Modular domain-driven feature slices          | Continue component extraction; enforce boundaries  |
| Data Access   | Ad-hoc service objects                   | Unified DataService + query hooks             | Introduce `data/` adapters + caching policy matrix |
| State         | Local + (planned React Query)            | React Query + thin view state                 | Migrate play / game plan fetch & mutate paths      |
| Normalization | Utility scattered + new canonical module | Single canonical pipeline pre-DB + retro jobs | Integrate `playDataStandardization` centrally      |
| Search        | Basic text + future full-text            | Weighted token search + fuzzy assist          | Build search doc + index & scoring logic           |
| Observability | Manual console / ad-hoc                  | Telemetry events + Web Vitals + error tracing | Add lightweight event bus + provider               |
| Security      | RLS policies (draft)                     | Hardened RLS + audit logging + rate limits    | Review policies; add unique constraints            |

---

## 3. DATA & NORMALIZATION STRATEGY

Goals:

- Canonical ingestion → deterministic storage → indexed search tokens.
- Eliminate variant drift ("Power O", "power o", "Pwr O").

Components:

1. Canonical Functions: `canonicalizePlayInput`, `computeDuplicateKey` (already created).
2. Enforcement Points:
   - UI (onBlur / Quick Entry) – soft normalize & preview.
   - Service Layer – authoritative canonicalization (ALWAYS before persistence).
   - Database – (Phase 2) unique index on `team_id + duplicate_key`.
3. Retro Normalization Migration:
   - Dry run: detect variants & produce diff report (JSON + markdown summary).
   - Apply canonical rewrite in transaction; re-build search vectors.
4. Search Document: build composite field (name, formation, personnel tokens).
5. Future: optional raw_input field if original formatting later needed.

Success Metrics:

- Duplicate rejection client + DB.
- Retro job reduces variant clusters to 1 canonical record each.

---

## 4. SEARCH & QUERY PERFORMANCE

| Dimension       | Plan                                             | Notes                                |
| --------------- | ------------------------------------------------ | ------------------------------------ |
| Tokenization    | Lowercase, accent fold, acronym preserve         | Use normalization util               |
| Weighted Fields | name (5), formation (3), personnel (2), tags (1) | Feed into ranking score              |
| Indexing        | GIN trigram + tsvector composite                 | Postgres migration after retro clean |
| Fuzzy Assist    | Client fuzzy (Fuse.js / custom) caching top N    | Debounce 120ms                       |
| Metrics         | Suggest latency, acceptance rate                 | Emit telemetry events                |

Phases:

1. Implement search document builder (utility ready).
2. Add search index migration.
3. Wire formation/personnel fuzzy suggestions (UI).
4. Extend to play name patterns & recency weighting.

---

## 5. DATABASE EVOLUTION & MIGRATIONS

Planned Migrations:

1. (009 DONE) Wave 1 scaffolding: compatibility views + unified `player_recognitions` table + `recognitions_all` view.
2. (011 DONE) RLS & immutability policies for `player_recognitions`.
3. (NEXT) Add `duplicate_key` column to plays (generated via canonical name + formation + personnel).
4. Backfill duplicate_key values with script (idempotent; dry-run diff first).
5. Add unique index `(team_id, duplicate_key)` (post-clean; create concurrently).
6. Recognition data backfill (planned migration 010) into `player_recognitions` from legacy sources (dry-run counts first).
7. Search tsvector & GIN index.
8. Telemetry/event tables (minimal schema) for usage analytics.

Safety:

- All destructive steps preceded by dry-run reports.
- Use explicit transaction + lock order plan to avoid deadlocks.

### 5.1 Deprecation & Consolidation Plan

Objective: Reduce table sprawl from 52 → ~30 without breaking existing code paths during transition.

Phases:

1. Wave 1 (Non-breaking scaffolding) – COMPLETE
   - 009: Roster & depth chart compatibility views + unified `player_recognitions` table + `recognitions_all` aggregation (no data copied).
   - 011: RLS & immutability enforcement for unified table.
2. Wave 2 (Data migration)
   - Migration 010 (now designated): Backfill `player_recognitions` from `achievements`, `helmet_stickers`, `player_awards`, `player_milestones` (insert-only, ON CONFLICT DO NOTHING, metadata lineage tags).
   - Add NOT NULL / CHECK constraints post-verify; drop warning triggers after cutover.
3. Wave 3 (Cutover)
   - Update application queries to target unified views/tables.
   - Add warning triggers on legacy tables (RAISE NOTICE on INSERT/UPDATE).
4. Wave 4 (Retire)
   - Archive legacy tables to S3 (CSV + JSON) with hash manifest.
   - Drop legacy tables & triggers.
5. Wave 5 (Optimize)
   - Add selective indexes & materialized views (recognitions aggregates, roster metrics).

Principles:

- Compatibility first (views instead of immediate drops).
- Reversible until Wave 4 (no destructive ops earlier).
- Instrument query usage (pg_stat_statements snapshot before removal).

KPIs:

- Legacy table query count reduced ≥90% before drop.
- No failed API calls attributed to missing tables in cutover week.

Risk Mitigation:

- Separate DDL introduction (009/010) from data moves (later migration IDs) for fast rollback.
- All data copy operations done in id batches with progress logs (future script).

### 5.2 Immediate Next Actions (Post Wave 1)

Ordered steps to progress safely toward Wave 2 cutover using live data (no mock data required):

1. Service Refactor (Roster): Point existing roster fetches to `team_players_view` (or `team_players_compat`) ensuring no functional regression.
2. Recognitions Read Path: Implement lightweight service / API method that queries `recognitions_all` (read-only) for early UI iteration; keep writes to legacy sources for now.
3. New Recognition Writes (Optional Pilot): Allow experimental direct inserts into `player_recognitions` behind a feature flag; legacy tables remain authoritative until backfill.
4. Backfill Preparation: Collect row counts & sample hashes from each legacy table and matching counts from `recognitions_all`; store a small JSON report committed to `docs/` for audit.
5. Draft Migration 010: Parameter-free INSERT…SELECT statements with deterministic lineage metadata (e.g., metadata->>'legacy_id', metadata->>'legacy_table'). Include idempotency (ON CONFLICT DO NOTHING on primary key or composite hash) and wrap in explicit transaction batches (size-limited if large volume expected).
6. Dry Run Strategy: Execute SELECT-only simulated variants (EXPLAIN + counts) before enabling actual inserts; verify zero duplicate primary ids.
7. Duplicate Key Column: Add `duplicate_key` to plays (nullable initially) + backfill script using existing canonical utilities.
8. Index & Constraint Staging: After backfill & normalization, create unique index concurrently; monitor violations counter (should be zero) prior to enforcing NOT NULL.
9. Telemetry Instrumentation: Add events for recognition reads and any new unified table writes to monitor adoption.
10. Legacy Query Usage Capture: Snapshot `pg_stat_statements` (or Supabase query insights) pre and post service refactor to measure dependency reduction.

Success Exit for Next Block: Roster service reading exclusively via view, recognition read path live, draft backfill migration reviewed with verified row parity.

---

## 6. PERFORMANCE & WEB VITALS

Current Wins: 58% bundle reduction; architecture refactor prepared for further lazy loading.
Next Actions:

1. Component-level lazy imports for heavy routes (Practice, Game Plan exports).
2. Introduce suspense boundaries + skeleton states.
3. Memoize hot path components (PlayCard grid, suggestion list).
4. Capture Web Vitals (FCP, LCP, INP) – send to telemetry endpoint.
5. Budget: enforce size thresholds in CI (bundle stats JSON diff).

Targets:

- P95 INP < 200ms
- First interactive (mobile) < 3.0s on 4G simulated
- JS shipped < 250KB gzip initial path

---

## 7. MOBILE UX & ACCESSIBILITY

Focus: One‑handed creation on 390px width.
Improvements:

- Compact Mode toggle (persist localStorage).
- Swipeable field groups (Name/Formation/Type/Personnel).
- Touch-target min 44px; numeric keypad for personnel.
- Offline draft buffer (localStorage) – auto resubmit.
- Accessibility: labels, focus order, ARIA for suggestion lists.

KPIs: Mobile play creation completion rate + abandonment rate.

---

## 8. TESTING & QUALITY STRATEGY

| Layer         | Tools                      | Coverage Goal                   |
| ------------- | -------------------------- | ------------------------------- |
| Unit          | Vitest / Jest              | 70% critical utils/services     |
| Component     | React Testing Library      | Key forms & suggestion UX       |
| Integration   | In-memory API mocks        | Play create + duplicate path    |
| E2E (Phase 2) | Playwright (smoke)         | Core flows: play create, import |
| Performance   | Custom script + Web Vitals | Trend monitoring                |

Immediate Tests To Add:

- canonicalizePlayInput cases.
- duplicate key computation edge cases (spacing, punctuation, acronyms).
- Quick Entry parsing (pipes, commas, mixed ordering).

---

## 9. OBSERVABILITY & TELEMETRY

Initial Event Set:

- play.create.started / succeeded / failed
- play.suggestion.accepted (type: formation|personnel|name, rank, latency_ms)
- play.duplicate.detected (client/server)
- performance.web_vitals (FCP, LCP, INP, CLS)

Infra:

- Lightweight event dispatcher (queue + batch timer).
- Console + network dual sink (dev vs prod).
- Future: error boundary integration → event stream.

---

## 10. SECURITY & COMPLIANCE

Controls Roadmap:

1. Harden RLS for all new columns (duplicate_key, telemetry tables – read restricted).
2. Add audit log triggers (play create/update/delete minimal record).
3. Rate limiting (edge: per user play creations/min) – Phase 2.
4. Content validation to prevent script injection (server-side sanitation on text fields).
5. CSP & security headers already configured – review quarterly.

---

## 11. PHASED TIMELINE (REFERENCE)

| Phase | Focus                   | Duration | Exit Criteria                                  |
| ----- | ----------------------- | -------- | ---------------------------------------------- |
| A     | Speed & Normalization   | Active   | Canonical pipeline; suggestions for formation  |
| B     | Smart Assist & Mobile   | +1 wk    | Formation+Personnel+Name assist; mobile layout |
| C     | Power Tools & Templates | +1 wk    | Template clone, quick actions, keyboard map    |
| D     | Search & DB Hardening   | +1 wk    | Search indices + unique constraint staged      |
| E     | Observability & Quality | +1 wk    | Telemetry, base tests, vitals dashboard        |
| F     | Performance Hardening   | +1 wk    | INP & bundle targets met                       |

---

## 12. CORE KPIs & TARGETS

| KPI                     | Definition                 | Baseline  | Target |
| ----------------------- | -------------------------- | --------- | ------ |
| Median Play Create Time | Idea → saved (mobile)      | ~2–3m     | 0:30   |
| Duplicate Variant Rate  | Plays blocked / attempts   | >5% (est) | <0.5%  |
| Suggest Acceptance Rate | Suggest → user pick        | N/A       | ≥60%   |
| P95 INP                 | Interaction to next paint  | TBD       | <200ms |
| Retention 4 Week        | % active after 4 weeks     | TBD       | ≥55%   |
| Error Rate              | Failed play create / total | N/A       | <1%    |

---

## 13. RISK REGISTER

| Risk                              | Impact     | Likelihood | Mitigation                              |
| --------------------------------- | ---------- | ---------- | --------------------------------------- |
| Retro normalization corrupts data | High       | Low        | Dry run + backup + transactional writes |
| Duplicate index lock contention   | Medium     | Med        | Off-peak deploy; create concurrently    |
| Suggestion latency spikes         | UX Degrade | Med        | Cache + debounce + warm top N           |
| Mobile layout regressions         | Adoption   | Med        | Add viewport snapshot tests             |
| Telemetry PII leakage             | Compliance | Low        | Schema whitelist & scrub layer          |

---

## 14. BACKLOG (CURATED)

Near-term:

- Personnel & play name fuzzy suggestions.
- Canonical integration in service layer.
- Retro normalization script (dry run mode).
- Duplicate unique index migration (post-clean).
- Suggestion dropdown keyboard navigation.
- Custom fields: schema + migrations (definitions + values JSONB) – design spike.

Mid-term:

- Template/clone system.
- Situation quick actions.
- Telemetry batching + dashboard integration.
- Offline draft sync.
- Web Vitals reporting pipeline.
- Custom field UI builder + filter composer.

Long-term / Strategic:

- Video clip attachment.
- Advanced analytics dashboard.
- Mobile PWA packaging & native shell.
- Role-based customization & permissions UI.
- Cross-team sharable custom field presets / marketplace.

---

## 15. MIGRATION PLAN (RETRO NORMALIZATION)

1. Export current plays → JSON snapshot (backup).
2. Run analyzer script: produce variant clusters (key = normalized duplicate_key) with member list.
3. Generate diff report (per cluster chosen canonical + changed fields).
4. Manual review (threshold: clusters > size 5 flagged).
5. Apply normalization (transaction; update plays + recompute search vectors).
6. Validate counts (pre vs post) & random sample spot-check.
7. Deploy unique index concurrently (if violations = 0).

---

## 16. NEXT 14-DAY EXECUTION PLAN

Day 1: Roster service refactor → use `team_players_view`; add quick regression checks.
Day 2: Implement `recognitions_all` read service + simple API endpoint; add telemetry (recognitions.read).
Day 3: Draft Migration 010 (SELECT-only dry run scripts + row count report generation); commit report.
Day 4: Integrate canonicalization (if not already) in PlaysService write path + add duplicate_key compute; seed duplicate_key for new writes.
Day 5: Duplicate_key backfill script (dry run diff + actual update) + preliminary unique index violation scan.
Day 6: Suggestion dropdown (formation + personnel) with keyboard nav & recency weighting + acceptance telemetry.
Day 7: Extend suggestions to play name + add search doc builder integration.
Day 8: Retro normalization analyzer (clusters report) & decide canonical merges.
Day 9: Web Vitals capture & telemetry dispatcher; begin bundling budget metrics.
Day 10: Mobile compact mode toggle + swipe groups implementation.
Day 11: Offline draft buffer (basic) + error boundary event hook.
Day 12: Bundle budget enforcement + lazy load heavy routes; INP measurement pass (memoization sweep).
Day 13: Finalize & (if approved) execute Migration 010 backfill in controlled batches.
Day 14: Risk review, unique index concurrency plan, KPI baseline snapshot, custom fields schema migration draft.

---

## 17. SUMMARY

Core acceleration + canonical data layer are foundation. Roadmap phases build upward: assistive intelligence → operational quality → performance & scalability. This document supersedes fragmented prior roadmap markdowns and should be updated incrementally (append changelog entries rather than ad-hoc new docs).

Changelog:

- 2025-08-09: Initial consolidation draft created.
- 2025-08-09: Added Custom Field Extensibility system section & integrated tasks.
- 2025-08-09: Applied migrations 009 (Wave 1 scaffolding) & 011 (RLS) and updated deprecation & execution plans.
- 2025-08-09: Team Bulletin onboarding cleanup – removed mock Trophy Case, Feed, Calendar, Stats & Upcoming Events placeholders replaced with `OnboardingHint` component; added reusable onboarding component.
- 2025-08-09: Added TEAM_DASHBOARD_EXECUTION_PLAN.md & initiated Phase 0 Step 1 (Feed & Calendar placeholders).

### 17.1 Dashboard Cleanup & Onboarding (Active)

Objective: Eliminate misleading mock data and guide first actions for new teams.

Scope Completed:

- Replaced Trophy Case mock with tutorial steps & CTA.
- Introduced `OnboardingHint` reusable component (dashed card style, steps + actions).
- Removed mock Feed posts (now onboarding hint in `TeamFeed`).
- Removed mock Calendar events (calendar onboarding state).
- Replaced Season Stats panel numbers with onboarding placeholder.
- Replaced Upcoming Events list with calendar pointer onboarding placeholder.

Next Actions (Ordered):

1. Contrast Audit: Identify low-contrast buttons (white text on light backgrounds) & standardize variants.
2. Remove residual emoji icons (prefer consistent Icon set) – audit TeamBulletin & related dashboard components.
3. Telemetry: Emit onboarding.view & onboarding.action events for each hint (component-level helper).
4. Feed Backend Planning: Define minimal schema (posts, attachments, reactions) + RLS policies; draft migration IDs.
5. Calendar Data Model: Draft events table schema (type enum, start/end, location, optional opponent, metadata JSONB) + initial RLS sketch.
6. Stats Source Plan: Define aggregation strategy (games table + derived season_stats view); list inputs required before UI -> real.
7. Achievement System Spec Refinement: Map planned sticker/goal inputs to future statistics to avoid schema churn.
8. Consolidate onboarding docs (docs/ONBOARDING_GUIDE.md) explaining component usage & extension pattern.
9. Accessibility Pass: Ensure hint components are screen-reader friendly (role="status" / heading levels logical, focus management on first visit).
10. Mobile Layout Optimization: Stack hint components efficiently on <640px; evaluate collapsible sections after first completion.

Exit Criteria:

- No mock numeric/statistical data visible in production build.
- All onboarding hint interactions captured via telemetry.
- Draft DB schemas (feed, events, stats) committed with migration placeholders.
- Contrast & accessibility issues resolved (Lighthouse contrast ≥ 90%).
- Documentation published (guide + updated roadmap) and linked in SUMMARY.

---

## 18. CUSTOM FIELD EXTENSIBILITY SYSTEM

Goal: Allow each team to define, capture, and filter on their own structured play metadata (e.g., "Defense Stress", "Install Day", "QB Read", "Motion Family") without code changes while preserving performance, data integrity, and search efficiency.

### 18.1 Use Cases

1. Install Tracking: Field "install_day" (number) to plan progression.
2. Analytics Tags: Numeric difficulty rating or defensive stress score.
3. Situational Flags: Boolean "two_point_ready", "short_yardage_core".
4. Group Classifications: Multi-select "concept_family" (e.g., Smash, Mesh, Flood).
5. Conditional Filters: Query all plays with concept_family includes "Mesh" AND install_day <= 3 AND defense_stress >= 4.

### 18.2 Design Principles

- Non-invasive: Core schema remains stable; custom metadata isolated.
- Performant filtering for common patterns (<150 ms server-side for typical sets).
- Secure per team (RLS-protected; no leakage across teams).
- Introspectable: UI can fetch definitions then render dynamic form & filters.
- Backwards compatible: Plays without custom fields still valid (empty object).

### 18.3 Data Model Options (Evaluation)

| Option                                   | Pros                                        | Cons                                    | Decision                 |
| ---------------------------------------- | ------------------------------------------- | --------------------------------------- | ------------------------ |
| Pure JSONB column on plays               | Simple, 1 join                              | Hard to validate types; verbose updates | Partial (values storage) |
| EAV (play_custom_field_values table)     | Precise indexing per field                  | Many rows & joins; slower large queries | Rejected (complex)       |
| Hybrid: definitions table + JSONB values | Fast single read + typed metadata from defs | Requires application validation layer   | Chosen                   |

### 18.4 Proposed Schema (Phase 1)

```sql
-- Field definitions (team scoped)
CREATE TABLE play_custom_field_definitions (
   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
   team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
   field_name TEXT NOT NULL,              -- machine key (snake_case)
   field_label TEXT NOT NULL,             -- display label
   field_type TEXT NOT NULL CHECK (field_type IN ('text','number','boolean','select','multi_select','date','url')),
   field_description TEXT,
   field_options TEXT[],                  -- for select/multi_select
   default_value JSONB,
   is_required BOOLEAN DEFAULT false,
   display_order INTEGER DEFAULT 0,
   category TEXT,                         -- optional grouping
   is_archived BOOLEAN DEFAULT false,
   created_at TIMESTAMPTZ DEFAULT NOW(),
   updated_at TIMESTAMPTZ DEFAULT NOW(),
   UNIQUE(team_id, field_name)
);

-- Add to plays (Phase 1 migration)
ALTER TABLE plays ADD COLUMN custom_fields JSONB DEFAULT '{}'::jsonb;

-- (Phase 2) GIN index for key existence & containment queries
CREATE INDEX idx_plays_custom_fields ON plays USING GIN (custom_fields jsonb_path_ops);
```

### 18.5 RLS & Security

- Extend existing plays RLS policies – custom_fields inherits same row access.
- Separate RLS on definitions: only team members may CRUD within their team.
- Validation server-side: reject unknown field keys or wrong types on save.

### 18.6 Application Layer Flow

1. Fetch definitions (cache per team, ETag / timestamp invalidation).
2. Render dynamic section in PlayBuilder (group by category, ordered by display_order).
3. On change: local state → validate → merge into `custom_fields` patch.
4. On save: Service canonicalization step splits (core fields vs custom) then persists.
5. Filtering UI: Builder with (Field) (Op) (Value) rows; translates to query spec.

### 18.7 Filtering & Query Strategy

Common Operators by type:

- text/url: contains (ILIKE), equals, starts_with
- number/date: =, !=, >, >=, <, <=, between
- boolean: is true/false
- select: equals
- multi_select: contains_any, contains_all

SQL Generation Patterns:
| Type | Operator | SQL Snippet |
|------|----------|-------------|
| number | > | (custom_fields->>'install_day')::int > $1 |
| text | contains | (custom_fields->>'qb_read') ILIKE '%' || $1 || '%' |
| multi_select | contains_any | EXISTS (SELECT 1 FROM jsonb_array_elements_text(custom_fields->'concept_family') v WHERE v = ANY($1)) |
| multi_select | contains_all | NOT EXISTS (SELECT 1 FROM unnest($1) t WHERE NOT t = ANY(SELECT jsonb_array_elements_text(custom_fields->'concept_family'))) |

Optimization: Limit simultaneous custom field predicates to N (e.g., 6) initially; add EXPLAIN plan monitoring.

### 18.8 Validation Rules

- field*name: snake_case /^[a-z0-9*]+$/; length ≤ 40.
- select/multi_select: ≤ 50 options; each ≤ 30 chars.
- number: support min/max optional constraints (Phase 2 extension columns).
- multi_select stored as JSONB array of strings.
- date: ISO8601 date-only; convert to YYYY-MM-DD strings.

### 18.9 Canonicalization Extension

- Extend `canonicalizePlayInput` to ignore keys matching definition set; separate function `extractCustomFields(input, definitions)` that:
  - Filters only known field_names.
  - Coerces types (number parseFloat, boolean truthy mapping, date validated) – rejects invalid.
  - Normalizes text (reuse normalizeText for text/url labels optionally).
- Merge sanitized object into `custom_fields` before persistence.

### 18.10 UI/UX Components (Phase Breakdown)

Phase 1 (MVP):

- Read-only display of existing custom fields on PlayCard.
- Add/Edit modal section (simple vertical list inputs).

Phase 2 (Builder):

- "Custom Fields" settings page (CRUD definitions).
- Drag reorder (updates display_order).
- Field preview pane.

Phase 3 (Advanced Filtering):

- Filter builder with AND row groups (future OR groups / nested logic).
- Saved filter presets per user.

Phase 4 (Analytics Integration):

- Aggregate counts by select/multi_select.
- Heatmap for numeric distributions (install_day, defense_stress).

### 18.11 Telemetry Additions

- custom_field.definition.created / updated / archived
- custom_field.value.set (play_id, field_name)
- filter.builder.used (field_count, exec_time_ms)

### 18.12 Migration Plan Addendum

1. Add definitions table + custom_fields column (nullable default '{}').
2. Backfill existing plays to '{}'.
3. Deploy GIN index (concurrently) after initial adoption if query volume justifies.
4. Add server validation & UI consumption.
5. Monitor index usage; prune unused definitions (>180 days inactivity) policy (Phase 4).

### 18.13 Risks & Mitigations

| Risk                                      | Impact            | Mitigation                                                |
| ----------------------------------------- | ----------------- | --------------------------------------------------------- |
| Unbounded schema growth (too many fields) | Query slowdown    | Soft cap (e.g., 50 active fields/team) + warnings         |
| Inconsistent naming / duplicates          | Poor data hygiene | Enforce snake_case uniqueness + description required      |
| Large JSONB payload size                  | Storage & perf    | Encourage pruning/archiving; warn > X KB average          |
| Complex filter SQL injection attempts     | Security          | Parameterized queries only; whitelist field_names         |
| High cardinality numeric filters slow     | Performance       | Add functional index for popular numeric fields (Phase 3) |

### 18.14 KPI Extensions

- Custom Field Adoption: % teams defining ≥1 field (target 60% by Q4).
- Filter Usage: % playbook sessions using custom field filter (target 35%).
- Query Performance: P95 custom filter query time < 180ms.

### 18.15 Future Enhancements

- Field-level permissions (coach vs analyst visibility).
- Derived fields (formula expressions referencing other fields).
- Cross-team template marketplace (export/import definitions set).
- Auto-suggest fields based on usage patterns.

### 18.16 Implementation Sequencing (High-Level)

1. Schema + RLS + type defs.
2. Backend validation & service integration (extend canonical pipeline).
3. UI consumption (display + edit on PlayBuilder).
4. Definitions management UI.
5. Filter builder + query generation.
6. Index tuning + telemetry dashboards.
7. Advanced analytics (aggregations, distributions).

---
