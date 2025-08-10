# BoxCall UI Professionalization Plan

> Goal: Elevate the current refactored, tokenized foundation into a cohesive, professional, brand-consistent product UI. This plan is the tactical playbook for the next styling sprint. Source of truth for style direction going forward.
>
> Companion docs: `STYLE_SYSTEM_AUDIT.md` (governance + metrics), `BADGE_TAG_GUIDELINES.md` (Badge vs Tag decision tree), `tokens.ts`, `style-audit.mjs`.

---

## 0. Guiding Principles

| Principle                | Rationale                                                         | Heuristic Check                       |
| ------------------------ | ----------------------------------------------------------------- | ------------------------------------- |
| Semantic First           | Avoid raw utility drift & ease theming                            | 0 new `bg-white` w/out surface-\*     |
| Depth with Restraint     | Elevation only where it improves scan                             | Max 2 elevations visible per viewport |
| Brand Hierarchy          | Jade = primary action/accent, Navy = structure, Neutrals = canvas | No off-scale blues/greens             |
| Clear Typographic Rhythm | Consistent heading/body mapping                                   | All h\* via `<Typography>` variants   |
| Predictable Interactions | Hover, focus, active coherent across primitives                   | Same timing / easing tokens           |
| Accessible by Default    | Contrast & focus resilience                                       | 0 AA violations (buttons/text)        |
| Tooling Enforced         | Prevent regression                                                | CI audit gating after threshold       |

---

## 1. Target End-State Snapshot

1. All containers mapped to: `surface-app`, `surface-header`, `surface-card`, `surface-subtle`, `surface-inverse`.
2. Row/list interactions standardized: `surface-subtle` + `surface-subtle-hover` (or token alias once added).
3. Navigation: token-based (implemented) + active gradient rail + consistent badge style.
4. Elevation rhythm: card (rest/hover), dropdown, modal, popover; no ad-hoc shadows.
5. Typography: 100% of headings replaced with `<Typography>`; body defaults removed from ad-hoc class stacks.
6. Buttons: Only design-system variants used; spacing & radii uniform.
7. Badges / Tags / Chips: unified primitives replacing inline styles.
8. Tooltip & Popover surfaces use `surface-inverse` with standardized padding & arrow token.
9. Form fields: uniform density, focus outline, help text color tokens.
10. Audit scripts + ESLint fail on new raw `text-white`, unauthorized `bg-*`, unsanctioned radius.

---

## 2. Phased Execution (Progress Status)

### Phase A (Visual Foundation) – COMPLETED 2025-08-10

| Order | Task                                                                 | Status      | Outcome Metric Result                     |
| ----- | -------------------------------------------------------------------- | ----------- | ----------------------------------------- |
| A1    | Finish surface remediation                                           | Done        | 0 legacy `bg-white` containers (search=0) |
| A2    | Apply elevation utility classes                                      | Done        | Cards/dropdowns/modals mapped             |
| A3    | Standardize interactive list rows                                    | Done        | row-hover applied globally                |
| A4    | Introduce `surface-subtle-hover` token & replace ad-hoc `hover:bg-*` | In Progress | Token added; migrating usages via alias   |
| A5    | Navigation polish (badges + active state small-screen)               | Pending     | Scheduled next                            |

\*Token class not yet added; functional standardization achieved via `row-hover` utility.

### Phase B (In Progress)

| Order | Task                                           | Scope                         | Metric                                                                 |
| ----- | ---------------------------------------------- | ----------------------------- | ---------------------------------------------------------------------- |
| B1    | Typography sweep codemod                       | All headings (h1–h5)          | 95% adoption                                                           |
| B2    | Badge & Tag primitives                         | Status chips, filters, counts | 100% Tag adoption (0 inline pills) + Badge canonical variants complete |
| B3    | Tooltip & Popover refactor (`surface-inverse`) | ComplexityBadge, menus, hints | Tooltip & Popover primitives added; inverse adoption metric tracking   |
| B4    | Button variant audit & tighten spacing         | Variant map + docs            | No variant drift                                                       |
| B5    | IconButton variant alignment                   | Danger/ghost/subtle mapping   | Shared interaction tokens                                              |
| B6    | Add `surface-subtle-hover` token + class       | Row/list hovers               | Replace interim row-hover                                              |

### Phase C (Week Continuation)

