import { createContext } from "react";
import type { DevModeContextType } from "./dev-mode-types";

export const DevModeContext = createContext<DevModeContextType | null>(null);
