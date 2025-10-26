/**
 * Re-export types for backwards compatibility
 * PlaybookPage and other files import from types/types.ts
 */

export type {
  DiagramDocument,
  DiagramMetadata,
  DiagramState,
  ToolType,
} from "./DiagramTypes";

export type DiagramFieldPosition =
  | "midfield"
  | "backed-up"
  | "red-zone"
  | "free-draw";
