/**
 * Personnel System Types
 *
 * Defines skill position configurations for plays and diagrams.
 * CRITICAL: Database column is 'player_position' (not 'position' - reserved keyword)
 */

export type PlayerPosition = "QB" | "RB" | "TE" | "WR";

/**
 * Badge style variants for personnel badges
 */
export type BadgeStyle = "solid" | "border" | "gradient" | "shiny";

/**
 * Color preset configurations for badges
 */
export interface ColorPreset {
  id: string;
  name: string;
  background: string;
  text: string;
  border?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

/**
 * Badge customization settings
 */
export interface BadgeCustomization {
  style: BadgeStyle;
  colorPresetId: string;
  fontFamily?: string;
}

/**
 * Predefined color presets for badge customization
 */
export const BADGE_COLOR_PRESETS: ColorPreset[] = [
  {
    id: "electric-blue",
    name: "Electric Blue",
    background: "bg-electric-600",
    text: "text-white",
    border: "border-electric-700",
    gradientFrom: "from-electric-500",
    gradientTo: "to-electric-700",
  },
  {
    id: "crimson-red",
    name: "Crimson Red",
    background: "bg-red-600",
    text: "text-white",
    border: "border-red-700",
    gradientFrom: "from-red-500",
    gradientTo: "to-red-700",
  },
  {
    id: "emerald-green",
    name: "Emerald Green",
    background: "bg-emerald-600",
    text: "text-white",
    border: "border-emerald-700",
    gradientFrom: "from-emerald-500",
    gradientTo: "to-emerald-700",
  },
  {
    id: "amber-gold",
    name: "Amber Gold",
    background: "bg-amber-500",
    text: "text-amber-950",
    border: "border-amber-600",
    gradientFrom: "from-amber-400",
    gradientTo: "to-amber-600",
  },
  {
    id: "purple-royal",
    name: "Royal Purple",
    background: "bg-purple-600",
    text: "text-white",
    border: "border-purple-700",
    gradientFrom: "from-purple-500",
    gradientTo: "to-purple-700",
  },
  {
    id: "orange-flame",
    name: "Flame Orange",
    background: "bg-orange-600",
    text: "text-white",
    border: "border-orange-700",
    gradientFrom: "from-orange-500",
    gradientTo: "to-orange-700",
  },
  {
    id: "cyan-ocean",
    name: "Ocean Cyan",
    background: "bg-cyan-600",
    text: "text-white",
    border: "border-cyan-700",
    gradientFrom: "from-cyan-500",
    gradientTo: "to-cyan-700",
  },
  {
    id: "pink-rose",
    name: "Rose Pink",
    background: "bg-pink-600",
    text: "text-white",
    border: "border-pink-700",
    gradientFrom: "from-pink-500",
    gradientTo: "to-pink-700",
  },
  {
    id: "slate-dark",
    name: "Dark Slate",
    background: "bg-slate-700",
    text: "text-white",
    border: "border-slate-800",
    gradientFrom: "from-slate-600",
    gradientTo: "to-slate-800",
  },
  {
    id: "teal-mint",
    name: "Mint Teal",
    background: "bg-teal-600",
    text: "text-white",
    border: "border-teal-700",
    gradientFrom: "from-teal-500",
    gradientTo: "to-teal-700",
  },
  {
    id: "indigo-deep",
    name: "Deep Indigo",
    background: "bg-indigo-600",
    text: "text-white",
    border: "border-indigo-700",
    gradientFrom: "from-indigo-500",
    gradientTo: "to-indigo-700",
  },
  {
    id: "lime-bright",
    name: "Bright Lime",
    background: "bg-lime-500",
    text: "text-lime-950",
    border: "border-lime-600",
    gradientFrom: "from-lime-400",
    gradientTo: "to-lime-600",
  },
];

/**
 * Font options for badge customization
 */
export const BADGE_FONT_OPTIONS = [
  { id: "default", name: "Default", className: "font-sans" },
  { id: "mono", name: "Monospace", className: "font-mono" },
  { id: "serif", name: "Serif", className: "font-serif" },
] as const;

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
 * Updated for Library System (20251129110912 migration)
 */
export interface PersonnelConfiguration {
  id: string;
  playbook_id: string;
  /** Configuration name (e.g., "11", "12", "21") */
  name: string;
  /** Optional description */
  description?: string | null;
  /** Badge customization settings (stored as JSONB in database) */
  badgeCustomization?: BadgeCustomization | null;
  
