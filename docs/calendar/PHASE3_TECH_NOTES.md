# Phase 3 – State Layer & Optimistic UX Tech Notes

Date: 2025-08-10

## Scope

Introduce a React Query powered state layer for calendar entities (events, RSVPs, comments) providing:

- Deterministic query keys for cache stability & selective invalidation.
- Optimistic mutations for event create/update/delete, RSVP upsert, and comment add.
- Failure injection harness to assert rollback correctness in tests.
- Transitional facade period while UI migrates off legacy `calendarService`.

## Query Key Strategy

Factory in `state/calendar/queryKeys.ts` ensures all keys share a root segment:

```
calendarKeys = {
  all: ["calendar"],
  events(filters, range, devMode) => ["calendar","events", { range, devMode, ...filters }]
  event(id) => ["calendar","event", id]
  rsvps(eventId) => ["calendar","rsvps", eventId]
  comments(eventId) => ["calendar","comments", eventId]
}
```

Reasons:
- Allows bulk invalidation with `{ queryKey: ["calendar","events"] }` regardless of the parameter object shape.
- Avoids accidental collisions with ad-hoc arrays.
- Embedding the filter object keeps variations distinct while still group‑invalidatable via partial matching.

## Optimistic Mutation Patterns

### Event Create
1. `onMutate` snapshot current list for the canonical (unfiltered) events key.
2. Append a temp item with `temp-<ts>` id.
3. On success, map replace temp id -> server id.
4. On error, restore snapshot.
5. On settled, invalidate the events key for server reconciliation.

### Event Update / Delete
Because multiple events queries may coexist (different filters), we iterate over the entire query cache selecting keys where `queryKey[0]=="calendar" && queryKey[1]=="events"` and patch each list.

Rollback stores an array of `{ key, data }` snapshots; error restores each.

### RSVP Upsert
Optimistic in-place update or append. On success we reconcile with server object (ensures timestamps & id). On error rollback to previous array.

### Comment Add
Optimistic append then either server success persists (same id semantics) or rollback on failure. Tests focus on final state (less brittle than asserting transient state plus rollback).

## Failure Injection Harness

Added hidden methods on `CalendarAPI`:

```
CalendarAPI.__setFailure({ create?|update?|delete?|comment?: boolean })
CalendarAPI.__resetFailures()
```

Tests trigger injected failures to force `onError` paths and ensure snapshots restore.

Reasons for approach vs monkey patching:
- Keeps mutation functions pure and testable without global jest mocks.
- Allows granular flag combination (e.g., test simultaneous delete+comment failure later).

## In-Memory Persistence (Dev/Test)

Modules maintain ephemeral arrays:
- `createdEvents[]` in `infra/calendar/api.ts`.
- RSVP store in `infra/calendar/rsvp.ts`.
- Comment store in `infra/calendar/comments.ts`.

These simulate server state so that optimistic updates reconcile with subsequent refetch results.

## Testing Strategy

File: `state/calendar/hooks.test.ts`

Covered:
- Events fetch baseline.
- Optimistic create (length delta, temp replacement).
- RSVP optimistic update & server reconciliation.
- Update & delete rollback on injected failure.
- Comment add rollback & success cases.

Deliberately avoided snapshot tests for lists—focused on structural assertions (length, id replacement) to reduce brittleness.

## Pending / Next

- Pagination strategy for comments (cursor token vs time-based window). Provide minimal type + placeholder fetch signature before UI consumption.
- Loading & error skeleton components (wire once UI migration begins) to leverage `placeholderData` and reduce layout shift.
- Range prefetch: pre-warm adjacent month/week queries on view change for snappier navigation.
- Service deprecation: Replace remaining `CalendarService` usages with hooks; add console warn on first import usage to encourage migration.

## Migration Plan (UI)

1. Introduce `CalendarShell` container using `useEvents`.
2. Replace direct `CalendarService.createEvent` calls with `useCreateEvent` mutate; remove manual reload.
3. Hydrate selected event modal via `useEvent(id)` (fallback search if uncached already handled).
4. Add RSVP & Comment panels gated behind lazy imports; use hooks for data.
5. Remove dead code paths & finalize service removal PR.

## Performance Considerations

- `placeholderData: prev` is applied to events query to smooth filter or range changes.
- Future: employ `keepPreviousData` + shallow equality filtering or derived selectors for expensive projections (stats, counts).
- Potential addition: query observer for visible date range to prefetch next/prev.

## Error Handling & Observability

- Centralized rollback ensures no partial states linger after failure.
- Add TODO to wrap mutation functions with logging (Phase 9).
- Consider exposing a dev overlay summarizing active calendar query keys for debugging.

## Risks & Mitigations

| Risk | Mitigation |
| ---- | ---------- |
| Over-invalidation causing refetch storms | Consistent key factory + partial invalidation targeting `["calendar","events"]` only when necessary. |
| Growing optimistic code complexity | Consolidate repetitive snapshot logic into small util if additional entities added. |
| UI migration drift (dual paths lingering) | Add lint rule / codemod to forbid new imports from `calendarService`. |

## Reference Implementation Links

- Query keys: `src/state/calendar/queryKeys.ts`
- Hooks: `src/state/calendar/hooks.ts`
- Failure tests: `src/state/calendar/hooks.test.ts`
- RSVP infra: `src/infra/calendar/rsvp.ts`
- Comments infra: `src/infra/calendar/comments.ts`

---

End of Phase 3 Tech Notes (initial draft). Update as migration proceeds.
