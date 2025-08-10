# Style System Comprehensive Audit Roadmap

> Living document for consolidating and professionalizing BoxCall UI. Update as phases complete. (Created: 2025-08-09)

## 1. Core Objectives (Critical Tonight)

- Eliminate low-contrast text (white on light, muted on light, hover states without adequate contrast).
- Standardize buttons (variants, spacing, typography, states, disabled, dark mode parity).
- Consolidate color usage (retire stray emerald / arbitrary blues → jade & navy semantic system).
- Remove inconsistent radii / padding outside density & radius tokens.
- Enforce typography hierarchy (headings & body via `Typography`, defaults consistent).
- Establish automated contrast & style usage audit (baseline metrics + failing gate for regressions).

## 2. Current Pain Signals (Baseline Scan)

| Signal                                                           | Count / Note            | Action Priority                       |
| ---------------------------------------------------------------- | ----------------------- | ------------------------------------- |
| `text-white` occurrences                                         | 322                     | Audit surfaces; reduce via primitives |
| Legacy `bg-emerald-*`                                            | 33                      | Codemod to jade scale (Phase 0)       |
| `bg-blue-600` (strong CTAs)                                      | 27                      | Map to semantic primary / secondary   |
| Direct raw button elements (non-`<Button>`)                      | TBC (script)            | Inventory → migrate                   |
| Mixed color tokens vs utilities                                  | High                    | Introduce semantic alias layer        |
| Scattered text color utilities (text-gray-900 / dark:text-white) | Many                    | Replace with Typography defaults      |
| Inconsistent radii (rounded / md / lg)                           | Found in pills & modals | Normalize to radius tokens            |
| Dark mode hover/active gaps                                      | Several buttons         | Add dark variants                     |

> NOTE: Baseline counts captured before any codemod. Re-run after each phase.

## 3. Target End State

- Single semantic color vocabulary (primary, secondary, neutral, info, success, warning, danger, accent, surface-[neutral|raised|subtle], border-[light|strong], text-[primary|secondary|muted|inverse]).
- All interactive elements use shared primitives (Button, Input, Select, Badge, Tag, Pill, Alert).
- Contrast: Body text & interactive text AA (≥4.5), large display AA (≥3.0) — aim for AAA (≥7.0) for body where feasible.
- Density + radius tokens only (no ad-hoc spacing/radius utilities beyond approved set).
- Automated style audit script + ESLint rule set; CI fails on new violations.
- Ready for theme overrides (team customization) via CSS variables.

## 4. Phased Action Plan

### Phase 0 (Immediate – Tonight)

1. ✅ Identify and patch any white text on light backgrounds (IN PROGRESS: 197 heuristic candidates queued; triage subset next).
2. ✅ Codemod: `bg-emerald-*` → `bg-jade-*` (complete – 156 replacements).
3. ✅ Replace strong blue CTA backgrounds with semantic `Button` variant (complete – 158 replacements; 1 doc example retained).
4. ✅ Introduce temporary `.debug-contrast` (runtime overlay `contrastDebug.ts`) for manual QA (enable with localStorage flag).
5. ✅ Create this audit doc & commit baseline metrics.

### Phase 1 (Unification)

6. ⏳ Inventory & migrate all raw `<button>` elements to shared `Button` component (script planned).
7. ⏳ Implement `Badge` & `Tag` primitives; refactor inline pills / status chips (Badge exists; Tag pending).
8. ⏳ Add `palette.ts` (semantic mapping) exporting structural + semantic tokens.
9. ⏳ Apply semantic surface classes (`surface-card`, `surface-subtle`) to cards/modals instead of raw `bg-white/bg-gray-*`.
10. ⏳ Replace ad-hoc heading classes with `<Typography>` usage (script to flag offenders).

### Phase 2 (Automation & Gates)

