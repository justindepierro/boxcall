import React, { useEffect, useState } from "react";
import { useAuth } from "../../../../app/auth-store";
import { supabase } from "../../../../lib/supabase";
import { AuthMonitoring } from "../../../../utils/authMonitoring";

const HealthStatusSection: React.FC<{
  health: any;
}> = ({ health }) => {
  return (
    <div className="space-y-xs">
      <h4 className="font-medium text-secondary">System Health</h4>
      <div className="grid grid-cols-2 gap-xs text-sm">
        <div>
          <strong>Status:</strong>
          <span
            className={(() => {
              const base = "ml-xs px-xs py-xs rounded-lg text-xs ";
              if (health.overall === "healthy") {
                return `${base}bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300`;
              }
              if (health.overall === "warning") {
                return `${base}bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300`;
              }
              return `${base}bg-error-bg text-error-800 dark:bg-error-900/20 dark:text-error-400`;
            })()}
          >
            {health.overall}
          </span>
        </div>
        <div>
          <strong>Sign-in Success:</strong>{" "}
          {health.signInSuccessRate.toFixed(1)}%
        </div>
        <div>
          <strong>Sign-up Success:</strong>{" "}
          {health.signUpSuccessRate.toFixed(1)}%
        </div>
        <div>
          <strong>Network Errors:</strong> {health.networkErrors}
        </div>
        <div>
          <strong>Security Violations:</strong> {health.securityViolations}
        </div>
        <div>
          <strong>Rate Limit Hits:</strong> {health.rateLimitHits}
        </div>
      </div>
    </div>
  );
};

const CurrentStateSection: React.FC<{
  user: unknown;
  loading: boolean;
  isValidSession: boolean | null;
  profile: unknown;
  error: string | null;
}> = ({ user, loading, isValidSession, profile, error }) => {
  return (
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
          {(() => {
            if (isValidSession === null) return "❓ Unknown";
            if (isValidSession) return "✅ Yes";
            return "❌ No";
          })()}
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
  );
};

const UserInfoSection: React.FC<{
  user: any;
  profile: any;
  formatTime: (timestamp: string | number | undefined) => string;
}> = ({ user, profile, formatTime }) => {
  if (!user) return null;

  return (
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
  );
};

const SessionInfoSection: React.FC<{
  sessionInfo: any;
  session: any;
  formatTime: (timestamp: string | number | undefined) => string;
  getTimeUntilExpiry: () => string;
}> = ({ sessionInfo, session, formatTime, getTimeUntilExpiry }) => {
  if (!sessionInfo) return null;

  return (
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
  );
};

const ActionsSection: React.FC<{
  loading: boolean;
  onRefreshSession: () => void;
  onClearEvents: () => void;
}> = ({ loading, onRefreshSession, onClearEvents }) => {
  return (
    <div className="space-y-xs">
      <h4 className="font-medium text-secondary">Actions</h4>
      <div className="flex gap-xs">
        <button
          onClick={onRefreshSession}
          disabled={loading}
          className="px-sm py-xs bg-status-info-bg0 text-white rounded-lg text-sm hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh Session"}
        </button>
        <button
          onClick={onClearEvents}
          className="px-sm py-xs bg-secondary rounded-lg text-sm hover:bg-surface-hover"
        >
          Clear Events
        </button>
      </div>
    </div>
  );
};

