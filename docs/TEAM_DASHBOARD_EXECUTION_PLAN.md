## Team Dashboard Cleanup & Enablement Plan (2025-08-09)

Author: Automated assistant draft — refine as needed.

### Objective

Replace misleading mock data with truthful onboarding states, then incrementally introduce real data features (events, posts, stats) with secure RLS, telemetry, and consistent UI/UX foundations.

### Git & Work Recovery Safeguards (NEW)

| Goal                           | Action                                                              |
| ------------------------------ | ------------------------------------------------------------------- |
| Prevent lost work              | Commit after each numbered step (or sub-step)                       |
| Automatic safety               | Enable VS Code autosave (afterDelay ~500ms)                         |
| Pre-push validation            | Run `npm run predev` (type + lint) before every push                |
| Snapshot before risky refactor | `git commit -m "chore(dashboard): snapshot before layout change"`   |
| Fast rollback                  | Use short-lived branches: `feature/dashboard-phase2-step13` etc.    |
| Uncommitted diff alert         | (Optional) Pre-commit hook to abort on >400 changed lines w/o tests |
| Daily safety tag               | End-of-day: `git tag safety-2025-08-09 && git push --tags`          |

Recommended Commit Pattern:

```
feat(dashboard): step13 migrations draft
feat(dashboard): step14 rls policies (select + insert)
feat(dashboard): step15 service stubs (events/posts/stats)
feat(dashboard): step16 event creation form (coach gated)
feat(dashboard): step17 game result logging + stats refresh
feat(dashboard): step18 feed mvp (list + create + pin)
feat(telemetry): first post/event/game_result events
chore(a11y): heading hierarchy + focus order adjustments
```

### Phase 2 Database Integration Verification Checklist (NEW)

Complete these BEFORE binding UI forms to real data:

1. Migrations
   - team_posts (id, team_id FK, author_profile_id, title, body, pinned boolean default false, created_at)
   - team_events (id, team_id, created_by, type enum, starts_at timestamptz, location text, notes?, created_at)
   - game_results (id, team_id, game_date, opponent, home_away enum, points_for, points_against, created_at)
   - season_stats view (wins, losses, pf_total, pa_total computed from game_results)
2. Indexes
   - team_posts: (team_id, created_at DESC)
   - team_events: (team_id, starts_at DESC)
   - game_results: (team_id, game_date DESC)
3. RLS (baseline)
   - ENABLE RLS on all three tables
   - SELECT: team membership required
   - INSERT/UPDATE/DELETE: require capability (policy USING subquery on membership role)
4. Capability Mapping Consistency
   - Map head_coach/coach roles → CAN_CREATE_POST, CAN_CREATE_EVENT, CAN_LOG_GAME_RESULT
5. Service Layer Stubs
   - postsService.list(teamId)
   - postsService.create(data, ctx)
   - eventsService.list(teamId, { upcomingOnly? })
   - eventsService.create(data, ctx)
   - gameResultsService.list(teamId)
   - gameResultsService.log(data, ctx)
   - statsService.getSeason(teamId)
6. Hooks (thin adapters)
   - useTeamPosts(teamId), useCreatePost()
   - useTeamEvents(teamId), useCreateEvent()
   - useGameResults(teamId), useLogGameResult()
   - useSeasonStats(teamId)
7. Telemetry Wiring
   - post.create.started/succeeded/failed
   - event.create.started/succeeded/failed
   - game_result.log.started/succeeded/failed
8. UI Binding Order
   - (a) Read-only panels render with loading + empty (OnboardingHint)
   - (b) Creation dialogs gated by capability & role
   - (c) Pin post action (head_coach only) AFTER base create stable
9. Refresh Model
   - After create/log: optimistic cache insert → background refetch
   - After game_result log: invalidate season stats query key
10. Accessibility & Semantics
    - Feed region labelled (aria-label="Team feed")
    - Logical heading hierarchy (no level skips)
    - Focus returns to invoking button after dialog close
