// Comments infra module (Phase 2)
// Provides list/add stub; future: pagination, edit/delete, rate limiting.
import { parseCalendarComments, parseCalendarCommentCreate } from "../../domain/calendar/schema";
import type { CalendarComment } from "../../domain/calendar/types";

// Simple in-memory store per event (dev/test only)
const commentStore: Record<string, CalendarComment[]> = {};

export const CalendarComments = {
  async list(eventId: string): Promise<CalendarComment[]> {
    return parseCalendarComments(commentStore[eventId] || []);
  },
  async add(data: { event_id: string; body: string }): Promise<CalendarComment> {
    parseCalendarCommentCreate(data);
    const comment: CalendarComment = {
      id: `c-${Date.now()}`,
      event_id: data.event_id,
      user_id: "mock-user",
      body: data.body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (!commentStore[data.event_id]) commentStore[data.event_id] = [];
    commentStore[data.event_id].push(comment);
    return comment;
  },
  __reset(eventId?: string) {
    if (eventId) delete commentStore[eventId];
    else Object.keys(commentStore).forEach((k) => delete commentStore[k]);
  },
};
