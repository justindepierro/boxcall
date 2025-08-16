/**
 * Modern CalendarService facade
 * Thin convenience layer over infra/calendar modules for non-hook consumers (tests, scripts).
 * Hooks in state/calendar/hooks remain the preferred integration path inside React components.
 */
import { CalendarAPI, CalendarRSVP, CalendarComments } from "../infra/calendar";

import type {
  CalendarEventCreate,
  EventRSVP,
  CalendarFilters,
} from "../domain/calendar/types";

export type { CalendarEventCreate, EventRSVP, CalendarFilters };

export class CalendarService {
  static async getUserEvents(
    userId: string,
    filters?: CalendarFilters,
    devMode?: string
  ) {
    return CalendarAPI.listUserEvents(userId, devMode, filters);
  }
  static async getTeamEvents(teamId: string) {
    return CalendarAPI.listTeamEvents(teamId);
  }
  static async createEvent(data: CalendarEventCreate) {
    return CalendarAPI.createEvent(data);
  }
  static async updateEvent(id: string, updates: Partial<CalendarEventCreate>) {
    return CalendarAPI.updateEvent(id, updates);
  }
  static async deleteEvent(id: string) {
    return CalendarAPI.deleteEvent(id);
  }
  static async getEventRSVPs(eventId: string) {
    return CalendarRSVP.list(eventId);
  }
  static async updateRSVP(
    eventId: string,
    userId: string,
    status: EventRSVP["status"],
    note?: string
  ) {
    return CalendarRSVP.upsert(eventId, userId, status, note);
  }
  static async searchEvents(query: string) {
    return CalendarAPI.search(query);
  }
  static async getUpcomingEvents(userId: string, limit = 5) {
    return CalendarAPI.upcoming(userId, limit);
  }
  static async listComments(eventId: string) {
    return CalendarComments.list(eventId);
  }
  static async addComment(event_id: string, body: string) {
    return CalendarComments.add({ event_id, body });
  }
}