  // Intelligence System (NEW)
  confidence_score: number; // 0-100 confidence from play analysis
  last_analyzed_at: string | null; // Timestamp of last intelligence run
  analysis_play_count: number; // Number of plays analyzed
  usage_count: number; // Number of plays using this personnel
  
  created_at: string;
  updated_at: string;
  /** Associated players ordered by sort_order */
  players?: PersonnelPlayer[];
}

/**
 * Data for creating a new personnel configuration
 */
export interface CreatePersonnelConfiguration {
  playbook_id: string;
  name: string;
  description?: string;
  badgeCustomization?: BadgeCustomization;
  players: Omit<PersonnelPlayer, "id" | "config_id" | "created_at">[];
}

/**
 * Data for updating an existing personnel configuration
 */
export interface UpdatePersonnelConfiguration {
  name?: string;
  description?: string;
  /** Badge customization settings */
  badgeCustomization?: BadgeCustomization;
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
      {
        player_position: "QB" as const,
        label: "Q",
        sort_order: 0,
        is_wildcat_qb: false,
      },
      {
        player_position: "RB" as const,
        label: "R",
        sort_order: 1,
        is_wildcat_qb: false,
      },
      {
        player_position: "TE" as const,
        label: "T",
        sort_order: 2,
        is_wildcat_qb: false,
      },
      {
        player_position: "WR" as const,
        label: "X",
        sort_order: 3,
        is_wildcat_qb: false,
      },
      {
        player_position: "WR" as const,
        label: "Y",
        sort_order: 4,
        is_wildcat_qb: false,
      },
    ],
  },
  "10 Personnel": {
    name: "10 Personnel",
    description: "1 RB, 0 TE, 4 WR - Four-wide receiver set",
    players: [
      {
        player_position: "QB" as const,
        label: "Q",
        sort_order: 0,
        is_wildcat_qb: false,
      },
      {
        player_position: "RB" as const,
        label: "R",
        sort_order: 1,
        is_wildcat_qb: false,
      },
      {
        player_position: "WR" as const,
        label: "X",
        sort_order: 2,
        is_wildcat_qb: false,
      },
      {
        player_position: "WR" as const,
        label: "Y",
        sort_order: 3,
        is_wildcat_qb: false,
      },
      {
        player_position: "WR" as const,
        label: "Z",
        sort_order: 4,
        is_wildcat_qb: false,
      },
    ],
  },
  "12 Personnel": {
    name: "12 Personnel",
    description: "1 RB, 2 TE, 2 WR - Power running formation",
    players: [
      {
        player_position: "QB" as const,
        label: "Q",
        sort_order: 0,
        is_wildcat_qb: false,
      },
      {
        player_position: "RB" as const,
        label: "R",
        sort_order: 1,
        is_wildcat_qb: false,
      },
      {
        player_position: "TE" as const,
        label: "Y",
        sort_order: 2,
        is_wildcat_qb: false,
      },
      {
        player_position: "TE" as const,
        label: "T",
        sort_order: 3,
        is_wildcat_qb: false,
      },
      {
        player_position: "WR" as const,
        label: "X",
        sort_order: 4,
        is_wildcat_qb: false,
      },
    ],
  },
  "21 Personnel": {
    name: "21 Personnel",
    description: "2 RB, 1 TE, 2 WR - Traditional I-formation",
    players: [
      {
        player_position: "QB" as const,
        label: "Q",
        sort_order: 0,
        is_wildcat_qb: false,
      },
      {
        player_position: "RB" as const,
        label: "H",
        sort_order: 1,
        is_wildcat_qb: false,
      },
      {
        player_position: "RB" as const,
        label: "R",
        sort_order: 2,
        is_wildcat_qb: false,
      },
      {
        player_position: "TE" as const,
        label: "T",
        sort_order: 3,
        is_wildcat_qb: false,
      },
      {
        player_position: "WR" as const,
        label: "X",
        sort_order: 4,
        is_wildcat_qb: false,
      },
    ],
  },
} as const;

/**
 * Helper: Get default personnel template (11 Personnel)
 */
export const getDefaultPersonnelTemplate = () =>
  PERSONNEL_TEMPLATES["11 Personnel"];

/**
 * Helper: Validate personnel configuration has QB at position 0
 */
export const validatePersonnelConfiguration = (
  players: Omit<PersonnelPlayer, "id" | "config_id" | "created_at">[]
): boolean => {
  if (players.length === 0) return false;
  return players[0].player_position === "QB" && players[0].sort_order === 0;
};
