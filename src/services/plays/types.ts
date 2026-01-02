/**
 * Shared TypeScript interfaces for Plays domain services
 * Extracted from monolithic playsService.ts
 */

import type { Play } from "../../types/play";
import type { FuseResultMatch } from "fuse.js";

// ============================================================================
// SEARCH & FILTER TYPES
// ============================================================================

/**
 * Search result with fuzzy matching metadata
 */
export interface SearchResult<T> {
  item: T;
  score?: number;
  matches?: readonly FuseResultMatch[];
}

/**
 * Quick filter definition for common play situations
 */
export interface QuickFilter {
  id: string;
  label: string;
  description: string;
  filter: (play: Play) => boolean;
  color: "red" | "blue" | "green" | "orange" | "purple";
  icon: string;
}

/**
 * Search preset combining query + filters
 */
export interface SearchPreset {
  id: string;
  name: string;
  query: string;
  filters: string[];
  description: string;
}

// ============================================================================
// CRUD TYPES
// ============================================================================

/**
 * Options for paginated play queries
 */
export interface PlayQueryOptions {
  limit?: number;
  offset?: number;
}

/**
 * Result of merging multiple playbooks
 */
export interface MergePlaybooksResult {
  playbookId: string;
  playCount: number;
}
