import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export interface UINotification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

type UIState = {
  theme: "light" | "dark";
  sidebarOpen: boolean;
  notifications: UINotification[];
  uiDensity: "compact" | "comfortable";
};

type UIActions = {
  setTheme: (theme: UIState["theme"]) => void;
  toggleSidebar: () => void;
  addNotification: (
    notification: Pick<UINotification, "type" | "title" | "message">
  ) => void;
  removeNotification: (id: string) => void;
  setUIDensity: (uiDensity: UIState["uiDensity"]) => void;
};

type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      (set) => ({
        theme: "light",
        sidebarOpen: false,
        notifications: [],
        uiDensity: "compact",

        setTheme: (theme) => set({ theme }, false, "setTheme"),
        toggleSidebar: () =>
          set(
            (state) => ({ sidebarOpen: !state.sidebarOpen }),
            false,
            "toggleSidebar"
          ),
        setUIDensity: (uiDensity) => set({ uiDensity }, false, "setUIDensity"),

        addNotification: (notification) =>
          set(
            (state) => ({
              notifications: [
                ...state.notifications,
                {
                  id: crypto.randomUUID(),
                  timestamp: new Date(),
                  read: false,
                  ...notification,
                },
              ],
            }),
            false,
            "addNotification"
          ),
        removeNotification: (id) =>
          set(
            (state) => ({
              notifications: state.notifications.filter((n) => n.id !== id),
            }),
            false,
            "removeNotification"
          ),
      }),
      {
        // Keep legacy key so existing persisted theme/density survives.
        name: "boxcall-store",
        partialize: (state) => ({
          theme: state.theme,
          sidebarOpen: state.sidebarOpen,
          uiDensity: state.uiDensity,
        }),
      }
    )
  )
);

export const useUI = () => {
  const theme = useUIStore((state) => state.theme);
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const notifications = useUIStore((state) => state.notifications);
  const setTheme = useUIStore((state) => state.setTheme);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const addNotification = useUIStore((state) => state.addNotification);
  const removeNotification = useUIStore((state) => state.removeNotification);
  const uiDensity = useUIStore((state) => state.uiDensity);
  const setUIDensity = useUIStore((state) => state.setUIDensity);

  return {
    theme,
    sidebarOpen,
    notifications,
    setTheme,
    toggleSidebar,
    addNotification,
    removeNotification,
    uiDensity,
    setUIDensity,
  };
};
