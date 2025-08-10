import {
  useSearchEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
} from "../../../state/calendar/hooks";
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
  } = useSearchEvents(debouncedSearch, baseQueryParams);
  const error = isError
    ? eventsError instanceof Error
      ? eventsError.message
      : "Failed to load calendar events"
    : null;
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
    createEventMutation,
    deleteEventMutation,
    updateEventMutation,
  };
}
