import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { DashboardProvider } from "./DashboardContext";
import { useDashboardContext } from "./useDashboardContext";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";

const meta: Meta = {
  title: "Contexts/DashboardContext",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
Dashboard state management context for user profile, notifications, and UI state.

**Features:**
- User profile management
- Notification system
- UI state persistence (sidebar, etc.)
- Centralized dashboard state
- Type-safe context usage

**Usage:**
\`\`\`tsx
import { DashboardProvider, useDashboardContext } from './contexts/DashboardContext';

function App() {
  return (
    <DashboardProvider>
      <YourApp />
    </DashboardProvider>
  );
}

function YourComponent() {
  const { profile, notifications, ui, setProfile, setNotifications, setUI } = useDashboardContext();

  return (
    <div>
      <h1>Welcome {profile?.full_name}</h1>
      <p>Notifications: {notifications.length}</p>
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

// Dashboard Demo Component
const DashboardDemo = () => {
  const { profile, notifications, ui, setProfile, setNotifications, setUI } =
    useDashboardContext();

  const [newNotification, setNewNotification] = React.useState("");

  const addNotification = () => {
    if (!newNotification.trim()) return;

    const notification = {
      id: `notif-${Date.now()}`,
      message: newNotification,
      type: "info" as const,
    };

    setNotifications([...notifications, notification]);
    setNewNotification("");
  };

  const removeNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const toggleSidebar = () => {
    setUI({ ...ui, sidebarOpen: !ui.sidebarOpen });
  };

  const setMockProfile = () => {
    setProfile({
      id: "user-123",
      full_name: "John Doe",
      avatar_url: null,
      role: "coach",
      bio: null,
      phone: null,
      email: "john@example.com",
      display_name: null,
      address: null,
      settings: null,
      last_login: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      position: null,
      jersey_number: null,
      is_active: true,
      notification_preferences: null,
    });
  };

  const clearProfile = () => {
    setProfile(null);
  };

  return (
    <Card className="w-full max-w-4xl p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Dashboard Context Demo</h3>
          <p className="text-sm text-gray-600 mb-4">
            Manage dashboard state including profile, notifications, and UI
            settings.
          </p>
        </div>

        {/* Profile Section */}
        <div className="space-y-4">
          <h4 className="font-medium">User Profile</h4>
          <div className="flex items-center gap-4">
            <Button onClick={setMockProfile}>Set Mock Profile</Button>
            <Button variant="outline" onClick={clearProfile}>
              Clear Profile
            </Button>
          </div>

          {profile ? (
            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Name:</span> {profile.full_name}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {profile.email}
                </div>
                <div>
                  <span className="font-medium">Role:</span>
                  <Badge variant="info" className="ml-2">
                    {profile.role}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">ID:</span> {profile.id}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 border rounded-lg text-gray-500">
              No profile set
            </div>
          )}
        </div>

        {/* UI State Section */}
        <div className="space-y-4">
          <h4 className="font-medium">UI State</h4>
          <div className="flex items-center gap-4">
            <Button onClick={toggleSidebar}>
              {ui.sidebarOpen ? "Close" : "Open"} Sidebar
            </Button>
            <Badge variant={ui.sidebarOpen ? "success" : "neutral"}>
              Sidebar: {ui.sidebarOpen ? "Open" : "Closed"}
            </Badge>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="space-y-4">
          <h4 className="font-medium">
            Notifications ({notifications.length})
          </h4>

          <div className="flex gap-2">
            <Input
              placeholder="New notification message"
              value={newNotification}
              onChange={(e) => setNewNotification(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={addNotification}
              disabled={!newNotification.trim()}
            >
              Add Notification
            </Button>
          </div>

          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="info">{notification.type}</Badge>
                  <span>{notification.message}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => removeNotification(notification.id)}
                >
                  Remove
                </Button>
              </div>
            ))}

            {notifications.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No notifications
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <Button variant="danger" onClick={() => setNotifications([])}>
              Clear All Notifications
            </Button>
          )}
        </div>

        {/* Context State Summary */}
        <div className="space-y-4">
          <h4 className="font-medium">Context State Summary</h4>
          <div className="text-sm space-y-1">
            <div>
              <code>profile:</code> {profile ? "Set" : "null"}
            </div>
            <div>
              <code>notifications:</code> {notifications.length} items
            </div>
            <div>
              <code>ui.sidebarOpen:</code> {ui.sidebarOpen ? "true" : "false"}
            </div>
          </div>
        </div>

        {/* Available Methods */}
        <div className="space-y-4">
          <h4 className="font-medium">Available Methods</h4>
          <div className="text-sm space-y-1">
            <div>
              <code>setProfile(profile | null)</code> - Update user profile
            </div>
            <div>
              <code>setNotifications(notifications[])</code> - Update
              notifications array
            </div>
            <div>
              <code>setUI(ui)</code> - Update UI state object
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Story wrapper that provides the DashboardProvider
const DashboardStoryWrapper = ({ children }: { children: React.ReactNode }) => (
  <DashboardProvider>{children}</DashboardProvider>
);

export const Default: StoryObj = {
  render: () => (
    <DashboardStoryWrapper>
      <DashboardDemo />
    </DashboardStoryWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Complete dashboard context demo with profile, notifications, and UI state management.",
      },
    },
  },
};

export const ProfileManagement: StoryObj = {
  render: () => (
    <DashboardStoryWrapper>
      <Card className="p-6 max-w-md">
        <h3 className="text-lg font-semibold mb-4">Profile Management</h3>
        <ProfileDemo />
      </Card>
    </DashboardStoryWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates profile state management in the dashboard context.",
      },
    },
  },
};

export const NotificationSystem: StoryObj = {
  render: () => (
    <DashboardStoryWrapper>
      <Card className="p-6 max-w-md">
        <h3 className="text-lg font-semibold mb-4">Notification System</h3>
        <NotificationDemo />
      </Card>
    </DashboardStoryWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story: "Shows notification management within the dashboard context.",
      },
    },
  },
};

// Simplified demo components for individual stories
const ProfileDemo = () => {
  const { profile, setProfile } = useDashboardContext();

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() =>
            setProfile({
              id: "user-demo",
              full_name: "Demo User",
              avatar_url: null,
              role: "coach",
              bio: null,
              phone: null,
              email: "demo@example.com",
              display_name: null,
              address: null,
              settings: null,
              last_login: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              position: null,
              jersey_number: null,
              is_active: true,
              notification_preferences: null,
            })
          }
        >
          Set Profile
        </Button>
        <Button size="sm" variant="outline" onClick={() => setProfile(null)}>
          Clear
        </Button>
      </div>

      {profile && (
        <div className="text-sm">
          <div>Name: {profile.full_name}</div>
          <div>Email: {profile.email}</div>
        </div>
      )}
    </div>
  );
};

const NotificationDemo = () => {
  const { notifications, setNotifications } = useDashboardContext();

  const addNotif = () => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      message: `Notification ${notifications.length + 1}`,
      type: "info" as const,
    };
    setNotifications([...notifications, newNotif]);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button size="sm" onClick={addNotif}>
          Add Notification
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setNotifications([])}
        >
          Clear All
        </Button>
      </div>

      <div className="text-sm">
        Active notifications: {notifications.length}
      </div>
    </div>
  );
};
