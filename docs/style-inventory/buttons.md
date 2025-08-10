# Raw Button Inventory

Generated: 2025-08-10T01:55:17.574Z

Total files with raw <button>: **34**

| File | Raw Buttons | Lines | Imports Shared Button? |
| ---- | ----------- | ----- | ---------------------- |
| src/components/dev/DevTools.tsx | 2 | 245, 269 | No |
| src/components/mobile/MobileQuickActions.tsx | 2 | 71, 180 | No |
| src/components/playbook/AdvancedSearchBar.tsx | 2 | 145, 171 | No |
| src/components/playbook/PlayBuilder/AddNewDropdown.tsx | 2 | 84, 92 | No |
| src/components/playbook/QuickFilters.tsx | 2 | 71, 103 | No |
| src/components/ui/Toast.tsx | 2 | 179, 187 | No |
| src/pages/TeamBulletin.tsx | 2 | 168, 177 | No |
| src/routes/AppRouter.tsx | 2 | 334, 345 | No |
| src/routes/PermissionRoute.tsx | 2 | 186, 192 | No |
| src/routes/TeamMemberRoute.tsx | 2 | 116, 138 | No |
| src/components/auth/LoginForm.tsx | 1 | 128 | No |
| src/components/auth/RegisterForm.tsx | 1 | 209 | No |
| src/components/dashboard/DatabaseDataDisplay.tsx | 1 | 154 | No |
| src/components/dashboard/TeamFeeds.tsx | 1 | 154 | No |
| src/components/dev/ToastDemo.tsx | 1 | 37 | No |
| src/components/dev/tabs/LogsTab.tsx | 1 | 21 | No |
| src/components/lazy/LazyRoutes.tsx | 1 | 156 | No |
| src/components/mobile/MobileBottomNavigation.tsx | 1 | 70 | No |
| src/components/onboarding/OnboardingHint.tsx | 1 | 99 | No |
| src/components/playbook/PlayGrid.tsx | 1 | 285 | No |
| src/components/practice/PracticePlannerModal/components/DevelopmentTools.tsx | 1 | 30 | No |
| src/components/practice/PracticePlannerModal/components/Forms/AddBlockModal.tsx | 1 | 131 | No |
| src/components/practice/PracticePlannerModal/components/PracticeTimeline/CategorySelector.tsx | 1 | 35 | No |
| src/components/practice/PracticePlannerModal/components/PracticeTimeline/TimelineContainer.tsx | 1 | 61 | No |
| src/components/practice/components/TimelineAllocation.tsx | 1 | 313 | No |
| src/components/team/PlayerRosterContainer.tsx | 1 | 55 | No |
| src/components/team-dashboard/layout/TeamBulletinHeader.tsx | 1 | 76 | No |
| src/components/ui/Input/Input.tsx | 1 | 186 | No |
| src/components/ui/Modal/Modal.tsx | 1 | 178 | No |
| src/components/ui/Select/Select.tsx | 1 | 435 | No |
| src/pages/legal/ContactPage.tsx | 1 | 196 | No |
| src/routes/RoleProtectedRoute.tsx | 1 | 61 | No |
| src/routes/SplitRouter.tsx | 1 | 158 | No |
| src/routes/SuperAdminRoute.tsx | 1 | 83 | No |

Migration Priority Heuristic:
1. Files mixing raw + shared Button (Yes) -> unify first.
2. Highest raw count.
3. High-traffic routes (dashboard, onboarding).

Next Steps:
- Replace clusters with <Button variant="primary|secondary|..." size="md" />.
- Remove obsolete utility classes after migration.