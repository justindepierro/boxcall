import React, { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "../ui/Button/Button";
import { Typography } from "../design-system/Typography";
import type { CollaborativeCursor } from "../../hooks/useCollaboration";
import { debug } from "../../utils/logger";

interface CollaborativeWidgetProps {
  widgetId: string;
  children: ReactNode;
  onDataChange?: (data: Record<string, unknown>) => void;
  className?: string;
  // Temporary mock data until full integration
  mockCollaboration?: {
    participants: Array<{ id: string; name: string; avatar?: string }>;
    cursors: CollaborativeCursor[];
    isConnected: boolean;
  };
}

interface ConflictData {
  incoming: Record<string, unknown>;
  current: Record<string, unknown>;
  user: { name: string };
  timestamp: number;
}

export const CollaborativeWidget: React.FC<CollaborativeWidgetProps> = ({
  widgetId,
  children,
  onDataChange: _onDataChange,
  className = "",
  mockCollaboration,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [conflictData, setConflictData] = useState<ConflictData | null>(null);

  // Use mock data for now - will be replaced with real collaboration hook
  const participants = mockCollaboration?.participants || [];
  const cursors = mockCollaboration?.cursors || [];
  const isConnected = mockCollaboration?.isConnected ?? true;

  // Track widget activation for collaboration context
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleFocus = () => {
      setIsActive(true);
      // TODO: broadcastUpdate when real collaboration is integrated
    };

    const handleBlur = () => {
      setIsActive(false);
      // TODO: broadcastUpdate when real collaboration is integrated
    };

    container.addEventListener("focusin", handleFocus);
    container.addEventListener("focusout", handleBlur);

    return () => {
      container.removeEventListener("focusin", handleFocus);
      container.removeEventListener("focusout", handleBlur);
    };
  }, [widgetId]);

  // Handle cursor tracking within widget
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isActive) return;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // TODO: updateCursor when real collaboration is integrated
      debug("[CollaborativeWidget] Cursor move", { widgetId, x, y });
    };

    const handleClick = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // TODO: broadcastUpdate when real collaboration is integrated
      debug("[CollaborativeWidget] Widget interaction", { widgetId, x, y });
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("click", handleClick);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("click", handleClick);
    };
  }, [widgetId, isActive]);

  // Get cursors for this widget
  const widgetCursors = cursors.filter(
    (cursor) => cursor.widgetId === widgetId
  );

  // Get active participants for this widget (mock)
  const activeParticipants = participants.slice(0, 2); // Mock: first 2 participants

  const handleConflictResolve = (resolution: "accept" | "reject" | "merge") => {
    if (!conflictData) return;

    // TODO: resolveConflict when real collaboration is integrated
    debug("[CollaborativeWidget] Conflict resolution", {
      widgetId,
      resolution,
      conflictData,
    });
    setConflictData(null);
  };

  return (
    <div
      ref={containerRef}
      className={`
        relative
        ${className}
        ${isActive ? "ring-2 ring-text-info/50" : ""}
        ${!isConnected ? "opacity-75" : ""}
      `}
      data-widget-id={widgetId}
      data-collaboration-active={isActive}
    >
      {/* Collaboration status indicator */}
      {activeParticipants.length > 0 && (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
          <div className="flex -space-x-1">
            {activeParticipants.slice(0, 3).map((participant) => (
              <div
                key={participant.id}
                className="w-6 h-6 rounded-full border-2 border-bg-primary bg-text-info flex items-center justify-center text-xs font-medium text-on-primary"
                title={participant.name}
              >
                {participant.name.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
          {activeParticipants.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-secondary border-2 border-bg-primary flex items-center justify-center text-xs font-medium text-secondary">
              +{activeParticipants.length - 3}
            </div>
          )}
        </div>
      )}

      {/* Main widget content */}
      {children}

      {/* Collaborative cursors - simplified for now */}
      {widgetCursors.map((cursor) => (
        <div
          key={cursor.userId}
          className="absolute pointer-events-none w-3 h-3 bg-text-info rounded-full"
          style={{
            left: cursor.widgetX || 0,
            top: cursor.widgetY || 0,
          }}
          title={`${cursor.userName} - ${cursor.action}`}
        />
      ))}

      {/* Conflict resolution modal */}
      {conflictData && (
        <div className="absolute inset-0 bg-text-primary/50 flex items-center justify-center z-50">
          <div className="bg-primary rounded-lg p-6 max-w-md w-full mx-4">
            <Typography variant="headline-sm" as="h3" className="mb-4">
              Collaboration Conflict
            </Typography>
            <p className="text-secondary mb-4">
              {conflictData.user.name} made changes that conflict with your
              current data. How would you like to resolve this?
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => handleConflictResolve("accept")}
                variant="primary"
                size="sm"
              >
                Accept Their Changes
              </Button>
              <Button
                onClick={() => handleConflictResolve("reject")}
                variant="secondary"
                size="sm"
              >
                Keep My Changes
              </Button>
              <Button
                onClick={() => handleConflictResolve("merge")}
                variant="success"
                size="sm"
              >
                Try to Merge
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Connection status */}
      {!isConnected && (
        <div className="absolute top-2 left-2 bg-warning text-on-warning px-2 py-1 rounded-lg text-xs">
          Reconnecting...
        </div>
      )}
    </div>
  );
};
