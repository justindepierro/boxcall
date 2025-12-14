/**
 * Collaborative Cursor Component
 * Shows real-time cursor positions of other users
 *
 * Phase 2B Sprint 4: Live Dashboard Sharing
 */

import React from "react";
import {
  type CursorUpdate,
  type CollaborationUser,
} from "@services/realTimeCollaboration";

interface CollaborativeCursorProps {
  cursor: CursorUpdate;
  user: CollaborationUser;
  containerRef: React.RefObject<HTMLElement>;
}

export function CollaborativeCursor({
  cursor,
  user,
  containerRef,
}: CollaborativeCursorProps) {
  const { position, action } = cursor;

  // Don't render if cursor is off-screen or container not available
  if (!containerRef.current || position.x < 0 || position.y < 0) {
    return null;
  }

  const containerRect = containerRef.current.getBoundingClientRect();
  const x = (position.x / 100) * containerRect.width;
  const y = (position.y / 100) * containerRect.height;

  // Color based on user role
  const getCursorColor = (role: CollaborationUser["role"]) => {
    switch (role) {
      case "coach":
        return "border-text-warning bg-text-warning";
      case "player":
        return "border-text-info bg-text-info";
      case "parent":
        return "border-text-tertiary bg-text-tertiary";
      case "admin":
        return "border-text-primary bg-text-primary";
      default:
        return "border-text-secondary bg-text-secondary";
    }
  };

  const cursorColor = getCursorColor(user.role);
  const isEditing = action === "editing";
  const isSelecting = action === "selecting";

  return (
    <div
      className="pointer-events-none fixed z-50 transition-all duration-100 ease-out"
      style={{
        left: x,
        top: y,
        transform: "translate(-2px, -2px)",
      }}
    >
      {/* Cursor pointer */}
      <div className="relative">
        {/* Main cursor */}
        <div
          className={`w-4 h-4 border-2 ${cursorColor} transform rotate-45 ${
            isEditing ? "animate-pulse" : ""
          } ${isSelecting ? "scale-125" : ""}`}
          style={{
            clipPath: "polygon(0 0, 0 100%, 35% 65%, 65% 35%)",
          }}
        />

        {/* User label */}
        <div
          className={`absolute left-5 top-0 px-2 py-1 rounded-lg text-xs font-medium text-bg-primary whitespace-nowrap ${cursorColor
            .replace("border-", "bg-")
            .replace("bg-", "bg-")}`}
        >
          {user.name}
          {isEditing && " ✏️"}
          {isSelecting && " 👆"}
        </div>

        {/* Action indicator */}
        {action && action !== "hovering" && (
          <div
            className={`absolute -top-1 -left-1 w-6 h-6 border-2 rounded-full ${cursorColor} ${(() => {
              if (isEditing) return "animate-ping";
              if (isSelecting) return "animate-bounce";
              return "";
            })()}`}
            style={{ animationDuration: "1s" }}
          />
        )}
      </div>
    </div>
  );
}

interface CollaborativeCursorsProps {
  cursors: Map<string, CursorUpdate>;
  users: Map<string, CollaborationUser>;
  containerRef: React.RefObject<HTMLElement>;
}

/**
 * Container component that renders all collaborative cursors
 */
export function CollaborativeCursors({
  cursors,
  users,
  containerRef,
}: CollaborativeCursorsProps) {
  return (
    <>
      {Array.from(cursors.entries()).map(([userId, cursor]) => {
        const user = users.get(userId);
        if (!user) return null;

        return (
          <CollaborativeCursor
            key={userId}
            cursor={cursor}
            user={user}
            containerRef={containerRef}
          />
        );
      })}
    </>
  );
}

export default CollaborativeCursor;
