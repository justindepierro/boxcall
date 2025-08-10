# Theme Drift Audit

Generated: 2025-08-10T14:28:37.793Z

Total files with drift: 124  \
+Total raw color occurrences: 1115

## Category Breakdown

| Category | Files | Matches |
|----------|------:|--------:|
| definition | 3 | 161 |
| ui-primitive | 25 | 174 |
| practice | 22 | 197 |
| playbook | 21 | 148 |
| page | 16 | 198 |
| other | 37 | 237 |

## Top Offenders (first 25)

| File | Count | Category |
| ---- | -----:|----------|
| src/index.css | 77 | other |
| src/themes/registry.ts | 64 | definition |
| src/design-system/tokens.ts | 49 | definition |
| src/styles/tokens.css | 48 | definition |
| src/components/playbook/visual/FieldBackgrounds.tsx | 32 | playbook |
| src/pages/PracticePlanner.tsx | 28 | page |
| src/components/playbook/visual/InteractivePlayBuilder.tsx | 26 | playbook |
| src/pages/legal/TermsOfServicePage.tsx | 25 | page |
| src/pages/CalendarPage.tsx | 24 | page |
| src/components/practice/components/PracticeBlockEditor.tsx | 24 | practice |
| src/pages/CreateCoachAccount.tsx | 21 | page |
| src/components/practice/components/MemoizedPracticeTable.tsx | 21 | practice |
| src/pages/ProfilePage.tsx | 17 | page |
| src/pages/legal/PrivacyPolicyPage.tsx | 17 | page |
| src/components/practice/components/modals/AddBlockModal.tsx | 17 | practice |
| src/components/practice/components/TimelineAllocation.tsx | 16 | practice |
| src/components/playbook/visual/EnhancedFieldCanvas.tsx | 16 | playbook |
| src/components/practice/PracticePDFExportDialog.tsx | 15 | practice |
| src/components/team/PlayerForm.tsx | 15 | other |
| src/components/practice/components/PracticeBlocksList.tsx | 15 | practice |
| src/pages/CreateTeam.tsx | 14 | page |
| src/components/ui/Table/Table.tsx | 14 | ui-primitive |
| src/components/ui/AdvancedErrorBoundary.tsx | 12 | ui-primitive |
| src/components/ui/Sidebar/Sidebar.tsx | 12 | ui-primitive |
| src/components/practice/PracticePlannerModal/components/PracticeBlockList.tsx | 12 | practice |

## Recommended Next Steps

1. Replace bg/text utility colors with semantic classes (surface-*, text-* semantic).
2. Introduce missing semantic tokens if a recurring color has no mapping.
3. For legacy hex in components, extract to tokens or use CSS vars (var(--semantic-...)).
4. After cleanup, enable lint rule to forbid these patterns (planned).
5. Ignore definition category for gating; focus remediation on page, practice, playbook, ui-primitive.
