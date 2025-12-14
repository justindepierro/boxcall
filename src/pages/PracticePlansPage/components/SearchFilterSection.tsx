/**
 * SearchFilterSection Component
 *
 * Search bar, filters, and sort controls for practice scripts
 */

import React from "react";
import { Button } from "../../../components/ui/Button/Button";
import { Icon } from "../../../components/ui/Icon";
import { SearchBar } from "../../../components/ui/SearchBar";
import { FilterChips } from "../../../components/ui/FilterChips";
import { SortDropdown } from "../../../components/ui/SortDropdown";
import { getFilterOptions, SORT_OPTIONS } from "../types";

interface SearchFilterSectionProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeFilters: string[];
  onToggleFilter: (filterId: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  onOpenImportModal: () => void;
  onExportScripts: () => void;
}

export const SearchFilterSection: React.FC<SearchFilterSectionProps> = ({
  searchQuery,
  onSearchChange,
  activeFilters,
  onToggleFilter,
  sortBy,
  onSortChange,
  onOpenImportModal,
  onExportScripts,
}) => {
  const filterOptions = getFilterOptions(activeFilters);

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search scripts..."
          className="w-full sm:flex-1 sm:max-w-2xl"
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            onClick={onOpenImportModal}
            variant="secondary"
            size="sm"
            className="w-full sm:w-auto"
          >
            <Icon name="upload" className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button
            onClick={onExportScripts}
            variant="secondary"
            size="sm"
            className="w-full sm:w-auto"
          >
            <Icon name="download" className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <FilterChips chips={filterOptions} onToggle={onToggleFilter} />
        <SortDropdown
          options={SORT_OPTIONS}
          value={sortBy}
          onChange={onSortChange}
          className="w-full sm:w-auto"
        />
      </div>
    </div>
  );
};

SearchFilterSection.displayName = "SearchFilterSection";
