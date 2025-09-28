import type { Meta, StoryObj } from "@storybook/react";
import { AppHeader } from "./AppHeader";

const meta: Meta<typeof AppHeader> = {
  title: "Layout/AppHeader",
  component: AppHeader,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
A responsive application header with auto-hide functionality and persistent navigation controls.

## Features

- **Auto-Hide on Scroll**: Header hides when scrolling down and shows when scrolling up
- **Persistent Hamburger**: Menu button remains visible even when header is hidden
- **Global Search**: Centered search functionality for app-wide content discovery
- **User Menu**: Access to user account settings and logout
- **Notifications**: Bell icon with unread count indicator
- **Backdrop Blur**: Modern glass-morphism effect for visual hierarchy
- **Responsive Design**: Adapts to different screen sizes and orientations

## Usage

Used as the main application header across all pages. Provides consistent navigation and access to core app functionality.
        `,
      },
    },
  },
  argTypes: {
    onMenuToggle: {
      action: "menuToggled",
      description: "Called when the hamburger menu button is clicked",
    },
  },
};

export default meta;
type Story = StoryObj<typeof AppHeader>;

export const Default: Story = {
  args: {
    onMenuToggle: () => console.log("Menu toggled"),
  },
  parameters: {
    docs: {
      description: {
        story: "Standard header with all components visible and functional.",
      },
    },
  },
};

export const WithScrollSimulation: Story = {
  args: {
    onMenuToggle: () => console.log("Menu toggled"),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Header that demonstrates auto-hide behavior. Scroll down in the preview to see the header hide and the persistent hamburger appear.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen">
        <Story />
        <div className="p-8 space-y-8">
          <h2 className="text-2xl font-bold">Scroll Down Content</h2>
          <p>
            This is sample content to demonstrate the auto-hide header behavior.
            Scroll down to see the header disappear and the persistent hamburger
            menu appear.
          </p>
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              className="h-16 bg-gray-100 rounded-lg flex items-center justify-center"
            >
              Content Block {i + 1}
            </div>
          ))}
        </div>
      </div>
    ),
  ],
};
