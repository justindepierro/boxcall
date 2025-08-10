# Calendar Baseline Metrics (Phase 0)

Date: 2025-08-10

## Raw Utility Debt (Pre-Refactor)

File: `src/pages/CalendarPage.tsx`
Occurrences of disallowed raw classes (gray/navy/background/border): **23**
(Scan pattern: text-gray\*, text-navy-900, bg-gray-50, bg-white, border-gray-200, border-gray-300)

## Structural State

- Monolithic page component ( >700 LOC )
- Mixed concerns: data fetch, filters, stats, modal, view switching
- FullCalendar adapter logic embedded directly

## Type & Build Status

- Reverted to last clean commit version.
- No parsing/import anomalies after restore.

## Performance (To Collect Later)

- LCP, hydration cost, and chunk size measurements deferred until after decomposition harness is in place.

## A11y (Initial Qualitative)

- Modal focus handling not audited yet
- Keyboard nav for view switcher present but not ARIA annotated

## Next Actions (Phase 0)

1. Introduce domain types file (no behavior change)
2. Add zod dependency (prep for Phase 1) – optional in Phase 0 if we want purely restorative scope
3. Plan selective semantic class replacement PR (avoid type churn)

## Exit Criteria Reminder (Phase 0)

- Page compiles (✓)
- Baseline snapshot recorded (✓)
- No new raw utilities introduced (pending enforcement)
