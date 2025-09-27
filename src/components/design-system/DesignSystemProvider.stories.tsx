import type { Meta, StoryObj } from "@storybook/react";
import { DesignSystemProvider } from "./DesignSystemProvider";
import { Typography } from "./Typography";

const meta: Meta<typeof DesignSystemProvider> = {
  title: "Design System/Provider",
  component: DesignSystemProvider,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The DesignSystemProvider wraps your application to provide consistent theming, design tokens, and component behavior across the BoxCall application.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DesignSystemProvider>;

export const Default: Story = {
  args: {
    config: {
      theme: "light",
      density: "comfortable",
      motion: "enabled",
      glassmorphism: true,
    },
  },
  render: (args) => (
    <DesignSystemProvider {...args}>
      <div className="space-y-6 max-w-md">
        <div>
          <Typography variant="headline-lg" className="mb-2">
            Design System Provider
          </Typography>
          <Typography variant="body-md">
            This content is wrapped in the DesignSystemProvider, ensuring
            consistent theming and behavior across all components.
          </Typography>
        </div>

        <div className="space-y-2">
          <Typography variant="label-md">Typography Scale:</Typography>
          <Typography variant="body-lg">
            Large body text for readability
          </Typography>
          <Typography variant="body-md">Standard body text</Typography>
          <Typography variant="body-sm">
            Small body text for secondary info
          </Typography>
        </div>
      </div>
    </DesignSystemProvider>
  ),
};

export const DarkTheme: Story = {
  args: {
    config: {
      theme: "dark",
      density: "comfortable",
      motion: "enabled",
      glassmorphism: true,
    },
  },
  render: (args) => (
    <DesignSystemProvider {...args}>
      <div className="space-y-6 max-w-md">
        <Typography variant="headline-lg" className="mb-2">
          Dark Theme
        </Typography>
        <Typography variant="body-md">
          The design system automatically adapts to dark theme with proper
          contrast ratios.
        </Typography>
      </div>
    </DesignSystemProvider>
  ),
};

export const CompactDensity: Story = {
  args: {
    config: {
      theme: "light",
      density: "compact",
      motion: "enabled",
      glassmorphism: false,
    },
  },
  render: (args) => (
    <DesignSystemProvider {...args}>
      <div className="space-y-4 max-w-md">
        <Typography variant="headline-md" className="mb-2">
          Compact Density
        </Typography>
        <Typography variant="body-sm">
          Compact density reduces padding and spacing for data-dense interfaces.
        </Typography>
      </div>
    </DesignSystemProvider>
  ),
};
