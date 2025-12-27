/**
 * PlayListHeader Component
 * Renders the header with play count, search, sort, bulk selection, and view controls
 */

import React from "react";
import { Icon } from "../../../ui/Icon/Icon";
import { IconButton } from "../../../ui";
import { Typography } from "../../../design-system/Typography";
import { UniversalSearch } from "../../../ui/UniversalSearch";
import { SortDropdown } from "../../page/SortDropdown";
import type { Play } from "../../../../types/play";
import type { PlaySortOption } from "../../../../types/filters";

interface PlayListHeaderProps {
  displayPlays: Play[];
  totalCount: number;
  selectedCategory?: string;
  selectedSubcategory?: string;
  enableBulkOperations: boolean;
  selectedPlayIds: Set<string>;
  onSelectAll: () => void;
  showOneWordCalls: boolean;
  onShowOneWordCallsChange: (show: boolean) => void;
  directionDisplayFormat: "full" | "abbrev" | "letter";
  onDirectionDisplayFormatChange: (
    format: "full" | "abbrev" | "letter"
  ) => void;
  // Search and Sort props
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  sortBy?: PlaySortOption;
  onSortChange?: (value: PlaySortOption) => void;
}

export const PlayListHeader: React.FC<PlayListHeaderProps> = ({
  displayPlays,
  totalCount,
  selectedCategory,
  selectedSubcategory,
  enableBulkOperations,
  selectedPlayIds,
  onSelectAll,
  showOneWordCalls,
  onShowOneWordCallsChange,
  directionDisplayFormat,
  onDirectionDisplayFormatChange,
  searchQuery = "",
  onSearchChange,
  sortBy = "name_asc",
  onSortChange,
}) => {
  return (
    <div className="flex items-center justify-between gap-4">
      {/* Left section: Play count + Search + Sort */}
      <div className="flex items-center gap-4 flex-1">
        <div className="shrink-0">
          <Typography
            variant="headline-sm"
            as="h2"
            className="text-primary whitespace-nowrap"
          >
            {totalCount} {totalCount === 1 ? "Play" : "Plays"}
            {selectedCategory && (
              <span className="text-secondary font-normal ml-2">
                in{" "}
                {selectedCategory.charAt(0).toUpperCase() +
                  selectedCategory.slice(1).replace("-", " ")}
                {selectedSubcategory && ` › ${selectedSubcategory}`}
              </span>
            )}
          </Typography>
        </div>

        {/* Search and Sort */}
        {onSearchChange && (
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="flex-1">
              <UniversalSearch
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
                placeholder="Search plays..."
                size="sm"
              />
            </div>
            {onSortChange && (
              <SortDropdown value={sortBy} onChange={onSortChange} compact />
            )}
          </div>
        )}

        {/* Bulk Selection Controls */}
        {enableBulkOperations && (
          <div className="flex items-center space-x-2 shrink-0">
            <label className="flex items-center space-x-2 text-sm text-secondary">
              <input
                type="checkbox"
                checked={
                  displayPlays.length > 0 &&
                  displayPlays.every((p) => selectedPlayIds.has(p.id))
                }
                onChange={onSelectAll}
                className="rounded border-border text-info focus:ring-text-accent"
              />
              <span>
                {selectedPlayIds.size > 0
                  ? `${selectedPlayIds.size} selected`
                  : "Select all"}
              </span>
            </label>
          </div>
        )}
      </div>

      {/* Play Display Options */}
      <div className="flex items-center space-x-6">
        {/* One-word calls toggle */}
        <div className="flex items-center space-x-3">
          <span className="text-sm text-secondary">One-word calls</span>
          <IconButton
            aria-label={
              showOneWordCalls
                ? "Switch to full play names"
                : "Switch to one-word calls"
            }
            tooltip={
              showOneWordCalls ? "Show full play names" : "Show one-word calls"
            }
            onClick={() => onShowOneWordCallsChange(!showOneWordCalls)}
            variant="subtle"
            size="sm"
          >
            {showOneWordCalls ? (
              <Icon name="toggle-right" className="h-5 w-5 text-info" />
            ) : (
              <Icon name="toggle-left" className="h-5 w-5 text-tertiary" />
            )}
          </IconButton>
          <span className="text-sm text-secondary">Full names</span>
        </div>

        {/* Direction Display Format Toggle */}
        <div className="flex items-center gap-2">
          <IconButton
            aria-label={`Direction format: ${directionDisplayFormat || "full"}`}
            tooltip={(() => {
              const format = directionDisplayFormat || "full";
              if (format === "full") return "Direction format: Full words";
              if (format === "abbrev") return "Direction format: Abbreviations";
              return "Direction format: Letters";
            })()}
            onClick={() => {
              const formats: ("full" | "abbrev" | "letter")[] = [
                "full",
                "abbrev",
                "letter",
              ];
              const currentIndex = formats.indexOf(
                directionDisplayFormat || "full"
              );
              const nextIndex = (currentIndex + 1) % formats.length;
              onDirectionDisplayFormatChange(formats[nextIndex]);
            }}
            variant="subtle"
            size="sm"
          >
            <Icon name="move" className="h-5 w-5 text-info" />
          </IconButton>
          <span className="text-sm text-secondary">
            {(() => {
              const format = directionDisplayFormat || "full";
              if (format === "full") return "Right/Left";
              if (format === "abbrev") return "Rt/Lt";
              return "R/L";
            })()}
          </span>
        </div>
      </div>
    </div>
  );
};
