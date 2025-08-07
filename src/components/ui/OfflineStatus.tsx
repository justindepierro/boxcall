/**
 * Offline status and sync indicator components
 * Part of Phase 3B: Offline Architecture
 */
import React from "react";
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Clock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Typography } from "../design-system/Typography";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";
import { useSyncStatus } from "../../hooks/useOfflineData";
import { useDataFreshness } from "../../hooks/useOfflineData";

// Network status indicator
export const NetworkStatusIndicator: React.FC<{
  showLabel?: boolean;
  compact?: boolean;
  className?: string;
}> = ({ showLabel = false, compact = false, className = "" }) => {
  const { isOnline, isSlowConnection, effectiveType } = useNetworkStatus();

  if (compact) {
    return (
      <div className={`flex items-center space-x-1 ${className}`}>
        {isOnline ? (
          <Wifi
            className={`h-4 w-4 ${isSlowConnection ? "text-yellow-500" : "text-green-500"}`}
          />
        ) : (
          <WifiOff className="h-4 w-4 text-red-500" />
        )}
        {showLabel && (
          <Typography variant="caption" className="text-gray-600">
            {isOnline ? (isSlowConnection ? "Slow" : "Online") : "Offline"}
          </Typography>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center space-x-2 p-2 rounded-lg ${
        isOnline
          ? isSlowConnection
            ? "bg-yellow-50 border-yellow-200"
            : "bg-green-50 border-green-200"
          : "bg-red-50 border-red-200"
      } border ${className}`}
    >
      {isOnline ? (
        <Wifi
          className={`h-4 w-4 ${isSlowConnection ? "text-yellow-600" : "text-green-600"}`}
        />
      ) : (
        <WifiOff className="h-4 w-4 text-red-600" />
      )}
      <div className="flex flex-col">
        <Typography
          variant="body-sm"
          className={
            isOnline
              ? isSlowConnection
                ? "text-yellow-800"
                : "text-green-800"
              : "text-red-800"
          }
        >
          {isOnline ? "Connected" : "Offline"}
        </Typography>
        {isOnline && effectiveType && (
          <Typography variant="caption" className="text-gray-500">
            {effectiveType.toUpperCase()} •{" "}
            {isSlowConnection ? "Slow connection" : "Fast connection"}
          </Typography>
        )}
        {!isOnline && (
          <Typography variant="caption" className="text-red-600">
            Data will sync when connected
          </Typography>
        )}
      </div>
    </div>
  );
};

// Sync status indicator
export const SyncStatusIndicator: React.FC<{
  showDetails?: boolean;
  className?: string;
}> = ({ showDetails = false, className = "" }) => {
  const {
    pending,
    failed,
    isRefreshing,
    refresh,
    isOnline,
    hasPendingChanges,
  } = useSyncStatus();

  if (!hasPendingChanges && !failed) {
    return showDetails ? (
      <div
        className={`flex items-center space-x-2 p-2 bg-green-50 border border-green-200 rounded-lg ${className}`}
      >
        <CheckCircle className="h-4 w-4 text-green-600" />
        <Typography variant="body-sm" className="text-green-800">
          All changes synced
        </Typography>
      </div>
    ) : null;
  }

  return (
    <div
      className={`flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded-lg ${className}`}
    >
      <div className="flex items-center space-x-2">
        {isRefreshing ? (
          <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
        ) : (
          <AlertCircle className="h-4 w-4 text-blue-600" />
        )}
        <div>
          <Typography variant="body-sm" className="text-blue-800">
            {isRefreshing ? "Syncing..." : "Changes pending"}
          </Typography>
          {showDetails && (pending > 0 || failed > 0) && (
            <Typography variant="caption" className="text-blue-600">
              {pending > 0 && `${pending} pending`}
              {pending > 0 && failed > 0 && " • "}
              {failed > 0 && `${failed} failed`}
            </Typography>
          )}
        </div>
      </div>

      {isOnline && !isRefreshing && (
        <button
          onClick={refresh}
          className="text-blue-600 hover:text-blue-800 p-1"
          title="Retry sync"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

// Data freshness indicator
export const DataFreshnessIndicator: React.FC<{
  type: "play" | "team" | "player" | "schedule";
  id: string;
  showAge?: boolean;
  className?: string;
}> = ({ type, id, showAge = true, className = "" }) => {
  const { isFresh, isStale, isVeryStale, lastSync } = useDataFreshness(
    type,
    id
  );

  if (isFresh) return null; // Don't show indicator for fresh data

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <Clock
        className={`h-3 w-3 ${
          isVeryStale
            ? "text-red-500"
            : isStale
              ? "text-yellow-500"
              : "text-gray-500"
        }`}
      />
      {showAge && lastSync && (
        <Typography
          variant="caption"
          className={
            isVeryStale
              ? "text-red-600"
              : isStale
                ? "text-yellow-600"
                : "text-gray-500"
          }
        >
          {lastSync}
        </Typography>
      )}
    </div>
  );
};

// Offline banner for when app is offline
export const OfflineBanner: React.FC<{
  className?: string;
}> = ({ className = "" }) => {
  const { isOnline } = useNetworkStatus();
  const { pending } = useSyncStatus();

  if (isOnline) return null;

  return (
    <div
      className={`bg-yellow-50 border-l-4 border-yellow-400 p-4 ${className}`}
    >
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <WifiOff className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3">
          <Typography variant="body-sm" className="text-yellow-800">
            You're offline. You can still view your saved plays and data.
          </Typography>
          {pending > 0 && (
            <Typography variant="caption" className="text-yellow-700">
              {pending} change{pending > 1 ? "s" : ""} will sync when you're
              back online.
            </Typography>
          )}
        </div>
      </div>
    </div>
  );
};

// Combined status bar for comprehensive offline/sync information
export const OfflineStatusBar: React.FC<{
  showNetworkStatus?: boolean;
  showSyncStatus?: boolean;
  showInHeader?: boolean;
  className?: string;
}> = ({
  showNetworkStatus = true,
  showSyncStatus = true,
  showInHeader = false,
  className = "",
}) => {
  const { isOnline } = useNetworkStatus();
  const { hasPendingChanges } = useSyncStatus();

  // Don't show in header if everything is normal
  if (showInHeader && isOnline && !hasPendingChanges) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {showNetworkStatus && <NetworkStatusIndicator compact showLabel />}
      {showSyncStatus && <SyncStatusIndicator />}
    </div>
  );
};

// Wrapper component for offline-aware content
export const OfflineAwareContainer: React.FC<{
  children: React.ReactNode;
  showBanner?: boolean;
  showStatusBar?: boolean;
  className?: string;
}> = ({
  children,
  showBanner = true,
  showStatusBar = false,
  className = "",
}) => {
  return (
    <div className={className}>
      {showBanner && <OfflineBanner />}
      {showStatusBar && (
        <div className="p-4 border-b border-gray-200">
          <OfflineStatusBar />
        </div>
      )}
      {children}
    </div>
  );
};

export default OfflineStatusBar;
