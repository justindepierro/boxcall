/**
 * Utility Functions for PlaybookPage
 * Extracted from PlaybookPage.tsx for better organization
 */

import type { Play } from "../../../types/play";

export type MobileButtonSize = "sm" | "md" | "lg";

/**
 * Normalize mobile button size to valid enum value
 */
export function normalizeMobileButtonSize(
  size: unknown,
  fallback: MobileButtonSize
): MobileButtonSize {
  return size === "sm" || size === "md" || size === "lg" ? size : fallback;
}

/**
 * Build existing plays array with proper type casting for modals
 */
export function buildExistingPlaysForModals(
  allPlaysForStats: unknown[],
  activePlaybookId: string | null
): Play[] {
  return allPlaysForStats.map((play) => {
    const rawPlay = play as any;

    const rawDiagram = rawPlay.diagram_data;
    const diagram_data: Play["diagram_data"] = (() => {
      if (typeof rawDiagram === "string") {
        try {
          const parsed = JSON.parse(rawDiagram);
          return Array.isArray(parsed)
            ? (parsed as unknown as Play["diagram_data"])
            : null;
        } catch {
          return null;
        }
      }
      return Array.isArray(rawDiagram)
        ? (rawDiagram as unknown as Play["diagram_data"])
        : null;
    })();

    return {
      ...rawPlay,
      playbook_id: String(rawPlay.playbook_id ?? activePlaybookId ?? ""),
      confidence_base: rawPlay.confidence_base ?? 3,
      times_called: rawPlay.times_called ?? 0,
      times_successful: rawPlay.times_successful ?? 0,
      created_by: String(rawPlay.created_by ?? ""),
      created_at: new Date(rawPlay.created_at ?? Date.now()),
      updated_at: new Date(rawPlay.updated_at ?? Date.now()),
      diagram_data,
    } as Play;
  });
}
