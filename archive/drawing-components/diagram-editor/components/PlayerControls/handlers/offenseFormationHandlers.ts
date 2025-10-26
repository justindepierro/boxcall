/**
 * Offense Formation Handlers
 * Functions for creating and managing offensive formations
 */

import type { Player } from "../../../types/Player";
import type { ProfessionalPixiEngine } from "../../../core/ProfessionalPixiEngine";
import type { Alignment, OffenseFormationType } from "../types";
import { getCenterXForAlignment } from "../utils/formationUtils";

/**
 * Execute the appropriate offensive formation based on type
 */
export function executeOffenseFormation(
  formationType: OffenseFormationType,
  alignment: Alignment,
  app: ProfessionalPixiEngine | null,
  addPlayer: (player: Player) => void
): void {
  switch (formationType) {
    case "spread2x2":
      executeSpread2x2Formation(alignment, app, addPlayer);
      break;
    case "spread3x1Right":
      executeSpread3x1RightFormation(alignment, app, addPlayer);
      break;
    case "spread3x1Left":
      executeSpread3x1LeftFormation(alignment, app, addPlayer);
      break;
  }
}

/**
 * Execute Spread 2x2 formation (balanced 2 WRs each side)
 * Standard spread formation below line of scrimmage:
 * LOS -  WR           LT LG [C] RG RT           WR
 * 1yd -     WR                                WR
 * 4yd -                     RB QB
 */
function executeSpread2x2Formation(
  alignment: Alignment,
  app: ProfessionalPixiEngine | null,
  addPlayer: (player: Player) => void
): void {
  const losYard = app?.fieldLayer?.getLineOfScrimmage() || 25;
  const fieldWidth = app?.coordinates.fieldWidth || 53.333;

  // Calculate center X based on alignment (hash marks)
  const centerX = getCenterXForAlignment(alignment, fieldWidth);

  // All players are positioned BELOW (higher Y value) the line of scrimmage
  // Line of scrimmage is at losYard, offense is at losYard + offset (towards bottom of field)

  const formationPlayers: Omit<Player, "id">[] = [
    // OFFENSIVE LINE (5 players) - ON the line of scrimmage
    {
      x: centerX,
      y: losYard + 0.5,
      jerseyNumber: "C",
      team: "offense",
      position: "center",
    }, // Center (square) - positioned at hash
    {
      x: centerX - 1.5,
      y: losYard + 0.5,
      jerseyNumber: "LG",
      team: "offense",
    }, // Left Guard
    {
      x: centerX + 1.5,
      y: losYard + 0.5,
      jerseyNumber: "RG",
      team: "offense",
    }, // Right Guard
    { x: centerX - 3, y: losYard + 0.5, jerseyNumber: "LT", team: "offense" }, // Left Tackle
    { x: centerX + 3, y: losYard + 0.5, jerseyNumber: "RT", team: "offense" }, // Right Tackle

    // OUTSIDE WIDE RECEIVERS (2 players) - ON the line, split out wide near sidelines
    { x: 6, y: losYard + 0.5, jerseyNumber: "WR", team: "offense" }, // Left WR (near left sideline)
    {
      x: fieldWidth - 6,
      y: losYard + 0.5,
      jerseyNumber: "WR",
      team: "offense",
    }, // Right WR (near right sideline)

    // SLOT RECEIVERS (2 players) - 1 yard back from LOS, inside the outside WRs
    { x: 12, y: losYard + 1.5, jerseyNumber: "WR", team: "offense" }, // Left Slot
    {
      x: fieldWidth - 12,
      y: losYard + 1.5,
      jerseyNumber: "WR",
      team: "offense",
    }, // Right Slot

    // BACKFIELD (2 players) - 4 yards behind the line (shotgun)
    { x: centerX, y: losYard + 4.5, jerseyNumber: "QB", team: "offense" }, // Quarterback (directly behind center at hash)
    {
      x: centerX - 2.5,
      y: losYard + 4.5,
      jerseyNumber: "RB",
      team: "offense",
    }, // Running Back (offset left from QB)
  ];

  // Add all players with unique IDs and small time offsets
  formationPlayers.forEach((playerData, index) => {
    setTimeout(() => {
      const newPlayer: Player = {
        ...playerData,
        id: `offense-formation-${Date.now()}-${index}`,
      };
      addPlayer(newPlayer);
    }, index * 10); // Slight delay between each player for smooth addition
  });

  console.log(
    `🏈 Added full offensive formation (11 players) - Spread 2x2 shotgun below LOS at yard ${losYard}, alignment: ${alignment}`
  );
}

/**
 * Execute Spread 3x1 Right formation
 * Move left slot WR to right side between right slot and RT
 * RB switches to right side of QB
 */
