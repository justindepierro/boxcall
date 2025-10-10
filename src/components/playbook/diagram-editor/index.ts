/**
 * Pixi Diagram Editor - Public API
 */

// Main component
export { DiagramEditor } from "./DiagramEditor";
export type { DiagramEditorProps } from "./DiagramEditor";

// Components
export { DiagramCanvas } from "./components/DiagramCanvas";
export { CameraControls } from "./components/CameraControls";
export { PlayerControls } from "./components/PlayerControls";

// Hooks
export { usePixiApp } from "./hooks/usePixiApp";
export { useGestures } from "./hooks/useGestures";

// Stores
export { useDiagramStore } from "./stores/diagramStore";
export type { DiagramState, ToolType } from "./stores/diagramStore";

// Core classes
export { CoordinateSystem } from "./core/CoordinateSystem";
export { Camera } from "./core/Camera";
export { DiagramPixiApp } from "./core/PixiApp";

// Layers
export { FieldLayer } from "./layers/FieldLayer";
export { PlayersLayer } from "./layers/PlayersLayer";

// Sprites
export { PlayerSprite } from "./sprites/PlayerSprite";

// Types
export type { FieldDimensions, YardCoordinate } from "./core/CoordinateSystem";
export type { CameraState } from "./core/Camera";
export type { Player, TeamSide, PlayerColors } from "./types/Player";
export type {
  DiagramMetadata,
  DiagramDocument,
  DiagramState as DiagramEditorState,
  ToolType as EditorToolType,
} from "./types/DiagramTypes";
