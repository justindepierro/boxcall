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
  | "formation_library" // Created directly in formation library
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
 * Matches database schema from 20251129110912_formation_personnel_library_system.sql
 */
export interface Formation {
  id: string;
  playbook_id: string;

  // Basic Info
  name: string;
  description: string | null;

  // Formation Metadata (Library System - NEW)
  formation_type: string | null; // "3x1", "2x2", "Empty", "I Formation", "Shotgun", etc.
  run_strength: StrengthType | null; // Default run strength: left, right, balanced
  pass_strength: StrengthType | null; // Default pass strength: left, right, balanced
  strength_player_position: string | null; // Position that sets strength: "TE", "H", "RB"

  // Optional classification / organization
  category?: FormationCategory | null;
  tags?: string[] | null;

  // Metadata completeness + creation tracking (may be absent in older rows)
  metadata_completeness?: number | null;
  creation_source?: FormationCreationSource | null;
  creation_context?: FormationCreationContext | null;
  version?: number | null;

  // Left/Right Variant System
  opposite_formation_id: string | null; // Direct link to opposite-side formation (left ↔ right)
  direction: FormationDirection; // "left", "right", or null (standalone)
  is_standalone: boolean; // TRUE if no opposite exists (Doubles, Empty, Trips)

  // Intelligence System (NEW)
  confidence_score: number; // 0-100 confidence from play analysis
  last_analyzed_at: string | null; // Timestamp of last intelligence run
  analysis_play_count: number; // Number of plays analyzed for metadata

  // Player Positions (JSONB in database)
  player_positions: FormationPlayerPosition[] | null; // Array of positions with x/y coords
  diagram_data: any | null; // Full diagram data (Pixi.js format)

  // Personnel Integration
  personnel_packages: string[]; // Array of personnel_configuration UUIDs
  personnel_name?: string | null; // Denormalized personnel name for display

  // Usage Tracking
  usage_count: number; // Number of plays using this formation
  metadata_quality: FormationMetadataQuality | null; // complete, needs_work, incomplete

  // Timestamps
  created_at: string;
  updated_at: string;
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
