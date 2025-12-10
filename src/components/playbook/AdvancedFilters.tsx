import React, { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Icon } from "../ui/Icon/Icon";
import { FormSelect } from "../ui";
import { FORMATION_OPTIONS, PLAY_TYPE_OPTIONS } from "../../types/play";
import { QuickFilterPresets } from "./QuickFilterPresets";
import type { FilterPreset } from "./filterPresets";
import { BottomSheet } from "../BottomSheet";
import { useIsMobile } from "../../hooks/useBreakpoint";

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
  const isMobile = useIsMobile();
  const [showAddFilter, setShowAddFilter] = useState(false);
  // Advanced filters collapsed by default, load from localStorage for user preference
  const [showAdvanced, setShowAdvanced] = useState(() => {
    const saved = localStorage.getItem("bc_advanced_filters_expanded");
    return saved === "true";
  });
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

  // 🚀 PERFORMANCE: Debounce filter changes to prevent lag during typing (150ms)
  const debouncedFilterChange = useDebouncedCallback(
    (filters: ActiveFilter[]) => {
      onFiltersChange(filters);
    },
    150
  );

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

    // Use debounced version for smooth typing experience
    debouncedFilterChange([...activeFilters, filter]);
    setNewFilter({ field: "", operator: "equals", value: "" });
    setShowAddFilter(false);
  };

  const removeFilter = (filterId: string) => {
    // Instant removal (no need to debounce deletions)
    onFiltersChange(activeFilters.filter((f) => f.id !== filterId));
  };

  const clearAllFilters = () => {
    // Instant clear (no need to debounce)
    onFiltersChange([]);
  };

  const selectedField = FILTER_FIELDS.find((f) => f.value === newFilter.field);

  // Mobile: Bottom Sheet with full-screen experience
  if (isMobile) {
    return (
      <div>
        {/* Filter Trigger Button */}
        <button
          onClick={() => setShowAdvanced(true)}
          className="w-full px-4 py-3 bg-primary rounded-lg shadow-sm border border-muted flex items-center justify-between active:scale-98 transition-transform"
        >
          <div className="flex items-center gap-2">
            <Icon name="filter" className="h-5 w-5 text-accent" />
            <span className="text-sm font-medium text-primary">Filters</span>
            {activeFilters.length > 0 && (
              <span className="px-2 py-0.5 text-xs bg-accent text-inverse rounded-full">
                {activeFilters.length}
              </span>
            )}
          </div>
          <Icon name="chevron-right" className="h-5 w-5 text-muted" />
        </button>

        {/* Active Filters Chips */}
        {activeFilters.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <div
                key={filter.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-secondary text-xs rounded-full border border-muted"
              >
                <span className="truncate max-w-36">{filter.label}</span>
                <button
                  onClick={() => removeFilter(filter.id)}
                  className="text-muted hover:text-secondary rounded-full p-0.5 active:scale-90 transition-transform"
                >
                  <Icon name="close" className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Sheet */}
        {showAdvanced && (
          <BottomSheet
            snapPoints={[0.9]}
            initialSnapPoint={0}
            showHandle={true}
            backdropOpacity={0.5}
            zIndex={50}
          >
            <div className="flex flex-col h-full bg-primary">
              {/* Header */}
              <div className="sticky top-0 z-sticky px-4 py-4 bg-primary border-b border-muted">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Icon name="filter" className="h-5 w-5 text-accent" />
                    <h3 className="text-lg font-semibold text-primary">
                      Advanced Filters
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowAdvanced(false)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-secondary active:scale-95 transition-all"
                  >
                    <Icon name="close" className="h-5 w-5 text-muted" />
                  </button>
                </div>

                {/* Quick Filter Presets */}
                <QuickFilterPresets
                  activePresetId={activePresetId}
                  onPresetSelect={handlePresetSelect}
                />
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {/* Active Filters */}
                {activeFilters.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-secondary">
                        Active Filters ({activeFilters.length})
                      </h4>
                      <button
                        onClick={clearAllFilters}
                        className="px-3 py-1.5 text-xs text-error hover:text-error-hover hover:bg-surface-error-hover rounded-lg active:scale-95 transition-all"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="space-y-2">
                      {activeFilters.map((filter) => (
                        <div
                          key={filter.id}
                          className="flex items-center justify-between p-3 bg-secondary rounded-lg border border-muted"
                        >
                          <span className="text-sm text-primary flex-1 truncate">
                            {filter.label}
                          </span>
                          <button
                            onClick={() => removeFilter(filter.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-error-hover active:scale-95 transition-all ml-2"
                          >
                            <Icon name="close" className="h-4 w-4 text-error" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Custom Filter */}
                <div>
                  <h4 className="text-sm font-medium text-secondary mb-3">
                    Add Custom Filter
                  </h4>

                  {!showAddFilter ? (
                    <button
                      onClick={() => setShowAddFilter(true)}
                      className="w-full px-4 py-3 text-sm text-secondary border border-dashed border-secondary rounded-lg hover:border-border hover:bg-secondary transition-colors active:scale-98"
                    >
                      <Icon name="plus" className="h-5 w-5 inline mr-2" />
                      Add Custom Filter
                    </button>
                  ) : (
                    <div className="p-4 bg-secondary rounded-lg border border-muted space-y-3">
                      {/* Field Select */}
                      <div>
                        <label className="block text-sm font-medium text-primary mb-2">
                          Field
                        </label>
                        <FormSelect
                          value={newFilter.field}
                          onChange={(value) =>
                            setNewFilter((prev) => ({
                              ...prev,
                              field: value,
                              operator: "equals",
                              value: "",
                            }))
                          }
                          placeholder="Select field..."
                          options={FILTER_FIELDS.map((field) => ({
                            value: field.value,
                            label: field.label,
                          }))}
                        />
                      </div>

                      {/* Value Input */}
                      {newFilter.field && (
                        <div>
                          <label className="block text-sm font-medium text-primary mb-2">
                            Value
                          </label>
                          {selectedField?.type === "select" ? (
                            <FormSelect
                              value={newFilter.value}
                              onChange={(value) =>
                                setNewFilter((prev) => ({
                                  ...prev,
                                  value: value,
                                }))
                              }
                              placeholder="Select value..."
                              options={selectedField.options?.map(
                                (option: FilterOption) => ({
                                  value: option.value,
                                  label: option.label,
                                })
                              ) || []}
                            />
                          ) : (
                            <input
                              type={
                                selectedField?.type === "number"
                                  ? "number"
                                  : "text"
                              }
                              value={newFilter.value}
                              onChange={(e) =>
                                setNewFilter((prev) => ({
                                  ...prev,
                                  value: e.target.value,
                                }))
                              }
                              placeholder="Enter value..."
                              className="w-full h-12 px-3 text-sm border border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-focus-info bg-primary"
                            />
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      {newFilter.field && (
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={addFilter}
                            disabled={!newFilter.field || !newFilter.value}
                            className="flex-1 h-12 bg-accent text-inverse text-sm font-medium rounded-lg hover:bg-accent-hover disabled:bg-surface-disabled disabled:cursor-not-allowed disabled:text-disabled active:scale-98 transition-all"
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
                            className="px-4 h-12 text-muted hover:text-secondary text-sm border border-muted rounded-lg hover:bg-muted active:scale-98 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer with Apply Button */}
              <div className="sticky bottom-0 z-sticky p-4 bg-primary border-t border-muted pb-safe">
                <button
                  onClick={() => setShowAdvanced(false)}
                  className="w-full h-12 bg-accent text-inverse text-sm font-semibold rounded-lg hover:bg-accent-hover active:scale-98 transition-all shadow-sm"
                >
                  Apply Filters
                  {activeFilters.length > 0 && ` (${activeFilters.length})`}
                </button>
              </div>
            </div>
          </BottomSheet>
        )}
      </div>
    );
  }

  // Desktop: Sidebar panel
  return (
    <div className="bg-primary rounded-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_1px_3px_rgba(0,0,0,0.1)] overflow-visible">
      {/* Quick Filter Presets */}
      <div className="p-4 border-b border-muted">
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
              onClick={() => {
                const newState = !showAdvanced;
                setShowAdvanced(newState);
                // Save user preference
                localStorage.setItem(
                  "bc_advanced_filters_expanded",
                  String(newState)
                );
              }}
              className="flex items-center gap-2 text-sm font-medium text-accent hover:text-accent-hover transition-colors active:scale-95"
            >
              <Icon
                name="chevron-right"
                className={`h-4 w-4 transition-transform duration-300 ease-in-out ${
                  showAdvanced ? "rotate-90" : "rotate-0"
                }`}
              />
              <Icon name="filter" className="h-4 w-4 text-muted" />
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
                className="px-2 py-1 text-xs text-error hover:text-error-hover hover:bg-surface-error-hover rounded-lg active:scale-95 transition-all"
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-secondary text-xs rounded-full border border-muted hover:border-secondary transition-colors"
              >
                <span className="truncate max-w-40">{filter.label}</span>
                <button
                  onClick={() => removeFilter(filter.id)}
                  className="text-muted hover:text-secondary hover:bg-muted rounded-full p-0.5 active:scale-90 transition-all"
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
        <div className="px-4 pb-4 space-y-3 animate-in fade-in-0 slide-in-from-top-2 duration-300 ease-in-out">
          {!showAddFilter && (
            <button
              onClick={() => setShowAddFilter(true)}
              className="w-full px-3 py-2 text-sm text-secondary border border-dashed border-secondary rounded-lg hover:border-border hover:bg-secondary transition-colors active:scale-98"
            >
              <Icon name="plus" className="h-4 w-4 inline mr-2" />
              Add Custom Filter
            </button>
          )}

          {/* Compact Add Filter */}
          {showAddFilter && (
            <div className="p-3 bg-secondary rounded-lg border border-muted space-y-2">
              <div className="flex gap-2 items-end">
                <div className="flex-1 min-w-0">
                  <label className="block text-xs text-muted mb-1">Field</label>
                  <FormSelect
                    value={newFilter.field}
                    onChange={(value) =>
                      setNewFilter((prev) => ({
                        ...prev,
                        field: value,
                        operator: "equals",
                        value: "",
                      }))
                    }
                    placeholder="Select field..."
                    options={FILTER_FIELDS.map((field) => ({
                      value: field.value,
                      label: field.label,
                    }))}
                  />
                </div>

                {newFilter.field && (
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs text-muted mb-1">
                      Value
                    </label>
                    {selectedField?.type === "select" ? (
                      <FormSelect
                        value={newFilter.value}
                        onChange={(value) =>
                          setNewFilter((prev) => ({
                            ...prev,
                            value: value,
                          }))
                        }
                        placeholder="Select value..."
                            options={selectedField.options?.map(
                          (option: FilterOption) => ({
                            value: option.value,
                            label: option.label,
                          })
                        ) || []}
                      />
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
                        className="w-full px-2 py-1.5 text-xs border border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-focus-info bg-primary"
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
                    className="flex-1 px-3 py-1.5 bg-accent text-inverse text-xs rounded-lg hover:bg-accent-hover disabled:bg-surface-disabled disabled:cursor-not-allowed disabled:text-disabled active:scale-95 transition-all"
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
                    className="px-3 py-1.5 text-muted hover:text-secondary text-xs border border-muted rounded-lg hover:bg-muted active:scale-95 transition-all"
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
