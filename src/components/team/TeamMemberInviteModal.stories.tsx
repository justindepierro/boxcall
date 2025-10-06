import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  TeamMemberInviteModal,
  type TeamInvitation,
} from "./TeamMemberInviteModal";

const meta: Meta<typeof TeamMemberInviteModal> = {
  title: "Team/TeamMemberInviteModal",
  component: TeamMemberInviteModal,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
A modal component for inviting new team members (staff or players) to join a team.

## Features

- **Role-Based Invitations**: Different role options for staff vs player invitations
- **Form Validation**: Required email field with proper validation
- **Personal Messages**: Optional custom message to include with the invitation
- **Loading States**: Visual feedback during invitation sending process
- **Responsive Design**: Modal adapts to different screen sizes

## Usage

Used in team management interfaces to invite new coaches, coordinators, managers, players, family members, or alumni to join a team. Integrates with backend invitation system to send emails and track invitation status.
        `,
      },
    },
  },
  argTypes: {
    isOpen: {
      control: "boolean",
      description: "Controls modal visibility",
    },
    type: {
      control: "select",
      options: ["staff", "player"],
      description:
        "Type of team member being invited - determines available roles",
    },
    onClose: {
      action: "closed",
      description: "Called when modal should be closed",
    },
    onInvite: {
      action: "invited",
      description: "Called with invitation data when form is submitted",
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
type Story = StoryObj<typeof TeamMemberInviteModal>;

export const InviteStaffMember: Story = {
  args: {
    isOpen: true,
    type: "staff",
    onClose: () => {},
    onInvite: async (invitation: TeamInvitation) => {
      console.log("Staff invitation sent:", invitation);
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Modal for inviting staff members (coaches, coordinators, managers) to join the team.",
      },
    },
  },
};

export const InvitePlayer: Story = {
  args: {
    isOpen: true,
    type: "player",
    onClose: () => {},
    onInvite: async (invitation: TeamInvitation) => {
      console.log("Player invitation sent:", invitation);
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Modal for inviting players, family members, or alumni to join the team.",
      },
    },
  },
};

export const WithPreFilledData: Story = {
  args: {
    isOpen: true,
    type: "staff",
    onClose: () => {},
    onInvite: async (invitation: TeamInvitation) => {
      console.log("Invitation sent:", invitation);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows the modal with some pre-filled data for demonstration purposes.",
      },
    },
  },
  decorators: [
    (Story) => {
      // This decorator would pre-fill the form in a real implementation
      // For now, it just shows the empty state
      return (
        <div className="min-h-screen bg-surface-muted p-4">
          <Story />
        </div>
      );
    },
  ],
};

export const LoadingState: Story = {
  args: {
    isOpen: true,
    type: "player",
    onClose: () => {},
    onInvite: async (invitation: TeamInvitation) => {
      console.log("Invitation being sent:", invitation);
      // Simulate longer API delay to show loading state
      await new Promise((resolve) => setTimeout(resolve, 3000));
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates the loading state when submitting the invitation form.",
      },
    },
  },
};
