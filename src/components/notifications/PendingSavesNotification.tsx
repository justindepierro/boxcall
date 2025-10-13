/**
 * PendingSavesNotification Component
 *
 * Shows a notification when there are pending save operations from the last session.
 * Allows users to manually retry or dismiss pending operations.
 *
 * @version 3.2.0
 * @date October 13, 2025
 */

import React, { useEffect, useState } from "react";
import { useSaveState } from "../../contexts/SaveStateContext";
import { loadOperations } from "../../utils/saveQueueDB";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon/Icon";
import { Typography } from "../design-system/Typography";

export const PendingSavesNotification: React.FC = () => {
  const { hasPendingFromLastSession, clearQueue } = useSaveState();
  const [pendingCount, setPendingCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Load pending operations count
  useEffect(() => {
    if (hasPendingFromLastSession) {
      const loadCount = async () => {
        try {
          const operations = await loadOperations();
          setPendingCount(operations.length);
          setIsVisible(true);
        } catch (error) {
          console.error("Failed to load pending operations:", error);
        }
      };
      loadCount();
    }
  }, [hasPendingFromLastSession]);

  const handleDismiss = async () => {
    setIsVisible(false);
    await clearQueue();
  };

  if (!isVisible || pendingCount === 0) {
    return null;
  }

  return (
    <div
      className="fixed top-20 right-4 z-50 max-w-md 
        bg-warning-50 dark:bg-warning-900/20 
        border border-warning-200 dark:border-warning-800 
        rounded-lg shadow-lg p-4"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <Icon
            name="alert-triangle"
            size="md"
            className="text-warning-600 dark:text-warning-400"
          />
        </div>

        <div className="flex-1 min-w-0">
          <Typography variant="headline-sm" className="text-text-primary mb-1">
            Pending Saves from Last Session
          </Typography>

          <Typography variant="body-sm" color="muted" className="mb-3">
            You have {pendingCount} save{pendingCount > 1 ? "s" : ""} that{" "}
            {pendingCount > 1 ? "were" : "was"} interrupted. These operations
            could not be completed automatically.
          </Typography>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleDismiss}>
              Dismiss
            </Button>

            <Typography variant="body-xs" color="muted">
              Note: Automatic retry is not available for operations from
              previous sessions
            </Typography>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 hover:bg-warning-100 dark:hover:bg-warning-900/40 
            rounded transition-colors"
          aria-label="Dismiss notification"
        >
          <Icon
            name="close"
            size="sm"
            className="text-text-secondary hover:text-text-primary"
          />
        </button>
      </div>
    </div>
  );
};
