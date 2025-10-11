import React, { useState } from "react";
import { Icon } from "../ui/Icon/Icon";
import { FORMATION_OPTIONS, PLAY_TYPE_OPTIONS } from "../../types/play";
import { QuickFilterPresets } from "./QuickFilterPresets";
import type { FilterPreset } from "./filterPresets";

interface ActiveFilter {
  id: string;
  field: string;
  operator: "equals" | "contains" | "in";
  value: string | string[];
  label: string;
}

interface FilterOption {
  value: string;
  label: string;
}

interface FilterField {
  value: string;
  label: string;
  type: "text" | "number" | "date" | "select";
  options?: FilterOption[];
}

interface AdvancedFiltersProps {
  onFiltersChange: (filters: ActiveFilter[]) => void;
  activeFilters: ActiveFilter[];
}

const FILTER_FIELDS: FilterField[] = [
  { value: "name", label: "Name", type: "text" },
  {
    value: "formation",
    label: "Formation",
    type: "select",
    options: FORMATION_OPTIONS.map((f) => ({ value: f.name, label: f.name })),
  },
  {
    value: "playType",
    label: "Play Type",
    type: "select",
    options: PLAY_TYPE_OPTIONS.map((p) => ({ value: p.value, label: p.label })),
  },
  { value: "description", label: "Description", type: "text" },
  {
    value: "category",
    label: "Category",
    type: "select",
    options: [
      { value: "run", label: "Run" },
      { value: "pass", label: "Pass" },
      { value: "rpo", label: "RPO" },
      { value: "play-action", label: "Play Action" },
      { value: "special", label: "Special" },
    ],
  },
  {
    value: "complexity",
    label: "Complexity",
    type: "select",
    options: [
      { value: "1", label: "Basic" },
      { value: "2", label: "Intermediate" },
      { value: "3", label: "Advanced" },
    ],
  },
  {
    value: "down",
    label: "Down",
    type: "select",
    options: [
      { value: "1", label: "1st Down" },
      { value: "2", label: "2nd Down" },
      { value: "3", label: "3rd Down" },
      { value: "4", label: "4th Down" },
    ],
  },
  {
    value: "distance",
    label: "Distance",
    type: "select",
    options: [
      { value: "short", label: "Short (1-3)" },
      { value: "medium", label: "Medium (4-7)" },
      { value: "long", label: "Long (8+)" },
    ],
  },
  {
    value: "fieldPosition",
    label: "Field Position",
    type: "select",
    options: [
      { value: "redzone", label: "Red Zone" },
      { value: "midfield", label: "Midfield" },
      { value: "goalline", label: "Goal Line" },
    ],
  },
  { value: "personnel", label: "Personnel", type: "text" },
  { value: "tags", label: "Tags", type: "text" },
  { value: "successRate", label: "Success Rate", type: "number" },
  { value: "yardsPerPlay", label: "Yards/Play", type: "number" },
  { value: "timesUsed", label: "Times Used", type: "number" },
  { value: "lastUsed", label: "Last Used", type: "date" },
  { value: "created_at", label: "Created", type: "date" },
  { value: "updated_at", label: "Updated", type: "date" },
];

