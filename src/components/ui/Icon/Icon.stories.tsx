import type { Meta, StoryObj } from "@storybook/react-vite";
import { Icon } from "./Icon";

const meta: Meta<typeof Icon> = {
  title: "UI/Icon",
  component: Icon,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A comprehensive icon system with multiple sizes, colors, and accessibility features.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    name: {
      control: { type: "select" },
      options: [
        "home",
        "menu",
        "close",
        "settings",
        "search",
        "user",
        "users",
        "edit",
        "delete",
        "plus",
        "check",
        "warning",
        "info",
        "star",
        "heart",
        "bookmark",
        "share",
        "download",
        "upload",
        "refresh-cw",
        "chevron-up",
        "chevron-down",
        "chevron-left",
        "chevron-right",
        "arrow-up",
        "arrow-down",
        "arrow-left",
        "arrow-right",
        "play",
        "pause",
        "calendar",
        "clock",
        "phone",
        "mail",
        "camera",
        "image",
        "file",
        "folder",
        "database",
        "shield",
        "lock",
        "unlock",
        "key",
        "eye",
        "eye-off",
        "sun",
        "moon",
        "monitor",
        "wifi-off",
        "power",
        "activity",
        "trending-up",
        "bar-chart",
        "pie-chart",
        "target",
        "award",
        "trophy",
        "flag",
        "zap",
        "sparkles",
        "rocket",
        "party-popper",
        "graduation-cap",
        "shirt",
        "crown",
        "sword",
        "gamepad-2",
        "flask-conical",
        "sprout",
        "lightbulb",
        "type",
        "list",
        "grid",
        "circle",
        "hash",
        "link",
        "undo",
        "move",
        "pen-tool",
        "pointer",
        "hand",
        "grip-vertical",
        "toggle-left",
        "toggle-right",
        "map",
        "map-pin",
        "clipboard-list",
        "user-plus",
        "inbox",
        "bug",
        "wrench",
        "alert-triangle",
        "alert",
        "check-circle",
        "copy",
        "pdf",
        "tag",
        "filter",
        "save",
        "plus-circle",
        "minus",
        "forward",
        "back",
        "book",
        "team",
        "message",
        "chart",
      ],
    },
    size: {
      control: { type: "select" },
      options: ["xs", "sm", "md", "lg", "xl", "touch"],
    },
    color: {
      control: { type: "select" },
      options: [
        "primary",
        "secondary",
        "success",
        "error",
        "warning",
        "info",
        "navy",
        "current",
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "home",
    size: "md",
    color: "current",
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <div className="flex flex-col items-center gap-2">
        <Icon name="home" size="xs" />
        <span className="text-xs text-gray-500">xs (12px)</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon name="home" size="sm" />
        <span className="text-xs text-gray-500">sm (16px)</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon name="home" size="md" />
        <span className="text-xs text-gray-500">md (20px)</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon name="home" size="lg" />
        <span className="text-xs text-gray-500">lg (24px)</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon name="home" size="xl" />
        <span className="text-xs text-gray-500">xl (32px)</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon name="home" size="touch" />
        <span className="text-xs text-gray-500">touch (44px)</span>
      </div>
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div className="flex gap-4">
      <div className="flex flex-col items-center gap-2">
        <Icon name="star" color="primary" />
        <span className="text-xs text-gray-500">primary</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon name="star" color="secondary" />
        <span className="text-xs text-gray-500">secondary</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon name="check" color="success" />
        <span className="text-xs text-gray-500">success</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon name="warning" color="error" />
        <span className="text-xs text-gray-500">error</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon name="alert" color="warning" />
        <span className="text-xs text-gray-500">warning</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon name="info" color="info" />
        <span className="text-xs text-gray-500">info</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon name="shield" color="navy" />
        <span className="text-xs text-gray-500">navy</span>
      </div>
    </div>
  ),
};

export const NavigationIcons: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-4">
      <div className="flex flex-col items-center gap-2">
        <Icon name="home" size="lg" />
        <span className="text-xs">Home</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon name="search" size="lg" />
        <span className="text-xs">Search</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon name="settings" size="lg" />
        <span className="text-xs">Settings</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon name="user" size="lg" />
        <span className="text-xs">Profile</span>
      </div>
    </div>
  ),
};

export const ActionIcons: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-4">
      <div className="flex flex-col items-center gap-2">
        <Icon name="plus" size="lg" color="success" />
        <span className="text-xs">Add</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon name="edit" size="lg" color="primary" />
        <span className="text-xs">Edit</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon name="delete" size="lg" color="error" />
        <span className="text-xs">Delete</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon name="save" size="lg" color="success" />
        <span className="text-xs">Save</span>
      </div>
    </div>
  ),
};

export const StatusIcons: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-4">
      <div className="flex flex-col items-center gap-2">
        <Icon name="check-circle" size="lg" color="success" />
        <span className="text-xs">Success</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon name="warning" size="lg" color="warning" />
        <span className="text-xs">Warning</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon name="alert-triangle" size="lg" color="error" />
        <span className="text-xs">Error</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon name="info" size="lg" color="info" />
        <span className="text-xs">Info</span>
      </div>
    </div>
  ),
};

export const SocialIcons: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-4">
      <div className="flex flex-col items-center gap-2">
        <Icon name="users" size="lg" />
        <span className="text-xs">Team</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon name="message" size="lg" />
        <span className="text-xs">Chat</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon name="user-plus" size="lg" />
        <span className="text-xs">Invite</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon name="star" size="lg" color="warning" />
        <span className="text-xs">Favorite</span>
      </div>
    </div>
  ),
};

export const AccessibilityExample: Story = {
  args: {
    name: "eye",
    size: "lg",
    "aria-label": "View details",
    role: "button",
  },
};

export const CustomSize: Story = {
  args: {
    name: "star",
    size: 48,
    color: "warning",
  },
};
