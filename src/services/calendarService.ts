// import { supabase } from '../lib/supabase'; // TODO: Use when implementing real database queries

// Calendar Event Types now sourced from domain layer
import type {
  CalendarEventCreate,
  EventRSVP,
  CalendarFilters,
} from "../domain/calendar/types";
export type {
  CalendarEventCreate,
  EventRSVP,
  CalendarFilters,
} from "../domain/calendar/types"; // Re-export for backward compatibility
import { CalendarAPI, CalendarRSVP, CalendarComments } from "../infra/calendar";

/**
 * Calendar Service (Legacy - Phase 2 migration in progress)
 * Responsibilities being migrated to infra/calendar/* (api, rsvp, comments, ics) and adapters.
 * New code SHOULD prefer CalendarAPI / CalendarRSVP / CalendarComments. This facade will be
 * slimmed and eventually removed once UI + state layers are refactored.
 */
export class CalendarService {
  /**
   * Get all events for a user across all teams
   */
  static async getUserEvents(
    userId: string,
    filters?: CalendarFilters,
    devMode?: string
  ) {
    return CalendarAPI.listUserEvents(userId, devMode, filters);
  }

  /**
   * Get events for a specific team
   */
  static async getTeamEvents(teamId: string) {
    return CalendarAPI.listTeamEvents(teamId);
  }

  /**
   * Create a new calendar event
   */
  static async createEvent(data: CalendarEventCreate) {
    return CalendarAPI.createEvent(data);
  }

  /**
   * Update an existing calendar event
   */
  static async updateEvent(id: string, updates: Partial<CalendarEventCreate>) {
    return CalendarAPI.updateEvent(id, updates);
  }

  /**
   * Delete a calendar event
   */
  static async deleteEvent(id: string) {
    return CalendarAPI.deleteEvent(id);
  }

  /**
   * Get RSVP status for an event
   */
  static async getEventRSVPs(eventId: string) {
    return CalendarRSVP.list(eventId);
  }

  /**
   * Create or update RSVP for an event
   */
  static async updateRSVP(
    eventId: string,
    userId: string,
    status: EventRSVP["status"],
    note?: string
  ) {
    return CalendarRSVP.upsert(eventId, userId, status, note);
  }

  /**
   * Search events across all calendars
   */
  static async searchEvents(query: string) {
    return CalendarAPI.search(query);
  }

  /**
   * Get upcoming events for dashboard widgets
   */
  static async getUpcomingEvents(userId: string, limit = 5) {
    return CalendarAPI.upcoming(userId, limit);
  }

  /**
   * Mock data for development - User Events
   */
  // Deprecated: RSVP/comments proxied through infra
  static async listComments(eventId: string) {
    return CalendarComments.list(eventId);
  }
  static async addComment(event_id: string, body: string) {
    return CalendarComments.add({ event_id, body });
  }

  /**
   * Get real user events from Supabase
   */

  /**
   * Get professional dev profile events
   */
}
