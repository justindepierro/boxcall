import React, { useState } from "react";
import { Icon } from "../ui/Icon/Icon";
import { FORMATION_OPTIONS, PLAY_TYPE_OPTIONS } from "../../types/play";

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
  const [newFilter, setNewFilter] = useState<{
    field: string;
    operator: "equals" | "contains" | "in";
    value: string;
  }>({
    field: "",
    operator: "equals",
    value: "",
  });

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
      {/* Compact Header */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="filter" className="h-4 w-4 text-text-muted" />
            <span className="text-sm font-medium text-accent">Filters</span>
            {activeFilters.length > 0 && (
              <span className="px-1.5 py-0.5 text-xs bg-accent/10 text-accent rounded-full">
                {activeFilters.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {!showAddFilter && (
              <button
                onClick={() => setShowAddFilter(true)}
                className="p-1 text-text-muted hover:text-text-secondary hover:bg-surface-muted rounded"
                title="Add filter"
              >
                <Icon name="plus" className="h-3 w-3" />
              </button>
            )}
            {activeFilters.length > 0 && (
              <button
                onClick={clearAllFilters}
                className="p-1 text-text-error hover:text-text-error-hover hover:bg-surface-error-hover rounded"
                title="Clear all filters"
              >
                <Icon name="close" className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Filters - Horizontal Layout */}
      {activeFilters.length > 0 && (
        <div className="px-4 py-3">
          <div className="flex flex-wrap gap-1">
            {activeFilters.map((filter) => (
              <div
                key={filter.id}
                className="inline-flex items-center gap-1 px-2 py-1 bg-surface-error text-text-error text-xs rounded-full"
              >
                <span className="truncate max-w-32">{filter.label}</span>
                <button
                  onClick={() => removeFilter(filter.id)}
                  className="text-text-info hover:text-text-info-hover hover:bg-surface-info-hover rounded-full p-0.5"
                >
                  <Icon name="close" className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compact Add Filter */}
      {showAddFilter && (
        <div className="px-4 py-3">
          <div className="flex gap-2 items-end">
            <div className="flex-1 min-w-0">
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
                className="w-full px-2 py-1 text-xs border border-border-medium rounded-lg focus:outline-none focus:ring-1 focus:ring-focus-info bg-surface-primary"
              >
                <option value="">Field...</option>
                {FILTER_FIELDS.map((field) => (
                  <option key={field.value} value={field.value}>
                    {field.label}
                  </option>
                ))}
              </select>
            </div>

            {newFilter.field && (
              <>
                <div className="flex-1 min-w-0">
                  {selectedField?.type === "select" ? (
                    <select
                      value={newFilter.value}
                      onChange={(e) =>
                        setNewFilter((prev) => ({
                          ...prev,
                          value: e.target.value,
                        }))
                      }
                      className="w-full px-2 py-1 text-xs border border-border-medium rounded-lg focus:outline-none focus:ring-1 focus:ring-focus-info bg-surface-primary"
                    >
                      <option value="">Value...</option>
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
                      placeholder="Value..."
                      className="w-full px-2 py-1 text-xs border border-border-medium rounded-lg focus:outline-none focus:ring-1 focus:ring-focus-info"
                    />
                  )}
                </div>

                <button
                  onClick={addFilter}
                  disabled={!newFilter.field || !newFilter.value}
                  className="px-3 py-1 bg-surface-info text-text-inverse text-xs rounded-lg hover:bg-surface-info-hover disabled:bg-surface-disabled disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </>
            )}

            <button
              onClick={() => {
                setShowAddFilter(false);
                setNewFilter({ field: "", operator: "equals", value: "" });
              }}
              className="px-2 py-1 text-text-muted hover:text-text-secondary text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
