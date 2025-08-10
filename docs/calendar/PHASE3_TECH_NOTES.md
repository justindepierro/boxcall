# Phase 3 Technical Notes (State Management & Optimistic UX)

Status: Complete (Task 13)

## Scope

React Query state layer with optimistic create/update/delete, RSVP upsert, and comment add. Legacy `calendarService` removed.

## Query Keys

```
calendar / events / {filters, range:{s,e}, devMode}
calendar / event / id
calendar / rsvps / eventId
calendar / comments / eventId
```

## Optimistic Mutation Matrix

| Mutation    | onMutate                  | Rollback              | Reconcile                |
| ----------- | ------------------------- | --------------------- | ------------------------ |
| createEvent | append temp event         | restore previous list | replace temp id          |
| updateEvent | patch across cached lists | restore per-snapshot  | refetch via invalidate   |
| deleteEvent | remove from cached lists  | restore per-snapshot  | refetch via invalidate   |
| upsertRSVP  | update/append RSVP        | restore prior array   | swap temp/new with saved |
| addComment  | append temp comment       | restore prior list    | invalidate to sync       |

Failure simulation via `CalendarAPI.__setFailure` ensures rollback correctness in tests.

## Single Event Hydration

`useEvent(id)` scans all `calendar/events` caches before network fetch.

## Skeletons

`CalendarPageSkeleton` + `CalendarErrorSkeleton` provide layout-stable UX (Task 8).

## Removal of Legacy

`src/services/calendarService.ts` deleted; no active imports remain.

## Pending (Phase 4+)

- Debounced search & highlight
- Range prefetch effect integration
- URL state sync & deep links
- Lint rule banning legacy imports

## Risks Mitigated

- Inconsistent cache writes -> standardized optimistic patterns
- Over-invalidation -> narrow query key strategy
- Layout shift during load -> skeletons

## Next Steps

Proceed to Phase 4 UI decomposition and integrate prefetch + URL sync.
