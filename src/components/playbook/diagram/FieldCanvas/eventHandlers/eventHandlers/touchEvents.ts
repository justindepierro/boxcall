import type { TouchEvent } from "react";
import type { FieldCanvasContextType } from "../../FieldCanvasContext";

export function handleTouchStart(
  _evt: TouchEvent,
  _ctx: FieldCanvasContextType
) {
  // Example: start selection or drag for touch
}

export function handleTouchMove(
  _evt: TouchEvent,
  _ctx: FieldCanvasContextType
) {
  // Example: update selection or drag for touch
}

export function handleTouchEnd(_evt: TouchEvent, _ctx: FieldCanvasContextType) {
  // Example: finalize selection or drag for touch
}
