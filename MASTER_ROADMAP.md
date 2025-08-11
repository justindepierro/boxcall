# 📘 MASTER PRODUCT & TECH ROADMAP (2025) — Concise Index

> Slim index (<200 lines). Deep dives: `docs/roadmap/`. This file holds priority ordering, status snapshot, risks, and near-term execution ladder.

Last Updated: 2025-08-10

---

## 1. TOP PRIORITIES (Ordered)

1. UI Token Cleanup: remove remaining hover/dark raw gray text utilities (~50 refs) + migrate headings to `<Typography />`.
2. Canonical Write Path Expansion: ensure ALL play create/update vectors use `PlaysDomainService`.
3. Migration 010 (Recognitions): counts parity report + idempotent INSERT…SELECT with lineage.
4. Telemetry Phase 2: persist Web Vitals + error events & alert on `play.duplicate_key.missing`.
5. Contrast & Accessibility Gate: contrast audit + axe smoke CI.
6. Search Enablement: integrate search doc builder + fuzzy formation/personnel suggestions.
7. NOT NULL (duplicate_key): 3 green readiness runs → apply constraint.
8. Performance Hardening: route-level code splitting & standardized Suspense skeletons.

---

## 2. STATUS SNAPSHOT

| Area                     | Status                  | Next Action                      |
| ------------------------ | ----------------------- | -------------------------------- |
| Hover Gray Text Cleanup  | In progress (~50 refs)  | Codemod + map to semantic tokens |
| Typography Migration     | Pending                 | Replace heading utilities        |
| Canonicalization         | Domain service + pilot  | Audit remaining write paths      |
| duplicate_key Index      | Live, conflicts zero    | Monitor readiness script         |
| NOT NULL Readiness       | Script in CI            | 3 consecutive green runs         |
| Telemetry Dispatcher     | Skeleton + events wired | Choose persistence sink          |
| Web Vitals               | Buffered only           | Persist + dashboard proto        |
| Error Boundary Telemetry | Emits event             | Severity + grouping strategy     |
| Migration 010            | Concept only            | Produce counts & draft SQL       |
| Search Doc Builder       | Utility idle            | Hook into create/update & query  |
| Contrast/Axe             | Not implemented         | Add CI smoke test                |
| Dispatcher Tests         | Basic flush tests       | Add canonicalization tests       |

---

## 3. RECENT ACCOMPLISHMENTS

- duplicate_key column added, backfilled; conflicts auto-archived; partial unique index live.
- Health + auto-archive scripts (`dup:health`, `dup:fix`) & readiness script (`dup:readiness`).
- Telemetry dispatcher/provider + event constants (play create/update, vitals, error boundary).
- Missing duplicate key guard telemetry event.
- Dispatcher unit tests.
- Initial hover gray refactor started.
- Slimmed roadmap (this concise rewrite).

---

## 4. EXECUTION LADDER

| Step | Scope                 | Deliverable                   | Exit Criteria              |
| ---- | --------------------- | ----------------------------- | -------------------------- |
| 1    | Hover Gray Cleanup    | Codemod + manual fixes        | 0 raw hover gray utilities |
| 2    | Typography Migration  | Headings use `<Typography />` | Snapshot diff clean        |
| 3    | Canonical Path Audit  | Inventory + patch gaps        | Readiness stays green      |
| 4    | Migration 010 Prep    | Counts + parity JSON          | Reviewed & committed       |
| 5    | Migration 010 Draft   | SQL migration idempotent      | Dry run clean              |
| 6    | Telemetry Persistence | Schema + flush endpoint       | Events stored & queryable  |
| 7    | Search Integration    | Doc build + fuzzy hooks       | Working demo in UI         |
| 8    | NOT NULL Enforcement  | ALTER TABLE migration         | 0 errors 48h post deploy   |
| 9    | Contrast/Axe Gate     | CI checks added               | Fails on regression        |

---

## 5. RISK WATCHLIST

| Risk                     | Mitigation                | Signal                              |
| ------------------------ | ------------------------- | ----------------------------------- |
| Hidden write path bypass | Audit & tests             | Readiness drift / missing key event |
| Telemetry buffer growth  | Implement sink soon       | Large flush batches                 |
| Migration 010 skew       | Pre-count + hash sampling | >0.5% mismatch                      |
| Performance regress      | Bundle budgets            | CI budget fail                      |

