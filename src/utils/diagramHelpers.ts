/**
 * Simple Diagram Helper Utilities
 * Simplified versions for the basic diagram system
 */

import type { IconName } from "../components/ui/Icon/Icon";

/**
 * Get the appropriate icon for diagram button based on state
 */
export function getDiagramButtonIcon(hasDiagram: boolean): IconName {
  return hasDiagram ? "edit" : "image";
}

/**
 * Get the appropriate button text for diagram actions
 */
export function getDiagramButtonText(hasDiagram: boolean): string {
  return hasDiagram ? "Edit Diagram" : "Create Diagram";
}