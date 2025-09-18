import React from "react";

import { Typography } from "../../components/design-system/Typography";
import { Card, Button, Input } from "../../components/ui";
import { Icon } from "../../components/ui/Icon";

import type { CalendarFilters } from "../../domain/calendar/types"; // modern source

export interface CalendarFiltersPanelProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onSearch: () => void;
  filters: CalendarFilters;
  onFilterChange: (partial: Partial<CalendarFilters>) => void;
  className?: string;
}

/**
 * CalendarFiltersPanel
 * Extracted from CalendarPage to reduce file size & isolate concerns.
 * Responsibilities:
 *  - Universal search input + trigger
 *  - Event type / date range / quick filters
 */
export const CalendarFiltersPanel: React.FC<CalendarFiltersPanelProps> = ({
  searchQuery,
  onSearchQueryChange,
  onSearch,
  filters,
  onFilterChange,
  className,
}) => {
  return (
    <div className={className}>
      {/* Universal Search */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="search" size="lg" className="text-navy-600" />
          <Typography variant="headline-md" className="text-text-primary">
            Universal Search
          </Typography>
        </div>
        <div className="space-y-3">
          <Input
            type="text"
            placeholder="Search events, teams, locations... (debounced)"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && onSearch()}
          />
          <Button
            variant="primary"
            size="sm"
            onClick={onSearch}
            className="w-full"
          >
            Search
          </Button>
        </div>
      </Card>
      {/* Advanced Filters */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="filter" size="lg" className="text-navy-600" />
          <Typography variant="headline-md" className="text-text-primary">
            Filters
          </Typography>
        </div>
        <div className="space-y-4">
          {/* Event Type Filter */}
          <div>
            <Typography variant="body-sm" className="font-semibold mb-2">
              Event Types
            </Typography>
            <div className="space-y-2">
              {["game", "practice", "meeting", "film", "other"].map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-jade-600 focus:ring-jade-500"
                    checked={filters.eventTypes?.includes(type) || false}
                    onChange={(e) => {
                      const newTypes = e.target.checked
                        ? [...(filters.eventTypes || []), type]
                        : (filters.eventTypes || []).filter(
                            (t: string) => t !== type
                          );
                      onFilterChange({ eventTypes: newTypes });
                    }}
                  />
                  <span className="ml-2 text-sm capitalize">{type}</span>
                </label>
              ))}
            </div>
          </div>
          {/* Date Range Filter */}
          <div>
            <Typography variant="body-sm" className="font-semibold mb-2">
              Date Range
            </Typography>
            <div className="space-y-2">
              <Input
                type="date"
                value={filters.dateRange?.start || ""}
                onChange={(e) =>
                  onFilterChange({
                    dateRange: {
                      start: e.target.value,
                      end: filters.dateRange?.end || e.target.value,
                    },
                  })
                }
              />
              <Input
                type="date"
                value={filters.dateRange?.end || ""}
                onChange={(e) =>
                  onFilterChange({
                    dateRange: {
                      start: filters.dateRange?.start || e.target.value,
                      end: e.target.value,
                    },
                  })
                }
              />
            </div>
          </div>
          {/* Quick Filters */}
          <div>
            <Typography variant="body-sm" className="font-semibold mb-2">
              Quick Filters
            </Typography>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onFilterChange({ eventTypes: ["game"] })}
              >
                Games Only
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onFilterChange({ eventTypes: ["practice"] })}
              >
                Practices
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onFilterChange({ eventTypes: [] })}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CalendarFiltersPanel;
