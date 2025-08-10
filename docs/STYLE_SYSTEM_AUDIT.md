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
| Signal | Count / Note | Action Priority |
|--------|--------------|-----------------|
| `text-white` occurrences | 322 | Audit surfaces; reduce via primitives |
| Legacy `bg-emerald-*` | 33 | Codemod to jade scale (Phase 0) |
| `bg-blue-600` (strong CTAs) | 27 | Map to semantic primary / secondary |
| Direct raw button elements (non-`<Button>`) | TBC (script) | Inventory → migrate |
| Mixed color tokens vs utilities | High | Introduce semantic alias layer |
| Scattered text color utilities (text-gray-900 / dark:text-white) | Many | Replace with Typography defaults |
| Inconsistent radii (rounded / md / lg) | Found in pills & modals | Normalize to radius tokens |
| Dark mode hover/active gaps | Several buttons | Add dark variants |

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
1. Identify and patch any white text on light backgrounds (visual hot spots: onboarding, TeamBulletin CTAs, calendar pills).  
2. Codemod: `bg-emerald-*` → `bg-jade-*` (and matching hover/focus).  
3. Replace strong blue CTA backgrounds with semantic `Button` variant (use existing `primary` or create `info`).  
4. Introduce temporary `.debug-contrast` utility (outline low-contrast nodes) for manual QA.  
5. Create this audit doc & commit baseline metrics.  

### Phase 1 (Unification)
6. Inventory & migrate all raw `<button>` elements to shared `Button` component (add variants if needed).  
7. Implement `Badge` & `Tag` primitives; refactor inline pills / status chips.  
8. Add `palette.ts` (semantic mapping) exporting structural + semantic tokens.  
9. Apply semantic surface classes (`surface-card`, `surface-subtle`) to cards/modals instead of raw `bg-white/bg-gray-*`.  
10. Replace ad-hoc heading classes with `<Typography>` usage (script to flag offenders).  

### Phase 2 (Automation & Gates)
11. Script `scripts/style-audit.mjs`: parse JSX classNames → produce JSON + Markdown (color utility usage, components missing primitives).  
12. Add `scripts/contrast-check.mjs`: static approximate contrast evaluation of foreground/background pairs (logs failures).  
13. ESLint custom rule: forbid `text-white` unless paired with approved dark/brand backgrounds.  
14. Add `npm run style-audit` to predev / CI pipeline (fails on violations).  
15. Snapshot baseline diff before enabling fail mode (allow learning period).  

### Phase 3 (Token Hardening)
16. Introduce CSS variable layer: `:root { --color-primary-bg: #00A86B; ... }` with dark overrides under `.dark`.  
17. Refactor `buttonVariants` to consume token maps (no raw tailwind color utilities inside variant definitions).  
18. Build `semanticClasses` generator (maps tokens → tailwind safelisted classes) for future theme overrides.  
19. Replace direct radius utilities with token classes (`radius-xs`, `radius-sm`, `radius-md`).  

### Phase 4 (Accessibility & Motion)
20. Audit focus-visible: ensure all interactive elements have strong, non-color-only focus states (≥2px outline or ring).  
21. Honor `prefers-reduced-motion`: wrap animations in media query & provide fallback.  
22. Validate keyboard navigation order & skip links (expand beyond current single skip link).  
23. Add high contrast theme toggle (phase backlog if bandwidth limited).  

### Phase 5 (Documentation & Governance)
24. Author `STYLE_GUIDE.md` (visual examples, do/don't, component matrices).  
25. Publish color contrast matrix (rows: backgrounds, columns: text variants).  
26. PR checklist updates: design primitives usage, contrast pass, no new disallowed utilities.  
27. Weekly automated style report appended to `docs/styles/REPORT_<date>.md`.  

## 5. Scripts & Tooling (Planned)
| Script | Purpose | Phase |
|--------|---------|-------|
| `scripts/style-audit.mjs` | Parse codebase → usage stats JSON/MD | 2 |
| `scripts/contrast-check.mjs` | Approx contrast validation | 2 |
| `scripts/codemod-colors.mjs` | Replace legacy emerald/blue usage | 0/1 |
| ESLint rule `no-raw-inverted-text` | Gate unsafe white-on-light text | 2 |

## 6. Metrics & Success Criteria
| Metric | Baseline | Goal Phase 1 | Goal Phase 2 | Final Target |
|--------|----------|--------------|--------------|--------------|
| Raw `text-white` occurrences | 322 | <250 | <190 | <150 (mostly primitives) |
| Legacy emerald usages | 33 | 0 | 0 | 0 |
| Blue CTA backgrounds (non-semantic) | 27 | <10 | <3 | 0 |
| Non-primitive buttons (%) | TBC | <40% | <15% | <5% |
| Contrast violations (AA) | TBD (after first scan) | <10 | 0 | 0 |
| Headings using Typography (%) | TBD | >80% | >95% | 100% |

## 7. Immediate Task List (Active)
- [ ] (P0) Codemod emerald → jade mapping prepared.  
- [ ] (P0) Identify & patch white-on-light risk clusters.  
- [ ] (P0) Migrate highest-traffic blue CTAs to `Button` primary variant.  
- [ ] (P0) Add `.debug-contrast` utility (temporary).  
- [ ] (P0) Commit baseline metrics (this doc).  

## 8. Risk & Mitigation
| Risk | Impact | Mitigation |
|------|--------|------------|
| Codemod false positives | Visual regressions | Batch commits + snapshot diff per directory |
| Dark mode regression | Poor UX in dark theme | Cross-theme snapshot after each token refactor |
| Performance risk adding dynamic classes | Build size growth | Consolidate to semantic safelist & purge unused |
| Over-restriction from ESLint early | Dev friction | Start in warn mode → escalate to error after clean baseline |

## 9. Follow-Up / Stretch Enhancements
- Team theming (upload palette → dynamic CSS vars).
- Typography responsive scale refinements (clamp-based fluid sizing).
- Motion token system (duration, easing, distance) with dark/light adjustments.
- Global spacing scale tokenization (density already partly done; finalize). 

## 10. Ownership & Governance
| Area | Owner | Backup |
|------|-------|--------|
| Token definitions | TBD | — |
| Button / primitives | TBD | — |
| Style audit scripts | TBD | — |
| Accessibility audits | TBD | — |

PR Checklist Additions (Planned):
- [ ] No new raw color class outside semantic palette.
- [ ] No `text-white` on non-approved dark backgrounds.
- [ ] Components use shared primitives where available.
- [ ] Contrast script passes.

## 11. Implementation Notes / Decisions Log
| Date | Change | Rationale |
|------|--------|-----------|
| 2025-08-09 | Document created | Establish baseline & urgency |
| (add) | Codemod run #1 (emerald→jade) | Palette consolidation |
| (add) | Introduced style audit script | Automation foundation |

---
**Next Action After Commit:** Execute emerald→jade codemod prototype and patch top 5 white-on-light issues; then update metrics section.
