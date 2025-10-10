/**
 * Defensive Scheme Types
 * 
 * Types and interfaces for defensive formations, schemes, and positioning.
 */

import type { HashAlignment } from './formationTypes';

/**
 * Defensive scheme classification
 */
export type DefensiveSchemeType =
  | 'nickel-425'    // 4 DL, 2 LB, 5 DB (vs Spread)
  | 'base-43'       // 4 DL, 3 LB, 4 DB (base defense)
  | 'base-34'       // 3 DL, 4 LB, 4 DB (base defense)
  | 'dime-416'      // 4 DL, 1 LB, 6 DB (vs Empty)
  | 'goalline-623'  // 6 DL, 2 LB, 3 DB (goal line)
  | 'quarter-424'   // 4 DL, 2 LB, 5 DB (4 deep safeties)
  | 'bear-46'       // 4 DL, 3 LB, 4 DB (46 defense)
  | 'custom';       // User-defined

/**
 * Defensive player position designation
 */
export type DefensivePosition =
  | 'DE'   // Defensive End
  | 'DT'   // Defensive Tackle
  | 'NT'   // Nose Tackle
  | 'LB'   // Linebacker
  | 'MLB'  // Middle Linebacker
  | 'OLB'  // Outside Linebacker
  | 'CB'   // Cornerback
  | 'NCB'  // Nickelback
  | 'S'    // Safety
  | 'SS'   // Strong Safety
  | 'FS';  // Free Safety

/**
 * Defensive line technique/alignment
 */
export type DLineAlignment =
  | '0-tech'  // Head up on center
  | '1-tech'  // Inside shade of guard
  | '2-tech'  // Head up on guard
  | '2i-tech' // Inside shade of guard (A gap)
  | '3-tech'  // Outside shade of guard
  | '4-tech'  // Head up on tackle
  | '4i-tech' // Inside shade of tackle
  | '5-tech'  // Outside shade of tackle
  | '6-tech'  // Head up on tight end
  | '7-tech'  // Inside shade of tight end
  | '9-tech'; // Wide outside (wide 9)

/**
 * Linebacker alignment type
 */
export type LBAlignment =
  | 'over-guard'    // Directly over guard
  | 'over-tackle'   // Directly over tackle
  | 'over-center'   // Directly over center
  | 'a-gap'         // In A gap
  | 'b-gap'         // In B gap
  | 'c-gap'         // In C gap
  | 'scrape'        // Scrape exchange position
  | 'stack';        // Stacked behind DL

/**
 * Secondary coverage type
 */
export type CoverageType =
  | 'cover-0'   // Man, no help
  | 'cover-1'   // Man with 1 deep safety
  | 'cover-2'   // 2 deep safeties, 5 under
  | 'cover-3'   // 3 deep, 4 under
  | 'cover-4'   // Quarters (4 deep)
  | 'cover-6'   // Quarter-quarter-half
  | 'match'     // Pattern match
  | 'robber'    // Robber coverage
  | 'tampa-2';  // Tampa 2

/**
 * Position coordinates and designation
 */
export interface DefensivePlayerPosition {
  /** Position label (DE, DT, LB, etc.) */
  position: DefensivePosition;
  
  /** X coordinate (yards from left sideline) */
  x: number;
  
  /** Y coordinate (yards from goal line) */
  y: number;
  
  /** DL alignment technique (if applicable) */
  technique?: DLineAlignment;
  
  /** LB alignment (if applicable) */
  alignment?: LBAlignment;
  
  /** Coverage responsibility (if DB) */
  coverage?: string;
}

/**
 * Complete defensive scheme template
 */
export interface DefensiveScheme {
  /** Scheme identifier */
  type: DefensiveSchemeType;
  
  /** Human-readable name */
  name: string;
  
  /** Short description */
  description: string;
  
  /** Player positions (11 total) */
  positions: DefensivePlayerPosition[];
  
  /** Primary coverage type */
  coverage: CoverageType;
  
  /** Best used against what offensive formation types */
  bestAgainst: string[];
  
  /** Number of players in each level */
  personnel: {
    defensiveLine: number;
    linebackers: number;
    defensiveBacks: number;
  };
}

/**
 * Field boundary information
 */
export interface FieldBoundaryInfo {
  /** Current hash position */
  hash: HashAlignment;
  
  /** Which side is the field (wide side) */
  fieldSide: 'left' | 'right' | 'balanced';
  
  /** Which side is the boundary (short side) */
  boundarySide: 'left' | 'right' | 'balanced';
  
  /** Width of field side in yards */
  fieldWidth: number;
  
  /** Width of boundary side in yards */
  boundaryWidth: number;
  
  /** Center X position */
  centerX: number;
}

/**
 * Coverage adjustment instructions
 */
export interface CoverageAdjustment {
  /** NCB alignment side */
  nickelbackSide: 'left' | 'right' | 'strength' | 'field';
  
  /** Safety rotation */
  safetyRotation: 'balanced' | 'rotate-to-strength' | 'rotate-to-field';
  
  /** Corner depth adjustments */
  cornerDepth: {
    left: number;  // yards from LOS
    right: number; // yards from LOS
  };
  
  /** Should defense bump to strength? */
  bumpToStrength: boolean;
}

/**
 * Front adjustment instructions
 */
export interface FrontAdjustment {
  /** DT shade direction */
  dtShade: 'left' | 'right' | 'away-from-strength';
  
  /** DE positioning */
  deAlignment: {
    left: DLineAlignment;
    right: DLineAlignment;
  };
  
  /** LB slide direction */
  lbSlide: 'left' | 'right' | 'balanced' | 'to-strength';
  
  /** Tighten to TE? */
  tightenToTE: boolean;
}
