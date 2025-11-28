/**
 * NFL Formation Templates Library
 *
 * Pre-built professional formations with standard depths and positioning.
 * Based on NFL/college standards from USA Football, Hudl, and Firstdown Playbook.
 *
 * All formations use professional depth standards:
 * - QB: 7 yards behind LOS (shotgun) or 1 yard (under center)
 * - RB: 8 yards behind LOS (I-formation) or 6 yards (offset)
 * - FB: 6 yards behind LOS
 * - Slot receivers: 1 yard off LOS
 * - Split ends/TE: On LOS (y = 17.5)
 *
 * Coordinate system:
 * - Field width: 53.3 yards (0-53.3)
 * - Line of scrimmage: y = 17.5
 * - Center of field: x = 26.67
 * - Offensive side: y > 17.5 (below LOS)
 */

import type { FormationPlayerPosition } from "../types/formation";

export interface FormationTemplate {
  id: string;
  name: string;
  description: string;
  personnel: string; // "11", "12", "21", "22", etc.
  category: "shotgun" | "under-center" | "pistol" | "specialty";
  playerPositions: FormationPlayerPosition[];
  thumbnail?: string; // Optional base64 or URL for preview
}

// Field constants
const LINE_OF_SCRIMMAGE_Y = 17.5;
const CENTER_X = 26.67;

/**
 * NFL Formation Templates - 15 most common formations
 */