---

## 6. METRICS (LIGHT)

| Metric                       | Current | Target          |
| ---------------------------- | ------- | --------------- |
| Duplicate active conflicts   | 0       | 0               |
| Active missing duplicate_key | 0       | 0               |
| Hover gray refs              | ~50     | 0               |
| Median play create time      | (TBD)   | ≤30s mobile     |
| Vitals persistence           | Not yet | Persist + query |

---

## 7. MODULE MAP

| #   | Module                               | Path                                  |
| --- | ------------------------------------ | ------------------------------------- |
| 01  | Vision & Pillars                     | docs/roadmap/01_vision.md             |
| 02  | KPIs                                 | docs/roadmap/02_kpis.md               |
| 03  | Architecture                         | docs/roadmap/03_architecture.md       |
| 04  | Data Normalization                   | docs/roadmap/04_data_normalization.md |
| 05  | Migration Plan                       | docs/roadmap/05_migration_plan.md     |
| 06  | Service Layer                        | docs/roadmap/06_service_layer.md      |
| 07  | Performance                          | docs/roadmap/07_performance.md        |
| 09  | (Planned) Observability & Telemetry  | (to create)                           |
| 11  | (Planned) Custom Field Extensibility | (to create)                           |

---

## 8. ACCEPTANCE SNAPSHOT

Done when:

- Hover gray utilities = 0; headings standardized.
- Migration 010 merged; parity report stored.
- Telemetry events persisted & query script exists.
- duplicate_key NOT NULL applied; 48h stable.

---

## 9. CHANGELOG (Index Scope)

| Date       | Change                                                                   |
| ---------- | ------------------------------------------------------------------------ |
| 2025-08-10 | Telemetry skeleton, readiness script, dispatcher tests, concise rewrite. |
| 2025-08-10 | duplicate_key index live; hover gray cleanup initiated.                  |

---

## 10. QUICK NAV

Search: `TOP PRIORITIES`, `EXECUTION LADDER`. Deep dives in `docs/roadmap/`.

---

> End of concise index.
> | ------------------------- | -------------------------- |
> | Raw Gray Offenders | 0 (gate enforced) |
> | Hover Gray Text Utilities | In progress (~50 refs) |
> | Canonical Write Path | Domain service + pilot |
> | duplicate_key Column | Backfilled + index live (readiness script in CI) |
> | Migration 010 Draft | Concept only |
> | Telemetry Dispatcher | Skeleton (provider + queue) |
> | Contrast/Axe Harness | Not implemented |

---

## D. CHANGELOG (Index-Level Only)

- 2025-08-10: Pruned legacy long-form content; index trimmed to essentials. Historical commit: `df21c1c`.
- 2025-08-10: Modular split initiated (01_vision, 02_kpis, 03_architecture).

Historic narrative & deep dives remain accessible via git history (see commit hash above) and the archive placeholder.

---

## E. CONTRIBUTING NOTES

1. Create new deep-dive: `docs/roadmap/NN_topic.md`; add row in Section B.
2. Update metrics weekly; remove stale priorities (older than 3 weeks without movement).
3. Keep acceptance criteria inside the domain module file, not here.
4. If a module grows >300 lines, consider sub-splitting (e.g. `05a_migrations.md`).

---

## F. LEGACY ARCHIVE

Original monolithic roadmap snapshot placeholder: `docs/roadmap/ARCHIVE_MASTER_ROADMAP_2025-08-10.md` (full text retrievable from git history; see `df21c1c`).

---

> End of index.

## ✅ PROGRESS SNAPSHOT (As of 2025-08-10)

Foundational Design & UI Governance

- [x] Semantic surface tokens (surface-app/header/card/subtle/inverse/nav) adopted; raw bg-gray/border-gray utilities purged via codemod
- [x] Performance/style governance baseline established (bundle stats + performance budgets JSON)
- [x] Hard CI/style gate: rejects raw gray surface & raw gray text utilities; ESLint custom rules integrated
- [x] Focus ring unified (focus-ring utilities) — applied to Button component
- [x] Initial semantic text token migration (text-gray-500..900 → text-text-{muted|secondary|primary}) codemod run
- [ ] Residual hover/dark state raw gray text utilities (hover:text-gray-700 etc.) — cleanup in progress
- [ ] Heading & ad‑hoc typography utilities migration to <Typography /> variants (planned)
- [ ] Contrast audit pass (pending — will follow remaining text token cleanup)

