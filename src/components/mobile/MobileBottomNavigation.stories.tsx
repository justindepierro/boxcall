import type { Meta, StoryObj } from "@storybook/react";
import {
  MobileBottomNavigation,
  type MobileNavItem,
} from "./MobileBottomNavigation";

const meta: Meta<typeof MobileBottomNavigation> = {
  title: "Navigation/MobileBottomNavigation",
  component: MobileBottomNavigation,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
A mobile-optimized bottom navigation component designed for thumb-friendly interaction on mobile devices.

## Features

- **Mobile-First Design**: Positioned at the bottom of the screen for easy thumb access
- **Accessibility**: 44px minimum touch targets and proper ARIA labels
- **Visual Feedback**: Haptic-style animations and active state indicators
- **Notification Badges**: Support for displaying notification counts on navigation items
- **Safe Area Support**: Compatible with modern phone designs including notches and home indicators
- **Route Prefetching**: Optional performance optimization for route preloading

## Usage

Used in mobile layouts to provide primary navigation between major app sections. Typically includes 3-5 navigation items for optimal usability.
        `,
      },
    },
  },
  argTypes: {
    items: {
      control: "object",
      description: "Array of navigation items to display",
    },
    onNavigate: {
      action: "navigated",
      description: "Called when a navigation item is clicked",
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-gray-100">
        <div className="pb-20">
          {" "}
          {/* Add padding to account for fixed navigation */}
          <Story />
        </div>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MobileBottomNavigation>;

// Mock navigation items
const mockNavItems: MobileNavItem[] = [
  {
    id: "home",
    label: "Home",
    icon: "home",
    href: "/dashboard",
    isActive: true,
  },
  {
    id: "calendar",
    label: "Calendar",
    icon: "calendar",
    href: "/calendar",
    badge: 3,
  },
  {
    id: "teams",
    label: "Teams",
    icon: "users",
    href: "/teams",
  },
  {
    id: "profile",
    label: "Profile",
    icon: "user",
    href: "/profile",
  },
];

const mockNavItemsWithBadges: MobileNavItem[] = [
  {
    id: "home",
    label: "Home",
    icon: "home",
    href: "/dashboard",
  },
  {
    id: "calendar",
    label: "Calendar",
    icon: "calendar",
    href: "/calendar",
    badge: 5,
    isActive: true,
  },
  {
    id: "teams",
    label: "Teams",
    icon: "users",
    href: "/teams",
    badge: 2,
  },
  {
    id: "profile",
    label: "Profile",
    icon: "user",
    href: "/profile",
  },
];

export const Default: Story = {
  args: {
    items: mockNavItems,
    onNavigate: (href, item) =>
      console.log("Navigate to:", href, "Item:", item),
  },
  parameters: {
    docs: {
      description: {
        story: "Standard navigation with home tab active and no badges.",
      },
    },
  },
};

export const WithNotifications: Story = {
  args: {
    items: mockNavItemsWithBadges,
    onNavigate: (href, item) =>
      console.log("Navigate to:", href, "Item:", item),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Navigation showing notification badges on multiple items with calendar active.",
      },
    },
  },
};

export const ThreeItems: Story = {
  args: {
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: "home",
        href: "/dashboard",
        isActive: true,
      },
      {
        id: "playbook",
        label: "Playbook",
        icon: "menu",
        href: "/playbook",
      },
      {
        id: "profile",
        label: "Profile",
        icon: "user",
        href: "/profile",
      },
    ],
    onNavigate: (href, item) =>
      console.log("Navigate to:", href, "Item:", item),
  },
  parameters: {
    docs: {
      description: {
        story: "Minimal navigation with only 3 items for simpler apps.",
      },
    },
  },
};

export const FiveItems: Story = {
  args: {
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: "home",
        href: "/dashboard",
      },
      {
        id: "calendar",
        label: "Calendar",
        icon: "calendar",
        href: "/calendar",
        badge: 1,
      },
      {
        id: "playbook",
        label: "Playbook",
        icon: "menu",
        href: "/playbook",
        isActive: true,
      },
      {
        id: "teams",
        label: "Teams",
        icon: "users",
        href: "/teams",
      },
      {
        id: "profile",
        label: "Profile",
        icon: "user",
        href: "/profile",
      },
    ],
    onNavigate: (href, item) =>
      console.log("Navigate to:", href, "Item:", item),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Extended navigation with 5 items showing maximum recommended density.",
      },
    },
  },
};

export const AllInactive: Story = {
  args: {
    items: mockNavItems.map((item) => ({ ...item, isActive: false })),
    onNavigate: (href, item) =>
      console.log("Navigate to:", href, "Item:", item),
  },
  parameters: {
    docs: {
      description: {
        story:
          "All navigation items in inactive state to show default styling.",
      },
    },
  },
};
