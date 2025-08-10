// import { supabase } from '../lib/supabase'; // TODO: Use when implementing real database queries

// Calendar Event Types now sourced from domain layer
import type {
  CalendarEvent,
  CalendarEventCreate,
  EventRSVP,
  CalendarFilters,
} from "../domain/calendar/types";
export type {
  CalendarEvent,
  CalendarEventCreate,
  EventRSVP,
  CalendarFilters,
} from "../domain/calendar/types"; // Re-export for backward compatibility
import {
  parseCalendarEvents,
  parseEventRSVPs,
  parseCalendarEventCreate,
  parseCalendarEvent,
  parseCalendarEventUpdate,
} from "../domain/calendar/schema";

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
  ): Promise<CalendarEvent[]> {
    try {
      // Check if we're in blank slate mode
      if (devMode === "blank_slate") {
        return [];
      }

      // For professional dev profiles, get realistic dev data
      if (devMode?.startsWith("dev_")) {
        return parseCalendarEvents(
          this.getProfessionalDevEvents(userId, devMode, filters)
        );
      }

      // For production/real modes, try to get real data
      if (devMode === "production" || devMode === "super_admin_real") {
        try {
          const realEvents = await this.getRealUserEvents(userId, filters);
          return parseCalendarEvents(realEvents);
        } catch (error) {
          console.warn("Could not fetch real events, returning empty:", error);
          return [];
        }
      }

      // For legacy mock modes, return mock data
      if (devMode === "super_admin_mock" || devMode?.startsWith("view_as_")) {
        return parseCalendarEvents(this.getMockUserEvents(userId, filters));
      }

      // Default: try real data first, fallback to empty
      try {
        return parseCalendarEvents(
          await this.getRealUserEvents(userId, filters)
        );
      } catch (error) {
        console.warn("Could not fetch real events, returning empty:", error);
        return [];
      }
    } catch (error) {
      console.error("Error fetching user events:", error);
      return [];
    }
  }

  /**
   * Get events for a specific team
   */
  static async getTeamEvents(
    teamId: string,
    filters?: CalendarFilters
  ): Promise<CalendarEvent[]> {
    try {
      // TODO: Query calendar_events table joined with teams
      // const { data, error } = await supabase
      //   .from('calendar_events')
      //   .select(`
      //     *,
      //     teams (name),
      //     created_by_profile:profiles!created_by (display_name)
      //   `)
      //   .eq('team_id', teamId)
      //   .order('start', { ascending: true });

      return parseCalendarEvents(this.getMockTeamEvents(teamId, filters));
    } catch (error) {
      console.error("Error fetching team events:", error);
      return [];
    }
  }

  /**
   * Create a new calendar event
   */
  static async createEvent(
    eventData: CalendarEventCreate
  ): Promise<CalendarEvent | null> {
    try {
      // Validate input shape
      const validated = parseCalendarEventCreate(eventData);
      // TODO: Implement real database creation
      // const { data, error } = await supabase
      //   .from('calendar_events')
      //   .insert({
      //     ...eventData,
      //     searchable_content: `${eventData.title} ${eventData.description || ''} ${eventData.location || ''}`.toLowerCase(),
      //   })
      //   .select()
      //   .single();

      // For now, return mock created event
      const mockEvent: CalendarEvent = parseCalendarEvent({
        id: `mock-${Date.now()}`,
        ...validated,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      return mockEvent;
    } catch (error) {
      console.error("Error creating event:", error);
      return null;
    }
  }

  /**
   * Update an existing calendar event
   */
  static async updateEvent(
    eventId: string,
    updates: Partial<CalendarEventCreate>
  ): Promise<CalendarEvent | null> {
    try {
      if (Object.keys(updates).length === 0) {
        console.warn("updateEvent called with no updates", eventId);
        return null;
      }
      // Validate only supplied fields against partial schema
      try {
        parseCalendarEventUpdate(updates);
      } catch (e) {
        console.error("Invalid update payload rejected", e);
        return null;
      }
      // TODO: Implement real database update
      // const { data, error } = await supabase
      //   .from('calendar_events')
      //   .update({
      //     ...updates,
      //     updated_at: new Date().toISOString(),
      //   })
      //   .eq('id', eventId)
      //   .select()
      //   .single();

      console.log("Mock update event:", eventId, updates);
      return null; // Mock implementation
    } catch (error) {
      console.error("Error updating event:", error);
      return null;
    }
  }

  /**
   * Delete a calendar event
   */
  static async deleteEvent(eventId: string): Promise<boolean> {
    try {
      // TODO: Implement real database deletion
      // const { error } = await supabase
      //   .from('calendar_events')
      //   .delete()
      //   .eq('id', eventId);

      console.log("Mock delete event:", eventId);
      return true; // Mock implementation
    } catch (error) {
      console.error("Error deleting event:", error);
      return false;
    }
  }

  /**
   * Get RSVP status for an event
   */
  static async getEventRSVPs(eventId: string): Promise<EventRSVP[]> {
    try {
      // TODO: Query event_rsvps table
      // const { data, error } = await supabase
      //   .from('event_rsvps')
      //   .select(`
      //     *,
      //     profiles (display_name, avatar_url)
      //   `)
      //   .eq('event_id', eventId)
      //   .order('created_at', { ascending: false });

      return parseEventRSVPs(this.getMockRSVPs(eventId));
    } catch (error) {
      console.error("Error fetching event RSVPs:", error);
      return [];
    }
  }

  /**
   * Create or update RSVP for an event
   */
  static async updateRSVP(
    eventId: string,
    userId: string,
    status: "attending" | "not_attending" | "maybe",
    note?: string
  ): Promise<EventRSVP | null> {
    try {
      // TODO: Implement upsert operation for RSVP
      // const { data, error } = await supabase
      //   .from('event_rsvps')
      //   .upsert({
      //     event_id: eventId,
      //     user_id: userId,
      //     status,
      //     note,
      //     updated_at: new Date().toISOString(),
      //   })
      //   .select()
      //   .single();

      const mockRSVP: EventRSVP = {
        id: `rsvp-${Date.now()}`,
        event_id: eventId,
        user_id: userId,
        status,
        note,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return mockRSVP;
    } catch (error) {
      console.error("Error updating RSVP:", error);
      return null;
    }
  }

  /**
   * Search events across all calendars
   */
  static async searchEvents(
    query: string,
    filters?: CalendarFilters
  ): Promise<CalendarEvent[]> {
    try {
      // TODO: Implement full-text search
      // const { data, error } = await supabase
      //   .from('calendar_events')
      //   .select('*')
      //   .textSearch('searchable_content', query, {
      //     type: 'websearch',
      //     config: 'english'
      //   });

      const allEvents = this.getMockUserEvents("search-user", filters);
      const searchTerm = query.toLowerCase();

      const filtered = allEvents.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm) ||
          event.description?.toLowerCase().includes(searchTerm) ||
          event.location?.toLowerCase().includes(searchTerm) ||
          event.opponent?.toLowerCase().includes(searchTerm)
      );
      return parseCalendarEvents(filtered);
    } catch (error) {
      console.error("Error searching events:", error);
      return [];
    }
  }

  /**
   * Get upcoming events for dashboard widgets
   */
  static async getUpcomingEvents(
    userId: string,
    limit: number = 5
  ): Promise<CalendarEvent[]> {
    try {
      const events = await this.getUserEvents(userId);
      const now = new Date();
      const upcoming = events
        .filter((event) => new Date(event.start) >= now)
        .sort(
          (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
        )
        .slice(0, limit);
      return parseCalendarEvents(upcoming);
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
      return [];
    }
  }

  /**
   * Mock data for development - User Events
   */
  private static getMockUserEvents(
    _userId: string,
    filters?: CalendarFilters
  ): CalendarEvent[] {
    const baseEvents: CalendarEvent[] = [
      {
        id: "1",
        title: "Game vs. Central Lions",
        start: "2025-08-16T19:00:00",
        end: "2025-08-16T21:30:00",
        type: "game",
        team_id: "team-1",
        team_name: "BoxCall Dev Team",
        location: "Memorial Stadium",
        description: "Homecoming game against Central Lions",
        is_home: true,
        opponent: "Central Lions",
        rsvp_required: false,
        tags: ["important", "homecoming"],
        created_at: "2025-07-15T10:00:00Z",
      },
      {
        id: "2",
        title: "Practice",
        start: "2025-08-13T15:30:00",
        end: "2025-08-13T17:30:00",
        type: "practice",
        team_id: "team-1",
        team_name: "BoxCall Dev Team",
        location: "School Field",
        description: "Offensive line drills and scrimmage",
        rsvp_required: false,
        tags: ["practice", "offense"],
        created_at: "2025-07-10T09:00:00Z",
      },
      {
        id: "3",
        title: "7v7 Tournament",
        start: "2025-08-17T08:00:00",
        end: "2025-08-17T16:00:00",
        type: "game",
        team_id: "team-2",
        team_name: "Elite 7v7",
        location: "Regional Sports Complex",
        description: "Summer 7v7 championship tournament",
        rsvp_required: true,
        tags: ["tournament", "7v7"],
        created_at: "2025-07-05T14:00:00Z",
      },
      {
        id: "4",
        title: "Film Session",
        start: "2025-08-14T14:45:00",
        end: "2025-08-14T16:00:00",
        type: "film",
        team_id: "team-1",
        team_name: "BoxCall Dev Team",
        location: "Team Room",
        description: "Review game film from last week",
        rsvp_required: false,
        tags: ["film", "analysis"],
        created_at: "2025-07-12T11:00:00Z",
      },
      {
        id: "5",
        title: "Team Meeting",
        start: "2025-08-15T16:00:00",
        end: "2025-08-15T17:00:00",
        type: "meeting",
        team_id: "team-1",
        team_name: "BoxCall Dev Team",
        location: "Coach Office",
        description: "Weekly team meeting and game prep",
        rsvp_required: true,
        tags: ["meeting", "preparation"],
        created_at: "2025-07-08T13:00:00Z",
      },
    ];

    // Apply filters if provided
    if (filters) {
      return this.applyFilters(baseEvents, filters);
    }

    return baseEvents;
  }

  /**
   * Mock data for development - Team Events
   */
  private static getMockTeamEvents(
    teamId: string,
    filters?: CalendarFilters
  ): CalendarEvent[] {
    const userEvents = this.getMockUserEvents("team-user", filters);
    return userEvents.filter((event) => event.team_id === teamId);
  }

  /**
   * Mock RSVP data
   */
  private static getMockRSVPs(eventId: string): EventRSVP[] {
    return [
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

  /**
   * Apply filters to events
   */
  private static applyFilters(
    events: CalendarEvent[],
    filters: CalendarFilters
  ): CalendarEvent[] {
    let filtered = [...events];

    if (filters.teamIds && filters.teamIds.length > 0) {
      filtered = filtered.filter(
        (event) => event.team_id && filters.teamIds!.includes(event.team_id)
      );
    }

    if (filters.eventTypes && filters.eventTypes.length > 0) {
      filtered = filtered.filter((event) =>
        filters.eventTypes!.includes(event.type)
      );
    }

    if (filters.dateRange) {
      const start = new Date(filters.dateRange.start);
      const end = new Date(filters.dateRange.end);
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.start);
        return eventDate >= start && eventDate <= end;
      });
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(
        (event) =>
          event.tags && event.tags.some((tag) => filters.tags!.includes(tag))
      );
    }

    return filtered;
  }

  /**
   * Get real user events from Supabase
   */
  private static async getRealUserEvents(
    userId: string,
    filters?: CalendarFilters
  ): Promise<CalendarEvent[]> {
    // TODO: Implement real Supabase query
    console.log(`Getting real events for user ${userId}`, filters);

    // For now, return empty array - this will be implemented when you have real calendar data
    return [];
  }

  /**
   * Get professional dev profile events
   */
  private static getProfessionalDevEvents(
    userId: string,
    devMode: string,
    filters?: CalendarFilters
  ): CalendarEvent[] {
    // Professional dev profiles have realistic calendar events
    const baseEvents: CalendarEvent[] = [];

    // Common development events for all profiles
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    switch (devMode) {
      case "dev_head_coach":
      case "dev_assistant_coach":
        baseEvents.push(
          {
            id: "dev-practice-tomorrow",
            title: "Team Practice",
            description: "Regular practice session - offensive strategies",
            type: "practice",
            start: new Date(tomorrow.setHours(16, 0, 0, 0)).toISOString(),
            end: new Date(tomorrow.setHours(18, 0, 0, 0)).toISOString(),
            location: "Main Practice Field",
            team_id: "dev-team",
            team_name: "BoxCall Dev Team",
            created_by: userId,
            created_at: new Date().toISOString(),
          },
          {
            id: "dev-game-nextweek",
            title: "vs. Tigers",
            description: "Away game against Tigers High School",
            type: "game",
            start: new Date(nextWeek.setHours(19, 0, 0, 0)).toISOString(),
            end: new Date(nextWeek.setHours(21, 30, 0, 0)).toISOString(),
            location: "Tigers Stadium",
            team_id: "dev-team",
            team_name: "BoxCall Dev Team",
            created_by: userId,
            created_at: new Date().toISOString(),
            is_home: false,
            opponent: "Tigers High School",
          }
        );
        break;

      case "dev_player":
        baseEvents.push(
          {
            id: "dev-practice-player",
            title: "Team Practice",
            description: "QB skills and team drills",
            type: "practice",
            start: new Date(tomorrow.setHours(16, 0, 0, 0)).toISOString(),
            end: new Date(tomorrow.setHours(18, 0, 0, 0)).toISOString(),
            location: "Main Practice Field",
            team_id: "dev-team",
            team_name: "BoxCall Dev Team",
            created_by: "dev-coach",
            created_at: new Date().toISOString(),
          },
          {
            id: "dev-film-session",
            title: "Film Session",
            description: "Review last game footage and prepare for Tigers",
            type: "film",
            start: new Date(today.setHours(15, 0, 0, 0)).toISOString(),
            end: new Date(today.setHours(16, 30, 0, 0)).toISOString(),
            location: "Team Meeting Room",
            team_id: "dev-team",
            team_name: "BoxCall Dev Team",
            created_by: "dev-coach",
            created_at: new Date().toISOString(),
          }
        );
        break;

      case "dev_super_admin":
        baseEvents.push({
          id: "dev-admin-review",
          title: "Platform Review Meeting",
          description: "Review system performance and user feedback",
          type: "meeting",
          start: new Date(tomorrow.setHours(10, 0, 0, 0)).toISOString(),
          end: new Date(tomorrow.setHours(11, 0, 0, 0)).toISOString(),
          location: "BoxCall HQ",
          team_id: "dev-admin",
          team_name: "BoxCall Development",
          created_by: userId,
          created_at: new Date().toISOString(),
        });
        break;
    }

    return filters ? this.applyFilters(baseEvents, filters) : baseEvents;
  }
}
