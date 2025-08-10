# Style Audit Summary
Generated: 2025-08-10T14:01:07.979Z

## Key Metrics
| Metric | Value |
| --- | --- |
| Total Source Files | 366 |
| text-white Occurrences | 0 |
| Raw <button> Heuristic (non-primitive) | 1 |
| Tooltip Inverse Adoption | 0/2 |
| Popover Inverse Adoption | 0/0 |

## Top Background Classes
| bg-* | Count |
| --- | --- |
| white | 58 |
| gray-50 | 31 |
| blue-50 | 27 |
| gray-700 | 22 |
| opacity-50 | 17 |
| black | 16 |
| slate-50 | 16 |
| gray-200 | 15 |
| red-50 | 14 |
| jade-600 | 14 |
| slate-200 | 12 |
| gray-100 | 12 |
| jade-100 | 11 |
| jade-50 | 11 |
| blue-100 | 10 |
| blue-900/20 | 10 |
| gray-800 | 10 |
| gray-300 | 9 |
| green-100 | 8 |
| slate-100 | 8 |
| surface-jade | 8 |
| surface-jade-dark | 8 |
| jade-700 | 7 |
| jade-500 | 7 |
| gradient-to-r | 7 |

## Brand Class Utilization
| Brand Token Class | Count |
| --- | --- |
| brand-jade | 24 |
| surface-jade | 11 |
| brand-jade-dark | 10 |
| surface-jade-dark | 10 |
| interaction-jade | 5 |
| brand-jade-light | 3 |

## Elevation Utility Usage
| Elevation Class | Count |
| --- | --- |
| elevation-card | 21 |
| elevation-dropdown | 2 |
| elevation-modal | 1 |

## Sample text-white Locations (first 25)
| File:Line | ClassName Snip |
| --- | --- |

## Surface Class Remediation Candidates (first 25)
| File:Line | ClassName Snip |
| --- | --- |
| src/components/dashboard/DatabaseDataDisplay.tsx:253 | `p-3 bg-gray-50 rounded-lg` |
| src/components/dashboard/DatabaseDataDisplay.tsx:296 | `p-3 bg-gray-50 rounded-lg` |
| src/components/dashboard/PersonalTrophyShelf.tsx:195 | `text-center p-2 bg-white/50 dark:bg-gray-700/30 rounded-lg` |
| src/components/dashboard/PersonalTrophyShelf.tsx:213 | `text-center p-2 bg-white/50 dark:bg-gray-700/30 rounded-lg` |
| src/components/dashboard/PersonalTrophyShelf.tsx:231 | `text-center p-2 bg-white/50 dark:bg-gray-700/30 rounded-lg` |
| src/components/dashboard/PersonalTrophyShelf.tsx:260 | `flex items-center space-x-3 py-2 px-3 h-10 mb-1 bg-white/60 dark:bg-gray-700/40 rounded-lg border border-white/40 dark:border-gray-600/30` |
| src/components/dev/DevTools.tsx:263 | `p-1 h-auto hover:bg-white/20 text-text-inverse` |
| src/components/dev/tabs/LogsTab.tsx:39 | `text-xs p-2 rounded bg-gray-50 dark:bg-gray-700` |
| src/components/playbook/CSVImport/CSVImportModal.tsx:717 | `inline-block align-bottom bg-white rounded-lg shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full` |
| src/components/playbook/CSVImport/CSVImportModal.tsx:718 | `bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between` |
| src/components/playbook/CSVImport/CSVImportModal.tsx:736 | `bg-white px-6 py-8` |
| src/components/playbook/PlayBuilder/AutocompleteDropdown.tsx:172 | `w-full px-3 py-2 pr-10 border border-slate-300 rounded-md focus:ring-2 focus:ring-jade-500 focus:border-jade-500 bg-white` |
| src/components/playbook/PlayBuilder/AutocompleteDropdown.tsx:199 | `h-4 w-4 bg-white rounded-full border border-jade-500` |
| src/components/playbook/PlayBuilder/AutocompleteDropdown.tsx:206 | `absolute z-50 w-full mt-1 bg-white border border-slate-300 rounded-md shadow-lg max-h-60 overflow-auto` |
| src/components/playbook/PlayBuilder/PlayBuilderCore.tsx:174 | `inline-block align-bottom bg-white rounded-lg shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full max-h-[90vh]` |
| src/components/playbook/PlayBuilder/PlayBuilderCore.tsx:176 | `bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between` |
| src/components/playbook/PlayBuilder/PlayBuilderPreview.tsx:24 | `bg-white rounded-lg border border-slate-200` |
| src/components/playbook/PlayBuilder/PlayBuilderWizard.tsx:23 | `inline-block align-bottom bg-white rounded-lg shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full` |
| src/components/playbook/PlayBuilder/PlayBuilderWizard.tsx:25 | `bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between` |
| src/components/playbook/PlayBuilder/QuickEntry.tsx:222 | `playbuilder-input w-full px-4 py-3 bg-white border-2 border-jade-300 rounded-md focus:ring-2 focus:ring-jade-500 focus:border-jade-500 text-` |
| src/components/playbook/PlayFilters.tsx:41 | `bg-white rounded-lg shadow-sm border border-slate-200` |
| src/components/playbook/PlaybookGlossary.tsx:128 | `bg-white rounded-lg shadow-sm border border-slate-200` |
| src/components/playbook/visual/DrawingTools.tsx:62 | `bg-white rounded-lg shadow-sm border border-slate-200 p-3 space-y-3` |
| src/components/playbook/visual/EnhancedFieldCanvas.tsx:270 | `bg-white rounded-lg shadow-sm border border-slate-200 p-2` |
| src/components/playbook/visual/EnhancedFieldCanvas.tsx:287 | `bg-white rounded-lg shadow-sm border border-slate-200 p-2` |

## White-on-White Interaction Candidates (first 25)
| File:Line | ClassName Snip |
| --- | --- |

## Radius Violations (first 25)
| File:Line | Token | Reason | Class Snip |
| --- | --- | --- | --- |
| src/components/team/PlayerList.tsx:109 | rounded-xs | unsupported-scale | `w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xs shadow-sm focus:ring-jade-500 focus:border-jade-500 surface-subtle t` |
| src/components/team/PlayerList.tsx:124 | rounded-xs | unsupported-scale | `w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xs shadow-sm focus:ring-jade-500 focus:border-jade-500 surface-subtle t` |
| src/components/ui/Badge/Badge.tsx:158 | rounded-inherit | unsupported-scale | `absolute inset-0 overflow-hidden rounded-inherit` |
| src/pages/ProfilePage.tsx:249 | rounded-xs | unsupported-scale | `w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xs shadow-sm focus:ring-jade-500 focus:border-jade-500 dark:bg-gray-700` |