# Style Audit Summary
Generated: 2025-08-10T03:00:18.735Z

## Key Metrics
| Metric | Value |
| --- | --- |
| Total Source Files | 361 |
| text-white Occurrences | 172 |
| Raw <button> Heuristic (non-primitive) | 1 |

## Top Background Classes
| bg-* | Count |
| --- | --- |
| white | 107 |
| gray-800 | 52 |
| gray-50 | 52 |
| blue-50 | 28 |
| gray-700 | 28 |
| opacity-50 | 17 |
| black | 16 |
| slate-50 | 16 |
| red-50 | 15 |
| gray-200 | 15 |
| jade-600 | 14 |
| gray-900 | 14 |
| jade-100 | 13 |
| gray-100 | 13 |
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
| src/components/auth/UserMenu.tsx:45 | `flex items-center space-x-2 px-3 py-2 h-auto font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white` |
| src/components/auth/UserMenu.tsx:49 | `w-8 h-8 bg-jade-500 rounded-full flex items-center justify-center text-white font-medium text-sm` |
| src/components/auth/UserMenu.tsx:74 | `text-sm font-medium text-gray-900 dark:text-white` |
| src/components/auth/UserMenu.tsx:90 | `w-full justify-start px-4 py-2 h-auto text-sm text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white` |
| src/components/auth/UserMenu.tsx:102 | `w-full justify-start px-4 py-2 h-auto text-sm text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white` |
| src/components/dashboard/PersonalProfile.tsx:78 | `text-gray-900 dark:text-white` |
| src/components/dashboard/PersonalProfile.tsx:111 | `font-semibold mb-2 text-gray-900 dark:text-white` |
| src/components/dashboard/PersonalProfile.tsx:122 | `w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white` |
| src/components/dashboard/PersonalProfile.tsx:137 | `font-semibold mb-2 text-gray-900 dark:text-white` |
| src/components/dashboard/PersonalProfile.tsx:168 | `font-semibold mb-2 text-gray-900 dark:text-white` |
| src/components/dashboard/PersonalProfile.tsx:197 | `font-semibold mb-3 text-gray-900 dark:text-white` |
| src/components/dashboard/PersonalProfile.tsx:272 | `font-semibold mb-3 text-gray-900 dark:text-white` |
| src/components/dashboard/PersonalProfile.tsx:303 | `font-semibold mb-3 text-gray-900 dark:text-white` |
| src/components/dashboard/PersonalTrophyShelf.tsx:154 | `text-gray-800 dark:text-white` |
| src/components/dashboard/PersonalTrophyShelf.tsx:162 | `font-semibold text-gray-800 dark:text-white` |
| src/components/dashboard/RoleBasedDashboard.tsx:64 | `text-2xl font-bold text-gray-900 dark:text-white` |
| src/components/dashboard/RoleBasedDashboard.tsx:96 | `text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center` |
| src/components/dashboard/RoleBasedDashboard.tsx:106 | `text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center` |
| src/components/dashboard/RoleBasedDashboard.tsx:116 | `text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center` |
| src/components/dashboard/RoleBasedDashboard.tsx:126 | `text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center` |
| src/components/dashboard/RoleBasedDashboard.tsx:147 | `text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center` |
| src/components/dashboard/RoleBasedDashboard.tsx:156 | `font-medium text-gray-900 dark:text-white` |
| src/components/dashboard/RoleBasedDashboard.tsx:164 | `font-medium text-gray-900 dark:text-white` |

## Surface Class Remediation Candidates (first 25)
| File:Line | ClassName Snip |
| --- | --- |
| src/components/auth/UserMenu.tsx:70 | `absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50` |
| src/components/dashboard/DatabaseDataDisplay.tsx:250 | `p-3 bg-gray-50 rounded-lg` |
| src/components/dashboard/DatabaseDataDisplay.tsx:293 | `p-3 bg-gray-50 rounded-lg` |
| src/components/dashboard/PersonalCalendar.tsx:162 | `flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-gray-100` |
| src/components/dashboard/PersonalCalendar.tsx:225 | `bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto` |
| src/components/dashboard/PersonalProfile.tsx:122 | `w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white` |
| src/components/dashboard/PersonalTrophyShelf.tsx:180 | `text-center p-2 bg-white/50 dark:bg-gray-700/30 rounded-lg` |
| src/components/dashboard/PersonalTrophyShelf.tsx:198 | `text-center p-2 bg-white/50 dark:bg-gray-700/30 rounded-lg` |
| src/components/dashboard/PersonalTrophyShelf.tsx:216 | `text-center p-2 bg-white/50 dark:bg-gray-700/30 rounded-lg` |
| src/components/dashboard/PersonalTrophyShelf.tsx:234 | `text-center p-2 bg-white/50 dark:bg-gray-700/30 rounded-lg` |
| src/components/dashboard/PersonalTrophyShelf.tsx:263 | `flex items-center space-x-3 py-2 px-3 h-10 mb-1 bg-white/60 dark:bg-gray-700/40 rounded-lg border border-white/40 dark:border-gray-600/30` |
| src/components/dashboard/RoleBasedDashboard.tsx:59 | `bg-white dark:bg-gray-800 shadow-sm border-b` |
| src/components/dashboard/RoleBasedDashboard.tsx:146 | `bg-white dark:bg-gray-800 rounded-lg shadow bc-card-padding` |
| src/components/dashboard/RoleBasedDashboard.tsx:178 | `bg-white dark:bg-gray-800 rounded-lg shadow bc-card-padding` |
| src/components/dashboard/RoleBasedDashboard.tsx:197 | `bg-white dark:bg-gray-800 rounded-lg shadow bc-card-padding` |
| src/components/dashboard/TeamFeeds.tsx:128 | `flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer` |
| src/components/dev/DevTools.tsx:217 | `bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-2xl max-w-md` |
| src/components/dev/DevTools.tsx:255 | `p-1 h-auto hover:bg-white/20 text-white` |
| src/components/dev/DevTools.tsx:273 | `flex border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700` |
| src/components/dev/DevTools.tsx:298 | `p-4 max-h-80 overflow-y-auto bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100` |
| src/components/dev/tabs/LogsTab.tsx:39 | `text-xs p-2 rounded bg-gray-50 dark:bg-gray-700` |
| src/components/layout/Footer.tsx:17 | `bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700` |
| src/components/onboarding/TeamOnboarding.tsx:176 | `bg-white dark:bg-gray-800 rounded-lg bc-card-padding border border-gray-200 dark:border-gray-700 hover:border-jade-300 dark:hover:border-jad` |
| src/components/onboarding/TeamOnboarding.tsx:200 | `bg-white dark:bg-gray-800 rounded-lg bc-card-padding border border-gray-200 dark:border-gray-700 hover:border-jade-300 dark:hover:border-jad` |
| src/components/playbook/AdvancedFilters.tsx:163 | `bg-white rounded-lg shadow-sm border border-slate-200` |