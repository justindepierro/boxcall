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

type NewFilterState = {
  field: string;
  operator: "equals" | "contains" | "in";
  value: string;
};

function buildFilterLabel(
  fieldLabel: string,
  operatorId: string,
  value: string
) {
  const operatorLabel = OPERATORS.find((o) => o.id === operatorId)?.label;
  return `${fieldLabel} ${operatorLabel} "${value}"`;
}

function useAdvancedFiltersController({
  onFiltersChange,
  activeFilters,
}: AdvancedFiltersProps) {
  const [showAddFilter, setShowAddFilter] = useState(false);
  // Advanced filters collapsed by default, load from localStorage for user preference
  const [showAdvanced, setShowAdvanced] = useState(() => {
    const saved = localStorage.getItem("bc_advanced_filters_expanded");
    return saved === "true";
  });
  const [activePresetId, setActivePresetId] = useState<string>("all");
  const [newFilter, setNewFilter] = useState<NewFilterState>({
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

  const selectedField = FILTER_FIELDS.find((f) => f.value === newFilter.field);

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
      const displayValue = Array.isArray(pf.value)
        ? pf.value.join(", ")
        : pf.value;

      return {
        id: `${pf.field}-${Date.now()}`,
        field: pf.field,
        operator: pf.operator,
        value: pf.value,
        label: buildFilterLabel(
          field?.label || pf.field,
          pf.operator,
          displayValue
        ),
      };
    });

    onFiltersChange(newFilters);
  };

  const resetNewFilter = () => {
    setNewFilter({ field: "", operator: "equals", value: "" });
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
      label: buildFilterLabel(field.label, newFilter.operator, newFilter.value),
    };

    // Use debounced version for smooth typing experience
    debouncedFilterChange([...activeFilters, filter]);
    resetNewFilter();
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

  const startAddFilter = () => setShowAddFilter(true);
  const cancelAddFilter = () => {
    setShowAddFilter(false);
    resetNewFilter();
  };

  const setField = (field: string) => {
    setNewFilter((prev) => ({ ...prev, field, operator: "equals", value: "" }));
  };

  const setValue = (value: string) => {
    setNewFilter((prev) => ({ ...prev, value }));
  };

  const toggleDesktopExpanded = () => {
    const next = !showAdvanced;
    setShowAdvanced(next);
    // Save user preference
    localStorage.setItem("bc_advanced_filters_expanded", String(next));
  };

  return {
    showAdvanced,
    setShowAdvanced,
    toggleDesktopExpanded,
    showAddFilter,
    setShowAddFilter,
    startAddFilter,
    cancelAddFilter,
    activePresetId,
    handlePresetSelect,
    newFilter,
    setField,
    setValue,
    selectedField,
    addFilter,
    removeFilter,
    clearAllFilters,
  };
}

function MobileFiltersTriggerButton({
  activeFiltersCount,
  onOpen,
}: {
  activeFiltersCount: number;
  onOpen: () => void;
}) {
  return (
    <button
      onClick={onOpen}
      className="w-full px-4 py-3 bg-primary rounded-lg shadow-sm border border-muted flex items-center justify-between active:scale-98 transition-transform"
    >
      <div className="flex items-center gap-2">
        <Icon name="filter" className="h-5 w-5 text-accent" />
        <span className="text-sm font-medium text-primary">Filters</span>
        {activeFiltersCount > 0 && (
          <span className="px-2 py-0.5 text-xs bg-accent text-inverse rounded-full">
            {activeFiltersCount}
          </span>
        )}
      </div>
      <Icon name="chevron-right" className="h-5 w-5 text-muted" />
    </button>
  );
}

