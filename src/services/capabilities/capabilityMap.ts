/**
 * Capability Map
 * Lightweight domain-level capability system layered on top of coarse RBAC roles.
 * These are UI/rendering capabilities (feature toggles) rather than persisted permissions.
 */

export const Capability = {
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

export type Capability = (typeof Capability)[keyof typeof Capability];

// Role → capabilities mapping (additive; head_coach extends coach)
const BASE_ROLE_MAP: Record<string, Capability[]> = {
  head_coach: [
    Capability.CREATE_POST,
    Capability.LOG_GAME_RESULT,
    Capability.AWARD_STICKERS,
    Capability.VIEW_PRACTICE_SCHEDULE,
    Capability.UPLOAD_FILM,
    Capability.MANAGE_ROSTER,
    Capability.MANAGE_TEAM_SETTINGS,
    Capability.VIEW_STATS,
    Capability.STUDY_PLAYS,
    Capability.RSVP_EVENT,
    Capability.TEAM_CHAT,
    Capability.PLAYER_PROGRESS, // for evaluation reviews
    Capability.TEAM_PHOTOS,
    Capability.PIN_POST,
  ],
  coach: [
    Capability.CREATE_POST,
    Capability.LOG_GAME_RESULT,
    Capability.AWARD_STICKERS,
    Capability.VIEW_PRACTICE_SCHEDULE,
    Capability.UPLOAD_FILM,
    Capability.MANAGE_ROSTER,
    Capability.MANAGE_TEAM_SETTINGS,
    Capability.VIEW_STATS,
    Capability.STUDY_PLAYS,
    Capability.RSVP_EVENT,
    Capability.TEAM_CHAT,
    Capability.TEAM_PHOTOS,
  ],
  manager: [
    Capability.VIEW_PRACTICE_SCHEDULE,
    Capability.MANAGE_ROSTER,
    Capability.RSVP_EVENT,
    Capability.TEAM_CHAT,
    Capability.TEAM_PHOTOS,
  ],
  player: [
    Capability.VIEW_STATS,
    Capability.STUDY_PLAYS,
    Capability.RSVP_EVENT,
    Capability.TEAM_CHAT,
  ],
  family: [
    Capability.RSVP_EVENT,
    Capability.PLAYER_PROGRESS,
    Capability.TEAM_PHOTOS,
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
