## Team Dashboard Cleanup & Enablement Plan (2025-08-09)

Author: Automated assistant draft — refine as needed.

### Objective

Replace misleading mock data with truthful onboarding states, then incrementally introduce real data features (events, posts, stats) with secure RLS, telemetry, and consistent UI/UX foundations.

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
9. 🔄 Telemetry utility: onboarding.view, onboarding.action.click (wired in OnboardingHint), future: post.create.started (creation events pending).
10. ✅ Layout modularization: split `TeamBulletin` into `TeamBulletinHeader`, `TeamFeedPanel`, `TeamLeftPanel`, `TeamRightPanel` for maintainability.
11. ⏳ Design consistency pass: remove remaining emojis, normalize button variants, audit contrast (AA).
12. ⏳ Accessibility pass: heading structure (H1 page title, H2 section titles), aria roles for onboarding hints (role="note" or region labeled).

### Phase 2 (Data Models & Initial Features) – enable reads then writes

13. Draft & commit migrations:
    - team_posts
    - team_events
    - game_results + season_stats view
14. Implement RLS policies (select => team members; insert/update guarded by capabilities).
15. Service layer stubs + hooks: useTeamEvents(), useTeamPosts(), useSeasonStats().
16. Event creation (coach only) minimal form (title, type, starts_at, location).
17. Game result logging (coach) updates season stats view (wins/losses, PF/PA) — view auto refresh.
18. Feed MVP: create + list posts (announcement only) with pinned boolean. No comments/reactions yet.
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
- Phase 1: Capability map, QuickActions refactor, layout modularization complete; telemetry scaffold active (creation events pending). ✅/🔄

### Next Immediate Commits (Suggested Sequence)

1. Apply STEP 1 code changes (this commit).
2. Add capability map + QuickActions refactor scaffold.
3. Telemetry util + wire onboarding hints.
4. Layout split for TeamBulletin.
5. Draft migrations (team_posts, team_events, game_results, season_stats view).

---

Keep this doc updated each time a step completes: append a short dated log at bottom.

Log:

- 2025-08-09: Document created & STEP 1 initiated.
- 2025-08-09: Feed & Calendar placeholders merged; capability map + QuickActions refactor + telemetry scaffold implemented.
- 2025-08-09: Layout modularization completed (header/left/feed/right panels).
- 2025-08-09: Added visual status check marks (✅ done, 🔄 partial, ⏳ pending) and prepped for Phase 1 Step 11 design consistency pass.
