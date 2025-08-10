# Button Variant Policy

Clear semantic usage ensures consistent hierarchy and eliminates ad-hoc styling drift.

| Variant   | Purpose (When to Use)                                    | Avoid Using For                               |
| --------- | -------------------------------------------------------- | --------------------------------------------- |
| primary   | Highest emphasis: core flow action (Create / Save)       | Secondary / destructive / navigation toggles  |
| secondary | Medium emphasis alternative to primary (Cancel, Back)    | Repeated quick filters / low-density clusters |
| outline   | Medium-low emphasis where boundary needed (segmented)    | Tiny quick actions, toolbar nav, dense panels |
| ghost     | Low emphasis contextual actions in lists/panels/toolbars | Primary flow or critical confirmation         |
| subtle    | Very low emphasis utility (export, calendar nav)         | Destructive / core committing actions         |
| link      | Inline textual actions embedded in copy                  | Buttons needing fixed height alignment        |
| danger    | Destructive irreversible actions (Delete)                | Dismiss / cancel                              |
| success   | Positive confirmation highlight (Mark Complete)          | Generic primary (prefer primary)              |
| warning   | Caution/attention state changes                          | Non-attention flows                           |

## Calendar Specific Rules

- Toolbar: Today/Prev/Next = subtle; view switch uses dedicated component.
- Header: Export = subtle; Add Event = primary.
- Filters Panel: Quick filter chips = ghost; Search submit = primary; Clear Filters resets selection and should remain low emphasis (ghost).
- Event Modal: Primary confirm (Save/Create) = primary; Cancel = secondary or outline (if visual separation from primary); Delete = danger.

## Enforcement Ideas

- ESLint custom rule (no-outline-in-calendar-filters) to block outline usage under `components/calendar` except in modal footer.
- Inventory test counts variant occurrences and fails thresholds (e.g., outline > 0 in CalendarFiltersPanel).

## Next Steps

1. Add ESLint rule or codemod to rewrite disallowed variants automatically.
2. Add unit test snapshot of variant distribution (ensures drift detection).
3. Migrate remaining outline misuses across dashboard and practice planner modules.
