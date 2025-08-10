# Phase 2 Tech Notes - Calendar Refactor

Date: 2025-08-10
Status: Completed – exit criteria met (service slimmed, infra/adapter coverage ≥ targets, docs updated)

## Scope Recap

Phase 2 extracted infra concerns from the legacy monolithic `calendarService` into specialized modules:

- `infra/calendar/api.ts` – event CRUD + listing/search/upcoming
- `infra/calendar/rsvp.ts` – RSVP list/upsert
- `infra/calendar/comments.ts` – comment list/add stubs
- `infra/calendar/ics.ts` – single-event ICS generation
- `adapters/fullcalendar/FullCalendarAdapter.ts` – isolation layer for FullCalendar

Legacy `calendarService` now acts as a thin façade delegating directly to these modules for backward compatibility until UI/state refactors (Phase 3+). It contains no business logic or mock data (>450 LOC removed; now <150 LOC).

## Architectural Boundaries

```
UI / Hooks (Phase 2 still using CalendarService) -> CalendarService facade -> Infra Modules -> (Future) Supabase
                                               -> (Future Phase 3) React Query hooks
Domain (types/schema/rules) <==> Infra boundary via parse functions
```

All objects crossing infra <-> domain boundary are validated with zod parse helpers (`parseCalendarEvent*`, `parseEventRSVPs`, `parseCalendarComments`). No raw event structures bypass parsing.

## Adapter Contract

`FullCalendarAdapter` exposes two pure functions:

- `toFullCalendar(domainEvent: CalendarEvent): FullCalendarEventLike`
- `fromFullCalendar(raw: FullCalendarEventLike): CalendarEvent`

Invariants:

- `id`, `title`, `start` always preserved round-trip.
- Optional fields (`end`, `tags`, `location`, `rsvp_required`) may be omitted; absence should not throw.
- Unknown `type` defaults to `other` when mapping from FullCalendar shape.

Edge Tests Implemented:

- Round-trip (domain -> FC -> domain) retains core fields.
- Fallback `type` logic validated.

## ICS Generation Contract

`eventToICS(event: CalendarEvent) -> string`
Guarantees:

- `UID` format `<event.id>@boxcall`.
- Escapes backslash, semicolon, comma, newline in `SUMMARY` and `LOCATION`.
- Provides minimal valid VCALENDAR + VEVENT skeleton (DTSTAMP, DTSTART, DTEND if present).

Implemented Additions (Phase 2 scope):

- Escaping test for commas, semicolons, backslashes, and newlines (verified in `ics.test.ts`).
- UID invariant enforced.

Deferred:

- Multi-event feed logic (Phase 8 – export & sync).

## Mock Data Strategy

Current implementation preserves limited mock events and RSVP data inside infra layer only. The legacy service no longer owns mock arrays. All future mock modifications occur in infra modules to ensure single source of truth.

## Migration Checklist (Phase 2 -> 3)

- [ ] Replace UI & hooks direct `CalendarService` usage with React Query hooks (Phase 3).
- [ ] Remove re-exports of types from `calendarService` (import from domain instead) once all imports updated.
- [ ] Introduce `state/calendarQueries.ts` with caching & optimistic mutations.
- [ ] Delete `calendarService.ts` after final UI migration + deprecation window.

## Coverage Targets & Results

Target: ≥85% statements across infra + adapter.

Achieved (2025-08-10 run):

- `infra/calendar/api.ts`: ~98% statements
- `infra/calendar/ics.ts`: ~97% statements
- `adapters/fullcalendar/FullCalendarAdapter.ts`: ~91% statements
- Aggregate (infra + adapter bundle): >95% statements

Notable Branches Covered:

- `updateEvent` empty payload & invalid field rejection → null path
- Search across title/description/location/opponent
- Dev modes: `blank_slate`, `dev_head_coach`, `super_admin_mock`, production placeholder
- Filters: tags, teamIds, eventTypes, dateRange exclusion
- Upcoming future-only sort & slice
- RSVP & comments stubs parse enforcement
- ICS escaping characters (`, ; \\ \n`)

## Deprecations

- `CalendarService` marked legacy; no further logic additions permitted. Only delegations allowed.
- Direct imports of calendar types from `services/calendarService` should be migrated to `domain/calendar/types`.

## Exit Criteria Verification

- Legacy service stripped to delegation façade (<150 LOC) – PASS
- All retrieval & mutations routed through `CalendarAPI` / `CalendarRSVP` / `CalendarComments` – PASS
- Adapter round‑trip & fallback type tests passing – PASS
- ICS generator test with UID + escaping implemented – PASS
- Coverage ≥85% on infra + adapter – PASS (see metrics above)
- Tech notes + roadmap updated – PASS

## Risks & Mitigations

| Risk                                              | Mitigation                                                                      |
| ------------------------------------------------- | ------------------------------------------------------------------------------- |
| Divergence between facade and infra return shapes | Single source parse functions; facade only delegates                            |
| Adapter drift with FullCalendar upgrade           | Keep adapter tiny & pure; expand tests when new fields added                    |
| Mock logic leaking back into service              | Service file restricted to delegations; lint rule TODO: forbid new logic blocks |

## Future Enhancements (Phase 3+ Seeds)

- React Query integration with staleTime tuned per view.
- Batched prefetch for visible month range.
- Error boundary wrapping calendar root for mutation failures.
- ICS feed tokenization & ETag handling (Phase 8).

## Removal Plan for Legacy Service

1. Add codemod (optional) to rewrite imports of `CalendarService` types to domain.
2. Update all hooks/components to call React Query hooks.
3. Delete service + tests; ensure adapter & infra remain the only sources.

-- End of Phase 2 Tech Notes --
