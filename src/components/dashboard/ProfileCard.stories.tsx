import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import ProfileCard from "./ProfileCard";
import type { Database } from "../../types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const meta: Meta<typeof ProfileCard> = {
  title: "Dashboard/ProfileCard",
  component: ProfileCard,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A comprehensive profile card component displaying user information, achievements, and role-specific details with editing capabilities.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    isViewMode: {
      control: "boolean",
      description: "When viewed in modal by other users",
    },
  },
};

export default meta;
type Story = StoryObj<typeof ProfileCard>;

const sampleProfile: Profile = {
  id: "1",
  full_name: "John Doe",
  display_name: "Johnny D",
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567",
  bio: "Passionate football coach with 15 years of experience. Love developing young talent and building winning teams. Always focused on fundamentals and team chemistry.",
  role: "coach",
  avatar_url: null,
  created_at: "2023-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  address: null,
  settings: null,
  last_login: null,
  position: "Head Coach",
  jersey_number: null,
  is_active: true,
  notification_preferences: null,
};

const playerProfile: Profile = {
  ...sampleProfile,
  full_name: "Mike Johnson",
  display_name: "MJ",
  role: "player",
  bio: "High school quarterback looking to improve my game. Love studying film and working on my mechanics. Team player who gives 110% every play.",
};

const familyProfile: Profile = {
  ...sampleProfile,
  full_name: "Sarah Johnson",
  display_name: "Sarah",
  role: "family",
  bio: "Proud parent supporting my son's football journey. Love watching the games and being part of this amazing community.",
};

export const CoachProfile: Story = {
  args: {
    profile: sampleProfile,
    userRole: "coach",
  },
};

export const PlayerProfile: Story = {
  args: {
    profile: playerProfile,
    userRole: "player",
  },
};

export const FamilyProfile: Story = {
  args: {
    profile: familyProfile,
    userRole: "family",
  },
};

export const ViewMode: Story = {
  args: {
    profile: sampleProfile,
    userRole: "coach",
    isViewMode: true,
  },
};

export const MinimalProfile: Story = {
  args: {
    profile: {
      ...sampleProfile,
      bio: null,
      phone: null,
    },
    userRole: "player",
  },
};

export const LongBio: Story = {
  args: {
    profile: {
      ...sampleProfile,
      bio: 'This is a very long bio that demonstrates the show more/show less functionality. It contains multiple sentences and should wrap to demonstrate how the component handles longer content. The bio should be truncated initially and show a "Show more" button that allows users to expand the full text. This is important for maintaining a clean, compact card design while still allowing access to detailed information when needed.',
    },
    userRole: "coach",
  },
};

export const LoadingAchievements: Story = {
  render: () => {
    // Mock loading state by using a profile without achievements loaded
    const [profile, setProfile] = useState<Profile | null>(null);

    // Simulate loading
    setTimeout(() => {
      setProfile(sampleProfile);
    }, 100);

    return <ProfileCard profile={profile} userRole="coach" />;
  },
};

export const NoAchievements: Story = {
  args: {
    profile: {
      ...sampleProfile,
      id: "no-achievements-user",
    },
    userRole: "player",
  },
};

export const WithCustomEditHandler: Story = {
  render: () => {
    const [editCount, setEditCount] = useState(0);

    return (
      <ProfileCard
        profile={sampleProfile}
        userRole="coach"
        onEditClick={() => {
          setEditCount((prev) => prev + 1);
          alert(`Edit clicked ${editCount + 1} times`);
        }}
      />
    );
  },
};

export const DifferentRoles: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl">
      <ProfileCard
        profile={{ ...sampleProfile, role: "coach" }}
        userRole="coach"
      />
      <ProfileCard
        profile={{ ...sampleProfile, role: "player" }}
        userRole="player"
      />
      <ProfileCard
        profile={{ ...sampleProfile, role: "family" }}
        userRole="family"
      />
    </div>
  ),
};

export const CompactLayout: Story = {
  render: () => (
    <div className="max-w-sm">
      <ProfileCard profile={sampleProfile} userRole="coach" />
    </div>
  ),
};
