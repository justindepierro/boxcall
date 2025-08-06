import { useCallback, useEffect, useState } from "react";
import type {
  CalendarEvent,
  CalendarEventCreate,
  CalendarFilters,
  EventRSVP,
} from "../services/calendarService";
import { CalendarService } from "../services/calendarService";
import { useDevMode } from "../app/dev-mode-hooks";
/**
 * useCalendar Hook
 *
 * Manages calendar data fetching, filtering, and state management
 * for both personal and team calendar components
 */
export const useCalendar = (userId: string, teamId?: string) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CalendarFilters>({});
  const { devMode } = useDevMode();
  /**
   * Fetch calendar events
   */
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let fetchedEvents: CalendarEvent[];
      if (teamId) {
        // Fetch team-specific events
        fetchedEvents = await CalendarService.getTeamEvents(teamId, filters);
      } else {
        // Fetch user events across all teams
        fetchedEvents = await CalendarService.getUserEvents(
          userId,
          filters,
          devMode
        );
      }
      setEvents(fetchedEvents);
    } catch (err) {
      console.error("Error fetching calendar events:", err);
      setError("Failed to load calendar events");
    } finally {
      setLoading(false);
    }
  }, [userId, teamId, filters, devMode]);
  /**
   * Create a new event
   */
  const createEvent = useCallback(async (eventData: CalendarEventCreate) => {
    try {
      const newEvent = await CalendarService.createEvent(eventData);
      if (newEvent) {
        setEvents((prev) => [...prev, newEvent]);
        return newEvent;
      }
    } catch (err) {
      console.error("Error creating event:", err);
      setError("Failed to create event");
    }
    return null;
  }, []);
  /**
   * Update an existing event
   */
  const updateEvent = useCallback(
    async (eventId: string, updates: Partial<CalendarEventCreate>) => {
      try {
        const updatedEvent = await CalendarService.updateEvent(
          eventId,
          updates
        );
        if (updatedEvent) {
          setEvents((prev) =>
            prev.map((event) => (event.id === eventId ? updatedEvent : event))
          );
          return updatedEvent;
        }
      } catch (err) {
        console.error("Error updating event:", err);
        setError("Failed to update event");
      }
      return null;
    },
    []
  );
  /**
   * Delete an event
   */
  const deleteEvent = useCallback(async (eventId: string) => {
    try {
      const success = await CalendarService.deleteEvent(eventId);
      if (success) {
        setEvents((prev) => prev.filter((event) => event.id !== eventId));
        return true;
      }
    } catch (err) {
      console.error("Error deleting event:", err);
      setError("Failed to delete event");
    }
    return false;
  }, []);
  /**
   * Apply filters to calendar view
   */
  const applyFilters = useCallback((newFilters: CalendarFilters) => {
    setFilters(newFilters);
  }, []);
  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);
  /**
   * Refresh calendar data
   */
  const refreshCalendar = useCallback(() => {
    fetchEvents();
  }, [fetchEvents]);
  // Initial load
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);
  return {
    events,
    loading,
    error,
    filters,
    createEvent,
    updateEvent,
    deleteEvent,
    applyFilters,
    clearFilters,
    refreshCalendar,
  };
};
/**
 * useCalendarRSVP Hook
 *
 * Manages RSVP functionality for calendar events
 */
export const useCalendarRSVP = (eventId: string) => {
  const [rsvps, setRSVPs] = useState<EventRSVP[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  /**
   * Fetch RSVP data for event
   */
  const fetchRSVPs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedRSVPs = await CalendarService.getEventRSVPs(eventId);
      setRSVPs(fetchedRSVPs);
    } catch (err) {
      console.error("Error fetching RSVPs:", err);
      setError("Failed to load RSVP data");
    } finally {
      setLoading(false);
    }
  }, [eventId]);
  /**
   * Update user's RSVP status
   */
  const updateRSVP = useCallback(
    async (
      userId: string,
      status: "attending" | "not_attending" | "maybe",
      note?: string
    ) => {
      try {
        const updatedRSVP = await CalendarService.updateRSVP(
          eventId,
          userId,
          status,
          note
        );
        if (updatedRSVP) {
          setRSVPs((prev) => {
            const existing = prev.find((rsvp) => rsvp.user_id === userId);
            if (existing) {
              return prev.map((rsvp) =>
                rsvp.user_id === userId ? updatedRSVP : rsvp
              );
            } else {
              return [...prev, updatedRSVP];
            }
          });
          return updatedRSVP;
        }
      } catch (err) {
        console.error("Error updating RSVP:", err);
        setError("Failed to update RSVP");
      }
      return null;
    },
    [eventId]
  );
  /**
   * Get RSVP summary stats
   */
  const getRSVPSummary = useCallback(() => {
    const attending = rsvps.filter(
      (rsvp) => rsvp.status === "attending"
    ).length;
    const notAttending = rsvps.filter(
      (rsvp) => rsvp.status === "not_attending"
    ).length;
    const maybe = rsvps.filter((rsvp) => rsvp.status === "maybe").length;
    const total = rsvps.length;
    return {
      attending,
      notAttending,
      maybe,
      total,
      attendanceRate: total > 0 ? (attending / total) * 100 : 0,
    };
  }, [rsvps]);
  // Initial load
  useEffect(() => {
    fetchRSVPs();
  }, [fetchRSVPs]);
  return {
    rsvps,
    loading,
    error,
    updateRSVP,
    getRSVPSummary,
    refreshRSVPs: fetchRSVPs,
  };
};
/**
 * useUpcomingEvents Hook
 *
 * Simplified hook for dashboard widgets showing upcoming events
 */
export const useUpcomingEvents = (userId: string, limit: number = 5) => {
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const fetchUpcomingEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const events = await CalendarService.getUpcomingEvents(userId, limit);
      setUpcomingEvents(events);
    } catch (err) {
      console.error("Error fetching upcoming events:", err);
      setError("Failed to load upcoming events");
    } finally {
      setLoading(false);
    }
  }, [userId, limit]);
  useEffect(() => {
    fetchUpcomingEvents();
  }, [fetchUpcomingEvents]);
  return {
    upcomingEvents,
    loading,
    error,
    refreshUpcomingEvents: fetchUpcomingEvents,
  };
};
