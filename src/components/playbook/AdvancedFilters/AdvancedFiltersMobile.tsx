import React from "react";
import { Icon } from "../../ui/Icon/Icon";
import { FormSelect } from "../../ui";
import { BottomSheet } from "../../BottomSheet";
import { QuickFilterPresets } from "../QuickFilterPresets";
import type { FilterPreset } from "../filterPresets";
import { FILTER_FIELDS } from "./constants";
import type { FilterChip, FilterField, FilterOption, NewFilterState } from "./types";

// ============================================================================
// Mobile Sub-Components
// ============================================================================

export function MobileFiltersTriggerButton({
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

export function MobileActiveFilterChips({
  filterChips,
  onRemove,
}: {
  filterChips: FilterChip[];
  onRemove: (id: string) => void;
}) {
  if (filterChips.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {filterChips.map((chip) => (
        <div
          key={chip.id}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-secondary text-xs rounded-full border border-muted"
        >
          <span className="truncate max-w-36">{chip.label}</span>
          <button
            onClick={() => onRemove(chip.id)}
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
  filterChips,
  onClearAll,
  onRemove,
}: {
  filterChips: FilterChip[];
  onClearAll: () => void;
  onRemove: (id: string) => void;
}) {
  if (filterChips.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-secondary">
          Active Filters ({filterChips.length})
        </h4>
        <button
          onClick={onClearAll}
          className="px-3 py-1.5 text-xs text-error hover:text-error-hover hover:bg-surface-error-hover rounded-lg active:scale-95 transition-all"
        >
          Clear All
        </button>
      </div>
      <div className="space-y-2">
        {filterChips.map((chip) => (
          <div
            key={chip.id}
            className="flex items-center justify-between p-3 bg-secondary rounded-lg border border-muted"
          >
            <span className="text-sm text-primary flex-1 truncate">
              {chip.label}
            </span>
            <button
              onClick={() => onRemove(chip.id)}
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

// ============================================================================
// Main Mobile Component
// ============================================================================

interface AdvancedFiltersMobileProps {
  filterChips: FilterChip[];
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
}

export const AdvancedFiltersMobile: React.FC<AdvancedFiltersMobileProps> = ({
  filterChips,
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
}) => {
  return (
    <div>
      <MobileFiltersTriggerButton
        activeFiltersCount={filterChips.length}
        onOpen={() => setShowAdvanced(true)}
      />

      <MobileActiveFilterChips
        filterChips={filterChips}
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
                filterChips={filterChips}
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
              activeFiltersCount={filterChips.length}
              onApply={() => setShowAdvanced(false)}
            />
          </div>
        </BottomSheet>
      )}
    </div>
  );
};

export default AdvancedFiltersMobile;
