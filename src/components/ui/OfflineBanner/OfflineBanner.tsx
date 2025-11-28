/**
 * Offline Banner Component
 *
 * Displays a prominent banner when the app is offline
 * with automatic reconnection status
 */

import React from "react";
import { useOnlineStatus } from "../../../hooks/useOnlineStatus";
import { Icon } from "../Icon";
import { Typography } from "../../design-system/Typography";

export const OfflineBanner: React.FC = () => {
  const { isOnline, isTransitioning } = useOnlineStatus();

  // Don't render anything if online
  if (isOnline && !isTransitioning) {
    return null;
  }

  return (
    <div
      className={`
        fixed top-16 left-0 right-0 z-[70]
        ${
          isTransitioning
            ? "bg-status-success text-white"
            : "bg-status-warning text-primary"
        }
        px-4 py-3
        shadow-elevation-md
        animate-in slide-in-from-top duration-300
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
        <Icon
          name={isTransitioning ? "wifi" : "wifi-off"}
          size="md"
          className={isTransitioning ? "animate-pulse" : ""}
        />
        <Typography variant="body-md" className="font-medium">
          {isTransitioning
            ? "Back online! Syncing changes..."
            : "You're offline. Changes will sync when reconnected."}
        </Typography>
      </div>
    </div>
  );
};

export default OfflineBanner;
