import type { PlaybookFilters } from "../../../types/filters";
import type { FilterChip } from "./types";

/**
 * Derive displayable filter chips from unified PlaybookFilters
 * These are for UI rendering only - the source of truth is PlaybookFilters
 */
export function getFilterChips(filters: PlaybookFilters): FilterChip[] {
  const chips: FilterChip[] = [];

  if (filters.playType) {
    chips.push({
      id: "playType",
      field: "playType",
      label: `Type: ${filters.playType}`,
    });
  }

  if (filters.personnel) {
    chips.push({
      id: "personnel",
      field: "personnel",
      label: `Personnel: ${filters.personnel}`,
    });
  }

  if (filters.situation) {
    chips.push({
      id: "situation",
      field: "situation",
      label: `Situation: ${filters.situation}`,
    });
  }

  if (filters.fieldPosition) {
    chips.push({
      id: "fieldPosition",
      field: "fieldPosition",
      label: `Field: ${filters.fieldPosition}`,
    });
  }

  if (filters.down) {
    chips.push({
      id: "down",
      field: "down",
      label: `Down: ${filters.down}`,
    });
  }

  if (filters.distance) {
    chips.push({
      id: "distance",
      field: "distance",
      label: `Distance: ${filters.distance}`,
    });
  }

  if (filters.tags.length > 0) {
    chips.push({
      id: "tags",
      field: "tags",
      label: `Tags: ${filters.tags.join(", ")}`,
    });
  }

  return chips;
}

/**
 * Remove a specific filter field from PlaybookFilters
 */
export function removeFilterField(
  filters: PlaybookFilters,
  field: string
): PlaybookFilters {
  const updated = { ...filters };
  switch (field) {
    case "playType":
      updated.playType = null;
      break;
    case "personnel":
      updated.personnel = null;
      break;
    case "situation":
      updated.situation = null;
      break;
    case "fieldPosition":
      updated.fieldPosition = null;
      break;
    case "down":
      updated.down = null;
      break;
    case "distance":
      updated.distance = null;
      break;
    case "tags":
      updated.tags = [];
      break;
  }
  return updated;
}

/**
 * Add a filter value to PlaybookFilters
 */
export function addFilterField(
  filters: PlaybookFilters,
  field: string,
  value: string
): PlaybookFilters {
  const updated = { ...filters };
  switch (field) {
    case "playType":
    case "category":
      updated.playType = value;
      break;
    case "personnel":
      updated.personnel = value;
      break;
    case "situation":
      updated.situation = value;
      break;
    case "fieldPosition":
      updated.fieldPosition = value;
      break;
    case "down":
      updated.down = value;
      break;
    case "distance":
      updated.distance = value;
      break;
    case "tags":
      // Append to existing tags
      updated.tags = [...updated.tags, value];
      break;
    case "name":
    case "formation":
    case "description":
      // Text search fields append to search
      updated.search = value;
      break;
  }
  return updated;
}
