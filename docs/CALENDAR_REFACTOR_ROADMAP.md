# Calendar Refactor & Enhancement Roadmap

Goal: Transform the Calendar feature into a modular, scalable, accessible scheduling platform supporting events (practice, game, meeting, film, training, team event), scripts/gameplans, tagging, comments, RSVP, recurrence, export (ICS / WebCal), and mobile/calendar integration—while aligning with the design system & theming.

---

## Guiding Principles

1. Separation of concerns (domain / infra / state / UI / adapter).
2. Incremental, always‑green migration (no big bang).
3. Strong typing & schema validation boundaries (zod).
4. Optimistic UX + offline resilience (React Query cache strategy).
5. Accessibility & keyboard coverage from early phases.
6. Semantic theming only (no raw gray/navy utilities).
7. Observability: log + measure usage, performance, error rates.

---

## High-Level Architecture End State

```
src/
  domain/calendar/        # Pure types, rules, recurrence expansion
    types.ts
    schema.ts
    rules.ts
    recurrence.ts
  infra/calendar/         # API adapters, ICS generation, RSVP, comments
    api.ts
    ics.ts
    rsvp.ts
    comments.ts
  state/                  # React Query hooks
    calendar/
      queryKeys.ts        # Query key factory (implemented)
      hooks.ts            # React Query hooks (events, event, create/update/delete, RSVP, comments)
  adapters/fullcalendar/
    FullCalendarAdapter.ts
  components/calendar/
    CalendarShell.tsx
    CalendarToolbar.tsx
    ViewSwitcher.tsx
    CalendarFiltersPanel.tsx
    CalendarStats.tsx
    EventModal/
      index.ts
      EventForm.tsx
      EventDetails.tsx
    RSVPPanel.tsx
    CommentThread.tsx
    PracticeLaunchButton.tsx
    GamePlanLaunchButton.tsx
```

---

## Phase 0 – Stabilize & Baseline (Today → Short) ✅

**Objectives**

- [x] Restore current `CalendarPage` integrity (undo temporary parsing hacks if any remain)
- [x] Snapshot baseline metrics: bundle size (Calendar chunk), render time, Lighthouse a11y, raw utility debt count
- [x] Extract _only_ semantic class replacements already safe

**Deliverables**

- [x] Baseline report: `docs/calendar/baseline-metrics.md`
- [x] Commit: `feat(calendar): baseline pre-refactor snapshot`

**Exit Criteria**

- [x] Type errors: 0
- [x] Page loads without runtime warnings

---

## Phase 1 – Domain & Type Extraction ✅

**Objectives**

- [x] Create `domain/calendar/types.ts` & `schema.ts` (zod)
- [x] Migrate interfaces from service file → domain
- [x] Introduce `rules.ts` with core guards (e.g., `canEditEvent(user, event)`)

**Tasks**

- [x] Add zod schemas (EventCore, EventCreate, RSVP, Comment, Filters)
- [x] Wrap external responses with `parse...` functions
- [x] Add unit tests for schema + rules

**Exit Criteria**

- [x] 100% of calendar data consumed via schema parse
- [x] Unit tests: ≥90% statements on `domain/calendar`

---

## Phase 2 – Service & Adapter Layering ✅

**Objectives**

- [x] Decompose legacy `calendarService` into focused infra modules (api, rsvp, comments, ics) behind typed boundaries
- [x] Introduce reusable adapter that isolates FullCalendar specifics from domain/UI
- [x] Provide ICS single‑event generation prototype (foundation for feeds in Phase 8)
- [x] Maintain 100% parsing at boundaries (no raw event objects leak across layers)

**Tasks (Expanded)**

- [x] Scaffold infra modules (api, rsvp, comments, ics) and FullCalendarAdapter
- [x] Extract RSVP + comments logic from service
- [x] Migrate user/team/search/upcoming fetch & create/update/delete paths to `CalendarAPI`
- [x] Add adapter mapping edge tests (optional fields, tags, fallback type, round‑trip integrity)
- [x] Add ICS validation test (regex for VCALENDAR, DTSTART, DTEND, UID invariant) + failure case (missing title sanitization)
- [x] Slim legacy `calendarService` to thin façade, mark deprecated, ensure all new code uses infra
- [x] Add barrel export for infra & adapter (e.g. `src/infra/calendar/index.ts`)
- [x] Documentation: create `docs/calendar/PHASE2_TECH_NOTES.md` with migration checklist + adapter contract

