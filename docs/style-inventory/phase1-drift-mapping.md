# Phase 1 Drift Mapping (Proposed)

| Raw Utility / Hex                     | Proposed Semantic Replacement                                   | Rationale                         |
| ------------------------------------- | --------------------------------------------------------------- | --------------------------------- |
| `bg-gray-50`                          | `surface-app`                                                   | Base app background               |
| `bg-white`                            | `surface-card` or `surface-header` (context)                    | Standard elevated container       |
| `border-gray-200` / `border-gray-300` | `border-subtle`                                                 | Align to semantic border          |
| `text-gray-900`                       | `text-text-primary`                                             | Primary body/content text         |
| `text-gray-700`                       | `text-text-secondary`                                           | Secondary emphasis                |
| `text-gray-600`                       | `text-text-secondary`                                           | Secondary (slightly lighter)      |
| `text-gray-500`                       | `text-text-muted`                                               | Muted/tertiary text               |
| `text-gray-400`                       | `text-text-muted`                                               | Muted/tertiary                    |
| `bg-gray-100`                         | `surface-subtle`                                                | Subtle background / tag area      |
| `text-navy-700`                       | `text-text-brand` (or new `text-brand-alt` if needed)           | Brand accent                      |
| `hover:text-gray-900`                 | `hover:text-text-primary`                                       | Hover stays within semantic scale |
| `bg-navy-50`                          | `surface-subtle` (if accent needed create `surface-brand-soft`) | Align to surface scale            |
| Inline `#111827`                      | `var(--semantic-text-primary)`                                  | Token variable                    |
| Inline `#1f2937`                      | `var(--semantic-surface-inverse)` (or add new if mismatch)      | Dark surface mapping              |
| Inline `#374151`                      | `var(--semantic-surface-inverse-alt)`                           | Existing inverse alt              |
| Inline `#4b5563`                      | `var(--semantic-text-secondary)`                                | Secondary text                    |
| Inline `#6b7280`                      | `var(--semantic-text-muted)`                                    | Muted text                        |
| Inline `#f3f4f6`                      | `var(--semantic-bg-muted)`                                      | Muted background                  |
| Inline `#f9fafb`                      | `var(--semantic-bg-secondary)`                                  | Secondary bg                      |

Notes:

- Choose between `surface-card` vs `surface-header` based on structural placement (headers/toolbars use header).
- Where a gray token is used purely for spacing delineation, prefer adding a semantic border over a background if possible.
- Brand navy variants should migrate to brand semantic tokens; if gaps exist we'll introduce `--semantic-text-brand-alt` in Phase 2.

Next Steps:

1. Apply replacements to top page offenders (PracticePlanner, TermsOfServicePage, CalendarPage, CreateCoachAccount).
2. Apply to ui-primitive offenders (Table, Sidebar, AdvancedErrorBoundary).
3. Re-run drift audit and record delta. Target: page + ui-primitive matches < 50.
