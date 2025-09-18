import { useState, useMemo } from "react";
import type { ReactNode } from "react";
import { DashboardContext } from "./DashboardContextInstance";
import type { DashboardState } from "./DashboardContext.types";
// import { useDashboardContext } from "./useDashboardContext"; // consumers should import directly

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
