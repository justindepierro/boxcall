/**
 * useCoverageAdjustment Hook
 * Handles auto-adjustment of defensive coverage based on offensive formation
 */

import * as React from "react";
import type { Player } from "../../../types/Player";
import type { DiagramPixiApp } from "../../../core/PixiApp";
import type { Alignment } from "../types";
import type { FormationAnalysis } from "@features/defense/types";
import { adjustCoverage } from "@features/defense/engines";

interface UseCoverageAdjustmentProps {
  app: DiagramPixiApp | null;
  players: Player[];
  selectedAlignment: Alignment;
  formationAnalysis: FormationAnalysis | null;
  toast: {
    success: (title: string, message: string) => void;
    error: (title: string, message: string) => void;
  };
}

/**
 * Calculate center X position based on alignment
 */
function getCenterXForAlignment(
  alignment: Alignment,
  fieldWidth: number
): number {
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
}

export function useCoverageAdjustment(props: UseCoverageAdjustmentProps) {
  const { app, players, selectedAlignment, formationAnalysis, toast } = props;

  /**
   * Auto-adjust defensive coverage based on offensive formation
   */
  const handleAutoAdjustCoverage = React.useCallback(async () => {
    // Validation checks
    if (!app?.playersLayer || !formationAnalysis) {
      toast.error(
        "Cannot adjust coverage",
        "Missing app or formation analysis"
      );
      return;
    }

    // Get defensive players
    const defensivePlayers = players.filter((p) => p.team === "defense");

    if (defensivePlayers.length === 0) {
      toast.error(
        "No defensive players on field",
        "Please add a defensive formation first"
      );
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
      // Coverage engine now handles boundary validation internally
      result.adjustments.forEach((adj) => {
        app.playersLayer!.updatePlayer(adj.playerId, {
          x: adj.newX,
          ...(adj.newY !== undefined && { y: adj.newY }),
        });

        // Log each adjustment for debugging
        console.log(`  ✓ ${adj.reason}`);
      });

      // Show success message with toast
      console.log(`✅ ${result.summary}`);
      console.log(`📞 Coverage Call: ${result.recommendedCoverage}`);

      toast.success(
        result.summary,
        `Recommended: ${result.recommendedCoverage}`
      );
    } catch (error) {
      console.error("❌ Coverage adjustment error:", error);
      toast.error(
        "Failed to adjust coverage",
        error instanceof Error ? error.message : "Check console for details"
      );
    }
  }, [app, formationAnalysis, players, selectedAlignment, toast]);

  return {
    handleAutoAdjustCoverage,
  };
}
