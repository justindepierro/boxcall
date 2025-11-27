/**
 * Game Plan Export/Import Utilities
 * Handles JSON export and import for game plans with validation
 */

import type { GamePlan } from "../services/gamePlanService";

export interface ExportedGamePlan {
  version: "1.0";
  exportedAt: string;
  plans: Array<{
    name: string;
    opponent: string | null;
    gameDate: string | null;
    notes: string | null;
    situations: Array<{
      situationName: string;
      playId: string;
      orderIndex: number;
      notes: string | null;
    }>;
  }>;
}

/**
 * Export game plans to JSON format
 */
export function exportGamePlans(plans: GamePlan[]): ExportedGamePlan {
  return {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    plans: plans.map((plan) => ({
      name: plan.name,
      opponent: plan.opponent || null,
      gameDate: plan.gameDate || null,
      notes: plan.notes || null,
      situations: (plan.situations || []).flatMap((situation) =>
        (situation.plays || []).map((play, index) => ({
          situationName: situation.situationType,
          playId: play.playId,
          orderIndex: index,
          notes: play.notes || null,
        }))
      ),
    })),
  };
}

/**
 * Download JSON file to user's device
 */
export function downloadJSON(data: ExportedGamePlan, filename: string) {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Validate imported JSON structure
 */
export function validateGamePlanImport(data: unknown): {
  valid: boolean;
  error?: string;
  data?: ExportedGamePlan;
} {
  try {
    if (!data || typeof data !== "object") {
      return { valid: false, error: "Invalid JSON format" };
    }

    const imported = data as ExportedGamePlan;

    if (imported.version !== "1.0") {
      return {
        valid: false,
        error: `Unsupported version: ${imported.version}. Expected 1.0`,
      };
    }

    if (!Array.isArray(imported.plans)) {
      return { valid: false, error: "Missing or invalid 'plans' array" };
    }

    // Validate each plan
    for (let i = 0; i < imported.plans.length; i++) {
      const plan = imported.plans[i];

      if (!plan.name || typeof plan.name !== "string") {
        return {
          valid: false,
          error: `Plan ${i + 1}: Missing or invalid name`,
        };
      }

      if (!Array.isArray(plan.situations)) {
        return {
          valid: false,
          error: `Plan "${plan.name}": Missing or invalid situations array`,
        };
      }

      // Validate situations
      for (let j = 0; j < plan.situations.length; j++) {
        const situation = plan.situations[j];

        if (
          !situation.situationName ||
          typeof situation.situationName !== "string"
        ) {
          return {
            valid: false,
            error: `Plan "${plan.name}", Situation ${j + 1}: Missing or invalid situationName`,
          };
        }

        if (!situation.playId || typeof situation.playId !== "string") {
          return {
            valid: false,
            error: `Plan "${plan.name}", Situation ${j + 1}: Missing or invalid playId`,
          };
        }

        if (
          typeof situation.orderIndex !== "number" ||
          situation.orderIndex < 0 ||
          !Number.isInteger(situation.orderIndex)
        ) {
          return {
            valid: false,
            error: `Plan "${plan.name}", Situation ${j + 1}: Invalid orderIndex`,
          };
        }
      }
    }

    return { valid: true, data: imported };
  } catch (err: unknown) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Parse JSON file from FileReader result
 */
export function parseJSONFile(content: string): {
  valid: boolean;
  error?: string;
  data?: ExportedGamePlan;
} {
  try {
    const parsed = JSON.parse(content);
    return validateGamePlanImport(parsed);
  } catch {
    return {
      valid: false,
      error: "Invalid JSON file format",
    };
  }
}
