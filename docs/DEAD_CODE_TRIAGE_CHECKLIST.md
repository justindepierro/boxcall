# Dead Code Triage Checklist

Purpose: Systematically decide what to remove vs. what to keep as scaffold for future features. Keep this list short, actionable, and updated as we knock items down.

Status key

- [ ] todo
- [~] confirm reachability (lazy routes, dynamic import)
- [S] scaffold, keep and add to roadmap
- [R] remove after validation

## 1) Dependencies

- Candidates to remove (validate first):
  - [~] react-hook-form, @hookform/resolvers
  - [~] dompurify
  - [~] fabric, @types/fabric
  - [~] html2canvas
  - [~] idb
  - [~] jspdf
  - [~] papaparse, @types/papaparse
  - [~] react-calendar
  - [~] react-mentions
  - [~] slate, slate-react
  - [~] socket.io-client
  - [~] workbox-webpack-plugin
  - [~] @testing-library/jest-dom, @testing-library/user-event
  - [~] @typescript-eslint/eslint-plugin, @typescript-eslint/parser (note: used via eslint config—confirm safety)
  - [~] husky, lint-staged (note: used locally—confirm keep)

Actions

- [ ] For each above, grep for imports/usages (including dynamic)
- [ ] If truly unused, remove and run typecheck/tests/build
- [ ] If to be used soon, mark [S] and link to roadmap item

## 2) Legacy calendar and practice modules

- Calendar
  - [R] src/pages/CalendarPage.tsx (legacy guard, removed)
  - [R] src/pages/CalendarPageNew.tsx (legacy guard, removed)
  - [R] src/pages/CalendarPageShell.tsx (legacy guard, removed)
  - [~] src/legacy/calendar/\*\*
  - [~] src/components/calendar/\*\* (specific dup/unused exports listed by knip)

- Practice
  - [R] src/components/practice/components/MemoizedPracticeTable.tsx (unreferenced, removed)
  - [R] src/components/practice/components/PracticeBlocksList.tsx (unreferenced, removed)
  - [R] src/components/practice/components/modals/AddBlockModal.tsx (unreferenced, removed)
  - [R] src/components/practice/components/modals/AddGroupModal.tsx (unreferenced, removed)
  - [R] src/components/practice/components/modals/EditGroupModal.tsx (unreferenced, removed)
  - [R] src/components/practice/components/modals/index.ts (unreferenced barrel, removed)

Actions

- [ ] Verify not reachable via routes or lazy imports
- [ ] If deprecated, mark [R] and remove
- [ ] If future, mark [S] and capture scope in roadmap

## 3) Services and cross-platform

- [~] src/services/cross-platform/\*\* (bridge/unified gateways)
- [~] src/services/phase1/**, src/services/phase2/**
- [~] src/services/offlineDataManager.ts

Actions

- [ ] Confirm not used by current flows
- [ ] Keep minimal interfaces if referenced by types; otherwise [R]

## 4) UI and icons

- [~] src/components/ui/Icon/\*\* (many exports unused/duplicated)
- [~] src/components/ui/\* indices re-exporting unused symbols

Actions

- [ ] Prune unused icons/exports; keep stable public re-exports used by app
- [ ] Ensure tree-shaking-safe named exports

## 5) Routes and pages

- [~] src/routes/\*_/_.tsx (Permission routes, SplitRouter)
- [~] src/pages/\*_/_.tsx (BoxCall, DashboardPage, DiagnosticsPage, TeamsPage, etc.)
- [R] src/components/ui/Popover/Popover.tsx (unreferenced, removed)
- [R] src/pages/index.ts (unreferenced page aggregator, removed)
- [R] src/components/ui/SegmentedControl/SegmentedControl.tsx (unreferenced, removed)
- [R] src/components/ui/Surface/Surface.tsx (unreferenced, removed)

Actions

- [ ] Cross-check with actual router config and LazyRoutes
- [ ] Remove dead routes; keep scaffolds with TODO links

## 6) Types and utils

- [~] src/types/\*\* (calendar, play, rsvp, permissions)
- [~] src/utils/\*_ (play_ utils, navigation, performanceMonitoring, etc.)

Actions

- [ ] Remove unused exports only after dependent modules are decided
- [ ] Avoid churn on types until module deletions settle

## 7) Process & CI

- [ ] Use `npm run code:dead:json` to generate knip-report.json for triage
- [ ] Start with dep removals (small PRs), then files, then exports
- [ ] Add `code:dead:ci` to CI in non-blocking mode for visibility

## Notes

- Respect future roadmap scaffolds—do not delete, mark [S] and reference the roadmap file
- For ambiguous modules, mark [~] and verify reachability before acting
