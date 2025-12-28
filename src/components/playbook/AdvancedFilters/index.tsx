import React from "react";
import { useIsMobile } from "../../../hooks/useBreakpoint";
import { AdvancedFiltersMobile } from "./AdvancedFiltersMobile";
import { AdvancedFiltersDesktop } from "./AdvancedFiltersDesktop";
import { useAdvancedFiltersController } from "./useAdvancedFiltersController";
import type { AdvancedFiltersProps } from "./types";

/**
 * AdvancedFilters - Unified filter component for Playbook
 *
 * Features:
 * - Responsive: Uses mobile bottom sheet or desktop panel
 * - Filter persistence: Remembers filters across sessions via localStorage
 * - Collapsed by default: Desktop advanced filters start collapsed
 * - Quick presets: All, Favorites, Most Used, etc.
 * - Custom filters: Add field-based filters
 *
 * @example
 * ```tsx
 * <AdvancedFilters
 *   filters={state.filters}
 *   onFiltersChange={(filters) => dispatch({ type: "SET_FILTERS", filters })}
 * />
 * ```
 */
export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const isMobile = useIsMobile();
  const controller = useAdvancedFiltersController({
    filters,
    onFiltersChange,
  });

  if (isMobile) {
    return (
      <AdvancedFiltersMobile
        filterChips={controller.filterChips}
        showAdvanced={controller.showAdvanced}
        setShowAdvanced={controller.setShowAdvanced}
        activePresetId={controller.activePresetId}
        handlePresetSelect={controller.handlePresetSelect}
        showAddFilter={controller.showAddFilter}
        startAddFilter={controller.startAddFilter}
        cancelAddFilter={controller.cancelAddFilter}
        newFilter={controller.newFilter}
        setField={controller.setField}
        setValue={controller.setValue}
        selectedField={controller.selectedField}
        addFilter={controller.addFilter}
        removeFilter={controller.removeFilter}
        clearAllFilters={controller.clearAllFilters}
      />
    );
  }

  return (
    <AdvancedFiltersDesktop
      filterChips={controller.filterChips}
      showAdvanced={controller.showAdvanced}
      toggleDesktopExpanded={controller.toggleDesktopExpanded}
      activePresetId={controller.activePresetId}
      handlePresetSelect={controller.handlePresetSelect}
      showAddFilter={controller.showAddFilter}
      startAddFilter={controller.startAddFilter}
      cancelAddFilter={controller.cancelAddFilter}
      newFilter={controller.newFilter}
      setField={controller.setField}
      setValue={controller.setValue}
      selectedField={controller.selectedField}
      addFilter={controller.addFilter}
      removeFilter={controller.removeFilter}
      clearAllFilters={controller.clearAllFilters}
    />
  );
};

// Re-export types for convenience
export type { AdvancedFiltersProps } from "./types";

// Note: For FILTER_FIELDS constant, import from:
// import { FILTER_FIELDS } from "./AdvancedFilters/constants";

export default AdvancedFilters;
