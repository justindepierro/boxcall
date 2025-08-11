# 🚀 NEW_MASTER_ROADMAP (2025) — Operational Command File

> Purpose: Ultra‑concise, <350 lines, always current. Use this for planning, standups, reviews. Deep detail lives in `docs/roadmap/` & original `MASTER_ROADMAP.md` (reference / archive).
>
> Update Discipline: Edit DURING execution (not after). Each merged change that alters scope touches this file.

Last Updated: 2025-08-11
Lines Budget Guideline: Keep <350 (prune when adding). Current placeholder — adjust as content evolves.

---

## 0. TL;DR (One Screen)

- NOW: Canonical write path inventory & patching (UI token + heading/label debt cleared).
- NEXT: Migration 010 prep (counts + draft) → Telemetry persistence → Contrast/Axe gate.
- GUARDED: duplicate_key uniqueness (partial index) + readiness script (NOT NULL staging pending 3 green runs).
- KPI DRIVERS (Near-Term): Duplicate variant rate ↓, Play create time ↓, Bundle size ↓, INP ↓, A11y score ↑.

---

## 1. NORTH STAR & PILLARS (Abbrev)

| Pillar             | 2025 Outcome                    | Driver Metric                  | Current Gap                |
| ------------------ | ------------------------------- | ------------------------------ | -------------------------- |
| Lightning Creation | <30s mobile create              | Median create time             | Need instrumentation       |
| Data Trust         | Deterministic canonical storage | Duplicate variant rate <0.5%   | Service path audit pending |
| Performance        | Smooth interactions             | P95 INP <200ms                 | No persistent capture yet  |
| Observability      | Actionable telemetry            | Event persistence & dashboards | Only in‑memory queue       |
| Inclusive UX       | A11y & contrast baseline        | A11y score ≥95                 | Contrast harness not built |

---

## 2. CORE KPI TARGETS

| KPI                     | Baseline    | Target | Status      | Instrumentation                         |
| ----------------------- | ----------- | ------ | ----------- | --------------------------------------- |
| Median Play Create      | ~2–3m (est) | 0:30   | Unknown     | Add timing marks (Day 3)                |
| Duplicate Variant Rate  | >5% (est)   | <0.5%  | Improving   | Health + readiness scripts              |
| P95 INP                 | TBD         | <200ms | Unmeasured  | Capture & emit (Post Telemetry Persist) |
| A11y Score              | TBD         | ≥95    | Unmeasured  | Axe + contrast gate                     |
| Suggest Acceptance Rate | N/A         | ≥60%   | Not started | Needs search + suggestion events        |

---

## 3. 90-DAY OUTCOME SNAPSHOT

1. Canonical write path enforced; retro normalization report produced.
2. Migration 010 executed safely with lineage + parity audit.
3. Telemetry persisted (events + vitals) & basic dashboard queries script.
4. duplicate_key NOT NULL enforced (0 incidents post 48h).
5. Design system debt (raw gray, headings, contrast) cleared & guarded.
6. Performance budgets + INP regression gate active.

---

## 4. CRITICAL PATH (Sequence That Unlocks Others)

1. (DONE) UI Token Debt Elimination (hover gray + typography) – contrast audit unblocked.
2. Canonical Write Path Audit & Patch → ensures data integrity before migrations.
3. Migration 010 Preparation (counts + dry run) → safe data backfill.
4. Telemetry Persistence (DB schema + flush endpoint) → enables perf & reliability metrics.
5. Contrast & Axe Gate → quality guard before scale.
6. Search Doc Integration → fuels assistive features & acceptance KPI.
7. NOT NULL Enforcement → hard guarantee of duplicate_key pipeline.
8. Performance Splitting & INP Gate → scalability & UX polish.

---

## 5. ACTIVE SPRINT (14-Day Focus) — Sprint Goal: "Design Debt → Canonical Path Ready"

