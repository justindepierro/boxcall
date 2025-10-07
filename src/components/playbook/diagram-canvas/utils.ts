/**
 * Diagram Editor Utility Functions
 * 
 * Extracted helper functions from context.tsx for better organization
 * and reusability across the diagram editor system.
 */

import { telemetry } from "../../../telemetry/dispatcher";
import { TelemetryEventTypes } from "../../../telemetry/events";
import type { DiagramEditorState, DiagramDocument } from "./types";

// ============================================================================
// Constants
// ============================================================================

export const HISTORY_CAP = 100;

// ============================================================================
// History Management
// ============================================================================

/**
 * Add a new document state to the history stack
 * Trims history if it exceeds HISTORY_CAP
 * 
 * @param state - Current editor state
 * @param nextDoc - New document state to push
 * @returns Updated state with new history
 */
export function pushHistory(
  state: DiagramEditorState,
  nextDoc: DiagramDocument
): DiagramEditorState {
  // Trim future history (after current index)
  const trimmed = state.history.slice(0, state.historyIndex + 1);
  let newHistory = [...trimmed, nextDoc];
  
  // Cap history size
  if (newHistory.length > HISTORY_CAP) {
    const before = newHistory.length;
    newHistory = newHistory.slice(newHistory.length - HISTORY_CAP);
    
    telemetry.enqueue({
      type: TelemetryEventTypes.PlayDiagramHistory,
      data: {
        action: "cap-trim",
        dropped: before - newHistory.length,
        length: newHistory.length,
        cap: HISTORY_CAP,
      },
    });
  }
  
  return {
    ...state,
    history: newHistory,
    historyIndex: newHistory.length - 1,
  };
}

// ============================================================================
// Math Utilities
// ============================================================================

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation between two values
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Calculate distance between two points
 */
export function distance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// ============================================================================
// ID Generation
// ============================================================================

/**
 * Generate unique IDs for diagram elements
 */
export const generateId = {
  player: () => `P${Date.now().toString(36)}`,
  route: () => `R${Date.now().toString(36)}`,
  annotation: () => `A${Date.now().toString(36)}`,
  generic: (prefix: string) => `${prefix}${Date.now().toString(36)}`,
};

// ============================================================================
// Coordinate Utilities
// ============================================================================

/**
 * Snap a coordinate to a grid
 */
export function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

/**
 * Convert percentage to absolute coordinates
 */
export function pctToAbs(
  pct: number,
  dimension: number
): number {
  return (pct / 100) * dimension;
}

/**
 * Convert absolute coordinates to percentage
 */
export function absToPct(
  abs: number,
  dimension: number
): number {
  return (abs / dimension) * 100;
}

// ============================================================================
// State Query Helpers
// ============================================================================

/**
 * Check if state has unsaved changes
 */
export function hasUnsavedChanges(state: DiagramEditorState): boolean {
  return state.dirty;
}

/**
 * Check if undo is available
 */
export function canUndo(state: DiagramEditorState): boolean {
  return state.historyIndex > 0;
}

/**
 * Check if redo is available
 */
export function canRedo(state: DiagramEditorState): boolean {
  return state.historyIndex < state.history.length - 1;
}

/**
 * Get current history depth
 */
export function getHistoryDepth(state: DiagramEditorState): number {
  return state.historyIndex + 1;
}

/**
 * Get maximum history depth available
 */
export function getMaxHistoryDepth(state: DiagramEditorState): number {
  return state.history.length;
}
