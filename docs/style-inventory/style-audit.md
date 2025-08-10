# Style Audit Summary
Generated: 2025-08-10T03:08:41.284Z

## Key Metrics
| Metric | Value |
| --- | --- |
| Total Source Files | 361 |
| text-white Occurrences | 140 |
| Raw <button> Heuristic (non-primitive) | 1 |

## Top Background Classes
| bg-* | Count |
| --- | --- |
| white | 97 |
| gray-50 | 50 |
| gray-800 | 44 |
| blue-50 | 28 |
| gray-700 | 28 |
| opacity-50 | 17 |
| black | 16 |
| slate-50 | 16 |
| red-50 | 15 |
| gray-200 | 15 |
| jade-600 | 14 |
| jade-100 | 13 |
| gray-100 | 13 |
| gray-900 | 12 |
| slate-200 | 12 |
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
| src/components/auth/LoginForm.tsx:120 | `!bg-jade-600 !hover:bg-jade-700 !border-jade-600 !hover:border-jade-700 !text-white` |
| src/components/auth/RegisterForm.tsx:201 | `!bg-jade-600 !hover:bg-jade-700 !border-jade-600 !hover:border-jade-700 !text-white` |
| src/components/mobile/MobileQuickActions.tsx:106 | `text-xs font-bold text-white` |
| src/components/practice/components/PracticeHeader.tsx:121 | `text-white` |
| src/components/team/PlayerForm.tsx:152 | `text-xl font-semibold text-gray-900 dark:text-white` |
| src/components/team/PlayerForm.tsx:160 | `text-lg font-medium text-gray-900 dark:text-white mb-4` |
| src/components/team/PlayerForm.tsx:247 | `text-lg font-medium text-gray-900 dark:text-white mb-4` |
| src/components/team/PlayerForm.tsx:276 | `text-lg font-medium text-gray-900 dark:text-white mb-4` |
| src/components/team/PlayerForm.tsx:361 | `text-lg font-medium text-gray-900 dark:text-white mb-4` |
| src/components/team/PlayerList.tsx:60 | `text-xl font-semibold text-gray-900 dark:text-white mb-2` |
| src/components/team/PlayerList.tsx:104 | `w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xs shadow-sm focus:ring-jade-500 focus:border-jade-500 dark:bg-gray-700` |
| src/components/team/PlayerList.tsx:119 | `w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xs shadow-sm focus:ring-jade-500 focus:border-jade-500 dark:bg-gray-700` |
| src/components/team/PlayerList.tsx:167 | `w-12 h-12 bg-jade-500 rounded-md flex items-center justify-center text-white font-display font-bold` |
| src/components/team/PlayerList.tsx:172 | `font-semibold text-gray-900 dark:text-white` |
| src/components/team/TeamSettings.tsx:88 | `text-xl font-semibold text-gray-900 dark:text-white` |
| src/components/team/TeamSettings.tsx:115 | `text-lg font-medium text-gray-900 dark:text-white mb-4` |
| src/components/team/TeamSettings.tsx:149 | `text-lg font-medium text-gray-900 dark:text-white mb-4` |
| src/components/team/TeamSettings.tsx:203 | `text-lg font-medium text-gray-900 dark:text-white mb-4` |
| src/components/team/TeamSettings.tsx:256 | `text-lg font-medium text-gray-900 dark:text-white mb-4` |
| src/components/team/TeamSettings.tsx:262 | `font-medium text-gray-900 dark:text-white capitalize` |
| src/components/team/TeamSettings.tsx:278 | `text-lg font-medium text-gray-900 dark:text-white mb-4` |
| src/components/team/TeamSettings.tsx:284 | `font-medium text-gray-900 dark:text-white` |
| src/components/team-dashboard/SeasonStatsCard.tsx:100 | `text-gray-900 dark:text-white` |
| src/components/team-dashboard/TeamCalendar.tsx:68 | `text-gray-900 dark:text-white flex items-center gap-2` |
| src/components/team-dashboard/TeamFeed.tsx:244 | `flex items-center gap-2 text-gray-900 dark:text-white` |

