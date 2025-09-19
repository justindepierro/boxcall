/**
 * React Hook for Real-Time Collaboration
 * Provides reactive interface to collaboration service
 *
 * Phase 2B Sprint 4: Live Dashboard Sharing
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  collaborationService,
  type CollaborationUser,
  type CollaborationSession,
  type DashboardUpdate,
  type CursorUpdate,
} from "@services/realTimeCollaboration";

export interface UseCollaborationOptions {
  teamId: string;
  dashboardId: string;
  user: CollaborationUser;
  autoConnect?: boolean;
}

export interface CollaborativeCursor {
  userId: string;
  userName: string;
  x: number;
  y: number;
  widgetId?: string;
  widgetX?: number;
  widgetY?: number;
  action: "hover" | "click" | "typing";
  color: string;
}

export interface UpdateSubscription {
  type: string;
  widgetId?: string;
  data?: Record<string, unknown>;
  user?: CollaborationUser;
  timestamp?: number;
  conflictsWith?: Record<string, unknown>;
}

export interface UseCollaborationReturn {
  // Session state
  session: CollaborationSession | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;

  // Participants
  participants: CollaborationUser[];
  currentUser: CollaborationUser | null;

  // Recent updates
  recentUpdates: DashboardUpdate[];
  activeCursors: Map<string, CursorUpdate>;

  // Widget-level collaboration
  cursors: CollaborativeCursor[];
  updateCursor: (cursor: Partial<CollaborativeCursor>) => void;
  broadcastUpdate: (update: UpdateSubscription) => void;
  subscribeToUpdates: (
    callback: (update: UpdateSubscription) => void
  ) => () => void;
  resolveConflict: (
    widgetId: string,
    resolution: "accept" | "reject" | "merge",
    conflictData: Record<string, unknown>
  ) => void;

  // Actions
  startSession: () => Promise<void>;
  endSession: () => void;
  sendDashboardUpdate: (
    update: Omit<DashboardUpdate, "userId" | "timestamp">
  ) => void;
  sendCursorUpdate: (cursor: Omit<CursorUpdate, "userId">) => void;

  // Permissions
  canEdit: boolean;
  canView: boolean;
}

export function useCollaboration(
  options: UseCollaborationOptions
): UseCollaborationReturn {
  const { teamId, dashboardId, user, autoConnect = false } = options;

  // State
  const [session, setSession] = useState<CollaborationSession | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<CollaborationUser[]>([]);
  const [recentUpdates, setRecentUpdates] = useState<DashboardUpdate[]>([]);
  const [activeCursors, setActiveCursors] = useState<Map<string, CursorUpdate>>(
    new Map()
  );
  const [collaborativeCursors, setCollaborativeCursors] = useState<
    CollaborativeCursor[]
  >([]);
  const [updateSubscribers, setUpdateSubscribers] = useState<
    Array<(update: UpdateSubscription) => void>
  >([]);

  // Refs for cleanup
  const cleanupFunctionsRef = useRef<Array<() => void>>([]);

  /**
   * Start collaboration session
   */
  const startSession = useCallback(async () => {
    if (isConnecting || isConnected) return;

    setIsConnecting(true);
    setError(null);

    try {
      const newSession = await collaborationService.startSession(
        teamId,
        dashboardId,
        user
      );
      setSession(newSession);
      setParticipants(newSession.participants);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to start collaboration";
      setError(errorMessage);
      // console.error("Collaboration session error:", err);
    } finally {
      setIsConnecting(false);
    }
  }, [teamId, dashboardId, user, isConnecting, isConnected]);

  /**
   * End collaboration session
   */
  const endSession = useCallback(() => {
    collaborationService.endSession();
    setSession(null);
    setParticipants([]);
    setRecentUpdates([]);
    setActiveCursors(new Map());
    setError(null);
  }, []);

  /**
   * Send dashboard update
   */
  const sendDashboardUpdate = useCallback(
    (update: Omit<DashboardUpdate, "userId" | "timestamp">) => {
      if (!isConnected) {
        // console.warn("Cannot send dashboard update: not connected");
        return;
      }

      collaborationService.sendDashboardUpdate(update);
    },
    [isConnected]
  );

  /**
   * Send cursor update
   */
  const sendCursorUpdate = useCallback(
    (cursor: Omit<CursorUpdate, "userId">) => {
      if (!isConnected) return;

      collaborationService.sendCursorUpdate(cursor);
    },
    [isConnected]
  );

  /**
   * Handle user joined
   */
  const handleUserJoined = useCallback((newUser: CollaborationUser) => {
    setParticipants((prev) => {
      if (prev.find((p) => p.id === newUser.id)) return prev;
      return [...prev, newUser];
    });
  }, []);

  /**
   * Handle user left
   */
  const handleUserLeft = useCallback((userId: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== userId));
    setActiveCursors((prev) => {
      const newCursors = new Map(prev);
      newCursors.delete(userId);
      return newCursors;
    });
  }, []);

  /**
   * Handle dashboard update
   */
  const handleDashboardUpdate = useCallback((update: DashboardUpdate) => {
    setRecentUpdates((prev) => {
      const newUpdates = [update, ...prev].slice(0, 10); // Keep last 10 updates
      return newUpdates;
    });
  }, []);

  /**
   * Handle cursor update
   */
  const handleCursorUpdate = useCallback(
    (cursor: CursorUpdate) => {
      // Don't show our own cursor
      if (cursor.userId === user.id) return;

      setActiveCursors((prev) => {
        const newCursors = new Map(prev);
        newCursors.set(cursor.userId, cursor);
        return newCursors;
      });

      // Remove cursor after inactivity
      setTimeout(() => {
        setActiveCursors((prev) => {
          if (prev.get(cursor.userId) === cursor) {
            const newCursors = new Map(prev);
            newCursors.delete(cursor.userId);
            return newCursors;
          }
          return prev;
        });
      }, 5000); // Remove after 5 seconds of inactivity
    },
    [user.id]
  );

  /**
   * Handle connection status change
   */
  const handleConnectionStatus = useCallback((connected: boolean) => {
    setIsConnected(connected);
    if (!connected) {
      setError("Connection lost. Attempting to reconnect...");
    } else {
      setError(null);
    }
  }, []);

  /**
   * Setup event listeners on mount
   */
  useEffect(() => {
    const cleanupFunctions = [
      collaborationService.onUserJoined(handleUserJoined),
      collaborationService.onUserLeft(handleUserLeft),
      collaborationService.onDashboardUpdate(handleDashboardUpdate),
      collaborationService.onCursorUpdate(handleCursorUpdate),
      collaborationService.onConnectionStatus(handleConnectionStatus),
    ];

    cleanupFunctionsRef.current = cleanupFunctions;

    // Auto-connect if requested
    if (autoConnect) {
      startSession();
    }

    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, [
    autoConnect,
    startSession,
    handleUserJoined,
    handleUserLeft,
    handleDashboardUpdate,
    handleCursorUpdate,
    handleConnectionStatus,
  ]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      endSession();
    };
  }, [endSession]);

  /**
   * Calculate permissions
   */
  const canEdit = session
    ? collaborationService.canEdit(user.id, session)
    : false;
  const canView = session
    ? collaborationService.canView(user.id, session)
    : true;
  const currentUser = collaborationService.getCurrentUser();

  /**
   * Widget-level collaboration methods
   */
  const updateCursor = useCallback(
    (cursor: Partial<CollaborativeCursor>) => {
      setCollaborativeCursors((prev) => {
        const updated = prev.filter((c) => c.userId !== user.id);
        if (cursor.x !== undefined && cursor.y !== undefined) {
          updated.push({
            userId: user.id,
            userName: user.name,
            x: cursor.x,
            y: cursor.y,
            widgetId: cursor.widgetId,
            widgetX: cursor.widgetX,
            widgetY: cursor.widgetY,
            action: cursor.action || "hover",
            color: "#3B82F6", // Default blue color
          });
        }
        return updated;
      });
    },
    [user.id, user.name]
  );

  const broadcastUpdate = useCallback(
    (update: UpdateSubscription) => {
      updateSubscribers.forEach((callback) => {
        try {
          callback(update);
        } catch (_error) {
          // console.error("Error in update subscriber:", error);
        }
      });

      // Also send through collaboration service if it's a dashboard update
      if (
        isConnected &&
        update.widgetId &&
        [
          "widget_move",
          "widget_resize",
          "widget_edit",
          "widget_add",
          "widget_remove",
        ].includes(update.type)
      ) {
        sendDashboardUpdate({
          type: update.type as
            | "widget_move"
            | "widget_resize"
            | "widget_edit"
            | "widget_add"
            | "widget_remove",
          widgetId: update.widgetId,
          data: {
            position: update.data?.position as
              | { x: number; y: number }
              | undefined,
            size: update.data?.size as
              | { width: number; height: number }
              | undefined,
            config: update.data?.config as Record<string, unknown> | undefined,
            newWidget: update.data?.newWidget as
              | { type: string; config: Record<string, unknown> }
              | undefined,
          },
        });
      }
    },
    [updateSubscribers, isConnected, sendDashboardUpdate]
  );

  const subscribeToUpdates = useCallback(
    (callback: (update: UpdateSubscription) => void) => {
      setUpdateSubscribers((prev) => [...prev, callback]);

      return () => {
        setUpdateSubscribers((prev) => prev.filter((sub) => sub !== callback));
      };
    },
    []
  );

  const resolveConflict = useCallback(
    (
      widgetId: string,
      resolution: "accept" | "reject" | "merge",
      conflictData: Record<string, unknown>
    ) => {
      broadcastUpdate({
        type: "conflict_resolution",
        widgetId,
        data: { resolution, conflictData },
        timestamp: Date.now(),
      });
    },
    [broadcastUpdate]
  );

  return {
    // Session state
    session,
    isConnected,
    isConnecting,
    error,

    // Participants
    participants,
    currentUser,

    // Recent activity
    recentUpdates,
    activeCursors,

    // Widget-level collaboration
    cursors: collaborativeCursors,
    updateCursor,
    broadcastUpdate,
    subscribeToUpdates,
    resolveConflict,

    // Actions
    startSession,
    endSession,
    sendDashboardUpdate,
    sendCursorUpdate,

    // Permissions
    canEdit,
    canView,
  };
}

