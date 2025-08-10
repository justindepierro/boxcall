// Zod schemas for calendar domain (Phase 1)
// NOTE: Pure validation layer; no side effects.
import { z } from "zod";

export const calendarEventTypeEnum = z.enum([
  "game",
  "practice",
  "meeting",
  "film",
  "other",
]);

export const calendarEventBase = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  start: z.string().datetime({ offset: true }).or(z.string()), // allow relaxed now, tighten later
  end: z.string().datetime({ offset: true }).optional(),
  type: calendarEventTypeEnum,
  team_id: z.string().optional(),
  team_name: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  is_home: z.boolean().optional(),
  opponent: z.string().optional(),
  created_by: z.string().optional(),
  rsvp_required: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  searchable_content: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const calendarEventCreate = z.object({
  title: calendarEventBase.shape.title,
  start: calendarEventBase.shape.start,
  end: calendarEventBase.shape.end,
  type: calendarEventBase.shape.type,
  team_id: calendarEventBase.shape.team_id,
  location: calendarEventBase.shape.location,
  description: calendarEventBase.shape.description,
  is_home: calendarEventBase.shape.is_home,
  opponent: calendarEventBase.shape.opponent,
  rsvp_required: calendarEventBase.shape.rsvp_required,
  tags: calendarEventBase.shape.tags,
});

// Partial update schema: any subset of creatable fields; empty object disallowed later by service
export const calendarEventUpdate = calendarEventCreate.partial();

export const eventRSVP = z.object({
  id: z.string(),
  event_id: z.string(),
  user_id: z.string(),
  status: z.enum(["attending", "not_attending", "maybe"]),
  note: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const calendarFilters = z.object({
  teamIds: z.array(z.string()).optional(),
  eventTypes: z.array(z.string()).optional(),
  dateRange: z.object({ start: z.string(), end: z.string() }).optional(),
  tags: z.array(z.string()).optional(),
});

export const calendarComment = z.object({
  id: z.string(),
  event_id: z.string(),
  user_id: z.string(),
  body: z.string().min(1),
  created_at: z.string(),
  updated_at: z.string(),
  edited: z.boolean().optional(),
  deleted: z.boolean().optional(),
});

export const calendarCommentCreate = z.object({
  event_id: z.string(),
  body: z.string().min(1),
});

// Helper parse functions (to be used by infra layer later)
export const parseCalendarEvent = (data: unknown) =>
  calendarEventBase.parse(data);
export const parseCalendarEvents = (data: unknown) =>
  z.array(calendarEventBase).parse(data);
export const parseCalendarEventCreate = (data: unknown) =>
  calendarEventCreate.parse(data);
export const parseCalendarEventUpdate = (data: unknown) =>
  calendarEventUpdate.parse(data);
export const parseCalendarFilters = (data: unknown) =>
  calendarFilters.parse(data);
export const parseEventRSVPs = (data: unknown) =>
  z.array(eventRSVP).parse(data);
export const parseCalendarComments = (data: unknown) =>
  z.array(calendarComment).parse(data);
export const parseCalendarCommentCreate = (data: unknown) =>
  calendarCommentCreate.parse(data);
