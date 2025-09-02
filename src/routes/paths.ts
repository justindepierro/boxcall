// Centralized route constants and helpers

export const ROUTES = {
  ROOT: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  CALENDAR: "/calendar",
  TEAMS: "/teams",
  PLAYBOOK: "/playbook",
  BOXCALL: "/boxcall",
  LOGOUT: "/logout",
  CREATE_TEAM: "/create-team",
  JOIN_TEAM: "/join-team",
  CREATE_COACH_ACCOUNT: "/create-coach-account",
  COACH: "/coach",
  PLAYER: "/player",
  ABOUT: "/about",
  PRIVACY: "/privacy-policy",
  TERMS: "/terms-of-service",
  CONTACT: "/contact",
  DEV_DIAGNOSTICS: "/dev/diagnostics",
} as const;

export const teamRoutes = {
  bulletin: (teamId: string) => `/team/${teamId}/bulletin`,
  settings: (teamId: string) => `/team/${teamId}/settings`,
  analytics: (teamId: string) => `/team/${teamId}/analytics`,
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