**Exit Criteria**

- [x] `calendarService` no longer contains core fetch/transform logic (≤150 LOC, only delegates or mock fallbacks)
- [x] All calendar data retrieval & mutations travel through `CalendarAPI` / `CalendarRSVP` / `CalendarComments`
- [x] Adapter round‑trip test passes for at least 5 representative event shapes
- [x] ICS generator tested (snapshot or pattern) for at least one event; UID format `<eventId>@boxcall` enforced
- [x] Coverage for infra + adapter files ≥85% statements
- [x] Status log updated; roadmap marks Phase 2 ready to hand off to Phase 3

| 2025-08-10 | 2 | Extracted RSVP & comments infra modules (rsvp.ts, comments.ts) + tests; added legacy deprecation note to calendarService. |
| 2025-08-10 | 2-prog | Added adapter & ICS scaffolding tests; defined Phase 2 objectives & exit criteria; prepared task list for remaining service decomposition. |
| 2025-08-10 | 2-prog2 | Expanded CalendarAPI (team, search, upcoming, delete), added adapter edge tests + ICS validation, created infra barrel exports. |
| 2025-08-10 | 2-prog3 | Slimmed legacy calendarService to delegation facade (<150 LOC), migrated create/update/delete + user/team/search/upcoming to CalendarAPI, removed duplicate mock logic. Added plan for coverage & tech notes. |
| 2025-08-10 | 2-prog4 | Added exhaustive infra tests (filters, dev modes, search, upcoming, delete, invalid update, RSVPs, comments) + ICS escaping. Coverage: api ~98%, adapter ~91%, ics ~97%. |
| 2025-08-10 | 2-done | Phase 2 complete: exit criteria satisfied (service slimmed, infra coverage >95% agg, adapter ≥90%, ICS + adapter contracts documented). Ready to begin Phase 3 state layer. |

---

## Phase 3 – State Management & Optimistic UX ✅ (Completed)

**Objectives**

- [x] Introduce React Query hooks: `useEvents(range, filters)`, `useEvent(id)`, mutation hooks
- [x] Replace local state fetch logic with cached queries (UI migration complete)
- [x] Add optimistic create/update/delete + rollback on failure (all core mutations covered by tests)

**Tasks**

Legend: [x] done, [~] in progress, [ ] pending

1. [x] Query key factory (`state/calendar/queryKeys.ts`).
2. [x] Core hooks file (`state/calendar/hooks.ts`) with events + single event queries.
3. [x] Optimistic create mutation (temp ID replacement) + passing test.
4. [x] Optimistic update/delete logic + rollback tests with failure injection.
5. [x] RSVP upsert implementation + optimistic status change + test (temp -> persisted replacement retained).
6. [x] Comment add optimistic path + rollback & success tests; basic in-memory store.
7. [x] Failure simulation harness (injected errors via CalendarAPI.\_\_setFailure) covering update/delete/comment.
8. [x] Loading & error UI skeleton contract (skeleton components implemented).
9. [x] UI migration: read path + create/delete/update + RSVP + comments wired in `CalendarPage` (search via `useSearchEvents`; skeletons implemented).
10. [x] Archive legacy `calendarService` + `useCalendar*` into `src/legacy/calendar` with deprecation stubs + runtime warnings.
11. [x] Remove legacy facade + stubs once all mutations & RSVP/comments UI migrated (stub deleted; imports updated).
12. [x] Performance: range prefetch & selective invalidation strategy doc.
13. [x] Docs: Phase 3 tech notes (cache key strategy, optimistic contract, rollback patterns).
14. [x] Implement mutation UI wiring (create/update/delete) using React Query hooks.
15. [x] Implement RSVP + comments UI wiring (replace legacy paths) using React Query hooks.

**Exit Criteria**