| #   | Type  | Item                                          | Owner | ETA | Blockers           | Definition of Done                       |
| --- | ----- | --------------------------------------------- | ----- | --- | ------------------ | ---------------------------------------- |
| 1   | UI    | Hover gray cleanup (all states)               | TBD   | D2  | None               | DONE (grep=0)                            |
| 2   | UI    | Heading migration `<Typography />`            | TBD   | D2  | #1 done            | DONE (no raw heading utilities)          |
| 3   | Data  | Write path inventory (plays)                  | TBD   | D3  | None               | List + gap map committed                 |
| 4   | Data  | Patch stray write paths                       | TBD   | D4  | #3                 | All create/update funnel through service |
| 5   | Mig   | Migration 010 row counts report               | TBD   | D5  | Inventory access   | JSON + markdown committed                |
| 6   | Mig   | Draft Migration 010 SQL (idempotent)          | TBD   | D6  | #5                 | Dry run EXPLAIN clean                    |
| 7   | Tele  | Event schema decision & table create          | TBD   | D7  | None               | migration + types added                  |
| 8   | Tele  | Dispatcher flush → persistence wiring         | TBD   | D8  | #7                 | Events visible via query script          |
| 9   | QA    | Contrast baseline scan (manual + temp script) | TBD   | D9  | #1 #2              | Issue list w/ severities                 |
| 10  | Guard | Axe smoke test harness (key pages)            | TBD   | D10 | #9 partial         | CI fails on violation                    |
| 11  | Perf  | Add basic Web Vitals persistence              | TBD   | D11 | #8                 | FCP/LCP/INP rows stored                  |
| 12  | Meta  | Roadmap prune & update (this file)            | TBD   | D14 | Rolling            | Changelog entry added                    |

Color Code (mental): UI → Data → Migration → Telemetry → Quality → Perf → Meta (avoid overloading one lane per day).

---

## 6. URGENT ACTION ITEMS (If Time-Constrained Today)

1. Finish hover gray codemod & manual leftovers (commit diff artifact).
2. Replace remaining heading utilities w/ `<Typography />` variants.
3. Generate write path inventory script output (plays create/update functions).
4. Produce Migration 010 source row counts + parity placeholders.
5. Draft telemetry events table migration & shape.

