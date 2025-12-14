import React from "react";
import { Button } from "../../../components/ui/Button/Button";
import { Icon } from "../../../components/ui/Icon";
import { SearchBar } from "../../../components/ui/SearchBar";
import { SortDropdown, type SortOption } from "../../../components/ui/SortDropdown";

const sortOptions: SortOption[] = [
  { id: "date-desc", label: "Newest First" },
  { id: "date-asc", label: "Oldest First" },
  { id: "name-asc", label: "Name (A-Z)" },
  { id: "name-desc", label: "Name (Z-A)" },
];

interface GamePlansSearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  onImportClick: () => void;
  onExportClick: () => void;
}

export const GamePlansSearchBar: React.FC<GamePlansSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  onImportClick,
  onExportClick,
}) => {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <SearchBar
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Search game plans by name or opponent..."
        className="w-full md:flex-1 md:max-w-2xl"
      />
      <div className="flex flex-col gap-3 sm:w-full sm:flex-row sm:items-center md:w-auto">
        <SortDropdown
          options={sortOptions}
          value={sortBy}
          onChange={onSortChange}
          className="w-full sm:w-auto"
        />
        <Button
          onClick={onImportClick}
          variant="secondary"
          size="sm"
          className="w-full sm:w-auto"
        >
          <Icon name="upload" className="h-4 w-4 mr-2" />
          Import
        </Button>
        <Button
          onClick={onExportClick}
          variant="secondary"
          size="sm"
          className="w-full sm:w-auto"
        >
          <Icon name="download" className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  );
};

GamePlansSearchBar.displayName = "GamePlansSearchBar";
