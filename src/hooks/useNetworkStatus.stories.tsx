import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { useNetworkStatus } from "./useNetworkStatus";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

const meta: Meta = {
  title: "Hooks/useNetworkStatus",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
# useNetworkStatus Hook

A hook for monitoring network connectivity and connection quality.

## Current Implementation

This is currently a stub implementation that returns static values.

## Future Features

- **Online/Offline Detection**: Real-time network status monitoring
- **Connection Type**: wifi, cellular, ethernet, etc.
- **Connection Quality**: Fast, slow, or offline indicators
- **Automatic Reconnection**: Handle network recovery

## Usage

\`\`\`tsx
const { isOnline, connectionType, isSlowConnection } = useNetworkStatus();

return (
  <div>
    {isOnline ? (
      <span>🟢 Online ({connectionType})</span>
    ) : (
      <span>🔴 Offline</span>
    )}
    {isSlowConnection && <span>🐌 Slow connection detected</span>}
  </div>
);
\`\`\`
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// NETWORK STATUS DEMO
// ============================================================================

const NetworkStatusDemo: React.FC = () => {
  const { isOnline, connectionType, isSlowConnection } = useNetworkStatus();

  const statusInfo = {
    online: {
      label: "Online",
      color: "success" as const,
      icon: "🟢",
      description: "Connected to the internet",
    },
    offline: {
      label: "Offline",
      color: "danger" as const,
      icon: "🔴",
      description: "No internet connection",
    },
  };

  const connectionTypes = {
    wifi: { label: "Wi-Fi", icon: "📶", description: "Wireless network" },
    cellular: { label: "Cellular", icon: "📱", description: "Mobile data" },
    ethernet: {
      label: "Ethernet",
      icon: "🔌",
      description: "Wired connection",
    },
    unknown: {
      label: "Unknown",
      icon: "❓",
      description: "Connection type unknown",
    },
  };

  const currentStatus = statusInfo[isOnline ? "online" : "offline"];
  const currentConnection =
    connectionTypes[connectionType as keyof typeof connectionTypes] ||
    connectionTypes.unknown;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Network Status</h3>

      <div className="space-y-6">
        {/* Connection Status */}
        <div className="text-center">
          <div className="text-4xl mb-2">{currentStatus.icon}</div>
          <Badge
            variant={currentStatus.color}
            className="text-lg px-4 py-2 mb-2"
          >
            {currentStatus.label}
          </Badge>
          <div className="text-sm text-gray-600">
            {currentStatus.description}
          </div>
        </div>

        {/* Connection Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <strong>Connection Type:</strong>
            <div className="p-4 bg-surface-secondary rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{currentConnection.icon}</span>
                <div>
                  <div className="font-medium">{currentConnection.label}</div>
                  <div className="text-sm text-gray-600">
                    {currentConnection.description}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <strong>Connection Quality:</strong>
            <div className="p-4 bg-surface-secondary rounded-lg">
              {isSlowConnection ? (
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🐌</span>
                  <div>
                    <div className="font-medium text-orange-600">
                      Slow Connection
                    </div>
                    <div className="text-sm text-gray-600">
                      Limited functionality available
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <div className="font-medium text-green-600">
                      Fast Connection
                    </div>
                    <div className="text-sm text-gray-600">
                      Full functionality available
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Summary */}
        <div className="p-4 bg-status-info-bg border border-blue-200 rounded-lg">
          <strong>Status Summary:</strong>
          <ul className="mt-2 text-sm space-y-1">
            <li>• Online: {isOnline ? "Yes" : "No"}</li>
            <li>• Connection Type: {connectionType}</li>
            <li>• Slow Connection: {isSlowConnection ? "Yes" : "No"}</li>
          </ul>
        </div>

        {/* Implementation Note */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <strong>Implementation Note:</strong>
          <p className="text-sm mt-1">
            This hook currently returns static values. In a full implementation,
            it would monitor the browser's navigator.onLine API and Network
            Information API to provide real-time network status updates.
          </p>
        </div>
      </div>
    </Card>
  );
};

// ============================================================================
// CONDITIONAL FEATURES DEMO
// ============================================================================

const ConditionalFeaturesDemo: React.FC = () => {
  const { isOnline, connectionType, isSlowConnection } = useNetworkStatus();

  const OnlineOnlyFeature = () => (
    <div className="p-4 bg-green-100 border border-green-200 rounded-lg">
      <h4 className="font-semibold text-green-800">🌐 Online Feature</h4>
      <p className="text-sm text-green-700">
        This feature requires an internet connection
      </p>
    </div>
  );

  const OfflineFeature = () => (
    <div className="p-4 bg-surface-muted border border rounded-lg">
      <h4 className="font-semibold text-gray-800">💾 Offline Feature</h4>
      <p className="text-sm text-gray-700">
        This feature works without internet
      </p>
    </div>
  );

  const FastConnectionFeature = () => (
    <div className="p-4 bg-blue-100 border border-blue-200 rounded-lg">
      <h4 className="font-semibold text-blue-800">
        ⚡ Fast Connection Feature
      </h4>
      <p className="text-sm text-blue-700">
        Enhanced features for fast connections
      </p>
    </div>
  );

  const SlowConnectionFeature = () => (
    <div className="p-4 bg-orange-100 border border-orange-200 rounded-lg">
      <h4 className="font-semibold text-orange-800">🐌 Slow Connection Mode</h4>
      <p className="text-sm text-orange-700">
        Reduced features for slow connections
      </p>
    </div>
  );

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Conditional Features Demo</h3>

      <div className="space-y-4">
        <div className="text-center">
          <Badge variant={isOnline ? "success" : "danger"} className="mb-2">
            {isOnline ? "ONLINE" : "OFFLINE"}
          </Badge>
          <div className="text-sm text-gray-600">
            Connection: {connectionType} {isSlowConnection && "(Slow)"}
          </div>
        </div>

        <div className="space-y-4">
          {isOnline ? <OnlineOnlyFeature /> : <OfflineFeature />}
          {isSlowConnection ? (
            <SlowConnectionFeature />
          ) : (
            <FastConnectionFeature />
          )}

          <div className="p-4 bg-surface-secondary border border rounded-lg">
            <strong>Conditional Logic:</strong>
            <ul className="mt-2 text-sm space-y-1">
              <li>• Online features show when connected</li>
              <li>• Offline features show when disconnected</li>
              <li>• Fast/slow features adapt to connection quality</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
};

// ============================================================================
// STORIES
// ============================================================================

export const NetworkStatusDisplay: Story = {
  render: () => <NetworkStatusDemo />,
};

export const ConditionalFeatures: Story = {
  render: () => <ConditionalFeaturesDemo />,
};

export const CompleteNetworkDemo: Story = {
  render: () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Complete Network Status Demo</h2>
      <NetworkStatusDemo />
      <ConditionalFeaturesDemo />
    </div>
  ),
};
