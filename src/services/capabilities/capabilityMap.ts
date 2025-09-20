/**
 * Capability Map
 * Lightweight domain-level capability system layered on top of coarse RBAC roles.
 * These are UI/rendering capabilities (feature toggles) rather than persisted permissions.
 */

export const CAPABILITIES = {
  CREATE_POST: "create_post",
  LOG_GAME_RESULT: "log_game_result",
  AWARD_STICKERS: "award_stickers",
  VIEW_PRACTICE_SCHEDULE: "view_practice_schedule",
  UPLOAD_FILM: "upload_film",
  MANAGE_ROSTER: "manage_roster",
  MANAGE_TEAM_SETTINGS: "manage_team_settings",
  VIEW_STATS: "view_stats",
  STUDY_PLAYS: "study_plays",
  RSVP_EVENT: "rsvp_event",
  TEAM_CHAT: "team_chat",
  PLAYER_PROGRESS: "player_progress",
  TEAM_PHOTOS: "team_photos",
  PIN_POST: "pin_post",
} as const;

export type Capability = (typeof CAPABILITIES)[keyof typeof CAPABILITIES];

// Role → capabilities mapping (additive; head_coach extends coach)
const BASE_ROLE_MAP: Record<string, Capability[]> = {
  head_coach: [
    CAPABILITIES.CREATE_POST,
    CAPABILITIES.LOG_GAME_RESULT,
    CAPABILITIES.AWARD_STICKERS,
    CAPABILITIES.VIEW_PRACTICE_SCHEDULE,
    CAPABILITIES.UPLOAD_FILM,
    CAPABILITIES.MANAGE_ROSTER,
    CAPABILITIES.MANAGE_TEAM_SETTINGS,
    CAPABILITIES.VIEW_STATS,
    CAPABILITIES.STUDY_PLAYS,
    CAPABILITIES.RSVP_EVENT,
    CAPABILITIES.TEAM_CHAT,
    CAPABILITIES.PLAYER_PROGRESS, // for evaluation reviews
    CAPABILITIES.TEAM_PHOTOS,
    CAPABILITIES.PIN_POST,
  ],
  coach: [
    CAPABILITIES.CREATE_POST,
    CAPABILITIES.LOG_GAME_RESULT,
    CAPABILITIES.AWARD_STICKERS,
    CAPABILITIES.VIEW_PRACTICE_SCHEDULE,
    CAPABILITIES.UPLOAD_FILM,
    CAPABILITIES.MANAGE_ROSTER,
    CAPABILITIES.MANAGE_TEAM_SETTINGS,
    CAPABILITIES.VIEW_STATS,
    CAPABILITIES.STUDY_PLAYS,
    CAPABILITIES.RSVP_EVENT,
    CAPABILITIES.TEAM_CHAT,
    CAPABILITIES.TEAM_PHOTOS,
  ],
  manager: [
    CAPABILITIES.VIEW_PRACTICE_SCHEDULE,
    CAPABILITIES.MANAGE_ROSTER,
    CAPABILITIES.RSVP_EVENT,
    CAPABILITIES.TEAM_CHAT,
    CAPABILITIES.TEAM_PHOTOS,
  ],
  player: [
    CAPABILITIES.VIEW_STATS,
    CAPABILITIES.STUDY_PLAYS,
    CAPABILITIES.RSVP_EVENT,
    CAPABILITIES.TEAM_CHAT,
  ],
  family: [
    CAPABILITIES.RSVP_EVENT,
    CAPABILITIES.PLAYER_PROGRESS,
    CAPABILITIES.TEAM_PHOTOS,
  ],
  viewer: [],
};

/**
 * Get capability list for a given role.
 * Unknown roles get empty array (safe default).
 */
export function getCapabilitiesForRole(role?: string | null): Capability[] {
  if (!role) return [];
  return BASE_ROLE_MAP[role] ? [...BASE_ROLE_MAP[role]] : [];
}

/** Convenience helper */
export function hasCapability(
  capabilities: Capability[],
  required: Capability | Capability[]
): boolean {
  const requiredList = Array.isArray(required) ? required : [required];
  return requiredList.every((c) => capabilities.includes(c));
}
