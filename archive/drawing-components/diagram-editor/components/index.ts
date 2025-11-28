/**
 * Pixi.js Component Library
 *
 * Unified components for rendering football diagrams with Pixi.js.
 * These components provide the foundation for the consolidated diagram system.
 */

export { PixiDiagramCanvas } from "./PixiDiagramCanvas";
export { PixiFieldBackground } from "./PixiFieldBackground";

// Re-export types for convenience
export type {
  UnifiedDiagramData,
  DiagramCanvasProps,
  DiagramMode,
  DiagramContext,
  MiniDiagramProps,
  DiagramComponent,
} from "../types/UnifiedDiagramTypes";

export type { FieldDimensions } from "../core/CoordinateSystem";
