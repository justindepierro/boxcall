import React from "react";
import { useDiagramStore } from "../stores/diagramStore";
import type { Player, TeamSide } from "../types/Player";
import type { DiagramPixiApp } from "../core/PixiApp";
import {
  alignPlayersHorizontal,
  alignPlayersVertical,
  distributePlayersHorizontal,
  distributePlayersVertical,
  spacePlayersUniformHorizontal,
  spacePlayersUniformVertical,
} from "../utils/alignmentUtils";
import { analyzeFormation } from "@features/defense/analyzers/formationAnalyzer";
import type { FormationAnalysis } from "@features/defense/types";
import {
  createNickel425Formation,
  getCenterXForAlignment as getDefenseCenterX,
  convertToPlayers,
} from "@features/defense/schemes";
import { adjustCoverage } from "@features/defense/engines";

interface PlayerControlsProps {
  app: DiagramPixiApp | null;
  externalAlignment?: "left" | "middle" | "right";
}

/**
 * Player Controls - Sidebar UI for adding/removing players
 */
export const PlayerControls: React.FC<PlayerControlsProps> = ({
  app,
  externalAlignment,
}) => {
  const { players, addPlayer, removePlayer, selectedPlayerId, clearPlayers } =
    useDiagramStore();

  // Count selected players (for multi-select support)
  const selectedCount = selectedPlayerId ? 1 : 0;

  // Formation dropdown state
  const [isFormationDropdownOpen, setIsFormationDropdownOpen] =
    React.useState(false);
  const [isDefenseDropdownOpen, setIsDefenseDropdownOpen] =
    React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const defenseDropdownRef = React.useRef<HTMLDivElement>(null);

  // Formation confirmation dialog state
  const [showFormationConfirm, setShowFormationConfirm] = React.useState(false);
  const [pendingFormationAction, setPendingFormationAction] = React.useState<
    (() => void) | null
  >(null);
  const [confirmTitle, setConfirmTitle] = React.useState("⚠️ Confirm Action");
  const [confirmMessage, setConfirmMessage] = React.useState("");

  // Alert modal state (for blocking scenarios)
  const [showAlert, setShowAlert] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState("");

  // Alignment selection state - use external alignment if provided
  const [internalAlignment, setInternalAlignment] = React.useState<
    "left" | "middle" | "right"
  >("middle");

  // Use external alignment from header if provided, otherwise use internal state
  const selectedAlignment = externalAlignment || internalAlignment;

  // Track previous external alignment to detect changes
  const prevExternalAlignment = React.useRef<
    "left" | "middle" | "right" | undefined
  >(externalAlignment);

  // Formation analysis state
  const [formationAnalysis, setFormationAnalysis] =
    React.useState<FormationAnalysis | null>(null);

  // Analyze formation whenever players or alignment changes
  React.useEffect(() => {
    if (players.length > 0 && app) {
      try {
        const analysis = analyzeFormation(players, selectedAlignment);
        setFormationAnalysis(analysis);

        // Log formation data for debugging
        console.log("📊 Formation Analysis:", {
          type: analysis.type,
          strength: analysis.strengthSide,
          receiversLeft: analysis.receiversLeft,
          receiversRight: analysis.receiversRight,
          boxCount: analysis.boxCount,
          rbPosition: analysis.rbPosition,
          tightEnds: analysis.tightEndAnalysis,
        });
      } catch (error) {
        console.error("Formation analysis error:", error);
        setFormationAnalysis(null);
      }
    } else {
      setFormationAnalysis(null);
    }
  }, [players, selectedAlignment, app]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsFormationDropdownOpen(false);
      }
      if (
        defenseDropdownRef.current &&
        !defenseDropdownRef.current.contains(event.target as Node)
      ) {
        setIsDefenseDropdownOpen(false);
      }
    };

    if (isFormationDropdownOpen || isDefenseDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isFormationDropdownOpen, isDefenseDropdownOpen]);

  // Count offensive players
  const offensivePlayerCount = players.filter(
    (p) => p.team === "offense"
  ).length;

  // Count defensive players
  const defensivePlayerCount = players.filter(
    (p) => p.team === "defense"
  ).length;

  // Helper to show alert modal
  const showAlertModal = (message: string) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  // Helper to show confirm modal
  const showConfirmModal = (
    message: string,
    onConfirm: () => void,
    title: string = "⚠️ Confirm Action"
  ) => {
    setConfirmTitle(title);
    setConfirmMessage(message);
    setShowFormationConfirm(true);
    setPendingFormationAction(() => onConfirm);
  };

  const _handleAddPlayer = (team: TeamSide) => {
    const number = players.filter((p) => p.team === team).length + 1;

    // Try to place next to the last dropped player
    let x: number;
    let y: number;

    if (app?.playersLayer) {
      const lastPos = app.playersLayer.getLastDroppedPosition();
      if (lastPos) {
        // Place 2 yards to the right of the last dropped player
        x = Math.min(app.coordinates.fieldWidth - 1, lastPos.x + 2.0);
        y = lastPos.y;
      } else {
        // Default: center of field with small offset for team
        const yOffset = team === "offense" ? 0 : 10;
        x = 26.666;
        y = 17.5 + yOffset;
      }
    } else {
      // Fallback if app not ready
      const yOffset = team === "offense" ? 0 : 10;
      x = 26.666;
      y = 17.5 + yOffset;
    }

    const newPlayer: Player = {
      id: `player-${Date.now()}`,
      x,
      y,
      jerseyNumber: number.toString(),
      team,
    };

    addPlayer(newPlayer);
  };

  /**
   * Add full offensive formation (11 players)
   * Standard spread formation below line of scrimmage:
   * LOS -  WR           LT LG [C] RG RT           WR
   * 1yd -     WR                                WR
   * 4yd -                     RB QB
   */
  const handleAddOffenseFormation = (
    formationType:
      | "spread2x2"
      | "spread3x1Right"
      | "spread3x1Left" = "spread2x2"
  ) => {
    // Check if already at 11 players - offer to replace formation
    if (offensivePlayerCount >= 11) {
      showConfirmModal(
        `⚠️ You already have a full formation (11 offensive players) on the field.\n\nChanging formations will remove all existing players and reset the formation.\n\nThis will also clear any routes, assignments, or drawings associated with these players.\n\nAre you sure you want to continue?`,
        () => {
          // Clear existing offensive players
          const offensivePlayers = players.filter((p) => p.team === "offense");
          offensivePlayers.forEach((p) => removePlayer(p.id));
          // Execute the formation based on type with current alignment
          executeFormation(formationType, selectedAlignment);
        },
        "⚠️ Replace Formation?"
      );
      setIsFormationDropdownOpen(false);
      return;
    }

    // Check if there are existing offensive players (but less than 11)
    if (offensivePlayerCount > 0 && offensivePlayerCount < 11) {
      showConfirmModal(
        `⚠️ Changing formations will remove all ${offensivePlayerCount} existing offensive player${offensivePlayerCount !== 1 ? "s" : ""}.\n\nThis will also clear any routes, assignments, or drawings associated with these players.\n\nAre you sure you want to continue?`,
        () => {
          // Clear existing offensive players
          const offensivePlayers = players.filter((p) => p.team === "offense");
          offensivePlayers.forEach((p) => removePlayer(p.id));
          // Execute the formation based on type with current alignment
          executeFormation(formationType, selectedAlignment);
        },
        "⚠️ Change Formation?"
      );
      setIsFormationDropdownOpen(false);
      return;
    }

    // No offensive players yet, proceed directly with current alignment
    executeFormation(formationType, selectedAlignment);
    setIsFormationDropdownOpen(false);
  };

  /**
   * Execute the appropriate formation based on type
   */
  const executeFormation = (
    formationType: "spread2x2" | "spread3x1Right" | "spread3x1Left",
    alignment: "left" | "middle" | "right"
  ) => {
    switch (formationType) {
      case "spread2x2":
        executeAddOffenseFormation(alignment);
        break;
      case "spread3x1Right":
        executeSpread3x1Right(alignment);
        break;
      case "spread3x1Left":
        executeSpread3x1Left(alignment);
        break;
    }
  };

  /**
   * Calculate center X position based on alignment
   */
  const getCenterXForAlignment = (
    alignment: "left" | "middle" | "right",
    fieldWidth: number
  ): number => {
    const fieldCenter = fieldWidth / 2; // 26.666 yards
    const hashOffset = 6.17; // NFL hash marks are 6.17 yards from center

    switch (alignment) {
      case "left":
        return fieldCenter - hashOffset; // Left hash: ~20.5 yards
      case "right":
        return fieldCenter + hashOffset; // Right hash: ~32.8 yards
      case "middle":
      default:
        return fieldCenter; // Center: 26.666 yards
    }
  };

  /**
   * Calculate receiver positions based on alignment and tackle positions
   */
  const getReceiverPositions = (
    alignment: "left" | "middle" | "right",
    fieldWidth: number,
    leftTackleX: number,
    rightTackleX: number
  ) => {
    const leftSideline = 0;
    const rightSideline = fieldWidth;
    const leftNumbers = fieldWidth * 0.15; // ~8 yards from left
    const rightNumbers = fieldWidth * 0.85; // ~45.3 yards from left

    if (alignment === "middle") {
      // Balanced - use current positions
      return {
        leftOutside: 6,
        leftSlot: 12,
        rightSlot: fieldWidth - 12,
        rightOutside: fieldWidth - 6,
      };
    } else if (alignment === "left") {
      // On left hash - right side is wide, left side is boundary
      return {
        // Boundary side (left) - tighter splits
        leftOutside: (leftSideline + leftNumbers) / 2, // Split sideline and numbers (~4 yards)
        leftSlot: (leftTackleX + (leftSideline + leftNumbers) / 2) / 2, // Split between LT and outside WR

        // Wide side (right) - wider splits
        rightOutside: rightNumbers, // Top of numbers (~45.3 yards)
        rightSlot: (rightTackleX + rightNumbers) / 2, // Split between RT and top of numbers
      };
    } else {
      // On right hash - left side is wide, right side is boundary
      return {
        // Wide side (left) - wider splits
        leftOutside: leftNumbers, // Top of numbers (~8 yards)
        leftSlot: (leftTackleX + leftNumbers) / 2, // Split between LT and top of numbers

        // Boundary side (right) - tighter splits
        rightSlot: (rightTackleX + (rightSideline + rightNumbers) / 2) / 2, // Split between RT and outside WR
        rightOutside: (rightSideline + rightNumbers) / 2, // Split sideline and numbers (~49 yards)
      };
    }
  };

  /**
   * Calculate 3x1 receiver positions based on alignment and whether 3 is to field or boundary
   */
  const get3x1ReceiverPositions = (
    alignment: "left" | "middle" | "right",
    fieldWidth: number,
    leftTackleX: number,
    rightTackleX: number,
    threeToLeft: boolean // true if 3 receivers are on left, false if on right
  ) => {
    const leftNumbers = fieldWidth * 0.15; // ~8 yards from left
    const rightNumbers = fieldWidth * 0.85; // ~45.3 yards from left
    const leftSidelineHash = 1; // 1 yard from left sideline
    const rightSidelineHash = fieldWidth - 1; // 1 yard from right sideline
    const rightHash = fieldWidth / 2 + 6.17; // ~32.8 yards

    if (alignment === "middle") {
      // Middle - balanced splits
      if (threeToLeft) {
        // 3 left, 1 right
        const spacing = (leftNumbers - leftTackleX) / 3;
        return {
          left1: leftNumbers, // Outside
          left2: leftNumbers - spacing, // Slot
          left3: leftNumbers - spacing * 2, // Inside slot
          single: fieldWidth - 6, // Single on right
        };
      } else {
        // 3 right, 1 left
        const spacing = (rightNumbers - rightTackleX) / 3;
        return {
          single: 6, // Single on left
          right3: rightTackleX + spacing, // Inside slot
          right2: rightTackleX + spacing * 2, // Slot
          right1: rightNumbers, // Outside
        };
      }
    } else if (alignment === "left") {
      // Left hash - right is wide side, left is boundary
      if (threeToLeft) {
        // 3 to BOUNDARY (left/short side)
        const outsideX = leftSidelineHash + 1; // 1 yard outside sideline hash = ~2 yards
        const spacing = (outsideX - leftTackleX) / 3;
        return {
          left1: outsideX, // Widest - 1 yard outside sideline hash
          left2: leftTackleX + spacing * 2, // Evenly spaced
          left3: leftTackleX + spacing, // Inside, evenly spaced
          single: rightNumbers, // Single to field: at the numbers (wider)
        };
      } else {
        // 3 to FIELD (right/wide side)
        const spacing = (rightNumbers - rightTackleX) / 3;
        return {
          single: rightHash - 3, // Single to boundary: 3 yards inside from numbers (between numbers and hash)
          right3: rightTackleX + spacing, // Inside slot, evenly spaced
          right2: rightTackleX + spacing * 2, // Slot, evenly spaced
          right1: rightNumbers, // Widest - top of numbers
        };
      }
    } else {
      // Right hash - left is wide side, right is boundary
      if (threeToLeft) {
        // 3 to FIELD (left/wide side)
        const spacing = (leftNumbers - leftTackleX) / 3;
        return {
          left1: leftNumbers, // Widest - top of numbers
          left2: leftTackleX + spacing * 2, // Slot, evenly spaced
          left3: leftTackleX + spacing, // Inside slot, evenly spaced
          single: rightHash - 3, // Single to boundary: 3 yards inside from numbers (between numbers and hash)
        };
      } else {
        // 3 to BOUNDARY (right/short side)
        const outsideX = rightSidelineHash - 1; // 1 yard outside sideline hash = ~52 yards
        const spacing = (outsideX - rightTackleX) / 3;
        return {
          single: leftNumbers, // Single to field: bottom of numbers
          right3: rightTackleX + spacing, // Inside, evenly spaced
          right2: rightTackleX + spacing * 2, // Evenly spaced
          right1: outsideX, // Widest - 1 yard outside sideline hash
        };
      }
    }
  };

  /**
   * Add full defensive formation (11 players)
   * Base Nickel 4-2-5 vs 2x2 Spread
   */
  const handleAddDefenseFormation = (
    formationType: "nickel425" = "nickel425"
  ) => {
    // Check if already at 11 defensive players
    if (defensivePlayerCount >= 11) {
      showConfirmModal(
        `⚠️ You already have a full defense (11 defensive players) on the field.\n\nChanging defensive formations will remove all existing defensive players and reset the formation.\n\nAre you sure you want to continue?`,
        () => {
          // Clear existing defensive players
          const defensivePlayers = players.filter((p) => p.team === "defense");
          defensivePlayers.forEach((p) => removePlayer(p.id));
          // Execute the formation
          executeDefenseFormation(formationType, selectedAlignment);
        },
        "⚠️ Replace Defense?"
      );
      setIsDefenseDropdownOpen(false);
      return;
    }

    // Check if there are existing defensive players (but less than 11)
    if (defensivePlayerCount > 0 && defensivePlayerCount < 11) {
      showConfirmModal(
        `⚠️ Changing defensive formations will remove all ${defensivePlayerCount} existing defensive player${defensivePlayerCount !== 1 ? "s" : ""}.\n\nAre you sure you want to continue?`,
        () => {
          // Clear existing defensive players
          const defensivePlayers = players.filter((p) => p.team === "defense");
          defensivePlayers.forEach((p) => removePlayer(p.id));
          // Execute the formation
          executeDefenseFormation(formationType, selectedAlignment);
        },
        "⚠️ Change Defense?"
      );
      setIsDefenseDropdownOpen(false);
      return;
    }

    // No defensive players yet, proceed directly
    executeDefenseFormation(formationType, selectedAlignment);
    setIsDefenseDropdownOpen(false);
  };

  /**
   * Execute defensive formation
   */
  const executeDefenseFormation = (
    formationType: "nickel425",
    alignment: "left" | "middle" | "right"
  ) => {
    switch (formationType) {
      case "nickel425":
        executeNickel425(alignment);
        break;
    }
  };

  /**
   * Execute Nickel 4-2-5 Defense (vs 2x2 Spread)
   * Positions above the LOS to defend against spread formations
   */
  const executeNickel425 = (
    alignment: "left" | "middle" | "right" = "middle"
  ) => {
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
  };

  /**
   * Auto-adjust defensive coverage based on offensive formation
   */
  const _handleAutoAdjustCoverage = () => {
    if (!app?.playersLayer || !formationAnalysis) {
      console.warn(
        "⚠️ Cannot adjust coverage: Missing app or formation analysis"
      );
      return;
    }

    // Get defensive players
    const defensivePlayers = players.filter((p) => p.team === "defense");

    if (defensivePlayers.length === 0) {
      console.warn("⚠️ Cannot adjust coverage: No defensive players on field");
      alert("⚠️ Please add a defensive formation first");
      return;
    }

    // Get field parameters
    const fieldWidth = 53.333;
    const centerX = getCenterXForAlignment(selectedAlignment, fieldWidth);
    const losY = app.fieldLayer?.getLineOfScrimmage() || 25;

    try {
      // Call coverage adjustment engine
      const result = adjustCoverage({
        formationAnalysis,
        defensivePlayers,
        centerX,
        losY,
        fieldWidth,
      });

      // Apply adjustments to players
      result.adjustments.forEach((adj) => {
        app.playersLayer!.updatePlayer(adj.playerId, {
          x: adj.newX,
          ...(adj.newY && { y: adj.newY }),
        });

        // Log each adjustment for debugging
        console.log(`  ✓ ${adj.reason}`);
      });

      // Show success message
      console.log(`✅ ${result.summary}`);
      console.log(`📞 Coverage Call: ${result.recommendedCoverage}`);

      alert(
        `✅ ${result.summary}\n📞 Recommended: ${result.recommendedCoverage}`
      );
    } catch (error) {
      console.error("❌ Coverage adjustment error:", error);
      alert("❌ Failed to adjust coverage. Check console for details.");
    }
  };

  /**
   * Move existing formation when alignment changes
   */
  const handleAlignmentChange = React.useCallback(
    (newAlignment: "left" | "middle" | "right") => {
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
        const rightOfCenter = sortedReceivers.filter(
          (r) => r.x >= targetCenterX
        );
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
    },
    [app, players]
  );

  // React to external alignment changes from the header toolbar
  React.useEffect(() => {
    // Only trigger movement if external alignment changed (not initial mount)
    if (
      externalAlignment &&
      prevExternalAlignment.current !== undefined &&
      prevExternalAlignment.current !== externalAlignment
    ) {
      console.log(
        `📐 External alignment changed: ${prevExternalAlignment.current} → ${externalAlignment}`
      );
      handleAlignmentChange(externalAlignment);
    }
    prevExternalAlignment.current = externalAlignment;
  }, [externalAlignment, handleAlignmentChange]);

  /**
   * Actually execute the Spread 2x2 formation creation
   */
  const executeAddOffenseFormation = (
    alignment: "left" | "middle" | "right" = "middle"
  ) => {
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
  };

  /**
   * Execute Spread 3x1 Right formation
   * Move left slot WR to right side between right slot and RT
   * RB switches to right side of QB
   */
  const executeSpread3x1Right = (
    alignment: "left" | "middle" | "right" = "middle"
  ) => {
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
  };

  /**
   * Execute Spread 3x1 Left formation
   * Move right slot WR to left side between left slot and LT
   * RB stays on left side of QB
   */
  const executeSpread3x1Left = (
    alignment: "left" | "middle" | "right" = "middle"
  ) => {
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
  };

  const _handleRemoveSelected = () => {
    if (selectedPlayerId) {
      removePlayer(selectedPlayerId);
      removePlayer(selectedPlayerId);
    }
  };

  const _handleClearAll = () => {
    showConfirmModal(
      "This will remove all players from the field. Are you sure?",
      () => clearPlayers(),
      "🗑️ Remove All Players"
    );
  };

  // Alignment handlers
  const handleAlign = (
    mode: "left" | "center" | "right" | "top" | "middle" | "bottom"
  ) => {
    if (!app?.playersLayer) return;

    const selectedIds = app.playersLayer.getSelectedPlayerIds();
    if (selectedIds.length < 2) {
      showAlertModal("Please select 2 or more players to align");
      return;
    }

    // Get selected players
    const selectedPlayers: Player[] = [];
    selectedIds.forEach((id: string) => {
      const sprite = app.playersLayer!.getPlayer(id);
      if (sprite) {
        selectedPlayers.push(sprite.getPlayer());
      }
    });

    // Apply alignment
    let aligned: Player[];
    if (mode === "left" || mode === "center" || mode === "right") {
      aligned = alignPlayersHorizontal(selectedPlayers, mode);
    } else {
      aligned = alignPlayersVertical(
        selectedPlayers,
        mode as "top" | "middle" | "bottom"
      );
    }

    // Update positions
    aligned.forEach((player) => {
      app.playersLayer!.updatePlayer(player.id, { x: player.x, y: player.y });
    });

    console.log(`📐 Aligned ${aligned.length} players: ${mode}`);
  };

  // Distribute handlers
  const handleDistribute = (direction: "horizontal" | "vertical") => {
    if (!app?.playersLayer) return;

    const selectedIds = app.playersLayer.getSelectedPlayerIds();
    if (selectedIds.length < 3) {
      showAlertModal("Please select 3 or more players to distribute");
      return;
    }

    // Get selected players
    const selectedPlayers: Player[] = [];
    selectedIds.forEach((id: string) => {
      const sprite = app.playersLayer!.getPlayer(id);
      if (sprite) {
        selectedPlayers.push(sprite.getPlayer());
      }
    });

    // Apply distribution
    const distributed =
      direction === "horizontal"
        ? distributePlayersHorizontal(selectedPlayers)
        : distributePlayersVertical(selectedPlayers);

    // Update positions
    distributed.forEach((player) => {
      app.playersLayer!.updatePlayer(player.id, { x: player.x, y: player.y });
    });

    console.log(`📏 Distributed ${distributed.length} players: ${direction}`);
  };

  // Uniform spacing handlers
  const handleUniformSpacing = (
    direction: "horizontal" | "vertical",
    spacing: number
  ) => {
    if (!app?.playersLayer) return;

    const selectedIds = app.playersLayer.getSelectedPlayerIds();
    if (selectedIds.length < 2) {
      showAlertModal(
        "Please select 2 or more players to apply uniform spacing"
      );
      return;
    }

    // Get selected players
    const selectedPlayers: Player[] = [];
    selectedIds.forEach((id: string) => {
      const sprite = app.playersLayer!.getPlayer(id);
      if (sprite) {
        selectedPlayers.push(sprite.getPlayer());
      }
    });

    // Apply uniform spacing
    const spaced =
      direction === "horizontal"
        ? spacePlayersUniformHorizontal(selectedPlayers, spacing)
        : spacePlayersUniformVertical(selectedPlayers, spacing);

    // Update positions
    spaced.forEach((player) => {
      app.playersLayer!.updatePlayer(player.id, { x: player.x, y: player.y });
    });

    console.log(
      `📐 Applied ${spacing} yard uniform spacing to ${spaced.length} players: ${direction}`
    );
  };

  const buttonBaseClasses =
    "w-full px-4 py-2 rounded-lg font-medium transition-all shadow-sm hover:shadow-md active:scale-95 text-sm";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-bold text-content-primary">Players</h2>
        <p className="text-xs text-content-secondary mt-1">
          {players.length} total • {selectedCount} selected
        </p>
      </div>

      {/* Controls */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Add Players Section */}
        <div>
          <h3 className="text-sm font-semibold text-content-primary mb-2">
            Add Players
          </h3>
          <div className="space-y-2">
            {/* Formation Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() =>
                  setIsFormationDropdownOpen(!isFormationDropdownOpen)
                }
                className={`${buttonBaseClasses} bg-blue-600 text-white hover:bg-blue-700 font-bold flex items-center justify-between`}
                title="Add Full Offensive Formation"
              >
                <span>🏈 Add Offense Formation</span>
                <span className="ml-2">
                  {isFormationDropdownOpen ? "▲" : "▼"}
                </span>
              </button>

              {/* Dropdown Menu */}
              {isFormationDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-surface-primary/95 dark:bg-surface-secondary/95 backdrop-blur-md border border-stroke rounded-lg shadow-2xl z-50 overflow-hidden">
                  <button
                    onClick={() => {
                      handleAddOffenseFormation("spread2x2");
                      setIsFormationDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-content-primary hover:bg-surface-secondary/50 transition-colors border-b border-stroke/50"
                  >
                    <div className="font-medium">Spread 2x2</div>
                    <div className="text-xs text-content-secondary">
                      Shotgun, 2 WR each side
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      handleAddOffenseFormation("spread3x1Right");
                      setIsFormationDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-content-primary hover:bg-surface-secondary/50 transition-colors border-b border-stroke/50"
                  >
                    <div className="font-medium">Spread 3x1 Right</div>
                    <div className="text-xs text-content-secondary">
                      Shotgun, 3 WR right, 1 WR left
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      handleAddOffenseFormation("spread3x1Left");
                      setIsFormationDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-content-primary hover:bg-surface-secondary/50 transition-colors"
                  >
                    <div className="font-medium">Spread 3x1 Left</div>
                    <div className="text-xs text-content-secondary">
                      Shotgun, 3 WR left, 1 WR right
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Defense Formation Dropdown */}
            <div className="relative" ref={defenseDropdownRef}>
              <button
                onClick={() => setIsDefenseDropdownOpen(!isDefenseDropdownOpen)}
                className={`${buttonBaseClasses} bg-error-600 text-white hover:bg-error-700 font-bold flex items-center justify-between`}
                title="Add Full Defensive Formation"
              >
                <span>🛡️ Add Defense Formation</span>
                <span className="ml-2">
                  {isDefenseDropdownOpen ? "▲" : "▼"}
                </span>
              </button>

              {/* Dropdown Menu */}
              {isDefenseDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-surface-primary/95 dark:bg-surface-secondary/95 backdrop-blur-md border border-stroke rounded-lg shadow-2xl z-50 overflow-hidden">
                  <button
                    onClick={() => {
                      handleAddDefenseFormation("nickel425");
                      setIsDefenseDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-content-primary hover:bg-surface-secondary/50 transition-colors"
                  >
                    <div className="font-medium">Nickel 4-2-5</div>
                    <div className="text-xs text-content-secondary">
                      4 DL, 2 LB, 5 DB vs Spread
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Add Center Button (keep this here as it's less commonly used) */}
            <button
              onClick={() => {
                const newPlayer: Player = {
                  id: `center-${Date.now()}`,
                  x: 26.666, // Center of field
                  y: 17.5,
                  jerseyNumber: "C",
                  team: "offense",
                  position: "center",
                };
                addPlayer(newPlayer);
              }}
              className={`${buttonBaseClasses} bg-success-600 text-white hover:bg-success-700`}
              title="Add Center (Square marker)"
            >
              ◼ Add Center
            </button>

            {/* Formation Analysis Display */}
            {formationAnalysis && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <div className="text-xs font-medium text-content-secondary mb-2">
                  📊 Formation Analysis
                </div>
                <div className="bg-surface-secondary/50 rounded-lg p-3 space-y-2">
                  {/* Formation Type Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-content-secondary">
                      Type:
                    </span>
                    <span className="px-2 py-1 rounded bg-blue-600/20 text-blue-400 font-bold text-xs">
                      {formationAnalysis.type.toUpperCase()}
                    </span>
                  </div>

                  {/* Receiver Distribution */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-content-secondary">Receivers:</span>
                    <span className="text-content-primary font-medium">
                      {formationAnalysis.receiversLeft}L /{" "}
                      {formationAnalysis.receiversRight}R
                    </span>
                  </div>

                  {/* Strength Side */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-content-secondary">Strength:</span>
                    <span
                      className={`font-bold ${
                        formationAnalysis.strengthSide === "left"
                          ? "text-error-400"
                          : formationAnalysis.strengthSide === "right"
                            ? "text-blue-400"
                            : "text-content-primary"
                      }`}
                    >
                      {formationAnalysis.strengthSide.toUpperCase()}
                    </span>
                  </div>

                  {/* Box Count */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-content-secondary">Box:</span>
                    <span className="text-content-primary font-medium">
                      {formationAnalysis.boxCount} players
                    </span>
                  </div>

                  {/* RB Position */}
                  {formationAnalysis.rbPosition !== "none" && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-content-secondary">RB:</span>
                      <span className="text-content-primary font-medium">
                        {formationAnalysis.rbPosition}
                      </span>
                    </div>
                  )}

                  {/* Tight End Info */}
                  {formationAnalysis.tightEndPresent &&
                    formationAnalysis.tightEndAnalysis && (
                      <div className="pt-2 border-t border-border/30">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-content-secondary">TEs:</span>
                          <span className="text-content-primary font-medium">
                            {formationAnalysis.tightEndAnalysis.count} total
                          </span>
                        </div>
                        {formationAnalysis.tightEndAnalysis.boxTECount > 0 && (
                          <div className="flex items-center justify-between text-xs mt-1">
                            <span className="text-content-secondary pl-2">
                              In Box:
                            </span>
                            <span className="text-success-400 font-medium">
                              {formationAnalysis.tightEndAnalysis.boxTECount}
                            </span>
                          </div>
                        )}
                        {formationAnalysis.tightEndAnalysis.splitTECount >
                          0 && (
                          <div className="flex items-center justify-between text-xs mt-1">
                            <span className="text-content-secondary pl-2">
                              Split:
                            </span>
                            <span className="text-warning-400 font-medium">
                              {formationAnalysis.tightEndAnalysis.splitTECount}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Align Section */}
        <div className="pt-4 border-t border-border">
          <h3 className="text-sm font-semibold text-content-primary mb-2">
            Align (2+ selected)
          </h3>
          <div className="space-y-2">
            {/* Horizontal alignment */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleAlign("left")}
                className="px-2 py-1.5 text-xs bg-surface-secondary hover:bg-surface-tertiary rounded border border-border transition-colors"
                title="Align Left"
              >
                ⫣ Left
              </button>
              <button
                onClick={() => handleAlign("center")}
                className="px-2 py-1.5 text-xs bg-surface-secondary hover:bg-surface-tertiary rounded border border-border transition-colors"
                title="Center Horizontal"
              >
                ⫯ Center
              </button>
              <button
                onClick={() => handleAlign("right")}
                className="px-2 py-1.5 text-xs bg-surface-secondary hover:bg-surface-tertiary rounded border border-border transition-colors"
                title="Align Right"
              >
                ⫤ Right
              </button>
            </div>
            {/* Vertical alignment */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleAlign("top")}
                className="px-2 py-1.5 text-xs bg-surface-secondary hover:bg-surface-tertiary rounded border border-border transition-colors"
                title="Align Top"
              >
                ⫪ Top
              </button>
              <button
                onClick={() => handleAlign("middle")}
                className="px-2 py-1.5 text-xs bg-surface-secondary hover:bg-surface-tertiary rounded border border-border transition-colors"
                title="Center Vertical"
              >
                ⊟ Middle
              </button>
              <button
                onClick={() => handleAlign("bottom")}
                className="px-2 py-1.5 text-xs bg-surface-secondary hover:bg-surface-tertiary rounded border border-border transition-colors"
                title="Align Bottom"
              >
                ⫫ Bottom
              </button>
            </div>
          </div>
        </div>

        {/* Distribute Section */}
        <div className="pt-4 border-t border-border">
          <h3 className="text-sm font-semibold text-content-primary mb-2">
            Distribute (3+ selected)
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDistribute("horizontal")}
              className="px-3 py-2 text-xs bg-surface-secondary hover:bg-surface-tertiary rounded border border-border transition-colors"
              title="Distribute Horizontal - Space evenly left to right"
            >
              ↔ Horizontal
            </button>
            <button
              onClick={() => handleDistribute("vertical")}
              className="px-3 py-2 text-xs bg-surface-secondary hover:bg-surface-tertiary rounded border border-border transition-colors"
              title="Distribute Vertical - Space evenly top to bottom"
            >
              ↕ Vertical
            </button>
          </div>
        </div>

        {/* Uniform Spacing Section */}
        <div className="pt-4 border-t border-border">
          <h3 className="text-sm font-semibold text-content-primary mb-2">
            Uniform Spacing (2+ selected)
          </h3>
          <p className="text-xs text-content-tertiary mb-2">
            Apply equal spacing between players
          </p>

          {/* Horizontal Spacing Buttons */}
          <div className="mb-2">
            <p className="text-xs font-medium text-content-secondary mb-1">
              Horizontal:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleUniformSpacing("horizontal", 1)}
                className="px-2 py-1.5 text-xs bg-surface-secondary hover:bg-surface-tertiary rounded border border-border transition-colors"
                title="1 yard spacing horizontally"
              >
                1 yd
              </button>
              <button
                onClick={() => handleUniformSpacing("horizontal", 1.5)}
                className="px-2 py-1.5 text-xs bg-surface-secondary hover:bg-surface-tertiary rounded border border-border transition-colors"
                title="1.5 yard spacing horizontally"
              >
                1.5 yd
              </button>
              <button
                onClick={() => handleUniformSpacing("horizontal", 2)}
                className="px-2 py-1.5 text-xs bg-surface-secondary hover:bg-surface-tertiary rounded border border-border transition-colors"
                title="2 yard spacing horizontally"
              >
                2 yd
              </button>
            </div>
          </div>

          {/* Vertical Spacing Buttons */}
          <div>
            <p className="text-xs font-medium text-content-secondary mb-1">
              Vertical:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleUniformSpacing("vertical", 1)}
                className="px-2 py-1.5 text-xs bg-surface-secondary hover:bg-surface-tertiary rounded border border-border transition-colors"
                title="1 yard spacing vertically"
              >
                1 yd
              </button>
              <button
                onClick={() => handleUniformSpacing("vertical", 1.5)}
                className="px-2 py-1.5 text-xs bg-surface-secondary hover:bg-surface-tertiary rounded border border-border transition-colors"
                title="1.5 yard spacing vertically"
              >
                1.5 yd
              </button>
              <button
                onClick={() => handleUniformSpacing("vertical", 2)}
                className="px-2 py-1.5 text-xs bg-surface-secondary hover:bg-surface-tertiary rounded border border-border transition-colors"
                title="2 yard spacing vertically"
              >
                2 yd
              </button>
            </div>
          </div>
        </div>

        {/* Spacing Indicator Section */}
        <div className="pt-4 border-t border-border">
          <h3 className="text-sm font-semibold text-content-primary mb-2">
            Spacing Tool
          </h3>
          <button
            onClick={() => {
              if (app?.spacingIndicatorLayer) {
                app.spacingIndicatorLayer.toggle();
                // Update with current players
                app.spacingIndicatorLayer.updatePlayers(players);
              }
            }}
            className={`${buttonBaseClasses} ${
              app?.spacingIndicatorLayer?.isShowing()
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-surface-secondary text-content-primary hover:bg-surface-tertiary border border-border"
            }`}
            title="Toggle draggable spacing indicator - Drag to measure uniform spacing"
          >
            📏 {app?.spacingIndicatorLayer?.isShowing() ? "Hide" : "Show"}{" "}
            Spacing
          </button>
          <p className="text-xs text-content-tertiary mt-2">
            💡 Drag the blue line to measure spacing between aligned players
          </p>
        </div>

        {/* Selection Info */}
        {selectedPlayerId && (
          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-semibold text-content-primary mb-2">
              Selection
            </h3>
            <div className="text-sm text-content-secondary bg-surface-secondary rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span>Jersey #:</span>
                <span className="font-mono font-bold">
                  {players.find((p) => p.id === selectedPlayerId)?.jerseyNumber}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span>Team:</span>
                <span className="capitalize">
                  {players.find((p) => p.id === selectedPlayerId)?.team}
                </span>
              </div>
            </div>
            <p className="text-xs text-content-tertiary mt-2">
              💡 Hold Shift to select multiple players
            </p>
          </div>
        )}
      </div>

      {/* Help Footer */}
      <div className="p-4 border-t border-border bg-surface-secondary">
        <h3 className="text-xs font-semibold text-content-primary mb-2">
          Quick Tips
        </h3>
        <ul className="text-xs text-content-secondary space-y-1">
          <li>• Click to select a player</li>
          <li>• Drag selected players to move as group</li>
          <li>• Shift+Click for multi-select</li>
          <li>• Shift+Drag (3+ players) for auto-spacing</li>
          <li>• Click+Drag empty field for box select</li>
          <li>• Alt/Option to snap to yard lines/hashes</li>
          <li>• Arrow keys to nudge</li>
          <li>• Ctrl/Cmd+C/V/D to copy/paste</li>
          <li>• Ctrl/Cmd+Z to undo, Ctrl/Cmd+Shift+Z to redo</li>
          <li>• Delete key to remove</li>
        </ul>
      </div>

      {/* Formation Confirmation Dialog */}
      {showFormationConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-primary/95 dark:bg-surface-secondary/95 backdrop-blur-md border border-stroke rounded-lg shadow-2xl p-6 max-w-md mx-4">
            <h2 className="text-xl font-bold text-content-primary mb-4">
              {confirmTitle}
            </h2>
            <p className="text-content-secondary mb-6 whitespace-pre-line">
              {confirmMessage}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (pendingFormationAction) {
                    pendingFormationAction();
                  }
                  setShowFormationConfirm(false);
                  setPendingFormationAction(null);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Yes, Continue
              </button>
              <button
                onClick={() => {
                  setShowFormationConfirm(false);
                  setPendingFormationAction(null);
                }}
                className="flex-1 px-4 py-2 bg-surface-secondary text-content-primary rounded-lg font-medium hover:bg-surface-tertiary border border-border transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal (for blocking actions) */}
      {showAlert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-primary/95 dark:bg-surface-secondary/95 backdrop-blur-md border border-stroke rounded-lg shadow-2xl p-6 max-w-md mx-4">
            <h2 className="text-xl font-bold text-content-primary mb-4">
              ⚠️ Cannot Add Formation
            </h2>
            <p className="text-content-secondary mb-6 whitespace-pre-line">
              {alertMessage}
            </p>
            <button
              onClick={() => setShowAlert(false)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
