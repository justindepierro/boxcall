# Delete Week (Cleanup Cadence)

Delete Week is a recurring cleanup practice: every sprint we remove or merge at least 5 files/components and track net deletion as a KPI.

## Goals

- Keep the codebase small, fast, and discoverable
- Remove redundant/legacy/contradicting paths before they rot
- Reduce cognitive load for new contributors

## KPI

Track these in PR descriptions (and optionally in sprint notes):

- Files removed: N
- Files merged: N
- Net LOC removed: approx N

## What qualifies for deletion

- Unused shims (compat layers no longer referenced)
- Deprecated pages/components that are no longer routed or linked
- Duplicate utilities and “parallel” implementations
- Dead feature flags, commented-out blocks, or placeholder modules
- Legacy exports kept “just in case” with zero call sites

## Safety rules

- No UX changes: deletions should not change user-facing behavior
- Verify no imports/usages before deleting
- Remove/adjust barrel exports and references
- Run at least:
  - `npm run type-check`
  - `npm run lint`
  - `npm run test`

## How to find candidates

- Search for:
  - `DEPRECATED`, `legacy`, `backward compatibility`, `shim`
  - unused pages in routes
  - old single-file shims where a folder `index.ts` already exists
- Confirm with repo search that the symbol/path is unused.

## PR checklist (Delete Week)

- List the 5+ deletions/merges (file paths)
- Mention any alias/export rewires
- Confirm validation commands passed

## Living checklist (Dec 2025)

This checklist is the authoritative “Delete Week” backlog. As we complete items, we:

1. Check the box here
2. Commit and push immediately
3. Keep type-check + tests green

### Phase 1 — Routing correctness (prevent 404s)

- [x] Replace Footer legal links to `/privacy` + `/terms` (src/components/layout/Footer.tsx)
- [x] Update hover prefetch importer map to match legal routes (src/routes/importers.ts)
- [x] Remove or deprecate unused legacy legal route cases (`/privacy-policy`, `/terms-of-service`) once no longer referenced (src/routes/importers.ts)
- [x] Remove unused legacy `ROUTES.TEAMS` constant if no remaining imports (src/routes/paths.ts)

### Phase 2 — Dead / legacy UI components

- [x] Delete unused DashboardHeader component (src/components/dashboard/DashboardHeader.tsx)

### Phase 3 — Safe deletions of unused legacy exports

- [x] Remove unused TeamService legacy aliases (TeamCreationService / TeamValidationService / TeamDuplicatePreventionService) (src/services/teamService.ts)

### Phase 4 — Migrate then delete used compatibility shims

- [x] Migrate analytics UI imports from GamePlanningAnalyticsService → PlayAnalyticsService (src/services/playAnalyticsService.ts)
- [x] Migrate analytics UI imports from PlaybookAnalyticsService → PlayAnalyticsService (src/services/playAnalyticsService.ts)
- [x] Delete the wrapper classes after migrations (src/services/playAnalyticsService.ts)

- [x] Migrate all imports from PracticeScriptService → PracticeService (src/services/practiceService.ts)
- [x] Delete PracticeScriptService alias export after migration (src/services/practiceService.ts)

- [x] **KEEP** calendar compatibility shims (EventsService / listTeamEvents / createEvent / rsvpService)
  - Decision: Simple proxies, low technical debt, actively used by TeamCalendar
  - Not worth migration effort (aesthetic only, no runtime impact)
  - File: src/services/calendarService.ts (lines 229-245)

### Phase 5 — Stub/mock features (requires product decision)

These are not “pure deletion” targets — they are either implement-or-remove candidates.

- [ ] Decide on Join Team mock flow: implement real backend or remove/feature-gate
  - src/pages/JoinTeam/useJoinTeamHandlers.ts
  - src/pages/JoinTeam/constants.ts

- [ ] Decide on Player Performance analytics: wire real tables/queries or remove dashboard
  - src/services/performanceAnalyticsService.ts
  - src/components/analytics/PlayerPerformanceDashboard.tsx

- [ ] Decide on Formation service no-op: implement backend or keep stub + hide UI
  - src/services/formationService.ts

- [x] Replace network status hook stub (navigator.onLine + events + connection quality)
  - src/hooks/useNetworkStatus.ts
  - src/components/ui/MobileLoadingStrategy.tsx

### Phase 6 — Deprecated dead blocks

- [x] Remove commented-out deprecated DB helpers (tables that don't exist in production)
  - src/lib/database-helpers.ts (removed 3 commented blocks: team_goals, team_files, post_reactions)

### Validation gate (run before every push)

- [ ] `npm run type-check`
- [ ] `npm run lint`
- [ ] `npm run test`
