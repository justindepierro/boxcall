import type { Meta, StoryObj } from "@storybook/react-vite";
import EmptyState, {
  EmptyPlaybookState,
  EmptyGamePlansState,
  EmptyRosterState,
  EmptyCalendarState,
} from "./EmptyState";

const meta: Meta<typeof EmptyState> = {
  title: "UI/EmptyState",
  component: EmptyState,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Empty state components with illustrations, contextual messaging, and clear call-to-actions.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
    },
    icon: {
      control: "text",
    },
  },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    title: "No Data Available",
    description: "There is no data to display at this time.",
    icon: "inbox",
  },
};

export const WithActions: Story = {
  render: () => (
    <EmptyState
      title="Get Started"
      description="Create your first item to begin using this feature."
      icon="plus-circle"
      primaryAction={{
        label: "Create New",
        onClick: () => alert("Primary action clicked"),
        icon: "plus",
      }}
      secondaryAction={{
        label: "Learn More",
        onClick: () => alert("Secondary action clicked"),
        icon: "info",
      }}
    />
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-8">
      <EmptyState
        size="sm"
        title="Small Empty State"
        description="This is a small empty state component."
        icon="circle"
      />

      <EmptyState
        size="md"
        title="Medium Empty State"
        description="This is a medium empty state component with the default size."
        icon="circle"
      />

      <EmptyState
        size="lg"
        title="Large Empty State"
        description="This is a large empty state component with more prominent styling."
        icon="circle"
      />
    </div>
  ),
};

export const DifferentIcons: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <EmptyState
        title="No Messages"
        description="You haven't received any messages yet."
        icon="mail"
      />

      <EmptyState
        title="No Search Results"
        description="Try adjusting your search criteria."
        icon="search"
      />

      <EmptyState
        title="No Favorites"
        description="Items you mark as favorite will appear here."
        icon="star"
      />

      <EmptyState
        title="No Notifications"
        description="You're all caught up!"
        icon="alert"
      />
    </div>
  ),
};

export const PlaybookEmptyState: Story = {
  render: () => (
    <EmptyPlaybookState
      onCreatePlay={() => alert("Create play clicked")}
      onBrowseTemplates={() => alert("Browse templates clicked")}
    />
  ),
};

export const GamePlansEmptyState: Story = {
  render: () => (
    <EmptyGamePlansState
      onCreatePlan={() => alert("Create plan clicked")}
      onBrowsePlaybook={() => alert("Browse playbook clicked")}
    />
  ),
};

export const RosterEmptyState: Story = {
  render: () => (
    <EmptyRosterState
      onAddPlayer={() => alert("Add player clicked")}
      onImportRoster={() => alert("Import roster clicked")}
    />
  ),
};

export const CalendarEmptyState: Story = {
  render: () => (
    <EmptyCalendarState
      onCreateEvent={() => alert("Create event clicked")}
      onViewSchedule={() => alert("View schedule clicked")}
    />
  ),
};

export const ErrorState: Story = {
  args: {
    title: "Something went wrong",
    description:
      "We encountered an error while loading this content. Please try again.",
    icon: "alert-triangle",
    primaryAction: {
      label: "Try Again",
      onClick: () => window.location.reload(),
      icon: "refresh-cw",
    },
  },
};

export const SuccessState: Story = {
  args: {
    title: "All done!",
    description: "Your task has been completed successfully.",
    icon: "check-circle",
  },
};
