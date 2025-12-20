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
import { colorTokens } from "../design-system/tokens";
import { logError, warn } from "../utils/logger";

// Widget update types that should be sent through collaboration service
const WIDGET_UPDATE_TYPES = [
  "widget_move",
  "widget_resize",
  "widget_edit",
  "widget_add",
  "widget_remove",
] as const;

type WidgetUpdateType = (typeof WIDGET_UPDATE_TYPES)[number];

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

function useCollaborationSessionState({
  teamId,
  dashboardId,
  user,
  autoConnect,
}: {
  teamId: string;
  dashboardId: string;
  user: CollaborationUser;
  autoConnect: boolean;
}) {
  const [session, setSession] = useState<CollaborationSession | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<CollaborationUser[]>([]);
  const [recentUpdates, setRecentUpdates] = useState<DashboardUpdate[]>([]);
  const [activeCursors, setActiveCursors] = useState<Map<string, CursorUpdate>>(
    new Map()
  );
  const cleanupFunctionsRef = useRef<Array<() => void>>([]);

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
      logError("Collaboration session error:", err);
    } finally {
      setIsConnecting(false);
    }
  }, [teamId, dashboardId, user, isConnecting, isConnected]);

  const endSession = useCallback(() => {
    collaborationService.endSession();
    setSession(null);
    setParticipants([]);
    setRecentUpdates([]);
    setActiveCursors(new Map());
    setError(null);
  }, []);

  const sendDashboardUpdate = useCallback(
    (update: Omit<DashboardUpdate, "userId" | "timestamp">) => {
      if (!isConnected) {
        warn("Cannot send dashboard update: not connected");
        return;
      }
      collaborationService.sendDashboardUpdate(update);
    },
    [isConnected]
  );

  const sendCursorUpdate = useCallback(
    (cursor: Omit<CursorUpdate, "userId">) => {
      if (!isConnected) return;
      collaborationService.sendCursorUpdate(cursor);
    },
    [isConnected]
  );

  const handleUserJoined = useCallback((newUser: CollaborationUser) => {
    setParticipants((prev) =>
      prev.find((p) => p.id === newUser.id) ? prev : [...prev, newUser]
    );
  }, []);

  const handleUserLeft = useCallback((userId: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== userId));
    setActiveCursors((prev) => {
      const c = new Map(prev);
      c.delete(userId);
      return c;
    });
  }, []);

  const handleDashboardUpdate = useCallback((update: DashboardUpdate) => {
    setRecentUpdates((prev) => [update, ...prev].slice(0, 10));
  }, []);

  const handleCursorUpdate = useCallback(
    (cursor: CursorUpdate) => {
      if (cursor.userId === user.id) return;
      setActiveCursors((prev) => {
        const newCursors = new Map(prev);
        newCursors.set(cursor.userId, cursor);
        return newCursors;
      });
      setTimeout(() => {
        setActiveCursors((prev) => {
          if (prev.get(cursor.userId) === cursor) {
            const newCursors = new Map(prev);
            newCursors.delete(cursor.userId);
            return newCursors;
          }
          return prev;
        });
      }, 5000);
    },
    [user.id]
  );

  const handleConnectionStatus = useCallback((connected: boolean) => {
    setIsConnected(connected);
    setError(connected ? null : "Connection lost. Attempting to reconnect...");
  }, []);

  useEffect(() => {
    const cleanupFunctions = [
      collaborationService.onUserJoined(handleUserJoined),
      collaborationService.onUserLeft(handleUserLeft),
      collaborationService.onDashboardUpdate(handleDashboardUpdate),
      collaborationService.onCursorUpdate(handleCursorUpdate),
      collaborationService.onConnectionStatus(handleConnectionStatus),
    ];
    cleanupFunctionsRef.current = cleanupFunctions;
    if (autoConnect) startSession();
    return () => cleanupFunctions.forEach((cleanup) => cleanup());
  }, [
    autoConnect,
    startSession,
    handleUserJoined,
    handleUserLeft,
    handleDashboardUpdate,
    handleCursorUpdate,
    handleConnectionStatus,
  ]);

  useEffect(() => () => endSession(), [endSession]);

  return {
    session,
    isConnected,
    isConnecting,
    error,
    participants,
    recentUpdates,
    activeCursors,
    startSession,
    endSession,
    sendDashboardUpdate,
    sendCursorUpdate,
    currentUser: collaborationService.getCurrentUser(),
  };
}

function useCollaborationWidgetLevel({
  user,
  isConnected,
  sendDashboardUpdate,
}: {
  user: CollaborationUser;
  isConnected: boolean;
  sendDashboardUpdate: (
    update: Omit<DashboardUpdate, "userId" | "timestamp">
  ) => void;
}) {
  const [collaborativeCursors, setCollaborativeCursors] = useState<
    CollaborativeCursor[]
  >([]);
  const [updateSubscribers, setUpdateSubscribers] = useState<
    Array<(update: UpdateSubscription) => void>
  >([]);

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
            color: colorTokens.blue[500],
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
        } catch (error) {
          logError("Error in update subscriber:", error);
        }
      });

      if (
        isConnected &&
        update.widgetId &&
        WIDGET_UPDATE_TYPES.includes(update.type as WidgetUpdateType)
      ) {
        sendDashboardUpdate({
          type: update.type as WidgetUpdateType,
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
      return () =>
        setUpdateSubscribers((prev) => prev.filter((sub) => sub !== callback));
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
    cursors: collaborativeCursors,
    updateCursor,
    broadcastUpdate,
    subscribeToUpdates,
    resolveConflict,
  };
}

export function useCollaboration(
  options: UseCollaborationOptions
): UseCollaborationReturn {
  const { teamId, dashboardId, user, autoConnect = false } = options;

  const {
    session,
    isConnected,
    isConnecting,
    error,
    participants,
    recentUpdates,
    activeCursors,
    startSession,
    endSession,
    sendDashboardUpdate,
    sendCursorUpdate,
    currentUser,
  } = useCollaborationSessionState({
    teamId,
    dashboardId,
    user,
    autoConnect,
  });

  // Calculate permissions
  const canEdit = session
    ? collaborationService.canEdit(user.id, session)
    : false;
  const canView = session
    ? collaborationService.canView(user.id, session)
    : true;
  const {
    cursors,
    updateCursor,
    broadcastUpdate,
    subscribeToUpdates,
    resolveConflict,
  } = useCollaborationWidgetLevel({ user, isConnected, sendDashboardUpdate });

  return {
    session,
    isConnected,
    isConnecting,
    error,
    participants,
    currentUser,
    recentUpdates,
    activeCursors,
    cursors,
    updateCursor,
    broadcastUpdate,
    subscribeToUpdates,
    resolveConflict,
    startSession,
    endSession,
    sendDashboardUpdate,
    sendCursorUpdate,
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
