import React from "react";
import { colorTokens } from "../../../../design-system/tokens";

/**
 * Player data
 */
export interface Player {
  id: string;
  x: number; // percentage
  y: number; // percentage
  label: string;
  role?: string;
  side?: "O" | "D" | "ST";
  color?: string;
  outlineColor?: string;
  locked?: boolean;
}

/**
 * Field Players Component
 *
 * Renders all player markers on the field with:
 * - Player shapes (ellipse for regular, rectangle for center)
 * - Player labels
 * - Selection halos
 * - Lock indicators
 * - Interactive handlers
 *
 * @param players - Array of player objects
 * @param selectedIds - Array of selected player IDs
 * @param theme - Field theme for styling
 * @param showPlayerLabels - Whether to show player labels
 * @param showDefensePlayers - Whether to show defense players
 * @param showSelectionPulse - Whether to animate selection pulse
 * @param onPlayerMouseDown - Handler for player mouse down
 * @param onPlayerDoubleClick - Handler for player double click
 * @param onPlayerLockToggle - Handler for lock toggle
 */
export const FieldPlayers: React.FC<{
  players: Player[];
  selectedIds?: string[];
  theme?: "classic" | "mono-light" | "mono-dark";
  showPlayerLabels?: boolean;
  showDefensePlayers?: boolean;
  showSelectionPulse?: boolean;
  onPlayerMouseDown?: (id: string, e: React.MouseEvent) => void;
  onPlayerDoubleClick?: (id: string, e: React.MouseEvent) => void;
  onPlayerLockToggle?: (id: string) => void;
}> = ({
  players,
  selectedIds = [],
  theme = "classic",
  showPlayerLabels = true,
  showDefensePlayers = true,
  showSelectionPulse = true,
  onPlayerMouseDown,
  onPlayerDoubleClick,
  onPlayerLockToggle,
}) => {
  const defaultOutline =
    theme === "mono-light" ? colorTokens.gray[800] : colorTokens.gray[50];

  return (
    <g id="field-players">
      {players
        .filter((p) => showDefensePlayers || p.side !== "D")
        .map((p) => {
          const isCenter = p.label === "C" || p.role === "C";
          const strokeColor = p.outlineColor || defaultOutline;
          const selected = selectedIds.includes(p.id);
          const locked = !!p.locked;

          return (
            <g
              key={p.id}
              transform={`translate(${(p.x / 100) * 1600},${(p.y / 100) * 900})`}
              className={locked ? "cursor-not-allowed opacity-70" : undefined}
              onMouseDown={(e) => {
                onPlayerMouseDown?.(p.id, e);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (locked) return;
                onPlayerDoubleClick?.(p.id, e);
              }}
            >
              {/* Gentle selection pulse halo */}
              {selected && showSelectionPulse && (
                <circle
                  cx={0}
                  cy={0}
                  r={isCenter ? 28 : 30}
                  fill="none"
                  stroke={colorTokens.amber[400]}
                  strokeWidth={3}
                  opacity={0.55}
                  className="animate-selectedBreathe"
                />
              )}
              {/* Player shape */}
              {isCenter ? (
                <rect
                  x={-24}
                  y={-16}
                  width={48}
                  height={32}
                  rx={4}
                  ry={4}
                  fill={p.color || colorTokens.blue[900]}
                  stroke={selected ? colorTokens.amber[400] : strokeColor}
                  strokeWidth={selected ? 4 : 2}
                />
              ) : (
                <ellipse
                  rx={26}
                  ry={18}
                  fill={
                    p.color ||
                    (p.side === "D"
                      ? colorTokens.red[700]
                      : colorTokens.blue[900])
                  }
                  stroke={selected ? colorTokens.amber[400] : strokeColor}
                  strokeWidth={selected ? 4 : 2}
                />
              )}{" "}
              {/* Player label */}
              {showPlayerLabels && (
                <text
                  x={0}
                  y={4}
                  fontSize={18}
                  fontWeight={700}
                  fill={
                    theme === "mono-light"
                      ? colorTokens.gray[900]
                      : colorTokens.gray[50]
                  }
                  textAnchor="middle"
                  style={{ userSelect: "none" }}
                >
                  {p.label}
                </text>
              )}
              {/* Lock toggle (top-right of glyph) */}
              <g
                transform="translate(20,-22)"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayerLockToggle?.(p.id);
                }}
                className="cursor-pointer"
              >
                {/* Subtle circular hit area */}
                <circle
                  cx={0}
                  cy={0}
                  r={10}
                  fill={
                    theme === "mono-light"
                      ? colorTokens.gray[50]
                      : colorTokens.gray[900]
                  }
                  opacity={p.locked ? 0.85 : 0.25}
                  stroke={
                    theme === "mono-light"
                      ? colorTokens.navy[300]
                      : colorTokens.gray[700]
                  }
                  strokeWidth={1}
                />
                {/* Padlock icon */}
                <rect
                  x={-4.5}
                  y={-1}
                  width={9}
                  height={7}
                  rx={1.5}
                  ry={1.5}
                  fill={
                    p.locked
                      ? theme === "mono-light"
                        ? colorTokens.navy[700]
                        : colorTokens.gray[200]
                      : "none"
                  }
                  stroke={
                    theme === "mono-light"
                      ? colorTokens.navy[700]
                      : colorTokens.gray[200]
                  }
                  strokeWidth={1.2}
                />
                <path
                  d="M -3 -1 v -2.5 a3 3 0 0 1 6 0 V -1"
                  fill="none"
                  stroke={
                    theme === "mono-light"
                      ? colorTokens.navy[700]
                      : colorTokens.gray[200]
                  }
                  strokeWidth={1.2}
                  strokeLinecap="round"
                />
                <title>{p.locked ? "Unlock player" : "Lock player"}</title>
              </g>
            </g>
          );
        })}
    </g>
  );
};
