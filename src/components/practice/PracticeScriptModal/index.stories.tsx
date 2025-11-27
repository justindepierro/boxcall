import type { Meta, StoryObj } from "@storybook/react-vite";
import { PracticeScriptModal } from "./index";
import type { PracticeScript } from "./types";

const meta: Meta<typeof PracticeScriptModal> = {
  title: "Practice/PracticeScriptModal",
  component: PracticeScriptModal,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
A modal for creating and editing practice scripts that organize plays for practice sessions.

## Features

- **Script Metadata**: Name, date, and opponent information
- **Play Management**: Add, edit, and remove plays from the script
- **Play Details**: Personnel, defensive assignments, and situational notes
- **Playbook Integration**: Link plays from the team's playbook
- **Drag-and-Drop**: Reorder plays within the script
- **Validation**: Required field validation for script name

## Usage

Used by coaches to create structured practice scripts that organize which plays to run during practice, including defensive assignments and situational context for each play.
        `,
      },
    },
  },
  argTypes: {
    onClose: {
      action: "closed",
      description: "Called when the modal should be closed",
    },
    onSave: {
      action: "scriptSaved",
      description: "Called when the script is saved with complete data",
    },
    initialScript: {
      control: "object",
      description: "Initial script data for editing existing scripts",
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-muted p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PracticeScriptModal>;

export const CreateNewScript: Story = {
  args: {
    onClose: () => console.log("Modal closed"),
    onSave: (script: PracticeScript) => console.log("Script saved:", script),
  },
  parameters: {
    docs: {
      description: {
        story: "Modal for creating a new practice script from scratch.",
      },
    },
  },
};

export const EditExistingScript: Story = {
  args: {
    onClose: () => console.log("Modal closed"),
    onSave: (script: PracticeScript) => console.log("Script updated:", script),
    initialScript: {
      id: "script-123",
      name: "Offensive Drive Script",
      date: "2025-01-15",
      opponent: "Lincoln High",
      plays: [
        {
          id: "play-1",
          playId: "pb-play-456",
          playName: "Power Sweep",
          personnel: "11 Personnel",
          notes: "Run to the right side",
          defenseFront: "4-3",
          defensiveCoverage: "Cover 2",
          situation: "1st & 10",
        },
        {
          id: "play-2",
          playId: "pb-play-789",
          playName: "Slant Route",
          personnel: "12 Personnel",
          notes: "Quick pass to WR1",
          defenseFront: "3-4",
          defensiveCoverage: "Man Coverage",
          situation: "2nd & 8",
        },
      ],
      createdAt: new Date("2025-01-10"),
      updatedAt: new Date("2025-01-12"),
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Modal for editing an existing practice script with pre-filled data and plays.",
      },
    },
  },
};

export const GameSpecificScript: Story = {
  args: {
    onClose: () => console.log("Modal closed"),
    onSave: (script: PracticeScript) =>
      console.log("Game script saved:", script),
    initialScript: {
      id: "game-script-456",
      name: "vs Lincoln High - Game Script",
      date: "2025-01-18",
      opponent: "Lincoln High",
      plays: [
        {
          id: "game-play-1",
          playName: "Opening Drive - Power Run",
          personnel: "11 Personnel",
          defenseFront: "4-3",
          defensiveCoverage: "Cover 3",
          situation: "1st & 10 at 50 yard line",
        },
        {
          id: "game-play-2",
          playName: "2nd Down Pass - Slant",
          personnel: "12 Personnel",
          defenseFront: "3-4",
          defensiveCoverage: "Man Free",
          situation: "2nd & 7",
        },
        {
          id: "game-play-3",
          playName: "3rd Down Conversion - Screen",
          personnel: "11 Personnel",
          defenseFront: "4-3",
          defensiveCoverage: "Cover 2",
          situation: "3rd & 4",
        },
      ],
      createdAt: new Date("2025-01-15"),
      updatedAt: new Date("2025-01-16"),
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Modal for creating a game-specific script with detailed situational plays.",
      },
    },
  },
};

export const EmptyScript: Story = {
  args: {
    onClose: () => console.log("Modal closed"),
    onSave: (script: PracticeScript) =>
      console.log("Empty script saved:", script),
    initialScript: {
      name: "New Script",
      plays: [],
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Modal starting with minimal data to demonstrate the empty state.",
      },
    },
  },
};

export const ComprehensiveScript: Story = {
  args: {
    onClose: () => console.log("Modal closed"),
    onSave: (script: PracticeScript) =>
      console.log("Comprehensive script saved:", script),
    initialScript: {
      id: "comprehensive-script",
      name: "Complete Practice Script - Offense & Defense",
      date: "2025-01-20",
      opponent: "Practice Squad",
      plays: [
        {
          id: "comp-1",
          playName: "Warm-up Drill - Agility",
          personnel: "Full Team",
          notes: "Focus on footwork and change of direction",
          situation: "Pre-practice",
        },
        {
          id: "comp-2",
          playName: "Individual Period - Route Running",
          personnel: "WR/TE Group",
          notes: "Work on release techniques",
          defenseFront: "Various",
          defensiveCoverage: "Press/Man",
          situation: "Individual Period",
        },
        {
          id: "comp-3",
          playName: "Team Period - 11 Personnel Run",
          personnel: "11 Personnel",
          notes: "Inside zone, outside zone, power",
          defenseFront: "4-3 Under",
          defensiveCoverage: "Cover 3",
          situation: "Team Period - 1st & 10",
        },
        {
          id: "comp-4",
          playName: "Team Period - 12 Personnel Pass",
          personnel: "12 Personnel",
          notes: "Drop back passes, play action",
          defenseFront: "3-4 Over",
          defensiveCoverage: "Cover 2 Man",
          situation: "Team Period - 2nd & 8",
        },
        {
          id: "comp-5",
          playName: "Special Teams - Kickoff",
          personnel: "Kickoff Team",
          notes: "Coverage and return techniques",
          situation: "Special Teams Period",
        },
      ],
      createdAt: new Date("2025-01-18"),
      updatedAt: new Date("2025-01-19"),
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Modal showing a comprehensive practice script with multiple periods and detailed play information.",
      },
    },
  },
};