function executeSpread3x1RightFormation(
  alignment: Alignment,
  app: ProfessionalPixiEngine | null,
  addPlayer: (player: Player) => void
): void {
  const losYard = app?.fieldLayer?.getLineOfScrimmage() || 25;
  const fieldWidth = app?.coordinates.fieldWidth || 53.333;

  // Calculate center X based on alignment (hash marks)
  const centerX = getCenterXForAlignment(alignment, fieldWidth);

  const formationPlayers: Omit<Player, "id">[] = [
    // OFFENSIVE LINE (5 players) - ON the line of scrimmage
    {
      x: centerX,
      y: losYard + 0.5,
      jerseyNumber: "C",
      team: "offense",
      position: "center",
    }, // Center (square) - positioned at hash
    {
      x: centerX - 1.5,
      y: losYard + 0.5,
      jerseyNumber: "LG",
      team: "offense",
    },
    {
      x: centerX + 1.5,
      y: losYard + 0.5,
      jerseyNumber: "RG",
      team: "offense",
    },
    { x: centerX - 3, y: losYard + 0.5, jerseyNumber: "LT", team: "offense" },
    { x: centerX + 3, y: losYard + 0.5, jerseyNumber: "RT", team: "offense" },

    // LEFT SIDE - Single WR on the line
    { x: 6, y: losYard + 0.5, jerseyNumber: "WR", team: "offense" },

    // RIGHT SIDE - 3 WRs (trips)
    {
      x: fieldWidth - 6,
      y: losYard + 0.5,
      jerseyNumber: "WR",
      team: "offense",
    }, // Outside WR on line
    {
      x: fieldWidth - 12,
      y: losYard + 1.5,
      jerseyNumber: "WR",
      team: "offense",
    }, // Slot WR off line
    {
      x: fieldWidth - 18,
      y: losYard + 1.5,
      jerseyNumber: "WR",
      team: "offense",
    }, // Inside slot WR off line (between slot and RT)

    // BACKFIELD (2 players) - 4 yards behind the line (shotgun)
    { x: centerX, y: losYard + 4.5, jerseyNumber: "QB", team: "offense" }, // QB directly behind center at hash
    {
      x: centerX + 2.5,
      y: losYard + 4.5,
      jerseyNumber: "RB",
      team: "offense",
    }, // RB to right of QB
  ];

  formationPlayers.forEach((playerData, index) => {
    setTimeout(() => {
      const newPlayer: Player = {
        ...playerData,
        id: `offense-formation-${Date.now()}-${index}`,
      };
      addPlayer(newPlayer);
    }, index * 10);
  });

  console.log(
    `🏈 Added full offensive formation (11 players) - Spread 3x1 Right at yard ${losYard}, alignment: ${alignment}`
  );
}

/**
 * Execute Spread 3x1 Left formation
 * Move right slot WR to left side between left slot and LT
 * RB stays on left side of QB
 */
function executeSpread3x1LeftFormation(
  alignment: Alignment,
  app: ProfessionalPixiEngine | null,
  addPlayer: (player: Player) => void
): void {
  const losYard = app?.fieldLayer?.getLineOfScrimmage() || 25;
  const fieldWidth = app?.coordinates.fieldWidth || 53.333;

  // Calculate center X based on alignment (hash marks)
  const centerX = getCenterXForAlignment(alignment, fieldWidth);

  const formationPlayers: Omit<Player, "id">[] = [
    // OFFENSIVE LINE (5 players) - ON the line of scrimmage
    {
      x: centerX,
      y: losYard + 0.5,
      jerseyNumber: "C",
      team: "offense",
      position: "center",
    }, // Center (square) - positioned at hash
    {
      x: centerX - 1.5,
      y: losYard + 0.5,
      jerseyNumber: "LG",
      team: "offense",
    },
    {
      x: centerX + 1.5,
      y: losYard + 0.5,
      jerseyNumber: "RG",
      team: "offense",
    },
    { x: centerX - 3, y: losYard + 0.5, jerseyNumber: "LT", team: "offense" },
    { x: centerX + 3, y: losYard + 0.5, jerseyNumber: "RT", team: "offense" },

    // LEFT SIDE - 3 WRs (trips)
    { x: 6, y: losYard + 0.5, jerseyNumber: "WR", team: "offense" }, // Outside WR on line
    { x: 12, y: losYard + 1.5, jerseyNumber: "WR", team: "offense" }, // Slot WR off line
    { x: 18, y: losYard + 1.5, jerseyNumber: "WR", team: "offense" }, // Inside slot WR off line (between slot and LT)

    // RIGHT SIDE - Single WR on the line
    {
      x: fieldWidth - 6,
      y: losYard + 0.5,
      jerseyNumber: "WR",
      team: "offense",
    },

    // BACKFIELD (2 players) - 4 yards behind the line (shotgun)
    { x: centerX, y: losYard + 4.5, jerseyNumber: "QB", team: "offense" }, // QB directly behind center at hash
    {
      x: centerX - 2.5,
      y: losYard + 4.5,
      jerseyNumber: "RB",
      team: "offense",
    }, // RB to left of QB
  ];

  formationPlayers.forEach((playerData, index) => {
    setTimeout(() => {
      const newPlayer: Player = {
        ...playerData,
        id: `offense-formation-${Date.now()}-${index}`,
      };
      addPlayer(newPlayer);
    }, index * 10);
  });

  console.log(
    `🏈 Added full offensive formation (11 players) - Spread 3x1 Left at yard ${losYard}, alignment: ${alignment}`
  );
}
