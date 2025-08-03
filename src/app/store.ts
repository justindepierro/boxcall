import { create } from "zustand";
import { devtools } from "zustand/middleware";

// Types for our football application state
export interface User {
  id: string;
  email: string;
  name: string;
  role: "head_coach" | "assistant_coach" | "player" | "manager" | "parent";
  avatar?: string;
  teamIds: string[];
}

export interface Team {
  id: string;
  name: string;
  season: string;
  level: "youth" | "middle_school" | "high_school" | "college" | "professional";
  conference?: string;
  headCoachId: string;
  assistantCoaches: string[];
  players: string[];
  settings: TeamSettings;
}

export interface TeamSettings {
  theme: "light" | "dark";
  primaryColor: string;
  secondaryColor: string;
  allowParentAccess: boolean;
  enableAI: boolean;
  enableRealTime: boolean;
}

export interface Player {
  id: string;
  name: string;
  jersey: number;
  position: string;
  grade?: number;
  height?: string;
  weight?: number;
  parentEmails: string[];
  stats: PlayerStats;
}

export interface PlayerStats {
  gamesPlayed: number;
  touchdowns: number;
  yards: number;
  tackles: number;
}

export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// Global Application State
interface AppState {
  // Authentication
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Current Context
  currentTeamId: string | null;
  currentTeam: Team | null;

  // Teams & Players
  teams: Team[];
  players: Record<string, Player>;

  // UI State
  theme: "light" | "dark";
  sidebarOpen: boolean;
  notifications: Notification[];

  // Error Handling
  error: string | null;
}

interface AppActions {
  // Authentication actions
  setUser: (user: User | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;

  // Team management
  setCurrentTeam: (teamId: string | null) => void;
  addTeam: (team: Team) => void;
  updateTeam: (teamId: string, updates: Partial<Team>) => void;
  removeTeam: (teamId: string) => void;

  // Player management
  addPlayer: (player: Player) => void;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
  removePlayer: (playerId: string) => void;

  // UI actions
  setTheme: (theme: "light" | "dark") => void;
  toggleSidebar: () => void;
  addNotification: (
    notification: Pick<Notification, "type" | "title" | "message">
  ) => void;
  removeNotification: (id: string) => void;

  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;
}

type AppStore = AppState & AppActions;

// Create the Zustand store with devtools for debugging
export const useAppStore = create<AppStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      currentTeamId: null,
      currentTeam: null,
      teams: [],
      players: {},
      theme: "light",
      sidebarOpen: false,
      notifications: [],
      error: null,

      // Authentication actions
      setUser: (user) => set({ user }, false, "setUser"),
      setAuthenticated: (isAuthenticated) =>
        set({ isAuthenticated }, false, "setAuthenticated"),
      setLoading: (isLoading) => set({ isLoading }, false, "setLoading"),
      logout: () =>
        set(
          {
            user: null,
            isAuthenticated: false,
            currentTeamId: null,
            currentTeam: null,
          },
          false,
          "logout"
        ),

      // Team management
      setCurrentTeam: (teamId) => {
        const teams = get().teams;
        const currentTeam = teamId
          ? teams.find((t) => t.id === teamId) || null
          : null;
        set({ currentTeamId: teamId, currentTeam }, false, "setCurrentTeam");
      },

      addTeam: (team) =>
        set(
          (state) => ({
            teams: [...state.teams, team],
          }),
          false,
          "addTeam"
        ),

      updateTeam: (teamId, updates) =>
        set(
          (state) => ({
            teams: state.teams.map((team) =>
              team.id === teamId ? { ...team, ...updates } : team
            ),
          }),
          false,
          "updateTeam"
        ),

      removeTeam: (teamId) =>
        set(
          (state) => ({
            teams: state.teams.filter((team) => team.id !== teamId),
            currentTeamId:
              state.currentTeamId === teamId ? null : state.currentTeamId,
            currentTeam:
              state.currentTeamId === teamId ? null : state.currentTeam,
          }),
          false,
          "removeTeam"
        ),

      // Player management
      addPlayer: (player) =>
        set(
          (state) => ({
            players: { ...state.players, [player.id]: player },
          }),
          false,
          "addPlayer"
        ),

      updatePlayer: (playerId, updates) =>
        set(
          (state) => ({
            players: {
              ...state.players,
              [playerId]: { ...state.players[playerId], ...updates },
            },
          }),
          false,
          "updatePlayer"
        ),

      removePlayer: (playerId) =>
        set(
          (state) => {
             
            const { [playerId]: _, ...rest } = state.players;
            return { players: rest };
          },
          false,
          "removePlayer"
        ),

      // UI actions
      setTheme: (theme) => set({ theme }, false, "setTheme"),
      toggleSidebar: () =>
        set(
          (state) => ({ sidebarOpen: !state.sidebarOpen }),
          false,
          "toggleSidebar"
        ),

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

      // Error handling
      setError: (error) => set({ error }, false, "setError"),
      clearError: () => set({ error: null }, false, "clearError"),
    }),
    { name: "boxcall-store" }
  )
);

// Simple selectors that don't create new objects
export const useAuth = () => {
  const user = useAppStore((state) => state.user);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const isLoading = useAppStore((state) => state.isLoading);
  const setUser = useAppStore((state) => state.setUser);
  const setAuthenticated = useAppStore((state) => state.setAuthenticated);
  const setLoading = useAppStore((state) => state.setLoading);
  const logout = useAppStore((state) => state.logout);

  return {
    user,
    isAuthenticated,
    isLoading,
    setUser,
    setAuthenticated,
    setLoading,
    logout,
  };
};

export const useTeams = () => useAppStore((state) => state.teams);
export const usePlayers = () => useAppStore((state) => state.players);

export const useUI = () => {
  const theme = useAppStore((state) => state.theme);
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  const notifications = useAppStore((state) => state.notifications);
  const setTheme = useAppStore((state) => state.setTheme);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);
  const addNotification = useAppStore((state) => state.addNotification);
  const removeNotification = useAppStore((state) => state.removeNotification);

  return {
    theme,
    sidebarOpen,
    notifications,
    setTheme,
    toggleSidebar,
    addNotification,
    removeNotification,
  };
};

export const useError = () => {
  const error = useAppStore((state) => state.error);
  const setError = useAppStore((state) => state.setError);
  const clearError = useAppStore((state) => state.clearError);

  return { error, setError, clearError };
};
