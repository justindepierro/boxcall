import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { useSidebarState } from "./useSidebarState";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

const meta: Meta = {
  title: "Hooks/useSidebarState",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Sidebar state management hook with persistence and favorites.

**Features:**
- Sidebar mode switching (rail/expanded)
- Group expansion/collapse state
- Favorite items management
- Local storage persistence
- Type-safe state management

**Usage:**
\`\`\`tsx
import { useSidebarState } from './hooks/useSidebarState';

function Sidebar() {
  const {
    mode,
    toggleMode,
    isExpanded,
    expand,
    collapse,
    toggleExpanded,
    isFavorite,
    toggleFavorite,
  } = useSidebarState();

  return (
    <div className={mode === 'rail' ? 'sidebar-rail' : 'sidebar-expanded'}>
      <Button onClick={toggleMode}>
        {mode === 'rail' ? 'Expand' : 'Collapse'} Sidebar
      </Button>

      <SidebarGroup
        id="navigation"
        expanded={isExpanded('navigation')}
        onToggle={() => toggleExpanded('navigation')}
        favorite={isFavorite('navigation')}
        onToggleFavorite={() => toggleFavorite('navigation')}
      >
        {/* Group content */}
      </SidebarGroup>
    </div>
  );
}
\`\`\`
        `,
      },
    },
  },
};

export default meta;

