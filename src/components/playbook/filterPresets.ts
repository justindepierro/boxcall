import type { IconName } from "../ui/Icon/Icon";

export interface FilterPreset {
  id: string;
  label: string;
  icon: IconName;
  /** Group for organizing presets in UI */
  group?: "core" | "situational" | "personnel" | "analytics";
  filters: {
    field: string;
    operator: "equals" | "contains" | "in";
    value: string | string[];
  }[];
}

// Import the new unified filters type
import type { PlaybookFilters } from "../../types/filters";
import { EMPTY_FILTERS } from "../../types/filters";

/**
 * Convert a FilterPreset to the new unified PlaybookFilters format
 * This is the bridge between the preset system and the new filter state
 */
export function presetToFilters(preset: FilterPreset): PlaybookFilters {
  // Special cases that need custom handling
  if (preset.id === "all") {
    return { ...EMPTY_FILTERS };
  }

  if (preset.id === "favorites") {
    return { ...EMPTY_FILTERS, favoritesOnly: true };
  }

  if (preset.id === "most-used") {
    return { ...EMPTY_FILTERS, mostUsedOnly: true };
  }

  // Build filters from preset.filters array
  const filters: PlaybookFilters = { ...EMPTY_FILTERS };

  for (const f of preset.filters) {
    const value = Array.isArray(f.value) ? f.value[0] : f.value;

    switch (f.field) {
      case "playType":
      case "category":
        filters.playType = value;
        break;
      case "personnel":
        filters.personnel = value;
        break;
      case "situation":
        filters.situation = value;
        break;
      case "fieldPosition":
        filters.fieldPosition = value;
        break;
      case "down":
        filters.down = value;
        break;
      case "distance":
        filters.distance = value;
        break;
      case "tags":
        filters.tags = Array.isArray(f.value) ? f.value : [f.value];
        break;
      case "formation":
        // For formation filters like "empty", use as search term
        filters.search = value;
        break;
    }
  }

  return filters;
}

/**
 * ELITE QUICK PRESETS - Coach-centric filtering
 *
 * Organized by coaching workflow:
 * 1. Core: All, Favorites, Most Used (library management)
 * 2. Play Types: Run, Pass, RPO, Play Action (install organization)
 * 3. Situational: Down-distance combos, field position (game planning)
 * 4. Personnel: 11, 12, 21, 22 groupings (package management)
 */
export const QUICK_PRESETS: FilterPreset[] = [
  // ============ CORE (Library Management) ============
  {
    id: "all",
    label: "All Plays",
    icon: "grid",
    group: "core",
    filters: [],
  },
  {
    id: "favorites",
    label: "Favorites",
    icon: "star",
    group: "core",
    filters: [], // Handled specially in PlayGrid
  },
  {
    id: "most-used",
    label: "Most Used",
    icon: "trending-up",
    group: "core",
    filters: [], // Handled specially in PlayGrid with sorting
  },

  // ============ PLAY TYPES (Install Organization) ============
  {
    id: "run",
    label: "Run Plays",
    icon: "arrow-right",
    group: "core",
    filters: [{ field: "playType", operator: "equals", value: "Run" }],
  },
  {
    id: "pass",
    label: "Pass Plays",
    icon: "zap",
    group: "core",
    filters: [{ field: "playType", operator: "equals", value: "Pass" }],
  },
  {
    id: "rpo",
    label: "RPO Plays",
    icon: "repeat",
    group: "core",
    filters: [{ field: "playType", operator: "equals", value: "RPO" }],
  },
  {
    id: "playaction",
    label: "Play Action",
    icon: "move",
    group: "core",
    filters: [{ field: "playType", operator: "equals", value: "Play Action" }],
  },

  // ============ SITUATIONAL (Game Planning) ============
  {
    id: "redzone",
    label: "Red Zone",
    icon: "target",
    group: "situational",
    filters: [{ field: "fieldPosition", operator: "equals", value: "redzone" }],
  },
  {
    id: "goalline",
    label: "Goal Line",
    icon: "flag",
    group: "situational",
    filters: [
      { field: "fieldPosition", operator: "equals", value: "goalline" },
    ],
  },
  {
    id: "backedup",
    label: "Backed Up",
    icon: "alert-triangle",
    group: "situational",
    filters: [
      { field: "fieldPosition", operator: "equals", value: "backed_up" },
    ],
  },
  {
    id: "thirddown",
    label: "3rd Down",
    icon: "award",
    group: "situational",
    filters: [{ field: "down", operator: "equals", value: "3" }],
  },
  {
    id: "thirdshort",
    label: "3rd & Short",
    icon: "check-circle",
    group: "situational",
    filters: [
      { field: "down", operator: "equals", value: "3" },
      { field: "distance", operator: "equals", value: "short" },
    ],
  },
  {
    id: "thirdlong",
    label: "3rd & Long",
    icon: "clock",
    group: "situational",
    filters: [
      { field: "down", operator: "equals", value: "3" },
      { field: "distance", operator: "equals", value: "long" },
    ],
  },
  {
    id: "shortyardage",
    label: "Short Yardage",
    icon: "move",
    group: "situational",
    filters: [{ field: "distance", operator: "equals", value: "short" }],
  },
  {
    id: "2minute",
    label: "2-Minute",
    icon: "clock",
    group: "situational",
    filters: [{ field: "situation", operator: "contains", value: "2-minute" }],
  },

  // ============ PERSONNEL (Package Management) ============
  {
    id: "11personnel",
    label: "11 Personnel",
    icon: "users",
    group: "personnel",
    filters: [{ field: "personnel", operator: "contains", value: "11" }],
  },
  {
    id: "12personnel",
    label: "12 Personnel",
    icon: "users",
    group: "personnel",
    filters: [{ field: "personnel", operator: "contains", value: "12" }],
  },
  {
    id: "21personnel",
    label: "21 Personnel",
    icon: "users",
    group: "personnel",
    filters: [{ field: "personnel", operator: "contains", value: "21" }],
  },
  {
    id: "22personnel",
    label: "22 Personnel",
    icon: "users",
    group: "personnel",
    filters: [{ field: "personnel", operator: "contains", value: "22" }],
  },
  {
    id: "empty",
    label: "Empty Sets",
    icon: "maximize",
    group: "personnel",
    filters: [{ field: "formation", operator: "contains", value: "empty" }],
  },
];