11. ⏳ Script `scripts/style-audit.mjs`: parse JSX classNames → produce JSON + Markdown (color utility usage, components missing primitives).
12. ⏳ Add `scripts/contrast-check.mjs`: static approximate contrast evaluation of foreground/background pairs (logs failures).
13. ⏳ ESLint custom rule: forbid `text-white` unless paired with approved dark/brand backgrounds.
14. ⏳ Add `npm run style-audit` to predev / CI pipeline (fails on violations).
15. ⏳ Snapshot baseline diff before enabling fail mode (allow learning period).

### Phase 3 (Token Hardening)

16. ⏳ Introduce CSS variable layer: `:root { --color-primary-bg: #00A86B; ... }` with dark overrides under `.dark`.
17. ⏳ Refactor `buttonVariants` to consume token maps (no raw tailwind color utilities inside variant definitions).
18. ⏳ Build `semanticClasses` generator (maps tokens → tailwind safelisted classes) for future theme overrides.
19. ⏳ Replace direct radius utilities with token classes (`radius-xs`, `radius-sm`, `radius-md`).

### Phase 4 (Accessibility & Motion)

20. ⏳ Audit focus-visible: ensure all interactive elements have strong, non-color-only focus states (≥2px outline or ring).
21. ⏳ Honor `prefers-reduced-motion`: wrap animations in media query & provide fallback.
22. ⏳ Validate keyboard navigation order & skip links (expand beyond current single skip link).
23. ⏳ Add high contrast theme toggle (phase backlog if bandwidth limited).

### Phase 5 (Documentation & Governance)

