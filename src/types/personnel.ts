/**
 * Personnel Settings Types and Data Structures
 *
 * Manages customizable personnel groupings for football teams
 */

export type PersonnelPosition = {
  id: string;
  label: string; // e.g., "WR 1", "QB", "LOT"
  position: string; // e.g., "Wide Receiver", "Quarterback", "Left Offensive Tackle"
  isLocked?: boolean; // QB and 5 linemen are typically locked
};

export type PersonnelGrouping = {
  id: string;
  name: string; // e.g., "Regular", "Empty", "Trips Right"
  positions: PersonnelPosition[];
  isDefault?: boolean; // Only one grouping can be default
  createdAt: Date;
  updatedAt: Date;
};

export type PersonnelSettings = {
  groupings: PersonnelGrouping[];
  activeGroupingId: string;
};

// Default personnel positions (11 players)
export const DEFAULT_PERSONNEL_POSITIONS: Omit<PersonnelPosition, "id">[] = [
  { label: "QB", position: "Quarterback", isLocked: true },
  { label: "LOT", position: "Left Offensive Tackle", isLocked: true },
  { label: "LOG", position: "Left Offensive Guard", isLocked: true },
  { label: "C", position: "Center", isLocked: true },
  { label: "ROG", position: "Right Offensive Guard", isLocked: true },
  { label: "ROT", position: "Right Offensive Tackle", isLocked: true },
  { label: "RB", position: "Running Back" },
  { label: "TE 1", position: "Tight End" },
  { label: "WR 1", position: "Wide Receiver" },
  { label: "WR 2", position: "Wide Receiver" },
  { label: "WR 3", position: "Wide Receiver" },
];

// Common personnel naming variations
export const PERSONNEL_NAMING_PRESETS = {
  traditional: {
    QB: "QB",
    LOT: "LT",
    LOG: "LG",
    C: "C",
    ROG: "RG",
    ROT: "RT",
    RB: "RB",
    TE: "TE",
    WR: "WR",
  },
  xy: {
    QB: "QB",
    LOT: "LT",
    LOG: "LG",
    C: "C",
    ROG: "RG",
    ROT: "RT",
    RB: "RB",
    TE: "Y",
    WR: "X",
  },
  lr: {
    QB: "QB",
    LOT: "LT",
    LOG: "LG",
    C: "C",
    ROG: "RG",
    ROT: "RT",
    RB: "RB",
    TE: "L",
    WR: "R",
  },
  numbers: {
    QB: "QB",
    LOT: "LT",
    LOG: "LG",
    C: "C",
    ROG: "RG",
    ROT: "RT",
    RB: "RB",
    TE: "TE",
    WR: "WR",
  },
} as const;

export type PersonnelNamingPreset = keyof typeof PERSONNEL_NAMING_PRESETS;
