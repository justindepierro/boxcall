import type { PlaybookFilters } from "../../../types/filters";

/**
 * Display chip for an active filter (derived from PlaybookFilters)
 * Used only for rendering - not for data storage
 */
export interface FilterChip {
  id: string;
  field: string;
  label: string;
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterField {
  value: string;
  label: string;
  type: "text" | "number" | "date" | "select";
  options?: FilterOption[];
}

export type NewFilterState = {
  field: string;
  operator: "equals" | "contains" | "in";
  value: string;
};

export interface AdvancedFiltersProps {
  /** Current unified filter state */
  filters: PlaybookFilters;
  /** Callback when filters change */
  onFiltersChange: (filters: PlaybookFilters) => void;
}
