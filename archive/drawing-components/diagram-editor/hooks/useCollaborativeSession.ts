/**
 * useCollaborativeSession Hook
 *
 * Manages collaborative editing sessions for diagrams
 * Handles initialization, cleanup, and session state
 */

import { useEffect, useCallback } from "react";
import { useCollaborativeStore } from "../stores/collaborativeStore";
import { useAuth } from "../../../../app/auth-store";

interface UseCollaborativeSessionOptions {
  diagramId: string;
  enabled?: boolean;
}

export const useCollaborativeSession = ({
  diagramId,
  enabled = true,
}: UseCollaborativeSessionOptions) => {
  const { user } = useAuth();
  const { sessionId, isConnected, initializeSession, leaveSession } =
    useCollaborativeStore();

  // Initialize session when component mounts and user is available
  useEffect(() => {
    if (!enabled || !user || !diagramId) return;

    const userName = user.user_metadata?.full_name || user.email || "Anonymous";

    initializeSession(diagramId, user.id, userName);

    // Cleanup on unmount
    return () => {
      leaveSession();
    };
  }, [enabled, user, diagramId, initializeSession, leaveSession]);

  // Handle mouse movement for cursor tracking
  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isConnected) return;

      // Convert screen coordinates to diagram coordinates
      // This would need to be implemented based on the diagram's coordinate system
      const diagramCoords = { x: event.clientX, y: event.clientY };

      useCollaborativeStore
        .getState()
        .updateCursor(diagramCoords.x, diagramCoords.y);
    },
    [isConnected]
  );

  // Handle selection changes
  const handleSelectionChange = useCallback(
    (type: "player" | "route" | "none", id: string | null) => {
      if (!isConnected) return;

      useCollaborativeStore.getState().updateSelection(type, id);
    },
    [isConnected]
  );

  return {
    isConnected,
    sessionId,
    handleMouseMove,
    handleSelectionChange,
  };
};