(If <2h left: prioritize #1 → #3.)

---

## 7. QUALITY GATES & GUARDS

| Guard                 | State   | Notes                         |
| --------------------- | ------- | ----------------------------- |
| TypeScript Strict     | Active  | Passing predev script         |
| ESLint Zero Raw Gray  | Active  | Passing (no offenders)        |
| Duplicate Key Health  | Active  | Script integrated             |
| Readiness (NOT NULL)  | Active  | Need 3 consecutive greens     |
| Bundle Size Budgets   | Active  | baseline JSON present         |
| Telemetry Persistence | Missing | Table + flush incomplete      |
| Contrast / Axe        | Missing | To implement after UI cleanup |
| INP Regression Gate   | Missing | Depends on persistence        |

Removals / Additions require updating this table immediately.

---

## 8. RISK RADAR (Top 6 Only)

| Risk                      | Window               | Trigger Signal           | Mitigation              | Owner     |
| ------------------------- | -------------------- | ------------------------ | ----------------------- | --------- |
| Hidden write path bypass  | Pre-NOT NULL         | missing-key events spike | Audit + tests           | Data      |
| Migration 010 skew        | During prep          | >0.5% count mismatch     | Hash sampling & dry run | Data      |
| Telemetry backlog growth  | Before sink          | Queue > threshold        | Implement sink early    | Telemetry |
| Contrast regressions      | Post cleanup         | Manual QA flags          | Add automated gate      | UI        |
| Performance regress (INP) | After code splitting | INP delta > budget       | Add INP gate            | Perf      |
| Schedule creep            | Sprint mid           | >30% tasks slip by Day 7 | Re-scope & slice        | Lead      |

---

## 9. DATA & MIGRATION TRACK

Milestones:

- (DONE) duplicate_key column + partial unique index.
- (NOW) Write path canonical guarantee.
- (NEXT) Migration 010 counts → draft → review → execute.
- (SOON) NOT NULL duplicate_key after 3 green readiness runs.
- (LATER) Search tsvector + GIN index.

Success Criteria This Sprint: Inventory + patch write paths; Migration 010 draft SQL validated.

---

## 10. TELEMETRY & OBSERVABILITY TRACK

Current: In-memory dispatcher only (no durable storage).
Next 5 Steps:

1. Define minimal table schema: events(id, ts, type, payload JSONB, trace_id, session_id).
2. Migration & types generation.
3. Dispatcher sink adapter (batch insert / POST endpoint fallback).
4. Web Vitals + Error Boundary directed to sink.
5. Query script: top events, vitals aggregates.
   Stretch: Add trace/span minimal API & correlation id injection.

---

## 11. DESIGN SYSTEM & UI CONSISTENCY

Debt Remaining:

- Contrast unknown (no systematic scan yet).
- Need automated contrast + axe gate.
  Post-Sprint Goal: Baseline issue list triaged.
  Guard Plan: ESLint semantic tokens + add axe/contrast CI job.

Completed This Sprint (UI):
- Hover gray state utilities → 0 offenders (codemod + manual cleanup).
- Headings & label spans migrated to `<Typography />` variants.

---

## 12. PERFORMANCE OBJECTIVES

Targets (Phase 1 focus = capture not perfection):
| Metric | Target | Action Gate |
|--------|--------|-------------|
| P95 INP | <200ms | Persist & gate delta |
| Initial JS (non-PDF) | <180kB gzip | Manual chunking + dynamic import |
| Play Planner Rerenders | <15 initial | Profiling + memoization |
| FCP (Mobile) | <2.5s | Lazy load heavy modules |

Sequence: (1) Persist vitals → (2) Establish baseline → (3) Add regression gate → (4) Optimize.

---

## 13. SECURITY & COMPLIANCE (Just-In-Time)

Near-Term Only (defer rest):

1. Telemetry table RLS & field whitelist (prevent PII leakage).
2. Audit log triggers (play create/update/delete minimal record) AFTER canonical path verified.
3. Secret scanning (gitleaks) CI step (low friction).

---

## 14. DECISION LOG (Recent)

| Date       | Decision                                              | Rationale                           | Impact             |
| ---------- | ----------------------------------------------------- | ----------------------------------- | ------------------ |
| 2025-08-10 | Persist events via dedicated table (vs 3rd-party now) | Control + privacy                   | Faster iteration   |
| 2025-08-10 | Enforce semantic hover states before contrast gate    | Avoid double remediation            | Focused UI cleanup |
| 2025-08-10 | Partial unique index (duplicate_key) before NOT NULL  | Safe detection & backfill stability | Avoid incidents    |

(Add new decisions chronologically; prune oldest beyond 15.)

---

## 15. METRICS SNAPSHOT (Placeholder Until Instrumented)

| Metric                       | Value   | Confidence | Next Step                        |
| ---------------------------- | ------- | ---------- | -------------------------------- |
| duplicate_key conflicts      | 0       | High       | Continue monitoring              |
| missing duplicate_key events | 0       | Medium     | Validate event capture post sink |
| Hover gray offenders         | 0       | High       | Guard in ESLint + periodic scan  |
| Telemetry events persisted   | 0       | High       | Implement sink                   |
| A11y contrast issues         | Unknown | Low        | Run baseline scan                |

---

## 16. EXECUTION HEALTH CHECK (Self-Audit Prompt)

Run every Friday:

- Are any tasks lingering >5 days without progress? (List & re-scope.)
- Any new hidden write paths discovered? (Patch immediately.)
- Are we deferring telemetry persistence longer than 7 days? (Escalate.)
- Has line count >350? (Prune obsolete sections.)

---

## 17. UPDATE PROTOCOL

1. Modify section owning the change (avoid dumping in a "misc" list).
2. Update TL;DR if critical path or sprint focus shifts.
3. Append decision log entry for structural or tooling decisions.
4. Keep action verbs; remove stale completed items older than 2 sprints.
5. Validate line count budget.

---

## 18. REFERENCES

- Deep Detail: `MASTER_ROADMAP.md` (legacy long form) & `docs/roadmap/` modules.
- Migrations: `database/migrations/` & plan docs in `docs/database/`.
- Scripts: `scripts/*.ts` (dup health, readiness, future telemetry).

---

## 19. QUICK COMMANDS (Optional Helpers)

(Consider adding scripts)

- List hover gray offenders: `grep -R "hover:text-gray" src/` (to script form soon)
- Duplicate key health: `npm run dup:health`
- Readiness check: `npm run dup:readiness`
- Bundle stats report: (build pipeline output)

---

## 20. EXIT CRITERIA (Sprint)

Sprint is COMPLETE when:

- 0 hover gray + 0 raw heading utilities.
- Canonical write path inventory & patches merged.
- Migration 010 counts + draft SQL committed.
- Telemetry events table + flush implemented (events visible via query script).
- Contrast baseline scan produced (issues triaged & scheduled).

---

## 21. NEXT SPRINT PREVIEW (Tentative)

Theme: "Data Integrity & Observability"

- Execute Migration 010 (post review)
- Telemetry vitals + error dashboards
- Contrast gate (axe + color matrix) integrated
- Search doc builder integration & fuzzy suggestions
- Begin performance chunking (pdf + calendar modules)

---

> End of NEW_MASTER_ROADMAP. Keep it sharp. Remove fluff. Drive outcomes.
