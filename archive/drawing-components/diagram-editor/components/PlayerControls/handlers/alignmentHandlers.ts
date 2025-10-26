/**
 * Alignment Handlers
 * Functions for handling formation alignment changes
 */

import type { Player } from "../../../types/Player";
import type { ProfessionalPixiEngine } from "../../../core/ProfessionalPixiEngine";
import type { Alignment } from "../types";
import {
  getCenterXForAlignment,
  getReceiverPositions,
  get3x1ReceiverPositions,
} from "../utils/formationUtils";

/**
 * Move existing formation when alignment changes
 * This handler repositions all players (offense and defense) to a new hash mark
 */
export function handleAlignmentChange(
  newAlignment: Alignment,
  app: ProfessionalPixiEngine | null,
  players: Player[],
  setInternalAlignment: (alignment: Alignment) => void
): void {
  if (!app?.playersLayer || !app?.coordinates) return;

  const fieldWidth = app.coordinates.fieldWidth;
  const targetCenterX = getCenterXForAlignment(newAlignment, fieldWidth);

  // Find the center player (position === "center")
  const centerPlayer = players.find(
    (p) => p.team === "offense" && p.position === "center"
  );

  if (!centerPlayer) {
    // No center on field, just update state
    setInternalAlignment(newAlignment);
    return;
  }

  // Calculate offset based on where the center ACTUALLY is
  const currentCenterX = centerPlayer.x;
  const offsetX = targetCenterX - currentCenterX;

  // Find tackles for receiver positioning
  const leftTackle = players.find((p) => p.jerseyNumber === "LT");
  const rightTackle = players.find((p) => p.jerseyNumber === "RT");

  if (!leftTackle || !rightTackle) {
    // No tackles found, skip receiver positioning
    setInternalAlignment(newAlignment);
    return;
  }

  const newLTX = leftTackle.x + offsetX;
  const newRTX = rightTackle.x + offsetX;

  // Calculate receiver positions based on new alignment and tackle positions
  const receiverPos = getReceiverPositions(
    newAlignment,
    fieldWidth,
    newLTX,
    newRTX
  );

  // Get all offensive players
  const oLinePlayers: Player[] = [];
  const backfieldPlayers: Player[] = [];
  const receivers: Player[] = [];

  players.forEach((p) => {
    if (p.team !== "offense") return;

    // Categorize players
    if (
      p.position === "center" ||
      p.jerseyNumber === "LG" ||
      p.jerseyNumber === "RG" ||
      p.jerseyNumber === "LT" ||
      p.jerseyNumber === "RT"
    ) {
      oLinePlayers.push(p);
    } else if (p.jerseyNumber === "QB" || p.jerseyNumber === "RB") {
      backfieldPlayers.push(p);
    } else if (p.jerseyNumber === "WR") {
      receivers.push(p);
    }
  });

  // Move O-Line and backfield by offset
  [...oLinePlayers, ...backfieldPlayers].forEach((player) => {
    const newX = player.x + offsetX;
    app.playersLayer!.updatePlayer(player.id, { x: newX });
  });

  // Reposition receivers to appropriate splits
  // Sort receivers by current X position to identify left vs right
  const sortedReceivers = [...receivers].sort((a, b) => a.x - b.x);

  if (sortedReceivers.length === 4) {
    // Determine if this is 3x1 or 2x2 based on distribution
    const leftOfCenter = sortedReceivers.filter((r) => r.x < targetCenterX);
    const rightOfCenter = sortedReceivers.filter((r) => r.x >= targetCenterX);
    const is3x1 = leftOfCenter.length === 3 || rightOfCenter.length === 3;

    if (is3x1) {
      // 3x1 formation - 3 on one side, 1 on the other
      const threeToLeft = leftOfCenter.length === 3;

      // Use specialized 3x1 positioning
      const pos3x1 = get3x1ReceiverPositions(
        newAlignment,
        fieldWidth,
        newLTX,
        newRTX,
        threeToLeft
      );

      if (threeToLeft) {
        // 3 on left, 1 on right
        app.playersLayer!.updatePlayer(sortedReceivers[0].id, {
          x: pos3x1.left1,
        }); // Leftmost outside
        app.playersLayer!.updatePlayer(sortedReceivers[1].id, {
          x: pos3x1.left2,
        }); // Left middle
        app.playersLayer!.updatePlayer(sortedReceivers[2].id, {
          x: pos3x1.left3,
        }); // Left inside
        app.playersLayer!.updatePlayer(sortedReceivers[3].id, {
          x: pos3x1.single,
        }); // Single right
      } else {
        // 1 on left, 3 on right
        app.playersLayer!.updatePlayer(sortedReceivers[0].id, {
          x: pos3x1.single,
        }); // Single left
        app.playersLayer!.updatePlayer(sortedReceivers[1].id, {
          x: pos3x1.right3,
        }); // Right inside
        app.playersLayer!.updatePlayer(sortedReceivers[2].id, {
          x: pos3x1.right2,
        }); // Right middle
        app.playersLayer!.updatePlayer(sortedReceivers[3].id, {
          x: pos3x1.right1,
        }); // Rightmost outside
      }
    } else {
      // 2x2 formation - 2 on each side
      app.playersLayer!.updatePlayer(sortedReceivers[0].id, {
        x: receiverPos.leftOutside,
      }); // Leftmost outside
      app.playersLayer!.updatePlayer(sortedReceivers[1].id, {
        x: receiverPos.leftSlot,
      }); // Left slot
      app.playersLayer!.updatePlayer(sortedReceivers[2].id, {
        x: receiverPos.rightSlot,
      }); // Right slot
      app.playersLayer!.updatePlayer(sortedReceivers[3].id, {
        x: receiverPos.rightOutside,
      }); // Rightmost outside
    }
  }

  // Move defensive players by the same offset to follow the offense
  const defensivePlayers = players.filter((p) => p.team === "defense");
  defensivePlayers.forEach((player) => {
    const newX = player.x + offsetX;
    app.playersLayer!.updatePlayer(player.id, { x: newX });
  });

  // Update the state
  setInternalAlignment(newAlignment);

  console.log(
    `📐 Shifted formation to ${newAlignment} hash (Center: ${currentCenterX.toFixed(2)} → ${targetCenterX.toFixed(2)}, Offense & Defense repositioned)`
  );
}