Performance & Delivery

- [x] Performance budget gate wired (JS bundle size thresholds enforced)
- [ ] Route-level lazy loading for heavy practice / export flows (planned)
- [ ] Suspense boundaries + skeleton states standardization (skeleton components partially present; consolidation pending)
- [ ] Web Vitals capture wired to telemetry dispatcher (skeleton present)

Data & Normalization

- [x] Canonicalization utilities created (canonicalizePlayInput, duplicate key compute)
- [ ] Service layer enforcement (write path always canonicalizes) — expansion in progress (pilot + domain service)
- [x] duplicate_key column added, backfilled & conflicts archived (index live)
- [ ] Retro normalization analyzer & diff reports (not started)

Migrations & Database

- [x] Wave 1 scaffolding migration 009 COMPLETE
- [x] RLS & immutability migration 011 COMPLETE
- [ ] Migration 010 (recognitions backfill) — drafted conceptually, implementation pending
- [x] Add duplicate_key column & backfill (conflicts archived)
- [x] Create partial unique index (015) & monitor (NOT NULL staging pending)

Search & Assistive Features

- [ ] Search document builder integration (utility ready, not wired)
- [ ] Fuzzy formation/personnel suggestions (not started)
- [ ] Play name suggestion + recency weighting (not started)

Mobile UX & Accessibility

- [ ] Compact mode toggle & swipe group interactions (spec referenced; implementation pending)
- [ ] Offline draft buffer (not started in current branch)
- [ ] Accessibility audit (targeted fixes only so far; full pass pending)

Telemetry & Observability

- [x] Event dispatcher skeleton (queue + batching in-memory)
- [ ] Web Vitals instrumentation (hook existing web-vitals to dispatcher)
- [ ] Error boundary → telemetry integration (replace console.log with dispatcher event)

Testing & Quality

- [ ] Unit tests for canonicalization & duplicate key edge cases (not added yet)
- [ ] Snapshot/drift tests for style tokens expanded beyond raw gray (candidate: focus ring / typography) (planned)

Dashboard Onboarding Cleanup (Section 17.1)

- [x] Removed mock Trophy Case, Feed, Calendar, Season Stats, Upcoming Events (replaced with onboarding hints)
- [x] Introduced reusable OnboardingHint component
- [ ] Telemetry for onboarding.view / onboarding.action (pending)
- [ ] Feed backend schema & migration draft (pending)
- [ ] Calendar events schema draft (pending)
- [ ] Stats aggregation strategy doc (pending)
- [ ] Accessibility & mobile layout refinements for onboarding components (pending)

Risk & Compliance

- [ ] Audit log triggers (planned post canonical write path)
- [ ] Rate limiting & enhanced RLS for new telemetry tables (future phase)

Next Immediate Focus (Proposed Order)

1. Finish residual raw gray hover/dark text cleanup + heading typography migration
2. Contrast audit adjustments using semantic tokens (ensure AA/AAA targets)
3. Integrate canonicalization in write path + add duplicate_key column migration
4. Draft Migration 010 & row count report
5. Introduce lightweight telemetry dispatcher (foundation for Web Vitals & onboarding events)

---

## 🔎 Quick Navigation

This roadmap now groups content into three layers: (1) Strategic Essentials you read weekly, (2) Execution Framework (phases, KPIs, risks) you skim as you plan a sprint, and (3) Deep Dives you open only when implementing that domain.

### 1. Strategic Essentials (Read Often)

