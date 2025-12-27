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
 * Sort options for plays
 */
export type PlaySortOption =
  | "name_asc"
  | "name_desc"
  | "newest"
  | "oldest"
  | "most_used"
  | "confidence_high"
  | "confidence_low";

export const SORT_OPTIONS: { value: PlaySortOption; label: string }[] = [
  { value: "name_asc", label: "Name (A-Z)" },
  { value: "name_desc", label: "Name (Z-A)" },
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "most_used", label: "Most Used" },
  { value: "confidence_high", label: "Confidence (High)" },
  { value: "confidence_low", label: "Confidence (Low)" },
];

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

  /** Show only most-used plays (sorted by usage) - DEPRECATED: use sortBy instead */
  mostUsedOnly: boolean;

  /** Sort order for plays */
  sortBy: PlaySortOption;
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
  sortBy: "name_asc",
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
