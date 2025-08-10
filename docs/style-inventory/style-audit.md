# Style Audit Summary
Generated: 2025-08-10T03:23:52.330Z

## Key Metrics
| Metric | Value |
| --- | --- |
| Total Source Files | 361 |
| text-white Occurrences | 0 |
| Raw <button> Heuristic (non-primitive) | 1 |

## Top Background Classes
| bg-* | Count |
| --- | --- |
| white | 93 |
| gray-50 | 49 |
| gray-800 | 44 |
| blue-50 | 28 |
| gray-700 | 25 |
| opacity-50 | 17 |
| black | 16 |
| slate-50 | 16 |
| red-50 | 15 |
| gray-200 | 15 |
| jade-600 | 14 |
| jade-100 | 13 |
| gray-900 | 12 |
| slate-200 | 12 |
| gray-100 | 12 |
| jade-50 | 11 |
| blue-100 | 11 |
| blue-900/20 | 10 |
| slate-100 | 9 |
| gray-300 | 9 |
| green-100 | 8 |
| surface-jade | 8 |
| surface-jade-dark | 8 |
| jade-700 | 7 |
| jade-500 | 7 |

## Brand Class Utilization
| Brand Token Class | Count |
| --- | --- |
| brand-jade | 24 |
| surface-jade | 11 |
| brand-jade-dark | 10 |
| surface-jade-dark | 10 |
| interaction-jade | 5 |
| brand-jade-light | 3 |

## Sample text-white Locations (first 25)
| File:Line | ClassName Snip |
| --- | --- |

## Surface Class Remediation Candidates (first 25)
| File:Line | ClassName Snip |
| --- | --- |
| src/components/dashboard/DatabaseDataDisplay.tsx:253 | `p-3 bg-gray-50 rounded-lg` |
| src/components/dashboard/DatabaseDataDisplay.tsx:296 | `p-3 bg-gray-50 rounded-lg` |
| src/components/dashboard/PersonalCalendar.tsx:165 | `flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer border border-gray-100 da` |
| src/components/dashboard/PersonalTrophyShelf.tsx:195 | `text-center p-2 bg-white/50 dark:bg-gray-700/30 rounded-lg` |
| src/components/dashboard/PersonalTrophyShelf.tsx:213 | `text-center p-2 bg-white/50 dark:bg-gray-700/30 rounded-lg` |
| src/components/dashboard/PersonalTrophyShelf.tsx:231 | `text-center p-2 bg-white/50 dark:bg-gray-700/30 rounded-lg` |
| src/components/dashboard/PersonalTrophyShelf.tsx:260 | `flex items-center space-x-3 py-2 px-3 h-10 mb-1 bg-white/60 dark:bg-gray-700/40 rounded-lg border border-white/40 dark:border-gray-600/30` |
| src/components/dashboard/TeamFeeds.tsx:128 | `flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer` |
| src/components/dev/DevTools.tsx:262 | `p-1 h-auto hover:bg-white/20 text-text-inverse` |
| src/components/dev/tabs/LogsTab.tsx:39 | `text-xs p-2 rounded bg-gray-50 dark:bg-gray-700` |
| src/components/playbook/AdvancedFilters.tsx:239 | `w-full px-2 py-1.5 text-xs border border-slate-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-jade-500 bg-white` |
| src/components/playbook/AdvancedFilters.tsx:261 | `w-full px-2 py-1.5 text-xs border border-slate-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-jade-500 bg-white` |
| src/components/playbook/AdvancedFilters.tsx:284 | `w-full px-2 py-1.5 text-xs border border-slate-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-jade-500 bg-white` |
| src/components/playbook/AdvancedFilters.tsx:311 | `w-full px-2 py-1.5 text-xs border border-slate-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-jade-500 bg-white` |
| src/components/playbook/AdvancedSearchBar.tsx:139 | `block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg 
                   focus:ring-2 focus:ring-jade-500 focus:border-jade-600 
` |
| src/components/playbook/AdvancedSearchBar.tsx:163 | `absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg 
       border border-gray-200 dark:border-gray-700 dark:bg-gray-800 max-h-64 overfl` |
| src/components/playbook/CSVImport/CSVImportModal.tsx:696 | `inline-block align-bottom bg-white rounded-lg shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full` |
| src/components/playbook/CSVImport/CSVImportModal.tsx:697 | `bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between` |
| src/components/playbook/CSVImport/CSVImportModal.tsx:709 | `bg-white px-6 py-8` |
| src/components/playbook/PlayBuilder/AutocompleteDropdown.tsx:172 | `w-full px-3 py-2 pr-10 border border-slate-300 rounded-md focus:ring-2 focus:ring-jade-500 focus:border-jade-500 bg-white` |
| src/components/playbook/PlayBuilder/AutocompleteDropdown.tsx:199 | `h-4 w-4 bg-white rounded-full border border-jade-500` |
| src/components/playbook/PlayBuilder/AutocompleteDropdown.tsx:206 | `absolute z-50 w-full mt-1 bg-white border border-slate-300 rounded-md shadow-lg max-h-60 overflow-auto` |
| src/components/playbook/PlayBuilder/PlayBuilderCore.tsx:173 | `inline-block align-bottom bg-white rounded-lg shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full max-h-[90vh]` |
| src/components/playbook/PlayBuilder/PlayBuilderCore.tsx:175 | `bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between` |
| src/components/playbook/PlayBuilder/PlayBuilderPreview.tsx:38 | `bg-white rounded-lg border border-slate-200` |

## White-on-White Interaction Candidates (first 25)
| File:Line | ClassName Snip |
| --- | --- |