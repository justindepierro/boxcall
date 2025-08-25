import { createContext } from "react";
import type { FieldCanvasContextType } from "./FieldCanvasContext";
import { defaultContext } from "./FieldCanvasContext";

export const FieldCanvasContext =
  createContext<FieldCanvasContextType>(defaultContext);
