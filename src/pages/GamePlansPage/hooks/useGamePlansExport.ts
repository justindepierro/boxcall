/**
 * useGamePlansExport
 *
 * Handles export/import operations for game plans
 */

import { useCallback } from "react";
import { GamePlanPDFService } from "../../../services/gamePlanPdfService";
import {
  GamePlanService,
  type GamePlan as ServiceGamePlan,
} from "../../../services/gamePlanService";
import type { GamePlan as ModalGamePlan } from "../../../components/playbook/GamePlanModal/types";
import { error as logError } from "../../../utils/logger";
import {
  exportGamePlans,
  downloadJSON,
  type ExportedGamePlan,
} from "../../../utils/gamePlanExport";

interface UseGamePlansExportProps {
  activeTeamId: string | null;
  rawGamePlans: ServiceGamePlan[];
  loadGamePlans: () => Promise<void>;
  toast: {
    success: (msg: string) => void;
    error: (msg: string) => void;
    warning: (msg: string) => void;
  };
}

export function useGamePlansExport({
  activeTeamId,
  rawGamePlans,
  loadGamePlans,
  toast,
}: UseGamePlansExportProps) {
  const handleExportPDF = useCallback(
    async (plan: ModalGamePlan) => {
      try {
        await GamePlanPDFService.exportGamePlan(plan, "call-sheet");
        toast.success("PDF exported successfully");
      } catch (error) {
        logError("Failed to export PDF:", error);
        toast.error("Failed to export PDF");
      }
    },
    [toast]
  );

  const handleExportJSON = useCallback(() => {
    if (rawGamePlans.length === 0) {
      toast.error("No game plans to export");
      return;
    }

    try {
      const exportData = exportGamePlans(rawGamePlans);
      const filename = `game-plans-${new Date().toISOString().split("T")[0]}.json`;
      downloadJSON(exportData, filename);
      toast.success(
        `Exported ${rawGamePlans.length} game plan${rawGamePlans.length !== 1 ? "s" : ""}`
      );
    } catch (error) {
      logError("Failed to export game plans:", error);
      toast.error("Failed to export game plans");
    }
  }, [rawGamePlans, toast]);

  const handleImportPlans = useCallback(
    async (data: ExportedGamePlan) => {
      if (!activeTeamId) {
        toast.error("No active team found");
        throw new Error("No active team");
      }

      try {
        let imported = 0;
        let failed = 0;

        for (const plan of data.plans) {
          try {
            // Create the game plan
            const newPlan = await GamePlanService.createGamePlan({
              name: plan.name,
              opponent: plan.opponent || undefined,
              gameDate: plan.gameDate || undefined,
              notes: plan.notes || undefined,
              teamId: activeTeamId,
            });

            // Group situations by situationName
            const situationsMap = new Map<
              string,
              Array<{
                playId: string;
                orderIndex: number;
                notes: string | null;
              }>
            >();

            for (const sit of plan.situations) {
              if (!situationsMap.has(sit.situationName)) {
                situationsMap.set(sit.situationName, []);
              }
              situationsMap.get(sit.situationName)!.push({
                playId: sit.playId,
                orderIndex: sit.orderIndex,
                notes: sit.notes,
              });
            }

            // Add plays to each situation
            for (const [situationName, plays] of situationsMap) {
              const targetSituation = newPlan.situations?.find(
                (situation) =>
                  situation.situationType.toLowerCase() ===
                  situationName.toLowerCase()
              );

              if (!targetSituation) {
                console.warn(
                  `Skipping plays for unknown situation "${situationName}"`
                );
                continue;
              }

              // Import plays for this situation
              await Promise.all(
                plays.map((play) =>
                  GamePlanService.addPlayToSituation({
                    situationId: targetSituation.id,
                    playId: play.playId,
                    priority: play.orderIndex + 1,
                    notes: play.notes || undefined,
                  })
                )
              );
            }

            imported++;
          } catch (error) {
            logError(`Failed to import game plan "${plan.name}":`, error);
            failed++;
          }
        }

        await loadGamePlans();

        if (failed === 0) {
          toast.success(
            `Successfully imported ${imported} game plan${imported !== 1 ? "s" : ""}`
          );
        } else {
          toast.warning(
            `Imported ${imported} plan${imported !== 1 ? "s" : ""}, ${failed} failed`
          );
        }
      } catch (error) {
        logError("Failed to import game plans:", error);
        throw error;
      }
    },
    [activeTeamId, loadGamePlans, toast]
  );

  return {
    handleExportPDF,
    handleExportJSON,
    handleImportPlans,
  };
}
