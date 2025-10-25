/**
 * Formation Templates - Quick-start formations for coaches
 * 
 * Uses FieldConstants for consistent positioning.
 * TODO: Convert to use SmartPositioning engine for dynamic intelligence.
 */

import type { Player } from "../diagram-editor/types/Player";
import { v4 as uuidv4 } from "uuid";
import { OL_POSITIONS, LOS_Y, CENTER_X } from "../diagram-editor/utils/FieldConstants";

export interface FormationTemplate {
  id: string;
  name: string;
  description: string;
  personnel: string; // Recommended personnel (e.g., "11", "12", "Blue")
  players: Omit<Player, "id">[]; // Player positions without IDs (generated on load)
}

/**
 * Generate O-line positions using FieldConstants
 */
const createOLine = (): Omit<Player, "id">[] => [
  {
    x: OL_POSITIONS.LT,
    y: LOS_Y,
    jerseyNumber: "LT",
    team: "offense",
    role: "LT",
    position: "regular",
  },
  {
    x: OL_POSITIONS.LG,
    y: LOS_Y,
    jerseyNumber: "LG",
    team: "offense",
    role: "LG",
    position: "regular",
  },
  {
    x: OL_POSITIONS.C,
    y: LOS_Y,
    jerseyNumber: "C",
    team: "offense",
    role: "C",
    position: "center",
  },
  {
    x: OL_POSITIONS.RG,
    y: LOS_Y,
    jerseyNumber: "RG",
    team: "offense",
    role: "RG",
    position: "regular",
  },
  {
    x: OL_POSITIONS.RT,
    y: LOS_Y,
    jerseyNumber: "RT",
    team: "offense",
    role: "RT",
    position: "regular",
  },
];

// TODO: Convert formation templates to use smart positioning system
// Currently using hardcoded coordinates for predictable template behavior
// Future: Replace hardcoded positions with getOptimalPosition() calls

