/**
 * Unified Diagram System Types
 *
 * Single source of truth for all diagram data models:
 * - Formations (player positioning)
 * - Plays (formations + routes + assignments)
 * - Routes (path definitions)
 * - Diagrams (canvas state)
 */

import type { FieldPosition, RouteType } from "./field";

// ============================================================================
// CORE DIAGRAM TYPES
// ============================================================================

/** Unified diagram data that works across all diagram types */
export interface UnifiedDiagramData {
  id: string;
  type: DiagramType;
  name: string;
  description?: string;

  // Formation data (always present)
  formation: FormationData;

  // Play-specific data (optional)
  playData?: PlayData;

  // Canvas metadata
  canvas: CanvasMetadata;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

/** Diagram type classification */
export type DiagramType = "formation" | "play" | "template";

/** Canvas viewport and zoom state */
export interface CanvasMetadata {
  zoom: number;
  panX: number;
  panY: number;
  width: number;
  height: number;
}

// ============================================================================
// FORMATION SYSTEM
// ============================================================================

/** Formation data structure */
export interface FormationData {
  id: string;
  name: string;
  category: FormationCategory;
  type: FormationType;
  direction: FormationDirection;
  strength: StrengthType;

  // Personnel (11, 12, 21, etc.)
  personnel: PersonnelGrouping;

  // Player positions
  players: FormationPlayer[];

  // Metadata
  tags?: string[];
  notes?: string;
}

/** Formation category */
export type FormationCategory =
  | "spread"
  | "pro"
  | "power"
  | "special"
  | "goal_line"
  | "short_yardage";

/** Formation type */
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

/** Formation direction */
export type FormationDirection = "left" | "right" | null;

/** Formation strength */
export type StrengthType = "left" | "right" | "balanced";

/** Personnel grouping (RB-TE) */
export interface PersonnelGrouping {
  rb: number; // Running backs
  te: number; // Tight ends
  wr: number; // Wide receivers
  // Total should always be 5 skill players (RB + TE + WR)
}

/** Individual player in formation */
export interface FormationPlayer {
  id: string;
  playerPosition: PlayerPosition; // QB, RB, WR, etc.
  role: PlayerRole;
  fieldPosition: FieldPosition; // X, Y coordinates on field

  // Visual properties
  label: string; // X, Y, Z, H, Q, etc.
  color?: string;

  // Assignment data (for plays)
  assignment?: PlayerAssignment;

  // Motion path (optional)
  motion?: MotionPath;
}

/** Player position classification */
export type PlayerPosition =
  | "QB"
  | "RB"
  | "FB"
  | "TB"
  | "TE"
  | "LT"
  | "LG"
  | "C"
  | "RG"
  | "RT"
  | "WR"
  | "SLOT"
  | "SE"
  | "FL"
  | "X"
  | "Y"
  | "Z"
  | "H"
  | "OTHER";

/** Player role in formation */
export type PlayerRole =
  | "quarterback"
  | "running_back"
  | "fullback"
  | "tight_end"
  | "wide_receiver"
  | "slot_receiver"
  | "split_end"
  | "flanker"
  | "offensive_line"
  | "other";

// ============================================================================
// PLAY SYSTEM
// ============================================================================

/** Play-specific data layered on top of formation */
export interface PlayData {
  id: string;
  name: string;
  category: PlayCategory;
  formationId: string; // Links to formation

  // Routes and assignments
  routes: Route[];
  assignments: PlayerAssignment[];

  // Play metadata
  down?: number; // 1-4
  distance?: number; // yards to go
  fieldPosition?: number; // yards from own goal
  hash?: "left" | "right" | "middle";

  // Protection and blocking
  protection?: ProtectionScheme;
  blocking?: BlockingAssignment[];

  // Tags and notes
  tags?: string[];
  notes?: string;
}

/** Play category */
export type PlayCategory =
  | "run"
  | "pass"
  | "play_action"
  | "screen"
  | "trick"
  | "special";

/** Route definition */
export interface Route {
  id: string;
  playerId: string; // Links to formation player
  type: RouteType; // primary, hot, check

  // Route path
  path: FieldPosition[]; // Control points

