/**
 * Legacy Hooks (archived): useCalendar, useCalendarRSVP, useUpcomingEvents
 * Superseded by React Query hooks in state/calendar/hooks.
 */
let __warnedHooks = false;
function legacyHookWarn(origin?: string) {
  if (process.env.NODE_ENV !== "production" && !__warnedHooks) {
    console.warn(
      `[DEPRECATED] useCalendar* legacy hooks (origin: ${origin || "unknown"}). Migrate to state/calendar/hooks.`
    );
    __warnedHooks = true;
  }
}
import { useCallback, useEffect, useState } from "react";
import type {
  CalendarEvent,
  CalendarEventCreate,
  CalendarFilters,
  EventRSVP,
} from "../../domain/calendar/types";
import { CalendarService } from "./calendarService";
import { useDevMode } from "../../app/dev-mode-hooks";
export const useCalendar = (userId: string, teamId?: string) => {
  legacyHookWarn("useCalendar");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CalendarFilters>({});
  const { devMode } = useDevMode();
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let fetched: CalendarEvent[];
      if (teamId) fetched = await CalendarService.getTeamEvents(teamId);
      else
        fetched = await CalendarService.getUserEvents(userId, filters, devMode);
      setEvents(fetched);
    } catch (_e) {
      setError("Failed to load calendar events");
    } finally {
      setLoading(false);
    }
  }, [userId, teamId, filters, devMode]);
  const createEvent = useCallback(async (data: CalendarEventCreate) => {
    try {
      const ev = await CalendarService.createEvent(data);
      if (ev) setEvents((p) => [...p, ev]);
      return ev;
    } catch {
      setError("Failed to create event");
      return null;
    }
  }, []);
  const updateEvent = useCallback(
    async (id: string, u: Partial<CalendarEventCreate>) => {
      try {
        const ev = await CalendarService.updateEvent(id, u);
        if (ev) setEvents((p) => p.map((e) => (e.id === id ? ev : e)));
        return ev;
      } catch {
        setError("Failed to update event");
        return null;
      }
    },
    []
  );
  const deleteEvent = useCallback(async (id: string) => {
    try {
      const ok = await CalendarService.deleteEvent(id);
      if (ok) setEvents((p) => p.filter((e) => e.id !== id));
      return ok;
    } catch {
      setError("Failed to delete event");
      return false;
    }
  }, []);
  const applyFilters = useCallback((f: CalendarFilters) => setFilters(f), []);
  const clearFilters = useCallback(() => setFilters({}), []);
  const refreshCalendar = useCallback(() => fetchEvents(), [fetchEvents]);
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
export const useCalendarRSVP = (eventId: string) => {
  legacyHookWarn("useCalendarRSVP");
  const [rsvps, setRSVPs] = useState<EventRSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchRSVPs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await CalendarService.getEventRSVPs(eventId);
      setRSVPs(data);
    } catch {
      setError("Failed to load RSVP data");
    } finally {
      setLoading(false);
    }
  }, [eventId]);
  const updateRSVP = useCallback(
    async (userId: string, status: EventRSVP["status"], note?: string) => {
      try {
        const upd = await CalendarService.updateRSVP(
          eventId,
          userId,
          status,
          note
        );
        if (upd) {
          setRSVPs((p) => {
            const existing = p.find((r) => r.user_id === userId);
            if (existing) return p.map((r) => (r.user_id === userId ? upd : r));
            return [...p, upd];
          });
          return upd;
        }
      } catch {
        setError("Failed to update RSVP");
      }
      return null;
    },
    [eventId]
  );
  const getRSVPSummary = useCallback(() => {
    const attending = rsvps.filter((r) => r.status === "attending").length;
    const notAttending = rsvps.filter(
      (r) => r.status === "not_attending"
    ).length;
    const maybe = rsvps.filter((r) => r.status === "maybe").length;
    const total = rsvps.length;
    return {
      attending,
      notAttending,
      maybe,
      total,
      attendanceRate: total ? (attending / total) * 100 : 0,
    };
  }, [rsvps]);
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
export const useUpcomingEvents = (userId: string, limit = 5) => {
  legacyHookWarn("useUpcomingEvents");
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchUpcoming = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const evs = await CalendarService.getUpcomingEvents(userId, limit);
      setUpcomingEvents(evs);
    } catch {
      setError("Failed to load upcoming events");
    } finally {
      setLoading(false);
    }
  }, [userId, limit]);
  useEffect(() => {
    fetchUpcoming();
  }, [fetchUpcoming]);
  return {
    upcomingEvents,
    loading,
    error,
    refreshUpcomingEvents: fetchUpcoming,
  };
};