function MobileActiveFilterChips({
  activeFilters,
  onRemove,
}: {
  activeFilters: ActiveFilter[];
  onRemove: (id: string) => void;
}) {
  if (activeFilters.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {activeFilters.map((filter) => (
        <div
          key={filter.id}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-secondary text-xs rounded-full border border-muted"
        >
          <span className="truncate max-w-36">{filter.label}</span>
          <button
            onClick={() => onRemove(filter.id)}
            className="text-muted hover:text-secondary rounded-full p-0.5 active:scale-90 transition-transform"
          >
            <Icon name="close" className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
}

function MobileSheetHeader({
  activePresetId,
  onPresetSelect,
  onClose,
}: {
  activePresetId: string;
  onPresetSelect: (preset: FilterPreset) => void;
  onClose: () => void;
}) {
  return (
    <div className="sticky top-0 z-sticky px-4 py-4 bg-primary border-b border-muted">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon name="filter" className="h-5 w-5 text-accent" />
          <h3 className="text-lg font-semibold text-primary">
            Advanced Filters
          </h3>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-secondary active:scale-95 transition-all"
        >
          <Icon name="close" className="h-5 w-5 text-muted" />
        </button>
      </div>

      <QuickFilterPresets
        activePresetId={activePresetId}
        onPresetSelect={onPresetSelect}
      />
    </div>
  );
}

function MobileSheetActiveFilters({
  activeFilters,
  onClearAll,
  onRemove,
}: {
  activeFilters: ActiveFilter[];
  onClearAll: () => void;
  onRemove: (id: string) => void;
}) {
  if (activeFilters.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-secondary">
          Active Filters ({activeFilters.length})
        </h4>
        <button
          onClick={onClearAll}
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
              onClick={() => onRemove(filter.id)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-error-hover active:scale-95 transition-all ml-2"
            >
              <Icon name="close" className="h-4 w-4 text-error" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function MobileSheetAddFilter({
  showAddFilter,
  onStartAdd,
  onCancel,
  newFilterField,
  newFilterValue,
  onSetField,
  onSetValue,
  selectedField,
  onAdd,
}: {
  showAddFilter: boolean;
  onStartAdd: () => void;
  onCancel: () => void;
  newFilterField: string;
  newFilterValue: string;
  onSetField: (field: string) => void;
  onSetValue: (value: string) => void;
  selectedField: FilterField | undefined;
  onAdd: () => void;
}) {
  return (
    <div>
      <h4 className="text-sm font-medium text-secondary mb-3">
        Add Custom Filter
      </h4>

      {!showAddFilter ? (
        <button
          onClick={onStartAdd}
          className="w-full px-4 py-3 text-sm text-secondary border border-dashed border-secondary rounded-lg hover:border-border hover:bg-secondary transition-colors active:scale-98"
        >
          <Icon name="plus" className="h-5 w-5 inline mr-2" />
          Add Custom Filter
        </button>
      ) : (
        <div className="p-4 bg-secondary rounded-lg border border-muted space-y-3">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Field
            </label>
            <FormSelect
              value={newFilterField}
              onChange={onSetField}
              placeholder="Select field..."
              options={FILTER_FIELDS.map((field) => ({
                value: field.value,
                label: field.label,
              }))}
            />
          </div>

          {newFilterField && (
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Value
              </label>
              {selectedField?.type === "select" ? (
                <FormSelect
                  value={newFilterValue}
                  onChange={onSetValue}
                  placeholder="Select value..."
                  options={
                    selectedField.options?.map((option: FilterOption) => ({
                      value: option.value,
                      label: option.label,
                    })) || []
                  }
                />
              ) : (
                <input
                  type={selectedField?.type === "number" ? "number" : "text"}
                  value={newFilterValue}
                  onChange={(e) => onSetValue(e.target.value)}
                  placeholder="Enter value..."
                  className="w-full h-12 px-3 text-sm border border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-focus-info bg-primary"
                />
              )}
            </div>
          )}

          {newFilterField && (
            <div className="flex gap-2 pt-2">
              <button
                onClick={onAdd}
                disabled={!newFilterField || !newFilterValue}
                className="flex-1 h-12 bg-accent text-inverse text-sm font-medium rounded-lg hover:bg-accent-hover disabled:bg-surface-disabled disabled:cursor-not-allowed disabled:text-disabled active:scale-98 transition-all"
              >
                Add Filter
              </button>
              <button
                onClick={onCancel}
                className="px-4 h-12 text-muted hover:text-secondary text-sm border border-muted rounded-lg hover:bg-muted active:scale-98 transition-all"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MobileSheetFooter({
  activeFiltersCount,
  onApply,
}: {
  activeFiltersCount: number;
  onApply: () => void;
}) {
  return (
    <div className="sticky bottom-0 z-sticky p-4 bg-primary border-t border-muted pb-safe">
      <button
        onClick={onApply}
        className="w-full h-12 bg-accent text-inverse text-sm font-semibold rounded-lg hover:bg-accent-hover active:scale-98 transition-all shadow-sm"
      >
        Apply Filters{activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ""}
      </button>
    </div>
  );
}

function AdvancedFiltersMobile({
  activeFilters,
  showAdvanced,
  setShowAdvanced,
  activePresetId,
  handlePresetSelect,
  showAddFilter,
  startAddFilter,
  cancelAddFilter,
  newFilter,
  setField,
  setValue,
  selectedField,
  addFilter,
  removeFilter,
  clearAllFilters,
}: {
  activeFilters: ActiveFilter[];
  showAdvanced: boolean;
  setShowAdvanced: (v: boolean) => void;
  activePresetId: string;
  handlePresetSelect: (preset: FilterPreset) => void;
  showAddFilter: boolean;
  startAddFilter: () => void;
  cancelAddFilter: () => void;
  newFilter: NewFilterState;
  setField: (field: string) => void;
  setValue: (value: string) => void;
  selectedField: FilterField | undefined;
  addFilter: () => void;
  removeFilter: (id: string) => void;
  clearAllFilters: () => void;
}) {
  return (
    <div>
      <MobileFiltersTriggerButton
        activeFiltersCount={activeFilters.length}
        onOpen={() => setShowAdvanced(true)}
      />

      <MobileActiveFilterChips
        activeFilters={activeFilters}
        onRemove={removeFilter}
      />

      {showAdvanced && (
        <BottomSheet
          snapPoints={[0.9]}
          initialSnapPoint={0}
          showHandle={true}
          backdropOpacity={0.5}
          zIndex={50}
        >
          <div className="flex flex-col h-full bg-primary">
            <MobileSheetHeader
              activePresetId={activePresetId}
              onPresetSelect={handlePresetSelect}
              onClose={() => setShowAdvanced(false)}
            />

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              <MobileSheetActiveFilters
                activeFilters={activeFilters}
                onClearAll={clearAllFilters}
                onRemove={removeFilter}
              />

              <MobileSheetAddFilter
                showAddFilter={showAddFilter}
                onStartAdd={startAddFilter}
                onCancel={cancelAddFilter}
                newFilterField={newFilter.field}
                newFilterValue={newFilter.value}
                onSetField={setField}
                onSetValue={setValue}
                selectedField={selectedField}
                onAdd={addFilter}
              />
            </div>

            <MobileSheetFooter
              activeFiltersCount={activeFilters.length}
              onApply={() => setShowAdvanced(false)}
            />
          </div>
        </BottomSheet>
      )}
    </div>
  );
}

function DesktopPresets({
  activePresetId,
  onPresetSelect,
}: {
  activePresetId: string;
  onPresetSelect: (preset: FilterPreset) => void;
}) {
  return (
    <div className="p-4 border-b border-muted">
      <QuickFilterPresets
        activePresetId={activePresetId}
        onPresetSelect={onPresetSelect}
      />
    </div>
  );
}

function DesktopHeader({
  showAdvanced,
  activeFiltersCount,
  onToggleExpanded,
  onClearAll,
}: {
  showAdvanced: boolean;
  activeFiltersCount: number;
  onToggleExpanded: () => void;
  onClearAll: () => void;
}) {
  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleExpanded}
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
            {activeFiltersCount > 0 && (
              <span className="px-1.5 py-0.5 text-xs bg-accent/10 text-accent rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
        <div className="flex items-center gap-1">
          {activeFiltersCount > 0 && (
            <button
              onClick={onClearAll}
              className="px-2 py-1 text-xs text-error hover:text-error-hover hover:bg-surface-error-hover rounded-lg active:scale-95 transition-all"
              title="Clear all filters"
            >
              Clear All
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function DesktopActiveFilters({
  activeFilters,
  onRemove,
}: {
  activeFilters: ActiveFilter[];
  onRemove: (id: string) => void;
}) {
  if (activeFilters.length === 0) return null;

  return (
    <div className="px-4 pb-3">
      <div className="flex flex-wrap gap-2">
        {activeFilters.map((filter) => (
          <div
            key={filter.id}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-secondary text-xs rounded-full border border-muted hover:border-secondary transition-colors"
          >
            <span className="truncate max-w-40">{filter.label}</span>
            <button
              onClick={() => onRemove(filter.id)}
              className="text-muted hover:text-secondary hover:bg-muted rounded-full p-0.5 active:scale-90 transition-all"
            >
              <Icon name="close" className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function DesktopAddFilter({
  showAddFilter,
  onStartAdd,
  onCancel,
  newFilter,
  setField,
  setValue,
  selectedField,
  onAdd,
}: {
  showAddFilter: boolean;
  onStartAdd: () => void;
  onCancel: () => void;
  newFilter: NewFilterState;
  setField: (field: string) => void;
  setValue: (value: string) => void;
  selectedField: FilterField | undefined;
  onAdd: () => void;
}) {
  if (!showAddFilter) {
    return (
      <button
        onClick={onStartAdd}
        className="w-full px-3 py-2 text-sm text-secondary border border-dashed border-secondary rounded-lg hover:border-border hover:bg-secondary transition-colors active:scale-98"
      >
        <Icon name="plus" className="h-4 w-4 inline mr-2" />
        Add Custom Filter
      </button>
    );
  }

  return (
    <div className="p-3 bg-secondary rounded-lg border border-muted space-y-2">
      <div className="flex gap-2 items-end">
        <div className="flex-1 min-w-0">
          <label className="block text-xs text-muted mb-1">Field</label>
          <FormSelect
            value={newFilter.field}
            onChange={setField}
            placeholder="Select field..."
            options={FILTER_FIELDS.map((field) => ({
              value: field.value,
              label: field.label,
            }))}
          />
        </div>

        {newFilter.field && (
          <div className="flex-1 min-w-0">
            <label className="block text-xs text-muted mb-1">Value</label>
            {selectedField?.type === "select" ? (
              <FormSelect
                value={newFilter.value}
                onChange={setValue}
                placeholder="Select value..."
                options={
                  selectedField.options?.map((option: FilterOption) => ({
                    value: option.value,
                    label: option.label,
                  })) || []
                }
              />
            ) : (
              <input
                type={selectedField?.type === "number" ? "number" : "text"}
                value={newFilter.value}
                onChange={(e) => setValue(e.target.value)}
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
            onClick={onAdd}
            disabled={!newFilter.field || !newFilter.value}
            className="flex-1 px-3 py-1.5 bg-accent text-inverse text-xs rounded-lg hover:bg-accent-hover disabled:bg-surface-disabled disabled:cursor-not-allowed disabled:text-disabled active:scale-95 transition-all"
          >
            Add Filter
          </button>
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-muted hover:text-secondary text-xs border border-muted rounded-lg hover:bg-muted active:scale-95 transition-all"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  onFiltersChange,
  activeFilters,
}) => {
  const isMobile = useIsMobile();
  const controller = useAdvancedFiltersController({
    onFiltersChange,
    activeFilters,
  });

  if (isMobile) {
    return (
      <AdvancedFiltersMobile
        activeFilters={activeFilters}
        showAdvanced={controller.showAdvanced}
        setShowAdvanced={controller.setShowAdvanced}
        activePresetId={controller.activePresetId}
        handlePresetSelect={controller.handlePresetSelect}
        showAddFilter={controller.showAddFilter}
        startAddFilter={controller.startAddFilter}
        cancelAddFilter={controller.cancelAddFilter}
        newFilter={controller.newFilter}
        setField={controller.setField}
        setValue={controller.setValue}
        selectedField={controller.selectedField}
        addFilter={controller.addFilter}
        removeFilter={controller.removeFilter}
        clearAllFilters={controller.clearAllFilters}
      />
    );
  }

  return (
    <div className="bg-primary rounded-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_1px_3px_rgba(0,0,0,0.1)] overflow-visible">
      <DesktopPresets
        activePresetId={controller.activePresetId}
        onPresetSelect={controller.handlePresetSelect}
      />

      <DesktopHeader
        showAdvanced={controller.showAdvanced}
        activeFiltersCount={activeFilters.length}
        onToggleExpanded={controller.toggleDesktopExpanded}
        onClearAll={controller.clearAllFilters}
      />

      <DesktopActiveFilters
        activeFilters={activeFilters}
        onRemove={controller.removeFilter}
      />

      {controller.showAdvanced && (
        <div className="px-4 pb-4 space-y-3 animate-in fade-in-0 slide-in-from-top-2 duration-300 ease-in-out">
          <DesktopAddFilter
            showAddFilter={controller.showAddFilter}
            onStartAdd={controller.startAddFilter}
            onCancel={controller.cancelAddFilter}
            newFilter={controller.newFilter}
            setField={controller.setField}
            setValue={controller.setValue}
            selectedField={controller.selectedField}
            onAdd={controller.addFilter}
          />
        </div>
      )}
    </div>
  );
};
