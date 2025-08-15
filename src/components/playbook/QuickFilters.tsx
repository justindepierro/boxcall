/**
 * Quick Filter Buttons
 * One-click filters for common play situations
 */

import React from "react";
import { Button } from "../ui";
import { Icon } from "../ui/Icon/Icon";
import {
  PlaybookSearchService,
  type QuickFilter,
} from "../../services/playbookSearchService";

interface QuickFiltersProps {
  activeFilters: string[];
  onFiltersChange: (filters: string[]) => void;
  className?: string;
}

export const QuickFilters: React.FC<QuickFiltersProps> = ({
  activeFilters,
  onFiltersChange,
  className = "",
}) => {
  // Get quick filters from service
  const searchService = new PlaybookSearchService([]);
  const quickFilters = searchService.quickFilters;

  // Toggle filter
  const toggleFilter = (filterId: string) => {
    if (activeFilters.includes(filterId)) {
      onFiltersChange(activeFilters.filter((id) => id !== filterId));
    } else {
      onFiltersChange([...activeFilters, filterId]);
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    onFiltersChange([]);
  };

  // Get color classes for filter buttons
  const getFilterColorClasses = (filter: QuickFilter, isActive: boolean) => {
    const colorMap = {
      red: isActive
        ? "bg-red-100 text-red-800 border-red-300 hover:bg-red-200"
        : "surface-card text-red-600 border-subtle hover:surface-subtle",
      blue: isActive
        ? "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200"
        : "surface-card text-blue-600 border-subtle hover:surface-subtle",
      green: isActive
        ? "bg-green-100 text-green-800 border-green-300 hover:bg-green-200"
        : "surface-card text-green-600 border-subtle hover:surface-subtle",
      orange: isActive
        ? "bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200"
        : "surface-card text-orange-600 border-subtle hover:surface-subtle",
      purple: isActive
        ? "bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200"
        : "surface-card text-purple-600 border-subtle hover:surface-subtle",
    };
    return colorMap[filter.color];
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Quick Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {quickFilters.map((filter) => {
          const isActive = activeFilters.includes(filter.id);
          return (
            <Button
              key={filter.id}
              onClick={() => toggleFilter(filter.id)}
              title={filter.description}
              variant={isActive ? "secondary" : "outline"}
              size="xs"
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${getFilterColorClasses(filter, isActive)} ${isActive ? "shadow-sm scale-105" : "hover:shadow-sm"}`}
            >
              <span className="text-sm">{filter.icon}</span>
              <span>{filter.label}</span>
              {isActive && (
                <span
                  role="button"
                  tabIndex={0}
                  className="inline-flex items-center justify-center ml-1 rounded-full hover:bg-black hover:bg-opacity-10 p-0.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFilter(filter.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFilter(filter.id);
                    }
                  }}
                >
                  <Icon name="close" className="h-3 w-3" />
                </span>
              )}
            </Button>
          );
        })}
      </div>

      {/* Clear All Filters */}
      {activeFilters.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">
            {activeFilters.length} filter{activeFilters.length > 1 ? "s" : ""}{" "}
            active
          </span>
          <Button
            onClick={clearAllFilters}
            variant="link"
            size="xs"
            className="text-xs text-text-muted hover:text-text-primary underline"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
};
