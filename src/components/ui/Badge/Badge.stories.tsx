import type { Meta, StoryObj } from "@storybook/react";
import {
  Badge,
  AchievementBadge,
  ProgressBadge,
  NotificationBadge,
  ComplexityBadge,
} from "./index";

const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A versatile badge component system with multiple variants, sizes, and special badge types for achievements, progress, notifications, and complexity indicators.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: [
        "neutral",
        "info",
        "success",
        "warning",
        "danger",
        "accent",
        "premium",
      ],
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
    },
    progress: {
      control: { type: "range", min: 0, max: 100 },
    },
    achievement: {
      control: "boolean",
    },
    pulse: {
      control: "boolean",
    },
    elevated: {
      control: "boolean",
    },
    pill: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Badge",
    variant: "neutral",
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="neutral">Neutral</Badge>
      <Badge variant="info">Info</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="danger">Danger</Badge>
      <Badge variant="accent">Accent</Badge>
      <Badge variant="premium">Premium</Badge>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Badge size="sm">Small</Badge>
      <Badge size="md">Medium</Badge>
      <Badge size="lg">Large</Badge>
    </div>
  ),
};

export const Achievement: Story = {
  args: {
    achievement: true,
    children: "🏆 Achievement",
  },
};

export const WithProgress: Story = {
  args: {
    progress: 75,
    children: "75%",
  },
};

export const Pulse: Story = {
  args: {
    pulse: true,
    children: "Pulsing",
  },
};

export const Elevated: Story = {
  args: {
    elevated: true,
    children: "Elevated",
  },
};

export const AchievementBadgeStory: Story = {
  render: () => (
    <AchievementBadge achievement={true}>🏆 Achievement</AchievementBadge>
  ),
  name: "Achievement Badge",
};

export const ProgressBadgeStory: Story = {
  render: () => (
    <div className="space-y-2">
      <ProgressBadge progress={25} label="Beginner" />
      <ProgressBadge progress={50} label="Intermediate" />
      <ProgressBadge progress={75} label="Advanced" />
      <ProgressBadge progress={100} label="Expert" />
    </div>
  ),
  name: "Progress Badge",
};

export const NotificationBadgeStory: Story = {
  render: () => (
    <div className="space-y-2">
      <NotificationBadge count={1} />
      <NotificationBadge count={5} />
      <NotificationBadge count={99} />
      <NotificationBadge count={100} />
    </div>
  ),
  name: "Notification Badge",
};

export const ComplexityBadgeStory: Story = {
  render: () => (
    <div className="flex gap-2">
      <ComplexityBadge
        metrics={{
          routeCount: 1,
          formationComplexity: 1,
          personnelVariety: 1,
          conceptDifficulty: 1,
          totalScore: 10,
          badge: "beginner",
        }}
      />
      <ComplexityBadge
        metrics={{
          routeCount: 2,
          formationComplexity: 2,
          personnelVariety: 2,
          conceptDifficulty: 2,
          totalScore: 35,
          badge: "intermediate",
        }}
      />
      <ComplexityBadge
        metrics={{
          routeCount: 3,
          formationComplexity: 3,
          personnelVariety: 3,
          conceptDifficulty: 3,
          totalScore: 60,
          badge: "advanced",
        }}
      />
      <ComplexityBadge
        metrics={{
          routeCount: 4,
          formationComplexity: 4,
          personnelVariety: 4,
          conceptDifficulty: 4,
          totalScore: 80,
          badge: "expert",
        }}
      />
    </div>
  ),
  name: "Complexity Badge",
};

export const Interactive: Story = {
  args: {
    children: "Click me",
    onClick: () => alert("Badge clicked!"),
  },
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="success">✓ Complete</Badge>
      <Badge variant="warning">⚠ Warning</Badge>
      <Badge variant="danger">✗ Error</Badge>
      <Badge variant="info">ℹ Info</Badge>
      <Badge variant="premium">⭐ Premium</Badge>
    </div>
  ),
};
