# Badge vs Tag Usage Guidelines

Purpose: Prevent styling drift and ensure consistent semantics across status indicators.

## Primitives

| Primitive | Weight | Typical Content                                      | Interaction                     | Visual Tokens                                            | Examples                               |
| --------- | ------ | ---------------------------------------------------- | ------------------------------- | -------------------------------------------------------- | -------------------------------------- |
| `Tag`     | Light  | Taxonomy labels, event types, categories, roles      | Optional (filter / click)       | Low elevation (border + flat fill)                       | `practice`, `offense`, `coach`, `game` |
| `Badge`   | Medium | Achievement, progress, attention, premium highlights | High (celebratory / actionable) | Elevated, animation capable, gradients allowed (premium) | `80%`, `NEW`, `streak`, `Week 3`       |

## Decision Tree

1. Is the label purely descriptive taxonomy? → Use `Tag`.
2. Does it convey progress, attention, achievement, notification count, or premium status? → Use `Badge`.
3. Is it inline in sentence-level text? → Prefer `Tag` unless celebrating (e.g. "Unlocked" → small `Badge`).
4. Needs dynamic fill (0–100%)? → `ProgressBadge`.
5. Requires celebratory animation (bounce/glow) → `AchievementBadge` (alias of `Badge` with animation props).

## Variant Mapping (Canonical)

| Semantic | Tag Variant          | Badge Variant | Use For                                |
| -------- | -------------------- | ------------- | -------------------------------------- |
| Neutral  | `neutral`            | `neutral`     | Generic metadata                       |
| Info     | `info`               | `info`        | Informational types, meetings          |
| Success  | `success`            | `success`     | Achievement, positive progression      |
| Warning  | `warning`            | `warning`     | Non-critical alerts, upcoming limits   |
| Danger   | `danger`             | `danger`      | Errors, urgent notifications           |
| Accent   | `accent`             | `accent`      | Primary brand accent usage (sparingly) |
| Premium  | —                    | `premium`     | Exclusive / feature highlight          |
| Outline  | `outline` (Tag only) | —             | Passive / de-emphasized taxonomy       |

Legacy badge variants (`default`, `urgency`, `achievement`, `information`, `attention`) are auto-normalized internally and trigger ESLint warnings.

## Accessibility

| Concern        | Guidance                                                                                                                                                             |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Contrast       | Text inside Tag/Badge must meet WCAG AA (≥ 4.5:1 for normal). Canonical palette passes baseline; avoid manual overrides.                                             |
| Motion         | Achievement/pulse animations are subtle (< 500ms loops). For future reduced-motion support, gate animations behind `@media (prefers-reduced-motion: no-preference)`. |
| Screen Readers | Provide `aria-label` when the badge has only an icon or ambiguous shorthand.                                                                                         |

## Do & Don't

| Do                                             | Don't                                                           |
| ---------------------------------------------- | --------------------------------------------------------------- |
| Use `Tag` for static category chips in tables. | Use `Badge` just for styling a neutral category.                |
| Use `Badge` for counts or progress milestones. | Animate every Tag/Badge (reserve animation for special states). |
| Keep Tag text short (1–2 words).               | Put long phrases (> 3 words) inside a Tag/Badge.                |
| Use `premium` sparingly (1 per viewport).      | Stack multiple gradients side-by-side.                          |

## Migration Pattern

1. Replace inline pill `<span class="...rounded-full bg-*-100 text-*-800...">` → `<Tag variant="...">`.
2. Replace attention / progress styled spans → `<Badge variant="warning" />` or `<ProgressBadge progress={n} />`.
3. Remove obsolete helper CSS after 100% adoption.

## Tooling

- ESLint rule: `boxcall-style/no-legacy-badge-variants` warns on legacy `variant` usage.
- Scanner script (inline pill) now returns 0; gate prevents regressions.
- Planned: Add `style:codemod:badges` to auto-rewrite legacy props if reintroduced.

## Examples

```tsx
<Tag variant="info" size="sm">practice</Tag>
<Tag variant="outline" size="sm">break</Tag>
<Badge variant="success" size="sm">7 day streak</Badge>
<ProgressBadge progress={72} label="72%" />
<Badge variant="premium" size="sm">NEW</Badge>
```

---

Last Updated: 2025-08-10
