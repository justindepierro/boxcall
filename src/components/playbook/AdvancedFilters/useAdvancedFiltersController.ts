import { useState, useMemo, useEffect, useCallback } from "react";
import { useDebouncedCallback } from "use-debounce";
import type { PlaybookFilters } from "../../../types/filters";
import { EMPTY_FILTERS, hasActiveFilters } from "../../../types/filters";
import { presetToFilters } from "../filterPresets";
import type { FilterPreset } from "../filterPresets";
import {
  readLocalString,
  readLocalJson,
  storageKeys,
  writeLocalString,
  writeLocalJson,
} from "../../../utils/storage";
import { FILTER_FIELDS } from "./constants";
import { getFilterChips, removeFilterField, addFilterField } from "./helpers";
import type { AdvancedFiltersProps, NewFilterState } from "./types";

/**
 * Storage key for persisted filters (per-team basis would be better but keeping simple)
 */
const FILTERS_STORAGE_KEY = "bc_playbook_filters_v1";

/**
 * Load persisted filters from localStorage
 */
function loadPersistedFilters(): PlaybookFilters | null {
  try {
    const saved = readLocalJson<PlaybookFilters>(FILTERS_STORAGE_KEY);
    if (saved && typeof saved === "object") {
      // Validate basic structure
      if ("search" in saved && "tags" in saved) {
        return {
          ...EMPTY_FILTERS,
          ...saved,
          // Ensure tags is always an array
          tags: Array.isArray(saved.tags) ? saved.tags : [],
        };
      }
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

/**
 * Save filters to localStorage for persistence
 */
function savePersistedFilters(filters: PlaybookFilters): void {
  writeLocalJson(FILTERS_STORAGE_KEY, filters);
}

/**
 * Hook for managing advanced filters controller state
 */
export function useAdvancedFiltersController({
  filters,
  onFiltersChange,
}: AdvancedFiltersProps) {
  const [showAddFilter, setShowAddFilter] = useState(false);
  // Advanced filters collapsed by default, load from localStorage for user preference
  const [showAdvanced, setShowAdvanced] = useState(() => {
    const saved = readLocalString(storageKeys.playbook.advancedFiltersExpanded);
    return saved === "true";
  });

  // Load persisted filters on mount (only once)
  const [hasLoadedPersisted, setHasLoadedPersisted] = useState(false);
  useEffect(() => {
    if (hasLoadedPersisted) return;

    const persisted = loadPersistedFilters();
    if (persisted && hasActiveFilters(persisted)) {
      // Only restore if there are active filters
      onFiltersChange(persisted);
    }
    setHasLoadedPersisted(true);
  }, [hasLoadedPersisted, onFiltersChange]);

  // Persist filters when they change (debounced to avoid excessive writes)
  const debouncedPersist = useDebouncedCallback(
    (filtersToSave: PlaybookFilters) => {
      savePersistedFilters(filtersToSave);
    },
    500
  );

  // Save filters to localStorage whenever they change
  useEffect(() => {
    if (hasLoadedPersisted) {
      debouncedPersist(filters);
    }
  }, [filters, hasLoadedPersisted, debouncedPersist]);

  // Derive active preset from current filters
  const activePresetId = useMemo(() => {
    if (filters.favoritesOnly) return "favorites";
    if (filters.mostUsedOnly) return "most-used";
    if (!hasActiveFilters(filters)) return "all";
    // For other filters, no preset matches
    return "";
  }, [filters]);

  const [newFilter, setNewFilter] = useState<NewFilterState>({
    field: "",
    operator: "equals",
    value: "",
  });

  // Derive filter chips from unified filters
  const filterChips = useMemo(() => getFilterChips(filters), [filters]);

  // 🚀 PERFORMANCE: Debounce filter changes to prevent lag during typing (150ms)
  const debouncedFilterChange = useDebouncedCallback(
    (newFilters: PlaybookFilters) => {
      onFiltersChange(newFilters);
    },
    150
  );

  const selectedField = FILTER_FIELDS.find((f) => f.value === newFilter.field);

  const handlePresetSelect = useCallback(
    (preset: FilterPreset) => {
      // Use presetToFilters for unified conversion
      const newFilters = presetToFilters(preset);
      onFiltersChange(newFilters);
    },
    [onFiltersChange]
  );

  const resetNewFilter = useCallback(() => {
    setNewFilter({ field: "", operator: "equals", value: "" });
  }, []);

  const addFilter = useCallback(() => {
    if (!newFilter.field || !newFilter.value) return;

    const field = FILTER_FIELDS.find((f) => f.value === newFilter.field);
    if (!field) return;

    // Add to unified filters
    const updatedFilters = addFilterField(
      filters,
      newFilter.field,
      newFilter.value
    );

    // Use debounced version for smooth typing experience
    debouncedFilterChange(updatedFilters);
    resetNewFilter();
    setShowAddFilter(false);
  }, [newFilter, filters, debouncedFilterChange, resetNewFilter]);

  const removeFilter = useCallback(
    (chipId: string) => {
      // chipId is the field name (e.g., "playType", "personnel")
      const updatedFilters = removeFilterField(filters, chipId);
      // Instant removal (no need to debounce deletions)
      onFiltersChange(updatedFilters);
    },
    [filters, onFiltersChange]
  );

  const clearAllFilters = useCallback(() => {
    // Instant clear - reset to empty
    onFiltersChange({ ...EMPTY_FILTERS });
  }, [onFiltersChange]);

  const startAddFilter = useCallback(() => setShowAddFilter(true), []);

  const cancelAddFilter = useCallback(() => {
    setShowAddFilter(false);
    resetNewFilter();
  }, [resetNewFilter]);

  const setField = useCallback((field: string) => {
    setNewFilter((prev) => ({ ...prev, field, operator: "equals", value: "" }));
  }, []);

  const setValue = useCallback((value: string) => {
    setNewFilter((prev) => ({ ...prev, value }));
  }, []);

  const toggleDesktopExpanded = useCallback(() => {
    const next = !showAdvanced;
    setShowAdvanced(next);
    // Save user preference
    writeLocalString(
      storageKeys.playbook.advancedFiltersExpanded,
      String(next)
    );
  }, [showAdvanced]);

  return {
    showAdvanced,
    setShowAdvanced,
    toggleDesktopExpanded,
    showAddFilter,
    setShowAddFilter,
    startAddFilter,
    cancelAddFilter,
    activePresetId,
    handlePresetSelect,
    newFilter,
    setField,
    setValue,
    selectedField,
    addFilter,
    removeFilter,
    clearAllFilters,
    filterChips,
  };
}
