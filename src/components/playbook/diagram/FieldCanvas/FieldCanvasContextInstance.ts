// FieldCanvasContextInstance.ts

import { createContext } from "react";
import type { FieldCanvasContextType } from "./FieldCanvasContextValues";
import { defaultContext } from "./FieldCanvasContextValues";

export const FieldCanvasContext =
  createContext<FieldCanvasContextType>(defaultContext);
