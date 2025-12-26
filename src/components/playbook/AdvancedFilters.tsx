import React, { useState, useMemo } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Icon } from "../ui/Icon/Icon";
import { FormSelect } from "../ui";
import { FORMATION_OPTIONS, PLAY_TYPE_OPTIONS } from "../../types/play";
import { QuickFilterPresets } from "./QuickFilterPresets";
import type { FilterPreset } from "./filterPresets";
import { presetToFilters } from "./filterPresets";
import { BottomSheet } from "../BottomSheet";
import { useIsMobile } from "../../hooks/useBreakpoint";
import {
  readLocalString,
  storageKeys,
  writeLocalString,
} from "../../utils/storage";
import type { PlaybookFilters } from "../../types/filters";
import { EMPTY_FILTERS, hasActiveFilters } from "../../types/filters";

/**
 * Display chip for an active filter (derived from PlaybookFilters)
 * Used only for rendering - not for data storage
 */
interface FilterChip {
  id: string;
  field: string;
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
  /** Current unified filter state */
  filters: PlaybookFilters;
  /** Callback when filters change */
  onFiltersChange: (filters: PlaybookFilters) => void;
}

const FILTER_FIELDS: FilterField[] = [
  // ============ CORE IDENTIFICATION ============
  { value: "name", label: "Play Name", type: "text" },
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
  {
    value: "playFamily",
    label: "Play Family",
    type: "select",
    options: [
      { value: "inside_zone", label: "Inside Zone" },
      { value: "outside_zone", label: "Outside Zone" },
      { value: "power", label: "Power" },
      { value: "counter", label: "Counter" },
      { value: "trap", label: "Trap" },
      { value: "draw", label: "Draw" },
      { value: "screen", label: "Screen" },
      { value: "sweep", label: "Sweep" },
      { value: "quick_game", label: "Quick Game" },
      { value: "drop_back", label: "Drop Back" },
      { value: "play_action", label: "Play Action" },
      { value: "rpo", label: "RPO" },
      { value: "boot", label: "Boot/Rollout" },
      { value: "sprint_out", label: "Sprint Out" },
    ],
  },
  { value: "description", label: "Description / Notes", type: "text" },

  // ============ PERSONNEL & ALIGNMENT ============
  {
    value: "personnel",
    label: "Personnel Grouping",
    type: "select",
    options: [
      { value: "00", label: "00 (Empty)" },
      { value: "10", label: "10 (1 RB, 0 TE)" },
      { value: "11", label: "11 (1 RB, 1 TE)" },
      { value: "12", label: "12 (1 RB, 2 TE)" },
      { value: "13", label: "13 (1 RB, 3 TE)" },
      { value: "20", label: "20 (2 RB, 0 TE)" },
      { value: "21", label: "21 (2 RB, 1 TE)" },
      { value: "22", label: "22 (2 RB, 2 TE)" },
      { value: "23", label: "23 (2 RB, 3 TE / Goal Line)" },
    ],
  },
  {
    value: "prefHash",
    label: "Hash Preference",
    type: "select",
    options: [
      { value: "left", label: "Left Hash" },
      { value: "middle", label: "Middle" },
      { value: "right", label: "Right Hash" },
      { value: "any", label: "Any Hash" },
    ],
  },

  // ============ DOWN & DISTANCE (Billick Methodology) ============
  {
    value: "down",
    label: "Preferred Down",
    type: "select",
    options: [
      { value: "1", label: "1st Down" },
      { value: "2", label: "2nd Down" },
      { value: "3", label: "3rd Down" },
      { value: "4", label: "4th Down" },
      { value: "1-2", label: "Early Downs (1st & 2nd)" },
    ],
  },
  {
    value: "distance",
    label: "Distance Bucket",
    type: "select",
    options: [
      { value: "short", label: "Short (1-3 yds)" },
      { value: "medium", label: "Medium (4-6 yds)" },
      { value: "long", label: "Long (7+ yds)" },
      { value: "goal_to_go", label: "Goal to Go" },
    ],
  },
  {
    value: "downDistanceBucket",
    label: "Down & Distance",
    type: "select",
    options: [
      { value: "1st_normal", label: "1st & 10" },
      { value: "2nd_short", label: "2nd & Short (1-3)" },
      { value: "2nd_medium", label: "2nd & Medium (4-6)" },
      { value: "2nd_long", label: "2nd & Long (7+)" },
      { value: "3rd_short", label: "3rd & Short (1-3)" },
      { value: "3rd_medium", label: "3rd & Medium (4-6)" },
      { value: "3rd_long", label: "3rd & Long (7+)" },
      { value: "4th_short", label: "4th & Short" },
      { value: "goal_to_go", label: "Goal to Go" },
    ],
  },

  // ============ FIELD POSITION (Game Planning) ============
  {
    value: "fieldPosition",
    label: "Field Zone",
    type: "select",
    options: [
      { value: "backed_up", label: "Backed Up (Own 1-10)" },
      { value: "own_territory", label: "Own Territory (Own 11-49)" },
      { value: "plus_territory", label: "Plus Territory (Opp 40-21)" },
      { value: "redzone", label: "Red Zone (Opp 20-6)" },
      { value: "goalline", label: "Goal Line (Opp 5-1)" },
    ],
  },
  {
    value: "situation",
    label: "Game Situation",
    type: "select",
    options: [
      { value: "2-minute", label: "2-Minute Drill" },
      { value: "4-minute", label: "4-Minute / Ball Control" },
      { value: "coming_out", label: "Coming Out" },
      { value: "must_have", label: "Must Have" },
      { value: "openers", label: "Openers / Script" },
    ],
  },

  // ============ DEFENSIVE READS ============
  {
    value: "prefCov",
    label: "Coverage Preference",
    type: "select",
    options: [
      { value: "man", label: "vs Man Coverage" },
      { value: "zone", label: "vs Zone Coverage" },
      { value: "cover2", label: "vs Cover 2" },
      { value: "cover3", label: "vs Cover 3" },
      { value: "cover4", label: "vs Cover 4 / Quarters" },
      { value: "press", label: "vs Press" },
    ],
  },
  {
    value: "prefFront",
    label: "Front Preference",
    type: "select",
    options: [
      { value: "even", label: "vs Even Front (4-3, 4-2-5)" },
      { value: "odd", label: "vs Odd Front (3-4, 3-3-5)" },
      { value: "bear", label: "vs Bear / Goal Line" },
    ],
  },

  // ============ TAGS & CATEGORIZATION ============
  { value: "tags", label: "Tags / Flags", type: "text" },
  {
    value: "category",
    label: "Smart Category",
    type: "select",
    options: [
      { value: "run", label: "Run" },
      { value: "pass", label: "Pass" },
      { value: "rpo", label: "RPO" },
      { value: "play-action", label: "Play Action" },
      { value: "screen", label: "Screen" },
      { value: "special", label: "Special" },
    ],
  },
  {
    value: "complexity",
    label: "Install Complexity",
    type: "select",
    options: [
      { value: "1", label: "Basic (Week 1)" },
      { value: "2", label: "Intermediate (Week 2-3)" },
      { value: "3", label: "Advanced (Week 4+)" },
    ],
  },

  // ============ ANALYTICS & PERFORMANCE ============
  { value: "successRate", label: "Success Rate (%)", type: "number" },
  { value: "yardsPerPlay", label: "Yards Per Play", type: "number" },
  { value: "timesUsed", label: "Times Called", type: "number" },
  { value: "lastUsed", label: "Last Used", type: "date" },
  { value: "created_at", label: "Date Created", type: "date" },
  { value: "updated_at", label: "Last Updated", type: "date" },
];

