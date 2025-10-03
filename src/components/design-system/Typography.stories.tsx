import type { Meta, StoryObj } from "@storybook/react-vite";
import { Typography } from "./Typography";

const meta: Meta<typeof Typography> = {
  title: "Design System/Typography",
  component: Typography,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Typography component providing consistent text styling across the BoxCall design system.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: [
        "display-xl",
        "display-lg",
        "display-md",
        "headline-xl",
        "headline-lg",
        "headline-md",
        "headline-sm",
        "body-lg",
        "body-md",
        "body-sm",
        "body-xs",
        "code-lg",
        "code-md",
        "code-sm",
        "label-lg",
        "label-md",
        "button",
        "caption",
      ],
    },
    as: {
      control: { type: "select" },
      options: [
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "p",
        "span",
        "div",
        "label",
        "code",
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Display: Story = {
  render: () => (
    <div className="space-y-4">
      <Typography variant="display-xl">Display Extra Large</Typography>
      <Typography variant="display-lg">Display Large</Typography>
      <Typography variant="display-md">Display Medium</Typography>
    </div>
  ),
};

export const Headlines: Story = {
  render: () => (
    <div className="space-y-3">
      <Typography variant="headline-xl">Headline Extra Large</Typography>
      <Typography variant="headline-lg">Headline Large</Typography>
      <Typography variant="headline-md">Headline Medium</Typography>
      <Typography variant="headline-sm">Headline Small</Typography>
    </div>
  ),
};

export const Body: Story = {
  render: () => (
    <div className="space-y-2">
      <Typography variant="body-lg">
        Body Large - This is large body text for improved readability in longer
        content sections.
      </Typography>
      <Typography variant="body-md">
        Body Medium - This is standard body text used throughout the application
        for general content.
      </Typography>
      <Typography variant="body-sm">
        Body Small - This is small body text for secondary information or fine
        print.
      </Typography>
      <Typography variant="body-xs">
        Body Extra Small - This is extra small body text for metadata or
        timestamps.
      </Typography>
    </div>
  ),
};

export const Code: Story = {
  render: () => (
    <div className="space-y-2">
      <Typography variant="code-lg">
        const largeCode = "Large code example";
      </Typography>
      <Typography variant="code-md">
        const mediumCode = "Medium code example";
      </Typography>
      <Typography variant="code-sm">
        const smallCode = "Small code example";
      </Typography>
    </div>
  ),
};

export const Labels: Story = {
  render: () => (
    <div className="space-y-2">
      <Typography variant="label-lg">Large Label</Typography>
      <Typography variant="label-md">Medium Label</Typography>
      <Typography variant="button">Button Text</Typography>
      <Typography variant="caption">Caption Text</Typography>
    </div>
  ),
};

export const SemanticElements: Story = {
  render: () => (
    <div className="space-y-4">
      <Typography as="h1" variant="headline-xl">
        H1 - Main Page Title
      </Typography>
      <Typography as="h2" variant="headline-lg">
        H2 - Section Header
      </Typography>
      <Typography as="h3" variant="headline-md">
        H3 - Subsection Header
      </Typography>
      <Typography as="p" variant="body-md">
        This is a paragraph with{" "}
        <Typography as="code" variant="code-sm">
          inline code
        </Typography>{" "}
        and
        <Typography as="span" variant="label-md">
          {" "}
          inline labels
        </Typography>
        .
      </Typography>
    </div>
  ),
};
