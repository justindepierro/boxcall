import { useContext } from "react";
import { useAuthProfile } from "./auth-store";
import { DevModeContext } from "./dev-mode-context";
export const useDevMode = () => {
  const context = useContext(DevModeContext);
  if (!context) {
    throw new Error("useDevMode must be used within a DevModeProvider");
  }
  return context;
};
// Hook to check if user has super admin capabilities (real or simulated)
export const useIsSuperAdmin = () => {
  const { devMode } = useDevMode();
  const profile = useAuthProfile();
  // Real super admin check (using 'admin' role from actual auth system)
  const isRealSuperAdmin = profile?.role === "admin";
  // Simulated super admin in dev mode
  const isSimulatedSuperAdmin =
    devMode === "super_admin_real" || devMode === "super_admin_mock";
  return isRealSuperAdmin || isSimulatedSuperAdmin;
};
// Hook to get effective team member role for current context
export const useEffectiveTeamRole = () => {
  const { effectiveUserRole } = useDevMode();
  return effectiveUserRole;
};
// Hook to determine if we should use mock data or real database data
export const useTeamDataSource = () => {
  const { devMode, effectiveTeamData } = useDevMode();
  const shouldUseMockData =
    devMode === "super_admin_mock" || devMode.startsWith("view_as_");
  const teamData = effectiveTeamData;
  return {
    shouldUseMockData,
    mockTeamData: teamData,
    dataSource: shouldUseMockData ? "mock" : ("database" as const),
  };
};
