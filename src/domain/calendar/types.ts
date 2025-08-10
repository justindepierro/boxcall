// Domain Calendar Types (Phase 0 extraction - no behavior change)
// These mirror existing interfaces in services/calendarService.ts
// Phase 1 will introduce zod schemas & stricter invariants.

export type CalendarEventType = "game" | "practice" | "meeting" | "film" | "other";

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

// Phase 1 TODOs:
// - Add zod schemas (Event, Create, RSVP, Filters)
// - Introduce status (draft|published|locked) and recurrence scaffolding
// - Extract participant + comment types
