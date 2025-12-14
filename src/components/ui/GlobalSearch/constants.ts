/**
 * GlobalSearch Constants
 *
 * Maps and configuration values for the global search component.
 */

import type { SearchResultType } from "./types";

/**
 * Maps search result types to icon names
 */
export const TYPE_ICON_MAP: Record<SearchResultType, string> = {
  play: "play",
  formation: "users",
  player: "user",
  announcement: "bell",
  game_plan: "clipboard-list",
  practice_script: "list",
  calendar_event: "calendar",
  equipment: "folder",
};

/**
 * Maps search result types to color classes
 */
export const TYPE_COLOR_MAP: Record<SearchResultType, string> = {
  play: "text-blue-600",
  formation: "text-green-600",
  player: "text-purple-600",
  announcement: "text-orange-600",
  game_plan: "text-red-600",
  practice_script: "text-teal-600",
  calendar_event: "text-indigo-600",
  equipment: "text-amber-600",
};

/**
 * Default icon for unknown types
 */
export const DEFAULT_TYPE_ICON = "search";

/**
 * Default color for unknown types
 */
export const DEFAULT_TYPE_COLOR = "text-secondary";

/**
 * Search debounce delay in milliseconds (shorter for snappy feel)
 */
export const SEARCH_DEBOUNCE_MS = 150;

/**
 * Delay before closing dropdown on blur (allows for result clicks)
 */
export const BLUR_CLOSE_DELAY_MS = 150;

/**
 * Delay before focusing mobile input after modal opens
 */
export const MOBILE_FOCUS_DELAY_MS = 100;

/**
 * Minimum query length before showing "no results" message
 */
export const MIN_QUERY_LENGTH_FOR_NO_RESULTS = 2;

/**
 * Search result limits per category
 */
export const SEARCH_LIMITS = {
  plays: 5,
  formations: 3,
  players: 2,
  announcements: 2,
  gamePlans: 2,
  practiceScripts: 2,
  calendarEvents: 2,
  equipment: 2,
} as const;
