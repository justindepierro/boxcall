// Calendar Infra API (Phase 2)
// Responsibility: data fetching & persistence (currently mock + future Supabase)
import {
  parseCalendarEvents,
  parseCalendarEventCreate,
  parseCalendarEventUpdate,
  parseEventRSVPs,
  parseCalendarComments,
  parseCalendarCommentCreate,
} from "../../domain/calendar/schema";
import type {
  CalendarEventCreate,
  CalendarComment,
} from "../../domain/calendar/types";

// Placeholder: integrate Supabase later
export const CalendarAPI = {
  async listUserEvents(userId: string, devMode?: string) {
    // Delegate to existing service for now; later remove service dependency
    const { CalendarService } = await import("../../services/calendarService");
    const events = await CalendarService.getUserEvents(
      userId,
      undefined,
      devMode
    );
    return parseCalendarEvents(events);
  },
  async createEvent(data: CalendarEventCreate) {
    const validated = parseCalendarEventCreate(data);
    const { CalendarService } = await import("../../services/calendarService");
    return CalendarService.createEvent(validated);
  },
  async updateEvent(id: string, updates: Partial<CalendarEventCreate>) {
    parseCalendarEventUpdate(updates);
    const { CalendarService } = await import("../../services/calendarService");
    return CalendarService.updateEvent(id, updates);
  },
  async getRSVPs(eventId: string) {
    const { CalendarService } = await import("../../services/calendarService");
    return parseEventRSVPs(await CalendarService.getEventRSVPs(eventId));
  },
  async listComments(_eventId: string): Promise<CalendarComment[]> {
    // Future: real fetch
    return parseCalendarComments([]);
  },
  async addComment(data: { event_id: string; body: string }) {
    parseCalendarCommentCreate(data);
    // Future: persist
    return parseCalendarComments([]);
  },
};