export const FORMATION_TEMPLATES: FormationTemplate[] = [
  // ===== SHOTGUN FORMATIONS (11 PERSONNEL) =====
  {
    id: "shotgun-trips-right",
    name: "Shotgun Trips Right",
    description: "3 receivers to right, 1 to left. Spread offense staple.",
    personnel: "11",
    category: "shotgun",
    playerPositions: [
      // QB - 7 yards deep, center
      {
        position: "QB",
        label: "Q",
        role: "QB",
        x: CENTER_X,
        y: 24.5, // LOS + 7
      },
      // RB - 8 yards deep, offset left
      {
        position: "RB",
        label: "R",
        role: "RB",
        x: CENTER_X - 5,
        y: 25.5, // LOS + 8
      },
      // Left side - Split End (X)
      {
        position: "WR",
        label: "X",
        role: "WR",
        x: 5, // Wide left
        y: LINE_OF_SCRIMMAGE_Y, // On LOS
      },
      // Right side - Trips formation (Z, H, Y)
      {
        position: "WR",
        label: "Z",
        role: "WR",
        x: 48, // Wide right
        y: LINE_OF_SCRIMMAGE_Y, // On LOS
      },
      {
        position: "WR",
        label: "H",
        role: "WR",
        x: 40, // Slot right
        y: 18.5, // 1 yard off LOS
      },
      {
        position: "WR",
        label: "Y",
        role: "WR",
        x: 35, // Inside slot right
        y: 18.5, // 1 yard off LOS
      },
    ],
  },

  {
    id: "shotgun-spread",
    name: "Shotgun Spread",
    description: "4 wide receivers, balanced. Air raid offense.",
    personnel: "11",
    category: "shotgun",
    playerPositions: [
      // QB - 7 yards deep, center
      {
        position: "QB",
        label: "Q",
        role: "QB",
        x: CENTER_X,
        y: 24.5,
      },
      // RB - 8 yards deep, slightly offset
      {
        position: "RB",
        label: "R",
        role: "RB",
        x: CENTER_X - 4,
        y: 25.5,
      },
      // 2 receivers left
      {
        position: "WR",
        label: "X",
        role: "WR",
        x: 5,
        y: LINE_OF_SCRIMMAGE_Y,
      },
      {
        position: "WR",
        label: "A",
        role: "WR",
        x: 18,
        y: 18.5, // Slot left
      },
      // 2 receivers right
      {
        position: "WR",
        label: "Z",
        role: "WR",
        x: 48,
        y: LINE_OF_SCRIMMAGE_Y,
      },
      {
        position: "WR",
        label: "H",
        role: "WR",
        x: 36,
        y: 18.5, // Slot right
      },
    ],
  },

  {
    id: "shotgun-doubles",
    name: "Shotgun Doubles",
    description: "2x2 formation. Balanced passing attack.",
    personnel: "11",
    category: "shotgun",
    playerPositions: [
      // QB - 7 yards deep
      {
        position: "QB",
        label: "Q",
        role: "QB",
        x: CENTER_X,
        y: 24.5,
      },
      // RB - 8 yards deep, offset right
      {
        position: "RB",
        label: "R",
        role: "RB",
        x: CENTER_X + 5,
        y: 25.5,
      },
      // Left side - 2 receivers
      {
        position: "WR",
        label: "X",
        role: "WR",
        x: 5,
        y: LINE_OF_SCRIMMAGE_Y,
      },
      {
        position: "WR",
        label: "A",
        role: "WR",
        x: 18,
        y: 18.5,
      },
      // Right side - 2 receivers
      {
        position: "WR",
        label: "Z",
        role: "WR",
        x: 48,
        y: LINE_OF_SCRIMMAGE_Y,
      },
      {
        position: "WR",
        label: "H",
        role: "WR",
        x: 36,
        y: 18.5,
      },
    ],
  },

  {
    id: "shotgun-empty",
    name: "Shotgun Empty",
    description: "5 receivers, no RB. Max pass protection or quick release.",
    personnel: "11",
    category: "shotgun",
    playerPositions: [
      // QB - 7 yards deep, alone
      {
        position: "QB",
        label: "Q",
        role: "QB",
        x: CENTER_X,
        y: 24.5,
      },
      // 5 receivers spread across field
      {
        position: "WR",
        label: "X",
        role: "WR",
        x: 5,
        y: LINE_OF_SCRIMMAGE_Y,
      },
      {
        position: "WR",
        label: "A",
        role: "WR",
        x: 17,
        y: 18.5,
      },
      {
        position: "WR",
        label: "H",
        role: "WR",
        x: 36,
        y: 18.5,
      },
      {
        position: "WR",
        label: "Z",
        role: "WR",
        x: 48,
        y: LINE_OF_SCRIMMAGE_Y,
      },
      {
        position: "RB",
        label: "R",
        role: "RB",
        x: CENTER_X,
        y: 20.5, // Shallow slot
      },
    ],
  },

  // ===== UNDER CENTER FORMATIONS (12 PERSONNEL) =====
  {
    id: "i-form-pro",
    name: "I-Form Pro",
    description: "Classic power running formation. FB leads, RB follows.",
    personnel: "12",
    category: "under-center",
    playerPositions: [
      // QB - Under center
      {
        position: "QB",
        label: "Q",
        role: "QB",
        x: CENTER_X,
        y: 18.5, // 1 yard behind LOS
      },
      // FB - 6 yards deep
      {
        position: "FB",
        label: "F",
        role: "FB",
        x: CENTER_X,
        y: 23.5,
      },
      // RB - 8 yards deep (I-formation)
      {
        position: "RB",
        label: "R",
        role: "RB",
        x: CENTER_X,
        y: 25.5,
      },
      // TE - Right side on LOS
      {
        position: "TE",
        label: "Y",
        role: "TE",
        x: 32,
        y: LINE_OF_SCRIMMAGE_Y,
      },
      // WR Left
      {
        position: "WR",
        label: "X",
        role: "WR",
        x: 5,
        y: LINE_OF_SCRIMMAGE_Y,
      },
      // WR Right
      {
        position: "WR",
        label: "Z",
        role: "WR",
        x: 48,
        y: LINE_OF_SCRIMMAGE_Y,
      },
    ],
  },

  {
    id: "i-form-twins",
    name: "I-Form Twins",
    description: "I-formation with 2 receivers on one side. Pass-run balance.",
    personnel: "12",
    category: "under-center",
    playerPositions: [
      // QB - Under center
      {
        position: "QB",
        label: "Q",
        role: "QB",
        x: CENTER_X,
        y: 18.5,
      },
      // FB - 6 yards deep
      {
        position: "FB",
        label: "F",
        role: "FB",
        x: CENTER_X,
        y: 23.5,
      },
      // RB - 8 yards deep
      {
        position: "RB",
        label: "R",
        role: "RB",
        x: CENTER_X,
        y: 25.5,
      },
      // TE - Left side
      {
        position: "TE",
        label: "Y",
        role: "TE",
        x: 22,
        y: LINE_OF_SCRIMMAGE_Y,
      },
      // Twins right - 2 WR
      {
        position: "WR",
        label: "Z",
        role: "WR",
        x: 48,
        y: LINE_OF_SCRIMMAGE_Y,
      },
      {
        position: "WR",
        label: "H",
        role: "WR",
        x: 38,
        y: 18.5, // Slot
      },
      // Single WR left
      {
        position: "WR",
        label: "X",
        role: "WR",
        x: 5,
        y: LINE_OF_SCRIMMAGE_Y,
      },
    ],
  },

  {
    id: "strong-i",
    name: "Strong I",
    description: "I-formation with TE to strong side. Run-heavy.",
    personnel: "12",
    category: "under-center",
    playerPositions: [
      // QB - Under center
      {
        position: "QB",
        label: "Q",
        role: "QB",
        x: CENTER_X,
        y: 18.5,
      },
      // FB - 6 yards deep
      {
        position: "FB",
        label: "F",
        role: "FB",
        x: CENTER_X,
        y: 23.5,
      },
      // RB - 8 yards deep
      {
        position: "RB",
        label: "R",
        role: "RB",
        x: CENTER_X,
        y: 25.5,
      },
      // TE - Right side (strong side)
      {
        position: "TE",
        label: "Y",
        role: "TE",
        x: 32,
        y: LINE_OF_SCRIMMAGE_Y,
      },
      // WR Left
      {
        position: "WR",
        label: "X",
        role: "WR",
        x: 5,
        y: LINE_OF_SCRIMMAGE_Y,
      },
      // WR Right (flanker)
      {
        position: "WR",
        label: "Z",
        role: "WR",
        x: 43,
        y: LINE_OF_SCRIMMAGE_Y,
      },
    ],
  },

  // ===== PISTOL FORMATIONS =====
  {
    id: "pistol-wing",
    name: "Pistol Wing",
    description: "Pistol with wing TE. Read option favorite.",
    personnel: "12",
    category: "pistol",
    playerPositions: [
      // QB - 4 yards deep (pistol depth)
      {
        position: "QB",
        label: "Q",
        role: "QB",
        x: CENTER_X,
        y: 21.5,
      },
      // RB - Directly behind QB at 6 yards
      {
        position: "RB",
        label: "R",
        role: "RB",
        x: CENTER_X,
        y: 23.5,
      },
      // Wing TE right
      {
        position: "TE",
        label: "Y",
        role: "TE",
        x: 36,
        y: 18.5, // 1 yard off LOS
      },
      // TE Left on LOS
      {
        position: "TE",
        label: "U",
        role: "TE",
        x: 22,
        y: LINE_OF_SCRIMMAGE_Y,
      },
      // WR Left
      {
        position: "WR",
        label: "X",
        role: "WR",
        x: 5,
        y: LINE_OF_SCRIMMAGE_Y,
      },
      // WR Right
      {
        position: "WR",
        label: "Z",
        role: "WR",
        x: 48,
        y: LINE_OF_SCRIMMAGE_Y,
      },
    ],
  },

  // ===== SPECIALTY FORMATIONS =====
  {
    id: "goal-line-jumbo",
    name: "Goal Line Jumbo",
    description: "Heavy formation with extra blockers. Power run at goal line.",
    personnel: "22", // 2 RB, 2 TE
    category: "specialty",
    playerPositions: [
      // QB - Under center
      {
        position: "QB",
        label: "Q",
        role: "QB",
        x: CENTER_X,
        y: 18.5,
      },
      // FB - 4 yards deep (closer for goal line)
      {
        position: "FB",
        label: "F",
        role: "FB",
        x: CENTER_X - 3,
        y: 21.5,
      },
      // RB - 6 yards deep
      {
        position: "RB",
        label: "R",
        role: "RB",
        x: CENTER_X + 3,
        y: 23.5,
      },
      // TE Left
      {
        position: "TE",
        label: "Y",
        role: "TE",
        x: 22,
        y: LINE_OF_SCRIMMAGE_Y,
      },
      // TE Right
      {
        position: "TE",
        label: "U",
        role: "TE",
        x: 32,
        y: LINE_OF_SCRIMMAGE_Y,
      },
      // WR Right (single)
      {
        position: "WR",
        label: "Z",
        role: "WR",
        x: 48,
        y: LINE_OF_SCRIMMAGE_Y,
      },
    ],
  },

  {
    id: "wildcat",
    name: "Wildcat",
    description: "Direct snap to RB. QB motions or splits out wide.",
    personnel: "11",
    category: "specialty",
    playerPositions: [
      // RB takes snap - under center position
      {
        position: "RB",
        label: "R",
        role: "RB",
        x: CENTER_X,
        y: 18.5,
      },
      // QB split out as WR
      {
        position: "QB",
        label: "Q",
        role: "WR", // QB as receiver
        x: 48,
        y: LINE_OF_SCRIMMAGE_Y,
      },
      // FB - 6 yards deep
      {
        position: "FB",
        label: "F",
        role: "FB",
        x: CENTER_X - 5,
        y: 23.5,
      },
      // 3 WR
      {
        position: "WR",
        label: "X",
        role: "WR",
        x: 5,
        y: LINE_OF_SCRIMMAGE_Y,
      },
      {
        position: "WR",
        label: "H",
        role: "WR",
        x: 18,
        y: 18.5,
      },
      {
        position: "WR",
        label: "Z",
        role: "WR",
        x: 38,
        y: 18.5,
      },
    ],
  },
];

/**
 * Get template by ID
 */
export function getFormationTemplate(
  id: string
): FormationTemplate | undefined {
  return FORMATION_TEMPLATES.find((template) => template.id === id);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(
  category: FormationTemplate["category"]
): FormationTemplate[] {
  return FORMATION_TEMPLATES.filter(
    (template) => template.category === category
  );
}

/**
 * Get templates by personnel grouping
 */
export function getTemplatesByPersonnel(
  personnel: string
): FormationTemplate[] {
  return FORMATION_TEMPLATES.filter(
    (template) => template.personnel === personnel
  );
}

/**
 * Get all template names for dropdown
 */
export function getAllTemplateNames(): Array<{ id: string; name: string }> {
  return FORMATION_TEMPLATES.map((template) => ({
    id: template.id,
    name: template.name,
  }));
}
