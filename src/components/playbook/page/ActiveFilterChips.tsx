import React, { useMemo } from "react";

import { telemetry } from "../../../telemetry/dispatcher";
import { TelemetryEventTypes } from "../../../telemetry/events";
import { Button } from "../../ui/Button/Button";

import type { PlaybookFiltersState } from "../../../contexts/PlaybookContext";


export interface ActiveFilterChipsProps {
  searchQuery: string;
  selectedFilters: PlaybookFiltersState["selectedFilters"];
  selectedCategory?: string;
  selectedSubcategory?: string;
  advancedFilters: PlaybookFiltersState["advancedFilters"];
  onChange: (partial: {
    searchQuery?: string;
    selectedFilters?: PlaybookFiltersState["selectedFilters"];
    selectedCategory?: string;
    selectedSubcategory?: string;
    advancedFilters?: PlaybookFiltersState["advancedFilters"];
  }) => void;
}

interface ChipDef {
  id: string;
  label: string;
  remove: () => void;
}

// Small pill button styling aligned with existing inline chips in PlayCard
const chipClass =
  "group inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 hover:bg-slate-200 transition";
const removeBtnClass =
  "inline-flex items-center justify-center h-3 w-3 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-500 group-hover:text-slate-700";

export const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({
  searchQuery,
  selectedFilters,
  selectedCategory,
  selectedSubcategory,
  advancedFilters,
  onChange,
}) => {
  const chips: ChipDef[] = useMemo(() => {
    const defs: ChipDef[] = [];

    if (searchQuery.trim()) {
      defs.push({
        id: "search",
        label: `Search: "${searchQuery.trim()}"`,
        remove: () => {
          onChange({ searchQuery: "" });
          telemetry.enqueue({
            type: TelemetryEventTypes.FilterApply,
            data: { op: "remove", kind: "search" },
          });
        },
      });
    }

    // Basic named filters
    (Object.entries(selectedFilters) as [string, unknown][]).forEach(
      ([key, val]) => {
        if (val == null) return;
        if (Array.isArray(val)) {
          val.forEach((v) => {
            defs.push({
              id: `${key}:${v}`,
              label: `${key}:${v}`,
              remove: () => {
                type MutableFilters = PlaybookFiltersState["selectedFilters"];
                const next: MutableFilters = { ...selectedFilters };
                const current = Array.isArray(val) ? [...val] : [];
                const filtered = current.filter((x) => x !== v);
                if (filtered.length) {
                  // key is string; ensure assignment only if property exists in type
                  (next as Record<string, unknown>)[key] = filtered;
                } else {
                  delete (next as MutableFilters)[key as keyof MutableFilters];
                }
                onChange({ selectedFilters: next });
                telemetry.enqueue({
                  type: TelemetryEventTypes.FilterApply,
                  data: { op: "remove", kind: key, value: v },
                });
              },
            });
          });
        } else if (typeof val === "string" && val) {
          defs.push({
            id: `${key}:${val}`,
            label: `${key}:${val}`,
            remove: () => {
              type MutableFilters = PlaybookFiltersState["selectedFilters"];
              const next: MutableFilters = { ...selectedFilters };
              delete (next as MutableFilters)[key as keyof MutableFilters];
              onChange({ selectedFilters: next });
              telemetry.enqueue({
                type: TelemetryEventTypes.FilterApply,
                data: { op: "remove", kind: key },
              });
            },
          });
        }
      }
    );

    if (selectedCategory) {
      defs.push({
        id: "category",
        label: selectedSubcategory
          ? `${selectedCategory} › ${selectedSubcategory}`
          : `${selectedCategory}`,
        remove: () => {
          onChange({
            selectedCategory: undefined,
            selectedSubcategory: undefined,
          });
          telemetry.enqueue({
            type: TelemetryEventTypes.FilterApply,
            data: { op: "remove", kind: "category" },
          });
        },
      });
    }

    advancedFilters.forEach((af) => {
      defs.push({
        id: `adv:${af.id}`,
        label: af.label,
        remove: () => {
          const next = advancedFilters.filter((f) => f.id !== af.id);
          onChange({ advancedFilters: next });
          telemetry.enqueue({
            type: TelemetryEventTypes.FilterApply,
            data: { op: "remove", kind: "advanced", id: af.id },
          });
        },
      });
    });

    return defs;
  }, [
    searchQuery,
    selectedFilters,
    selectedCategory,
    selectedSubcategory,
    advancedFilters,
    onChange,
  ]);

  if (chips.length === 0) return null;

  const handleClearAll = () => {
    onChange({
      searchQuery: "",
      selectedFilters: {},
      selectedCategory: undefined,
      selectedSubcategory: undefined,
      advancedFilters: [],
    });
    telemetry.enqueue({
      type: TelemetryEventTypes.FilterApply,
      data: { op: "clear_all" },
    });
  };

  return (
    <div
      className="flex items-center flex-wrap gap-1 max-w-full overflow-hidden"
      aria-label="Active filters"
      role="list"
    >
      {chips.map((chip) => (
        <span key={chip.id} role="listitem" className={chipClass}>
          <span className="truncate max-w-[120px]" title={chip.label}>
            {chip.label}
          </span>
          <Button
            size="xs"
            variant="ghost"
            onClick={chip.remove}
            aria-label={`Remove filter: ${chip.label}`}
            className={
              removeBtnClass + " !p-0 !bg-transparent hover:!bg-transparent"
            }
          >
            ×
          </Button>
        </span>
      ))}
      <Button
        size="xs"
        variant="link"
        onClick={handleClearAll}
        aria-label="Clear all filters"
        className="ml-1 text-[11px] px-1"
      >
        Clear All
      </Button>
    </div>
  );
};

export default ActiveFilterChips;
