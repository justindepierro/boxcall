import React, { useState, useCallback, useMemo } from "react";
import type { Play } from "../../../types/play";
import type { PlayerPosition } from "./formationConstants";
import {
  FORMATION_TEMPLATES,
  getPositionColor,
  isOffensiveLine,
} from "./formationConstants";

interface PlayerPositionSystemProps {
  play?: Play;
  players?: PlayerPosition[];
  onPlayerMove?: (playerId: string, x: number, y: number) => void;
  readOnly?: boolean;
  fieldWidth: number;
  fieldHeight: number;
  showLabels?: boolean;
}

export const PlayerPositionSystem: React.FC<PlayerPositionSystemProps> = ({
  play,
  players,
  onPlayerMove,
  readOnly = false,
  fieldWidth,
  fieldHeight,
  showLabels = true,
}) => {
  const [draggedPlayer, setDraggedPlayer] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [playerPositions, setPlayerPositions] = useState<{
    [id: string]: { x: number; y: number };
  }>({});

  // Use formation template if no custom players provided
  const currentPlayers = useMemo(() => {
    return (
      players ||
      (play?.formation ? FORMATION_TEMPLATES[play.formation] : []) ||
      []
    );
  }, [players, play?.formation]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, playerId: string) => {
      if (readOnly) return;

      e.preventDefault();
      e.stopPropagation();

      const svgElement = e.currentTarget.closest("svg");
      if (!svgElement) return;

      const rect = svgElement.getBoundingClientRect();
      const player = currentPlayers.find((p) => p.id === playerId);
      if (!player) return;

      const playerPos = playerPositions[playerId];
      const currentX = playerPos ? playerPos.x : (player.x / 100) * fieldWidth;
      const currentY = playerPos ? playerPos.y : (player.y / 100) * fieldHeight;

      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      setDraggedPlayer(playerId);
      setDragOffset({
        x: clientX - currentX,
        y: clientY - currentY,
      });
    },
    [readOnly, currentPlayers, fieldWidth, fieldHeight, playerPositions]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggedPlayer || readOnly) return;

      const svgElement = e.currentTarget;
      const rect = svgElement.getBoundingClientRect();

      const newX = e.clientX - rect.left - dragOffset.x;
      const newY = e.clientY - rect.top - dragOffset.y;

      // Constrain to field bounds
      const constrainedX = Math.max(15, Math.min(fieldWidth - 15, newX));
      const constrainedY = Math.max(15, Math.min(fieldHeight - 15, newY));

      setPlayerPositions((prev) => ({
        ...prev,
        [draggedPlayer]: { x: constrainedX, y: constrainedY },
      }));

      onPlayerMove?.(draggedPlayer, constrainedX, constrainedY);
    },
    [draggedPlayer, readOnly, dragOffset, fieldWidth, fieldHeight, onPlayerMove]
  );

  const handleMouseUp = useCallback(() => {
    setDraggedPlayer(null);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  return (
    <g
      className="player-positions"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {currentPlayers.map((player) => {
        const playerPos = playerPositions[player.id];
        const x = playerPos ? playerPos.x : (player.x / 100) * fieldWidth;
        const y = playerPos ? playerPos.y : (player.y / 100) * fieldHeight;
        const color = getPositionColor(player.position);
        const isOLine = isOffensiveLine(player.position);
        const isDragging = draggedPlayer === player.id;

        return (
          <g key={player.id} className="player">
            {/* Player Circle */}
            <circle
              cx={x}
              cy={y}
              r={isOLine ? 8 : 12}
              fill={color}
              stroke="#ffffff"
              strokeWidth="2"
              onMouseDown={(e) => handleMouseDown(e, player.id)}
              className={`transition-all duration-200 ${
                !readOnly ? "cursor-move hover:opacity-80" : ""
              } ${isDragging ? "opacity-60 scale-110" : ""}`}
              style={{
                filter: isDragging
                  ? "drop-shadow(2px 2px 6px rgba(0,0,0,0.3))"
                  : undefined,
              }}
            />

            {/* Player Number */}
            {player.number && (
              <text
                x={x}
                y={y + 2}
                textAnchor="middle"
                fontSize={isOLine ? "8" : "10"}
                fill="#ffffff"
                className="font-bold pointer-events-none"
              >
                {player.number}
              </text>
            )}

            {/* Position Label */}
            {showLabels && (
              <text
                x={x}
                y={y - (isOLine ? 12 : 18)}
                textAnchor="middle"
                fontSize="10"
                fill="#1f2937"
                className="font-medium pointer-events-none"
              >
                {player.position}
              </text>
            )}

            {/* Key Player Indicator */}
            {player.isKeyPlayer && (
              <circle
                cx={x}
                cy={y}
                r={isOLine ? 12 : 16}
                fill="none"
                stroke="#fbbf24"
                strokeWidth="2"
                strokeDasharray="4,2"
                className="animate-pulse pointer-events-none"
              />
            )}
          </g>
        );
      })}

      {/* Formation Label */}
      {play?.formation && (
        <text
          x={fieldWidth / 2}
          y={30}
          textAnchor="middle"
          fontSize="14"
          fill="#374151"
          className="font-semibold pointer-events-none"
        >
          {play.formation} Formation
          {play.f_dir && ` (${play.f_dir})`}
        </text>
      )}
    </g>
  );
};
