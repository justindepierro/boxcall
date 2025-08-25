import type { MouseEvent } from "react";
import type { FieldCanvasContextType } from "../FieldCanvasContext";

export function handleMouseDown(evt: MouseEvent, ctx: FieldCanvasContextType) {
  // Example: start selection box or drag
}

export function handleMouseMove(evt: MouseEvent, ctx: FieldCanvasContextType) {
  // Example: update selection box or drag
}

export function handleMouseUp(evt: MouseEvent, ctx: FieldCanvasContextType) {
  // Example: finalize selection or drag
}