11. Performance
    - SELECT only necessary columns (avoid SELECT \*)
    - Dev metric: log row counts on first fetch (remove in prod)
12. Failure Handling
    - Toast w/ retry on mutation failure
    - Failure telemetry emitted even if UI suppressed

### Augmented Phase 2 Definition of Done (NEW)

A Phase 2 item is “Done” only if:

- Migration + RLS + policy review ✅
- Service method + hook + optimistic flow ✅
- Telemetry events (started/succeeded/failed) fire ✅
- Empty + loading + error states visible ✅
- Capability enforcement verified by role downgrade test ✅
- A11y: headings logical + focus management validated ✅

### Guiding Principles

- Truthful UI first (no fabricated stats or activity).
- Capability-driven (role → capabilities → rendered actions).
- Modular slices (feed, events, stats, achievements) with service hooks.
- Telemetry for onboarding & first real interactions.
- Accessibility & contrast baked in early.

### Phase 0 (Done When: All mock panels removed)

1. ✅ Replace TeamFeed mock posts with onboarding placeholder (OnboardingHint) — COACH CTA to plan first post.
2. ✅ Replace TeamCalendar mock events with onboarding placeholder (OnboardingHint) — CTA to plan event.
3. ✅ Trophy Case mock replaced with tutorial placeholder.
4. ✅ Season Stats placeholder implemented.
5. ✅ Upcoming Events summary placeholder implemented.
6. ⏳ Add EmptyState + Skeleton primitives (optional if OnboardingHint covers baseline) — PENDING.

### Phase 1 (Foundation / Permissions / Telemetry)

7. ✅ Capability Map: role → capabilities (e.g., CAN_CREATE_POST, CAN_CREATE_EVENT, CAN_LOG_GAME_RESULT, CAN_VIEW_STATS).
8. ✅ Refactor QuickActions to config-driven rendering (no emojis; design-system icons w/ labels).
9. ✅ Telemetry utility: onboarding.view, onboarding.action.click + lifecycle helpers (post/event/game_result create/log) added.
10. ✅ Layout modularization: split `TeamBulletin` into `TeamBulletinHeader`, `TeamFeedPanel`, `TeamLeftPanel`, `TeamRightPanel` for maintainability.
11. ✅ Design consistency pass: normalized button variants (shared Button), removed dashboard emojis, prepared contrast/a11y notes.
12. 🔄 Accessibility pass: Landmarks + aria-labels (feed, left, right panels; new post/button labels) added; next: heading hierarchy (H1/H2), role="note" for hints, focus order review.

### Phase 2 (Data Models & Initial Features) – enable reads then writes

13. Draft & commit migrations:
    - team_posts
    - team_events
    - game_results + season_stats view
14. Implement RLS policies (select => team members; insert/update guarded by capabilities).
15. Service layer stubs + hooks: useTeamEvents(), useTeamPosts(), useSeasonStats().

- [x] Step 16: Event creation UI (modal form, optimistic create, capability-gated) – complete

17. Game result logging (coach) updates season stats view (wins/losses, PF/PA) — view auto refresh. (✅ Complete)
18. Feed MVP: create + list posts (announcement only) with pinned boolean. No comments/reactions yet.
   - In progress: listing + creation modal (coach roles), optimistic create, pin toggle (head coach), onboarding hint, aria-live announcements, first-post telemetry hook
19. Telemetry events for first event, first post, first game result.

### Phase 3 (Engagement & Expansion)

20. Comments & reactions (rate limited) on posts.
21. RSVP / attendance table for events (player responses, coach oversight).
22. Achievement schema spec & initial migration (player_recognitions tie-in) powering Trophy Case dynamic data.
23. Real-time updates via Supabase channels for posts & events.
24. Mobile adaptive enhancements (collapsible side panels, reorder priority content).
25. Player personalization (filter feed by type; highlight upcoming personal events / assignments).

### Phase 4 (Analytics & Quality)

