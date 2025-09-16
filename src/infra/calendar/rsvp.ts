// RSVP infra module (Phase 2)
// Handles retrieval and mutation of event RSVPs (mock implementation)
import { parseEventRSVPs } from "../../domain/calendar/schema";

import type { EventRSVP } from "../../domain/calendar/types";

// Internal mock generator (mirrors old CalendarService.getMockRSVPs)
// In-memory store keyed by event id
const rsvpStore: Record<string, EventRSVP[]> = {};

function seedIfMissing(eventId: string) {
  if (!rsvpStore[eventId]) {
    rsvpStore[eventId] = [
      {
        id: `rsvp-1-${eventId}`,
        event_id: eventId,
        user_id: "user-1",
        status: "attending",
        note: "Will be there early for warm-up",
        created_at: "2025-08-01T10:00:00Z",
        updated_at: "2025-08-01T10:00:00Z",
      },
      {
        id: `rsvp-2-${eventId}`,
        event_id: eventId,
        user_id: "user-2",
        status: "maybe",
        note: "Depends on work schedule",
        created_at: "2025-08-01T11:00:00Z",
        updated_at: "2025-08-01T11:00:00Z",
      },
    ];
  }
}

export const CalendarRSVP = {
  async list(eventId: string) {
    seedIfMissing(eventId);
    return parseEventRSVPs(rsvpStore[eventId]);
  },
  async upsert(
    eventId: string,
    userId: string,
    status: EventRSVP["status"],
    note?: string
  ): Promise<EventRSVP> {
    seedIfMissing(eventId);
    const existing = rsvpStore[eventId].find((r) => r.user_id === userId);
    if (existing) {
      existing.status = status;
      existing.note = note;
      existing.updated_at = new Date().toISOString();
      return existing;
    }
    const rsvp: EventRSVP = {
      id: `rsvp-${Date.now()}`,
      event_id: eventId,
      user_id: userId,
      status,
      note,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    rsvpStore[eventId].push(rsvp);
    return rsvp;
  },
  // Test utility (not exported publicly elsewhere)
  __reset(eventId?: string) {
    if (eventId) delete rsvpStore[eventId];
    else Object.keys(rsvpStore).forEach((k) => delete rsvpStore[k]);
  },
};
