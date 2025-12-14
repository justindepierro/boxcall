/**
 * PlayGridHeader Component
 * Renders the header with play count, bulk selection, and view controls
 */

import React from "react";
import { Icon } from "../../../ui/Icon/Icon";
import { IconButton } from "../../../ui";
import { Typography } from "../../../design-system/Typography";
import type { Play } from "../../../../types/play";

interface PlayGridHeaderProps {
  displayPlays: Play[];
  selectedCategory?: string;
  selectedSubcategory?: string;
  enableBulkOperations: boolean;
  selectedPlayIds: Set<string>;
  onSelectAll: () => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  showOneWordCalls: boolean;
  onShowOneWordCallsChange: (show: boolean) => void;
  directionDisplayFormat: "full" | "abbrev" | "letter";
  onDirectionDisplayFormatChange: (
    format: "full" | "abbrev" | "letter"
  ) => void;
}

export const PlayGridHeader: React.FC<PlayGridHeaderProps> = ({
  displayPlays,
  selectedCategory,
  selectedSubcategory,
  enableBulkOperations,
  selectedPlayIds,
  onSelectAll,
  viewMode,
  onViewModeChange,
  showOneWordCalls,
  onShowOneWordCallsChange,
  directionDisplayFormat,
  onDirectionDisplayFormatChange,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div>
          <Typography variant="headline-sm" as="h2" className="text-primary">
            {displayPlays.length} {displayPlays.length === 1 ? "Play" : "Plays"}
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

        {/* Bulk Selection Controls */}
        {enableBulkOperations && (
          <div className="flex items-center space-x-2">
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

      {/* Play Name Display Toggle & View Mode */}
      <div className="flex items-center space-x-6">
        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2 px-2 py-1 rounded-xl bg-muted">
          <IconButton
            aria-label="List view"
            tooltip="List view"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onViewModeChange("list");
            }}
            variant="subtle"
            size="sm"
            className={viewMode === "list" ? "bg-white dark:bg-navy-700" : ""}
          >
            <Icon name="list" className="h-4 w-4" />
          </IconButton>
          <IconButton
            aria-label="Grid view (app icons)"
            tooltip="Grid view"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onViewModeChange("grid");
            }}
            variant="subtle"
            size="sm"
            className={viewMode === "grid" ? "bg-white dark:bg-navy-700" : ""}
          >
            <Icon name="grid" className="h-4 w-4" />
          </IconButton>
        </div>

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
