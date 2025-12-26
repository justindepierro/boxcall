/**
 * Unified Playbook Filters
 *
 * Single, simple interface for all play filtering.
 * Replaces the scattered filter state (advancedFilters, selectedCategory, selectedSubcategory)
 * with one cohesive object.
 *
 * Part of Phase 3: Unified Filtering (Playbook Data Unification Roadmap)
 */

/**
 * Core filter interface - all filtering flows through this shape
 */
export interface PlaybookFilters {
  /** Free-text search across play name, formation, notes */
  search: string;

  /** Play type: Pass, Run, RPO, Play Action */
  playType: string | null;

  /** Personnel grouping: 11, 12, 21, 22, etc. */
  personnel: string | null;

  /** Game situation: 2-minute, 4-minute, openers, etc. */
  situation: string | null;

  /** Field position zone: redzone, goalline, backed_up, plus_territory */
  fieldPosition: string | null;

  /** Down preference: 1st, 2nd, 3rd, 4th */
  down: string | null;

  /** Distance bucket: short, medium, long */
  distance: string | null;

  /** Tags/flags to include */
  tags: string[];

  /** Show only favorited plays */
  favoritesOnly: boolean;

  /** Show only most-used plays (sorted by usage) */
  mostUsedOnly: boolean;
}

/**
 * Default/empty filter state
 */
export const EMPTY_FILTERS: PlaybookFilters = {
  search: "",
  playType: null,
  personnel: null,
  situation: null,
  fieldPosition: null,
  down: null,
  distance: null,
  tags: [],
  favoritesOnly: false,
  mostUsedOnly: false,
};

/**
 * Check if any filters are active
 */
export function hasActiveFilters(filters: PlaybookFilters): boolean {
  return (
    filters.search.trim().length > 0 ||
    filters.playType !== null ||
    filters.personnel !== null ||
    filters.situation !== null ||
    filters.fieldPosition !== null ||
    filters.down !== null ||
    filters.distance !== null ||
    filters.tags.length > 0 ||
    filters.favoritesOnly ||
    filters.mostUsedOnly
  );
}
