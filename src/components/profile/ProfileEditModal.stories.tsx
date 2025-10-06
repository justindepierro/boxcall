import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProfileEditModal } from "./ProfileEditModal";

interface ProfileData {
  id: string;
  [key: string]: unknown; // Allow any profile fields
}

const meta: Meta<typeof ProfileEditModal> = {
  title: "Profile/ProfileEditModal",
  component: ProfileEditModal,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
A comprehensive profile editing modal that supports role-based configurations and multiple editing modes.

## Features

- **Role-Based Configuration**: Dynamically renders different form fields based on user role (player, coach, etc.)
- **Quick vs Full Edit Modes**: Quick mode shows minimal fields, full mode shows all available fields
- **Avatar Upload**: Supports profile picture uploads to Supabase storage
- **Form Validation**: Client-side validation with type-specific rules (email, URL, number ranges)
- **Sectioned Layout**: Organizes fields into logical sections (Basic, Athletic, Academic, Professional, Contact)
- **Responsive Design**: Modal adapts to different screen sizes with proper scrolling

## Usage

The modal is typically opened from profile pages or user management interfaces. It integrates with Supabase for data persistence and avatar storage.
        `,
      },
    },
  },
  argTypes: {
    isOpen: {
      control: "boolean",
      description: "Controls modal visibility",
    },
    userRole: {
      control: "select",
      options: ["player", "coach", "manager", "admin"],
      description: "User role determines available form fields",
    },
    mode: {
      control: "select",
      options: ["quick", "full"],
      description:
        "Edit mode - quick shows minimal fields, full shows all fields",
    },
    currentProfile: {
      control: "object",
      description: "Current profile data to populate the form",
    },
    onClose: {
      action: "closed",
      description: "Called when modal should be closed",
    },
    onProfileUpdate: {
      action: "profileUpdated",
      description: "Called with updated profile data after successful save",
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-surface-muted p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ProfileEditModal>;

// Mock profile data for different roles
const mockPlayerProfile: ProfileData = {
  id: "player-123",
  display_name: "Alex Johnson",
  full_name: "Alexander Johnson",
  bio: "Passionate quarterback with 3 years of experience",
  email: "alex.johnson@email.com",
  phone: "+1 (555) 123-4567",
  position: "Quarterback",
  jersey_number: 12,
  height: 72,
  weight: 195,
  grade: "Senior",
  gpa: 3.8,
  graduation_year: 2025,
  avatar_url: null,
};

const mockCoachProfile: ProfileData = {
  id: "coach-456",
  display_name: "Coach Sarah",
  full_name: "Sarah Martinez",
  bio: "Head coach with 15 years of experience",
  email: "sarah.martinez@school.edu",
  phone: "+1 (555) 987-6543",
  years_experience: 15,
  certifications: "NSCA-CSCS, USAW",
  specializations: "Strength & Conditioning, Quarterbacks",
  education: "MS in Exercise Science",
  avatar_url: "https://example.com/avatar.jpg",
};

export const PlayerQuickEdit: Story = {
  args: {
    isOpen: true,
    userRole: "player",
    mode: "quick",
    currentProfile: mockPlayerProfile,
    onClose: () => {},
    onProfileUpdate: (profile) => console.log("Profile updated:", profile),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Quick edit mode for players showing only essential fields (display name and bio).",
      },
    },
  },
};

export const PlayerFullEdit: Story = {
  args: {
    isOpen: true,
    userRole: "player",
    mode: "full",
    currentProfile: mockPlayerProfile,
    onClose: () => {},
    onProfileUpdate: (profile) => console.log("Profile updated:", profile),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Full edit mode for players showing all available fields including athletic, academic, and contact information.",
      },
    },
  },
};

export const CoachFullEdit: Story = {
  args: {
    isOpen: true,
    userRole: "coach",
    mode: "full",
    currentProfile: mockCoachProfile,
    onClose: () => {},
    onProfileUpdate: (profile) => console.log("Profile updated:", profile),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Full edit mode for coaches showing professional information and contact details.",
      },
    },
  },
};

export const WithAvatar: Story = {
  args: {
    isOpen: true,
    userRole: "player",
    mode: "full",
    currentProfile: {
      ...mockPlayerProfile,
      avatar_url:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    },
    onClose: () => {},
    onProfileUpdate: (profile) => console.log("Profile updated:", profile),
  },
  parameters: {
    docs: {
      description: {
        story: "Shows the modal with an existing avatar image.",
      },
    },
  },
};

export const EmptyProfile: Story = {
  args: {
    isOpen: true,
    userRole: "player",
    mode: "full",
    currentProfile: {
      id: "new-user-789",
      display_name: "",
      full_name: "",
      bio: "",
    },
    onClose: () => {},
    onProfileUpdate: (profile) => console.log("Profile updated:", profile),
  },
  parameters: {
    docs: {
      description: {
        story: "Shows the modal for a new user with empty profile data.",
      },
    },
  },
};

export const ManagerRole: Story = {
  args: {
    isOpen: true,
    userRole: "manager",
    mode: "full",
    currentProfile: {
      id: "manager-101",
      display_name: "Team Manager",
      full_name: "Jordan Williams",
      bio: "Team operations and logistics coordinator",
      email: "jordan.williams@school.edu",
      phone: "+1 (555) 555-0123",
      department: "Athletics",
      responsibilities: "Equipment, Travel, Game Management",
    },
    onClose: () => {},
    onProfileUpdate: (profile) => console.log("Profile updated:", profile),
  },
  parameters: {
    docs: {
      description: {
        story: "Shows the modal for a manager role with administrative fields.",
      },
    },
  },
};
