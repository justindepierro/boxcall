# BoxCall UI Professionalization Plan

> Goal: Elevate the current refactored, tokenized foundation into a cohesive, professional, brand-consistent product UI. This plan is the tactical playbook for the next styling sprint. Source of truth for style direction going forward.
>
> Companion docs: `STYLE_SYSTEM_AUDIT.md` (governance + metrics), `tokens.ts`, `style-audit.mjs`.

---
## 0. Guiding Principles

| Principle | Rationale | Heuristic Check |
|-----------|-----------|-----------------|
| Semantic First | Avoid raw utility drift & ease theming | 0 new `bg-white` w/out surface-* |
| Depth with Restraint | Elevation only where it improves scan | Max 2 elevations visible per viewport |
| Brand Hierarchy | Jade = primary action/accent, Navy = structure, Neutrals = canvas | No off-scale blues/greens |
| Clear Typographic Rhythm | Consistent heading/body mapping | All h* via `<Typography>` variants |
| Predictable Interactions | Hover, focus, active coherent across primitives | Same timing / easing tokens |
| Accessible by Default | Contrast & focus resilience | 0 AA violations (buttons/text) |
| Tooling Enforced | Prevent regression | CI audit gating after threshold |

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
## 2. Phased Execution (Tomorrow → Week)

### Phase A (Tomorrow – High Visual ROI)
| Order | Task | Scope | Outcome Metric |
|-------|------|-------|----------------|
| A1 | Finish surface remediation | Top 50 `surfaceCandidates` | 0 high-priority legacy containers |
| A2 | Apply elevation utility classes | Cards, dropdown menus, modals | 100% mapped to elevation-* |
| A3 | Standardize interactive list rows | Calendar events, feeds, tables | Unified hover feel |
| A4 | Introduce `surface-subtle-hover` token & replace ad-hoc `hover:bg-*` | All subtle row hovers | 0 raw hover bg for subtle rows |
| A5 | Navigation polish (badges + active state small-screen) | NavBar + MobileNav | Mobile parity |

### Phase B (Following Day)
| Order | Task | Scope | Metric |
|-------|------|-------|--------|
| B1 | Typography sweep codemod | All headings (h1–h5) | 95% adoption |
| B2 | Badge & Tag primitives | Status chips, filters, counts | 0 inline pill styles |
| B3 | Tooltip & Popover refactor (`surface-inverse`) | ComplexityBadge, menus, hints | 0 raw `bg-gray-900` |
| B4 | Button variant audit & tighten spacing | Variant map + docs | No variant drift |
| B5 | IconButton variant alignment | Danger/ghost/subtle mapping | Shared interaction tokens |

### Phase C (Week Continuation)
| Theme | Tasks | Tooling Additions |
|-------|-------|------------------|
| Governance | ESLint autofix for `no-unsafe-white`, radius linter | Rule: no raw `rounded-*` outside allowlist |
| Accessibility | Focus ring unification, reduced-motion fallback, contrast matrix generation | `contrast-matrix.mjs` |
| Theming Prep | Generate CSS var layer from tokens.ts (build step) | `generate-tokens-css.ts` |
| Reporting | Weekly style delta report | CI job artifact |

---
## 3. Component Treatment Matrix

| Component / Area | Current Status | Actions | Tokens / Classes |
|------------------|---------------|---------|------------------|
| Dashboard Cards | Mixed card/shadow-sm | Add `surface-card elevation-card hoverable` | surface-card, elevation-card |
| Team Calendar Rows | Updated partially | Add `surface-subtle-hover` class | surface-subtle, surface-subtle-hover |
| Trophy Case | Card done; border dashed | Consider subtle internal section separators | divider-light |
| Modals | Raw shadow variants | Replace with `elevation-modal` | elevation-modal |
| Dropdowns/Select Menus | Mixed shadows | `surface-card elevation-dropdown` | elevation-dropdown |
| Tooltips / Hover Panels | `bg-gray-900` | Swap to `surface-inverse` | surface-inverse |
| Badges/Chips | Inline bg/text utilities | Replace with `<Badge>` primitive | badge-* (to define) |
| Forms (Input, Select) | Mostly consistent | Add help/error text tokens | text-text-secondary/error |
| Navigation | Updated | Add mobile active rail | nav-item-active::before |

---
## 4. Token Additions & Adjustments

| Token | Purpose | Light Value | Dark Value |
|-------|---------|------------|-----------|
| `--surface-subtle-hover` | Row hover delta | `#F3F4F6` (gray-100) | rgba(31,41,55,0.8) |
| `--surface-inverse` | Tooltip / popover | `#111827` | `#374151` |
| `--border-strong` | Emphasis dividers | `#CBD5E1` | `#475569` |
| `--focus-ring` | Unified focus outline | Jade 600 | Jade 500 |
| `--easing-standard` | Animation consistency | `cubic-bezier(.4,0,.2,1)` | same |

