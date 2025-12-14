/**
 * PlayAssignmentsModal Constants
 */

/**
 * Default personnel groupings for common formations
 * Interleaved for 2-column grid: [skill, line, skill, line...]
 * Left column: Skill players (QB, RB, WR, etc.)
 * Right column: Linemen and TE
 */
export const DEFAULT_PERSONNEL_POSITIONS: Record<string, string[]> = {
  "11": ["QB", "TE", "RB", "LT", "X", "LG", "Y", "C", "Z", "RG", "H", "RT"],
  "12": ["QB", "TE1", "RB", "TE2", "X", "LT", "Y", "LG", "Z", "C", "H", "RG"],
  "21": ["QB", "TE", "RB1", "LT", "RB2", "LG", "X", "C", "Y", "RG", "H", "RT"],
  "10": ["QB", "TE", "RB", "LT", "X", "LG", "Y", "C", "Z", "RG", "H", "RT"],
};

export const SAVE_SUCCESS_TIMEOUT = 2000;