const OPERATORS = [
  { id: "equals", label: "equals", types: ["select", "number"] },
  { id: "contains", label: "contains", types: ["text"] },
  { id: "in", label: "is one of", types: ["multi-select"] },
];

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  onFiltersChange,
  activeFilters,
}) => {
  const [showAddFilter, setShowAddFilter] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string>("all");
  const [newFilter, setNewFilter] = useState<{
    field: string;
    operator: "equals" | "contains" | "in";
    value: string;
  }>({
    field: "",
    operator: "equals",
    value: "",
  });

  const handlePresetSelect = (preset: FilterPreset) => {
    setActivePresetId(preset.id);

    if (preset.filters.length === 0) {
      // "All Plays" preset - clear all filters
      onFiltersChange([]);
      return;
    }

    // Convert preset filters to ActiveFilter format
    const newFilters: ActiveFilter[] = preset.filters.map((pf) => {
      const field = FILTER_FIELDS.find((f) => f.value === pf.field);
      const value = Array.isArray(pf.value) ? pf.value.join(", ") : pf.value;

      return {
        id: `${pf.field}-${Date.now()}`,
        field: pf.field,
        operator: pf.operator,
        value: pf.value,
        label: `${field?.label || pf.field} ${pf.operator} "${value}"`,
      };
    });

    onFiltersChange(newFilters);
  };

  const addFilter = () => {
    if (!newFilter.field || !newFilter.value) return;

    const field = FILTER_FIELDS.find((f) => f.value === newFilter.field);
    if (!field) return;

    const filter: ActiveFilter = {
      id: Date.now().toString(),
      field: newFilter.field,
      operator: newFilter.operator,
      value: newFilter.value,
      label: `${field.label} ${OPERATORS.find((o) => o.id === newFilter.operator)?.label} "${newFilter.value}"`,
    };

    onFiltersChange([...activeFilters, filter]);
    setNewFilter({ field: "", operator: "equals", value: "" });
    setShowAddFilter(false);
  };

  const removeFilter = (filterId: string) => {
    onFiltersChange(activeFilters.filter((f) => f.id !== filterId));
  };

  const clearAllFilters = () => {
    onFiltersChange([]);
  };

  const selectedField = FILTER_FIELDS.find((f) => f.value === newFilter.field);

  return (
    <div className="bg-surface-primary rounded-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_1px_3px_rgba(0,0,0,0.1)] overflow-visible">
      {/* Quick Filter Presets */}
      <div className="p-4 border-b border-border-subtle">
        <QuickFilterPresets
          activePresetId={activePresetId}
          onPresetSelect={handlePresetSelect}
        />
      </div>

      {/* Compact Header */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm font-medium text-accent hover:text-accent-hover transition-colors active:scale-95"
            >
              <Icon
                name={showAdvanced ? "chevron-down" : "chevron-right"}
                className="h-4 w-4 transition-transform"
              />
              <Icon name="filter" className="h-4 w-4 text-text-muted" />
              <span>Advanced Filters</span>
              {activeFilters.length > 0 && (
                <span className="px-1.5 py-0.5 text-xs bg-accent/10 text-accent rounded-full">
                  {activeFilters.length}
                </span>
              )}
            </button>
          </div>
          <div className="flex items-center gap-1">
            {activeFilters.length > 0 && (
              <button
                onClick={clearAllFilters}
                className="px-2 py-1 text-xs text-text-error hover:text-text-error-hover hover:bg-surface-error-hover rounded-lg active:scale-95 transition-all"
                title="Clear all filters"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Filters - Horizontal Layout */}
      {activeFilters.length > 0 && (
        <div className="px-4 pb-3">
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <div
                key={filter.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-secondary text-text-secondary text-xs rounded-full border border-border-subtle hover:border-border-medium transition-colors"
              >
                <span className="truncate max-w-40">{filter.label}</span>
                <button
                  onClick={() => removeFilter(filter.id)}
                  className="text-text-muted hover:text-text-secondary hover:bg-surface-muted rounded-full p-0.5 active:scale-90 transition-all"
                >
                  <Icon name="close" className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Collapsible Advanced Filters */}
      {showAdvanced && (
        <div className="px-4 pb-4 space-y-3 animate-in fade-in-0 slide-in-from-top-2 duration-200">
          {!showAddFilter && (
            <button
              onClick={() => setShowAddFilter(true)}
              className="w-full px-3 py-2 text-sm text-text-secondary border border-dashed border-border-medium rounded-lg hover:border-border hover:bg-surface-secondary transition-colors active:scale-98"
            >
              <Icon name="plus" className="h-4 w-4 inline mr-2" />
              Add Custom Filter
            </button>
          )}

          {/* Compact Add Filter */}
          {showAddFilter && (
            <div className="p-3 bg-surface-secondary rounded-lg border border-border-subtle space-y-2">
              <div className="flex gap-2 items-end">
                <div className="flex-1 min-w-0">
                  <label className="block text-xs text-text-muted mb-1">
                    Field
                  </label>
                  <select
                    value={newFilter.field}
                    onChange={(e) =>
                      setNewFilter((prev) => ({
                        ...prev,
                        field: e.target.value,
                        operator: "equals",
                        value: "",
                      }))
                    }
                    className="w-full px-2 py-1.5 text-xs border border-border-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-focus-info bg-surface-primary"
                  >
                    <option value="">Select field...</option>
                    {FILTER_FIELDS.map((field) => (
                      <option key={field.value} value={field.value}>
                        {field.label}
                      </option>
                    ))}
                  </select>
                </div>

                {newFilter.field && (
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs text-text-muted mb-1">
                      Value
                    </label>
                    {selectedField?.type === "select" ? (
                      <select
                        value={newFilter.value}
                        onChange={(e) =>
                          setNewFilter((prev) => ({
                            ...prev,
                            value: e.target.value,
                          }))
                        }
                        className="w-full px-2 py-1.5 text-xs border border-border-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-focus-info bg-surface-primary"
                      >
                        <option value="">Select value...</option>
                        {selectedField.options?.map(
                          (option: FilterOption, index: number) => (
                            <option
                              key={`${option.value}-${index}`}
                              value={option.value}
                            >
                              {option.label}
                            </option>
                          )
                        )}
                      </select>
                    ) : (
                      <input
                        type={
                          selectedField?.type === "number" ? "number" : "text"
                        }
                        value={newFilter.value}
                        onChange={(e) =>
                          setNewFilter((prev) => ({
                            ...prev,
                            value: e.target.value,
                          }))
                        }
                        placeholder="Enter value..."
                        className="w-full px-2 py-1.5 text-xs border border-border-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-focus-info bg-surface-primary"
                      />
                    )}
                  </div>
                )}
              </div>

              {newFilter.field && (
                <div className="flex gap-2">
                  <button
                    onClick={addFilter}
                    disabled={!newFilter.field || !newFilter.value}
                    className="flex-1 px-3 py-1.5 bg-accent text-text-inverse text-xs rounded-lg hover:bg-accent-hover disabled:bg-surface-disabled disabled:cursor-not-allowed disabled:text-text-disabled active:scale-95 transition-all"
                  >
                    Add Filter
                  </button>
                  <button
                    onClick={() => {
                      setShowAddFilter(false);
                      setNewFilter({
                        field: "",
                        operator: "equals",
                        value: "",
                      });
                    }}
                    className="px-3 py-1.5 text-text-muted hover:text-text-secondary text-xs border border-border-subtle rounded-lg hover:bg-surface-muted active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
