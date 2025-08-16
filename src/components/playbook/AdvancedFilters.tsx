import React, { useState } from "react";
import { Button } from "../ui/Button/Button";
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
  const availableOperators = OPERATORS.filter((op) =>
    selectedField ? op.types.includes(selectedField.type) : false
  );

  return (
    <div className="surface-card rounded-lg shadow-sm border border-subtle dark:border-gray-700">
      {/* Header */}
      <div className="p-3 border-b border-subtle dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Icon name="filter" className="h-4 w-4 text-text-secondary mr-2" />
            <span className="Typography typography-label-lg text-text-primary">
              Filters
            </span>
            {activeFilters.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                {activeFilters.length}
              </span>
            )}
          </div>
          {activeFilters.length > 0 && (
            <Button
              size="xs"
              variant="danger"
              onClick={clearAllFilters}
              className="font-medium"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>
      {activeFilters.length > 0 && (
        <div className="p-3 space-y-2">
          {activeFilters.map((filter) => (
            <div
              key={filter.id}
              className="flex items-center justify-between surface-subtle border border-subtle rounded px-2 py-1"
            >
              <span className="text-xs text-blue-900 truncate flex-1">
                {filter.label}
              </span>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => removeFilter(filter.id)}
                className="text-blue-600 hover:text-blue-800 h-auto px-1 py-0"
              >
                <Icon name="close" className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add Filter Section */}
      <div className="p-3 border-t border-slate-100 dark:border-gray-700">
        {!showAddFilter ? (
          <Button
            size="xs"
            variant="ghost"
            onClick={() => setShowAddFilter(true)}
            className="w-full flex items-center justify-center"
          >
            <Icon name="plus" className="h-3 w-3 mr-1" />
            Add Filter
          </Button>
        ) : (
          <div className="space-y-2">
            {/* Field Selection */}
            <div className="relative">
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
                className="w-full px-2 py-1.5 text-xs border-subtle rounded focus:outline-none focus:ring-1 focus:ring-jade-500 surface-card text-text-primary"
              >
                <option value="">Select field...</option>
                {FILTER_FIELDS.map((field) => (
                  <option key={field.value} value={field.value}>
                    {field.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Operator Selection */}
            {newFilter.field && (
              <div className="relative">
                <select
                  value={newFilter.operator}
                  onChange={(e) =>
                    setNewFilter((prev) => ({
                      ...prev,
                      operator: e.target.value as "equals" | "contains" | "in",
                    }))
                  }
                  className="w-full px-2 py-1.5 text-xs border-subtle rounded focus:outline-none focus:ring-1 focus:ring-jade-500 surface-card text-text-primary"
                >
                  {availableOperators.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Value Input */}
            {newFilter.field && (
              <div>
                {selectedField?.type === "select" ? (
                  <select
                    value={newFilter.value}
                    onChange={(e) =>
                      setNewFilter((prev) => ({
                        ...prev,
                        value: e.target.value,
                      }))
                    }
                    className="w-full px-2 py-1.5 text-xs border-subtle rounded focus:outline-none focus:ring-1 focus:ring-jade-500 surface-card text-text-primary"
                  >
                    <option value="">Select value...</option>
                    {selectedField.options?.map(
                      (option: FilterOption, index: number) => {
                        return (
                          <option
                            key={`${option.value}-${index}`}
                            value={option.value}
                          >
                            {option.label}
                          </option>
                        );
                      }
                    )}
                  </select>
                ) : (
                  <input
                    type={selectedField?.type === "number" ? "number" : "text"}
                    value={newFilter.value}
                    onChange={(e) =>
                      setNewFilter((prev) => ({
                        ...prev,
                        value: e.target.value,
                      }))
                    }
                    placeholder="Enter value..."
                    className="w-full px-2 py-1.5 text-xs border-subtle rounded focus:outline-none focus:ring-1 focus:ring-jade-500 surface-card text-text-primary"
                  />
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-1">
              <Button
                size="xs"
                variant="primary"
                onClick={addFilter}
                disabled={!newFilter.field || !newFilter.value}
                className="flex-1"
              >
                Add
              </Button>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => {
                  setShowAddFilter(false);
                  setNewFilter({ field: "", operator: "equals", value: "" });
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