- [x] All calendar data fetch & mutations in UI components use hooks (no direct service calls)
- [x] Optimistic flows covered by tests (create/update/delete + RSVP + comment) with rollback verification
- [x] No unnecessary refetches when toggling calendar views (cache hit demonstrated in dev tools notes)
- [x] Legacy `calendarService` facade removed; historical code isolated only under `legacy/`

---

## Phase 4 – UI Decomposition (In Progress 🚧)

**Objectives**

- [ ] Break `CalendarPage` into Shell + Toolbar + Filters + Stats + EventModal
- [ ] Introduce URL state (query params: `?view=month&date=YYYY-MM-DD&event=ID`)
- [ ] Ensure deep linking opens modal

**Tasks** (legend: [x] done, [~] in progress)

1. [~] New `CalendarShell` orchestrator (prototype exists: fetch + stats; needs toolbar, filters, calendar adapter integration)
2. [x] Feature flag & routing: `VITE_CALENDAR_SHELL=1` toggles experimental shell (`/calendar`) with side‑by‑side legacy page for parity
3. [ ] Extract Toolbar + Filters + Stats into shell composition (legacy page trimmed)
4. [ ] Implement URL sync hook (`useCalendarUrlState`) handling view/date/event with push vs replace optimization
5. [ ] Deep link modal open (`?event=ID` opens `EventModal` using cache or prefetch)
6. [ ] Split `EventModal` internals → `EventForm` + `EventDetails` (folder structure per architecture diagram)
7. [ ] Add `ViewSwitcher` component (keyboard accessible, roving tabindex, aria-current)
8. [ ] Prefetch effect: when month changes, prefetch prev/next month ranges (as per Phase 3 perf doc)
9. [ ] Debounced + highlighted search (enhance `useSearchEvents` with fuse.js or simple substring + <mark> rendering)
10. [ ] Reduce `CalendarPage` legacy wrapper to just mounting shell (eventually delete after QA sign-off)

**Exit Criteria**

- [ ] Calendar root component < 250 LOC (shell orchestrator only)
- [ ] Opening event via direct URL loads details without extra network round-trip (uses cache or prefetch)
- [ ] Parity QA checklist passes (navigation, create/update/delete, RSVP, comments) under shell flag
- [ ] Feature flag default flipped to shell after parity sign-off

---

## Phase 5 – RSVP & Comments Integration (Deferred / UI Pending)

**Objectives**

- [ ] Implement RSVP panel (mutation + optimistic user status change) UI layer
- [ ] Implement comment thread (lazy load on modal open; pagination or infinite scroll)
- [ ] Provide event activity summary (responses counts, last comment time)

**Tasks**

- [ ] `RSVPPanel` with reaction states & accessibility (aria-live updates)
- [ ] `CommentThread` w/ optimistic add + edit/delete (soft delete)
- [ ] Rate-limiting guard + minimal profanity filter placeholder

**Exit Criteria**

- [ ] RSVP change reflects within <150ms perceived (optimistic)
- [ ] Comment posting latency ≤1 network round trip w/ optimistic echo

---

## Phase 6 – Practice/GamePlan Bridging (Not Started ⛔)

**Objectives**

- [ ] Lazy mount practice planner / game plan modules from event modal
- [ ] Provide cross-navigation (Open Script button) retaining calendar context

**Tasks**

- [ ] `PracticeLaunchButton`, `GamePlanLaunchButton` components
- [ ] Preload planner chunk on hover/focus
- [ ] Persist return anchor (scroll + filter restore)

**Exit Criteria**

- [ ] Return from planner restores exact calendar state and selected event

---

## Phase 7 – Recurrence & Exceptions (Not Started ⛔)

**Objectives**

- [ ] Add RRULE support (weekly, custom) + instance expansion
- [ ] Single-occurrence override edits

**Tasks**

- [ ] `recurrence.ts` expand(range) function + caching
- [ ] Schema additions for `recurrence` + `exceptions[]`
- [ ] UI: recurrence builder (MVP weekly + custom RRULE text box)

**Exit Criteria**

- [ ] Recurring events appear expanded only within active range
- [ ] Editing one instance generates exception entry

