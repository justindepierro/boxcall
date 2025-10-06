import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { useMobileNavigation } from "./useMobileNavigation";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

const meta: Meta = {
  title: "Hooks/useMobileNavigation",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Mobile navigation hook for managing bottom navigation items and badges.

**Features:**
- Dynamic navigation items based on user role and current route
- Notification badges for different sections
- Active state management
- Route-based navigation items

**Usage:**
\`\`\`tsx
import { useMobileNavigation } from './hooks/useMobileNavigation';

function MobileLayout({ currentPath }: { currentPath: string }) {
  const { items, notifications } = useMobileNavigation(currentPath);

  return (
    <div className="mobile-layout">
      <main>{children}</main>
      <BottomNavigation items={items} />
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

// Mobile Navigation Demo Component
const MobileNavigationDemo = () => {
  const [currentPath, setCurrentPath] = useState("/");
  const { items, notifications } = useMobileNavigation(currentPath);

  const mockPaths = [
    "/",
    "/dashboard",
    "/calendar",
    "/team/1/bulletin",
    "/profile",
  ];

  const pathLabels = {
    "/": "Home (Root)",
    "/dashboard": "Dashboard",
    "/calendar": "Calendar",
    "/team/1/bulletin": "Team Bulletin",
    "/profile": "Profile",
  };

  return (
    <Card className="w-full max-w-2xl p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Mobile Navigation</h3>
          <p className="text-sm text-secondary mb-4">
            Manage mobile bottom navigation with badges and active states.
          </p>
        </div>

        {/* Current Path */}
        <div className="space-y-4">
          <h4 className="font-medium">
            Current Path: <code>{currentPath}</code>
          </h4>
          <div className="flex flex-wrap gap-2">
            {mockPaths.map((path) => (
              <Button
                key={path}
                size="sm"
                variant={currentPath === path ? "primary" : "outline"}
                onClick={() => setCurrentPath(path)}
              >
                {pathLabels[path as keyof typeof pathLabels]}
              </Button>
            ))}
          </div>
        </div>

        {/* Navigation Items */}
        <div className="space-y-4">
          <h4 className="font-medium">Navigation Items</h4>
          <div className="grid grid-cols-1 gap-3">
            {items.map((item) => (
              <div
                key={item.id}
                className={`p-4 border rounded-lg ${
                  item.isActive
                    ? "border-blue-500 bg-status-info-bg"
                    : "border"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-surface-muted rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {item.icon.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h5 className="font-medium">{item.label}</h5>
                      <p className="text-sm text-secondary">{item.href}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(item.badge ?? 0) > 0 && (
                      <Badge
                        variant="danger"
                        className="min-w-5 h-5 flex items-center justify-center text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                    {item.isActive && <Badge variant="success">Active</Badge>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications Summary */}
        <div className="space-y-4">
          <h4 className="font-medium">Notifications Summary</h4>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(notifications).map(([key, count]) => (
              <div key={key} className="p-3 border rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{count}</div>
                <div className="text-sm text-secondary capitalize">{key}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hook Return Values */}
        <div className="space-y-4">
          <h4 className="font-medium">Hook Return Values</h4>
          <div className="text-sm space-y-1 text-secondary">
            <div>
              <code>items</code> - Array of navigation items with badges and
              active states
            </div>
            <div>
              <code>notifications</code> - Object with notification counts for
              each section
            </div>
          </div>
        </div>

        {/* Navigation Item Properties */}
        <div className="space-y-4">
          <h4 className="font-medium">Navigation Item Properties</h4>
          <div className="text-sm space-y-1 text-secondary">
            <div>
              <code>id</code> - Unique identifier for the navigation item
            </div>
            <div>
              <code>label</code> - Display label for the navigation item
            </div>
            <div>
              <code>icon</code> - Icon name for the navigation item
            </div>
            <div>
              <code>href</code> - URL path for the navigation item
            </div>
            <div>
              <code>badge</code> - Number of notifications (0 = no badge)
            </div>
            <div>
              <code>isActive</code> - Whether this item matches the current path
            </div>
            <div>
              <code>importer</code> - Route importer function for lazy loading
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Story definitions
export const Default: StoryObj = {
  render: () => <MobileNavigationDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Interactive demo of mobile navigation with different active paths and notification badges.",
      },
    },
  },
};

export const WithNotifications: StoryObj = {
  render: () => {
    const { items } = useMobileNavigation("/dashboard");

    return (
      <Card className="p-6 max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          Navigation with Notifications
        </h3>
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 border rounded"
            >
              <div className="flex items-center gap-3">
                <span className="font-medium">{item.label}</span>
                {item.isActive && <Badge variant="success">Active</Badge>}
              </div>
              {(item.badge ?? 0) > 0 && (
                <Badge variant="danger">{item.badge}</Badge>
              )}
            </div>
          ))}
        </div>
      </Card>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows navigation items with notification badges and active states.",
      },
    },
  },
};

export const ActiveStates: StoryObj = {
  render: () => {
    const paths = ["/dashboard", "/calendar", "/team/1/bulletin", "/profile"];

    return (
      <div className="grid grid-cols-2 gap-4 max-w-4xl">
        {paths.map((path) => {
          const { items } = useMobileNavigation(path);
          return (
            <Card key={path} className="p-4">
              <h4 className="font-medium mb-3">Path: {path}</h4>
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>{item.label}</span>
                    {item.isActive ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <span className="text-muted">Inactive</span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates how active states change based on the current path.",
      },
    },
  },
};
