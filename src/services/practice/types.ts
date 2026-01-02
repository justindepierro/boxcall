/**
 * Shared TypeScript interfaces for Practice domain services
 * Extracted from monolithic practiceService.ts
 */

import type { Play } from "../../types/play";
import type { PracticeScript as BasePracticeScript } from "../../types/practice";

// ============================================================================
// PRACTICE SCRIPT TYPES
// ============================================================================

/**
 * Extended Practice Script interface with workflow support
 */
export interface PracticeScript extends Partial<BasePracticeScript> {
  id: string;
  title?: string; // Optional for backward compatibility
  name?: string; // Alias for title
  description?: string;
  teamId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isTemplate: boolean;
  isArchived?: boolean; // Archive status
  plays?: PracticeScriptPlay[]; // Workflow-specific plays
  duration: number;
  tags?: string[];
}

/**
 * Practice Script Play - individual play within a script
 */
export interface PracticeScriptPlay {
  id: string;
  playId: string;
  play: Play;
  order: number;
  notes?: string;
  repetitions: number;
  estimatedTime?: number;
  // Game scenario configuration
  hash?: "left" | "middle" | "right";
  downDistance?: string; // e.g., "1st & 10", "3rd & 3"
  fieldPosition?: "plus_territory" | "red_zone" | "backed_up" | "midfield";
  defensiveFront?: "base" | "4-3" | "3-4" | "nickel" | "dime" | "bear" | "tite";
  coverage?:
    | "cover_0"
    | "cover_1"
    | "cover_2"
    | "cover_3"
    | "cover_4"
    | "cover_6"
    | "quarters"
    | "man";
  blitz?:
    | "none"
    | "edge"
    | "a_gap"
    | "b_gap"
    | "sim_pressure"
    | "zone_blitz"
    | "all_out";
  scenarioNotes?: string; // Additional context
  addedAt: Date;
}

/**
 * Data required to create a new practice script
 */
export interface CreatePracticeScriptData {
  name: string;
  description?: string;
  teamId: string;
  isTemplate?: boolean;
  tags?: string[];
}

/**
 * Data required to add a play to a practice script
 */
export interface AddPlayToPracticeScriptData {
  scriptId: string;
  playId: string;
  orderIndex?: number;
  notes?: string;
  repetitions?: number;
  estimatedTime?: number;
  // Game scenario configuration
  hash?: "left" | "middle" | "right";
  downDistance?: string;
  fieldPosition?: "plus_territory" | "red_zone" | "backed_up" | "midfield";
  defensiveFront?: "base" | "4-3" | "3-4" | "nickel" | "dime" | "bear" | "tite";
  coverage?:
    | "cover_0"
    | "cover_1"
    | "cover_2"
    | "cover_3"
    | "cover_4"
    | "cover_6"
    | "quarters"
    | "man";
  blitz?:
    | "none"
    | "edge"
    | "a_gap"
    | "b_gap"
    | "sim_pressure"
    | "zone_blitz"
    | "all_out";
  scenarioNotes?: string;
}

// ============================================================================
// PRACTICE TEMPLATE TYPES
// ============================================================================

/**
 * Practice Template - reusable practice configuration
 */
export interface PracticeTemplate {
  id: string;
  name: string;
  description?: string;
  teamId: string | null;
  duration: number | null;
  isPublic: boolean;
  createdBy: string | null;
  createdAt: Date;
  updatedAt?: Date;
  plays?: PracticeScriptPlay[];
}

/**
 * Data required to create a practice template
 */
export interface CreatePracticeTemplateData {
  name: string;
  description?: string;
  teamId: string;
  duration?: number;
  isPublic?: boolean;
  scriptId?: string; // If creating from existing script
}

// ============================================================================
// SEARCH & QUERY TYPES
// ============================================================================

/**
 * Search results across practice entities
 */
export interface PracticeSearchResult {
  schedules: any[]; // PracticeSchedule[] from practice types
  templates: PracticeTemplate[];
  scripts: any[]; // BasePracticeScript[]
}
