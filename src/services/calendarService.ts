/**
 * Modern CalendarService facade
 * Unified calendar, events, and RSVP management service
 * Consolidates:
 * - CalendarService (facade over infra/calendar modules)
 * - eventsService (team_events table operations)
 * - rsvpService (advanced RSVP management)
 *
 * Hooks in state/calendar/hooks remain the preferred integration path inside React components.
 */
import { CalendarAPI, CalendarRSVP, CalendarComments } from "../infra/calendar";
import { getCurrentUserId } from "../lib/auth-helpers";
import { table } from "../data/supabase/db";

import type {
  CalendarEventCreate,
  EventRSVP,
  CalendarFilters,
} from "../domain/calendar/types";
import type { PostgrestError } from "@supabase/supabase-js";
import type { AdvancedRSVP } from "../types/rsvp";
import { debug, warn } from "../utils/logger";

export type { CalendarEventCreate, EventRSVP, CalendarFilters };

// Types from eventsService
export interface TeamEventListItem {
  id: string;
  team_id: string;
  created_by: string;
  title: string;
  event_type: string;
  starts_at: string;
  location: string | null;
  created_at: string | null;
}

export interface CreateEventInput {
  teamId: string;
  title: string;
  eventType: string;
  startsAt: string; // ISO
  location?: string;
}

const EVENT_COLUMNS =
  "id, team_id, created_by, title, event_type, starts_at, location, created_at" as const;

export class CalendarService {
  // ============================================================================
  // CALENDAR API METHODS (from infra/calendar)
  // ============================================================================

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

  // ============================================================================
  // TEAM EVENTS METHODS (from eventsService)
  // ============================================================================

  static async listTeamEvents(teamId: string): Promise<TeamEventListItem[]> {
    if (!teamId) return [];
    const { data, error, status } = await table("team_events")
      .select(EVENT_COLUMNS)
      .eq("team_id", teamId)
      .order("starts_at", { ascending: true });

    if (error) {
      const pgErr = error as PostgrestError;
      if (status === 404 || pgErr?.code === "42P01") {
        if (import.meta.env.DEV && import.meta.env.MODE !== "test") {
          warn(
            "team_events relation not found (likely migrations pending) – returning empty list"
          );
        }
        return [];
      }
      throw error;
    }

    return (data ?? []).map(
      (e: any): TeamEventListItem => ({
        id: String(e.id),
        team_id: String(e.team_id ?? teamId),
        created_by: String(e.created_by ?? ""),
        title: String(e.title ?? ""),
        event_type: String(e.event_type ?? ""),
        starts_at: String(e.starts_at ?? ""),
        location: e.location ?? null,
        created_at: e.created_at ?? null,
      })
    );
  }

  static async createTeamEvent(input: CreateEventInput) {
    const { teamId, title, eventType, startsAt, location } = input;

    // Retrieve current authenticated user for created_by (required by NOT NULL + RLS policies)
    const userId = getCurrentUserId();
    if (!userId) throw new Error("No authenticated user");

    const event_date = startsAt.slice(0, 10);

    const { data, error } = await table("team_events")
      .insert({
        team_id: teamId,
        created_by: userId,
        title,
        event_type: eventType,
        starts_at: startsAt,
        event_date,
        location,
      })
      .select(EVENT_COLUMNS)
      .single();

    if (error) throw error;
    return {
      id: String(data.id),
      team_id: String(data.team_id ?? teamId),
      created_by: String(data.created_by ?? userId),
      title: String(data.title ?? title),
      event_type: String(data.event_type ?? eventType),
      starts_at: String(data.starts_at ?? startsAt),
      location: data.location ?? null,
      created_at: data.created_at ?? null,
    } as TeamEventListItem;
  }

  // ============================================================================
  // ADVANCED RSVP METHODS (from rsvpService)
  // ============================================================================

  static async updateAdvancedRSVP(
    eventId: string,
    userId: string,
    rsvpData: Partial<AdvancedRSVP>
  ): Promise<AdvancedRSVP> {
    // TODO: Implement with actual Supabase integration when database is active
    const rsvp: AdvancedRSVP = {
      id: `rsvp_${eventId}_${userId}`,
      event_id: eventId,
      user_id: userId,
      status: rsvpData.status || "no_response",
      response_type: rsvpData.response_type || "simple",
      conditions: rsvpData.conditions,
      conditional_status: rsvpData.conditional_status,
      arrival_time: rsvpData.arrival_time,
      departure_time: rsvpData.departure_time,
      transportation: rsvpData.transportation,
      dietary_restrictions: rsvpData.dietary_restrictions || [],
      special_requests: rsvpData.special_requests,
      emergency_contact: rsvpData.emergency_contact,
      group_size: rsvpData.group_size,
      attendee_names: rsvpData.attendee_names,
      notes: rsvpData.notes,
      private_notes: rsvpData.private_notes,
      confidence_level: rsvpData.confidence_level,
      responded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      reminder_sent_at: rsvpData.reminder_sent_at,
      ...rsvpData,
    };

    return rsvp;
  }

  static async sendRSVPReminders(
    eventId: string,
    userIds?: string[]
  ): Promise<void> {
    // TODO: Implement reminder logic when email service is integrated
    debug(`Sending RSVP reminders for event ${eventId} to users:`, userIds);
  }
}

// Backward compatibility exports
export { CalendarService as EventsService };
export const RSVPService = CalendarService;
export const rsvpService = {
  updateRSVP: (
    eventId: string,
    userId: string,
    rsvpData: Partial<AdvancedRSVP>
  ) => CalendarService.updateAdvancedRSVP(eventId, userId, rsvpData),
  sendRSVPReminders: (eventId: string, userIds?: string[]) =>
    CalendarService.sendRSVPReminders(eventId, userIds),
};

// Legacy function exports for eventsService compatibility
export const listTeamEvents = (teamId: string) =>
  CalendarService.listTeamEvents(teamId);
export const createEvent = (input: CreateEventInput) =>
  CalendarService.createTeamEvent(input);
