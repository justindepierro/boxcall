// Play creation source tracking
export type PlayCreationSource =
  | "add_play_modal" // From AddNewPlayModal (hero tile)
  | "diagram_editor" // Created directly in diagram editor
  | "play_card" // Duplicated from existing play
  | "bulk_import" // CSV/bulk import
  | "api" // API creation
  | "migration" // Data migration
  | "unknown"; // Legacy or undefined

// Play creation context (JSONB structure)
export interface PlayCreationContext {
  active_tab?: string; // Which tab was active (if applicable)
  user_action?: string; // Specific action taken
  duplicated_from?: string; // Play ID if duplicated
  source_version?: string; // App version
  [key: string]: unknown; // Allow additional context
}

// Key player selection helper (for UI components)
export interface KeyPlayerSelection {
  position: string; // Position name from key_positions (e.g., "X", "Y", "Z")
  player_id: string; // UUID from team_players table
  player_name: string; // Display name (first + last)
  jersey_number?: number; // For UI display
  player_position?: string; // Player's actual position (QB, WR, RB, etc.)
}

// Custom field types
export type CustomFieldType =
  | "text"
  | "number"
  | "boolean"
  | "select"
  | "multi_select"
  | "date"
  | "url";

// Valid custom field values
export type CustomFieldValue =
  | string
  | number
  | boolean
  | string[]
  | Date
  | null;

// Custom field definition (team-specific)
export interface CustomFieldDefinition {
  id: string;
  team_id: string;
  field_name: string;
  field_type: CustomFieldType;
  field_label: string;
  field_description?: string;
  field_options?: string[]; // For select/multi_select types
  default_value?: CustomFieldValue;
  is_required: boolean;
  display_order: number;
  category: string; // 'formation', 'execution', 'analysis', 'conditions', etc.
  created_at: Date;
  updated_at: Date;
}

// Custom field values (stored as JSONB in database)
export interface CustomFieldValues {
  [field_name: string]: CustomFieldValue; // Dynamic based on field definitions
}

// Play types that match the EXACT database schema (database/schema.sql lines 34-90)
export interface Play {
  // Database primary fields
  id: string; // uuid
  playbook_id: string; // uuid

  // Core play data (required)
  formation: string; // text NOT NULL
  play_name: string; // text NOT NULL
  p_type: string; // text NOT NULL (Pass, Run, RPO, Play Action)

  // Optional core fields
  one_word_play?: string; // text
  wristband_number?: string; // text - wristband communication number

  // Formation details
  personnel?: string; // text
  f_type?: string; // text (DEPRECATED - use formation.formation_type)
  f_dir?: string; // text

  // Play details
  protection?: string; // text
  p_dir?: string; // text
  r_str?: string; // text (DEPRECATED - use formation.run_strength with modifiers)
  p_str?: string; // text (DEPRECATED - use formation.pass_strength)

  // Back position modifiers (affect inherited formation strength)
  back_left_of_qb?: boolean; // TRUE if back aligns left of QB
  back_right_of_qb?: boolean; // TRUE if back aligns right of QB

  // Preferences (coach-defined situational fit)
  pref_down?: string; // text - Preferred down (1st, 2nd, 3rd, 4th)
  pref_dis?: string; // text - Preferred distance (Short, Medium, Long)
  pref_hash?: string; // text - Preferred hash (Left, Middle, Right)
  pref_cov?: string; // text - Preferred coverage (coach-defined: Man, Zone, Cover 2, etc.)
  pref_front?: string; // text - Preferred defensive front (coach-defined: 4-3, 3-4, Odd, etc.)
  pref_field_pos?: string; // text - Preferred field position (coach-defined: Red Zone, Goal Line, etc.)
  pref_situation?: string; // text - Custom situation (coach-defined: 2-Minute, Backed Up, etc.)

  // Tags and categorization
  ftag1?: string; // text
  ftag2?: string; // text
  p_tag1?: string; // text (DEPRECATED - use tags array)
  p_tag2?: string; // text (DEPRECATED - use tags array)

  // Play metadata arrays (NEW - October 17, 2025)
  tags?: string[] | null; // text[] - unlimited play variations (e.g., ["Bubble", "Read", "Screen"])
  key_positions?: string[] | null; // text[] - key positions from personnel config (e.g., ["X", "Y"])
  key_players?: string[] | null; // uuid[] - key player UUIDs from team_players table
  flags?: string[] | null; // text[] - situational flags (e.g., ["Red Zone", "2-Minute"])
  metadata_migrated_at?: Date | null; // timestamptz - when p_tag1/p_tag2 were migrated to tags array

