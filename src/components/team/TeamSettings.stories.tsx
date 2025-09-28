import type { Meta, StoryObj } from "@storybook/react";
import { TeamSettings } from "./TeamSettings";
import type { TeamSettings as TeamSettingsType } from "../../types/team-management";

const meta: Meta<typeof TeamSettings> = {
  title: "Team/TeamSettings",
  component: TeamSettings,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
A comprehensive team settings configuration component for managing team information, location, and subscription details.

## Features

- **Team Information Management**: Configure team name, school, season, and logo
- **Location Settings**: Address, city, state, and ZIP code management
- **Logo Upload**: Team logo management with placeholder for future upload functionality
- **Subscription Display**: Read-only subscription status and feature information
- **Form Validation**: Required field validation and proper input types
- **Loading States**: Visual feedback during save operations
- **Success/Error Messages**: User feedback for save operations

## Usage

Used in team management interfaces to allow coaches and administrators to configure team settings. Integrates with backend services to persist changes and handle logo uploads.
        `,
      },
    },
  },
  argTypes: {
    teamSettings: {
      control: "object",
      description: "Current team settings data",
    },
    onUpdate: {
      action: "settingsUpdated",
      description: "Called when settings are successfully updated",
    },
  },
};

export default meta;
type Story = StoryObj<typeof TeamSettings>;

// Mock team settings data
const mockTeamSettings: TeamSettingsType = {
  id: "team-123",
  name: "Lincoln High Wildcats",
  school: "Lincoln High School",
  level: "varsity",
  season: "2025",
  logoUrl:
    "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=200&h=200&fit=crop",
  location: {
    address: "123 Main Street",
    city: "Lincoln",
    state: "Nebraska",
    zipCode: "68501",
  },
  subscription: {
    tier: "team_premium",
    features: ["Unlimited Plays", "Advanced Analytics", "Priority Support"],
    staffCount: 3,
    maxStaff: 5,
    headCoachId: "coach-456",
  },
  familyPermissions: {
    canViewRoster: true,
    canViewSchedule: true,
    canViewStats: true,
    canRSVP: true,
    canFundraise: false,
  },
};

const mockBasicTeamSettings: TeamSettingsType = {
  id: "team-456",
  name: "Riverside Eagles",
  school: "Riverside Middle School",
  level: "jv",
  season: "2025",
  location: {
    address: "",
    city: "",
    state: "",
    zipCode: "",
  },
  subscription: {
    tier: "coach_tools",
    features: ["Basic Playbook", "Team Roster"],
    staffCount: 1,
    maxStaff: 2,
    headCoachId: "coach-789",
  },
  familyPermissions: {
    canViewRoster: false,
    canViewSchedule: false,
    canViewStats: false,
    canRSVP: false,
    canFundraise: false,
  },
};

export const VarsityTeam: Story = {
  args: {
    teamSettings: mockTeamSettings,
    onUpdate: (settings) => console.log("Team settings updated:", settings),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Complete team settings for a varsity high school football team with premium subscription.",
      },
    },
  },
};

export const BasicTeam: Story = {
  args: {
    teamSettings: mockBasicTeamSettings,
    onUpdate: (settings) => console.log("Team settings updated:", settings),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Basic team settings for a JV team with minimal information filled out.",
      },
    },
  },
};

export const WithoutLogo: Story = {
  args: {
    teamSettings: {
      ...mockTeamSettings,
      logoUrl: undefined,
    },
    onUpdate: (settings) => console.log("Team settings updated:", settings),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows the component when no team logo is set, displaying the placeholder icon.",
      },
    },
  },
};

export const EmptyLocation: Story = {
  args: {
    teamSettings: {
      ...mockTeamSettings,
      location: {
        address: "",
        city: "",
        state: "",
        zipCode: "",
      },
    },
    onUpdate: (settings) => console.log("Team settings updated:", settings),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows the component with empty location fields to demonstrate the form layout.",
      },
    },
  },
};

export const SavingState: Story = {
  args: {
    teamSettings: mockTeamSettings,
    onUpdate: async (settings) => {
      console.log("Saving team settings:", settings);
      // Simulate save delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Settings saved successfully");
    },
  },
  parameters: {
    docs: {
      description: {
        story: "Demonstrates the loading state during save operations.",
      },
    },
  },
};
