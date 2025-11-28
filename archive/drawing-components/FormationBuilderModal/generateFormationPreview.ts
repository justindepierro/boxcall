/**
 * Formation Preview Generator
 *
 * Creates simple ASCII-style previews of formations for quick visual reference.
 * Lightweight alternative to canvas/image generation.
 */

import type { Player } from "../diagram-editor/types/Player";

const GRID_WIDTH = 11; // Represents field width
const GRID_HEIGHT = 7; // Represents depth of formation
const LOS_Y = 20; // Line of scrimmage Y-coordinate

/**
 * Convert player coordinates to grid position
 */
function playerToGrid(player: Player): { x: number; y: number } {
  // Map X: 0-100 → 0-10 grid
  const gridX = Math.floor((player.x / 100) * GRID_WIDTH);

  // Map Y: relative to LOS (higher Y = lower on field)
  // LOS is at Y=20, skill positions 21-28
  const yDistance = player.y - LOS_Y;
  const gridY = Math.min(Math.floor(yDistance), GRID_HEIGHT - 1);

  return {
    x: Math.max(0, Math.min(gridX, GRID_WIDTH - 1)),
    y: Math.max(0, gridY),
  };
}

/**
 * Generate ASCII preview of formation
 */
export function generateFormationPreview(players: Player[]): string {
  if (players.length === 0) return "No players";

  // Create empty grid
  const grid: string[][] = Array.from({ length: GRID_HEIGHT }, () =>
    Array(GRID_WIDTH).fill("·")
  );

  // Mark LOS with dashes
  grid[0] = Array(GRID_WIDTH).fill("-");

  // Place players on grid
  for (const player of players) {
    const { x, y } = playerToGrid(player);

    // Use position abbreviation (first letter of role or jersey)
    const symbol = player.role?.[0] || player.jerseyNumber?.[0] || "X";
    grid[y][x] = symbol;
  }

  // Convert grid to string
  return grid.map((row) => row.join(" ")).join("\n");
}

/**
 * Generate compact single-line preview
 */
export function generateCompactPreview(players: Player[]): string {
  if (players.length === 0) return "Empty";

  // Count positions
  const positions = new Map<string, number>();
  for (const player of players) {
    const pos = player.role || player.jerseyNumber || "X";
    positions.set(pos, (positions.get(pos) || 0) + 1);
  }

  // Create compact string: "5 OL, 1 QB, 2 RB, 3 WR"
  const parts: string[] = [];

  // Order: OL, QB, RB, FB, TE, WR
  const order = ["C", "LG", "RG", "LT", "RT", "QB", "RB", "FB", "TE", "WR"];

  for (const pos of order) {
    const count = positions.get(pos);
    if (count) {
      parts.push(`${count} ${pos}`);
    }
  }

  return parts.join(", ") || `${players.length} players`;
}

/**
 * Generate SVG preview (for future use)
 * Returns inline SVG string for embedding
 */
export function generateSVGPreview(players: Player[]): string {
  if (players.length === 0) {
    return '<svg width="120" height="80" xmlns="http://www.w3.org/2000/svg"><text x="60" y="40" text-anchor="middle" fill="#999">Empty</text></svg>';
  }

  const width = 120;
  const height = 80;
  const losY = 10; // LOS position in SVG

  // Create player circles
  const playerCircles = players
    .map((player) => {
      const x = (player.x / 100) * width;
      const yDistance = (player.y - LOS_Y) * 3; // Scale Y distance
      const y = losY + yDistance;

      const label = player.role?.[0] || player.jerseyNumber?.[0] || "X";

      return `
      <circle cx="${x}" cy="${y}" r="4" fill="#10b981" />
      <text x="${x}" y="${y + 1}" text-anchor="middle" fill="white" font-size="6" font-family="monospace">${label}</text>
    `;
    })
    .join("");

  // LOS line
  const losLine = `<line x1="0" y1="${losY}" x2="${width}" y2="${losY}" stroke="#666" stroke-width="1" stroke-dasharray="2,2" />`;

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" style="background: #1a1a1a;">
      ${losLine}
      ${playerCircles}
    </svg>
  `.trim();
}
