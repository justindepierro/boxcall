# Phase 3 Performance Strategy (Range Prefetch & Cache Hygiene)

Status: Implemented (Doc created as Phase 3 Task 12)

## Goals

1. Minimize perceived latency when navigating month/week/day views.
2. Avoid redundant network calls by leveraging React Query caching + prefetch.
3. Prepare foundation for recurrence expansion & deep-link hydration (Phase 7).

## Query Key Topology

```
calendar / events / { teamIds,eventTypes,dateRange(range.s/e),devMode }
calendar / event / {id}
```

Date range transformed to stable object `{ s, e }` to ensure key memo stability.

## Prefetch Algorithm (Phase 4 Integration)

After an events query resolves:

1. Compute next & previous month ranges from current `dateRange`.
2. For each range if cache missing or stale (>5m) issue `prefetchQuery`.
3. Skip during initial blank loads or when `devMode === 'blank_slate'`.

Pseudo-code:

```ts
useEffect(() => {
  if (!data || !range) return;
  const next = shiftMonth(range, +1);
  const prev = shiftMonth(range, -1);
  [next, prev].forEach((r) => {
    const key = calendarKeys.events(filters, r, devMode);
    const st = qc.getQueryState(key);
    if (!st || Date.now() - st.dataUpdatedAt > 300_000) {
      qc.prefetchQuery({
        queryKey: key,
        queryFn: () =>
          CalendarAPI.listUserEvents(userId, devMode, {
            ...filters,
            dateRange: r,
          }),
      });
    }
  });
}, [data, range, filters, devMode, userId]);
```

## Selective Invalidation

Mutations invalidate only the active `calendarKeys.events` context, preventing broad cache trashing.

## Deep-Link Hydration

`useEvent(id)` scans existing events caches. On miss it performs a targeted search / lookup, enabling fast modal open from URL.

## Metrics

Planned marks:

- `mark:calendar:view-switch:start|end`
- `mark:calendar:prefetch:next|prev`

Budget: <120ms median view switch.

## Future Evolution

Recurrence (Phase 7) will hook into prefetch harness, expanding occurrences only for prefetched windows.

## Status

Doc authored; hook integration scheduled for Phase 4 UI shell.
