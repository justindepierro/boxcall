import React from "react";
import { Icon } from "../../ui/Icon/Icon";
import { FormSelect } from "../../ui";
import { QuickFilterPresets } from "../QuickFilterPresets";
import type { FilterPreset } from "../filterPresets";
import { FILTER_FIELDS } from "./constants";
import type {
  FilterChip,
  FilterField,
  FilterOption,
  NewFilterState,
} from "./types";

// ============================================================================
// Desktop Sub-Components
// ============================================================================

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
  filterChips,
  onRemove,
}: {
  filterChips: FilterChip[];
  onRemove: (id: string) => void;
}) {
  if (filterChips.length === 0) return null;

  return (
    <div className="px-4 pb-3">
      <div className="flex flex-wrap gap-2">
        {filterChips.map((chip) => (
          <div
            key={chip.id}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/5 text-primary text-xs font-medium rounded-md border border-primary/10 hover:border-primary/20 transition-colors"
          >
            <span className="truncate max-w-40">{chip.label}</span>
            <button
              onClick={() => onRemove(chip.id)}
              className="text-primary/60 hover:text-primary hover:bg-primary/10 rounded-full p-0.5 transition-all"
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
        className="w-full px-3 py-2 text-sm text-neutral-500 dark:text-neutral-400 border border-dashed border-neutral-300 dark:border-navy-600 rounded-lg hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-200 active:scale-[0.99]"
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

// ============================================================================
// Main Desktop Component
// ============================================================================

interface AdvancedFiltersDesktopProps {
  filterChips: FilterChip[];
  showAdvanced: boolean;
  toggleDesktopExpanded: () => void;
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
}

export const AdvancedFiltersDesktop: React.FC<AdvancedFiltersDesktopProps> = ({
  filterChips,
  showAdvanced,
  toggleDesktopExpanded,
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
}) => {
  return (
    <div className="bg-primary rounded-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_1px_3px_rgba(0,0,0,0.1)] overflow-visible">
      <DesktopPresets
        activePresetId={activePresetId}
        onPresetSelect={handlePresetSelect}
      />

      <DesktopHeader
        showAdvanced={showAdvanced}
        activeFiltersCount={filterChips.length}
        onToggleExpanded={toggleDesktopExpanded}
        onClearAll={clearAllFilters}
      />

      <DesktopActiveFilters filterChips={filterChips} onRemove={removeFilter} />

      {showAdvanced && (
        <div className="px-4 pb-4 space-y-3 animate-in fade-in-0 slide-in-from-top-2 duration-300 ease-in-out">
          <DesktopAddFilter
            showAddFilter={showAddFilter}
            onStartAdd={startAddFilter}
            onCancel={cancelAddFilter}
            newFilter={newFilter}
            setField={setField}
            setValue={setValue}
            selectedField={selectedField}
            onAdd={addFilter}
          />
        </div>
      )}
    </div>
  );
};

export default AdvancedFiltersDesktop;
