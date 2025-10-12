/**
 * Personnel System Types
 *
 * Defines skill position configurations for plays and diagrams.
 * CRITICAL: Database column is 'player_position' (not 'position' - reserved keyword)
 */

export type PlayerPosition = "QB" | "RB" | "TE" | "WR";

/**
 * Individual player position within a personnel configuration
 * Maps to personnel_players table
 */
export interface PersonnelPlayer {
  id: string;
  config_id: string;
  /** IMPORTANT: Database column is 'player_position' not 'position' */
  player_position: PlayerPosition;
  /** Display label (e.g., "Q", "R", "X", "Y", "Z") */
  label: string;
  /** Position in formation (QB always 0) */
  sort_order: number;
  /** True for wildcat/trick play QBs at other positions */
  is_wildcat_qb: boolean;
  created_at: string;
}

/**
 * Personnel configuration metadata
 * Maps to personnel_configurations table
 */
export interface PersonnelConfiguration {
  id: string;
  playbook_id: string;
  /** Configuration name (e.g., "11 Personnel", "12 Personnel") */
  name: string;
  /** Optional description */
  description?: string;
  created_at: string;
  updated_at: string;
  /** Associated players ordered by sort_order */
  players: PersonnelPlayer[];
}

/**
 * Data for creating a new personnel configuration
 */
export interface CreatePersonnelConfiguration {
  playbook_id: string;
  name: string;
  description?: string;
  players: Omit<PersonnelPlayer, "id" | "config_id" | "created_at">[];
}

/**
 * Data for updating an existing personnel configuration
 */
export interface UpdatePersonnelConfiguration {
  name?: string;
  description?: string;
  /** If provided, replaces ALL players in the configuration */
  players?: Omit<PersonnelPlayer, "id" | "config_id" | "created_at">[];
}

/**
 * Standard personnel templates (commonly used formations)
 */
export const PERSONNEL_TEMPLATES = {
  "11 Personnel": {
    name: "11 Personnel",
    description: "1 RB, 1 TE, 3 WR - Balanced spread formation",
    players: [
      { player_position: "QB" as const, label: "Q", sort_order: 0, is_wildcat_qb: false },
      { player_position: "RB" as const, label: "R", sort_order: 1, is_wildcat_qb: false },
      { player_position: "TE" as const, label: "T", sort_order: 2, is_wildcat_qb: false },
      { player_position: "WR" as const, label: "X", sort_order: 3, is_wildcat_qb: false },
      { player_position: "WR" as const, label: "Y", sort_order: 4, is_wildcat_qb: false },
    ],
  },
  "10 Personnel": {
    name: "10 Personnel",
    description: "1 RB, 0 TE, 4 WR - Four-wide receiver set",
    players: [
      { player_position: "QB" as const, label: "Q", sort_order: 0, is_wildcat_qb: false },
      { player_position: "RB" as const, label: "R", sort_order: 1, is_wildcat_qb: false },
      { player_position: "WR" as const, label: "X", sort_order: 2, is_wildcat_qb: false },
      { player_position: "WR" as const, label: "Y", sort_order: 3, is_wildcat_qb: false },
      { player_position: "WR" as const, label: "Z", sort_order: 4, is_wildcat_qb: false },
    ],
  },
  "12 Personnel": {
    name: "12 Personnel",
    description: "1 RB, 2 TE, 2 WR - Power running formation",
    players: [
      { player_position: "QB" as const, label: "Q", sort_order: 0, is_wildcat_qb: false },
      { player_position: "RB" as const, label: "R", sort_order: 1, is_wildcat_qb: false },
      { player_position: "TE" as const, label: "Y", sort_order: 2, is_wildcat_qb: false },
      { player_position: "TE" as const, label: "T", sort_order: 3, is_wildcat_qb: false },
      { player_position: "WR" as const, label: "X", sort_order: 4, is_wildcat_qb: false },
    ],
  },
  "21 Personnel": {
    name: "21 Personnel",
    description: "2 RB, 1 TE, 2 WR - Traditional I-formation",
    players: [
      { player_position: "QB" as const, label: "Q", sort_order: 0, is_wildcat_qb: false },
      { player_position: "RB" as const, label: "H", sort_order: 1, is_wildcat_qb: false },
      { player_position: "RB" as const, label: "R", sort_order: 2, is_wildcat_qb: false },
      { player_position: "TE" as const, label: "T", sort_order: 3, is_wildcat_qb: false },
      { player_position: "WR" as const, label: "X", sort_order: 4, is_wildcat_qb: false },
    ],
  },
} as const;

/**
 * Helper: Get default personnel template (11 Personnel)
 */
export const getDefaultPersonnelTemplate = () => PERSONNEL_TEMPLATES["11 Personnel"];

/**
 * Helper: Validate personnel configuration has QB at position 0
 */
export const validatePersonnelConfiguration = (
  players: Omit<PersonnelPlayer, "id" | "config_id" | "created_at">[]
): boolean => {
  if (players.length === 0) return false;
  return players[0].player_position === "QB" && players[0].sort_order === 0;
};
