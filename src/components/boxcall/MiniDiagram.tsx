import React from "react";
import type { FormationPlayerPosition } from "../../types/formation";
import { DIAGRAM_COLORS } from "../../design-system/chartColors";

/**
 * Simple SVG-based diagram for displaying formations
 * Starting fresh with a minimal, maintainable approach
 */
interface MiniDiagramProps {
  players: FormationPlayerPosition[];
  className?: string;
}

export const MiniDiagram: React.FC<MiniDiagramProps> = ({
  players,
  className = "",
}) => {
  // Football field dimensions (simplified)
  const fieldWidth = 120;
  const fieldHeight = 53.3; // Standard NFL field ratio

  // Convert player positions to SVG coordinates
  const getPlayerPosition = (player: FormationPlayerPosition) => {
    // Assuming positions are in yards from left sideline (0-120) and bottom (0-53.3)
    const x = (player.x / 120) * fieldWidth;
    const y = fieldHeight - (player.y / 53.3) * fieldHeight; // Flip Y axis

    return { x, y };
  };

  return (
    <div
      className={`bg-success-bg border-2 border-success rounded ${className}`}
    >
      <svg
        width={fieldWidth}
        height={fieldHeight}
        viewBox={`0 0 ${fieldWidth} ${fieldHeight}`}
        className="w-full h-full"
      >
        {/* Simple field background */}
        <rect
          width={fieldWidth}
          height={fieldHeight}
          fill={DIAGRAM_COLORS.offense.fill}
          stroke={DIAGRAM_COLORS.offense.stroke}
          strokeWidth="0.5"
        />

        {/* Players */}
        {players.map((player, index) => {
          const pos = getPlayerPosition(player);
          return (
            <g key={`${player.position}-${index}`}>
              {/* Player circle */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r="3"
                fill={DIAGRAM_COLORS.defense.fill}
                stroke={DIAGRAM_COLORS.defense.stroke}
                strokeWidth="0.5"
              />
              {/* Player label */}
              <text
                x={pos.x}
                y={pos.y - 4}
                textAnchor="middle"
                fontSize="2"
                fill={DIAGRAM_COLORS.neutral.fill}
                fontWeight="bold"
              >
                {player.position}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
