/**
 * Defense Formation Handlers
 * Functions for creating and managing defensive formations
 */

import type { Player } from "../../../types/Player";
import type { DiagramPixiApp } from "../../../core/PixiApp";
import type { Alignment, DefenseFormationType } from "../types";
import {
  createNickel425Formation,
  getCenterXForAlignment as getDefenseCenterX,
  convertToPlayers,
} from "@features/defense/schemes";

/**
 * Detect current offensive alignment based on center position
 * Returns the hash alignment that the offense is actually on
 */
export function detectOffensiveAlignment(
  players: Player[],
  app: DiagramPixiApp | null,
  selectedAlignment: Alignment
): Alignment {
  const centerPlayer = players.find(
    (p) => p.team === "offense" && p.position === "center"
  );

  if (!centerPlayer) {
    // No center found, use selected alignment as fallback
    return selectedAlignment;
  }

  const fieldWidth = app?.coordinates.fieldWidth || 53.333;
  const fieldCenter = fieldWidth / 2; // 26.666 yards
  const hashOffset = 6.17;
  const leftHashX = fieldCenter - hashOffset; // ~20.5 yards
  const rightHashX = fieldCenter + hashOffset; // ~32.8 yards

  // Determine which hash the center is closest to
  const distToLeft = Math.abs(centerPlayer.x - leftHashX);
  const distToMiddle = Math.abs(centerPlayer.x - fieldCenter);
  const distToRight = Math.abs(centerPlayer.x - rightHashX);

  const minDist = Math.min(distToLeft, distToMiddle, distToRight);

  if (minDist === distToLeft) return "left";
  if (minDist === distToRight) return "right";
  return "middle";
}

/**
 * Execute the appropriate defensive formation based on type
 */
export function executeDefenseFormation(
  formationType: DefenseFormationType,
  alignment: Alignment,
  app: DiagramPixiApp | null,
  addPlayer: (player: Player) => void
): void {
  switch (formationType) {
    case "nickel425":
      executeNickel425Formation(alignment, app, addPlayer);
      break;
  }
}

/**
 * Execute Nickel 4-2-5 Defense (vs 2x2 Spread)
 * Positions above the LOS to defend against spread formations
 */
function executeNickel425Formation(
  alignment: Alignment,
  app: DiagramPixiApp | null,
  addPlayer: (player: Player) => void
): void {
  if (!app) return;

  const losYard = app.fieldLayer?.getLineOfScrimmage() || 25;
  const fieldWidth = 53.333;
  const centerX = getDefenseCenterX(alignment, fieldWidth);

  // Create Nickel 4-2-5 defensive formation using extracted module
  const formationPositions = createNickel425Formation({
    centerX,
    losY: losYard,
    fieldWidth,
  });

  // Convert to Player objects with unique IDs
  const formationPlayers = convertToPlayers(formationPositions);

  // Add players to field with staggered timing for visual effect
  formationPlayers.forEach((player, index) => {
    setTimeout(() => {
      addPlayer(player);
    }, index * 10);
  });

  console.log(
    `🛡️ Added Nickel 4-2-5 Defense at LOS: ${losYard}, Alignment: ${alignment}`
  );
}
