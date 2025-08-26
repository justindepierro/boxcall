import type { TouchEvent } from "react";
import type { FieldCanvasContextType } from "../FieldCanvasContext";

export function handleTouchStart(
  evt: TouchEvent,
  _ctx: FieldCanvasContextType
) {
  // Example: start selection or drag for touch
}

export function handleTouchMove(evt: TouchEvent, _ctx: FieldCanvasContextType) {
  // Example: update selection or drag for touch
}

export function handleTouchEnd(evt: TouchEvent, _ctx: FieldCanvasContextType) {
  // Example: finalize selection or drag for touch
}
