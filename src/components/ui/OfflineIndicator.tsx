import { useOffline } from "../../hooks/useOffline";
import { Wifi, WifiOff, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "./Button";

export function OfflineIndicator() {
  const { isOnline, syncQueueStatus, isUpdateAvailable, skipWaiting } =
    useOffline();

  if (
    isOnline &&
    syncQueueStatus.pending === 0 &&
    syncQueueStatus.failed === 0 &&
    !isUpdateAvailable
  ) {
    return null; // Don't show anything when everything is normal
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {/* Offline Status */}
      {!isOnline && (
        <div className="bg-error-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <WifiOff className="w-4 h-4" />
          <span className="text-sm font-medium">Offline</span>
        </div>
      )}

      {/* Sync Status */}
      {(syncQueueStatus.pending > 0 || syncQueueStatus.failed > 0) && (
        <div
          className={`px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 ${
            syncQueueStatus.failed > 0
              ? "bg-warning-500 text-white"
              : "bg-info-500 text-white"
          }`}
        >
          <RefreshCw
            className={`w-4 h-4 ${syncQueueStatus.pending > 0 ? "animate-spin" : ""}`}
          />
          <span className="text-sm font-medium">
            {syncQueueStatus.pending > 0 &&
              `${syncQueueStatus.pending} pending`}
            {syncQueueStatus.pending > 0 && syncQueueStatus.failed > 0 && ", "}
            {syncQueueStatus.failed > 0 && `${syncQueueStatus.failed} failed`}
          </span>
        </div>
      )}

      {/* Update Available */}
      {isUpdateAvailable && (
        <div className="bg-success-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">Update Available</span>
          </div>
          <Button
            onClick={skipWaiting}
            size="sm"
            className="bg-white text-success-600 hover:bg-surface-muted"
          >
            Update Now
          </Button>
        </div>
      )}

      {/* Online Status (when there are other indicators) */}
      {isOnline &&
        (syncQueueStatus.pending > 0 ||
          syncQueueStatus.failed > 0 ||
          isUpdateAvailable) && (
          <div className="bg-success-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <Wifi className="w-4 h-4" />
            <span className="text-sm font-medium">Online</span>
          </div>
        )}
    </div>
  );
}
