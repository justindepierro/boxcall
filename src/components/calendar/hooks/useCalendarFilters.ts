import { useState } from "react";

import { useDebouncedValue } from "../../../hooks/useDebouncedValue";

import type { CalendarFilters } from "../../../domain/calendar/types";

// Handles calendar filters + search state with debounced search value
export function useCalendarFilters(initialWindowDays = 30) {
  const initialFilters: CalendarFilters = {
    teamIds: [],
    eventTypes: [],
    dateRange: {
      start: new Date().toISOString().split("T")[0],
      end: new Date(Date.now() + initialWindowDays * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    },
  };
  const [filters, setFilters] = useState<CalendarFilters>(initialFilters);
  const [searchQuery, setSearchQuery] = useState("");
  const handleFilterChange = (newFilters: Partial<CalendarFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };
  const debouncedSearch = useDebouncedValue(searchQuery, 350);
  return {
    filters,
    setFilters,
    searchQuery,
    setSearchQuery,
    handleFilterChange,
    debouncedSearch,
  };
}
