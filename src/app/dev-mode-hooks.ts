/**
 * Dev Mode Context Hooks
 * Separated from provider to avoid fast refresh warnings
 */
import { useContext } from "react";
import { DevModeContext } from "./dev-mode-store";

// Hook to use dev mode context
export const useDevModeContext = () => {
  const context = useContext(DevModeContext);
  if (!context) {
    throw new Error("useDevModeContext must be used within a DevModeProvider");
  }
  return context;
};

// Simplified hook for dev mode (returns just devMode)
export const useDevMode = () => {
  const { devMode } = useDevModeContext();
  return { devMode };
};
