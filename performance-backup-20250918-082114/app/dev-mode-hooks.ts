import { useState } from "react";

import { useAuthProfile } from "./auth-store";

import type { DevMode } from "./dev-mode-types";

// Simple dev mode hook without complex context
export const useDevMode = () => {
  const [devMode, setDevModeState] = useState<DevMode>(() => {
    // Get from localStorage or default to production
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("boxcall-dev-mode");
      if (stored && isValidDevMode(stored)) {
        return stored as DevMode;
      }
    }
    return "production";
  });

  const setDevMode = (mode: DevMode) => {
    setDevModeState(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("boxcall-dev-mode", mode);
    }
  };

  return { devMode, setDevMode };
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

// Simplified role checking (using actual database role names)
export const useIsHeadCoach = () => {
  const { devMode } = useDevMode();
  const profile = useAuthProfile();

  // Database uses 'admin' for head coaches, or testing as head coach
  return profile?.role === "admin" || devMode === "test_as_head_coach";
};

export const useIsCoach = () => {
  const { devMode } = useDevMode();
  const profile = useAuthProfile();

  // Any coaching role or testing as coach
  return (
    profile?.role === "admin" ||
    profile?.role === "coach" ||
    profile?.role === "assistant_coach" ||
    devMode === "test_as_head_coach" ||
    devMode === "test_as_coach"
  );
};

export const useIsPlayer = () => {
  const { devMode } = useDevMode();
  const profile = useAuthProfile();

  return profile?.role === "player" || devMode === "test_as_player";
};

export const useIsFamily = () => {
  const { devMode } = useDevMode();
  const profile = useAuthProfile();

  return profile?.role === "family" || devMode === "test_as_family";
};
