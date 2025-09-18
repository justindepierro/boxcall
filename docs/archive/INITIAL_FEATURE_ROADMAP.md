# 📘 FEATURE_ROADMAP (Phase: Data Integrity & Intelligent Assist)

Last Updated: 2025-08-11
Scope: Post-foundation feature acceleration. Keep <250 lines; prune aggressively.

## 0. TL;DR

- Primary Push: Search + Assisted Creation (suggestions, acceptance telemetry).
- Parallel Track: Migration 010 execution + duplicate_key NOT NULL hardening.
- Guard Extension: INP & Error regression gates after baselining.

## 1. NEAR-TERM FEATURE OBJECTIVES (30–45d)

| Objective                   | Outcome                                   | KPI Driver                   | Success Signal                       |
| --------------------------- | ----------------------------------------- | ---------------------------- | ------------------------------------ |
| Search Document Integration | Unified doc for plays (text, tags, roles) | Suggest Acceptance Rate ↑    | Play suggestions appear <150ms       |
| Intelligent Suggestions     | Context-aware play/tag suggestions        | Suggest Acceptance Rate ≥60% | 3-day rolling acceptance ≥60%        |
| Faster Play Creation        | Streamlined wizard + autofill             | Median Create Time ↓         | Median <90s interim (on path to 30s) |
| Data Integrity Hardening    | NOT NULL duplicate_key, zero conflicts    | Duplicate Variant Rate ↓     | 14d no conflicts post-enforcement    |
| Performance Baseline & Gate | INP regression detection                  | P95 INP <200ms               | Gate prevents >10% delta increases   |
| Error Observability         | Grouped error events & report             | Error MTTR ↓                 | Top 5 errors surfaced daily          |

## 2. KEY METRICS (To Add Instrumentation Where Missing)

| Metric                  | Baseline    | Target      | Instrumentation Gap                  |
| ----------------------- | ----------- | ----------- | ------------------------------------ |
| Suggest Acceptance Rate | N/A         | ≥60%        | Need suggestion + acceptance events  |
| Median Play Create Time | ~2–3m (est) | 90s interim | Need timers in wizard steps          |
| Wizard Drop-off Rate    | N/A         | <15%        | Add step enter/exit events           |
| P95 INP                 | Capturing   | <200ms      | Need baseline snapshot + gate script |
| Error Group Count (24h) | N/A         | <5 critical | Need error event emitter & report    |

## 3. FEATURE BACKLOG (Ordered)

1. Migration 010 execute (after final review)
2. Search doc builder (index generation script + nightly refresh)
3. Suggestion service (ranking heuristics + events: suggestion_shown, suggestion_accept)
4. Play creation timing instrumentation (start, step transitions, save)
5. Error event capture (ErrorBoundary -> event dispatcher)
6. Error aggregation in events_report (top groups last 24h)
7. INP regression gate (baseline record + delta threshold)
8. PDF/Calendar code splitting (lazy load heavy chunks)
9. Suggestion quality feedback loop (auto-drop low CTR suggestions)
10. Duplicate_key NOT NULL alter after 3 green readiness runs

## 4. EXECUTION BOARD (Initial)

| #   | Type   | Item                               | ETA | Owner | Dependencies            | DoD                        |
| --- | ------ | ---------------------------------- | --- | ----- | ----------------------- | -------------------------- |
| 1   | Mig    | Execute Migration 010              | D2  | TBD   | Counts + draft reviewed | Applied + parity log       |
| 2   | Search | Build search_doc table + trigger   | D3  | TBD   | #1 (schema stable)      | Table + trigger + backfill |
| 3   | Search | Index & GIN optimize               | D3  | TBD   | #2                      | Query p50 <15ms            |
| 4   | Assist | Suggestion events (shown/accept)   | D4  | TBD   | Dispatcher stable       | Events visible in report   |
| 5   | Assist | Acceptance metric in report        | D5  | TBD   | #4                      | Report shows acceptance %  |
| 6   | Perf   | Play create timers instrumentation | D6  | TBD   | None                    | Median time visible        |
| 7   | Error  | ErrorBoundary -> event emission    | D7  | TBD   | Dispatcher              | Errors persisted           |
| 8   | Error  | Error aggregation in report        | D8  | TBD   | #7                      | Top groups printed         |
| 9   | Perf   | INP baseline snapshot script       | D8  | TBD   | Vitals capture          | JSON baseline saved        |
| 10  | Guard  | INP gate (delta vs baseline)       | D9  | TBD   | #9                      | Fails on >10% regression   |
| 11  | Build  | PDF lazy chunk                     | D10 | TBD   | None                    | Bundle size delta reported |
| 12  | Build  | Calendar lazy chunk                | D11 | TBD   | #11                     | Bundle size delta reported |
| 13  | Data   | duplicate_key NOT NULL alter       | D12 | TBD   | 3 green readiness runs  | Constraint enforced        |
| 14  | Assist | Suggestion quality pruning         | D13 | TBD   | #4 #5                   | Low CTR variants pruned    |

## 5. TECH NOTES / IMPLEMENTATION GUIDES

- Suggestion Events Shape: { type: 'suggestion:shown' | 'suggestion:accept', session_id, suggestion_id, context: { source, rank }, ts }
- Acceptance Calculation: distinct accept / distinct shown (same suggestion_id per session counts once).
- Error Grouping Key: hash(first 2 lines of stack + component name) -> stable group id.
- INP Gate: use p95 INP median of last N sessions as baseline; fail if current run p95 > baseline \* 1.10.

## 6. RISKS & MITIGATIONS

| Risk               | Impact             | Mitigation                            |
| ------------------ | ------------------ | ------------------------------------- |
| Migration skew     | Data inconsistency | Parity counts + sample hash diff      |
| Search doc drift   | Stale suggestions  | Nightly regen + on-write trigger      |
| Event volume spike | DB cost / perf     | Batch flush + partition future        |
| Suggestion spam    | Low acceptance     | Quality pruning job                   |
| Error noise        | Signal dilution    | Grouping + threshold report           |
| INP variance       | Flaky gate         | Require min sample size before gating |

## 7. DONE CRITERIA (Phase)

Phase complete when:

- Migration 010 executed + verified parity (<0.5% mismatch)
- Search doc + index live and suggestion events flowing
- Acceptance metric stable ≥60% over 3 consecutive days
- Error events aggregated (top 5 groups) with MTTR tracking hook
- INP gate active and preventing >10% regressions
- duplicate_key NOT NULL enforced without incident (14d)

---

Maintain: Update after every merged feature affecting metrics or gating.
