// FieldCanvasContextInstance.ts

import { createContext } from "react";
import type { FieldCanvasContextType } from "./FieldCanvasContext.types";
import { defaultContext } from "./FieldCanvasContextValues";

export const FieldCanvasContext =
  createContext<FieldCanvasContextType>(defaultContext);
