import type { Meta, StoryObj } from "@storybook/react-vite";
import Tag from "./Tag";

const meta: Meta<typeof Tag> = {
  title: "UI/Tag",
  component: Tag,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A versatile tag component for displaying labels, categories, or status indicators.",
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
        "outline",
      ],
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
    },
    interactive: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tag>;

export const Default: Story = {
  args: {
    children: "Tag",
    variant: "neutral",
    size: "md",
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Tag variant="neutral">Neutral</Tag>
      <Tag variant="info">Info</Tag>
      <Tag variant="success">Success</Tag>
      <Tag variant="warning">Warning</Tag>
      <Tag variant="danger">Danger</Tag>
      <Tag variant="accent">Accent</Tag>
      <Tag variant="outline">Outline</Tag>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Tag size="sm">Small</Tag>
      <Tag size="md">Medium</Tag>
      <Tag size="lg">Large</Tag>
    </div>
  ),
};

export const Interactive: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Tag
        variant="info"
        interactive
        onClick={() => alert("Info tag clicked!")}
      >
        Clickable Info
      </Tag>
      <Tag
        variant="success"
        interactive
        onClick={() => alert("Success tag clicked!")}
      >
        Clickable Success
      </Tag>
      <Tag
        variant="warning"
        interactive
        onClick={() => alert("Warning tag clicked!")}
      >
        Clickable Warning
      </Tag>
    </div>
  ),
};

export const StatusTags: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Tag variant="success">Active</Tag>
      <Tag variant="warning">Pending</Tag>
      <Tag variant="danger">Inactive</Tag>
      <Tag variant="info">Draft</Tag>
      <Tag variant="neutral">Archived</Tag>
    </div>
  ),
};

export const CategoryTags: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Tag variant="accent">Technology</Tag>
      <Tag variant="info">Sports</Tag>
      <Tag variant="success">Health</Tag>
      <Tag variant="warning">Finance</Tag>
      <Tag variant="danger">Politics</Tag>
    </div>
  ),
};

export const PriorityTags: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Tag variant="danger">High Priority</Tag>
      <Tag variant="warning">Medium Priority</Tag>
      <Tag variant="info">Low Priority</Tag>
    </div>
  ),
};

export const WithCustomClassName: Story = {
  args: {
    children: "Custom Styled",
    variant: "neutral",
    className: "font-bold shadow-md",
  },
};