  // Additional data
  back_align?: string; // text
  shift?: string; // text
  motion?: string; // text
  key_player1?: string; // text
  key_player2?: string; // text
  check_into?: string; // text
  notes?: string; // text

  // Play diagram (NEW - November 27, 2025)
  diagram_image_url?: string | null; // text - Supabase Storage URL for uploaded diagram image

  // Performance metrics
  confidence_base: number; // integer DEFAULT 70
  times_called: number; // integer DEFAULT 0
  times_successful: number; // integer DEFAULT 0

  // Metadata (required)
  created_by: string; // text NOT NULL
  created_at: Date; // timestamptz DEFAULT NOW()
  updated_at: Date; // timestamptz DEFAULT NOW()

  // Optimistic locking (conflict resolution)
  version?: number; // integer DEFAULT 1 - incremented on each update

  // Optional metadata
  is_archived?: boolean; // boolean DEFAULT false
  last_used_at?: Date; // timestamptz
  complexity_score?: number; // integer
  search_vector?: string; // tsvector (auto-generated, read-only)
  duplicate_key?: string; // canonical duplication key (nullable until enforced)
  // Installation lifecycle phase (not yet in DB - forward compatibility)
  install_phase?: string; // e.g., 'install1','install2','install3','situational','gameplan'

  // Diagram fields (NEW - October 12, 2025)
  diagram_data?: unknown | null; // JSONB - diagram payload (validated elsewhere)
  diagram_version?: number | null; // integer - diagram format version (1-10)
  diagram_url?: string | null; // text - PNG thumbnail URL only (not diagram JSON)

  // Formation relationship (NEW - October 12, 2025)
  formation_id?: string | null; // uuid - references formations.id
  formation_direction?: "base" | "left" | "right" | null; // text - which variant to use
  formation_status?: string | null;
  sanitized_at?: Date | string | null;

  // Creation tracking (NEW - October 16, 2025)
  creation_source?: PlayCreationSource; // Where was play created from
  creation_context?: PlayCreationContext; // Additional creation context
}

// Play type enumeration matching database constraint (text field)
export type PlayType =
  | "Pass"
  | "Run"
  | "RPO"
  | "Play Action"
  | "Screen"
  | "Special";
