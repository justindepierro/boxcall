// Formation templates and position-related constants for the visual play builder
export interface PlayerPosition {
  id: string;
  position: string; // QB, RB, WR1, WR2, WR3, TE, FB, etc.
  x: number; // X coordinate (0-100 representing field width percentage)
  y: number; // Y coordinate (0-100 representing field height percentage)
  number?: string; // Jersey number
  isKeyPlayer?: boolean;
}
// Standard position colors for visual distinction
export const POSITION_COLORS = {
  QB: "#ef4444", // Red
  RB: "#22c55e", // Green
  FB: "#15803d", // Dark Green
  WR1: "#3b82f6", // Blue
  WR2: "#3b82f6", // Blue
  WR3: "#3b82f6", // Blue
  WR4: "#3b82f6", // Blue
  TE: "#f59e0b", // Amber
  LT: "#6b7280", // Gray
  LG: "#6b7280", // Gray
  C: "#6b7280", // Gray
  RG: "#6b7280", // Gray
  RT: "#6b7280", // Gray
  default: "#64748b", // Slate
} as const;
// Standard formation templates
export const FORMATION_TEMPLATES: Record<string, PlayerPosition[]> = {
  "I-Formation": [
    { id: "QB", position: "QB", x: 50, y: 85, number: "12" },
    { id: "RB", position: "RB", x: 50, y: 70, number: "22" },
    { id: "FB", position: "FB", x: 50, y: 77, number: "35" },
    { id: "WR1", position: "WR1", x: 85, y: 85, number: "80" },
    { id: "WR2", position: "WR2", x: 15, y: 85, number: "11" },
    { id: "TE", position: "TE", x: 65, y: 85, number: "87" },
    { id: "C", position: "C", x: 50, y: 85, number: "55" },
    { id: "LG", position: "LG", x: 45, y: 85, number: "65" },
    { id: "RG", position: "RG", x: 55, y: 85, number: "75" },
    { id: "LT", position: "LT", x: 40, y: 85, number: "70" },
    { id: "RT", position: "RT", x: 60, y: 85, number: "76" },
  ],
  Shotgun: [
    { id: "QB", position: "QB", x: 50, y: 75, number: "12" },
    { id: "RB", position: "RB", x: 45, y: 70, number: "22" },
    { id: "WR1", position: "WR1", x: 85, y: 85, number: "80" },
    { id: "WR2", position: "WR2", x: 15, y: 85, number: "11" },
    { id: "WR3", position: "WR3", x: 75, y: 75, number: "19" },
    { id: "TE", position: "TE", x: 65, y: 85, number: "87" },
    { id: "C", position: "C", x: 50, y: 85, number: "55" },
    { id: "LG", position: "LG", x: 45, y: 85, number: "65" },
    { id: "RG", position: "RG", x: 55, y: 85, number: "75" },
    { id: "LT", position: "LT", x: 40, y: 85, number: "70" },
    { id: "RT", position: "RT", x: 60, y: 85, number: "76" },
  ],
  Trio: [
    { id: "QB", position: "QB", x: 50, y: 75, number: "12" },
    { id: "RB", position: "RB", x: 45, y: 70, number: "22" },
    { id: "WR1", position: "WR1", x: 85, y: 85, number: "80" },
    { id: "WR2", position: "WR2", x: 75, y: 80, number: "11" },
    { id: "WR3", position: "WR3", x: 70, y: 75, number: "19" },
    { id: "TE", position: "TE", x: 65, y: 85, number: "87" },
    { id: "C", position: "C", x: 50, y: 85, number: "55" },
    { id: "LG", position: "LG", x: 45, y: 85, number: "65" },
    { id: "RG", position: "RG", x: 55, y: 85, number: "75" },
    { id: "LT", position: "LT", x: 40, y: 85, number: "70" },
    { id: "RT", position: "RT", x: 60, y: 85, number: "76" },
  ],
  Empty: [
    { id: "QB", position: "QB", x: 50, y: 75, number: "12" },
    { id: "WR1", position: "WR1", x: 85, y: 85, number: "80" },
    { id: "WR2", position: "WR2", x: 15, y: 85, number: "11" },
    { id: "WR3", position: "WR3", x: 75, y: 75, number: "19" },
    { id: "WR4", position: "WR4", x: 25, y: 75, number: "14" },
    { id: "TE", position: "TE", x: 65, y: 80, number: "87" },
    { id: "C", position: "C", x: 50, y: 85, number: "55" },
    { id: "LG", position: "LG", x: 45, y: 85, number: "65" },
    { id: "RG", position: "RG", x: 55, y: 85, number: "75" },
    { id: "LT", position: "LT", x: 40, y: 85, number: "70" },
    { id: "RT", position: "RT", x: 60, y: 85, number: "76" },
  ],
  Doubles: [
    { id: "QB", position: "QB", x: 50, y: 75, number: "12" },
    { id: "RB", position: "RB", x: 45, y: 70, number: "22" },
    { id: "WR1", position: "WR1", x: 85, y: 85, number: "80" },
    { id: "WR2", position: "WR2", x: 75, y: 80, number: "11" },
    { id: "WR3", position: "WR3", x: 25, y: 80, number: "19" },
    { id: "WR4", position: "WR4", x: 15, y: 85, number: "14" },
    { id: "C", position: "C", x: 50, y: 85, number: "55" },
    { id: "LG", position: "LG", x: 45, y: 85, number: "65" },
    { id: "RG", position: "RG", x: 55, y: 85, number: "75" },
    { id: "LT", position: "LT", x: 40, y: 85, number: "70" },
    { id: "RT", position: "RT", x: 60, y: 85, number: "76" },
  ],
};
// Utility function to get formation template
export const getFormationTemplate = (formation: string): PlayerPosition[] => {
  return FORMATION_TEMPLATES[formation] || [];
};
// Utility function to create custom player position
export const createPlayerPosition = (
  id: string,
  position: string,
  x: number,
  y: number,
  number?: string,
  isKeyPlayer = false
): PlayerPosition => ({
  id,
  position,
  x,
  y,
  number,
  isKeyPlayer,
});
// Utility function to check if position is offensive line
export const isOffensiveLine = (position: string): boolean => {
  return ["LT", "LG", "C", "RG", "RT"].includes(position);
};
// Utility function to get position color
export const getPositionColor = (position: string): string => {
  return (
    POSITION_COLORS[position as keyof typeof POSITION_COLORS] ||
    POSITION_COLORS.default
  );
};
