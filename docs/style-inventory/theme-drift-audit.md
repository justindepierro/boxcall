# Theme Drift Audit

Generated: 2025-08-10T14:26:52.267Z

Total files with drift: 124  \
Total raw color occurrences: 1115

## Top Offenders (first 25)

| File | Count |
| ---- | -----:|
| src/index.css | 77 |
| src/themes/registry.ts | 64 |
| src/design-system/tokens.ts | 49 |
| src/styles/tokens.css | 48 |
| src/components/playbook/visual/FieldBackgrounds.tsx | 32 |
| src/pages/PracticePlanner.tsx | 28 |
| src/components/playbook/visual/InteractivePlayBuilder.tsx | 26 |
| src/pages/legal/TermsOfServicePage.tsx | 25 |
| src/pages/CalendarPage.tsx | 24 |
| src/components/practice/components/PracticeBlockEditor.tsx | 24 |
| src/pages/CreateCoachAccount.tsx | 21 |
| src/components/practice/components/MemoizedPracticeTable.tsx | 21 |
| src/pages/ProfilePage.tsx | 17 |
| src/pages/legal/PrivacyPolicyPage.tsx | 17 |
| src/components/practice/components/modals/AddBlockModal.tsx | 17 |
| src/components/playbook/visual/EnhancedFieldCanvas.tsx | 16 |
| src/components/practice/components/TimelineAllocation.tsx | 16 |
| src/components/practice/PracticePDFExportDialog.tsx | 15 |
| src/components/team/PlayerForm.tsx | 15 |
| src/components/practice/components/PracticeBlocksList.tsx | 15 |
| src/pages/CreateTeam.tsx | 14 |
| src/components/ui/Table/Table.tsx | 14 |
| src/components/ui/AdvancedErrorBoundary.tsx | 12 |
| src/components/ui/Sidebar/Sidebar.tsx | 12 |
| src/components/practice/PracticePlannerModal/components/PracticeBlockList.tsx | 12 |

## Recommended Next Steps

1. Replace bg/text utility colors with semantic classes (surface-*, text-* semantic).
2. Introduce missing semantic tokens if a recurring color has no mapping.
3. For legacy hex in components, extract to tokens or use CSS vars (var(--semantic-...)).
4. After cleanup, enable lint rule to forbid these patterns (planned).
