import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { useCollaboration, useCollaborativeCursor } from "./useCollaboration";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

const meta: Meta = {
  title: "Hooks/useCollaboration",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
# useCollaboration Hook

Provides real-time collaboration functionality for dashboard sharing and widget-level collaboration.

## Features

- **Session Management**: Start and end collaboration sessions
- **Real-time Updates**: Broadcast dashboard and widget changes
- **Cursor Tracking**: See other users' cursors in real-time
- **Conflict Resolution**: Handle simultaneous edits
- **Permission Management**: Control who can view/edit

## Available Functions

- \`useCollaboration(options)\` - Main collaboration hook
- \`useCollaborativeCursor(elementRef, collaboration, widgetId?)\` - Cursor tracking hook
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// MAIN COLLABORATION HOOK DEMO
// ============================================================================

const CollaborationDemo: React.FC = () => {
  // Mock user data
  const mockUser = {
    id: "user-1",
    name: "John Coach",
    avatar: "https://via.placeholder.com/32",
    role: "coach" as const,
    isOnline: true,
  };

  const mockOptions = {
    teamId: "team-123",
    dashboardId: "dashboard-456",
    user: mockUser,
    autoConnect: false,
  };

  const {
    session,
    isConnected,
    isConnecting,
    error,
    participants,
    currentUser,
    recentUpdates,
    cursors,
    startSession,
    endSession,
    sendDashboardUpdate,
    canEdit,
    canView,
  } = useCollaboration(mockOptions);

  const [updateType, setUpdateType] = React.useState("widget_edit");
  const [widgetId, setWidgetId] = React.useState("stats-widget");

  const handleSendUpdate = () => {
    sendDashboardUpdate({
      type: updateType as any,
      widgetId,
      data: {
        config: { action: "edit", timestamp: Date.now() },
      },
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Collaboration Session</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Connection Status */}
          <div className="space-y-4">
            <div className="space-y-2">
              <strong>Connection Status:</strong>
              <Badge
                variant={
                  isConnected ? "success" : isConnecting ? "warning" : "danger"
                }
              >
                {isConnected
                  ? "Connected"
                  : isConnecting
                    ? "Connecting..."
                    : "Disconnected"}
              </Badge>
            </div>

            <div className="space-y-2">
              <strong>Session Status:</strong>
              <span className="text-sm">{session ? "Active" : "None"}</span>
            </div>

            <div className="space-y-2">
              <strong>Current User:</strong>
              <span className="text-sm">{currentUser?.name || "None"}</span>
            </div>

            <div className="space-y-2">
              <strong>Permissions:</strong>
              <div className="flex gap-2">
                <Badge variant={canEdit ? "success" : "neutral"}>
                  Can Edit: {canEdit ? "Yes" : "No"}
                </Badge>
                <Badge variant={canView ? "success" : "neutral"}>
                  Can View: {canView ? "Yes" : "No"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className="space-y-4">
            <strong>Participants ({participants.length}):</strong>
            {participants.length ? (
              <div className="space-y-2">
                {participants.map((participant, index) => (
                  <div
                    key={index}
                    className="p-2 bg-gray-50 rounded flex items-center gap-2"
                  >
                    <img
                      src={participant.avatar}
                      alt={participant.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm">{participant.name}</span>
                    <Badge variant="info" className="text-xs">
                      {participant.role}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-sm">No participants</div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            Error: {error}
          </div>
        )}

        {/* Session Controls */}
        <div className="flex gap-2 mt-4">
          <Button
            onClick={startSession}
            disabled={isConnecting || isConnected}
            variant="outline"
          >
            {isConnecting ? "Connecting..." : "Start Session"}
          </Button>
          <Button
            onClick={endSession}
            disabled={!isConnected}
            variant="outline"
          >
            End Session
          </Button>
        </div>
      </Card>

      {/* Dashboard Updates */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Send Dashboard Updates</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <strong>Update Type:</strong>
              <select
                value={updateType}
                onChange={(e) => setUpdateType(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="widget_edit">Widget Edit</option>
                <option value="widget_move">Widget Move</option>
                <option value="widget_resize">Widget Resize</option>
                <option value="widget_add">Widget Add</option>
                <option value="widget_remove">Widget Remove</option>
              </select>
            </div>

            <div className="space-y-2">
              <strong>Widget ID:</strong>
              <input
                type="text"
                value={widgetId}
                onChange={(e) => setWidgetId(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter widget ID"
              />
            </div>
          </div>

          <Button
            onClick={handleSendUpdate}
            disabled={!isConnected}
            variant="outline"
          >
            Send Update
          </Button>
        </div>
      </Card>

      {/* Recent Updates */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Updates</h3>

        <div className="space-y-2">
          {recentUpdates.length ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {recentUpdates.map((update, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded text-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <strong>{update.type}</strong>
                      {update.widgetId && <span> - {update.widgetId}</span>}
                    </div>
                    <span className="text-gray-500">
                      {new Date(update.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-gray-600 mt-1">
                    User: {update.userId}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-sm">No recent updates</div>
          )}
        </div>
      </Card>

      {/* Collaborative Cursors */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Collaborative Cursors</h3>

        <div className="space-y-2">
          <strong>Active Cursors ({cursors.length}):</strong>
          {cursors.length ? (
            <div className="space-y-2">
              {cursors.map((cursor, index) => (
                <div
                  key={index}
                  className="p-2 bg-blue-50 rounded flex items-center gap-2"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cursor.color }}
                  />
                  <span className="text-sm">{cursor.userName}</span>
                  <Badge variant="info" className="text-xs">
                    {cursor.action}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    ({cursor.x.toFixed(1)}%, {cursor.y.toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-sm">No active cursors</div>
          )}
        </div>
      </Card>
    </div>
  );
};

// ============================================================================
// COLLABORATIVE CURSOR HOOK DEMO
// ============================================================================

const CollaborativeCursorDemo: React.FC = () => {
  const elementRef = React.useRef<HTMLDivElement>(null);

  // Mock collaboration object
  const mockCollaboration = {
    isConnected: true,
    sendCursorUpdate: (cursor: any) => {
      console.log("Cursor update:", cursor);
    },
  } as any;

  useCollaborativeCursor(elementRef as any, mockCollaboration, "demo-widget");

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Collaborative Cursor Demo</h3>

      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Move your mouse over the area below to see cursor tracking in action.
          Check the browser console for cursor update events.
        </p>

        <div
          ref={elementRef}
          className="w-full h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-crosshair"
        >
          <span className="text-gray-500">Move mouse here</span>
        </div>

        <div className="text-sm text-gray-600">
          <strong>Note:</strong> This demo shows cursor tracking functionality.
          In a real collaboration session, other users would see your cursor
          movements.
        </div>
      </div>
    </Card>
  );
};

// ============================================================================
// STORIES
// ============================================================================

export const MainCollaborationHook: Story = {
  render: () => <CollaborationDemo />,
};

export const CollaborativeCursorHook: Story = {
  render: () => <CollaborativeCursorDemo />,
};

export const CompleteCollaborationDemo: Story = {
  render: () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Complete Collaboration Demo</h2>
      <CollaborationDemo />
      <CollaborativeCursorDemo />
    </div>
  ),
};
