import { createContext } from "react";
import type { FieldCanvasContextType } from "../../diagram/FieldCanvas/FieldCanvasContext";
import {
  defaultContext,
  FieldCanvasProvider,
} from "../../diagram/FieldCanvas/FieldCanvasContext";

export const FieldCanvasContext =
  createContext<FieldCanvasContextType>(defaultContext);

export { FieldCanvasProvider };
