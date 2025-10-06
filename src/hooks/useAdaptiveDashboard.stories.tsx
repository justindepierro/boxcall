import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import {
  useAdaptiveDashboard,
  useAdaptiveWidget,
} from "./useAdaptiveDashboard";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

const meta: Meta = {
  title: "Hooks/useAdaptiveDashboard",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
# useAdaptiveDashboard Hook

Provides intelligent dashboard adaptation based on context, time, and user behavior.

## Features

- **Context Detection**: Automatically detects current context (practice, game, planning, etc.)
- **Time-Based Adaptation**: Adapts based on time of day and practice/game schedules
- **Widget Prioritization**: Dynamically prioritizes widgets based on relevance
- **User Activity Tracking**: Tracks interactions to improve recommendations
- **Contextual Actions**: Provides situation-appropriate actions

## Available Functions

- \`useAdaptiveDashboard()\` - Main hook for dashboard adaptation
- \`useAdaptiveWidget(widgetId, widgetType)\` - Hook for individual widget adaptation
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// MAIN DASHBOARD HOOK DEMO
// ============================================================================

const AdaptiveDashboardDemo: React.FC = () => {
  const {
    currentContext,
    timeContext,
    userActivity,
    isAdaptiveMode,
    contextConfidence,
    lastContextUpdate,
    trackWidgetInteraction,
    getAdaptiveActions,
    refreshContext,
    adaptiveRecommendations,
  } = useAdaptiveDashboard();

  const [selectedWidget, setSelectedWidget] = React.useState("stats-widget");

  const handleTrackInteraction = () => {
    trackWidgetInteraction(selectedWidget, "interact", 2000);
  };

  const handleTrackView = () => {
    trackWidgetInteraction(selectedWidget, "view", 1000);
  };

  const adaptiveActions = getAdaptiveActions();

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Adaptive Dashboard State</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Context Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <strong>Current Context:</strong>
              <Badge variant={currentContext ? "success" : "neutral"}>
                {currentContext || "None detected"}
              </Badge>
            </div>

            <div className="space-y-2">
              <strong>Time Context:</strong>
              <Badge variant={timeContext ? "info" : "neutral"}>
                {timeContext || "Unknown"}
              </Badge>
            </div>

            <div className="space-y-2">
              <strong>Adaptive Mode:</strong>
              <Badge variant={isAdaptiveMode ? "success" : "neutral"}>
                {isAdaptiveMode ? "Enabled" : "Disabled"}
              </Badge>
            </div>

            <div className="space-y-2">
              <strong>Context Confidence:</strong>
              <span className="text-sm">
                {(contextConfidence * 100).toFixed(1)}%
              </span>
            </div>

            <div className="space-y-2">
              <strong>Last Update:</strong>
              <span className="text-sm">
                {new Date(lastContextUpdate).toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* User Activity */}
          <div className="space-y-4">
            <strong>Recent Activity:</strong>
            {userActivity?.length ? (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {userActivity.slice(-3).map((activity, index) => (
                  <div key={index} className="p-2 bg-surface-secondary rounded text-sm">
                    <div>
                      <strong>{activity.widgetId}</strong> - {activity.action}
                    </div>
                    <div className="text-muted">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted text-sm">No recent activity</div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Button onClick={refreshContext} variant="outline" size="sm">
            Refresh Context
          </Button>
        </div>
      </Card>

      {/* Widget Interaction Testing */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Widget Interaction Testing
        </h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <strong>Select Widget:</strong>
            <select
              value={selectedWidget}
              onChange={(e) => setSelectedWidget(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="stats-widget">Stats Widget</option>
              <option value="playbook-widget">Playbook Widget</option>
              <option value="schedule-widget">Schedule Widget</option>
              <option value="roster-widget">Roster Widget</option>
            </select>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleTrackView} variant="outline">
              Track View
            </Button>
            <Button onClick={handleTrackInteraction} variant="outline">
              Track Interaction
            </Button>
          </div>
        </div>
      </Card>

      {/* Adaptive Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Contextual Actions</h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <strong>Adaptive Actions ({adaptiveActions.length}):</strong>
            {adaptiveActions.length ? (
              <div className="space-y-2">
                {adaptiveActions.map((action, index) => (
                  <div
                    key={index}
                    className="p-3 bg-status-info-bg border border-blue-200 rounded-lg"
                  >
                    <div className="font-medium">{action.title}</div>
                    <div className="text-sm text-secondary">
                      {action.description}
                    </div>
                    <Badge variant="info" className="mt-1">
                      Priority: {action.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted text-sm">
                No contextual actions available
              </div>
            )}
          </div>

          <div className="space-y-2">
            <strong>Recommendations ({adaptiveRecommendations.length}):</strong>
            {adaptiveRecommendations.length ? (
              <ul className="list-disc list-inside space-y-1 text-sm">
                {adaptiveRecommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            ) : (
              <div className="text-muted text-sm">
                No recommendations available
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

// ============================================================================
// ADAPTIVE WIDGET HOOK DEMO
// ============================================================================

const AdaptiveWidgetDemo: React.FC = () => {
  const [widgetId, setWidgetId] = React.useState("stats-widget-1");
  const [widgetType, setWidgetType] = React.useState("statistics");

  const {
    priorityBoost,
    trackView,
    trackInteraction,
    trackEdit,
    isHighPriority,
    contextRelevance,
  } = useAdaptiveWidget(widgetId, widgetType);

  const widgetTypes = [
    "statistics",
    "playbook",
    "schedule",
    "roster",
    "announcements",
    "performance",
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Adaptive Widget Hook</h3>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="space-y-2">
            <strong>Widget Type:</strong>
            <select
              value={widgetType}
              onChange={(e) => setWidgetType(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {widgetTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Widget Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <strong>Priority Boost</strong>
            <div className="text-2xl font-bold text-blue-600">
              {priorityBoost}
            </div>
          </div>
          <div className="text-center">
            <strong>High Priority</strong>
            <Badge
              variant={isHighPriority ? "success" : "neutral"}
              className="mt-1"
            >
              {isHighPriority ? "Yes" : "No"}
            </Badge>
          </div>
          <div className="text-center">
            <strong>Relevance</strong>
            <Badge
              variant={contextRelevance === "high" ? "success" : "neutral"}
              className="mt-1"
            >
              {contextRelevance}
            </Badge>
          </div>
          <div className="text-center">
            <strong>Visibility</strong>
            <Badge
              variant={priorityBoost > 0 ? "success" : "warning"}
              className="mt-1"
            >
              {priorityBoost > 0 ? "Visible" : "Hidden"}
            </Badge>
          </div>
        </div>

        {/* Interaction Buttons */}
        <div className="flex gap-2">
          <Button onClick={trackView} variant="outline" size="sm">
            Track View
          </Button>
          <Button
            onClick={() => trackInteraction(1500)}
            variant="outline"
            size="sm"
          >
            Track Interaction
          </Button>
          <Button onClick={trackEdit} variant="outline" size="sm">
            Track Edit
          </Button>
        </div>
      </div>
    </Card>
  );
};

// ============================================================================
// STORIES
// ============================================================================

export const MainDashboardHook: Story = {
  render: () => <AdaptiveDashboardDemo />,
};

export const AdaptiveWidgetHook: Story = {
  render: () => <AdaptiveWidgetDemo />,
};

export const CompleteAdaptiveDemo: Story = {
  render: () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Complete Adaptive Dashboard Demo</h2>
      <AdaptiveDashboardDemo />
      <AdaptiveWidgetDemo />
    </div>
  ),
};
