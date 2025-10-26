/**
 * Diagram Editor Types
 *
 * Core types for the Pixi.js diagram editor.
 * These will be expanded as we add more features (routes, annotations, etc.)
 */

import type { Player } from "./Player";

/**
 * Route types for professional playbook standards
 */
export type RouteType = "primary" | "hot" | "check";

/**
 * Route waypoint - a point along the route path
 */
export interface RouteWaypoint {
  x: number; // X position in yards
  y: number; // Y position in yards
}

/**
 * Route - represents a player's path/assignment
 */
export interface Route {
  id: string; // Unique identifier
  playerId: string; // Player running this route
  type: RouteType; // primary (main read), hot (if coverage), check (safety valve)
  waypoints: RouteWaypoint[]; // Path points (min 2: start + end)
  label?: string; // Optional route name (e.g., "Post", "Corner", "Slant")
  distance?: number; // Calculated route distance in yards
}

/**
 * Diagram metadata - play information
 */
export interface DiagramMetadata {
  play_name: string;
  formation: string;
  formation_id?: string;
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
  routes: Route[]; // Player routes/paths
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
  | "draw-route"
  | "edit-waypoint"
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
