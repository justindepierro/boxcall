import type { Meta, StoryObj } from "@storybook/react";
import { EventForm } from "./EventForm";
import type { CalendarEvent } from "../../../domain/calendar/types";

const meta: Meta<typeof EventForm> = {
  title: "Calendar/EventModal/EventForm",
  component: EventForm,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
A form component for creating and editing calendar events in the BoxCall calendar system.

## Features

- **Create/Edit Modes**: Supports both creating new events and editing existing ones
- **Event Types**: Dropdown selection for practice, game, meeting, film session, and other event types
- **Date/Time Input**: Proper datetime-local inputs for start and end times
- **Form Validation**: Required field validation for title and start date
- **Loading States**: Visual feedback during form submission
- **Responsive Layout**: Grid layout that adapts to different screen sizes

## Usage

Used within event modals for calendar event management. Handles form state management and validation before passing data to parent components for API calls.
        `,
      },
    },
  },
  argTypes: {
    mode: {
      control: "select",
      options: ["create", "edit"],
      description:
        "Form mode - create for new events, edit for existing events",
    },
    event: {
      control: "object",
      description: "Current event data for the form",
    },
    setEvent: {
      action: "eventChanged",
      description: "Called when form data changes",
    },
    onCancel: {
      action: "cancelled",
      description: "Called when cancel button is clicked",
    },
    onSubmit: {
      action: "submitted",
      description: "Called when form is submitted with valid data",
    },
    submitting: {
      control: "boolean",
      description: "Whether the form is currently submitting",
    },
  },
};

export default meta;
type Story = StoryObj<typeof EventForm>;

// Mock event data
const mockEvent: CalendarEvent = {
  id: "event-123",
  title: "Team Practice",
  start: "2025-01-15T16:00:00",
  end: "2025-01-15T18:00:00",
  type: "practice",
  team_id: "team-123",
  team_name: "Wildcats",
  location: "Practice Field",
  description: "Regular team practice focusing on offensive plays",
  rsvp_required: false,
  tags: ["offense"],
};

const emptyEvent: CalendarEvent = {
  id: "",
  title: "",
  start: "",
  type: "practice",
  team_id: "team-123",
  team_name: "Wildcats",
};

export const CreateEvent: Story = {
  args: {
    mode: "create",
    event: emptyEvent,
    setEvent: (event) => console.log("Event updated:", event),
    onCancel: () => console.log("Create cancelled"),
    onSubmit: async (event) => {
      console.log("Creating event:", event);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
    submitting: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Form for creating a new calendar event with empty initial values.",
      },
    },
  },
};

export const EditEvent: Story = {
  args: {
    mode: "edit",
    event: mockEvent,
    setEvent: (event) => console.log("Event updated:", event),
    onCancel: () => console.log("Edit cancelled"),
    onSubmit: async (event) => {
      console.log("Updating event:", event);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
    submitting: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Form for editing an existing calendar event with pre-filled values.",
      },
    },
  },
};

export const GameEvent: Story = {
  args: {
    mode: "create",
    event: {
      ...emptyEvent,
      type: "game",
      title: "vs Lincoln High",
      location: "Home Stadium",
      description: "Conference championship game",
    },
    setEvent: (event) => console.log("Event updated:", event),
    onCancel: () => console.log("Create cancelled"),
    onSubmit: async (event) => {
      console.log("Creating game event:", event);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
    submitting: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Form pre-configured for creating a game event with appropriate defaults.",
      },
    },
  },
};

export const MeetingEvent: Story = {
  args: {
    mode: "create",
    event: {
      ...emptyEvent,
      type: "meeting",
      title: "Coaches Strategy Meeting",
      location: "Conference Room",
      description: "Discuss game plan for upcoming match",
    },
    setEvent: (event) => console.log("Event updated:", event),
    onCancel: () => console.log("Create cancelled"),
    onSubmit: async (event) => {
      console.log("Creating meeting event:", event);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
    submitting: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Form pre-configured for creating a meeting event.",
      },
    },
  },
};

export const SubmittingState: Story = {
  args: {
    mode: "edit",
    event: mockEvent,
    setEvent: (event) => console.log("Event updated:", event),
    onCancel: () => console.log("Edit cancelled"),
    onSubmit: async (event) => {
      console.log("Submitting event:", event);
      // Simulate longer submission
      await new Promise((resolve) => setTimeout(resolve, 3000));
    },
    submitting: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Form in submitting state showing loading indicators and disabled controls.",
      },
    },
  },
};

export const FilmSession: Story = {
  args: {
    mode: "create",
    event: {
      ...emptyEvent,
      type: "film",
      title: "Game Film Review",
      location: "Film Room",
      description: "Review footage from last week's game",
    },
    setEvent: (event) => console.log("Event updated:", event),
    onCancel: () => console.log("Create cancelled"),
    onSubmit: async (event) => {
      console.log("Creating film session:", event);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
    submitting: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Form for creating a film review session event.",
      },
    },
  },
};
