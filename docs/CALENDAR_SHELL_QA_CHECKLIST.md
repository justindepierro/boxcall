# Calendar Shell QA Checklist (Phase 4 Parity)

Goal: Verify new `CalendarShell` achieves functional parity with legacy `CalendarPage` before flipping feature flag default and removing legacy rendering.

## Environment

- Build with `VITE_CALENDAR_SHELL=1`
- (Optional) Dev mode profiles to populate events: set dev mode via existing UI/dev tools

## Core Flows

1. Load `/calendar` (authenticated) – shell renders without errors (skeleton appears then events).
2. View switching: Month ↔ Week ↔ Day updates calendar, URL `?view=` param reflects changes.
3. Date navigation: Prev / Next / Today updates calendar; `?date=` param updates (YYYY-MM-DD).
4. Deep link open: Manually add `?event=<existingId>` – modal auto-opens with correct event.
5. Modal close clears `event` param from URL.
6. Create event (select range or Add Event button) – optimistic insert visible, replaced with real ID.
7. Edit event (open, modify fields) – optimistic patch updates list (if implemented) or persists without error.
8. Delete event – optimistic removal; event disappears from list.
9. RSVP panel (if present now) or placeholder actions do not error (Phase 5 items can be skipped if not yet migrated).
10. Comment add (if present) optimistic echo then persistence (skip if deferred to Phase 5).
11. Universal search: typing filters list after debounce (~350ms); clearing restores all events.
12. Highlighting: search term wrapped in <mark> inside event titles.
13. Prefetch: Navigate month boundary then quickly return; previously visited month loads instantly (verify via React Query devtools if available).
14. Accessibility: Tab to view switcher – left/right/Home/End keys move focus; Enter/Space changes view.
15. Keyboard: Escape closes modal and returns focus to last interactive element.
16. Reload with `?view=week&date=YYYY-MM-DD` – calendar initializes in correct view/date.
17. Performance: View switch <120ms (manual feel); no visible flash when switching views.
18. No network refetch on pure view toggle (query cache reused) – confirm via network panel.
19. Fallback: With feature flag off, legacy page still working (until flag flip phase).

## Edge Cases

- Search term with special regex chars (e.g. `* ( ) + ?`) does not crash highlighting.
- Empty event list (devMode blank profile) shows stats component gracefully.
- Very rapid navigation (prev/next spam) does not throw errors.
- Opening modal via deep link for event not yet in current range (should fail gracefully or fetch if implemented later).

## Pass Criteria

- All applicable core flows pass (excluding deferred Phase 5 features) with no console errors.
- No regressions vs legacy in create/update/delete flows.
- URL state always matches visible calendar state after interactions.

## Sign-off Steps

1. Complete checklist, record any deltas.
2. Fix critical deltas (data loss, incorrect state sync).
3. Update roadmap (Phase 4) marking QA parity achieved.
4. Flip feature flag default (enable shell) & stop rendering legacy component.
5. Create removal task ticket for deleting legacy `CalendarPage` after one release cycle (optional grace period).
