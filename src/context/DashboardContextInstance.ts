import { createContext } from "react";
import type { DashboardState } from "./DashboardContext.types";

export const DashboardContext = createContext<DashboardState | undefined>(
  undefined
);
