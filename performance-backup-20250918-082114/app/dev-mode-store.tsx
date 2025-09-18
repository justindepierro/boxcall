/**
 * Minimal DevMode Provider
 * Replacement for the deleted dev-mode-store with essential functionality only
 */
import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import type { DevMode } from "./dev-mode-types";

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
    // Get from localStorage or default to blank_slate for clean dashboard
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("boxcall-dev-mode");
      if (stored && isValidDevMode(stored)) {
        return stored as DevMode;
      }
    }
    return "blank_slate"; // Default to clean, empty state
  });

  const setDevMode = (mode: DevMode) => {
    setDevModeState(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("boxcall-dev-mode", mode);
    }
  };

  const isDevMode = devMode !== "production";

  return (
    <DevModeContext.Provider value={{ devMode, setDevMode, isDevMode }}>
      {children}
    </DevModeContext.Provider>
  );
};

// Hook to use dev mode context
export const useDevModeContext = () => {
  const context = useContext(DevModeContext);
  if (!context) {
    throw new Error("useDevModeContext must be used within a DevModeProvider");
  }
  return context;
};

// Utility to validate dev mode
function isValidDevMode(mode: string): boolean {
  const validModes: DevMode[] = [
    "production",
    "blank_slate",
    "test_as_head_coach",
    "test_as_coach",
    "test_as_player",
    "test_as_family",
  ];
  return validModes.includes(mode as DevMode);
}