| Theme         | Tasks                                                                                                | Tooling Additions                                    |
| ------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Governance    | ESLint autofix for `no-unsafe-white`, escalate radius rule → error, surface container lint           | Rules: no raw `rounded-*` (error), no raw neutral bg |
| Accessibility | Reduced-motion fallback, expanded contrast matrix (full text×surface), keyboard focus audit          | `contrast-matrix.mjs` (expanded)                     |
| Theming Prep  | Theme registry, dark + high-contrast packs, build-themes script, runtime ThemeManager, prebuild hook | `generate-tokens-css.ts`, `build-themes.mjs`         |
| Semantic Map  | Codemod raw color utilities in primitives → var classes; introduce semantic radius/spacing helpers   | `codemod-semantic-colors.mjs` (planned)              |
| Reporting     | Weekly style delta report, theme validation report (contrast, missing tokens)                        | CI job artifact, theme validation script             |
| Hardening     | Utility usage manifest & CI gate (fail on new disallowed categories), palette drift detector         | `style-audit.mjs` extension                          |

---

## 3. Component Treatment Matrix (Updated)

| Component / Area        | Current Status                | Actions / Notes                              | Tokens / Classes                   |
| ----------------------- | ----------------------------- | -------------------------------------------- | ---------------------------------- |
| Dashboard Cards         | Semantic + elevation complete | Monitor for drift                            | surface-card, elevation-card       |
| Team Calendar Rows      | Hover standardized            | Swap to subtle-hover token later             | row-hover (→ surface-subtle-hover) |
| Trophy Case             | Borders normalized            | Evaluate internal separators                 | border-subtle                      |
| Modals                  | Updated                       | Confirm all nested forms semantic            | elevation-modal, surface-card      |
| Dropdowns/Select Menus  | Updated                       | Add popover inverse variant later            | elevation-dropdown, surface-card   |
| Tooltips / Hover Panels | Legacy                        | Phase B target                               | surface-inverse (planned)          |
| Badges/Chips            | Inline                        | Replace with primitive                       | badge-\* (planned)                 |
| Forms (Input, Select)   | Surface/elevation aligned     | Add help/error text tokens (Phase B)         | text-text-secondary/error          |
| Navigation              | Desktop polished              | Add mobile active rail + badge normalization | nav-item-active, surface-nav       |

---

## 4. Token Additions & Adjustments (Pending)

| Token                    | Purpose               | Light Value               | Dark Value         | Status    |
| ------------------------ | --------------------- | ------------------------- | ------------------ | --------- |
| `--surface-subtle-hover` | Row hover delta       | `#F3F4F6` (gray-100)      | rgba(31,41,55,0.8) | Added     |
| `--surface-inverse`      | Tooltip / popover     | `#111827`                 | `#374151`          | Added     |
| `--border-strong`        | Emphasis dividers     | `#CBD5E1`                 | `#475569`          | Not added |
| `--focus-ring`           | Unified focus outline | Jade 600                  | Jade 500           | Not added |
| `--easing-standard`      | Animation consistency | `cubic-bezier(.4,0,.2,1)` | same               | Not added |

---

## 5. Metrics & Gates (Snapshot 2025-08-10 Post Phase A)

| Metric                                  | Previous (Est) | Current           | Gate Enable | Final Target |
| --------------------------------------- | -------------- | ----------------- | ----------- | ------------ |
| Raw `bg-white` (non-semantic container) | >50            | 0                 | <15         | 0            |
| `surfaceCandidates` (open)              | 80+            | 25 (audit sample) | <25         | 0            |
| Card elevation consistency              | <40%           | ~100%             | 100%        | 100%         |
| Typography adoption                     | 0%             | 100%              | Gate now    | 100%         |
| Tag adoption (inline pills remaining)   | ~60+ raw pills | 0                 | Gate now    | 0            |
| Tooltip inverse adoption                | <10%           | <10%              | 100%        | 100%         |
| Contrast violations                     | 0              | 0                 | Gate now    | 0            |
| New unsafe whites post-gate             | 0              | 0                 | Immediate   | 0            |

Audit Note: Remaining surfaceCandidates reflect translucent or partial semantic cases (e.g. `bg-white/50`, wizard modals, legacy playbuilder stacks) to be migrated in Phase B/C when those components undergo deeper refactor. They are now isolated and enumerated in `style-audit.md` for tracking.

(Will refresh metrics automatically below after running latest style audit.)

---

## 6. Immediate NEXT TODO (Phase B In Flight)