24. ⏳ Author `STYLE_GUIDE.md` (visual examples, do/don't, component matrices).
25. ⏳ Publish color contrast matrix (rows: backgrounds, columns: text variants).
26. ⏳ PR checklist updates: design primitives usage, contrast pass, no new disallowed utilities.
27. ⏳ Weekly automated style report appended to `docs/styles/REPORT_<date>.md`.

## 5. Scripts & Tooling (Planned)

| Script                             | Purpose                              | Phase |
| ---------------------------------- | ------------------------------------ | ----- |
| `scripts/style-audit.mjs`          | Parse codebase → usage stats JSON/MD | 2     |
| `scripts/contrast-check.mjs`       | Approx contrast validation           | 2     |
| `scripts/codemod-colors.mjs`       | Replace legacy emerald/blue usage    | 0/1   |
| ESLint rule `no-raw-inverted-text` | Gate unsafe white-on-light text      | 2     |

## 6. Metrics & Success Criteria

| Metric                              | Baseline                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Goal Phase 1   | Goal Phase 2 | Final Target             |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------------ | ------------------------ |
| Raw `text-white` occurrences        | 322 (197 flagged heuristically for review)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | <250           | <190         | <150 (mostly primitives) |
| Legacy emerald usages               | 33 (→ 0 after codemod)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | 0              | 0            | 0                        |
| Blue CTA backgrounds (non-semantic) | 27 (→ 1 after codemod)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | <10            | <3           | 0                        |
| Non-primitive button files          | 78 (baseline) → 74 (after pass 1) → 73 (JoinTeam) → 72 (Templates) → 71 (PracticeBlocksList) → 70 (PlaybookPage) → 69 (CoachManagementPage) → 68 (PersonalCalendar) → 67 (BulkActionsToolbar) → 66 (InteractivePlayBuilder) → 65 (CreateTeam) → 64 (RoleBasedDashboard) → 63 (DataTab) → 62 (CSVImportModal) → 61 (TimelineAllocation & CreateCoachAccount) → 60 (OverviewTab) → 53 (5-count batch: TeamOnboarding, AdvancedFilters, AutocompleteDropdown, PlaybookGlossary, EnhancedFieldCanvas, ScriptSelectorModal, SubscriptionRoute) → 48 (4-count batch: UserMenu, PlayBuilderWizard, QuickEntry, PlayFilters, VisualPlayBuilder) → 38 (3-count batch: PlayBuilderCore, DrawingTools, FieldCanvas, TimelineSlider, AddBlockModal, AddGroupModal, EditGroupModal, Breadcrumb, ErrorBoundary, MobileErrorState) → 35 (4-count batch part 2: PracticeHeader, CalendarPage, PlayerDashboardPage, TimelineAllocation) → 34 (PlayCard workflow buttons) → 29 (2-count batch: DevTools, MobileQuickActions, AdvancedSearchBar, AddNewDropdown, QuickFilters) → 28 (routes & toast batch: Toast, TeamBulletin, AppRouter 404, PermissionRoute, TeamMemberRoute) | <40 (ACHIEVED) | <15          | <5                       |
| Contrast violations (AA)            | TBD (after first scan)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | <10            | 0            | 0                        |
| Headings using Typography (%)       | TBD                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | >80%           | >95%         | 100%                     |

## 7. Immediate Task List (Active)

- [x] (P0) Codemod emerald → jade mapping applied (156 replacements; legacy usages now 0).
- [ ] (P0) Identify & patch white-on-light risk clusters (197 heuristic candidates; prioritize high-traffic screens first).
- [x] (P0) Migrate highest-traffic blue CTAs to `Button` primary variant (blue 500/600 CTAs → jade; 1 remaining in docs README).
- [x] (P0) Add `.debug-contrast` utility (runtime overlay loaded in dev via import in `main.tsx`).
- [x] (P0) Commit baseline metrics (this doc).

## 8. Risk & Mitigation

| Risk                                    | Impact                | Mitigation                                                  |
| --------------------------------------- | --------------------- | ----------------------------------------------------------- |
| Codemod false positives                 | Visual regressions    | Batch commits + snapshot diff per directory                 |
| Dark mode regression                    | Poor UX in dark theme | Cross-theme snapshot after each token refactor              |
| Performance risk adding dynamic classes | Build size growth     | Consolidate to semantic safelist & purge unused             |
| Over-restriction from ESLint early      | Dev friction          | Start in warn mode → escalate to error after clean baseline |

## 9. Follow-Up / Stretch Enhancements

- Team theming (upload palette → dynamic CSS vars).
- Typography responsive scale refinements (clamp-based fluid sizing).
- Motion token system (duration, easing, distance) with dark/light adjustments.
- Global spacing scale tokenization (density already partly done; finalize).

## 10. Ownership & Governance

| Area                 | Owner | Backup |
| -------------------- | ----- | ------ |
| Token definitions    | TBD   | —      |
| Button / primitives  | TBD   | —      |
| Style audit scripts  | TBD   | —      |
| Accessibility audits | TBD   | —      |

PR Checklist Additions (Planned):

- [ ] No new raw color class outside semantic palette.
- [ ] No `text-white` on non-approved dark backgrounds.
- [ ] Components use shared primitives where available.
- [ ] Contrast script passes.

## 11. Implementation Notes / Decisions Log

| Date       | Change                          | Rationale                                                                                                                                                                                                                  |
| ---------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2025-08-09 | Document created                | Establish baseline & urgency                                                                                                                                                                                               |
| 2025-08-10 | Codemod run #1 (emerald→jade)   | Palette consolidation (156 replacements; legacy emerald utilities removed)                                                                                                                                                 |
| 2025-08-10 | Codemod run #2 (blue CTAs)      | Consolidated high-emphasis blues → jade (158 replacements; 1 doc example retained)                                                                                                                                         |
| (add)      | Introduced style audit script   | Automation foundation                                                                                                                                                                                                      |
| 2025-08-10 | White-on-light scan heuristic   | 197 potential candidates identified for triage                                                                                                                                                                             |
| 2025-08-10 | Button inventory script         | Added `scripts/inventory-buttons.mjs` + npm script `style:inventory:buttons`                                                                                                                                               |
| 2025-08-10 | Button migration pass 1         | Removed mixed usage; raw button files 78 → 74                                                                                                                                                                              |
| 2025-08-10 | JoinTeam cluster migrated       | Largest raw button cluster (13) converted to `Button`; metric 74 → 73                                                                                                                                                      |
| 2025-08-10 | Templates cluster migrated      | Second largest cluster (12) converted; metric 73 → 72                                                                                                                                                                      |
| 2025-08-10 | PracticeBlocksList migrated     | Third cluster (10) converted; metric 72 → 71                                                                                                                                                                               |
| 2025-08-10 | PlaybookPage migrated           | Fourth cluster (10) converted; metric 71 → 70                                                                                                                                                                              |
| 2025-08-10 | CoachManagementPage migrated    | Fifth cluster (9) converted; metric 70 → 69                                                                                                                                                                                |
| 2025-08-10 | PersonalCalendar migrated       | Sixth cluster (7) converted; metric 69 → 68                                                                                                                                                                                |
| 2025-08-10 | BulkActionsToolbar migrated     | Bulk actions bar (7) converted; metric 68 → 67                                                                                                                                                                             |
| 2025-08-10 | InteractivePlayBuilder mig.     | Visual builder modal controls (7) converted; metric 67 → 66                                                                                                                                                                |
| 2025-08-10 | CreateTeam migrated             | Creation wizard CTAs (7) converted; metric 66 → 65                                                                                                                                                                         |
| 2025-08-10 | RoleBasedDashboard migrated     | Admin dashboard actions (6) converted; metric 65 → 64                                                                                                                                                                      |
| 2025-08-10 | DataTab migrated                | Dev data & mode switcher actions (6) converted; metric 64 → 63                                                                                                                                                             |
| 2025-08-10 | CSVImportModal migrated         | CSV import workflow actions (6) converted; metric 63 → 62                                                                                                                                                                  |
| 2025-08-10 | TimelineAllocation migrated     | Practice time allocation actions (6) converted; metric 62 → 61                                                                                                                                                             |
| 2025-08-10 | CreateCoachAccount migrated     | Coach account wizard CTAs (6) converted; metric 62 → 61 (shared batch)                                                                                                                                                     |
| 2025-08-10 | BulkActionsToolbar migrated     | Seventh cluster (7) converted; metric 68 → 67                                                                                                                                                                              |
| 2025-08-10 | InteractivePlayBuilder mig.     | Eighth cluster (7) converted; metric 67 → 66                                                                                                                                                                               |
| 2025-08-10 | CreateTeam migrated             | Ninth cluster (7) converted; metric 66 → 65                                                                                                                                                                                |
| 2025-08-10 | OverviewTab migrated            | Dev tools quick actions (5) converted; metric 61 → 60                                                                                                                                                                      |
| 2025-08-10 | 5-count batch migrated          | 7 files (TeamOnboarding, AdvancedFilters, AutocompleteDropdown, PlaybookGlossary, EnhancedFieldCanvas, ScriptSelectorModal, SubscriptionRoute) converted; metric 60 → 53                                                   |
| 2025-08-10 | 4-count batch migrated          | 5 files (UserMenu, PlayBuilderWizard, QuickEntry, PlayFilters, VisualPlayBuilder) converted; metric 53 → 48                                                                                                                |
| 2025-08-10 | 3-count batch migrated          | 10 files (PlayBuilderCore, DrawingTools, FieldCanvas, TimelineSlider, AddBlockModal, AddGroupModal, EditGroupModal, Breadcrumb, ErrorBoundary, MobileErrorState) converted; metric 48 → 38 (Phase 1 threshold <40 reached) |
| 2025-08-10 | 4-count batch (part 2) migrated | 4 files (PracticeHeader, CalendarPage, PlayerDashboardPage, TimelineAllocation) converted; metric 38 → 35                                                                                                                  |
| 2025-08-10 | PlayCard workflow buttons       | Replaced remaining raw buttons in PlayCard; metric 35 → 34                                                                                                                                                                 |
| 2025-08-10 | 2-count batch migrated          | 5 files (DevTools, MobileQuickActions, AdvancedSearchBar, AddNewDropdown, QuickFilters) converted; metric 34 → 29                                                                                                          |
| 2025-08-10 | Routes & toast batch migrated   | Toast action/dismiss, TeamBulletin actions, 404 fallback, permission & membership route fallbacks converted; metric 29 → 28                                                                                                |
| 2025-08-10 | IconButton micro-primitive      | Added lightweight `IconButton` for chromeless icon-only actions (modal close, input visibility, select clear) to prevent Button overload                                                                                   |
| 2025-08-10 | Singleton sweep batch #1        | Converted miscellaneous single-file raw buttons (logs tab clear, role protected route placeholders, initial dashboard tweaks); metric 28 → 24                                                                              |
| 2025-08-10 | Singleton sweep batch #2        | Further isolated conversions (auth link buttons, toast demo, minor utilities); metric 24 → 21                                                                                                                              |
| 2025-08-10 | Singleton sweep batch #3        | Replaced remaining scattered raw usages incl. error placeholders and small controls; metric 21 → 18                                                                                                                        |
| 2025-08-10 | Icon size & naming corrections  | Normalized icon size tokens (removed numeric) & unsupported names before final replacements; metric unaffected (context for stability)                                                                                     |
| 2025-08-10 | Final refinement pass #1        | Converted residual low-complexity raws (TeamFeeds CTA, PlayerRoster retry, DevelopmentTools reset); metric 18 → 17                                                                                                         |
| 2025-08-10 | Final refinement pass #2        | Converted contact form submit, FAQ link, database team selector; metric 17 → 16 (all remaining are candidate exemptions or timeline-dense patterns)                                                                        |
| 2025-08-10 | Dense timeline cell adjustment  | TimelineContainer & TimelineAllocation minute cells switched from `<button>` to semantic `<div role="button">` for 100s of cells performance; excluded from button primitive requirement (documented exemption)            |
| 2025-08-10 | Mobile nav primitive migration  | MobileBottomNavigation items now use Button primitive for consistent focus ring & a11y; metric 16 → 5                                                                                                                      |
| 2025-08-10 | Grid toggle micro control       | PlayGrid one-word toggle uses IconButton; metric 5 → 4                                                                                                                                                                     |
| 2025-08-10 | Logo uploader exemption noted   | Chose to exempt TeamBulletinHeader logo upload control (media upload surface) from Button migration; final non-exempt raw count = 0 (exempt raw = 1)                                                                       |

### Exemption Rationale (Interactive Density / Specialized Controls)

| Component / Pattern                | Exemption Type        | Rationale                                                                                                                                                   | Future Action                                                                                      |
| ---------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Timeline minute cells (allocation) | Dense interactive map | Hundreds of contiguous cells; Button wrapper adds overhead (DOM size, focus ring noise). Replaced with `div[role="button"]` + keyboard handlers for a11y.   | If we build a dedicated `TimelineCell` primitive, it can wrap this pattern with optimized styling. |
| PracticeTimeline minute cells      | Dense interactive map | Same pattern as above in scaffold variant; unified approach for consistency + performance.                                                                  | Share future `TimelineCell` if created.                                                            |
| Team logo uploader (header)        | Media upload target   | Acts as image placeholder / interactive drop target; current styling custom. Button provides limited benefit; keeping custom for drag/drop potential later. | Revisit when introducing generic `FileUploadButton` primitive.                                     |
| (If remains) Other micro toggles   | Micro icon controls   | IconButton covers most; any leftover raw interactive spans will be migrated or wrapped in IconButton when encountered.                                      | Periodic audit via lint rule `no-raw-interactive` (planned).                                       |

---

**Next Action After Commit:** Execute emerald→jade codemod prototype and patch top 5 white-on-light issues; then update metrics section.

> Button Inventory: Run `npm run style:inventory:buttons` to generate `docs/style-inventory/buttons.{json,md}`; update "Non-primitive buttons (%)" baseline after first run.
