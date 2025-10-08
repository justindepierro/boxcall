import { useContext } from "react";
import { FieldCanvasContext } from "./FieldCanvasContextInstance";
import type { FieldCanvasContextType } from "./FieldCanvasContext";

export function useFieldCanvas(): FieldCanvasContextType {
  return useContext(FieldCanvasContext);
}
