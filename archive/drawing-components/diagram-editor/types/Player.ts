/**
 * Player data types for diagram editor
 */

export type TeamSide = "offense" | "defense";
export type PlayerPosition = "regular" | "center";

export interface Player {
  id: string;
  x: number; // X position in yards
  y: number; // Y position in yards
  jerseyNumber: string; // Jersey number (e.g., "12", "QB")
  team: TeamSide;
  color?: number; // Custom color override (hex)
  role?: string; // Position role (QB, WR, RB, etc.)
  position?: PlayerPosition; // Shape type: 'regular' (circle) or 'center' (square/rectangle)
}

export interface PlayerColors {
  fill: number; // Fill color (hex)
  stroke: number; // Border color (hex)
  text: number; // Jersey number color (hex)
}

// Default team colors
export const TEAM_COLORS: Record<TeamSide, PlayerColors> = {
  offense: {
    fill: 0x3b82f6, // Blue-500
    stroke: 0x1e40af, // Blue-800
    text: 0xffffff, // White
  },
  defense: {
    fill: 0xef4444, // Red-500
    stroke: 0x991b1b, // Red-800
    text: 0xffffff, // White
  },
};

// Selection highlight color
export const SELECTION_COLOR = 0xfbbf24; // Amber-400
