import { createContext } from "react";
import type { FieldCanvasContextType } from "./FieldCanvasContext";
import { defaultContext, FieldCanvasProvider } from "./FieldCanvasContext";

export const FieldCanvasContext =
  createContext<FieldCanvasContextType>(defaultContext);

export { FieldCanvasProvider };
