// Calendar Infra API (Phase 2)
// Responsibility: data fetching & persistence (currently mock + future Supabase)
import {
  parseCalendarEvents,
  parseCalendarEventCreate,
  parseCalendarEventUpdate,
  parseEventRSVPs,
  parseCalendarComments,
  parseCalendarCommentCreate,
  parseCalendarEvent,
} from "../../domain/calendar/schema";
import type {
  CalendarEventCreate,
  CalendarComment,
  CalendarEvent,
} from "../../domain/calendar/types";

// Placeholder: integrate Supabase later
// Internal helpers (moved from legacy calendarService)
interface MockEvent extends Omit<CalendarEvent, "type"> {
  type: CalendarEvent["type"];
}

function getMockUserEvents(_userId: string): MockEvent[] {
  return [
    {
      id: "1",
      title: "Game vs. Central Lions",
      start: "2025-08-16T19:00:00",
      end: "2025-08-16T21:30:00Z",
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
      end: "2025-08-13T17:30:00Z",
      type: "practice",
      team_id: "team-1",
      team_name: "BoxCall Dev Team",
      location: "School Field",
      description: "Offensive line drills and scrimmage",
      rsvp_required: false,
      tags: ["practice", "offense"],
      created_at: "2025-07-10T09:00:00Z",
    },
  ];
}

type FilterInput = {
  teamIds?: string[];
  eventTypes?: string[];
  dateRange?: { start: string; end: string };
  tags?: string[];
};
function filterEvents(
  events: MockEvent[],
  { teamIds, eventTypes, dateRange, tags }: FilterInput = {}
): MockEvent[] {
  let filtered = [...events];
  if (teamIds?.length)
    filtered = filtered.filter((e) => e.team_id && teamIds.includes(e.team_id));
  if (eventTypes?.length)
    filtered = filtered.filter((e) => eventTypes.includes(e.type));
  if (dateRange) {
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    filtered = filtered.filter((e) => {
      const d = new Date(e.start);
      return d >= start && d <= end;
    });
  }
  if (tags?.length)
    filtered = filtered.filter(
      (e) => e.tags && e.tags.some((t: string) => tags.includes(t))
    );
  return filtered;
}

function professionalDevEvents(userId: string, devMode: string): MockEvent[] {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  if (devMode === "dev_head_coach" || devMode === "dev_assistant_coach") {
    return [
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
      },
    ];
  }
  return [];
}

function mockRSVPs(eventId: string) {
  return [
    {
      id: `rsvp-1-${eventId}`,
      event_id: eventId,
      user_id: "user-1",
      status: "attending",
      created_at: "2025-08-01T10:00:00Z",
      updated_at: "2025-08-01T10:00:00Z",
    },
    {
      id: `rsvp-2-${eventId}`,
      event_id: eventId,
      user_id: "user-2",
      status: "maybe",
      created_at: "2025-08-01T11:00:00Z",
      updated_at: "2025-08-01T11:00:00Z",
    },
  ];
}

// In-memory created events (test/dev only)
const createdEvents: CalendarEvent[] = [];

export const CalendarAPI = {
  async listUserEvents(
    userId: string,
    devMode?: string,
    filters?: FilterInput
  ) {
    if (devMode === "blank_slate") return [];
    if (devMode?.startsWith("dev_")) {
      return parseCalendarEvents(professionalDevEvents(userId, devMode));
    }
    // Production/real branch placeholder (returns empty for now)
    if (devMode === "production" || devMode === "super_admin_real") {
      return [];
    }
    const base = getMockUserEvents(userId);
    const combined = [...base, ...createdEvents];
    return parseCalendarEvents(filterEvents(combined, filters));
  },
  async listTeamEvents(teamId: string) {
    const all = getMockUserEvents("team-user");
    return parseCalendarEvents(all.filter((e) => e.team_id === teamId));
  },
  async createEvent(data: CalendarEventCreate) {
    const validated = parseCalendarEventCreate(data);
    const newEvent = parseCalendarEvent({
      id: `mock-${Date.now()}`,
      ...validated,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    createdEvents.push(newEvent);
    return newEvent;
  },
  async updateEvent(_id: string, updates: Partial<CalendarEventCreate>) {
    if (Object.keys(updates).length === 0) return null;
    try {
      parseCalendarEventUpdate(updates);
    } catch {
      return null;
    }
    return null; // mock no-op
  },
  async deleteEvent(_id: string) {
    return true;
  },
  async search(query: string) {
    const term = query.toLowerCase();
    const events = getMockUserEvents("search-user");
    return parseCalendarEvents(
      (events as MockEvent[]).filter(
        (e) =>
          e.title.toLowerCase().includes(term) ||
          e.description?.toLowerCase().includes(term) ||
          e.location?.toLowerCase().includes(term) ||
          e.opponent?.toLowerCase().includes(term)
      )
    );
  },
  async upcoming(userId: string, limit = 5) {
    const events = await this.listUserEvents(userId);
    const now = new Date();
    return parseCalendarEvents(
      (events as MockEvent[])
        .filter((e) => new Date(e.start) >= now)
        .sort(
          (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
        )
        .slice(0, limit)
    );
  },
  async getRSVPs(eventId: string) {
    return parseEventRSVPs(mockRSVPs(eventId));
  },
  async listComments(_eventId: string): Promise<CalendarComment[]> {
    return parseCalendarComments([]);
  },
  async addComment(data: { event_id: string; body: string }) {
    parseCalendarCommentCreate(data);
    return parseCalendarComments([]);
  },
};
