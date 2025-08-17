# Sidebar Navigation Overhaul — Working Roadmap

Last updated: 2025-08-17
Owner: Justin (with support)
Branch: feat/sidebar-nav

Pin this doc in VS Code (right‑click the tab → Pin). Update checkboxes as we progress.

---

## Goals
- World‑class sidebar: fast, collapsible/expandable, responsive (mobile → desktop), accessible, and extensible.
- Route‑aware (React Router v7+), clear active state, and minimal re‑renders.
- Persist user preferences (collapsed state, favorites). No layout shift or jank.

## Success metrics
- Interaction latency (toggle/open/hover) < 16ms p90.
- Toggle animation ≤ 150ms; 0 CLS during transitions.
- Axe: 0 critical violations; WCAG AA contrast.
- Fewer clicks to top 3 destinations vs. current nav (−20–30%).

## North‑star principles
- Single source of truth for nav structure (typed, feature/role filtered).
- Predictable keyboard behavior; focus-visible rings and tooltips in rail mode.
- Minimal surface area: CSS transitions, memoized item rendering, tree-shaken icons.

---

## Status dashboard
- [ ] Phase 0: IA + wireframes
- [x] Phase 1: Nav schema + tests
- [ ] Phase 2: Sidebar component shell (desktop) (in progress)
- [ ] Phase 3: Routing/state integration (in progress)
- [ ] Phase 4: Perf + polish
- [ ] Phase 5: A11y + contrast validation
- [ ] Phase 6: Mobile/Tablet behaviors
- [ ] Phase 7: Enhancements (post‑MVP)

---

## Phase 0 — IA and UX spec
Deliverables
- [ ] Top‑level groups and frequent paths (Team, Playbook, Practice, Calendar, Analytics, Settings)
- [ ] Wireframes for mobile, tablet, desktop
- [ ] Decision on mobile behavior (drawer + bottom quick strip)

Notes
- Promote quick actions (e.g., “New Play”, “New Event”) and recently visited.

---

## Phase 1 — API and data model
Files (planned)
- `src/navigation/nav.schema.ts` — typed nav tree (id, label, icon, routeId/path, children, flags, badge)
- `src/navigation/nav.selectors.ts` — filters, active/expanded derivation

Tasks
- [x] Define schema types and example seed data
- [x] Role/feature‑flag filtering
- [x] Map to route IDs/paths; validate no orphans
- [x] Unit tests for filtering/derivation

Contract
- Input: user role + enabled features
- Output: filtered, ordered nav tree with active/expanded hints
- Error handling: invalid route IDs, circular children → fail tests

---

## Phase 2 — Sidebar component system (desktop first)
Files (planned)
- `src/components/ui/Sidebar/Sidebar.tsx` — container (rail/full), resize, persistence
- `src/components/ui/Sidebar/NavItem.tsx` — item with icon, label, badge, tooltip
- `src/components/ui/Sidebar/NavGroup.tsx` — collapsible group with keyboard support
- `src/components/ui/Sidebar/Sidebar.types.ts`

Tasks
- [x] Rail mode (≈64px) + expanded width (responsive)
- [x] Local persistence (collapsed state) via localStorage
- [x] Keyboard nav (Arrow Up/Down, Home/End, Enter/Space) with roving tabindex
- [x] Tooltips in rail mode using shared Tooltip (aria-describedby)
- [ ] Basic RTL/Tailwind tokens; CSS‑only transitions

---

## Phase 3 — Routing integration and state
Files (planned)
- `src/hooks/useSidebarState.ts` — collapse/expanded/favorites

Tasks
- [x] Active route highlighting via React Router
- [x] Auto‑expand parents of active item
- [ ] Favorites/pins (persisted)
- [x] Tests for deep linking and expansion sync (selectors unit tests)

---

## Phase 4 — Performance and polish
Tasks
- [ ] Strict memoization of items; measure renders
- [ ] Defer icon imports; prefetch visible icons
- [ ] No layout shift on toggle; verify with Web Vitals
- [ ] Skeletons for slow data cases

---

## Phase 5 — Accessibility and contrast
Tasks
- [ ] Roles: navigation + tree/list as appropriate
- [ ] aria-current on active; aria-expanded on groups
- [ ] Full keyboard coverage (Tab/Shift+Tab, arrows, Enter/Space, Esc)
- [ ] Axe smoke tests; contrast verification

---

## Phase 6 — Mobile/Tablet adaptation
Tasks
- [ ] Mobile: overlay drawer + scrim; focus trap; swipe optional
- [ ] Tablet: rail by default; expandable on demand
- [ ] QA across sm/md/lg/xl breakpoints

---

## Phase 7 — Enhancements (post‑MVP backlog)
- [ ] Command palette integration
- [ ] Recents and “pin to sidebar” quick actions
- [ ] Deep‑linkable expanded state
- [ ] Server‑persisted preferences

---

## Test plan
- Unit: schema filtering, active derivation (Vitest)
- Component: keyboard nav, aria‑current, tooltip a11y (RTL)
- E2E: open/close, persist state, mobile drawer smoke (Playwright)
- Performance: Interaction delay <16ms p90; no CLS on toggle

---

## Risks & mitigations
- Over‑engineering nested trees → keep depth small; lazy‑render long lists.
- Icon bundle bloat → tree‑shake icons; dynamic imports for less‑used sets.
- State drift between routing and groups → single source of truth + selectors.

---

## Decisions log
- 2025‑08‑17: Single typed schema drives UI; loader‑first auth remains; sidebar reflects routes.
- 2025‑08‑17: Sidebar uses React Router Links instead of window.location for SPA navigation.
- 2025‑08‑17: Auto‑expand parent groups based on current pathname → child href prefix match.
- 2025‑08‑17: `href` passed through nav mapping so Sidebar can compute active/aria‑current.
- 2025‑08‑17: Introduced `src/navigation/nav.selectors.ts` for active/expanded derivation with tests.

---

## Working notes / TODO (scratchpad)
- [x] Create feature branch: `feat/sidebar-nav`
- [x] Scaffold files listed in Phase 1/2
- [x] Add initial nav seed for visual iteration

---

## Next steps (short‑term)

- [ ] Favorites (pin/unpin) UI and persistence; show pinned group at top
- [ ] Wire Favorites (pin/unpin) UI and persistence; show pinned group at top
- [ ] Convert NavBar items to React Router Links for SPA consistency
- [ ] Add tests: deep‑linking auto‑expand (component level), keyboard a11y, aria‑current on Links
- [ ] Run `npm run audit:legacy:nav` and plan removal of flagged wrappers/routes
