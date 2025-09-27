import type { Meta, StoryObj } from "@storybook/react";
import Tooltip from "./Tooltip";
import { Button } from "../Button/Button";

const meta: Meta<typeof Tooltip> = {
  title: "UI/Tooltip",
  component: Tooltip,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A lightweight tooltip component with smart positioning and accessibility features.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    placement: {
      control: { type: "select" },
      options: ["top", "bottom", "left", "right"],
    },
    delay: {
      control: { type: "number", min: 0, max: 1000, step: 50 },
    },
    disabled: {
      control: "boolean",
    },
    smart: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  args: {
    content: "This is a tooltip",
    children: <Button variant="primary">Hover me</Button>,
    placement: "top",
  },
};

export const Placements: Story = {
  render: () => (
    <div className="flex flex-wrap gap-8 p-8">
      <Tooltip content="Tooltip on top" placement="top">
        <Button variant="secondary">Top</Button>
      </Tooltip>

      <Tooltip content="Tooltip on bottom" placement="bottom">
        <Button variant="secondary">Bottom</Button>
      </Tooltip>

      <Tooltip content="Tooltip on left" placement="left">
        <Button variant="secondary">Left</Button>
      </Tooltip>

      <Tooltip content="Tooltip on right" placement="right">
        <Button variant="secondary">Right</Button>
      </Tooltip>
    </div>
  ),
};

export const WithText: Story = {
  render: () => (
    <div className="space-y-4 p-8">
      <p>
        Hover over this{" "}
        <Tooltip content="This is a helpful tooltip">
          <span className="underline cursor-help">underlined text</span>
        </Tooltip>{" "}
        to see the tooltip.
      </p>

      <p>
        You can also hover over{" "}
        <Tooltip
          content="Another tooltip with different content"
          placement="bottom"
        >
          <strong className="cursor-help">bold text</strong>
        </Tooltip>
        .
      </p>
    </div>
  ),
};

export const WithDelay: Story = {
  render: () => (
    <div className="flex gap-4">
      <Tooltip content="No delay" delay={0}>
        <Button variant="outline">Instant</Button>
      </Tooltip>

      <Tooltip content="Short delay" delay={200}>
        <Button variant="outline">200ms</Button>
      </Tooltip>

      <Tooltip content="Default delay" delay={140}>
        <Button variant="outline">Default</Button>
      </Tooltip>

      <Tooltip content="Long delay" delay={500}>
        <Button variant="outline">500ms</Button>
      </Tooltip>
    </div>
  ),
};

export const LongContent: Story = {
  args: {
    content:
      "This is a much longer tooltip with more detailed information that should wrap to multiple lines and demonstrate the max width behavior.",
    children: <Button variant="primary">Long Tooltip</Button>,
    maxWidth: 200,
  },
};

export const Disabled: Story = {
  args: {
    content: "This tooltip is disabled",
    children: (
      <Button variant="secondary" disabled>
        Disabled Button
      </Button>
    ),
    disabled: true,
  },
};

export const SmartPositioning: Story = {
  render: () => (
    <div className="p-4">
      <div className="mb-4">
        <Tooltip
          content="This tooltip will flip if it would go off-screen"
          placement="top"
          smart
        >
          <Button variant="primary">Smart Top</Button>
        </Tooltip>
      </div>

      <div className="flex justify-end">
        <Tooltip
          content="This tooltip will shift if it overflows horizontally"
          placement="right"
          smart
        >
          <Button variant="primary">Smart Right</Button>
        </Tooltip>
      </div>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex gap-4">
      <Tooltip content="Save your changes">
        <Button variant="primary" size="sm">
          💾
        </Button>
      </Tooltip>

      <Tooltip content="Delete this item">
        <Button variant="danger" size="sm">
          🗑️
        </Button>
      </Tooltip>

      <Tooltip content="Get help">
        <Button variant="outline" size="sm">
          ❓
        </Button>
      </Tooltip>
    </div>
  ),
};