Implementation: extend `tokens.ts` → generate `tokens.css` → create utility classes mapping (add to `index.css`).

---
## 5. Codemods / Automation Backlog

| Script | Function | When |
|--------|----------|------|
| `codemod-surfaces.mjs` | Replace `bg-white/bg-gray-50/100` containers with semantic surface classes | Phase A |
| `codemod-typography.mjs` | Wrap heading class stacks in `<Typography>` | Phase B |
| `audit-elevation.mjs` | Ensure only allowed shadow patterns | Phase C |
| `contrast-matrix.mjs` | Generate cross-surface/text contrast table | Phase C |
| `generate-tokens-css.ts` | Emit CSS var mapping from TS tokens | Phase C |

---
## 6. Metrics & Gates (Updated Targets)

| Metric | Current | Gate Enable | Final |
|--------|---------|-------------|-------|
| Raw `bg-white` (non-semantic container) | >50 (est) | <15 | 0 |
| `surfaceCandidates` (open) | 80+ | <25 | 0 |
| Card elevation consistency | <40% | 100% (visual scan) | 100% |
| Typography adoption | TBD | >80% | 100% |
| Tooltip inverse adoption | <10% | 100% | 100% |
| Contrast violations | 0 | Gate now | 0 |
| New unsafe whites post-gate | 0 | Immediate fail | 0 |

Gate Rollout Plan:
1. Add non-failing warnings (done for text-white) → 2. Flip surfaces after A-phase → 3. Introduce failing CI rules sequentially (surfaces → typography → elevation → inverse surfaces).

---
## 7. Daily Execution Template

| Time Block | Focus | Deliverable |
|------------|-------|-------------|
| AM Block 1 | Surface remediation batch | PR: surfaces A1 (20–30 files) |
| AM Block 2 | Elevation mapping + nav polish | PR: elevation + nav badges |
| Midday | Row hover + subtle-hover token | Token + codemod results |
| PM Block 1 | Typography codemod dry run | Report + diff review |
| PM Block 2 | Badge primitive | Component + migration checklist |

---
## 8. Risk & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Over-expanding custom CSS (index.css growth) | Harder theme swap | Move back into token-driven utilities / plugin after stabilization |
| Shadow / elevation visual noise | Perceived clutter | Limit hover elevation to primary interactive clusters |
| Token drift vs Tailwind utilities | Inconsistency | Lint rule: prefer semantic classes (Phase C) |
| Large diffs from codemods | Review fatigue | Batch by feature area (< files 30 per PR) |
| Dark mode parity gaps | Inconsistent experience | Add dark token values simultaneously during additions |

---
## 9. Immediate TODO (Actionable Tomorrow Start)
- [ ] Add `surface-subtle-hover` token + CSS class (update tokens + index.css mapping; replace ad-hoc `hover:bg-surface-subtle/70`).
- [ ] Build quick surface codemod (regex container patterns) and run dry → review.
- [ ] Elevation pass: add `elevation-card hoverable` to all dashboard/feature cards.
- [ ] Replace dropdown / menu / select panel shadows with `elevation-dropdown`.
- [ ] Introduce `surface-inverse` to tooltip components (ComplexityBadge, popovers).
- [ ] Identify top 10 high-usage heading class stacks for Typography codemod test.
- [ ] Draft Badge primitive interface (size, tone, variant) + map existing badges.
- [ ] Extend style-audit to track: elevation usage counts, inverse surface adoption.

---
## 10. Acceptance Checklist (Sprint Completion)
- [ ] All surfaces semantic.
- [ ] Elevation rhythm enforced & documented.
- [ ] Typography codemod enacted & 100% adoption.
- [ ] Badges / Tags unified.
- [ ] Tooltips/popovers inverse surface.
- [ ] Row hover standard applied everywhere.
- [ ] CI gating active for unsafe surfaces & text colors.
- [ ] Documentation updated (guide + contrast matrix).

---
## 11. Follow-Up (Post Sprint)
- Introduce theming (team colors) via CSS variable overrides.
- Add density mode toggle (comfortable vs compact) using spacing tokens.
- Build visual snapshot tests (Storybook + Chromatic / Percy) for regression detection.
- Motion tokens & reduced-motion fallback sweep.

---
## 12. Quick Visual Style Checklist (Use During Reviews)
- Surfaces: Are layers ≤2 elevations stacked? Is there clear luminance separation?
- Color: Any raw `bg-white/bg-gray-*` where a surface-* should exist?
- Typography: Are headings consistent in weight/size mapping?
- Interaction: Do all interactive elements have hover + focus states aligning with timing & easing?
- Contrast: Do inverse or subtle surfaces keep ≥4.5:1 for text?
- Tokens: Are any ad-hoc colors creeping back in?

---
_Last Updated: 2025-08-09T23:59:00Z_