type NewFilterState = {
  field: string;
  operator: "equals" | "contains" | "in";
  value: string;
};

/**
 * Derive displayable filter chips from unified PlaybookFilters
 * These are for UI rendering only - the source of truth is PlaybookFilters
 */
function getFilterChips(filters: PlaybookFilters): FilterChip[] {
  const chips: FilterChip[] = [];

  if (filters.playType) {
    chips.push({
      id: "playType",
      field: "playType",
      label: `Type: ${filters.playType}`,
    });
  }

  if (filters.personnel) {
    chips.push({
      id: "personnel",
      field: "personnel",
      label: `Personnel: ${filters.personnel}`,
    });
  }

  if (filters.situation) {
    chips.push({
      id: "situation",
      field: "situation",
      label: `Situation: ${filters.situation}`,
    });
  }

  if (filters.fieldPosition) {
    chips.push({
      id: "fieldPosition",
      field: "fieldPosition",
      label: `Field: ${filters.fieldPosition}`,
    });
  }

  if (filters.down) {
    chips.push({
      id: "down",
      field: "down",
      label: `Down: ${filters.down}`,
    });
  }

  if (filters.distance) {
    chips.push({
      id: "distance",
      field: "distance",
      label: `Distance: ${filters.distance}`,
    });
  }

  if (filters.tags.length > 0) {
    chips.push({
      id: "tags",
      field: "tags",
      label: `Tags: ${filters.tags.join(", ")}`,
    });
  }

  return chips;
}

/**
 * Remove a specific filter field from PlaybookFilters
 */
