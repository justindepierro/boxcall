/**
 * Collaboration Provider
 * Higher-order component that provides collaboration context to dashboard widgets
 *
 * Phase 2B Sprint 4: Live Dashboard Sharing
 */

import React, { useEffect, useState, type ReactNode } from "react";
import {
  useCollaboration,
  type UseCollaborationOptions,
} from "../../hooks/useCollaboration";
import {
  conflictResolutionService,
  type ConflictResolution,
} from "@services/conflictResolution";
import { logError } from "../../utils/logger";
import {
  CollaborationContext,
  type CollaborationContextValue,
} from "./CollaborationContext";

interface CollaborationProviderProps {
  children: ReactNode;
  teamId: string;
  dashboardId: string;
  user: {
    id: string;
    name: string;
    role: "coach" | "player" | "parent" | "admin";
    avatar?: string;
  };
  autoConnect?: boolean;
}

export const CollaborationProvider: React.FC<CollaborationProviderProps> = ({
  children,
  teamId,
  dashboardId,
  user,
  autoConnect = false,
}) => {
  const [activeConflicts, setActiveConflicts] = useState<ConflictResolution[]>(
    []
  );

  // Initialize collaboration hook
  const collaborationOptions: UseCollaborationOptions = {
    teamId,
    dashboardId,
    user: { ...user, isOnline: true },
    autoConnect,
  };

  const collaboration = useCollaboration(collaborationOptions);

  // Set up conflict resolution listeners
  useEffect(() => {
    const unsubscribe = conflictResolutionService.onConflict((conflict) => {
      setActiveConflicts((prev) => [...prev, conflict]);
    });

    return unsubscribe;
  }, []);

  /**
   * Resolve conflict using specified strategy
   */
  const resolveConflictWithStrategy = (
    conflictId: string,
    strategy: string
  ) => {
    const conflict = activeConflicts.find((c) => c.conflictId === conflictId);
    if (!conflict) {
      console.warn("Conflict not found:", conflictId);
      return;
    }

    const resolution = conflictResolutionService.autoResolve(
      conflict,
      strategy
    );
    if (resolution !== null) {
      // Broadcast the resolution
      collaboration.broadcastUpdate({
        type: "conflict_resolved",
        widgetId: conflict.widgetId,
        data: { conflictId, resolution, strategy },
        timestamp: Date.now(),
      });

      // Remove from active conflicts
      setActiveConflicts((prev) =>
        prev.filter((c) => c.conflictId !== conflictId)
      );
    } else {
      logError("Failed to resolve conflict with strategy:", strategy);
    }
  };

  /**
   * Get widget-specific permissions
   */
  const getWidgetPermissions = (_widgetId: string) => {
    // Basic permission logic - can be enhanced with real ACL
    const isOwner = user.role === "coach" || user.role === "admin";
    const canEdit = collaboration.canEdit && isOwner;

    return {
      canEdit,
      canMove: canEdit,
      canDelete: canEdit && user.role === "admin",
      isLocked: false, // TODO: Implement widget locking
      lockedBy: undefined,
    };
  };

  /**
   * Batch multiple widget updates
   */
  const batchUpdates = (
    updates: Array<{ widgetId: string; data: Record<string, unknown> }>
  ) => {
    // Send updates as a batch to reduce network overhead
    collaboration.broadcastUpdate({
      type: "batch_update",
      data: { updates },
      timestamp: Date.now(),
    });
  };

  const contextValue: CollaborationContextValue = {
    ...collaboration,
    activeConflicts,
    resolveConflictWithStrategy,
    getWidgetPermissions,
    batchUpdates,
  };

  return (
    <CollaborationContext.Provider value={contextValue}>
      {children}
    </CollaborationContext.Provider>
  );
};

export default CollaborationProvider;
