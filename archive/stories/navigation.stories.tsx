import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import {
  getNavigationItems,
  toSidebarItems,
  getPrimaryNavigationItems,
  getRoleDisplayInfo,
} from "./navigation";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

const meta: Meta = {
  title: "Utils/navigation",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Navigation utilities for BoxCall application with role-based access control.

**Features:**
- Role-based navigation items with permissions
- Sidebar and primary navigation conversion
- User role display information
- Dynamic team-based routing

**Usage:**
\`\`\`tsx
import { getNavigationItems, toSidebarItems } from './utils/navigation';

// Get navigation for a coach
const navItems = getNavigationItems('coach', 'team-123');

// Convert to sidebar format
const sidebarItems = toSidebarItems(navItems, 'coach', (href) => {
  // Handle navigation
  router.push(href);
});
\`\`\`
        `,
      },
    },
  },
};

export default meta;

// Navigation Demo Component
const NavigationDemo = () => {
  const roles: Array<string | null> = [
    "super_admin",
    "admin",
    "coach",
    "player",
    "family",
    null,
  ];
  const [selectedRole, setSelectedRole] = React.useState<string | null>(
    "coach"
  );

  const navItems = getNavigationItems(selectedRole, "team-123");
  const primaryItems = getPrimaryNavigationItems(selectedRole as any);

  return (
    <Card className="w-full max-w-6xl p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Navigation System</h3>
          <p className="text-sm text-gray-600 mb-4">
            Role-based navigation with dynamic team routing and permission
            controls.
          </p>
        </div>

        {/* Role Selector */}
        <div className="space-y-4">
          <h4 className="font-medium">Select User Role</h4>
          <div className="flex flex-wrap gap-2">
            {roles.map((role) => {
              const roleInfo = getRoleDisplayInfo(role as any);
              return (
                <Button
                  key={role || "null"}
                  variant={selectedRole === role ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setSelectedRole(role)}
                >
                  {roleInfo.display}
                </Button>
              );
            })}
          </div>
          <div className="text-sm text-gray-600">
            Current role:{" "}
            <Badge variant="info">
              {getRoleDisplayInfo(selectedRole as any).display}
            </Badge>
          </div>
        </div>

        {/* Primary Navigation */}
        <div className="space-y-4">
          <h4 className="font-medium">
            Primary Navigation Items ({primaryItems.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {primaryItems.map((item) => (
              <div key={item.id} className="p-3 border rounded-lg text-center">
                <div className="text-2xl mb-2">{item.icon ? "📱" : "•"}</div>
                <div className="font-medium text-sm">{item.label}</div>
                <div className="text-xs text-gray-600 mt-1">{item.href}</div>
                {item.badge && (
                  <Badge variant="premium" className="mt-2 text-xs">
                    {item.badge}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Full Navigation */}
        <div className="space-y-4">
          <h4 className="font-medium">
            Full Navigation Items ({navItems.length})
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {navItems.map((item) => (
              <div
                key={item.id}
                className={`p-4 border rounded-lg ${
                  item.divider ? "bg-gray-50 border-dashed" : "hover:bg-gray-50"
                }`}
              >
                {item.divider ? (
                  <div className="text-center text-gray-400">
                    <div className="border-t border-dashed mb-2"></div>
                    Divider
                    <div className="border-t border-dashed mt-2"></div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {item.icon ? "📱" : "•"}
                        </span>
                        <span className="font-medium">{item.label}</span>
                      </div>
                      {item.badge && (
                        <Badge variant="premium" className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </div>

                    <div className="text-sm text-gray-600 mb-2">
                      {item.href}
                    </div>

                    {item.description && (
                      <div className="text-xs text-gray-500 mb-2">
                        {item.description}
                      </div>
                    )}

                    {item.roles && item.roles.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.roles.map((role) => (
                          <Badge
                            key={role}
                            variant="neutral"
                            className="text-xs"
                          >
                            {role}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Stats */}
        <div className="space-y-4">
          <h4 className="font-medium">Navigation Statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">
                {navItems.length}
              </div>
              <div className="text-sm text-gray-600">Total Items</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">
                {
                  navItems.filter((item) => item.roles && item.roles.length > 0)
                    .length
                }
              </div>
              <div className="text-sm text-gray-600">Role-Restricted</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {navItems.filter((item) => item.badge).length}
              </div>
              <div className="text-sm text-gray-600">With Badges</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">
                {navItems.filter((item) => item.divider).length}
              </div>
              <div className="text-sm text-gray-600">Dividers</div>
            </div>
          </div>
        </div>

        {/* Function Signatures */}
        <div className="space-y-4">
          <h4 className="font-medium">Function Signatures</h4>
          <div className="text-sm space-y-2 text-gray-600">
            <div>
              <code>
                getNavigationItems(userRole?, activeTeamId?): NavigationItem[]
              </code>
            </div>
            <div>
              <code>
                toSidebarItems(items, userRole?, onNavigate?): SidebarItem[]
              </code>
            </div>
            <div>
              <code>
                getPrimaryNavigationItems(userRole?): NavigationItem[]
              </code>
            </div>
            <div>
              <code>getRoleDisplayInfo(role?): RoleDisplayInfo</code>
            </div>
          </div>
        </div>

        {/* Data Structures */}
        <div className="space-y-4">
          <h4 className="font-medium">NavigationItem Structure</h4>
          <div className="p-4 border rounded-lg bg-gray-50">
            <div className="text-sm space-y-1 text-gray-700">
              <div>
                <code>id</code> - Unique identifier
              </div>
              <div>
                <code>label</code> - Display text
              </div>
              <div>
                <code>icon</code> - Icon name (optional)
              </div>
              <div>
                <code>href</code> - Navigation URL
              </div>
              <div>
                <code>roles</code> - Required roles array (optional)
              </div>
              <div>
                <code>children</code> - Child navigation items (optional)
              </div>
              <div>
                <code>divider</code> - Whether this is a divider (optional)
              </div>
              <div>
                <code>badge</code> - Badge text/number (optional)
              </div>
              <div>
                <code>description</code> - Tooltip/description text (optional)
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
  render: () => <NavigationDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Complete navigation system demo with role-based filtering and statistics.",
      },
    },
  },
};

export const RoleBasedNavigation: StoryObj = {
  render: () => {
    const roles = [
      { role: "super_admin", label: "Super Admin" },
      { role: "admin", label: "Admin" },
      { role: "coach", label: "Coach" },
      { role: "player", label: "Player" },
      { role: "family", label: "Family" },
      { role: null, label: "Unauthenticated" },
    ];

    return (
      <Card className="p-6 max-w-4xl">
        <h3 className="text-lg font-semibold mb-4">
          Role-Based Navigation Comparison
        </h3>
        <div className="space-y-6">
          {roles.map(({ role, label }) => {
            const items = getNavigationItems(role, "team-123");
            const roleInfo = getRoleDisplayInfo(role as any);

            return (
              <div key={role || "null"} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={roleInfo.color as any}>
                    {roleInfo.display}
                  </Badge>
                  <span className="font-medium">{label}</span>
                  <span className="text-sm text-gray-600">
                    ({items.length} items)
                  </span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {items.slice(0, 8).map((item) => (
                    <Badge
                      key={item.id}
                      variant={item.divider ? "neutral" : "info"}
                      className="text-xs"
                    >
                      {item.divider ? "—" : item.label}
                    </Badge>
                  ))}
                  {items.length > 8 && (
                    <Badge variant="neutral" className="text-xs">
                      +{items.length - 8} more
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows how navigation items change based on user roles and permissions.",
      },
    },
  },
};

export const PrimaryNavigation: StoryObj = {
  render: () => {
    const roles = ["super_admin", "admin", "coach", "player", "family", null];

    return (
      <Card className="p-6 max-w-2xl">
        <h3 className="text-lg font-semibold mb-4">Primary Navigation Items</h3>
        <div className="space-y-4">
          {roles.map((role) => {
            const items = getPrimaryNavigationItems(role as any);
            const roleInfo = getRoleDisplayInfo(role as any);

            return (
              <div key={role || "null"} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={roleInfo.color as any}>
                    {roleInfo.display}
                  </Badge>
                </div>

                <div className="flex gap-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-2 border rounded text-center min-w-[80px]"
                    >
                      <div className="text-lg mb-1">📱</div>
                      <div className="text-xs font-medium">{item.label}</div>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <div className="text-sm text-gray-500 italic">
                      No primary items
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows primary navigation items for different user roles (top navigation bar).",
      },
    },
  },
};

export const SidebarConversion: StoryObj = {
  render: () => {
    const navItems = getNavigationItems("coach", "team-123");
    const sidebarItems = toSidebarItems(navItems, "coach", (href) => {
      console.log("Navigate to:", href);
    });

    return (
      <Card className="p-6 max-w-2xl">
        <h3 className="text-lg font-semibold mb-4">Sidebar Item Conversion</h3>
        <div className="space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            NavigationItems converted to SidebarItems with click handlers and
            icon components.
          </div>

          <div className="space-y-2">
            {sidebarItems.slice(0, 10).map((item) => (
              <div key={item.id} className="p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-lg">📱</div>
                  <div className="flex-1">
                    <div className="font-medium">{item.label}</div>
                    {item.badge && (
                      <Badge variant="premium" className="text-xs mt-1">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  <Button size="sm" variant="outline">
                    Navigate
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-sm text-gray-600">
            <div>
              <strong>Conversion:</strong> NavigationItem[] → SidebarItem[]
            </div>
            <div>
              <strong>Added:</strong> onClick handlers, React icon components
            </div>
            <div>
              <strong>Filtered:</strong> Role-based permissions
            </div>
          </div>
        </div>
      </Card>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates conversion from NavigationItem to SidebarItem format.",
      },
    },
  },
};
