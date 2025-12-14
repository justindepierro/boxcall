import React from "react";
import { Input, FormSelect } from "../../../components/ui";
import { MultiSelect } from "../../../components/ui/MultiSelect";
import type { MultiSelectOption } from "../../../components/ui/MultiSelect";
import { Button } from "../../../components/ui/Button/Button";
import { Icon } from "../../../components/ui/Icon/Icon";

interface RosterFiltersBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  positionFilters: Set<string>;
  onTogglePosition: (position: string) => void;
  gradeLevelFilters: Set<string>;
  onToggleGradeLevel: (grade: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  positionOptions: MultiSelectOption[];
  gradeLevelOptions: MultiSelectOption[];
  statusOptions: Array<{ value: string; label: string }>;
}

export const RosterFiltersBar: React.FC<RosterFiltersBarProps> = ({
  searchTerm,
  onSearchChange,
  positionFilters,
  onTogglePosition,
  gradeLevelFilters,
  onToggleGradeLevel,
  statusFilter,
  onStatusChange,
  hasActiveFilters,
  onClearFilters,
  positionOptions,
  gradeLevelOptions,
  statusOptions,
}) => {
  return (
    <div className="bg-primary border-b border-border p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="lg:col-span-2 relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon name="search" className="w-4 h-4 text-muted" />
          </div>
          <Input
            type="text"
            placeholder="Search by name, jersey #, position..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Position Filter */}
        <div>
          <MultiSelect
            options={positionOptions}
            selected={Array.from(positionFilters)}
            onChange={(values) => {
              // Determine which positions to toggle
              const currentSet = new Set(positionFilters);
              const newSet = new Set(values);

              // Find added positions
              values.forEach((value) => {
                if (!currentSet.has(value)) {
                  onTogglePosition(value);
                }
              });

              // Find removed positions
              Array.from(currentSet).forEach((value) => {
                if (!newSet.has(value)) {
                  onTogglePosition(value);
                }
              });
            }}
            placeholder="All Positions"
          />
        </div>

        {/* Grade Level Filter */}
        <div>
          <MultiSelect
            options={gradeLevelOptions}
            selected={Array.from(gradeLevelFilters)}
            onChange={(values) => {
              const currentSet = new Set(gradeLevelFilters);
              const newSet = new Set(values);

              values.forEach((value) => {
                if (!currentSet.has(value)) {
                  onToggleGradeLevel(value);
                }
              });

              Array.from(currentSet).forEach((value) => {
                if (!newSet.has(value)) {
                  onToggleGradeLevel(value);
                }
              });
            }}
            placeholder="All Grades"
          />
        </div>
      </div>

      {/* Status Filter & Clear Filters */}
      <div className="flex items-center gap-4 mt-4">
        <div className="w-48">
          <FormSelect
            value={statusFilter}
            onChange={onStatusChange}
            options={statusOptions}
          />
        </div>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <Icon name="close" className="w-4 h-4 mr-xs" />
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
};