function removeFilterField(
  filters: PlaybookFilters,
  field: string
): PlaybookFilters {
  const updated = { ...filters };
  switch (field) {
    case "playType":
      updated.playType = null;
      break;
    case "personnel":
      updated.personnel = null;
      break;
    case "situation":
      updated.situation = null;
      break;
    case "fieldPosition":
      updated.fieldPosition = null;
      break;
    case "down":
      updated.down = null;
      break;
    case "distance":
      updated.distance = null;
      break;
    case "tags":
      updated.tags = [];
      break;
  }
  return updated;
}

/**
 * Add a filter value to PlaybookFilters
 */
function addFilterField(
  filters: PlaybookFilters,
  field: string,
  value: string
): PlaybookFilters {
  const updated = { ...filters };
  switch (field) {
    case "playType":
    case "category":
      updated.playType = value;
      break;
    case "personnel":
      updated.personnel = value;
      break;
    case "situation":
      updated.situation = value;
      break;
    case "fieldPosition":
      updated.fieldPosition = value;
      break;
    case "down":
      updated.down = value;
      break;
    case "distance":
      updated.distance = value;
      break;
    case "tags":
      // Append to existing tags
      updated.tags = [...updated.tags, value];
      break;
    case "name":
    case "formation":
    case "description":
      // Text search fields append to search
      updated.search = value;
      break;
  }
  return updated;
}

function useAdvancedFiltersController({
  filters,
  onFiltersChange,
}: AdvancedFiltersProps) {
  const [showAddFilter, setShowAddFilter] = useState(false);
  // Advanced filters collapsed by default, load from localStorage for user preference
  const [showAdvanced, setShowAdvanced] = useState(() => {
    const saved = readLocalString(storageKeys.playbook.advancedFiltersExpanded);
    return saved === "true";
  });

  // Derive active preset from current filters
  const activePresetId = useMemo(() => {
    if (filters.favoritesOnly) return "favorites";
    if (filters.mostUsedOnly) return "most-used";
    if (!hasActiveFilters(filters)) return "all";
    // For other filters, no preset matches
    return "";
  }, [filters]);

  const [newFilter, setNewFilter] = useState<NewFilterState>({
    field: "",
    operator: "equals",
    value: "",
  });

  // Derive filter chips from unified filters
  const filterChips = useMemo(() => getFilterChips(filters), [filters]);

  // 🚀 PERFORMANCE: Debounce filter changes to prevent lag during typing (150ms)
  const debouncedFilterChange = useDebouncedCallback(
    (newFilters: PlaybookFilters) => {
      onFiltersChange(newFilters);
    },
    150
  );

  const selectedField = FILTER_FIELDS.find((f) => f.value === newFilter.field);

  const handlePresetSelect = (preset: FilterPreset) => {
    // Use presetToFilters for unified conversion
    const newFilters = presetToFilters(preset);
    onFiltersChange(newFilters);
  };

  const resetNewFilter = () => {
    setNewFilter({ field: "", operator: "equals", value: "" });
  };

  const addFilter = () => {
    if (!newFilter.field || !newFilter.value) return;

    const field = FILTER_FIELDS.find((f) => f.value === newFilter.field);
    if (!field) return;

    // Add to unified filters
    const updatedFilters = addFilterField(
      filters,
      newFilter.field,
      newFilter.value
    );

    // Use debounced version for smooth typing experience
    debouncedFilterChange(updatedFilters);
    resetNewFilter();
    setShowAddFilter(false);
  };

  const removeFilter = (chipId: string) => {
    // chipId is the field name (e.g., "playType", "personnel")
    const updatedFilters = removeFilterField(filters, chipId);
    // Instant removal (no need to debounce deletions)
    onFiltersChange(updatedFilters);
  };

  const clearAllFilters = () => {
    // Instant clear - reset to empty
    onFiltersChange({ ...EMPTY_FILTERS });
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
    writeLocalString(
      storageKeys.playbook.advancedFiltersExpanded,
      String(next)
    );
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
    filterChips,
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

function AdvancedFiltersMobile({
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
}: {
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
}) {
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-secondary text-xs rounded-full border border-muted hover:border-secondary transition-colors"
          >
            <span className="truncate max-w-40">{chip.label}</span>
            <button
              onClick={() => onRemove(chip.id)}
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
  filters,
  onFiltersChange,
}) => {
  const isMobile = useIsMobile();
  const controller = useAdvancedFiltersController({
    filters,
    onFiltersChange,
  });

  if (isMobile) {
    return (
      <AdvancedFiltersMobile
        filterChips={controller.filterChips}
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
        activeFiltersCount={controller.filterChips.length}
        onToggleExpanded={controller.toggleDesktopExpanded}
        onClearAll={controller.clearAllFilters}
      />

      <DesktopActiveFilters
        filterChips={controller.filterChips}
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
