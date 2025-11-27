import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card } from "./index";
import { Typography } from "../../design-system/Typography";
import { Button } from "../Button/Button";

const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A flexible card component with multiple variants and sizes for organizing content in the BoxCall design system.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default", "glass", "elevated", "outlined", "filled", "accent"],
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg", "xl"],
    },
    interactive: {
      control: "boolean",
    },
    disabled: {
      control: "boolean",
    },
    loading: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div className="space-y-3">
        <Typography variant="headline-md">Card Title</Typography>
        <Typography variant="body-md">
          This is the default card variant with standard styling and padding.
        </Typography>
      </div>
    ),
  },
};

export const Glass: Story = {
  args: {
    variant: "glass",
    children: (
      <div className="space-y-3">
        <Typography variant="headline-md">Glass Card</Typography>
        <Typography variant="body-md">
          This card uses a glassmorphism effect with backdrop blur.
        </Typography>
      </div>
    ),
  },
};

export const Elevated: Story = {
  args: {
    variant: "elevated",
    children: (
      <div className="space-y-3">
        <Typography variant="headline-md">Elevated Card</Typography>
        <Typography variant="body-md">
          This card has enhanced shadow and lift effects.
        </Typography>
      </div>
    ),
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      <Card size="sm">
        <Typography variant="headline-sm">Small Card</Typography>
        <Typography variant="body-sm">
          Compact card with minimal padding.
        </Typography>
      </Card>
      <Card size="md">
        <Typography variant="headline-sm">Medium Card</Typography>
        <Typography variant="body-sm">Standard card size.</Typography>
      </Card>
      <Card size="lg">
        <Typography variant="headline-sm">Large Card</Typography>
        <Typography variant="body-sm">
          Larger card with more padding.
        </Typography>
      </Card>
      <Card size="xl">
        <Typography variant="headline-sm">Extra Large Card</Typography>
        <Typography variant="body-sm">
          Spacious card for important content.
        </Typography>
      </Card>
    </div>
  ),
  parameters: {
    layout: "padded",
  },
};

export const WithHeaderAndFooter: Story = {
  args: {
    size: "lg",
    header: (
      <div>
        <Typography variant="headline-md">Team Statistics</Typography>
        <Typography variant="body-sm" className="text-muted">
          Last updated: 2 hours ago
        </Typography>
      </div>
    ),
    children: (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <Typography variant="display-md">24</Typography>
            <Typography variant="label-md">Wins</Typography>
          </div>
          <div className="text-center">
            <Typography variant="display-md">8</Typography>
            <Typography variant="label-md">Losses</Typography>
          </div>
        </div>

        <Typography variant="body-md">
          The team has shown strong performance this season with consistent
          results.
        </Typography>
      </div>
    ),
    footer: (
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          View Details
        </Button>
        <Button variant="primary" size="sm">
          Edit Stats
        </Button>
      </div>
    ),
  },
};

export const Interactive: Story = {
  args: {
    interactive: true,
    children: (
      <div className="space-y-3">
        <Typography variant="headline-md">Interactive Card</Typography>
        <Typography variant="body-md">
          This card responds to hover and focus states with animations.
        </Typography>
      </div>
    ),
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    children: (
      <div className="space-y-3">
        <Typography variant="headline-md">Loading Card</Typography>
        <Typography variant="body-md">
          This card shows a loading state with pulse animation.
        </Typography>
      </div>
    ),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      <Card variant="default">
        <Typography variant="headline-sm">Default</Typography>
        <Typography variant="body-sm">Standard card styling.</Typography>
      </Card>
      <Card variant="glass">
        <Typography variant="headline-sm">Glass</Typography>
        <Typography variant="body-sm">Glassmorphism effect.</Typography>
      </Card>
      <Card variant="elevated">
        <Typography variant="headline-sm">Elevated</Typography>
        <Typography variant="body-sm">Enhanced shadows.</Typography>
      </Card>
      <Card variant="outlined">
        <Typography variant="headline-sm">Outlined</Typography>
        <Typography variant="body-sm">Clean outline style.</Typography>
      </Card>
      <Card variant="filled">
        <Typography variant="headline-sm">Filled</Typography>
        <Typography variant="body-sm">Subtle background fill.</Typography>
      </Card>
      <Card variant="accent">
        <Typography variant="headline-sm">Accent</Typography>
        <Typography variant="body-sm">Gradient accent styling.</Typography>
      </Card>
    </div>
  ),
  parameters: {
    layout: "padded",
  },
};
