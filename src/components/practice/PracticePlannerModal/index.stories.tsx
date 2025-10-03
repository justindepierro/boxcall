import type { Meta, StoryObj } from "@storybook/react-vite";
import { PracticePlannerModal } from "./index";
import type { CalendarEvent } from "../../../domain/calendar/types";

const meta: Meta<typeof PracticePlannerModal> = {
  title: "Practice/PracticePlannerModal",
  component: PracticePlannerModal,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
A comprehensive practice planning modal for creating and managing detailed practice schedules.

## Features

- **Practice Blocks**: Organize practice into timed blocks with different categories (offense, defense, special teams, etc.)
- **Duration Tracking**: Visual tracking of total vs scheduled practice time
- **Role-Based Access**: Different features available for head coaches vs position coaches
- **Drag-and-Drop**: Reorder practice blocks and assign scripts
- **Group Management**: Create sub-groups within practice blocks
- **Time Allocation**: Allocate time blocks and assign coaches
- **Script Integration**: Link practice scripts to specific blocks

## Usage

Used for detailed practice planning where coaches need to break down practice time into specific activities, assign coaches to different segments, and track timing throughout the session.
        `,
      },
    },
  },
  argTypes: {
    event: {
      control: "object",
      description: "Calendar event data for the practice session",
    },
    onClose: {
      action: "closed",
      description: "Called when the modal should be closed",
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-gray-100 p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PracticePlannerModal>;

// Mock calendar event for practice
const mockPracticeEvent: CalendarEvent = {
  id: "practice-123",
  title: "Team Practice - Offense Focus",
  start: "2025-01-15T16:00:00",
  end: "2025-01-15T18:00:00",
  type: "practice",
  team_id: "team-123",
  team_name: "Wildcats",
  location: "Practice Field A",
  description: "Focus on offensive plays and timing",
  rsvp_required: true,
  tags: ["offense", "timing"],
};

export const HeadCoachView: Story = {
  args: {
    event: mockPracticeEvent,
    onClose: () => console.log("Modal closed"),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Practice planner view for head coaches with full planning capabilities.",
      },
    },
  },
};

export const PositionCoachView: Story = {
  args: {
    event: mockPracticeEvent,
    onClose: () => console.log("Modal closed"),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Practice planner view for position coaches with limited editing capabilities.",
      },
    },
  },
};

export const ShortPractice: Story = {
  args: {
    event: {
      ...mockPracticeEvent,
      title: "Quick Practice Session",
      start: "2025-01-15T17:00:00",
      end: "2025-01-15T18:30:00",
      description: "Short practice session for review",
    },
    onClose: () => console.log("Modal closed"),
  },
  parameters: {
    docs: {
      description: {
        story: "Modal for a shorter practice session (90 minutes).",
      },
    },
  },
};

export const LongPractice: Story = {
  args: {
    event: {
      ...mockPracticeEvent,
      title: "Extended Practice Session",
      start: "2025-01-15T15:00:00",
      end: "2025-01-15T19:00:00",
      description: "Extended practice with full team activities",
    },
    onClose: () => console.log("Modal closed"),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Modal for a longer practice session (4 hours) with more complex planning.",
      },
    },
  },
};

export const GameDayPractice: Story = {
  args: {
    event: {
      ...mockPracticeEvent,
      title: "Pre-Game Walkthrough",
      start: "2025-01-18T10:00:00",
      end: "2025-01-18T11:30:00",
      location: "Locker Room",
      description: "Final walkthrough before game day",
      tags: ["game-day", "walkthrough"],
    },
    onClose: () => console.log("Modal closed"),
  },
  parameters: {
    docs: {
      description: {
        story: "Modal for game day practice with specific timing and location.",
      },
    },
  },
};

export const OffSeasonPractice: Story = {
  args: {
    event: {
      ...mockPracticeEvent,
      title: "Off-Season Conditioning",
      start: "2025-06-15T08:00:00",
      end: "2025-06-15T10:00:00",
      location: "Weight Room",
      description: "Strength and conditioning session",
      tags: ["off-season", "conditioning"],
    },
    onClose: () => console.log("Modal closed"),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Modal for off-season practice focused on conditioning and strength training.",
      },
    },
  },
};
