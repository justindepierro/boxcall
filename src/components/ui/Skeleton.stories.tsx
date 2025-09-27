import type { Meta, StoryObj } from "@storybook/react";
import {
  Skeleton,
  DashboardCardSkeleton,
  GamePlanSkeleton,
  NavigationSkeleton,
  ListSkeleton,
  PageLoadingSkeleton,
  PlayCardSkeleton,
} from "./Skeleton";

const meta: Meta<typeof Skeleton> = {
  title: "UI/Skeleton",
  component: Skeleton,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Skeleton loading components that provide smooth loading states and prevent layout shifts.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    width: {
      control: "text",
    },
    height: {
      control: "text",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Basic: Story = {
  args: {
    width: "200px",
    height: "20px",
  },
};

export const DifferentSizes: Story = {
  render: () => (
    <div className="space-y-4">
      <Skeleton width="100px" height="16px" />
      <Skeleton width="200px" height="20px" />
      <Skeleton width="300px" height="24px" />
      <Skeleton width="400px" height="32px" />
    </div>
  ),
};

export const Shapes: Story = {
  render: () => (
    <div className="flex gap-4 items-end">
      <Skeleton width="60px" height="60px" className="rounded-full" />
      <Skeleton width="80px" height="60px" className="rounded-lg" />
      <Skeleton width="100px" height="60px" className="rounded" />
    </div>
  ),
};

export const DashboardCard: Story = {
  render: () => <DashboardCardSkeleton />,
};

export const GamePlan: Story = {
  render: () => <GamePlanSkeleton />,
};

export const Navigation: Story = {
  render: () => <NavigationSkeleton />,
};

export const List: Story = {
  render: () => (
    <div className="space-y-4">
      <ListSkeleton items={3} />
      <ListSkeleton items={5} showAvatar />
    </div>
  ),
};

export const PlayCard: Story = {
  render: () => <PlayCardSkeleton />,
};

export const PageLoading: Story = {
  render: () => <PageLoadingSkeleton />,
  parameters: {
    layout: "fullscreen",
  },
};

export const CardGrid: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      <DashboardCardSkeleton />
      <DashboardCardSkeleton />
      <DashboardCardSkeleton />
      <GamePlanSkeleton />
      <GamePlanSkeleton />
      <PlayCardSkeleton />
    </div>
  ),
};
