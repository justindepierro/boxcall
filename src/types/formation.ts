/**
 * Formation Types
 *
 * Fully integrated formation system with:
 * - Personnel linkage
 * - Left/Right variants
 * - Strength player tagging
 * - Player position storage
 */

/**
 * Formation category classification
 */
export type FormationCategory =
  | "spread"
  | "pro"
  | "power"
  | "special"
  | "goal_line"
  | "short_yardage";

/**
 * Formation direction (variant type)
 * - "left": Left-side formation (has right partner)
 * - "right": Right-side formation (has left partner)
 * - null: Standalone formation (no directional variant needed)
 */
export type FormationDirection = "left" | "right" | null;

/**
 * Formation type classification
 */
export type FormationType =
  | "I Formation"
  | "Singleback"
  | "Pistol"
  | "Shotgun"
  | "Empty"
  | "Trips"
  | "Bunch"
  | "Stack"
  | "Wing"
  | "Other";

/**
 * Formation strength (run/pass)
 */
export type StrengthType = "left" | "right" | "balanced";

/**
 * Player position within a formation
 *
 * Connects to personnel configuration labels
 */
export interface FormationPlayerPosition {
  position: string; // Position code: "X", "Y", "Z", "H", "F", "Q", "C", "G", "T", etc.
  x: number; // Field X coordinate (0-53.3 yards)
  y: number; // Field Y coordinate (0-50 yards)
  label?: string; // Personnel label: "Blue", "Black", "Green" (from personnel_configurations)
  isStrengthSetter?: boolean; // TRUE if this player sets the formation strength
  role?: string; // Player role: "WR", "TE", "RB", "QB", "OL", "FB"
  jerseyNumber?: string; // Optional jersey number for diagram
}

/**
 * Formation creation source (for telemetry and AI training)
 */
export type FormationCreationSource =
  | "play_builder" // Created while building a play (AddNewPlayModal)
  | "diagram_editor" // Created from diagram editor
  | "formation_library" // Created directly in formation library
  | "formation_builder" // Created via FormationBuilderModal
  | "bulk_import" // Imported from CSV/file
  | "api" // Created via API
  | "migration" // Created during data migration
  | "unknown"; // Legacy formations without source tracking

/**
 * Formation metadata quality classification
 */
export type FormationMetadataQuality =
  | "complete" // 100% complete
  | "good" // 75-99% complete
  | "needs_work" // 50-74% complete
  | "incomplete"; // <50% complete

/**
 * Formation creation context (additional telemetry)
 */
export interface FormationCreationContext {
  play_id?: string; // If created from play builder
  user_action?: string; // What action triggered creation
  incomplete_fields?: string[]; // List of fields that need completion
  source_version?: string; // App version when created
  [key: string]: unknown; // Allow additional context
}

/**
 * Complete Formation entity (database row)
 */
export interface Formation {
  id: string;
  playbook_id: string;

  // Basic Info
  name: string;
  description: string | null;
  category: FormationCategory | null;

  // Personnel Integration
  personnel_id: string | null; // References personnel_configurations.id
  personnel_name: string | null; // Denormalized: "11", "12", "21"
  personnel_packages: string[]; // Array of personnel_configuration IDs that can run this formation

  // Left/Right Variant System (Simplified)
  opposite_formation_id: string | null; // Direct link to opposite-side formation (left ↔ right)
  direction: FormationDirection; // "left", "right", or null (standalone)

  // Strength Player
  strength_player_position: string | null; // "X", "Y", "Z", "H", "F"
  strength_player_label: string | null; // "Blue", "Black", "Green"

  // Formation Metadata
  formation_type: FormationType | null; // Base formation type: I Formation, Shotgun, etc.
  run_strength: StrengthType; // Default run strength: left, right, balanced
  pass_strength: StrengthType; // Default pass strength: left, right, balanced

  // Player Positions
  player_positions: FormationPlayerPosition[];

  // Metadata
  tags: string[];
  is_custom: boolean;
  usage_count: number;

  // Creation Tracking (for AI/predictive features)
  creation_source: FormationCreationSource; // Where was this created from
  creation_context: FormationCreationContext; // Additional creation details
  metadata_completeness: number; // 0-100 score of metadata quality
  metadata_quality: FormationMetadataQuality; // Quality classification

  // Timestamps
  created_at: string;
  updated_at: string;
  created_by: string | null;

  // Optimistic locking (conflict resolution)
  version: number; // Incremented on each update to detect concurrent modifications
}

/**
 * Data for creating a new formation
 */
export interface FormationCreate {
  playbook_id: string;
  name: string;
  description?: string;
  category?: FormationCategory;
  personnel_id?: string;
  personnel_name?: string;
  personnel_packages?: string[];
  direction?: FormationDirection;
  opposite_formation_id?: string;
  strength_player_position?: string;
  strength_player_label?: string;
  formation_type?: FormationType;
  run_strength?: StrengthType;
  pass_strength?: StrengthType;
  player_positions: FormationPlayerPosition[];
  tags?: string[];
  is_custom?: boolean;
  // Creation tracking (optional, defaults in DB trigger)
  creation_source?: FormationCreationSource;
  creation_context?: FormationCreationContext;
}

/**
 * Data for updating a formation
 */
export interface FormationUpdate {
  name?: string;
  description?: string;
  category?: FormationCategory;
  personnel_id?: string;
  personnel_name?: string;
  personnel_packages?: string[];
  direction?: FormationDirection;
  opposite_formation_id?: string;
  strength_player_position?: string;
  strength_player_label?: string;
  formation_type?: FormationType;
  run_strength?: StrengthType;
  pass_strength?: StrengthType;
  player_positions?: FormationPlayerPosition[];
  tags?: string[];

  // NEW: Creation tracking (optional for updates)
  creation_source?: FormationCreationSource;
  creation_context?: FormationCreationContext;
}

/**
 * Formation with its variants (base + left + right)
 */
export interface FormationWithVariants {
  base: Formation;
  left?: Formation;
  right?: Formation;
}

/**
 * Formation list item (for UI display)
 */
export interface FormationListItem {
  id: string;
  name: string;
  category: FormationCategory | null;
  personnel_name: string | null;
  direction: FormationDirection;
  usage_count: number;
  has_variants: boolean;
  thumbnail?: string; // Optional SVG or image thumbnail
}

/**
 * Formation selector option (for dropdowns)
 */
export interface FormationOption {
  value: string; // formation ID
  label: string; // "Twins Same (Base)"
  category: FormationCategory | null;
  personnel: string | null;
  direction: FormationDirection;
  preview?: string; // Optional preview image
}

/**
 * Result from flipping a formation
 */
export interface FlipFormationResult {
  original: FormationPlayerPosition[];
  flipped: FormationPlayerPosition[];
  field_width: number;
}

/**
 * Formation template (for system defaults)
 */
export interface FormationTemplate {
  name: string;
  description: string;
  category: FormationCategory;
  suggested_personnel: string[]; // ["11", "12"]
  player_positions: FormationPlayerPosition[];
  tags: string[];
}

/**
 * Validation result for formation data
 */
export interface FormationValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
