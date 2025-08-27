import type { MouseEvent } from "react";
import type { FieldCanvasContextType } from "../../FieldCanvasContext";

export function handleMouseDown(
  _evt: MouseEvent,
  _ctx: FieldCanvasContextType
) {
  // Example: start selection box or drag
}

export function handleMouseMove(
  _evt: MouseEvent,
  _ctx: FieldCanvasContextType
) {
  // Example: update selection box or drag
}

export function handleMouseUp(_evt: MouseEvent, _ctx: FieldCanvasContextType) {
  // Example: finalize selection or drag
}