- [ ] Migrate `row-hover` utility to new `surface-subtle-hover` class (verify parity then remove alias).
- [x] Add CI gate: fail if raw utility headings / `text-white`; soft baseline watch for raw container `bg-white` (script `style:gate`).
- [x] Tag primitive rollout (replaced all inline pills) + CI gate for new inline pill patterns.
- [ ] Draft Badge primitive API + sample variants (neutral, accent, info, danger) and replace any heavy status chips. (Variants scaffolded; doc polish pending)
- [x] Implement tooltip / popover inverse surface (primitives added; rollout continuing).
- [x] Add smart tooltip collision handling.
- [x] Add Popover component (inverse) with focus/outside click handling.
- [x] Extend audit: tooltip & popover inverse adoption metrics.
- [x] Lint rule scaffold: no-raw-tooltip-bg.
- [x] Codemods: badge variants, tooltip bg normalization.
- [x] Introduce unified focus ring utilities (.focus-ring / offset variants).
- [x] Extend style-audit to log elevation usage counts & inverse adoption %.
- [ ] Begin lint rule scaffold for surface enforcement (no raw bg-neutral on containers).
- [x] Integrate tokens:build into predev & prebuild (guaranteed fresh variables).
- [x] Add theme build script & generated theme CSS import.
- [x] Scaffold Theme Registry (light, dark, high-contrast) + ThemeManager.
- [x] Add theme toggle UI (cycle) + persistence via ThemeManager (test pending).
- [ ] Expand contrast matrix to include semantic text tokens vs all surfaces (current = base subset).
- [ ] Theme validation script: ensure AA for primary text on every surface across all themes.
- [ ] Add utility usage manifest generation (fail on unexpected new categories once stable).
- [ ] Codemod: replace remaining raw color utilities inside core primitives with CSS var classes.
- [ ] Lint rule: forbid direct hex/rgba in component TSX (outside tokens/config). (Warn → error)
- [ ] Surface enforcement lint rule (container heuristics) + autofix suggestions.
- [ ] Escalate radius rule severity (warn → error) after 1 clean audit.

---

## 7. Acceptance Checklist (Sprint Completion)

- [x] All surfaces semantic.
- [x] Elevation rhythm enforced & documented.
- [x] Typography codemod enacted & 100% adoption.
- [x] Tags unified (0 inline pills; Tag primitive in production).
- [x] Badges standardized (canonical variants + guidelines doc).
- [x] Tooltips/popovers inverse surface primitives (adoption rollout in progress).
- [x] Row hover standard applied everywhere (interim).
- [ ] CI gating active for unsafe surfaces & text colors.
- [ ] Documentation updated (guide + contrast matrix).
- [ ] Theme registry (light/dark/high-contrast) operational.
- [ ] Prebuild tokens + themes generation automated.
- [ ] No raw color utilities inside primitive components.
- [ ] Contrast matrix AA compliance across semantic text on surfaces.
- [ ] Radius rule escalated to error after remediation.
- [ ] Utility manifest stable (no drift week over week).

---

## 8. Changelog

| Date (UTC)        | Change Summary                                                                                                        |
| ----------------- | --------------------------------------------------------------------------------------------------------------------- |
| 2025-08-10T00:00Z | Plan authored (baseline)                                                                                              |
| 2025-08-10T15:45Z | Phase A surfaces/elevation complete; doc updated                                                                      |
| 2025-08-10T15:55Z | Metrics snapshot inserted; next Phase B tasks added                                                                   |
| 2025-08-10T16:30Z | Typography codemod complete (100% adoption) & plan updated                                                            |
| 2025-08-10T16:50Z | Added style CI gate script (`style:gate`) for headings/text-white/bg drift                                            |
| 2025-08-10T17:20Z | Tag primitive rollout complete (0 inline pills) + CI gate extended (inline pill detection)                            |
| 2025-08-10T17:45Z | Badge system refactored: canonical variants (neutral/info/success/warning/danger/accent/premium) with legacy mapping  |
| 2025-08-10T17:55Z | Added ESLint rules: legacy Badge variant warning + raw gradient guard (with decorative-gradient escape hatch)         |
| 2025-08-10T18:05Z | Added `BADGE_TAG_GUIDELINES.md` and linked from plan + docs index; Acceptance checklist updated                       |
| 2025-08-10T18:30Z | Added Tooltip + Popover components (surface-inverse), style-audit metrics extended (tooltip/popover inverse adoption) |
| 2025-08-10T18:40Z | Smart tooltip collision handling, focus ring utilities, tooltip bg codemod, lint rule no-raw-tooltip-bg               |
| 2025-08-10T19:00Z | Added elevation & radius metrics to style audit, radius lint rule (warn), contrast matrix script, token CSS import    |
| 2025-08-10T19:20Z | Theming architecture plan inserted (registry, ThemeManager, build pipeline), edgy radius consolidation documented     |

---

| Date (UTC)        | Change Summary                                                                                                        |
| ----------------- | --------------------------------------------------------------------------------------------------------------------- |
| 2025-08-10T19:45Z | Integrated automated tokens + themes predev/prebuild, added ThemeManager runtime, updated TODO statuses               |

_Last Updated: 2025-08-10T19:45:00Z_