## Surface Class Remediation Candidates (first 25)
| File:Line | ClassName Snip |
| --- | --- |
| src/components/dashboard/DatabaseDataDisplay.tsx:250 | `p-3 bg-gray-50 rounded-lg` |
| src/components/dashboard/DatabaseDataDisplay.tsx:293 | `p-3 bg-gray-50 rounded-lg` |
| src/components/dashboard/PersonalCalendar.tsx:162 | `flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer border border-gray-100 da` |
| src/components/dashboard/PersonalTrophyShelf.tsx:189 | `text-center p-2 bg-white/50 dark:bg-gray-700/30 rounded-lg` |
| src/components/dashboard/PersonalTrophyShelf.tsx:207 | `text-center p-2 bg-white/50 dark:bg-gray-700/30 rounded-lg` |
| src/components/dashboard/PersonalTrophyShelf.tsx:225 | `text-center p-2 bg-white/50 dark:bg-gray-700/30 rounded-lg` |
| src/components/dashboard/PersonalTrophyShelf.tsx:254 | `flex items-center space-x-3 py-2 px-3 h-10 mb-1 bg-white/60 dark:bg-gray-700/40 rounded-lg border border-white/40 dark:border-gray-600/30` |
| src/components/dashboard/TeamFeeds.tsx:128 | `flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer` |
| src/components/dev/DevTools.tsx:255 | `p-1 h-auto hover:bg-white/20 text-text-inverse` |
| src/components/dev/tabs/LogsTab.tsx:39 | `text-xs p-2 rounded bg-gray-50 dark:bg-gray-700` |
| src/components/onboarding/TeamOnboarding.tsx:176 | `bg-white dark:bg-gray-800 rounded-lg bc-card-padding border border-gray-200 dark:border-gray-700 hover:border-jade-300 dark:hover:border-jad` |
| src/components/onboarding/TeamOnboarding.tsx:200 | `bg-white dark:bg-gray-800 rounded-lg bc-card-padding border border-gray-200 dark:border-gray-700 hover:border-jade-300 dark:hover:border-jad` |
| src/components/playbook/AdvancedFilters.tsx:163 | `bg-white rounded-lg shadow-sm border border-slate-200` |
| src/components/playbook/AdvancedSearchBar.tsx:139 | `block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg 
                   focus:ring-2 focus:ring-jade-500 focus:border-jade-600 
` |
| src/components/playbook/AdvancedSearchBar.tsx:163 | `absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg 
                   border border-gray-200 max-h-64 overflow-y-auto` |
| src/components/playbook/BulkActionsToolbar.tsx:19 | `fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border border-slate-200 p-3 z-50` |
| src/components/playbook/CSVImport/CSVImportModal.tsx:696 | `inline-block align-bottom bg-white rounded-lg shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full` |
| src/components/playbook/CSVImport/CSVImportModal.tsx:697 | `bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between` |
| src/components/playbook/CSVImport/CSVImportModal.tsx:709 | `bg-white px-6 py-8` |
| src/components/playbook/PlayBuilder/AutocompleteDropdown.tsx:172 | `w-full px-3 py-2 pr-10 border border-slate-300 rounded-md focus:ring-2 focus:ring-jade-500 focus:border-jade-500 bg-white` |
| src/components/playbook/PlayBuilder/AutocompleteDropdown.tsx:199 | `h-4 w-4 bg-white rounded-full border border-jade-500` |
| src/components/playbook/PlayBuilder/AutocompleteDropdown.tsx:206 | `absolute z-50 w-full mt-1 bg-white border border-slate-300 rounded-md shadow-lg max-h-60 overflow-auto` |
| src/components/playbook/PlayBuilder/PlayBuilderCore.tsx:173 | `inline-block align-bottom bg-white rounded-lg shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full max-h-[90vh]` |
| src/components/playbook/PlayBuilder/PlayBuilderCore.tsx:175 | `bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between` |
| src/components/playbook/PlayBuilder/PlayBuilderPreview.tsx:38 | `bg-white rounded-lg border border-slate-200` |