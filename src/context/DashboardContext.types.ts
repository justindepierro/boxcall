import type { Profile } from "../types/database";

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