- [Vision & Pillars](#1-product-vision)
- [Architecture Snapshot](#2-architecture-snapshot)
- [Current KPI Targets](#12-core-kpis--targets)
- [Next 14-Day Plan](#16-next-14-day-execution-plan)
- [Immediate Next 5 Actions](#3113-immediate-next-5-actions-now)

### 2. Execution Framework

- [Phased Timeline](#11-phased-timeline-reference)
- [Execution Backlog (Formatted)](#31-execution-backlog-formatted)
- [Phase 1 Completion Status](#314-phase-1-style--design-system-finalization-days-13-complete) (✅) & remaining pre-Phase-2 gating
- [Risks & Mitigations](#13-risk-register)
- [Acceptance Contracts](#3114-acceptance-contracts-reference)

### 3. Deep Dives (Open When Implementing)

- [Custom Field Extensibility](#18-custom-field-extensibility-system)
- [Style & Design System Audit](#19-style--design-system-consistency-audit-new)
- [Performance Plan](#20-performance-bottleneck-analysis--plan-new)
- [Mobile Readiness](#21-mobile-readiness--responsive-strategy-new)
- [Database Integration & Data Quality](#22-database-integration--data-quality-enhancements-new)
- [Architecture & Domain Layering](#23-future-proof-architecture--domain-layering-new)
- [Accessibility Roadmap](#24-accessibility--inclusive-design-new)
- [Observability Expansion](#25-observability--telemetry-expansion-new)
- [Security Hardening](#26-security-hardening--governance-new)
- [Release Engineering](#27-release-engineering--tooling-new)
- [Innovation Tracks](#28-innovation-tracks-new)

### 4. Reference & History

- [Backlog (Curated)](#14-backlog-curated)
- [Migration Plan (Retro Normalization)](#15-migration-plan-retro-normalization)
- [Changelog](#17-summary)

> Tip: Use your editor's outline / symbol navigation or search for `## 31.` to jump directly to the structured execution backlog. Deep dive sections intentionally keep their original rich detail verbatim—only navigation has been layered on top.

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

---

## 19. STYLE & DESIGN SYSTEM CONSISTENCY AUDIT (NEW)

Current State Findings (2025-08-10 Audit):
| Domain | Issue | Examples | Severity | Action |
|--------|-------|----------|----------|--------|
| Surfaces | Residual raw gray utilities (`bg-gray-50`, `border-gray-200`) instead of semantic tokens | Practice timeline panels, legal pages, subscription panel | Med | Sweep & replace with `surface-*` + `border-subtle` (scriptable codemod) |
| Typography | Mixed raw text-gray-600 / text-gray-800 and variant misalignment | Legacy legal/marketing pages | Med | Introduce `text-*` semantic tokens + lint rule ban raw gray text |
| Spacing | Inconsistent `p-3 / p-4 / bc-card-padding` usage in similar card contexts | Dashboard cards vs roster panels | Low | Adopt spacing scale (xs, sm, md, lg) mapped to tokens; codemod normalization |
| Iconography | Emoji + custom Icon mix | Some dashboard quick actions | Med | Replace emojis with standardized Icon or Badge; add lint disallow raw emoji in Button children (allow in content text) |
| Color Contrast | A few low-contrast text-on-subtle surfaces in dark mode | Player list filters, subtle legend chips | Med | Add automated a11y contrast test (axe + palette matrix) |
| Focus Styles | Some interactive elements rely on default outline only | Filter selects, timeline slider | Med | Implement design-system focus ring utility (`focus-visible:ring-brand`) |
| Motion | Ad-hoc transitions (ease-linear / ease-in-out mix) | Buttons, tags | Low | Define motion tokens (duration-100/150/250, easing-standard) |
| Deprecated Variants | `outline` removed but examples persisted | Button README (fixed) | Resolved | Guard test passes |

Remediation Wave:

1. Token Codemod: regex replace raw gray backgrounds/borders → semantic classes (generate diff report).
2. Typography Sweep: create mapping doc (raw utility → variant) and apply transform.
3. Contrast Test Harness: add vitest + axe pass for major pages; fail build < WCAG AA.
4. Focus Ring Utility Implementation & Global Style Injection.
5. Emoji Replacement Script + exceptions list (marketing copy allowed).
6. Spacing Normalization: inventory tool to list divergent padding values for components of same role.

Success Exit: Zero raw gray utilities; axe contrast score ≥ 90% pages; lint rule enforcement active.

## 20. PERFORMANCE BOTTLENECK ANALYSIS & PLAN (NEW)

Key Bundle Observations (latest build):
| Chunk | Gzip Size | Notes |
|-------|-----------|-------|
| pdf-Cv0974nT.js | 500.68 kB | pdf generation heavy – candidate for dynamic import only when exporting |
| calendar-DwUjuHII.js | 76.84 kB | Calendar shell + logic; could split controller hooks |
| data-Cl6wD65s.js | 43.34 kB | Mixed service utilities – consider domain-sliced entrypoints |
| ui-CBaEu6ih.js | 41.63 kB | Aggregated design system; evaluate tree-shaking & per-component entry |

Runtime Hot Paths (suspected): Practice planner re-render cycles, PlayBuilder canvas interactions, search suggestion recomputations.

Optimization Roadmap:

1. Code Splitting: manualChunks for `pdf`, `calendar`, `playbuilder`, `team-settings`.
2. Dynamic Import Gate: PDF export & heavy telemetry modules loaded on demand.
3. React 18 Concurrency Prep: Introduce `<Suspense>` boundaries around heavy panels with skeleton states.
4. Memoization Audit: Identify components with prop-stable children triggering renders (use why-did-you-render in dev flag mode).
5. Web Vitals Collection (INP, LCP) → telemetry; set regression budget (INP delta > +15ms fails CI).
6. Animation & Layout Shift: Replace layout-jumping conditional blocks with height-reserved skeleton wrappers.
7. Asset Strategy: Preload critical icon subset; lazy load full icon registry (avoid dual dynamic + static import conflict by single strategy).
8. Database Query Consolidation: Batch practice planner related fetches via RPC or supabase multi-select pattern.

Metrics Targets Addendum:
| Metric | Baseline (est) | Target | Measurement Method |
|--------|----------------|--------|--------------------|
| P95 Route Switch (Practice Planner) | ~1200ms | <700ms | nav timing + custom mark |
| Largest Chunk (non-pdf) | 274.57 kB gzip | <180 kB | build stats diff |
| Re-render Count (Planner initial load) | >40 | <15 | profiling flag script |

## 21. MOBILE READINESS & RESPONSIVE STRATEGY (NEW)

Gaps:

- Some grid layouts overflow at <400px (Practice Planner modals, Team Settings forms).
- Timeline slider not fully touch-optimized (hit target width).
- Fixed padding causing vertical scroll friction in small viewports.

Plan:

1. Introduce `useResponsive()` hook (breakpoint booleans) to simplify conditional rendering.
2. Compact Surface Density Tokens (spacing scale halves in compact mode).
3. Mobile-First Modals: full-screen slide-up pattern for creation flows on <640px.
4. Gesture Enhancements: swipe to delete / reorder blocks (future) using accessible drag handle.
5. PWA Audit: add `apple-touch-icon`, maskable icons, offline fallback completeness.
6. Form Field Optimization: `inputmode` and `autocomplete` attributes everywhere; numeric optimization for durations.
7. Mobile Performance Budget: FCP < 2.5s mid-tier device (throttle preset) with bundle gating.

## 22. DATABASE INTEGRATION & DATA QUALITY ENHANCEMENTS (NEW)

Identified Issues:

- Ad-hoc Supabase calls scattered; inconsistent error handling.
- Lack of centralized retry/backoff & rate-limit detection.
- Data duplication risk without universal canonicalization in Services.

Service Layer Plan:

1. Create `src/data/` domain folders (plays, practice, roster, recognition, calendar).
2. Each domain exports: `fetch`, `mutate`, `subscribe` (where applicable), with canonicalization & validation.
3. Introduce Zod schemas for inbound/outbound shapes (strip extraneous fields before state insertion).
4. Global PostgREST Error Interpreter → normalized error codes (duplicate, permission, network, validation).
5. Caching Policy Matrix: define staleTime / gcTime / refetch triggers per domain (React Query integration step).
6. Data Quality Jobs: scheduled verification (duplicate_key conflicts, orphan references) – results logged to a telemetry table.

Future-Proofing:

- Prepare for multi-org scaling: partition large audit/event tables by month.
- Add soft-delete strategy (deleted_at) for logical recovery where needed.

## 23. FUTURE-PROOF ARCHITECTURE & DOMAIN LAYERING (NEW)

Layer Goals:
| Layer | Responsibility | Success Criteria |
|-------|----------------|------------------|
| UI Components | Stateless presentational | No direct Supabase calls; pure props |
| Feature Controllers | Orchestrate data + actions | Limited to a single domain set each |
| Data Services | Fetch/mutate/cache, canonicalization | 100% normalization before return |
| Domain Models | Type-safe schema & invariants | Zod parse passes; no unknown fields |
| Infrastructure | Auth, telemetry, config, error boundary | Pluggable, testable, minimal side effects |

Action Steps:

1. Introduce folder convention: `src/domains/<domain>/{model,service,queries,types}.ts`.
2. Add barrel boundaries; lint rule banning cross-domain deep imports (must go via barrel).
3. Event Bus Abstraction: decouple telemetry & domain events; supports feature toggles & analytics plugins.
4. Migration Scripts Domain: shared helpers (dryRun wrapper, transactionalBatch) to standardize DDL operations.

## 24. ACCESSIBILITY & INCLUSIVE DESIGN (NEW)

Roadmap:

1. Automated Axe + jest-dom a11y snapshot for core pages (play create, practice planner, dashboard).
2. Keyboard Trap & Focus Management utilities (modal, off-canvas panels).
3. Color Blind Safe Palette Validation: ensure tag & status colors pass 4.5:1 where text present.
4. Reduced Motion Preference: disable non-essential transitions.
5. ARIA Enhancements: live regions for async save states; progress indicators.
6. Screen Reader Shortcuts: hidden help panel listing key actions.

KPIs: a11y score (Lighthouse) ≥ 95, zero keyboard traps, automated suite green.

## 25. OBSERVABILITY & TELEMETRY EXPANSION (NEW)

Additions:

- Error Taxonomy: `error.play.create.duplicate`, `error.practice.save.timeout`.
- Client Trace Correlation: inject `x-trace-id` header in Supabase calls; propagate in events.
- Performance Spans: simple manual span API bridging user interactions → network call timings.
- Logging Policy: redact PII fields at source; structured JSON events.

Dashboards (Phase 1): Play Create Funnel, Practice Planner Interaction Heatmap, Performance (INP, LCP trends), Error Rate by Category.

## 26. SECURITY HARDENING & GOVERNANCE (NEW)

Next Controls:

1. Row-Level Ownership Assertions test suite (vitest hitting local supabase).
2. System Audit Log Table (append-only) for sensitive mutations.
3. Key Rotation Playbook (document + scripts for supabase anon/service keys).
4. Secret Scanning pre-commit (gitleaks config minimal; integrated in CI).
5. Dependency Risk Policy: weekly audit (npm audit --omit=dev --json diff) → report artifact.

## 27. RELEASE ENGINEERING & TOOLING (NEW)

Improvements:

1. Preview Environments: branch → ephemeral deployment (Netlify/Vercel) with seeded demo data.
2. Size Regress Guard: PR comment bot with bundle diff & INP delta.
3. Visual Regression: lightweight chromatic-style story capture for core components (Button, Tag, Modal) – post semantic token stability.
4. PR Quality Checklist Automation: ensure tests + type + lint + design guard all green before merge label allowed.
5. Migration Safety Bot: enforces presence of dry-run plan & rollback steps in migration PR description.

## 28. INNOVATION TRACKS (NEW)

Opportunities:

1. AI Assisted Play Naming: embed model suggestions based on formation/personnel (client prompt assembly, server scoring).
2. Practice Efficiency Analytics: compute distribution of time allocation vs plan; highlight overtime sources.
3. Injury / Fatigue Monitoring Integration (future external data ingestion).
4. Predictive Install Planner: recommend next installs based on usage gaps + opponent tendencies (once data available).

## 29. UPDATED KPI & METRIC ADDITIONS (NEW)

| KPI                        | Definition                           | Target | Owner         |
| -------------------------- | ------------------------------------ | ------ | ------------- |
| A11y Score                 | Lighthouse average across key pages  | ≥95    | Frontend Lead |
| Practice Planner INP       | P95 interaction latency              | <180ms | Perf Champion |
| Raw Gray Drift             | Count of offenders snapshot          | 0      | Design System |
| Domain Import Violations   | Lint rule hits / week                | 0      | Architecture  |
| Data Duplication Incidents | duplicate_key violations             | 0      | Data Quality  |
| Error Regression Time      | Mean time to resolve new error class | <24h   | Ops           |

## 30. EXECUTION SEQUENCING (ADDITIONAL)

Phase G (Design System Finalization): style sweep, focus rings, typography tokens, contrast tests.
Phase H (Service Layer & Caching): domain services + React Query + error interpreter.
Phase I (Performance & Concurrency): code splitting, suspense, INP optimization, asset strategy.
Phase J (Observability & Security): span API, trace IDs, audit logs, secret scanning.
Phase K (Accessibility & Mobile): axe suite, mobile modals, reduced motion, gesture improvements.
Phase L (Innovation): AI naming MVP, practice analytics instrumentation.

Exit Criteria (Cumulative): All earlier KPI targets on track; guard tests green (button, surface drift, contrast); service layer adoption ≥80% of queries; performance budgets enforced in CI.

Changelog Additions:

- 2025-08-10: Added Sections 19–30 (style audit, performance plan, mobile strategy, DB integration, architecture layering, accessibility, observability expansion, security hardening, release engineering, innovation, KPI extensions, execution sequencing).

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

## 31. EXECUTION BACKLOG (FORMATTED)

### 31.1 High-Level Phase Order (Rationale)

1. Baseline & Guard Rails – freeze quality metrics to prevent regression during refactors.
2. Style & System Consistency – semantic surfaces, typography, focus & contrast reduce rework later.
3. Data Service Layer + React Query – stable data access contract before perf & mobile tuning.
4. Performance Optimization – code splitting, INP improvements once APIs stable.
5. Accessibility & Mobile – polish UX after stability & perf.
6. Observability & Telemetry – instrument real usage & performance last to avoid churn.
7. Security & Release Engineering – tighten controls after architecture settles.
8. Innovation Prototypes – layer differentiators atop a hardened platform.

### 31.2 Typography System (Canonical)

| Role                 | CSS Variable / Token      | Font Stack Definition (from tokens)   | Primary Usage                                  | Notes                                          |
| -------------------- | ------------------------- | ------------------------------------- | ---------------------------------------------- | ---------------------------------------------- |
| Display              | `--font-family-display`   | `Bebas Neue, system-ui, sans-serif`   | Hero headlines, marketing/display-xl/lg        | Use sparingly for impact; all-caps acceptable. |
| Interface            | `--font-family-interface` | `Inter, system-ui, sans-serif`        | Body copy, UI labels, buttons, inputs          | Default weight 400 / 500 / 600 scale only.     |
| Mono                 | `--font-family-mono`      | `JetBrains Mono, Consolas, monospace` | Code samples, token values, small numeric data | Avoid large paragraph blocks.                  |
| Numeric Alt (future) | (planned token)           | (Optional condensed numeric face)     | Dense stat dashboards                          | Not yet implemented.                           |

Guidelines:

- Headline variants map: display-xl/lg → Display font; headline-_ → Interface font (semibold). body-_ / caption / micro → Interface regular/medium. Code blocks & inline token examples → Mono.
- Do not mix raw Tailwind font utilities for size/weight if a `<Typography />` variant exists; extend component instead.
- Accessibility: Maintain ≥1.2 line-height for body & ≥1.1 for headings; avoid tracking-tight on small sizes.

Migration Acceptance (Typography Sweep):

- [x] 0 remaining raw `text-2xl|3xl|4xl` etc. directly on structural headings where a `<Typography variant="..." />` exists.
- [x] All headline & body copy consolidated to `<Typography />` or design-system tokens.
- [x] ESLint rule flags disallowed raw heading utility usage outside component lib.

### 31.4 Phase 1: Style & Design System Finalization (Days 1–3) (COMPLETE)

| Workstream                 | Tasks                                                         | Status    | Exit Criteria                                            |
| -------------------------- | ------------------------------------------------------------- | --------- | -------------------------------------------------------- |
| Raw Gray Elimination       | Run surface + text codemods; add lint & style gates           | ✅        | Zero raw gray offenders; gates enforced                  |
| Typography Tokens          | Map text-gray-\* → semantic tokens; add rule                  | ✅ (base) | All base colors semantic; residual hover states migrated |
| Typography Component Sweep | Replace raw heading utilities with `<Typography />`           | ✅        | 0 raw heading utilities outside component lib            |
| Focus Ring                 | Introduce unified focus-ring utilities                        | ✅        | All interactive core components using shared ring        |
| Contrast & Axe Harness     | Add axe + contrast tests for key pages                        | ⏳        | CI fails on <4.5:1 text contrast violations              |
| Emoji-to-Icon Audit        | Lint rule forbidding raw emoji in UI; replace with `<Icon />` | ✅        | 0 violations; rule active                                |

Phase 1 Completion Note: All raw gray surfaces & text, raw heading utilities, and emoji glyph usages in interactive UI have been eliminated and are now guarded by ESLint/style gates. The remaining open contrast & axe harness will kick off at start of Phase 2 without blocking data layer work.

### 31.5 Phase 2: Data Service Layer & React Query (Days 4–7)

| Task                                                             | Status | Acceptance                                                      |
| ---------------------------------------------------------------- | ------ | --------------------------------------------------------------- |
| `/src/domains/plays` scaffold                                    | ⏳     | Directory + index, service stub                                 |
| PlaysService: getPlays/createPlay (canonicalize + duplicate_key) | ⏳     | All play writes route via service                               |
| React Query integration (plays)                                  | ⏳     | Components use `useQuery/useMutation`; no direct Supabase calls |
| Error Interpreter                                                | ⏳     | Standardized error objects surfaced                             |
| Caching Policy Matrix Doc                                        | ⏳     | Document committed; staleTime rationale per entity              |
| Telemetry on play.create                                         | ⏳     | Event payload emitted via dispatcher                            |

### 31.6 Phase 3: Performance & Bundling (Days 8–10)

| Task                                                                                                           | Status | Acceptance                                                  |
| -------------------------------------------------------------------------------------------------------------- | ------ | ----------------------------------------------------------- |
| Manual Chunking (pdf, calendar, playbuilder)                                                                   | ⏳     | Chunks named & size diff recorded                           |
| Dynamic Imports (PDF export, heavy panels)                                                                     | ⏳     | Initial bundle size reduction documented                    |
| INP Measurement Script + CI Budget                                                                             | ⏳     | CI fails on >X ms delta                                     |
| Memoization Sweep (useMemo/useCallback) for Practice Planner hot loops; measure rerenders with profiling flag. | ⏳     | Rerenders reduced vs baseline profile                       |
| Font Preload & Asset Strategy                                                                                  | ⏳     | Core CLS unaffected; fonts loaded within first paint window |

### 31.7 Phase 4: Accessibility & Mobile (Days 11–13)

| Task                                                | Status | Acceptance                                  |
| --------------------------------------------------- | ------ | ------------------------------------------- |
| Full-Screen Mobile Modals (<640px)                  | ⏳     | Key flows adapt layout gracefully           |
| Touch Target Audit (≥44px)                          | ⏳     | Axe + manual audit pass                     |
| Reduced Motion Support                              | ⏳     | Animations respect `prefers-reduced-motion` |
| Keyboard Navigation (suggest lists)                 | ⏳     | Arrow + ESC + Enter semantics working       |
| Screen reader live regions for save/loading states. | ⏳     | Screen readers announce saves/errors        |

### 31.8 Phase 5: Observability & Telemetry (Days 14–15)

| Task                   | Status | Acceptance                      |
| ---------------------- | ------ | ------------------------------- |
| Trace ID + Span API    | ⏳     | Events carry trace/span IDs     |
| Event Batching & Flush | ⏳     | Network call reduction measured |
| Dashboard Config Spec  | ⏳     | JSON spec committed             |

### 31.9 Phase 6: Security & Release Engineering (Days 16–18)

| Task                       | Status | Acceptance                                 |
| -------------------------- | ------ | ------------------------------------------ |
| RLS Automated Tests        | ⏳     | vitest suite green pre-merge               |
| Audit Log Table + Triggers | ⏳     | Mutations recorded, retention policy noted |
| Secret Scanning (gitleaks) | ⏳     | CI step fails on secret pattern            |
| Preview deploy automation  | ⏳     | Branch deploy with seeded demo data        |
| Bundle & INP diff bot      | ⏳     | PR comments show size/perf deltas          |

### 31.10 Phase 7: Innovation Pilots (Days 19–21)

| Task                          | Status | Acceptance                                |
| ----------------------------- | ------ | ----------------------------------------- |
| AI Play Naming (MVP)          | ⏳     | Feature-flag gated; telemetry event fires |
| Practice Efficiency Analytics | ⏳     | Comparison view shows variance %          |
| Install Planner heuristic     | ⏳     | Suggest list produced for next installs   |

### 31.11 Ongoing Cadence

- Monday: Metrics snapshot (INP, bundle, a11y score, raw gray count, duplicate_key violations).
- Mid-week: Innovation spike slot (4h).
- Friday: Risk register & KPI delta update.

### 31.12 Parallelization Guidance

- While Phase 1 typography sweep proceeds, another thread can scaffold PlaysService in parallel.
- React Query migration for roster can start once plays service pattern finalized (Phase 2 late).
- Performance profiling can begin baseline capture during Phase 2 (non-blocking).