export const FORMATION_TEMPLATES: FormationTemplate[] = [
  {
    id: "shotgun-spread",
    name: "Shotgun Spread",
    description: "4 WRs split wide, RB offset, QB in shotgun",
    personnel: "11",
    players: [
      ...createOLine(),
      { x: 10, y: LOS_Y, jerseyNumber: "X", team: "offense", role: "WR", position: "regular" }, // X - far left
      { x: 18, y: LOS_Y + 1, jerseyNumber: "Y", team: "offense", role: "WR", position: "regular" }, // Y - slot left
      { x: 35, y: LOS_Y + 1, jerseyNumber: "Z", team: "offense", role: "WR", position: "regular" }, // Z - slot right
      { x: 43, y: LOS_Y, jerseyNumber: "H", team: "offense", role: "WR", position: "regular" }, // H - far right
      { x: 31, y: LOS_Y + 6, jerseyNumber: "RB", team: "offense", role: "RB", position: "regular" }, // RB offset
      { x: CENTER_X, y: LOS_Y + 8, jerseyNumber: "QB", team: "offense", role: "QB", position: "regular" }, // QB shotgun
    ],
  },
  {
    id: "i-formation",
    name: "I-Formation",
    description: "Pro set with FB and RB stacked behind QB",
    personnel: "12",
    players: [
      ...createOLine(),
      { x: 10, y: LOS_Y, jerseyNumber: "X", team: "offense", role: "WR", position: "regular" }, // X - left
      { x: 43, y: LOS_Y, jerseyNumber: "Z", team: "offense", role: "WR", position: "regular" }, // Z - right
      { x: 21, y: LOS_Y, jerseyNumber: "TE", team: "offense", role: "TE", position: "regular" }, // TE on line
      { x: CENTER_X, y: LOS_Y + 4, jerseyNumber: "QB", team: "offense", role: "QB", position: "regular" }, // QB under center
      { x: CENTER_X, y: LOS_Y + 7, jerseyNumber: "FB", team: "offense", role: "FB", position: "regular" }, // FB
      { x: CENTER_X, y: LOS_Y + 10, jerseyNumber: "RB", team: "offense", role: "RB", position: "regular" }, // RB deep
    ],
  },
  {
    id: "empty-backfield",
    name: "Empty Backfield",
    description: "5 receivers, no RB, QB in shotgun",
    personnel: "10",
    players: [
      ...createOLine(),
      { x: 10, y: LOS_Y, jerseyNumber: "X", team: "offense", role: "WR", position: "regular" },
      { x: 15, y: LOS_Y + 1, jerseyNumber: "Y", team: "offense", role: "WR", position: "regular" },
      { x: CENTER_X, y: LOS_Y + 8, jerseyNumber: "QB", team: "offense", role: "QB", position: "regular" },
      { x: 38, y: LOS_Y + 1, jerseyNumber: "H", team: "offense", role: "WR", position: "regular" },
      { x: 43, y: LOS_Y, jerseyNumber: "Z", team: "offense", role: "WR", position: "regular" },
      { x: 35, y: LOS_Y, jerseyNumber: "TE", team: "offense", role: "TE", position: "regular" },
    ],
  },
  {
    id: "twins-right",
    name: "Twins Right",
    description: "2 WRs on right, 1 on left, RB offset",
    personnel: "11",
    players: [
      ...createOLine(),
      { x: 10, y: LOS_Y, jerseyNumber: "X", team: "offense", role: "WR", position: "regular" }, // X - left alone
      { x: 38, y: LOS_Y + 1, jerseyNumber: "Y", team: "offense", role: "WR", position: "regular" }, // Y - slot right
      { x: 43, y: LOS_Y, jerseyNumber: "Z", team: "offense", role: "WR", position: "regular" }, // Z - right
      { x: 21, y: LOS_Y, jerseyNumber: "TE", team: "offense", role: "TE", position: "regular" }, // TE left
      { x: 31, y: LOS_Y + 6, jerseyNumber: "RB", team: "offense", role: "RB", position: "regular" }, // RB offset
      { x: CENTER_X, y: LOS_Y + 8, jerseyNumber: "QB", team: "offense", role: "QB", position: "regular" }, // QB shotgun
    ],
  },
  {
    id: "trips-left",
    name: "Trips Left",
    description: "3 WRs bunched on left side",
    personnel: "10",
    players: [
      ...createOLine(),
      { x: 10, y: LOS_Y, jerseyNumber: "X", team: "offense", role: "WR", position: "regular" }, // X - far left
      { x: 15, y: LOS_Y + 1, jerseyNumber: "Y", team: "offense", role: "WR", position: "regular" }, // Y - slot
      { x: 18, y: LOS_Y, jerseyNumber: "H", team: "offense", role: "WR", position: "regular" }, // H - inside
      { x: 43, y: LOS_Y, jerseyNumber: "Z", team: "offense", role: "WR", position: "regular" }, // Z - right alone
      { x: 31, y: LOS_Y + 6, jerseyNumber: "RB", team: "offense", role: "RB", position: "regular" }, // RB offset
      { x: CENTER_X, y: LOS_Y + 8, jerseyNumber: "QB", team: "offense", role: "QB", position: "regular" }, // QB shotgun
    ],
  },
  {
    id: "pro-set",
    name: "Pro Set",
    description: "Balanced formation with 2 WRs, 1 TE, 2 RBs",
    personnel: "21",
    players: [
      ...createOLine(),
      { x: 10, y: LOS_Y, jerseyNumber: "X", team: "offense", role: "WR", position: "regular" },
      { x: 43, y: LOS_Y, jerseyNumber: "Z", team: "offense", role: "WR", position: "regular" },
      { x: 21, y: LOS_Y, jerseyNumber: "TE", team: "offense", role: "TE", position: "regular" },
      { x: CENTER_X, y: LOS_Y + 4, jerseyNumber: "QB", team: "offense", role: "QB", position: "regular" },
      { x: 22, y: LOS_Y + 7, jerseyNumber: "RB1", team: "offense", role: "RB", position: "regular" },
      { x: 31, y: LOS_Y + 7, jerseyNumber: "RB2", team: "offense", role: "RB", position: "regular" },
    ],
  },
];

/**
 * Load a template and generate unique IDs for each player
 */
export function loadFormationTemplate(templateId: string): Player[] {
  const template = FORMATION_TEMPLATES.find((t) => t.id === templateId);
  if (!template) {
    console.warn(`Template "${templateId}" not found`);
    return [];
  }

  return template.players.map((player) => ({
    ...player,
    id: uuidv4(),
  }));
}

/**
 * Get template by ID
 */
export function getTemplate(templateId: string): FormationTemplate | undefined {
  return FORMATION_TEMPLATES.find((t) => t.id === templateId);
}