---

## Phase 8 – Export & External Sync (Not Started ⛔)

**Objectives**

- [ ] ICS feed: per-user + per-team WebCal endpoints
- [ ] Single-click Add to Calendar (download ICS)
- [ ] Token rotation for feed URLs

**Tasks**

- [ ] Server endpoints (placeholder if backend not yet ready; mock)
- [ ] Feed signing strategy doc
- [ ] UI: copy feed URL, regenerate token

**Exit Criteria**

- [ ] Importing feed into Google/Apple shows events (manual QA)

---

## Phase 9 – Observability, A11y & Polish (Not Started ⛔)

**Objectives**

- [ ] Axe or pa11y audit passes (no critical violations)
- [ ] Performance: interaction-to-render (toolbar view switch) < 120ms median
- [ ] Error tracking (Sentry or internal) around event mutations

**Tasks**

- [ ] Add performance marks (measure navigation)
- [ ] Add ARIA roles for grid / modal and keyboard roving tab for view switch
- [ ] Logging wrappers for mutation failures

**Exit Criteria**

- [ ] Lighthouse A11y ≥ 95
- [ ] No unhandled promise rejections in QA walkthrough

---

## Stretch / Future Enhancements

- Time zone per user (store preference; convert display).
- Resource booking (fields, rooms) conflict detection.
- Notification scheduling (reminders, push).
- Attachments (files) with virus scan queue.
- Analytics dashboard (event attendance trends).

---

## Success Metrics

| Dimension   | Target                                                   |
| ----------- | -------------------------------------------------------- |
| Type safety | 0 runtime type assertion failures in logs                |
| A11y        | ≥95 score + no critical axe violations                   |
| Performance | View change <120ms median; initial load <2.5s LCP        |
| Adoption    | ≥80% practice events have attached script within 30 days |
| Error Rate  | <1% mutation failures (excluding network drops)          |

---

## Risk & Mitigation

| Risk                          | Mitigation                                                  |
| ----------------------------- | ----------------------------------------------------------- |
| Scope creep                   | Gate each phase with exit criteria & freeze scope mid-phase |
| Recurrence complexity         | Deliver MVP (weekly + custom string) before GUI builder     |
| FullCalendar upgrade friction | Adapter shield; keep library-specific code isolated         |
| Performance regressions       | Add perf marks early; track deltas in PR CI                 |
| Data shape drift              | Mandatory zod parsing layer tests                           |

---

## Phase Kickoff Checklist Template

```
1. Confirm scope vs out-of-scope list.
2. Create tracking issue(s) & link to roadmap section.
3. Add metrics instrumentation (if new dimension introduced).
4. Draft exit criteria PR comment.
5. Execute tasks (small PRs, feature flags if needed).
6. Validate: tests + manual QA script.
7. Update roadmap status & close issues.
```

---

## Immediate Next (Phase 4 Focus)

1. Integrate toolbar, filters, stats into `CalendarShell`; begin trimming legacy `CalendarPage`.
2. Implement `useCalendarUrlState` (sync view/date/event ↔ query params) + effect to open modal on `event`.
3. Prefetch prev/next month on view/date change (reuse strategy doc guidelines).
4. Extract `EventForm` & `EventDetails` from `EventModal` (no behavior change) + add folder structure.
5. Implement `ViewSwitcher` with keyboard support and aria attributes.
6. Add debounced (250ms) search + match highlighting.
7. Create parity QA checklist doc; run under VITE_CALENDAR_SHELL=1 and record deltas.
8. Update roadmap status & flip flag once parity achieved.

---

## Status Log

