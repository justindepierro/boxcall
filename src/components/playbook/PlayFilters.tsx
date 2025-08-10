import React from "react";
import { Button } from "../ui/Button/Button";
import { Filter, Star, Clock, Folder } from "lucide-react";
import {
  FORMATION_OPTIONS,
  PLAY_TYPE_OPTIONS,
  DOWN_OPTIONS,
  DISTANCE_OPTIONS,
} from "../../types/play";
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
    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Filter className="h-5 w-5 text-slate-500 mr-2" />
            <h3 className="font-semibold text-slate-900">Filters</h3>
          </div>
          {hasActiveFilters && (
            <Button
              onClick={clearAllFilters}
              size="xs"
              variant="ghost"
              className="font-medium text-jade-600 hover:text-jade-700 h-auto px-2"
            >
              Clear all
            </Button>
          )}
        </div>
      </div>
      <div className="p-4 space-y-6">
        {/* Quick Access */}
        <div>
          <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center">
            <Folder className="h-4 w-4 mr-2" />
            Quick Access
          </h4>
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="xs"
              className="w-full justify-start px-3 py-2 h-auto text-slate-700 hover:text-slate-900"
            >
              <Star className="h-4 w-4 mr-2 text-yellow-500" /> Favorites
            </Button>
            <Button
              variant="ghost"
              size="xs"
              className="w-full justify-start px-3 py-2 h-auto text-slate-700 hover:text-slate-900"
            >
              <Clock className="h-4 w-4 mr-2 text-blue-500" /> Recent
            </Button>
          </div>
        </div>
        {/* Play Type Filter */}
        <div>
          <h4 className="text-sm font-medium text-slate-900 mb-3">Play Type</h4>
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
                  className="h-4 w-4 text-jade-600 focus:ring-jade-500 border-slate-300"
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
                variant="link"
                className="text-xs text-slate-500 hover:text-slate-700 h-auto px-1"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
        {/* Formation Filter */}
        <div>
          <h4 className="text-sm font-medium text-slate-900 mb-3">Formation</h4>
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
          <h4 className="text-sm font-medium text-slate-900 mb-3">Situation</h4>
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
          <h4 className="text-sm font-medium text-slate-900 mb-3">
            Common Tags
          </h4>
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
                  className="h-4 w-4 text-jade-600 focus:ring-jade-500 border-slate-300 rounded"
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
