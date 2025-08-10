import React, { useState } from "react";
import { Filter, Plus, X } from "lucide-react";
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
    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
      {/* Header */}
      <div className="p-3 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Filter className="h-4 w-4 text-slate-500 mr-2" />
            <h3 className="font-medium text-slate-900">Filters</h3>
            {activeFilters.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                {activeFilters.length}
              </span>
            )}
          </div>
          {activeFilters.length > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-red-600 hover:text-red-700 font-medium"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="p-3 space-y-2">
          {activeFilters.map((filter) => (
            <div
              key={filter.id}
              className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded px-2 py-1"
            >
              <span className="text-xs text-blue-900 truncate flex-1">
                {filter.label}
              </span>
              <button
                onClick={() => removeFilter(filter.id)}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Filter Section */}
      <div className="p-3 border-t border-slate-100">
        {!showAddFilter ? (
          <button
            onClick={() => setShowAddFilter(true)}
            className="w-full flex items-center justify-center px-2 py-1.5 text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-50 border border-dashed border-slate-300 rounded transition-colors"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Filter
          </button>
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
                className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-jade-500"
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
                  className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-jade-500"
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
                    className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-jade-500"
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
                    className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-jade-500"
                  />
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-1">
              <button
                onClick={addFilter}
                disabled={!newFilter.field || !newFilter.value}
                className="flex-1 px-2 py-1 text-xs bg-jade-600 text-white rounded hover:bg-jade-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddFilter(false);
                  setNewFilter({ field: "", operator: "equals", value: "" });
                }}
                className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
