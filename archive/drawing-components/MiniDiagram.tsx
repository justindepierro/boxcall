import React, { useRef } from "react";

/**
 * Simple diagram data interface for mini diagrams
 */
interface SimpleDiagramData {
  players?: Array<{
    position: string;
    x: number;
    y: number;
    role?: string;
  }>;
}

/**
 * MiniDiagram - Simple SVG-based diagram display for live sessions
 *
 * Shows a basic, non-interactive version of a play diagram during
 * live practice/game sessions for quick reference.
 */
export const MiniDiagram: React.FC<{
  /** The diagram data to display */
  data: SimpleDiagramData;
  /** Width of the mini diagram */
  width?: number;
  /** Height of the mini diagram */
  height?: number;
  /** Whether to show interactive elements */
  interactive?: boolean;
  /** Optional CSS class name */
  className?: string;
  /** Callback when diagram is clicked */
  onClick?: () => void;
  /** Whether to highlight executed routes */
  highlightExecuted?: boolean;
  /** Array of executed route IDs to highlight */
  executedRoutes?: string[];
}> = ({
  data,
  width = 200,
  height = 150,
  interactive: _interactive = false,
  className = "",
  onClick,
  highlightExecuted = false,
  executedRoutes = [],
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  // Convert field coordinates to SVG coordinates
  const fieldWidth = 53.333;
  const fieldHeight = 35;
  const scaleX = (width - 20) / fieldWidth; // Leave some padding
  const scaleY = (height - 20) / fieldHeight;

  const toSvgX = (x: number) => 10 + x * scaleX;
  const toSvgY = (y: number) => 10 + y * scaleY;

  return (
    <div
      ref={containerRef}
      className={`mini-diagram border border-border rounded-lg overflow-hidden bg-surface-secondary cursor-pointer hover:shadow-md transition-shadow ${className}`}
      style={{ width, height }}
      onClick={handleClick}
    >
      <svg width={width} height={height} className="w-full h-full">
        {/* Simple field background */}
        <rect
          x="0"
          y="0"
          width={width}
          height={height}
          fill="#f0f9e8"
          stroke="#d4edda"
          strokeWidth="1"
        />

        {/* Yard lines (simplified) */}
        {[0, 10, 20, 30, 40, 50].map((yard) => (
          <line
            key={yard}
            x1={toSvgX(yard)}
            y1="10"
            x2={toSvgX(yard)}
            y2={height - 10}
            stroke="#90a4ae"
            strokeWidth="1"
            opacity="0.5"
          />
        ))}

        {/* Hash marks */}
        <line
          x1="10"
          y1={toSvgY(17.5)}
          x2={width - 10}
          y2={toSvgY(17.5)}
          stroke="#90a4ae"
          strokeWidth="1"
          opacity="0.5"
        />

        {/* Players */}
        {data.players?.map((player, index) => (
          <circle
            key={`${player.position}-${index}`}
            cx={toSvgX(player.x)}
            cy={toSvgY(player.y)}
            r="6"
            fill={
              player.role === "QB" ? "#fbbf24" :
              ["LT", "LG", "C", "RG", "RT"].includes(player.role || "") ? "#fb923c" :
              player.role === "TE" ? "#f87171" :
              player.role === "WR" ? "#60a5fa" :
              "#4ade80"
            }
            stroke="#ffffff"
            strokeWidth="2"
          />
        ))}

        {/* Player labels */}
        {data.players?.map((player, index) => (
          <text
            key={`label-${player.position}-${index}`}
            x={toSvgX(player.x)}
            y={toSvgY(player.y) + 1}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="8"
            fontWeight="bold"
            fill={
              player.role === "QB" ? "#000000" : "#ffffff"
            }
          >
            {player.role || "P"}
          </text>
        ))}

        {/* Optional overlay for execution status */}
        {highlightExecuted && executedRoutes.length > 0 && (
          <g>
            <rect
              x={width - 60}
              y="5"
              width="55"
              height="20"
              fill="#10b981"
              rx="10"
            />
            <text
              x={width - 32}
              y="15"
              textAnchor="middle"
              fontSize="10"
              fontWeight="bold"
              fill="white"
            >
              Executed
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
