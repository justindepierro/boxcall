# BoxCall Unified Roadmap

Status: Active (Generated cleanup pass 2025-08-11)

## 1. Vision

Elite coaching OS: unified play lifecycle (Ideate → Author → Rehearse → Deploy → Analyze) with measurable suggestion & execution feedback loops.

## 2. Current Focus (Next 2 Sprints)

- Search UX completion (metadata results, fuzzy blend, acceptance telemetry quality)
- Play creation velocity (wizard instrumentation + auto normalization)
- Duplicate key enforcement (NOT NULL + readiness streak)
- INP baseline + regression gate

## 3. 30–45 Day Objectives

| Objective               | Metric            | Target                   |
| ----------------------- | ----------------- | ------------------------ |
| Suggest Acceptance Rate | accept / shown    | ≥60% rolling 7d          |
| Median Play Create Time | wizard start→save | <90s                     |
| P95 INP                 | web vital         | <200ms + <10% regression |
| Duplicate Conflicts     | active clusters   | 0 after NOT NULL         |

## 4. Feature Stream Backlog

1. Practice ↔ Game Plan integration (export & reverse linking)
2. Team dashboard: top accepted suggestions & usage deltas
3. AI Assist scaffolding (capture request intent events)
4. Error aggregation & guard (top 5 groups)
5. Local query cache + rate dampening for search
6. Hybrid search scoring (rank weight vs trigram similarity)
7. Suggestion dismissal & rejection telemetry
8. Performance: PDF + Calendar isolated chunks
9. Domain service consolidation (remove residual direct writes)
10. Play metadata enrichment service (batch id → minimal fields)

## 5. Recently Completed (Archive Reference)

- Fuzzy trigram fallback (migration 020)
- Weighted english full-text (migration 019)
- Events persistence & suggestion telemetry
- Accessibility & contrast zero violation gates

## 6. Risks & Mitigations

| Risk                    | Impact              | Mitigation                          |
| ----------------------- | ------------------- | ----------------------------------- |
| Search noise from fuzzy | Lower acceptance    | Raise min_similarity + hybrid score |
| INP variance            | False regressions   | Require sample size & 10% band      |
| Doc sprawl reoccurs     | Onboarding friction | Quarterly doc pruning script        |

## 7. Metrics & Scripts

| Metric                | Source Script                 |
| --------------------- | ----------------------------- |
| Suggestion acceptance | scripts/events_report.ts      |
| Duplicate readiness   | npm run dup:readiness         |
| INP baseline gate     | (planned) scripts/inp_gate.ts |

## 8. Definition of Done for Phase

All current focus objectives at target & NOT NULL duplicate_key enforced.

---

Historical roadmaps moved to docs/archive/. Keep this file lean; expand only with active items.
