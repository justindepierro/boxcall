# Activation Funnel & Metrics

Status: Draft (Phase 1 Activation Implementation)

## Objectives

Accelerate new coach time-to-value by guiding the user through a short checklist:

1. Create or Join a Team
2. Create First Play
3. Schedule First Practice (stub – detection wiring TBD)
4. Export First Practice Script (stub – detection wiring TBD)

## Telemetry Events (Proposed / Partially Implemented)

| Event | When | Payload Keys | Implemented |
|-------|------|--------------|-------------|
| activation:first_play | First successful play creation | playId, timeFromSignupMs | YES (UI injection) |
| activation:checklist_step_complete | A checklist step transitions from incomplete → complete | stepId | YES |
| activation:checklist_completed | All steps complete | totalMs | YES |
| activation:first_practice | First practice scheduled | practiceId, timeFromSignupMs | PENDING |
| activation:first_script_export | First PDF export completes | mode (download|preview) | PENDING |

## Data Sources
| Step | Detection Strategy (Initial) | Future Enhancement |
|------|------------------------------|--------------------|
| Team Created/Joined | Supabase query team_members(user_id) > 0 | Real-time subscription for instant update |
| First Play | Local flag once activation:first_play emitted | Server-side verification (plays count) |
| First Practice | Placeholder: always false initially | Query calendar/practice table (to be defined) |
| First Script Export | Placeholder: localStorage flag set on export | Telemetry verification + server export audit |

## Storage
Local progress cached in `localStorage['bc_activation_flags']` to avoid re-query cascade; server truth later.

## KPIs
| Metric | Definition | Target (V1) |
|--------|------------|-------------|
| TTFP (Time to First Play) | first_play_event.ts - signup.ts | < 5 min |
| Checklist Completion Rate | users with activation:checklist_completed / new signups (30d) | 40% |
| Play Creation Day 1 | >= 1 play within first 24h | 60% |

## Open Items
1. Implement practice scheduling data model detection.
2. Hook PDF export success to emit activation:first_script_export.
3. Add events aggregation utility to `events_report.ts` for activation KPIs.
4. Server-side backfill to reconcile local flags vs DB truth.

---
Short file; keep under 300 lines per docs policy.
