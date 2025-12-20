/**
 * Minimal DevMode Provider
 * Replacement for the deleted dev-mode-store with essential functionality only
 */

import React, { createContext, useState, type ReactNode } from "react";

import type { DevMode } from "./dev-mode-types";
import { isValidDevMode } from "./dev-mode-utils";
import {
  readLocalString,
  storageKeys,
  writeLocalString,
} from "../utils/storage";

const DEFAULT_DEV_MODE: DevMode = (() => {
  const envValue =
    (typeof import.meta !== "undefined" &&
      import.meta.env &&
      typeof import.meta.env.VITE_DEFAULT_DEV_MODE === "string" &&
      import.meta.env.VITE_DEFAULT_DEV_MODE.trim()) ||
    "blank_slate";
  return isValidDevMode(envValue) ? (envValue as DevMode) : "blank_slate";
})();

type ForceMode = "none" | "lock" | "reset";

const FORCE_MODE: ForceMode = (() => {
  if (
    typeof import.meta === "undefined" ||
    !import.meta.env ||
    typeof import.meta.env.VITE_FORCE_DEV_MODE !== "string"
  ) {
    return "none";
  }

  const normalized = import.meta.env.VITE_FORCE_DEV_MODE.toLowerCase();
  if (normalized === "true" || normalized === "lock") return "lock";
  if (normalized === "reset" || normalized === "blank_slate_reset") {
    return "reset";
  }
  return "none";
})();

// Dev mode context
interface DevModeContextType {
  devMode: DevMode;
  setDevMode: (mode: DevMode) => void;
  isDevMode: boolean;
}

const DevModeContext = createContext<DevModeContextType | null>(null);

// Provider component
interface DevModeProviderProps {
  children: ReactNode;
}

export const DevModeProvider: React.FC<DevModeProviderProps> = ({
  children,
}) => {
  const [devMode, setDevModeState] = useState<DevMode>(() => {
    if (typeof window === "undefined") {
      return DEFAULT_DEV_MODE;
    }

    const stored = readLocalString(storageKeys.dev.devMode);
    const storedIsValid = stored && isValidDevMode(stored);

    if (storedIsValid) {
      if (FORCE_MODE === "lock" && stored !== DEFAULT_DEV_MODE) {
        writeLocalString(storageKeys.dev.devMode, DEFAULT_DEV_MODE);
        return DEFAULT_DEV_MODE;
      }

      if (
        FORCE_MODE === "reset" &&
        stored === "blank_slate" &&
        DEFAULT_DEV_MODE !== "blank_slate"
      ) {
        writeLocalString(storageKeys.dev.devMode, DEFAULT_DEV_MODE);
        return DEFAULT_DEV_MODE;
      }

      return stored as DevMode;
    }

    writeLocalString(storageKeys.dev.devMode, DEFAULT_DEV_MODE);
    return DEFAULT_DEV_MODE;
  });

  const setDevMode = (mode: DevMode) => {
    setDevModeState(mode);
    writeLocalString(storageKeys.dev.devMode, mode);
  };

  const isDevMode = devMode !== "production";

  return (
    <DevModeContext.Provider value={{ devMode, setDevMode, isDevMode }}>
      {children}
    </DevModeContext.Provider>
  );
};

// Export context for use in hooks file
export { DevModeContext };
