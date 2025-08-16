# Button Variant Policy (v2 – Updated 2025-08-11)

Supersedes `BUTTON_VARIANT_POLICY.md`. Inline color utilities on `<Button>` are now forbidden and enforced via `scripts/style-enforce-buttons.mjs` (`npm run style:enforce:buttons`). All styling must flow through variants below.

## Variant Matrix

| Variant     | Purpose (When to Use)                                                                | Avoid Using For                                  |
| ----------- | ------------------------------------------------------------------------------------ | ------------------------------------------------ |
| primary     | Highest emphasis, lone core commit action in scope (Create / Save / Continue)        | Multiple peer primaries; destructive actions     |
| secondary   | Neutral alternative to primary (Cancel, Back, Dismiss)                               | Destructive commits                              |
| outline     | Medium‑low emphasis, needs boundary separation (segmented controls, grouped toggles) | Dense micro icon clusters                        |
| ghost       | Low emphasis contextual action (lists, tables, subtle toolbars)                      | Main commit actions                              |
| subtle      | Very low emphasis utility (export, calendar nav, passive tooling)                    | Destructive / high‑risk actions                  |
| link        | Generic inline action embedded in flowing copy                                       | Branded nav or destructive inline action         |
| brandLink   | Prominent text CTA / navigation ("View all", glossary filters, tertiary page CTA)    | Destructive or neutral dismissals                |
| neutralLink | Low emphasis utility text ("Clear", "Cancel", disclosure toggles)                    | Brand emphasis / destructive actions             |
| infoLink    | Help / guidance / learn‑more / download sample                                       | Destructive or primary commit                    |
| dangerLink  | Lightweight destructive inline action (remove row, delete tag, dismiss error)        | Primary destructive confirmation                 |
| danger      | High‑emphasis destructive commit (Delete object, Remove team)                        | Neutral cancel/dismiss                           |
| success     | Positive confirmation / celebratory outcome (Mark Complete)                          | Generic save (prefer primary)                    |
| warning     | Cautionary / potentially risky transition (Archive, Deactivate)                      | Irreversible deletions (use danger / dangerLink) |

### Choosing Among Link Variants

| Need                                        | Pick        |
| ------------------------------------------- | ----------- |
| Branded navigation / promotional CTA inline | brandLink   |
| Neutral utility / structural affordance     | neutralLink |
| Instructional / help / info context         | infoLink    |
| Lightweight destructive inline action       | dangerLink  |
| Generic inline verb inside sentence         | link        |

### Danger vs dangerLink

Use `danger` for the primary irreversible commit action in a modal/panel. Use `dangerLink` for inline destructive affordances that are not the main focal action (row delete, error dismiss).

### success / warning Usage

Use sparingly. Only when semantic distinction (celebratory or caution) adds clarity beyond primary/secondary.

## Interaction Hierarchy Rules

1. Exactly one `primary` per logical region (modal footer, card action bar). Demote others.
2. Do not exceed three emphasis tiers side‑by‑side.
3. Icon‑only: use `ghost` (medium) or `neutralLink` (low). Avoid bespoke color utilities.
4. Replace ad‑hoc styled anchors with link variants for consistent focus, disabled, telemetry.

## Accessibility & Contrast

All variants meet AA contrast on standard surfaces (audited). For non‑standard surfaces or inverse contexts, verify ≥4.5:1 manually until matrix script expansion.

## Enforcement

- Script: `npm run style:enforce:buttons` – fails on inline `bg-*|text-*|border-*` color utilities inside `<Button>`.
- New variant addition checklist:
  1. Token mapping & theming compatibility.
  2. Contrast verification (AA at intended sizes).
  3. Documentation table update.
  4. Audit scripts pass (no new inline color regressions).
- Planned: variant usage histogram snapshot → CI drift warnings (threshold: +30% week over week without justification).

## Migration Status (2025-08-11)

- Inline color overrides in `<Button>`: 0 (enforced).
- Specialized link variants deployed across glossary, filters, tooltips, list actions.
- Raw `<button>` exemptions: dense timeline minute cells + logo uploader (see `STYLE_SYSTEM_AUDIT.md`).

## Calendar Specific Rules (Updated)

- Toolbar (Today / Prev / Next) = subtle.
- Header: Export = subtle; Add Event = primary.
- Filters panel: Quick chips = ghost; Search = primary; Clear = neutralLink.
- Event modal: Save/Create = primary; Cancel = secondary/outline; Delete = danger.

## Upcoming Tasks

1. Refactor `buttonVariants` to consume CSS variable token maps (remove residual utility strings in config) for theme dynamism.
2. Add IconButton decision matrix doc + when to choose over ghost/neutralLink.
3. Integrate variant histogram into `style-audit` output and `style:gate` gating.
4. Add CI threshold: flag if any single link variant > +40% week-over-week without explicit changelog tag.

## Changelog

| Date (UTC)        | Change                                    |
| ----------------- | ----------------------------------------- |
| 2025-08-11T00:00Z | v2 policy created; legacy file superseded |
| 2025-08-11T00:05Z | Added enforcement + link variant guidance |