| Date       | Phase   | Update                                                                                                                                                                                           |
| ---------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| (init)     | 0       | Roadmap created.                                                                                                                                                                                 |
| 2025-08-10 | 0       | Baseline metrics captured (raw util debt 23 on CalendarPage, stable build, no type errors).                                                                                                      |
| 2025-08-10 | 1-prep  | Domain types extracted to `domain/calendar/types.ts` (no functional change) ahead of Phase 1.                                                                                                    |
| 2025-08-10 | 1       | Added zod schemas (schema.ts), comment types, and rules.ts scaffolding.                                                                                                                          |
| 2025-08-10 | 1-done  | Phase 1 complete: all service fetch/mutation paths parsed via zod; rules + schema tests added (17 tests). Domain coverage: schema 97.7% stmts, rules 100%. Ready to begin Phase 2 decomposition. |
| 2025-08-10 | 2-kick  | Phase 2 scaffolding: created infra/calendar (api.ts, ics.ts) + adapter (FullCalendarAdapter.ts) + initial adapter/ICS test.                                                                      |
| 2025-08-10 | 2-prog  | Extracted RSVP & comments infra modules, migrated fetch paths, added adapter edge & ICS validation tests.                                                                                        |
| 2025-08-10 | 2-prog2 | Expanded CalendarAPI (team, search, upcoming, delete), added infra barrel exports, improved coverage.                                                                                            |
| 2025-08-10 | 2-prog3 | Slimmed legacy service to delegation facade (<150 LOC), exhaustive infra tests (filters, dev modes, RSVPs, comments).                                                                            |
| 2025-08-10 | 2-done  | Phase 2 exit criteria met (infra >95% coverage, adapter ≥90%, ICS UID enforced). Ready for state layer.                                                                                          |
| 2025-08-10 | 3-kick  | Added query key factory & initial hooks scaffold (events + event + create/update/delete mutations).                                                                                              |
| 2025-08-10 | 3-prog  | Implemented optimistic create + test (temp ID replace), in-memory persistence tweak; updated legacy negative test behavior (Zod errors).                                                         |
| 2025-08-10 | 3-prog2 | Added update/delete optimistic logic (needs rollback tests), placeholder RSVP mutation, planned next tasks.                                                                                      |
| 2025-08-10 | 3-prog3 | Implemented real RSVP upsert + optimistic cache update & test (commit 7a87ff6); updated roadmap tasks & immediate next.                                                                          |
| 2025-08-10 | 3-prog4 | Added failure injection utilities + rollback tests for update/delete; comment store with optimistic add rollback/success tests (commit f9a9b43).                                                 |
| 2025-08-10 | 3-prog5 | Archived legacy `calendarService` & `useCalendar*` to `src/legacy/calendar`; added deprecation stubs + cleanup doc `CALENDAR_PHASE3_CLEANUP.md`; created `CalendarPageNew` using `useEvents`.    |
| 2025-08-10 | 3-prog6 | Implemented client-side search hook `useSearchEvents` replacing legacy search path; updated `CalendarPage` integration (commit cf45301).                                                         |
| 2025-08-10 | 3-done  | Phase 3 complete: skeletons, legacy facade removal, performance & tech notes docs added.                                                                                                         |
| 2025-08-10 | 4-kick  | Phase 4 started: experimental `CalendarPageShell` + feature flag route toggle (`VITE_CALENDAR_SHELL`); prototype shell fetch + stats; planning URL sync & component extraction.                  |
| 2025-08-10 | 4-prog  | Expanded `CalendarShell` to include toolbar, filters, stats, calendar grid, and event modal (parity structure). Ready to implement URL state sync next.                                        |
| 2025-08-10 | 4-prog2 | Added URL state sync hook (`useCalendarUrlState`); shell now syncs view changes to query params and opens modal on `?event=ID`. Next: date navigation syncing & prefetch ranges.                |

---

## Ownership

Primary: Frontend Platform / UI Architecture
Contributors: Design System, Backend (export feeds, recurrence persistence), QA Accessibility

---

## PR Tagging Conventions

- `feat(calendar-domain)` – new domain types / rules
- `feat(calendar-ui)` – UI components / decomposition
- `feat(calendar-rsvp)` – RSVP/Comments
- `feat(calendar-recurrence)` – recurrence logic
- `chore(calendar-refactor)` – internal reshaping
- `fix(calendar)` – bug fixes

---

## Definition of Done (Overall Initiative)

All phases 0–9 exit criteria met, baseline metrics improved (perf, a11y), feature coverage (RSVP, comments, scripts integration, recurrence, export) stable in production for at least one iteration with <1% error rate and documented runbooks.