/**
 * Hook for tracking mouse cursor position for collaboration
 */
export function useCollaborativeCursor(
  elementRef: React.RefObject<HTMLElement>,
  collaboration: UseCollaborationReturn,
  widgetId?: string
) {
  const lastPositionRef = useRef<{ x: number; y: number } | null>(null);
  const throttleRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !collaboration.isConnected) return;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100; // Percentage
      const y = ((event.clientY - rect.top) / rect.height) * 100; // Percentage

      // Throttle cursor updates
      if (throttleRef.current) return;

      const position = { x, y };

      // Only send update if position changed significantly
      if (lastPositionRef.current) {
        const deltaX = Math.abs(position.x - lastPositionRef.current.x);
        const deltaY = Math.abs(position.y - lastPositionRef.current.y);
        if (deltaX < 1 && deltaY < 1) return; // Less than 1% change
      }

      lastPositionRef.current = position;

      collaboration.sendCursorUpdate({
        position,
        widget: widgetId,
        action: "hovering",
      });

      throttleRef.current = setTimeout(() => {
        throttleRef.current = null;
      }, 100); // Throttle to 10 updates per second
    };

    const handleMouseLeave = () => {
      // Clear cursor when leaving element
      collaboration.sendCursorUpdate({
        position: { x: -1, y: -1 }, // Off-screen position
        widget: widgetId,
      });
    };

    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseleave", handleMouseLeave);
      if (throttleRef.current) {
        clearTimeout(throttleRef.current);
      }
    };
  }, [elementRef, collaboration, widgetId]);
}

export default useCollaboration;