  // Route metadata
  name?: string; // Slant, Post, Go, etc.
  depth?: number; // Break point depth
  direction?: number; // Angle in degrees

  // Visual properties
  color?: string;
  style?: "solid" | "dashed" | "dotted";
}

/** Player assignment in play */
export interface PlayerAssignment {
  playerId: string;
  primaryRoute?: string; // Route ID
  hotRoute?: string; // Alternative route ID
  checkRoute?: string; // Check route ID

  // Blocking assignments
  blockTarget?: string; // Player/zone to block

  // Protection responsibilities
  protection?: ProtectionRole;
}

/** Protection scheme */
export interface ProtectionScheme {
  type: "man" | "zone" | "slide" | "sprint";
  strength: "left" | "right" | "balanced";
  hotRoutes: string[]; // Route IDs that trigger protection changes
}

/** Blocking assignment */
export interface BlockingAssignment {
  blockerId: string;
  target: string; // Who to block
  technique: string; // Zone, reach, double-team, etc.
}

/** Protection role */
export type ProtectionRole =
  | "pass_protect"
  | "pull"
  | "chip_block"
  | "hot_route_protect";

// ============================================================================
// MOTION & MOVEMENT
// ============================================================================

/** Motion path for players */
export interface MotionPath {
  startPosition: FieldPosition;
  endPosition: FieldPosition;
  path: FieldPosition[]; // Control points
  timing: MotionTiming;
}

/** Motion timing */
export interface MotionTiming {
  snapOffset: number; // Yards from LOS when motion starts
  speed: "slow" | "normal" | "fast";
  direction: "left" | "right" | "across";
}

// ============================================================================
// DIAGRAM OPERATIONS & STATE
// ============================================================================

/** Diagram editor mode */
export type DiagramMode =
  | "formation_edit"
  | "play_edit"
  | "route_draw"
  | "assignment_edit"
  | "view";

/** Diagram operation result */
export interface DiagramOperationResult {
  success: boolean;
  data?: UnifiedDiagramData;
  error?: string;
  warnings?: string[];
}

/** Diagram validation result */
export interface DiagramValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/** Validation error */
export interface ValidationError {
  type: "formation" | "play" | "route" | "assignment";
  message: string;
  playerId?: string;
  routeId?: string;
}

/** Validation warning */
export interface ValidationWarning {
  type: "formation" | "play" | "route" | "assignment";
  message: string;
  suggestion?: string;
}

// ============================================================================
// EXPORT & SERIALIZATION
// ============================================================================

/** Export format options */
export type ExportFormat = "csv" | "pdf" | "png" | "json";

/** Export configuration */
export interface ExportConfig {
  format: ExportFormat;
  includeRoutes: boolean;
  includeAssignments: boolean;
  includeLabels: boolean;
  scale: number;
  quality: "draft" | "standard" | "high";
}

/** CSV export data */
export interface CsvExportData {
  formation: string;
  personnel: string;
  player: string;
  position: string;
  assignment: string;
  route: string;
  wristbandNumber?: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/** Diagram creation options */
export interface CreateDiagramOptions {
  type: DiagramType;
  name: string;
  baseFormation?: FormationData;
  template?: UnifiedDiagramData;
}

/** Diagram update operation */
export interface DiagramUpdate {
  type:
    | "add_player"
    | "move_player"
    | "delete_player"
    | "add_route"
    | "update_route"
    | "delete_route"
    | "update_assignment"
    | "update_metadata";
  data: any;
}

/** Search and filter options */
export interface DiagramSearchOptions {
  type?: DiagramType;
  category?: FormationCategory | PlayCategory;
  personnel?: string; // "11", "12", etc.
  tags?: string[];
  query?: string;
}

// ============================================================================
// LEGACY COMPATIBILITY (for migration)
// ============================================================================

/** Legacy formation player position (for migration) */
export interface LegacyFormationPlayerPosition {
  position: string;
  x: number;
  y: number;
  role?: string;
}

/** Legacy play diagram data (for migration) */
export interface LegacyPlayDiagram {
  players: LegacyFormationPlayerPosition[];
  routes?: any[];
  assignments?: any[];
}
