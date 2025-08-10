/**
 * Legacy CalendarService (archived)
 * --------------------------------------------------------------
 * Phase 3 Migration Note:
 * This facade is retained temporarily to support UI paths not yet
 * migrated to React Query mutation hooks. The read path is handled by
 * useEvents (state/calendar/hooks).
 *
 * DO NOT add new logic. Prefer infra/calendar/* + state layer hooks.
 */
let __warned = false;
function legacyWarn(origin?: string) {
  if (process.env.NODE_ENV !== "production" && !__warned) {
    console.warn(
      `[DEPRECATED] CalendarService is legacy (loaded${origin ? ` from ${origin}` : ""}). Migrate to React Query hooks in state/calendar/hooks.`
    );
    __warned = true;
  }
}

// import { supabase } from '../lib/supabase'; // Placeholder for real DB queries
import type {
  CalendarEventCreate,
  EventRSVP,
  CalendarFilters,
} from "../../domain/calendar/types";
export type {
  CalendarEventCreate,
  EventRSVP,
  CalendarFilters,
} from "../../domain/calendar/types"; // Backward compatibility
import {
  CalendarAPI,
  CalendarRSVP,
  CalendarComments,
} from "../../infra/calendar";

export class CalendarService {
  static async getUserEvents(
    userId: string,
    filters?: CalendarFilters,
    devMode?: string
  ) {
    legacyWarn("getUserEvents");
    return CalendarAPI.listUserEvents(userId, devMode, filters);
  }
  static async getTeamEvents(teamId: string) {
    legacyWarn("getTeamEvents");
    return CalendarAPI.listTeamEvents(teamId);
  }
  static async createEvent(data: CalendarEventCreate) {
    legacyWarn("createEvent");
    return CalendarAPI.createEvent(data);
  }
  static async updateEvent(id: string, updates: Partial<CalendarEventCreate>) {
    legacyWarn("updateEvent");
    return CalendarAPI.updateEvent(id, updates);
  }
  static async deleteEvent(id: string) {
    legacyWarn("deleteEvent");
    return CalendarAPI.deleteEvent(id);
  }
  static async getEventRSVPs(eventId: string) {
    legacyWarn("getEventRSVPs");
    return CalendarRSVP.list(eventId);
  }
  static async updateRSVP(
    eventId: string,
    userId: string,
    status: EventRSVP["status"],
    note?: string
  ) {
    legacyWarn("updateRSVP");
    return CalendarRSVP.upsert(eventId, userId, status, note);
  }
  static async searchEvents(query: string) {
    legacyWarn("searchEvents");
    return CalendarAPI.search(query);
  }
  static async getUpcomingEvents(userId: string, limit = 5) {
    legacyWarn("getUpcomingEvents");
    return CalendarAPI.upcoming(userId, limit);
  }
  static async listComments(eventId: string) {
    legacyWarn("listComments");
    return CalendarComments.list(eventId);
  }
  static async addComment(event_id: string, body: string) {
    legacyWarn("addComment");
    return CalendarComments.add({ event_id, body });
  }
}
