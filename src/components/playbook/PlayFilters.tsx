import React from "react";

import {
  FORMATION_OPTIONS,
  PLAY_TYPE_OPTIONS,
  DOWN_OPTIONS,
  DISTANCE_OPTIONS,
} from "../../types/play";
import { Typography } from "../design-system/Typography";
import { Button } from "../ui/Button/Button";
import { Icon } from "../ui/Icon/Icon";

interface PlayFiltersProps {
  selectedFilters: {
    formation?: string;
    playType?: string;
    down?: string;
    distance?: string;
    tags?: string[];
  };
  onFilterChange: (filters: PlayFiltersProps["selectedFilters"]) => void;
}
export const PlayFilters: React.FC<PlayFiltersProps> = ({
  selectedFilters,
  onFilterChange,
}) => {
  const handleFilterUpdate = (
    key: string,
    value: string | string[] | undefined
  ) => {
    onFilterChange({
      ...selectedFilters,
      [key]: value,
    });
  };
  const clearAllFilters = () => {
    onFilterChange({});
  };
  const hasActiveFilters = Object.values(selectedFilters).some(
    (filter) => filter && (Array.isArray(filter) ? filter.length > 0 : true)
  );
  return (
    <div className="surface-card rounded-lg shadow-sm border border-subtle">
      {/* Header */}
      <div className="p-4 border-b border-subtle">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Icon name="filter" className="h-5 w-5 text-slate-500 mr-2" />
            <Typography variant="headline-sm" as="h3">
              Filters
            </Typography>
          </div>
          {hasActiveFilters && (
            <Button
              onClick={clearAllFilters}
              size="xs"
              variant="neutralLink"
              className="font-medium h-auto px-2"
            >
              Clear all
            </Button>
          )}
        </div>
      </div>
      <div className="p-4 space-y-6">
        {/* Quick Access */}
        <div>
          <Typography
            variant="body-sm"
            as="h4"
            className="font-medium text-slate-900 mb-3 flex items-center leading-none"
          >
            <Icon name="folder" className="h-4 w-4 mr-2" />
            Quick Access
          </Typography>
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="xs"
              className="w-full justify-start px-3 py-2 h-auto"
            >
              <Icon name="star" className="h-4 w-4 mr-2 text-yellow-500" />{" "}
              Favorites
            </Button>
            <Button
              variant="ghost"
              size="xs"
              className="w-full justify-start px-3 py-2 h-auto"
            >
              <Icon name="clock" className="h-4 w-4 mr-2 text-blue-500" />{" "}
              Recent
            </Button>
          </div>
        </div>
        {/* Play Type Filter */}
        <div>
          <Typography
            variant="body-sm"
            as="h4"
            className="font-medium text-slate-900 mb-3 leading-none"
          >
            Play Type
          </Typography>
          <div className="space-y-2">
            {PLAY_TYPE_OPTIONS.map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="radio"
                  name="playType"
                  value={option.value}
                  checked={selectedFilters.playType === option.value}
                  onChange={(e) =>
                    handleFilterUpdate("playType", e.target.value)
                  }
                  className="h-4 w-4 focus:ring-jade-500 border-slate-300"
                />
                <span className="ml-2 text-sm text-slate-700">
                  {option.label}
                </span>
              </label>
            ))}
            {selectedFilters.playType && (
              <Button
                onClick={() => handleFilterUpdate("playType", undefined)}
                size="xs"
                variant="neutralLink"
                className="text-xs h-auto px-1"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
        {/* Formation Filter */}
        <div>
          <Typography
            variant="body-sm"
            as="h4"
            className="font-medium text-slate-900 mb-3 leading-none"
          >
            Formation
          </Typography>
          <select
            value={selectedFilters.formation || ""}
            onChange={(e) =>
              handleFilterUpdate("formation", e.target.value || undefined)
            }
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-jade-500 focus:border-jade-500"
          >
            <option value="">All Formations</option>
            {FORMATION_OPTIONS.map((formation) => (
              <option key={formation.name} value={formation.name}>
                {formation.name}
              </option>
            ))}
          </select>
        </div>
        {/* Down & Distance */}
        <div>
          <Typography
            variant="body-sm"
            as="h4"
            className="font-medium text-slate-900 mb-3 leading-none"
          >
            Situation
          </Typography>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-600 mb-1">Down</label>
              <select
                value={selectedFilters.down || ""}
                onChange={(e) =>
                  handleFilterUpdate("down", e.target.value || undefined)
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-jade-500 focus:border-jade-500"
              >
                <option value="">Any Down</option>
                {DOWN_OPTIONS.map((down) => (
                  <option key={down} value={down}>
                    {down}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">
                Distance
              </label>
              <select
                value={selectedFilters.distance || ""}
                onChange={(e) =>
                  handleFilterUpdate("distance", e.target.value || undefined)
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-jade-500 focus:border-jade-500"
              >
                <option value="">Any Distance</option>
                {DISTANCE_OPTIONS.map((distance) => (
                  <option key={distance} value={distance}>
                    {distance}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {/* Tags */}
        <div>
          <Typography
            variant="body-sm"
            as="h4"
            className="font-medium text-slate-900 mb-3 leading-none"
          >
            Common Tags
          </Typography>
          <div className="space-y-2">
            {[
              "3rd Down",
              "Red Zone",
              "Two Minute",
              "Goal Line",
              "Short Yardage",
            ].map((tag) => (
              <label key={tag} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedFilters.tags?.includes(tag) || false}
                  onChange={(e) => {
                    const currentTags = selectedFilters.tags || [];
                    const newTags = e.target.checked
                      ? [...currentTags, tag]
                      : currentTags.filter((t) => t !== tag);
                    handleFilterUpdate(
                      "tags",
                      newTags.length > 0 ? newTags : undefined
                    );
                  }}
                  className="h-4 w-4 focus:ring-jade-500 border-slate-300 rounded"
                />
                <span className="ml-2 text-sm text-slate-700">{tag}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
