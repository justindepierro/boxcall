import {
  useSearchEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
} from "../../../stores/calendar/hooks";

import type { CalendarFilters } from "../../../domain/calendar/types";

interface UseCalendarDataArgs {
  userId: string;
  devMode?: string;
  filters: {
    teamIds?: string[];
    eventTypes?: string[];
    dateRange?: { start: string; end: string };
  };
  debouncedSearch: string;
}

export function useCalendarData({
  userId,
  devMode,
  filters,
  debouncedSearch,
}: UseCalendarDataArgs) {
  const baseQueryParams = {
    userId,
    devMode,
    filters,
    range: filters.dateRange
      ? { start: filters.dateRange.start, end: filters.dateRange.end }
      : undefined,
  };
  const {
    data: events = [],
    isLoading: loading,
    isError,
    error: eventsError,
    refetch: refetchEvents,
  } = useSearchEvents(debouncedSearch, baseQueryParams);
  const error = (() => {
    if (!isError) return null;
    if (eventsError instanceof Error) return eventsError.message;
    return "Failed to load calendar events";
  })();
  const createEventMutation = useCreateEvent(
    userId,
    devMode,
    filters as CalendarFilters
  );
  const deleteEventMutation = useDeleteEvent();
  const updateEventMutation = useUpdateEvent();
  return {
    events,
    loading,
    error,
    refetchEvents,
    createEventMutation,
    deleteEventMutation,
    updateEventMutation,
  };
}
