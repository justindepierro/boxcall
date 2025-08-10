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
    calendarQueries.ts
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
## Phase 0 – Stabilize & Baseline (Today → Short)
**Objectives**
- Restore current `CalendarPage` integrity (undo temporary parsing hacks if any remain).
- Snapshot baseline metrics: bundle size (Calendar chunk), render time, Lighthouse a11y, raw utility debt count.
- Extract *only* semantic class replacements already safe.

**Deliverables**
- Baseline report: `docs/calendar/baseline-metrics.md`.
- Commit: `feat(calendar): baseline pre-refactor snapshot`.

**Exit Criteria**
- Type errors: 0.
- Page loads without runtime warnings.

---
## Phase 1 – Domain & Type Extraction
**Objectives**
- Create `domain/calendar/types.ts` & `schema.ts` (zod).
- Migrate interfaces from service file → domain.
- Introduce `rules.ts` with core guards (e.g., `canEditEvent(user, event)`).

**Tasks**
1. Add zod schemas (EventCore, EventCreate, RSVP, Comment, Filters).
2. Wrap external responses with `parse...` functions.
3. Add Jest/unit tests for schema + rules.

**Exit Criteria**
- 100% of calendar data consumed via schema parse.
- Unit tests: ≥90% statements on `domain/calendar`.

---
## Phase 2 – Service & Adapter Layering
**Objectives**
- Split monolithic `calendarService.ts` into infra modules (`api.ts`, `rsvp.ts`, `comments.ts`).
- Add adapter: `FullCalendarAdapter` (map domain event ↔ FullCalendar event object).
- Introduce ICS generation prototype (single event export).

**Tasks**
1. Move fetch/create/update logic into `api.ts` returning *parsed* domain objects.
2. Add `ics.ts` with basic event → ICS string (UID format: `<eventId>@boxcall`).
3. Add smoke tests for adapter mapping.

**Exit Criteria**
- Calendar page uses adapter; no direct FullCalendar-specific shapes elsewhere.
- ICS export button returns valid `.ics` (validated by regex + sample import test).

---
## Phase 3 – State Management & Optimistic UX
**Objectives**
- Introduce React Query hooks: `useEvents(range, filters)`, `useEvent(id)`, mutation hooks.
- Replace local state fetch logic with cached queries.
- Add optimistic create/update/delete + rollback on failure.

**Tasks**
1. `state/calendarQueries.ts` + query keys strategy.
2. Event mutation tests (simulate network failure → rollback). 
3. Loading skeleton components.

**Exit Criteria**
- All network calls pass through React Query.
- No stale re-fetch when switching views (cache hit confirmed).

---
## Phase 4 – UI Decomposition
**Objectives**
- Break `CalendarPage` into Shell + Toolbar + Filters + Stats + EventModal.
- Introduce URL state (query params: `?view=month&date=YYYY-MM-DD&event=ID`).
- Ensure deep linking opens modal.

**Tasks**
1. New `CalendarShell` orchestrator.
2. `EventModal` extracted; form & details separated.
3. `ViewSwitcher` component with keyboard nav.
4. URL sync hook (pushState + replaceState optimization).

**Exit Criteria**
- Calendar root component < 250 LOC.
- Opening event via direct URL loads details without extra network round-trip (uses cache or prefetch).

---
## Phase 5 – RSVP & Comments Integration
**Objectives**
- Implement RSVP panel (mutation + optimistic user status change).
- Implement comment thread (lazy load on modal open; pagination or infinite scroll).
- Provide event activity summary (responses counts, last comment time).

**Tasks**
1. `RSVPPanel` with reaction states & accessibility (aria-live updates).
2. `CommentThread` w/ optimistic add + edit/delete (soft delete).
3. Rate-limiting guard + minimal profanity filter placeholder.

**Exit Criteria**
- RSVP change reflects within <150ms perceived (optimistic).
- Comment posting latency ≤1 network round trip w/ optimistic echo.

---
## Phase 6 – Practice/GamePlan Bridging
**Objectives**
- Lazy mount practice planner / game plan modules from event modal.
- Provide cross-navigation (Open Script button) retaining calendar context.

**Tasks**
1. `PracticeLaunchButton`, `GamePlanLaunchButton` components.
2. Preload planner chunk on hover/focus.
3. Persist return anchor (scroll + filter restore).

**Exit Criteria**
- Return from planner restores exact calendar state and selected event.

---
## Phase 7 – Recurrence & Exceptions
**Objectives**
- Add RRULE support (weekly, custom) + instance expansion.
- Single-occurrence override edits.

**Tasks**
1. `recurrence.ts` expand(range) function + caching.
2. Schema additions for `recurrence` + `exceptions[]`.
3. UI: recurrence builder (MVP weekly + custom RRULE text box).

**Exit Criteria**
- Recurring events appear expanded only within active range.
- Editing one instance generates exception entry.

---
## Phase 8 – Export & External Sync
**Objectives**
- ICS feed: per-user + per-team WebCal endpoints.
- Single-click Add to Calendar (download ICS).
- Token rotation for feed URLs.

**Tasks**
1. Server endpoints (placeholder if backend not yet ready; mock).
2. Feed signing strategy doc.
3. UI: copy feed URL, regenerate token.

**Exit Criteria**
- Importing feed into Google/Apple shows events (manual QA). 

---
## Phase 9 – Observability, A11y & Polish
**Objectives**
- Axe or pa11y audit passes (no critical violations).
- Performance: interaction-to-render (toolbar view switch) < 120ms median.
- Error tracking (Sentry or internal) around event mutations.

**Tasks**
1. Add performance marks (measure navigation).
2. Add ARIA roles for grid / modal and keyboard roving tab for view switch.
3. Logging wrappers for mutation failures.

**Exit Criteria**
- Lighthouse A11y ≥ 95.
- No unhandled promise rejections in QA walkthrough.

---
## Stretch / Future Enhancements
- Time zone per user (store preference; convert display).
- Resource booking (fields, rooms) conflict detection.
- Notification scheduling (reminders, push).
- Attachments (files) with virus scan queue.
- Analytics dashboard (event attendance trends).

---
## Success Metrics
| Dimension | Target |
|-----------|--------|
| Type safety | 0 runtime type assertion failures in logs |
| A11y | ≥95 score + no critical axe violations |
| Performance | View change <120ms median; initial load <2.5s LCP |
| Adoption | ≥80% practice events have attached script within 30 days |
| Error Rate | <1% mutation failures (excluding network drops) |

---
## Risk & Mitigation
| Risk | Mitigation |
|------|-----------|
| Scope creep | Gate each phase with exit criteria & freeze scope mid-phase |
| Recurrence complexity | Deliver MVP (weekly + custom string) before GUI builder |
| FullCalendar upgrade friction | Adapter shield; keep library-specific code isolated |
| Performance regressions | Add perf marks early; track deltas in PR CI |
| Data shape drift | Mandatory zod parsing layer tests |

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
## Immediate Next (Actionable Start)
1. Implement Phase 0 baseline report + ensure CalendarPage type import stability.
2. Create `domain/calendar/types.ts` & move interfaces (Phase 1 prep PR #1).
3. Add `zod` dependency (if not present) & initial schemas.

---
## Status Log
| Date | Phase | Update |
|------|-------|--------|
| (init) | 0 | Roadmap created. |

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