// Sidebar State Demo Component
const SidebarStateDemo = () => {
  const {
    mode,
    setMode,
    toggleMode,
    expanded,
    isExpanded,
    expand,
    collapse,
    toggleExpanded,
    favorites,
    isFavorite,
    toggleFavorite,
  } = useSidebarState();

  const [selectedGroup, setSelectedGroup] = useState("navigation");

  const mockGroups = [
    "navigation",
    "teams",
    "players",
    "schedule",
    "reports",
    "settings",
  ];

  return (
    <Card className="w-full max-w-4xl p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">
            Sidebar State Management
          </h3>
          <p className="text-sm text-secondary mb-4">
            Manage sidebar mode, group expansion, and favorites with local
            storage persistence.
          </p>
        </div>

        {/* Current State Overview */}
        <div className="space-y-4">
          <h4 className="font-medium">Current State</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 border rounded-lg text-center">
              <div className="text-sm font-medium text-gray-600">Mode</div>
              <Badge variant={mode === "expanded" ? "success" : "info"}>
                {mode}
              </Badge>
            </div>
            <div className="p-3 border rounded-lg text-center">
              <div className="text-sm font-medium text-gray-600">
                Expanded Groups
              </div>
              <div className="text-lg font-bold">{expanded.size}</div>
            </div>
            <div className="p-3 border rounded-lg text-center">
              <div className="text-sm font-medium text-gray-600">Favorites</div>
              <div className="text-lg font-bold">{favorites.size}</div>
            </div>
            <div className="p-3 border rounded-lg text-center">
              <div className="text-sm font-medium text-gray-600">
                Total Groups
              </div>
              <div className="text-lg font-bold">{mockGroups.length}</div>
            </div>
          </div>
        </div>

        {/* Mode Controls */}
        <div className="space-y-4">
          <h4 className="font-medium">Sidebar Mode</h4>
          <div className="flex gap-2">
            <Button
              onClick={() => setMode("expanded")}
              variant={mode === "expanded" ? "primary" : "outline"}
            >
              Expanded
            </Button>
            <Button
              onClick={() => setMode("rail")}
              variant={mode === "rail" ? "primary" : "outline"}
            >
              Rail
            </Button>
            <Button onClick={toggleMode} variant="outline">
              Toggle Mode
            </Button>
          </div>

          <div className="p-4 border rounded-lg bg-gray-50">
            <p className="text-sm">
              <strong>Current mode:</strong> {mode}
            </p>
            <p className="text-sm text-secondary mt-1">
              {mode === "expanded"
                ? "Full sidebar with labels and content"
                : "Compact rail with icons only"}
            </p>
          </div>
        </div>

        {/* Group Management */}
        <div className="space-y-4">
          <h4 className="font-medium">Group Management</h4>

          {/* Group Selector */}
          <div className="flex flex-wrap gap-2">
            {mockGroups.map((group) => (
              <Button
                key={group}
                size="sm"
                variant={selectedGroup === group ? "primary" : "outline"}
                onClick={() => setSelectedGroup(group)}
              >
                {group.charAt(0).toUpperCase() + group.slice(1)}
              </Button>
            ))}
          </div>

          {/* Selected Group Controls */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h5 className="font-medium">Group: {selectedGroup}</h5>
              <div className="flex gap-2">
                <Badge
                  variant={isExpanded(selectedGroup) ? "success" : "neutral"}
                >
                  {isExpanded(selectedGroup) ? "Expanded" : "Collapsed"}
                </Badge>
                <Badge
                  variant={isFavorite(selectedGroup) ? "warning" : "neutral"}
                >
                  {isFavorite(selectedGroup) ? "Favorited" : "Not Favorited"}
                </Badge>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => expand(selectedGroup)}
                disabled={isExpanded(selectedGroup)}
              >
                Expand
              </Button>
              <Button
                size="sm"
                onClick={() => collapse(selectedGroup)}
                disabled={!isExpanded(selectedGroup)}
              >
                Collapse
              </Button>
              <Button
                size="sm"
                onClick={() => toggleExpanded(selectedGroup)}
                variant="outline"
              >
                Toggle
              </Button>
              <Button
                size="sm"
                onClick={() => toggleFavorite(selectedGroup)}
                variant={isFavorite(selectedGroup) ? "warning" : "outline"}
              >
                {isFavorite(selectedGroup) ? "Unfavorite" : "Favorite"}
              </Button>
            </div>
          </div>
        </div>

        {/* All Groups Status */}
        <div className="space-y-4">
          <h4 className="font-medium">All Groups Status</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {mockGroups.map((group) => (
              <div
                key={group}
                className="p-3 border rounded-lg flex items-center justify-between"
              >
                <span className="font-medium capitalize">{group}</span>
                <div className="flex gap-2">
                  <Badge
                    variant={isExpanded(group) ? "success" : "neutral"}
                    className="text-xs"
                  >
                    {isExpanded(group) ? "Open" : "Closed"}
                  </Badge>
                  {isFavorite(group) && (
                    <Badge variant="warning" className="text-xs">
                      ★
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Persistence Info */}
        <div className="space-y-4">
          <h4 className="font-medium">Persistence</h4>
          <div className="p-4 border rounded-lg bg-blue-50">
            <p className="text-sm text-blue-800">
              All state changes are automatically persisted to localStorage with
              the key "sidebar:prefs". Refresh the page to see persistence in
              action.
            </p>
          </div>
        </div>

        {/* Hook Methods */}
        <div className="space-y-4">
          <h4 className="font-medium">Hook Methods</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium mb-2">Mode Management</h5>
              <div className="space-y-1 text-gray-600">
                <div>
                  <code>mode</code> - Current sidebar mode
                </div>
                <div>
                  <code>setMode(mode)</code> - Set sidebar mode
                </div>
                <div>
                  <code>toggleMode()</code> - Toggle between modes
                </div>
              </div>
            </div>

            <div>
              <h5 className="font-medium mb-2">Group Management</h5>
              <div className="space-y-1 text-gray-600">
                <div>
                  <code>isExpanded(id)</code> - Check if group is expanded
                </div>
                <div>
                  <code>expand(id)</code> - Expand a group
                </div>
                <div>
                  <code>collapse(id)</code> - Collapse a group
                </div>
                <div>
                  <code>toggleExpanded(id)</code> - Toggle group expansion
                </div>
              </div>
            </div>

            <div>
              <h5 className="font-medium mb-2">Favorites</h5>
              <div className="space-y-1 text-gray-600">
                <div>
                  <code>isFavorite(id)</code> - Check if item is favorited
                </div>
                <div>
                  <code>toggleFavorite(id)</code> - Toggle favorite status
                </div>
                <div>
                  <code>favorites</code> - Set of favorited item IDs
                </div>
              </div>
            </div>

            <div>
              <h5 className="font-medium mb-2">State</h5>
              <div className="space-y-1 text-gray-600">
                <div>
                  <code>expanded</code> - Set of expanded group IDs
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Story definitions
export const Default: StoryObj = {
  render: () => <SidebarStateDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Complete sidebar state management demo with mode switching, group expansion, and favorites.",
      },
    },
  },
};

export const ModeManagement: StoryObj = {
  render: () => {
    const { mode, setMode, toggleMode } = useSidebarState();

    return (
      <Card className="p-6 max-w-md">
        <h3 className="text-lg font-semibold mb-4">Mode Management</h3>
        <div className="space-y-4">
          <div className="text-center">
            <Badge variant="info" className="text-lg px-3 py-1">
              Current: {mode}
            </Badge>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setMode("expanded")}
              variant={mode === "expanded" ? "primary" : "outline"}
              className="flex-1"
            >
              Expanded
            </Button>
            <Button
              onClick={() => setMode("rail")}
              variant={mode === "rail" ? "primary" : "outline"}
              className="flex-1"
            >
              Rail
            </Button>
          </div>

          <Button onClick={toggleMode} variant="outline" className="w-full">
            Toggle Mode
          </Button>
        </div>
      </Card>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Demonstrates sidebar mode switching functionality.",
      },
    },
  },
};

export const GroupExpansion: StoryObj = {
  render: () => {
    const { isExpanded, expand, collapse, toggleExpanded } = useSidebarState();

    const groups = ["nav", "tools", "reports"];

    return (
      <Card className="p-6 max-w-md">
        <h3 className="text-lg font-semibold mb-4">Group Expansion</h3>
        <div className="space-y-3">
          {groups.map((group) => (
            <div key={group} className="p-3 border rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium capitalize">{group}</span>
                <Badge variant={isExpanded(group) ? "success" : "neutral"}>
                  {isExpanded(group) ? "Expanded" : "Collapsed"}
                </Badge>
              </div>

              <div className="flex gap-1">
                <Button
                  size="sm"
                  onClick={() => expand(group)}
                  disabled={isExpanded(group)}
                >
                  Expand
                </Button>
                <Button
                  size="sm"
                  onClick={() => collapse(group)}
                  disabled={!isExpanded(group)}
                >
                  Collapse
                </Button>
                <Button
                  size="sm"
                  onClick={() => toggleExpanded(group)}
                  variant="outline"
                >
                  Toggle
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Shows group expansion and collapse functionality.",
      },
    },
  },
};

export const FavoritesManagement: StoryObj = {
  render: () => {
    const { isFavorite, toggleFavorite, favorites } = useSidebarState();

    const items = ["dashboard", "calendar", "reports", "settings"];

    return (
      <Card className="p-6 max-w-md">
        <h3 className="text-lg font-semibold mb-4">Favorites Management</h3>
        <div className="space-y-4">
          <div className="text-center">
            <Badge variant="warning">{favorites.size} favorited</Badge>
          </div>

          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item}
                className="flex items-center justify-between p-2 border rounded"
              >
                <span className="capitalize">{item}</span>
                <Button
                  size="sm"
                  onClick={() => toggleFavorite(item)}
                  variant={isFavorite(item) ? "warning" : "outline"}
                >
                  {isFavorite(item) ? "★" : "☆"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Demonstrates favorites toggle functionality.",
      },
    },
  },
};