26. Season trend mini-charts (spark lines) in stats panel.
27. Performance instrumentation (LCP/INP for dashboard route; lazy-load non-critical panels).
28. Test coverage: capability resolver, RLS policy simulation tests (SQL), hook unit tests (mocks), accessibility snapshot.
29. Progressive enhancement: offline caching for latest feed/events.

### Capability Map Draft

| Role       | Capabilities                                                           |
| ---------- | ---------------------------------------------------------------------- |
| head_coach | All coach + CAN_PIN_POST                                               |
| coach      | CAN_CREATE_POST, CAN_CREATE_EVENT, CAN_LOG_GAME_RESULT, CAN_VIEW_STATS |
| player     | CAN_VIEW_POST, CAN_VIEW_EVENT, (future) CAN_RSVP_EVENT                 |
| family     | CAN_VIEW_POST (limited), CAN_VIEW_EVENT                                |

### Telemetry Event Naming

onboarding.view (context: feed|calendar|stats|events_summary)
onboarding.action.click (action_id)
post.create.started/succeeded/failed
event.create.started/succeeded/failed
game_result.log.started/succeeded/failed

### Definition of Done per Phase

Phase 0: No mock arrays in production code; placeholders only.
Phase 1: Capability map + telemetry + refactored layout merged; contrast & a11y pass.
Phase 2: Real events, posts, game results & stats operational; instrumentation present.
Phase 3: Engagement features (comments/reactions/RSVP) live; achievements spec committed.
Phase 4: Analytics & quality enhancements + test thresholds met.

### Current Status

- Phase 0 baseline placeholders complete (Step 6 optional pending). ✅
- Phase 1: Capability map, QuickActions refactor, layout modularization complete; telemetry lifecycle events implemented; accessibility pass in progress. ✅/🔄

### Next Immediate Commits (Suggested Sequence)

1. Draft migrations (team_posts, team_events, game_results, season_stats view) – step13.
2. Add RLS policies (select + insert/update) – step14.
3. Introduce service layer stubs + hooks – step15.
4. Event creation form (coach) – step16.
5. Game result logging + stats view refresh – step17.
6. Feed MVP (create + list + pin) – step18.
7. Telemetry first-\* instrumentation validation – step19.
8. A11y heading hierarchy + focus audit.

---

Keep this doc updated each time a step completes: append a short dated log at bottom.

Log:

- 2025-08-09: Document created & STEP 1 initiated.
- 2025-08-09: Feed & Calendar placeholders merged; capability map + QuickActions refactor + telemetry scaffold implemented.
- 2025-08-09: Layout modularization completed (header/left/feed/right panels).
- 2025-08-09: Added visual status check marks (✅ done, 🔄 partial, ⏳ pending) and prepped for Phase 1 Step 11 design consistency pass.
- 2025-08-09: Phase 1 Step 11 completed (buttons unified to design-system, dashboard emojis removed, contrast review queued for Step 12).
- 2025-08-09: Telemetry lifecycle helpers added (post/event/game_result) + New Post button instrumented; accessibility & contrast incremental updates applied.
- 2025-08-09: Added Git safeguards, Phase 2 verification checklist, augmented Phase 2 DoD, and revised next commit sequence.
- 2025-08-09: Stage 12 a11y audit pass: added main landmark, skip link, aria-labelledby, consistent h1/h2 hierarchy, converted panels to section/aside.
- 2025-08-09: Step 15 scaffolding: service layer + React Query hooks (posts/events/game_results/stats) with optimistic updates & telemetry lifecycle integration.
- 2025-08-09: Step 16 complete: Event creation modal integrated in TeamCalendar (coach/head_coach gating via placeholder capability), optimistic insert + telemetry.
- 2025-08-09: Step 17 planning initiated: Add LOG_GAME_RESULT capability, SeasonStats card component (wins/losses/pf/pa/win%), modal form (date, opponent, site enum, scores, notes optional), optimistic result entry (already supported) + automatic stats refetch.
- 2025-08-09: Step 17 complete: LOG_GAME_RESULT capability, SeasonStatsCard (stats, recent results, outcome badges), logging modal w/ validation, toast notifications, focus return & optimistic + stats refresh.
