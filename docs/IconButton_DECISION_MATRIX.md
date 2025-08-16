# IconButton Decision Matrix

Guidance for choosing between variants when action is represented primarily by an icon.

## When to Use IconButton Component

Use a dedicated `IconButton` (when implemented) instead of `<Button iconPosition="only" ...>` when:

- The control appears in a dense toolbar or table row with >3 adjacent icon-only actions.
- You need a circular or square minimal target (24–32px) with consistent padding.
- The action has a tooltip describing its label.

## Variant Mapping

| Context                                | Recommended                          | Rationale                                |
| -------------------------------------- | ------------------------------------ | ---------------------------------------- |
| High emphasis destructive (standalone) | danger (with icon + label preferred) | Avoid icon-only unless space constrained |
| Row-level destructive                  | dangerLink (icon + tooltip)          | Inline, low weight                       |
| Neutral utility in dense cluster       | ghost or neutralLink                 | Minimal distraction                      |
| Branded navigation / promote           | brandLink (usually w/ text)          | Ensure clarity; icon only insufficient   |
| Help / info affordance                 | infoLink                             | Communicates guidance                    |

## Accessibility

- Provide `aria-label` if no visible text.
- Pair with tooltip for discoverability.
- Maintain 44px min touch target on mobile (use padding wrapper if needed).

## Do / Avoid

- Do: prefer text + icon for primary actions.
- Avoid: multiple danger icons in close proximity; escalates visual noise.
