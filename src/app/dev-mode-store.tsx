import React, { useEffect, useState } from "react";
import { useAuthProfile } from "../app/auth-store";
import { DevModeContext } from "./dev-mode-context";
import type { DevMode, DevModeContextType } from "./dev-mode-types";
import { mockTeamData } from "./dev-mode-types";

export function DevModeProvider({ children }: { children: React.ReactNode }) {
  const [devMode, setDevMode] = useState<DevMode>("production");
  const profile = useAuthProfile();

  // Load dev mode from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem("boxcall-dev-mode") as DevMode;
    if (savedMode && savedMode !== "production") {
      setDevMode(savedMode);
    }
  }, []);

  // Save dev mode to localStorage
  useEffect(() => {
    localStorage.setItem("boxcall-dev-mode", devMode);
  }, [devMode]);

  // Determine if we're in any dev mode
  const isDevMode = devMode !== "production";

  // Determine effective user role based on dev mode
  const effectiveUserRole = React.useMemo(() => {
    switch (devMode) {
      case "view_as_head_coach":
        return "head_coach";
      case "view_as_coach":
        return "assistant_coach";
      case "view_as_player":
        return "player";
      case "view_as_manager":
        return "manager";
      case "view_as_family":
        return "family";
      case "super_admin_real":
      case "super_admin_mock":
        return "super_admin";
      default:
        return profile?.role || "user";
    }
  }, [devMode, profile?.role]);

  // Determine effective team data
  const effectiveTeamData = React.useMemo(() => {
    return devMode === "super_admin_mock" || devMode.startsWith("view_as_")
      ? mockTeamData
      : null;
  }, [devMode]);

  const value: DevModeContextType = {
    devMode,
    setDevMode,
    mockTeamData,
    isDevMode,
    effectiveUserRole,
    effectiveTeamData,
  };

  return (
    <DevModeContext.Provider value={value}>{children}</DevModeContext.Provider>
  );
}
