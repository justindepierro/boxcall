// Domain Calendar Types (Phase 0 extraction - no behavior change)
// These mirror existing interfaces in services/calendarService.ts
// Phase 1 will introduce zod schemas & stricter invariants.

export type CalendarEventType =
  | "game"
  | "practice"
  | "meeting"
  | "film"
  | "other";

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  type: CalendarEventType;
  team_id?: string;
  team_name?: string;
  location?: string;
  description?: string;
  is_home?: boolean;
  opponent?: string;
  created_by?: string;
  rsvp_required?: boolean;
  tags?: string[];
  searchable_content?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CalendarEventCreate {
  title: string;
  start: string;
  end?: string;
  type: CalendarEventType;
  team_id?: string;
  location?: string;
  description?: string;
  is_home?: boolean;
  opponent?: string;
  rsvp_required?: boolean;
  tags?: string[];
}

export interface EventRSVP {
  id: string;
  event_id: string;
  user_id: string;
  status: "attending" | "not_attending" | "maybe";
  note?: string;
  created_at: string;
  updated_at: string;
}

export interface CalendarFilters {
  teamIds?: string[];
  eventTypes?: string[];
  dateRange?: { start: string; end: string };
  tags?: string[];
}

export interface CalendarComment {
  id: string;
  event_id: string;
  user_id: string;
  body: string;
  created_at: string;
  updated_at: string;
  edited?: boolean;
  deleted?: boolean; // soft delete flag
}

export interface CalendarCommentCreate {
  event_id: string;
  body: string;
}

// Phase 1 TODOs:
// - Add zod schemas (Event, Create, RSVP, Filters)
// - Introduce status (draft|published|locked) and recurrence scaffolding
// - Extract participant + comment types

// ============================
// Zod Schemas (Phase 1)
// ============================
import { z } from "zod";

export const CalendarEventTypeSchema = z.enum([
  "game",
  "practice",
  "meeting",
  "film",
  "other",
]);

export const CalendarEventSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  start: z.string().datetime({ offset: true }).or(z.string()), // allow legacy plain ISO dates
  end: z.string().datetime({ offset: true }).or(z.string()).optional(),
  type: CalendarEventTypeSchema,
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

export const CalendarEventCreateSchema = CalendarEventSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  searchable_content: true,
  team_name: true,
}).extend({ title: z.string().min(1) });

export const EventRSVPSchema = z.object({
  id: z.string().min(1),
  event_id: z.string().min(1),
  user_id: z.string().min(1),
  status: z.enum(["attending", "not_attending", "maybe"]),
  note: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CalendarFiltersSchema = z.object({
  teamIds: z.array(z.string()).optional(),
  eventTypes: z.array(z.string()).optional(),
  dateRange: z
    .object({ start: z.string(), end: z.string() })
    .refine((r) => r.start <= r.end, "dateRange.start must be <= dateRange.end")
    .optional(),
  tags: z.array(z.string()).optional(),
});

export const CalendarCommentSchema = z.object({
  id: z.string().min(1),
  event_id: z.string().min(1),
  user_id: z.string().min(1),
  body: z.string().min(1),
  created_at: z.string(),
  updated_at: z.string(),
  edited: z.boolean().optional(),
  deleted: z.boolean().optional(),
});

export const CalendarCommentCreateSchema = z.object({
  event_id: z.string().min(1),
  body: z.string().min(1),
});

// Helpers
export type CalendarEventParsed = z.infer<typeof CalendarEventSchema>;
export type CalendarEventCreateParsed = z.infer<
  typeof CalendarEventCreateSchema
>;
export type EventRSVPParsed = z.infer<typeof EventRSVPSchema>;
export type CalendarFiltersParsed = z.infer<typeof CalendarFiltersSchema>;
export type CalendarCommentParsed = z.infer<typeof CalendarCommentSchema>;
export type CalendarCommentCreateParsed = z.infer<
  typeof CalendarCommentCreateSchema
>;
