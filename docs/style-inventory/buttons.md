# Raw Button Inventory

Generated: 2025-08-10T02:49:20.992Z

Total files with raw <button>: **1**

| File                                                        | Raw Buttons | Lines | Imports Shared Button? |
| ----------------------------------------------------------- | ----------- | ----- | ---------------------- |
| src/components/team-dashboard/layout/TeamBulletinHeader.tsx | 1           | 76    | No                     |

Migration Priority Heuristic:

1. Files mixing raw + shared Button (Yes) -> unify first.
2. Highest raw count.
3. High-traffic routes (dashboard, onboarding).

Next Steps:

- Replace clusters with <Button variant="primary|secondary|..." size="md" />.
- Remove obsolete utility classes after migration.
