import type { Meta, StoryObj } from "@storybook/react";
import { BoxCallCalendar } from "./BoxCallCalendar";
import type { CalendarEvent } from "../../domain/calendar/types";

const meta: Meta<typeof BoxCallCalendar> = {
  title: "Calendar/BoxCallCalendar",
  component: BoxCallCalendar,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
A comprehensive calendar component built on FullCalendar, customized for BoxCall's design system and sports team management.

## Features

- **Event Types**: Support for games, practices, meetings, film sessions, and other events
- **Color Coding**: Automatic color assignment based on event type (games=blue, practices=green, meetings=amber, film=purple)
- **Interactive**: Event clicking, date selection, and drag-and-drop editing
- **Search Highlighting**: Text highlighting within event titles for search functionality
- **Responsive Design**: Adapts to different screen sizes with proper aspect ratios
- **Multiple Views**: Month, week, and day views with customizable initial view
- **Ref API**: Imperative API for programmatic calendar control

## Usage

Used throughout the application for displaying team schedules, practices, games, and other calendar events. Integrates with calendar services for data management and event CRUD operations.
        `,
      },
    },
  },
  argTypes: {
    events: {
      control: "object",
      description: "Array of calendar events to display",
    },
    onEventClick: {
      action: "eventClicked",
      description: "Called when an event is clicked",
    },
    onDateSelect: {
      action: "dateSelected",
      description: "Called when a date range is selected",
    },
    onEventDrop: {
      action: "eventDropped",
      description: "Called when an event is dragged and dropped",
    },
    editable: {
      control: "boolean",
      description: "Whether events can be edited (dragged/dropped)",
    },
    selectable: {
      control: "boolean",
      description: "Whether date ranges can be selected",
    },
    height: {
      control: "text",
      description: "Calendar height (CSS value or number)",
    },
    initialView: {
      control: "select",
      options: ["dayGridMonth", "timeGridWeek", "timeGridDay"],
      description: "Initial calendar view",
    },
    highlightQuery: {
      control: "text",
      description: "Search term to highlight in event titles",
    },
  },
};

export default meta;
type Story = StoryObj<typeof BoxCallCalendar>;

// Mock calendar events
const mockEvents: CalendarEvent[] = [
  {
    id: "game-1",
    title: "vs Lincoln High",
    start: "2025-01-15T19:00:00",
    end: "2025-01-15T21:00:00",
    type: "game",
    team_id: "team-123",
    team_name: "Wildcats",
    location: "Home Field",
    description: "Conference championship game",
    is_home: true,
    opponent: "Lincoln High",
    rsvp_required: true,
    tags: ["conference", "championship"],
  },
  {
    id: "practice-1",
    title: "Team Practice",
    start: "2025-01-13T16:00:00",
    end: "2025-01-13T18:00:00",
    type: "practice",
    team_id: "team-123",
    team_name: "Wildcats",
    location: "Practice Field",
    description: "Focus on offensive plays",
    rsvp_required: false,
    tags: ["offense"],
  },
  {
    id: "meeting-1",
    title: "Coaches Meeting",
    start: "2025-01-14T18:00:00",
    end: "2025-01-14T19:30:00",
    type: "meeting",
    team_id: "team-123",
    team_name: "Wildcats",
    location: "Conference Room",
    description: "Strategy discussion for upcoming game",
    rsvp_required: true,
  },
  {
    id: "film-1",
    title: "Film Review",
    start: "2025-01-16T15:00:00",
    end: "2025-01-16T17:00:00",
    type: "film",
    team_id: "team-123",
    team_name: "Wildcats",
    location: "Film Room",
    description: "Review game footage from last week",
    rsvp_required: false,
    tags: ["review"],
  },
  {
    id: "practice-2",
    title: "Scrimmage",
    start: "2025-01-17T10:00:00",
    end: "2025-01-17T12:00:00",
    type: "practice",
    team_id: "team-123",
    team_name: "Wildcats",
    location: "Stadium",
    description: "Full team scrimmage",
    rsvp_required: true,
    tags: ["scrimmage"],
  },
];

export const MonthView: Story = {
  args: {
    events: mockEvents,
    initialView: "dayGridMonth",
    height: 600,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Monthly calendar view showing all event types with color coding.",
      },
    },
  },
};

export const WeekView: Story = {
  args: {
    events: mockEvents,
    initialView: "timeGridWeek",
    height: 600,
  },
  parameters: {
    docs: {
      description: {
        story: "Weekly calendar view with time grid showing event durations.",
      },
    },
  },
};

export const DayView: Story = {
  args: {
    events: mockEvents,
    initialView: "timeGridDay",
    height: 600,
  },
  parameters: {
    docs: {
      description: {
        story: "Daily calendar view with detailed time slots.",
      },
    },
  },
};

export const InteractiveCalendar: Story = {
  args: {
    events: mockEvents,
    initialView: "dayGridMonth",
    editable: true,
    selectable: true,
    height: 600,
    onEventClick: (event) => console.log("Event clicked:", event),
    onDateSelect: (selectInfo) => console.log("Date selected:", selectInfo),
    onEventDrop: (dropInfo) => console.log("Event dropped:", dropInfo),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Interactive calendar with event clicking, date selection, and drag-and-drop enabled.",
      },
    },
  },
};

export const WithSearchHighlighting: Story = {
  args: {
    events: mockEvents,
    initialView: "dayGridMonth",
    height: 600,
    highlightQuery: "game",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Calendar with search highlighting - 'game' terms are highlighted in event titles.",
      },
    },
  },
};

export const EmptyCalendar: Story = {
  args: {
    events: [],
    initialView: "dayGridMonth",
    height: 600,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Empty calendar with no events to show the base calendar interface.",
      },
    },
  },
};

export const BusySchedule: Story = {
  args: {
    events: [
      ...mockEvents,
      {
        id: "practice-3",
        title: "Morning Conditioning",
        start: "2025-01-13T07:00:00",
        end: "2025-01-13T08:30:00",
        type: "practice",
        team_id: "team-123",
        team_name: "Wildcats",
        location: "Weight Room",
        rsvp_required: true,
      },
      {
        id: "meeting-2",
        title: "Parent Meeting",
        start: "2025-01-14T19:00:00",
        end: "2025-01-14T20:00:00",
        type: "meeting",
        team_id: "team-123",
        team_name: "Wildcats",
        location: "Auditorium",
        rsvp_required: false,
      },
      {
        id: "film-2",
        title: "Opponent Film Study",
        start: "2025-01-16T18:00:00",
        end: "2025-01-16T19:30:00",
        type: "film",
        team_id: "team-123",
        team_name: "Wildcats",
        location: "Film Room",
        description: "Study Lincoln High game footage",
        rsvp_required: true,
      },
    ],
    initialView: "timeGridWeek",
    height: 600,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Busy week schedule showing multiple events per day with overlapping times.",
      },
    },
  },
};