const AuthEventsLog: React.FC<{ events: string[] }> = ({ events }) => {
  return (
    <div className="space-y-xs">
      <h4 className="font-medium text-secondary">Recent Events</h4>
      <div className="max-h-32 overflow-y-auto bg-secondary rounded-lg p-xs text-xs font-mono">
        {events.length === 0 ? (
          <div className="text-muted">No events yet</div>
        ) : (
          events.map((event, index) => (
            <div key={index} className="mb-xs text-secondary">
              {event}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const MetricsSection: React.FC<{
  metrics: any;
}> = ({ metrics }) => {
  return (
    <div className="space-y-xs">
      <h4 className="font-medium text-secondary">Metrics</h4>
      <div className="grid grid-cols-2 gap-xs text-sm">
        <div>
          <strong>Sign-in Attempts:</strong> {metrics.signInAttempts}
        </div>
        <div>
          <strong>Sign-in Successes:</strong> {metrics.signInSuccesses}
        </div>
        <div>
          <strong>Sign-up Attempts:</strong> {metrics.signUpAttempts}
        </div>
        <div>
          <strong>Sign-up Successes:</strong> {metrics.signUpSuccesses}
        </div>
        <div>
          <strong>Sign-outs:</strong> {metrics.signOutEvents}
        </div>
        <div>
          <strong>Session Refreshes:</strong> {metrics.sessionRefreshes}
        </div>
        <div>
          <strong>Retry Attempts:</strong> {metrics.retryAttempts}
        </div>
        <div>
          <strong>Offline Queued:</strong> {metrics.offlineQueuedOperations}
        </div>
      </div>
    </div>
  );
};

const AuthTimingsSection: React.FC<{
  phaseLabels: Record<string, string>;
  phaseOrder: readonly string[];
  phaseTimings: any;
}> = ({ phaseLabels, phaseOrder, phaseTimings }) => {
  return (
    <div className="space-y-xs">
      <h4 className="font-medium text-secondary">Auth Timings</h4>
      <div className="grid grid-cols-2 gap-xs">
        {phaseOrder.map((phase) => {
          const timing = phaseTimings[phase];
          const lastDuration = timing?.lastDurationMs;
          const avgDuration = timing?.averageDurationMs;
          const statusLabel = timing?.status ?? "idle";
          return (
            <div key={phase} className="rounded-lg bg-secondary px-sm py-xs">
              <div className="text-xs uppercase tracking-wide text-muted">
                {phaseLabels[phase]}
              </div>
              <div className="text-lg font-semibold text-primary">
                {lastDuration != null ? `${Math.round(lastDuration)}ms` : "—"}
              </div>
              <div className="text-xs text-secondary">
                {statusLabel === "idle" ? "waiting" : statusLabel}
                {avgDuration != null && (
                  <span className="ml-1 text-muted">
                    · avg {Math.round(avgDuration)}ms
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const RecentErrorsSection: React.FC<{
  errors: any[];
}> = ({ errors }) => {
  if (errors.length === 0) return null;

  return (
    <div className="space-y-xs">
      <h4 className="font-medium text-secondary">Recent Errors</h4>
      <div className="max-h-32 overflow-y-auto bg-error-bg dark:bg-error-900/10 border border-error-200 dark:border-error-800 rounded-lg p-xs text-xs">
        {errors.map((err, index) => (
          <div key={index} className="mb-xs text-error-600 dark:text-error-400">
            <div className="font-medium">{err.operation}</div>
            <div className="text-error-600 dark:text-error-500">
              {err.error}
            </div>
            <div className="text-xs text-error-500 dark:text-error-500">
              {err.timestamp.toLocaleTimeString()}
              {err.userId && ` • User: ${err.userId.slice(0, 8)}...`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MonitoringEventsSection: React.FC<{
  events: any[];
}> = ({ events }) => {
  if (events.length === 0) return null;

  return (
    <div className="space-y-xs">
      <h4 className="font-medium text-secondary">Monitoring Events</h4>
      <div className="max-h-32 overflow-y-auto bg-status-info-bg dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-xs text-xs">
        {events.map((event, index) => (
          <div key={index} className="mb-xs text-blue-700 dark:text-blue-300">
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
  );
};

export const AuthMonitorTab: React.FC = () => {
  const { user, session, profile, loading, error } = useAuth();
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const [authEvents, setAuthEvents] = useState<string[]>([]);
  const [monitoringData, setMonitoringData] = useState({
    metrics: AuthMonitoring.getMetrics(),
    health: AuthMonitoring.getHealthStatus(),
    recentErrors: AuthMonitoring.getRecentErrors(5),
    recentEvents: AuthMonitoring.getRecentEvents(10),
    phaseTimings: AuthMonitoring.getPhaseTimings(),
  });
  const phaseLabels: Record<string, string> = {
    bootstrap: "Bootstrap",
    sessionFetch: "Session Fetch",
    profileFetch: "Profile Fetch",
    dbHandshake: "DB Handshake",
  };
  const phaseOrder = [
    "bootstrap",
    "sessionFetch",
    "profileFetch",
    "dbHandshake",
  ] as const;

  // Update monitoring data periodically
  useEffect(() => {
    const updateMonitoring = () => {
      setMonitoringData({
        metrics: AuthMonitoring.getMetrics(),
        health: AuthMonitoring.getHealthStatus(),
        recentErrors: AuthMonitoring.getRecentErrors(5),
        recentEvents: AuthMonitoring.getRecentEvents(10),
        phaseTimings: AuthMonitoring.getPhaseTimings(),
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
        `${new Date().toLocaleTimeString()}: ${event}`,
        ...prev.slice(0, 9),
      ]);
    };

    if (user) addEvent(`User authenticated: ${user.email}`);
    if (session) addEvent("Session updated");
    if (profile) addEvent(`Profile loaded: ${profile.role}`);
    if (error) addEvent(`Error: ${error}`);
    if (loading) addEvent("Loading state changed");
  }, [user, session, profile, error, loading]);

  // Get session info on mount and when session changes
  useEffect(() => {
    const updateSessionInfo = () => {
      setSessionInfo(session);
      if (session) {
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
    const { data, error: refreshError } = await supabase.auth.refreshSession();
    if (!refreshError) {
      setAuthEvents((prev) => [
        `${new Date().toLocaleTimeString()}: Session refreshed successfully`,
        ...prev.slice(0, 9),
      ]);
      setSessionInfo(data.session ?? null);
    } else {
      setAuthEvents((prev) => [
        `${new Date().toLocaleTimeString()}: Session refresh failed: ${refreshError.message}`,
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
      <h3 className="text-lg font-semibold text-primary">🔐 Auth Monitor</h3>

      {/* Health Status */}
      <HealthStatusSection health={monitoringData.health} />

      {/* Current Auth State */}
      <CurrentStateSection
        user={user}
        loading={loading}
        isValidSession={isValidSession}
        profile={profile}
        error={error}
      />

      {/* User Info */}
      <UserInfoSection user={user} profile={profile} formatTime={formatTime} />

      {/* Session Info */}
      <SessionInfoSection
        sessionInfo={sessionInfo}
        session={session}
        formatTime={formatTime}
        getTimeUntilExpiry={getTimeUntilExpiry}
      />

      {/* Actions */}
      <ActionsSection
        loading={loading}
        onRefreshSession={() => {
          void handleRefreshSession();
        }}
        onClearEvents={() => setAuthEvents([])}
      />

      {/* Auth Events Log */}
      <AuthEventsLog events={authEvents} />

      {/* Monitoring Metrics */}
      <MetricsSection metrics={monitoringData.metrics} />

      {/* Auth Timings */}
      <AuthTimingsSection
        phaseLabels={phaseLabels}
        phaseOrder={phaseOrder}
        phaseTimings={monitoringData.phaseTimings}
      />

      {/* Recent Errors */}
      <RecentErrorsSection errors={monitoringData.recentErrors} />

      {/* Monitoring Events */}
      <MonitoringEventsSection events={monitoringData.recentEvents} />
    </div>
  );
};
