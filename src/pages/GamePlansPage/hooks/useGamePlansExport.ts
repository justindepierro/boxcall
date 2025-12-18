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

type ImportPlan = ExportedGamePlan["plans"][number];

function groupSituationsByName(plan: ImportPlan) {
  const situationsMap = new Map<
    string,
    Array<{
      playId: string;
      orderIndex: number;
      notes: string | null;
    }>
  >();

  for (const situation of plan.situations) {
    let bucket = situationsMap.get(situation.situationName);
    if (!bucket) {
      bucket = [];
      situationsMap.set(situation.situationName, bucket);
    }
    bucket.push({
      playId: situation.playId,
      orderIndex: situation.orderIndex,
      notes: situation.notes,
    });
  }

  return situationsMap;
}

async function importSingleGamePlan(plan: ImportPlan, teamId: string) {
  const newPlan = await GamePlanService.createGamePlan({
    name: plan.name,
    opponent: plan.opponent || undefined,
    gameDate: plan.gameDate || undefined,
    notes: plan.notes || undefined,
    teamId,
  });

  const situationsMap = groupSituationsByName(plan);

  for (const [situationName, plays] of situationsMap) {
    const targetSituation = newPlan.situations?.find(
      (situation) =>
        situation.situationType.toLowerCase() === situationName.toLowerCase()
    );

    if (!targetSituation) {
      console.warn(`Skipping plays for unknown situation "${situationName}"`);
      continue;
    }

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
}

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
            await importSingleGamePlan(plan, activeTeamId);
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
