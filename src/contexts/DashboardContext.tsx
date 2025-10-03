import { useState, useMemo } from "react";
import type { ReactNode } from "react";
import type { Profile } from "../types/database";
import { DashboardContext } from "./DashboardContextInstance";
// import { useDashboardContext } from "./useDashboardContext"; // consumers should import directly

// Define the shape of dashboard state
export interface DashboardState {
  profile: Profile | null;
  notifications: Array<{ id: string; message: string; type: string }>;
  ui: {
    sidebarOpen: boolean;
    // Add more UI state as needed
  };
  setProfile: (profile: Profile | null) => void;
  setNotifications: (notifications: DashboardState["notifications"]) => void;
  setUI: (ui: DashboardState["ui"]) => void;
}

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<DashboardState["profile"]>(null);
  const [notifications, setNotifications] = useState<
    DashboardState["notifications"]
  >([]);
  const [ui, setUI] = useState<DashboardState["ui"]>({ sidebarOpen: false });

  const value = useMemo(
    () => ({ profile, notifications, ui, setProfile, setNotifications, setUI }),
    [profile, notifications, ui]
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};
