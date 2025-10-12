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
  | 'spread' 
  | 'pro' 
  | 'power' 
  | 'special' 
  | 'goal_line' 
  | 'short_yardage';

/**
 * Formation direction (variant type)
 */
export type FormationDirection = 'base' | 'left' | 'right';

/**
 * Player position within a formation
 * 
 * Connects to personnel configuration labels
 */
export interface FormationPlayerPosition {
  position: string;           // Position code: "X", "Y", "Z", "H", "F", "Q", "C", "G", "T", etc.
  x: number;                  // Field X coordinate (0-53.3 yards)
  y: number;                  // Field Y coordinate (0-50 yards)
  label?: string;             // Personnel label: "Blue", "Black", "Green" (from personnel_configurations)
  isStrengthSetter?: boolean; // TRUE if this player sets the formation strength
  role?: string;              // Player role: "WR", "TE", "RB", "QB", "OL", "FB"
  jerseyNumber?: string;      // Optional jersey number for diagram
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
  personnel_id: string | null;           // References personnel_configurations.id
  personnel_name: string | null;         // Denormalized: "11", "12", "21"
  personnel_packages: string[];          // Array of personnel_configuration IDs that can run this formation
  
  // Left/Right Variant System
  base_formation_id: string | null;      // NULL = this IS the base formation
  direction: FormationDirection;
  
  // Strength Player
  strength_player_position: string | null;  // "X", "Y", "Z", "H", "F"
  strength_player_label: string | null;     // "Blue", "Black", "Green"
  
  // Player Positions
  player_positions: FormationPlayerPosition[];
  
  // Metadata
  tags: string[];
  is_custom: boolean;
  usage_count: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  created_by: string | null;
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
  base_formation_id?: string;
  strength_player_position?: string;
  strength_player_label?: string;
  player_positions: FormationPlayerPosition[];
  tags?: string[];
  is_custom?: boolean;
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
  strength_player_position?: string;
  strength_player_label?: string;
  player_positions?: FormationPlayerPosition[];
  tags?: string[];
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
  value: string;        // formation ID
  label: string;        // "Twins Same (Base)"
  category: FormationCategory | null;
  personnel: string | null;
  direction: FormationDirection;
  preview?: string;     // Optional preview image
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
  suggested_personnel: string[];  // ["11", "12"]
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
