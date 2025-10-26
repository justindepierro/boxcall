/**
 * Collaborative Cursors Component
 *
 * Shows real-time cursors and selections of other users collaborating on the diagram
 */

import React from "react";
import { useCollaborativeStore } from "../stores/collaborativeStore";

interface CollaborativeCursorsProps {
  /** Function to convert diagram coordinates to screen coordinates */
  coordinateToScreen: (x: number, y: number) => { x: number; y: number };
}

export const CollaborativeCursors: React.FC<CollaborativeCursorsProps> = ({
  coordinateToScreen,
}) => {
  const { cursors, selections, users, currentUserId } = useCollaborativeStore();

  // Filter out current user's cursor (we don't show our own)
  const otherCursors = cursors.filter(
    (cursor) => cursor.userId !== currentUserId
  );
  const otherSelections = selections.filter(
    (sel) => sel.userId !== currentUserId
  );

  return (
    <g className="collaborative-cursors">
      {/* Render other users' cursors */}
      {otherCursors.map((cursor) => {
        const user = users.find((u) => u.id === cursor.userId);
        if (!user) return null;

        const screenPos = coordinateToScreen(cursor.x, cursor.y);

        return (
          <g key={`cursor-${cursor.userId}`}>
            {/* Cursor pointer */}
            <polygon
              points="0,0 12,8 8,12 4,10"
              fill={user.color}
              stroke="white"
              strokeWidth="2"
              transform={`translate(${screenPos.x}, ${screenPos.y})`}
              className="cursor-pointer"
            />

            {/* User name label */}
            <text
              x={screenPos.x + 16}
              y={screenPos.y + 4}
              fill={user.color}
              fontSize="12"
              fontWeight="bold"
              className="cursor-label"
              style={{
                filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.7))",
                userSelect: "none",
              }}
            >
              {user.name}
            </text>
          </g>
        );
      })}

      {/* Render other users' selections */}
      {otherSelections.map((selection) => {
        const user = users.find((u) => u.id === selection.userId);
        if (!selection.id || !user) return null;

        // For now, we'll highlight selected players/routes with a colored border
        // This would need to be integrated with the actual player/route rendering
        return (
          <g
            key={`selection-${selection.userId}-${selection.type}-${selection.id}`}
          >
            {/* Selection indicator - this would be positioned around the selected element */}
            <circle
              r="25"
              fill="none"
              stroke={user.color}
              strokeWidth="3"
              strokeDasharray="5,5"
              opacity="0.8"
              className="selection-indicator"
            />
          </g>
        );
      })}
    </g>
  );
};

export default CollaborativeCursors;
