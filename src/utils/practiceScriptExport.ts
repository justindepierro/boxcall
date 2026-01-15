/**
 * Practice Script Export/Import Utilities
 * Handles JSON export and import for practice scripts with validation
 */

import type { PracticeScript } from "../services/practice";

export interface ExportedPracticeScript {
  version: "1.0";
  exportedAt: string;
  scripts: Array<{
    name: string;
    description: string | null;
    tags: string[] | null;
    plays: Array<{
      playId: string;
      orderIndex: number;
      reps: number;
      notes: string | null;
    }>;
  }>;
}

/**
 * Export practice scripts to JSON format
 */
export function exportPracticeScripts(
  scripts: PracticeScript[]
): ExportedPracticeScript {
  return {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    scripts: scripts.map((script) => ({
      name: script.title || script.name || "Untitled Script",
      description: script.description || null,
      tags: script.tags || null,
      plays: (script.plays || []).map((play, index) => ({
        playId: play.playId,
        orderIndex: index,
        reps: play.repetitions || 1,
        notes: play.notes || null,
      })),
    })),
  };
}

/**
 * Download JSON file to user's device
 */
export function downloadJSON(data: ExportedPracticeScript, filename: string) {
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
export function validatePracticeScriptImport(data: unknown): {
  valid: boolean;
  error?: string;
  data?: ExportedPracticeScript;
} {
  try {
    if (!data || typeof data !== "object") {
      return { valid: false, error: "Invalid JSON format" };
    }

    const imported = data as ExportedPracticeScript;

    if (imported.version !== "1.0") {
      return {
        valid: false,
        error: `Unsupported version: ${imported.version}. Expected 1.0`,
      };
    }

    if (!Array.isArray(imported.scripts)) {
      return { valid: false, error: "Missing or invalid 'scripts' array" };
    }

    // Validate each script
    for (let i = 0; i < imported.scripts.length; i++) {
      const script = imported.scripts[i];

      if (!script.name || typeof script.name !== "string") {
        return {
          valid: false,
          error: `Script ${i + 1}: Missing or invalid name`,
        };
      }

      if (!Array.isArray(script.plays)) {
        return {
          valid: false,
          error: `Script "${script.name}": Missing or invalid plays array`,
        };
      }

      // Validate plays
      for (let j = 0; j < script.plays.length; j++) {
        const play = script.plays[j];

        if (!play.playId || typeof play.playId !== "string") {
          return {
            valid: false,
            error: `Script "${script.name}", Play ${j + 1}: Missing or invalid playId`,
          };
        }

        if (
          typeof play.orderIndex !== "number" ||
          play.orderIndex < 0 ||
          !Number.isInteger(play.orderIndex)
        ) {
          return {
            valid: false,
            error: `Script "${script.name}", Play ${j + 1}: Invalid orderIndex`,
          };
        }

        if (
          typeof play.reps !== "number" ||
          play.reps < 1 ||
          !Number.isInteger(play.reps)
        ) {
          return {
            valid: false,
            error: `Script "${script.name}", Play ${j + 1}: Invalid reps (must be positive integer)`,
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
  data?: ExportedPracticeScript;
} {
  try {
    const parsed = JSON.parse(content);
    return validatePracticeScriptImport(parsed);
  } catch (err: unknown) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : "Invalid JSON file format",
    };
  }
}
