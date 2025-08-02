// Unified Calendar Types for BoxCall
// This file consolidates all calendar-related types to avoid conflicts

// ============================================================================
// CORE CALENDAR EVENT INTERFACE
// ============================================================================

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO date string - standardized property name
  end?: string; // ISO date string - standardized property name
  type: 'game' | 'practice' | 'meeting' | 'film' | 'other' | 'tournament';
  team_id?: string;
  team_name?: string;
  location?: string;
  description?: string;
  is_home?: boolean; // For games
  opponent?: string; // For games
  created_by?: string;
  rsvp_required?: boolean;
  tags?: string[];
  searchable_content?: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// ALTERNATIVE PROPERTY NAMES FOR BACKWARD COMPATIBILITY
// ============================================================================

// For database operations that expect start_time/end_time
export interface CalendarEventDB extends Omit<CalendarEvent, 'start' | 'end'> {
  start_time: string;
  end_time?: string;
}

// For Phase 3 services that expect startTime/endTime
export interface CalendarEventPhase3 extends Omit<CalendarEvent, 'start' | 'end'> {
  startTime: string;
  endTime?: string;
}

// ============================================================================
// CREATE/UPDATE INTERFACES
// ============================================================================

export interface CalendarEventCreate {
  title: string;
  start: string;
  end?: string;
  type: 'game' | 'practice' | 'meeting' | 'film' | 'other' | 'tournament';
  team_id?: string;
  location?: string;
  description?: string;
  is_home?: boolean;
  opponent?: string;
  rsvp_required?: boolean;
  tags?: string[];
}

export interface CalendarEventUpdate extends Partial<CalendarEventCreate> {
  id: string;
}

// ============================================================================
// UTILITY TYPES FOR TRANSFORMATIONS
// ============================================================================

// Transform functions to convert between different naming conventions
export const transformToPhase3Event = (event: CalendarEvent): CalendarEventPhase3 => ({
  ...event,
  startTime: event.start,
  endTime: event.end,
});

export const transformToDBEvent = (event: CalendarEvent): CalendarEventDB => ({
  ...event,
  start_time: event.start,
  end_time: event.end,
});

export const transformFromPhase3Event = (event: CalendarEventPhase3): CalendarEvent => ({
  ...event,
  start: event.startTime,
  end: event.endTime,
});

export const transformFromDBEvent = (event: CalendarEventDB): CalendarEvent => ({
  ...event,
  start: event.start_time,
  end: event.end_time,
});

// ============================================================================
// TYPE GUARDS
// ============================================================================

export const isCalendarEvent = (obj: unknown): obj is CalendarEvent => {
  return obj !== null && typeof obj === 'object' && 
    'id' in obj && typeof (obj as Record<string, unknown>).id === 'string' && 
    'title' in obj && typeof (obj as Record<string, unknown>).title === 'string' && 
    'start' in obj && typeof (obj as Record<string, unknown>).start === 'string';
};

export const isCalendarEventPhase3 = (obj: unknown): obj is CalendarEventPhase3 => {
  return obj !== null && typeof obj === 'object' && 
    'id' in obj && typeof (obj as Record<string, unknown>).id === 'string' && 
    'title' in obj && typeof (obj as Record<string, unknown>).title === 'string' && 
    'startTime' in obj && typeof (obj as Record<string, unknown>).startTime === 'string';
};

export const isCalendarEventDB = (obj: unknown): obj is CalendarEventDB => {
  return obj !== null && typeof obj === 'object' && 
    'id' in obj && typeof (obj as Record<string, unknown>).id === 'string' && 
    'title' in obj && typeof (obj as Record<string, unknown>).title === 'string' && 
    'start_time' in obj && typeof (obj as Record<string, unknown>).start_time === 'string';
};
