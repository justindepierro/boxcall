/**
 * Unified Developer Tools Panel
 *
 * A comprehensive dev tools panel with tabs for different debugging and development features.
 * Only accessible to authorized developers (configured via env).
 */

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../app/auth-store";
import { useApp } from "../core/useApp";
import { AuthMonitoring } from "../../utils/authMonitoring";
import { PerformanceDashboard } from "./PerformanceDashboard";
import { isSuperAdminEmail } from "../../config/superAdmin";

interface AuthMonitorTabProps {}

const AuthMonitorTab: React.FC<AuthMonitorTabProps> = () => {
  const { user, session, profile, loading, error, refreshSession } = useAuth();
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const [authEvents, setAuthEvents] = useState<string[]>([]);
  const [monitoringData, setMonitoringData] = useState({
    metrics: AuthMonitoring.getMetrics(),
    health: AuthMonitoring.getHealthStatus(),
    recentErrors: AuthMonitoring.getRecentErrors(5),
    recentEvents: AuthMonitoring.getRecentEvents(10),
  });

  // Update monitoring data periodically
  useEffect(() => {
    const updateMonitoring = () => {
      setMonitoringData({
        metrics: AuthMonitoring.getMetrics(),
        health: AuthMonitoring.getHealthStatus(),
        recentErrors: AuthMonitoring.getRecentErrors(5),
        recentEvents: AuthMonitoring.getRecentEvents(10),
      });
    };

    updateMonitoring();
    const interval = setInterval(updateMonitoring, 2000); // Update every 2 seconds
    return () => clearInterval(interval);
  }, []);

  // Monitor auth events
  useEffect(() => {
    const addEvent = (event: string) => {
      setAuthEvents((prev) => [
        new Date().toLocaleTimeString() + ": " + event,
        ...prev.slice(0, 9),
      ]);
    };

    // Listen for auth state changes
    if (user) addEvent("User authenticated: " + user.email);
    if (session) addEvent("Session updated");
    if (profile) addEvent("Profile loaded: " + profile.role);
    if (error) addEvent("Error: " + error);
    if (loading) addEvent("Loading state changed");
  }, [user, session, profile, error, loading]);

  // Get session info on mount and when session changes
  useEffect(() => {
    const updateSessionInfo = async () => {
      // Use session data directly from auth store
      setSessionInfo(session);
      if (session) {
        // Session is considered valid if it exists and has a valid access token
        const hasValidToken = Boolean(session.access_token);
        const notExpired =
          !session.expires_at || session.expires_at > Date.now() / 1000;
        const valid = hasValidToken && notExpired;
        setIsValidSession(valid);
      } else {
        setIsValidSession(false);
      }
    };
    updateSessionInfo();
  }, [session]);

  const handleRefreshSession = async () => {
    const result = await refreshSession();
    if (result.success) {
      setAuthEvents((prev) => [
        new Date().toLocaleTimeString() + ": Session refreshed successfully",
        ...prev.slice(0, 9),
      ]);
    } else {
      setAuthEvents((prev) => [
        new Date().toLocaleTimeString() +
          ": Session refresh failed: " +
          result.error,
        ...prev.slice(0, 9),
      ]);
    }
  };

  const formatTime = (timestamp: string | number | undefined) => {
    if (!timestamp) return "N/A";
    const date =
      typeof timestamp === "string"
        ? new Date(timestamp)
        : new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  const getTimeUntilExpiry = () => {
    if (!sessionInfo?.timeUntilExpiry) return "N/A";
    const minutes = Math.floor(sessionInfo.timeUntilExpiry / (1000 * 60));
    const seconds = Math.floor(
      (sessionInfo.timeUntilExpiry % (1000 * 60)) / 1000
    );
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="space-y-md">
      <h3 className="text-lg font-semibold text-primary">
        🔐 Auth Monitor
      </h3>

      {/* Health Status */}
      <div className="space-y-xs">
        <h4 className="font-medium text-secondary">System Health</h4>
        <div className="grid grid-cols-2 gap-xs text-sm">
          <div>
            <strong>Status:</strong>
            <span
              className={`ml-xs px-xs py-xs rounded-lg text-xs ${
                monitoringData.health.overall === "healthy"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                  : monitoringData.health.overall === "warning"
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                    : "bg-error-bg text-error-800 dark:bg-error-900/20 dark:text-error-400"
              }`}
            >
              {monitoringData.health.overall}
            </span>
          </div>
          <div>
            <strong>Sign-in Success:</strong>{" "}
            {monitoringData.health.signInSuccessRate.toFixed(1)}%
          </div>
          <div>
            <strong>Sign-up Success:</strong>{" "}
            {monitoringData.health.signUpSuccessRate.toFixed(1)}%
          </div>
          <div>
            <strong>Network Errors:</strong>{" "}
            {monitoringData.health.networkErrors}
          </div>
          <div>
            <strong>Security Violations:</strong>{" "}
            {monitoringData.health.securityViolations}
          </div>
          <div>
            <strong>Rate Limit Hits:</strong>{" "}
            {monitoringData.health.rateLimitHits}
          </div>
        </div>
      </div>

      {/* Current Auth State */}
      <div className="space-y-xs">
        <h4 className="font-medium text-secondary">Current State</h4>
        <div className="grid grid-cols-2 gap-xs text-sm">
          <div>
            <strong>Authenticated:</strong> {user ? "✅ Yes" : "❌ No"}
          </div>
          <div>
            <strong>Loading:</strong> {loading ? "⏳ Yes" : "✅ No"}
          </div>
          <div>
            <strong>Session Valid:</strong>{" "}
            {isValidSession === null
              ? "❓ Unknown"
              : isValidSession
                ? "✅ Yes"
                : "❌ No"}
          </div>
          <div>
            <strong>Profile Loaded:</strong> {profile ? "✅ Yes" : "❌ No"}
          </div>
        </div>
        {error && (
          <div className="mt-xs p-xs bg-error-bg dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg text-sm text-error-600 dark:text-error-400">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      {/* User Info */}
      {user && (
        <div className="space-y-xs">
          <h4 className="font-medium text-secondary">User Info</h4>
          <div className="text-sm space-y-xs">
            <div>
              <strong>Email:</strong> {user.email}
            </div>
            <div>
              <strong>User ID:</strong> {user.id}
            </div>
            <div>
              <strong>Role:</strong> {profile?.role || "N/A"}
            </div>
            <div>
              <strong>Created:</strong> {formatTime(user.created_at)}
            </div>
            <div>
              <strong>Last Sign In:</strong> {formatTime(user.last_sign_in_at)}
            </div>
          </div>
        </div>
      )}

      {/* Session Info */}
      {sessionInfo && (
        <div className="space-y-xs">
          <h4 className="font-medium text-secondary">Session Info</h4>
          <div className="text-sm space-y-xs">
            <div>
              <strong>Expires:</strong> {formatTime(sessionInfo.expiresAt)}
            </div>
            <div>
              <strong>Time Until Expiry:</strong> {getTimeUntilExpiry()}
            </div>
            <div>
              <strong>Session ID:</strong>{" "}
              {session?.access_token ? "Present" : "Missing"}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-xs">
        <h4 className="font-medium text-secondary">Actions</h4>
        <div className="flex gap-xs">
          <button
            onClick={handleRefreshSession}
            disabled={loading}
            className="px-sm py-xs bg-status-info-bg0 text-white rounded-lg text-sm hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh Session"}
          </button>
          <button
            onClick={() => setAuthEvents([])}
            className="px-sm py-xs bg-secondary rounded-lg text-sm hover:bg-surface-hover"
          >
            Clear Events
          </button>
        </div>
      </div>

      {/* Auth Events Log */}
      <div className="space-y-xs">
        <h4 className="font-medium text-secondary">Recent Events</h4>
        <div className="max-h-32 overflow-y-auto bg-secondary rounded-lg p-xs text-xs font-mono">
          {authEvents.length === 0 ? (
            <div className="text-muted">No events yet</div>
          ) : (
            authEvents.map((event, index) => (
              <div key={index} className="mb-xs text-secondary">
                {event}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Monitoring Metrics */}
      <div className="space-y-xs">
        <h4 className="font-medium text-secondary">Metrics</h4>
        <div className="grid grid-cols-2 gap-xs text-sm">
          <div>
            <strong>Sign-in Attempts:</strong>{" "}
            {monitoringData.metrics.signInAttempts}
          </div>
          <div>
            <strong>Sign-in Successes:</strong>{" "}
            {monitoringData.metrics.signInSuccesses}
          </div>
          <div>
            <strong>Sign-up Attempts:</strong>{" "}
            {monitoringData.metrics.signUpAttempts}
          </div>
          <div>
            <strong>Sign-up Successes:</strong>{" "}
            {monitoringData.metrics.signUpSuccesses}
          </div>
          <div>
            <strong>Sign-outs:</strong> {monitoringData.metrics.signOutEvents}
          </div>
          <div>
            <strong>Session Refreshes:</strong>{" "}
            {monitoringData.metrics.sessionRefreshes}
          </div>
          <div>
            <strong>Retry Attempts:</strong>{" "}
            {monitoringData.metrics.retryAttempts}
          </div>
          <div>
            <strong>Offline Queued:</strong>{" "}
            {monitoringData.metrics.offlineQueuedOperations}
          </div>
        </div>
      </div>

      {/* Recent Errors */}
      {monitoringData.recentErrors.length > 0 && (
        <div className="space-y-xs">
          <h4 className="font-medium text-secondary">Recent Errors</h4>
          <div className="max-h-32 overflow-y-auto bg-error-bg dark:bg-error-900/10 border border-error-200 dark:border-error-800 rounded-lg p-xs text-xs">
            {monitoringData.recentErrors.map((error, index) => (
              <div
                key={index}
                className="mb-xs text-error-600 dark:text-error-400"
              >
                <div className="font-medium">{error.operation}</div>
                <div className="text-error-600 dark:text-error-500">
                  {error.error}
                </div>
                <div className="text-xs text-error-500 dark:text-error-500">
                  {error.timestamp.toLocaleTimeString()}
                  {error.userId && ` • User: ${error.userId.slice(0, 8)}...`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monitoring Events */}
      {monitoringData.recentEvents.length > 0 && (
        <div className="space-y-xs">
          <h4 className="font-medium text-secondary">Monitoring Events</h4>
          <div className="max-h-32 overflow-y-auto bg-status-info-bg dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-xs text-xs">
            {monitoringData.recentEvents.map((event, index) => (
              <div
                key={index}
                className="mb-xs text-blue-700 dark:text-blue-300"
              >
                <span className="font-medium">{event.event}</span>
                {event.userId && (
                  <span className="ml-2 text-blue-600 dark:text-blue-400">
                    User: {event.userId.slice(0, 8)}...
                  </span>
                )}
                <span className="ml-2 text-blue-500 dark:text-blue-500">
                  {event.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface DevPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType =
  | "design-system"
  | "performance"
  | "auth"
  | "console"
  | "debug"
  | "settings";

const DevPanel: React.FC<DevPanelProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { designConfig: config, updateDesignConfig: updateConfig } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>("design-system");
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [size, setSize] = useState({ width: 600, height: 400 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Only show for authorized user
  const isAuthorized = isSuperAdminEmail(user?.email ?? null);

  // Mouse event handlers for dragging
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
      }
    },
    [position]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  // Resize handlers
  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  const handleResizeMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = Math.max(400, size.width + (e.clientX - dragStart.x));
        const newHeight = Math.max(
          300,
          size.height + (e.clientY - dragStart.y)
        );
        setSize({ width: newWidth, height: newHeight });
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    },
    [isResizing, size, dragStart]
  );

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleResizeMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleResizeMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isResizing, handleResizeMouseMove, handleMouseUp]);

  if (!isOpen || !isAuthorized) return null;

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: "design-system", label: "Design System", icon: "🎨" },
    { id: "performance", label: "Performance", icon: "📊" },
    { id: "auth", label: "Auth Monitor", icon: "🔐" },
    { id: "console", label: "Console", icon: "💻" },
    { id: "debug", label: "Debug", icon: "🔧" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div
      className="fixed z-[9999] bg-primary/95 backdrop-blur-md border border-muted rounded-lg shadow-2xl overflow-hidden"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        cursor: isDragging ? "grabbing" : "grab",
      }}
    >
      {/* Header */}
      <div
        className="bg-secondary/90 px-md py-sm border-b border-muted flex items-center justify-between cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
      >
        <h2 className="text-lg font-semibold text-primary">
          🛠️ Developer Tools
        </h2>
        <button
          onClick={onClose}
          className="text-secondary hover:text-primary p-xs"
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-muted">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-md py-xs text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-info/20 text-info border-b-2 border-text-info"
                : "text-secondary hover:text-primary hover:bg-surface-hover"
            }`}
          >
            <span className="mr-xs">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-md">
        {activeTab === "design-system" && (
          <div className="space-y-md">
            <h3 className="text-lg font-semibold text-primary">
              Design System
            </h3>
            <div className="grid grid-cols-2 gap-md text-sm">
              <div>
                <strong>Theme:</strong> {config.theme}
              </div>
              <div>
                <strong>Density:</strong> {config.density}
              </div>
              <div>
                <strong>Motion:</strong> {config.motion}
              </div>
              <div>
                <strong>Glassmorphism:</strong>{" "}
                {config.glassmorphism ? "✅" : "❌"}
              </div>
            </div>
            <div className="mt-md">
              <h4 className="font-medium mb-xs">Quick Actions</h4>
              <div className="flex gap-xs">
                <button
                  onClick={() =>
                    updateConfig({
                      theme: config.theme === "dark" ? "light" : "dark",
                    })
                  }
                  className="px-sm py-xs bg-secondary rounded-lg text-sm hover:bg-surface-hover"
                >
                  Toggle Theme
                </button>
                <button
                  onClick={() =>
                    updateConfig({
                      density:
                        config.density === "compact"
                          ? "comfortable"
                          : "compact",
                    })
                  }
                  className="px-sm py-xs bg-secondary rounded-lg text-sm hover:bg-surface-hover"
                >
                  Toggle Density
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "auth" && <AuthMonitorTab />}

        {activeTab === "performance" && (
          <div className="p-md">
            <PerformanceDashboard />
          </div>
        )}

        {activeTab === "console" && (
          <div className="space-y-md">
            <h3 className="text-lg font-semibold text-primary">
              Console Tools
            </h3>
            <div className="space-y-xs">
              <button
                onClick={() => console.clear()}
                className="w-full px-sm py-xs bg-secondary rounded-lg text-sm hover:bg-surface-hover text-left"
              >
                🧹 Clear Console
              </button>
              <button
                onClick={() => console.log("Current user:", user)}
                className="w-full px-sm py-xs bg-secondary rounded-lg text-sm hover:bg-surface-hover text-left"
              >
                👤 Log Current User
              </button>
              <button
                onClick={() => console.log("Design system config:", config)}
                className="w-full px-sm py-xs bg-secondary rounded-lg text-sm hover:bg-surface-hover text-left"
              >
                🎨 Log Design Config
              </button>
            </div>
          </div>
        )}

        {activeTab === "debug" && (
          <div className="space-y-md">
            <h3 className="text-lg font-semibold text-primary">
              Debug Tools
            </h3>
            <div className="space-y-xs">
              <div className="flex items-center justify-between">
                <span>Contrast Debug Overlay</span>
                <button
                  onClick={() => {
                    const current = localStorage.getItem("debugContrast");
                    localStorage.setItem(
                      "debugContrast",
                      current ? "" : "true"
                    );
                    window.location.reload();
                  }}
                  className="px-sm py-xs bg-secondary rounded-lg text-sm hover:bg-surface-hover"
                >
                  Toggle
                </button>
              </div>
              <button
                onClick={() => {
                  // Force re-render diagnostics
                  window.location.reload();
                }}
                className="w-full px-sm py-xs bg-secondary rounded-lg text-sm hover:bg-surface-hover text-left"
              >
                🔄 Force Reload
              </button>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-md">
            <h3 className="text-lg font-semibold text-primary">
              Dev Settings
            </h3>
            <div className="space-y-xs text-sm">
              <div>
                <strong>User:</strong> {user?.email}
              </div>
              <div>
                <strong>Environment:</strong> {process.env.NODE_ENV}
              </div>
              <div>
                <strong>Hotkey:</strong> Ctrl+Shift+D
              </div>
              <div className="mt-md pt-md border-t border-muted">
                <p className="text-xs text-secondary">
                  This panel is only visible to authorized developers.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        onMouseDown={handleResizeMouseDown}
      >
        {/* Resize handle */}
        <div className="w-full h-full bg-text-secondary opacity-50 hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
};

export default DevPanel;
