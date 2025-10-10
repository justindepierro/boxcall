/**
 * Diagram Editor Types
 *
 * Core types for the Pixi.js diagram editor.
 * These will be expanded as we add more features (routes, annotations, etc.)
 */

import type { Player } from "./Player";

/**
 * Diagram metadata - play information
 */
export interface DiagramMetadata {
  play_name: string;
  formation: string;
  p_type?: string;
  personnel?: string;
  pref_front?: string;
}

/**
 * Diagram document - the actual diagram data
 * Version 2: Simplified for Pixi.js implementation
 */
export interface DiagramDocument {
  version: 2;
  players: Player[];
  // Future: routes, annotations, etc. will be added here
  meta?: {
    createdAt: number;
    updatedAt: number;
  };
}

/**
 * Tool types for the diagram editor
 */
export type ToolType =
  | "select"
  | "pan"
  | "add-player-offense"
  | "add-player-defense"
  | "route"
  | "annotation"
  | "delete";

/**
 * Diagram state for the editor
 */
export interface DiagramState {
  document: DiagramDocument;
  metadata: DiagramMetadata;
  selectedTool: ToolType;
  selectedElementIds: string[];
}
