import { createContext } from "react";
import type { DashboardState } from "./DashboardContext";

export const DashboardContext = createContext<DashboardState | undefined>(
  undefined
);
