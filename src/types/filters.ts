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

/**
 * Create filters from legacy advancedFilters format
 * Provides backward compatibility during migration
 */
export interface LegacyAdvancedFilter {
  id: string;
  field: string;
  operator: "equals" | "contains" | "in";
  value: string | string[];
  label?: string;
}

/** Map a single advanced filter to PlaybookFilters properties */
function applyAdvancedFilter(
  filters: PlaybookFilters,
  af: LegacyAdvancedFilter
): void {
  const value = Array.isArray(af.value) ? af.value[0] : af.value;

  switch (af.field) {
    case "playType":
    case "category":
      filters.playType = value || null;
      break;
    case "personnel":
      filters.personnel = value || null;
      break;
    case "situation":
      filters.situation = value || null;
      break;
    case "fieldPosition":
      filters.fieldPosition = value || null;
      break;
    case "down":
      filters.down = value || null;
      break;
    case "distance":
      filters.distance = value || null;
      break;
    case "tags":
      if (Array.isArray(af.value)) {
        filters.tags = af.value;
      } else if (af.value) {
        filters.tags = [af.value];
      }
      break;
  }
}

export function filtersFromLegacy(
  advancedFilters: LegacyAdvancedFilter[],
  search: string = "",
  selectedCategory?: string,
  _selectedSubcategory?: string
): PlaybookFilters {
  const filters: PlaybookFilters = { ...EMPTY_FILTERS, search };

  // Map legacy category/subcategory to playType
  if (selectedCategory) {
    // Categories like "Run", "Pass" map directly
    if (["Run", "Pass", "RPO", "Play Action"].includes(selectedCategory)) {
      filters.playType = selectedCategory;
    }
  }

  // Process advanced filters
  for (const af of advancedFilters) {
    applyAdvancedFilter(filters, af);
  }

  return filters;
}

/**
 * Advanced filter with required label (used by PlaybookContext)
 */
export interface ContextAdvancedFilter {
  id: string;
  field: string;
  operator: "equals" | "contains" | "in";
  value: string | string[];
  label: string;
}

/**
 * Convert modern filters back to legacy format (for backward compatibility)
 * Returns filters with required labels for use with PlaybookContext
 */
export function filtersToLegacy(
  filters: PlaybookFilters
): ContextAdvancedFilter[] {
  const legacy: ContextAdvancedFilter[] = [];

  if (filters.playType) {
    legacy.push({
      id: "playType",
      field: "playType",
      operator: "equals",
      value: filters.playType,
      label: filters.playType,
    });
  }

  if (filters.personnel) {
    legacy.push({
      id: "personnel",
      field: "personnel",
      operator: "equals",
      value: filters.personnel,
      label: `Personnel: ${filters.personnel}`,
    });
  }

  if (filters.situation) {
    legacy.push({
      id: "situation",
      field: "situation",
      operator: "equals",
      value: filters.situation,
      label: filters.situation,
    });
  }

  if (filters.fieldPosition) {
    legacy.push({
      id: "fieldPosition",
      field: "fieldPosition",
      operator: "equals",
      value: filters.fieldPosition,
      label: filters.fieldPosition,
    });
  }

  if (filters.down) {
    legacy.push({
      id: "down",
      field: "down",
      operator: "equals",
      value: filters.down,
      label: `Down: ${filters.down}`,
    });
  }

  if (filters.distance) {
    legacy.push({
      id: "distance",
      field: "distance",
      operator: "equals",
      value: filters.distance,
      label: `Distance: ${filters.distance}`,
    });
  }

  if (filters.tags.length > 0) {
    legacy.push({
      id: "tags",
      field: "tags",
      operator: "in",
      value: filters.tags,
      label: `Tags: ${filters.tags.join(", ")}`,
    });
  }

  return legacy;
}