// Formation types commonly used in football
export interface FormationOption {
  name: string;
  type: string;
  personnel: string;
  description: string;
}
// Builder wizard step data
export interface PlayBuilderData {
  // Step 1: Basic Info
  play_name: string;
  p_type: PlayType;
  one_word_play?: string;
  // Step 2: Formation
  formation: string;
  f_dir?: string;
  ftag1?: string;
  ftag2?: string;
  f_type?: string;
  personnel?: string;
  back_align?: string;
  // Step 3: Protection & Motion
  protection?: string;
  shift?: string;
  motion?: string;
  // Step 4: Play Details
  p_dir?: string;
  p_tag1?: string;
  p_tag2?: string;
  key_player1?: string;
  key_player2?: string;
  check_into?: string;
  r_str?: string;
  p_str?: string;
  // Step 5: Preferences
  pref_down?: string;
  pref_dis?: string;
  pref_hash?: string;
  pref_cov?: string;
  pref_front?: string;
  // Step 6: Additional
  notes?: string;
  tags?: string[];
  confidence_base: number;
}
// Common formation options
export const FORMATION_OPTIONS: FormationOption[] = [
  {
    name: "Empty",
    type: "Spread",
    personnel: "Regular",
    description: "0 RB, 5 WR",
  },
  {
    name: "Shotgun",
    type: "Spread",
    personnel: "Regular",
    description: "QB in shotgun, RB behind",
  },
  {
    name: "Pistol",
    type: "Spread",
    personnel: "Regular",
    description: "QB 4 yards, RB behind",
  },
  {
    name: "I-Formation",
    type: "Power",
    personnel: "Regular",
    description: "FB and RB in line",
  },
  {
    name: "Singleback",
    type: "Balanced",
    personnel: "Regular",
    description: "Single RB behind QB",
  },
  {
    name: "Doubles",
    type: "Spread",
    personnel: "Regular",
    description: "2x2 receiver formation",
  },
  {
    name: "Trips",
    type: "Spread",
    personnel: "Regular",
    description: "3x1 receiver formation",
  },
  {
    name: "Trio",
    type: "Spread",
    personnel: "Regular",
    description: "3 receivers one side",
  },
  {
    name: "Deuce",
    type: "Balanced",
    personnel: "Regular",
    description: "2 receivers each side",
  },
  {
    name: "Ace",
    type: "Balanced",
    personnel: "Regular",
    description: "Tight formation",
  },
  {
    name: "Twins",
    type: "Spread",
    personnel: "Regular",
    description: "Twin receivers",
  },
  {
    name: "Stack",
    type: "Spread",
    personnel: "Regular",
    description: "Stacked receivers",
  },
  {
    name: "Bunch",
    type: "Bunch",
    personnel: "Regular",
    description: "Tight receiver bunch",
  },
];
// Direction options
export const DIRECTION_OPTIONS = ["Left", "Right", "Middle"] as const;
// Formation tags
export const FORMATION_TAGS = [
  "Far",
  "Near",
  "eFar",
  "eNear",
  "Flex",
  "Stack",
  "Bunch",
  "Tight",
  "Wide",
  "Next",
] as const;
// Back alignment options
export const BACK_ALIGN_OPTIONS = [
  "Default",
  "Deep",
  "Shallow",
  "Wide",
  "Tight",
  "Offset",
] as const;
// Protection schemes
export const PROTECTION_OPTIONS = [
  "Half",
  "Full",
  "Quick",
  "Max",
  "Slide",
  "Six",
  "Seven",
  "Hot",
] as const;
// Down preferences
export const DOWN_OPTIONS = ["Any", "1", "2", "3", "4"] as const;
// Distance preferences
export const DISTANCE_OPTIONS = [
  "Any",
  "Short",
  "Medium",
  "Long",
  "1-3",
  "4-6",
  "7-10",
  "11+",
] as const;
// Hash preferences
export const HASH_OPTIONS = ["Any", "Left", "Right", "Middle"] as const;
// Play type options - source of truth for all play type UI
export const PLAY_TYPE_OPTIONS: {
  value: PlayType;
  label: string;
  icon: string;
  description: string;
}[] = [
  { value: "Run", label: "Run", icon: "🏃", description: "Running plays" },
  { value: "Pass", label: "Pass", icon: "🎯", description: "Passing plays" },
  { value: "RPO", label: "RPO", icon: "⚡", description: "Run-Pass Options" },
  { value: "Play Action", label: "Play Action", icon: "🎭", description: "Play action passes" },
  { value: "Screen", label: "Screen", icon: "🛡️", description: "Screen passes" },
  { value: "Special", label: "Special", icon: "✨", description: "Special teams plays" },
];

// Forward-looking standard install phase taxonomy (UI + future DB enum)
export const INSTALL_PHASES = [
  "install1",
  "install2",
  "install3",
  "situational",
  "gameplan",
] as const;
export type InstallPhase = (typeof INSTALL_PHASES)[number];

// =============================================
// PLAY ASSIGNMENTS
// =============================================

/**
 * Player tag in an assignment (for mentions/notifications)
 */
export interface PlayerTag {
  player_id: string; // UUID from team_players table
  player_name: string; // Display name
  position?: string; // Player's position (QB, WR, etc.)
}

/**
 * Individual position assignment for a play
 * Coaches write these, players read them
 */
export interface PlayAssignment {
  id: string; // UUID
  play_id: string; // UUID - references plays(id)
  playbook_id: string; // UUID - references playbooks(id)

  // Position and instruction
  position: string; // e.g., "QB", "RB", "X", "Y", "Z", "LT", etc.
  assignment_text: string | null; // The actual assignment/instruction

  // Tagging and categorization
  player_tags: PlayerTag[]; // Players mentioned in this assignment
  hashtags: string[]; // Hashtags for search/categorization

  // Shared play notes
  play_notes: string | null; // General notes for the entire play

  // Metadata
  created_by: string | null; // UUID - user who created
  updated_by: string | null; // UUID - user who last updated
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

/**
 * Position slot for the assignments editor
 * Includes both the position name and its assignment (if exists)
 */
export interface AssignmentPosition {
  position: string; // Position name from personnel (e.g., "QB", "X", "Y")
  assignment: PlayAssignment | null; // The assignment record, if exists
  order: number; // Display order in UI (0-10)
}

/**
 * Complete assignments state for a play
 * Used for loading/editing all positions at once
 */
export interface PlayAssignmentsState {
  play_id: string;
  playbook_id: string;
  positions: AssignmentPosition[]; // All 11 positions (from personnel)
  play_notes: string | null; // Shared across all positions
  has_changes: boolean; // Whether local changes exist (unsaved)
}
