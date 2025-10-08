/**
 * Player data types for diagram editor
 */

export type TeamSide = 'offense' | 'defense';

export interface Player {
  id: string;
  x: number;              // X position in yards
  y: number;              // Y position in yards
  jerseyNumber: string;   // Jersey number (e.g., "12", "QB")
  team: TeamSide;
  color?: number;         // Custom color override (hex)
  role?: string;          // Position role (QB, WR, RB, etc.)
}

export interface PlayerColors {
  fill: number;      // Fill color (hex)
  stroke: number;    // Border color (hex)
  text: number;      // Jersey number color (hex)
}

// Default team colors
export const TEAM_COLORS: Record<TeamSide, PlayerColors> = {
  offense: {
    fill: 0x3B82F6,      // Blue-500
    stroke: 0x1E40AF,    // Blue-800
    text: 0xFFFFFF,      // White
  },
  defense: {
    fill: 0xEF4444,      // Red-500
    stroke: 0x991B1B,    // Red-800
    text: 0xFFFFFF,      // White
  },
};

// Selection highlight color
export const SELECTION_COLOR = 0xFBBF24; // Amber-400
