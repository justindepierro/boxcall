/**
 * Quick Filter Buttons
 * One-click filters for common play situations
 */

import React from "react";
import { Button } from "../ui";
import { X } from "lucide-react";
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
        : "bg-white text-red-600 border-red-200 hover:bg-red-50",
      blue: isActive
        ? "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200"
        : "bg-white text-blue-600 border-blue-200 hover:bg-blue-50",
      green: isActive
        ? "bg-green-100 text-green-800 border-green-300 hover:bg-green-200"
        : "bg-white text-green-600 border-green-200 hover:bg-green-50",
      orange: isActive
        ? "bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200"
        : "bg-white text-orange-600 border-orange-200 hover:bg-orange-50",
      purple: isActive
        ? "bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200"
        : "bg-white text-purple-600 border-purple-200 hover:bg-purple-50",
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
                <X
                  className="h-3 w-3 ml-1 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFilter(filter.id);
                  }}
                />
              )}
            </Button>
          );
        })}
      </div>

      {/* Clear All Filters */}
      {activeFilters.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {activeFilters.length} filter{activeFilters.length > 1 ? "s" : ""}{" "}
            active
          </span>
          <Button
            onClick={clearAllFilters}
            variant="link"
            size="xs"
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
};
