// Centralized route constants and helpers

export const ROUTES = {
  ROOT: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  CALENDAR: "/calendar",
  PLANNER: "/planner",
  TEAMS: "/teams",
  PLAYBOOK: "/playbook",
  PRACTICE_PLANS: "/practice-plans",
  GAME_PLANS: "/game-plans",
  BOXCALL: "/boxcall",
  LOGOUT: "/logout",
  CREATE_TEAM: "/create-team",
  JOIN_TEAM: "/join-team",
  CREATE_COACH_ACCOUNT: "/create-coach-account",
  COACH: "/coach",
  PLAYER: "/player",
  ADMIN: "/admin",
  ABOUT: "/about",
  PRIVACY: "/privacy-policy",
  TERMS: "/terms-of-service",
  CONTACT: "/contact",
  DEV_DIAGNOSTICS: "/dev/diagnostics",
  COLLABORATIVE_DEMO: "/collaborative-demo",
  DESIGN_SYSTEM: "/design-system",
} as const;

export const teamRoutes = {
  bulletin: (teamId: string) => `/team/${teamId}/bulletin`,
  settings: (teamId: string) => `/team/${teamId}/settings`,
  analytics: (teamId: string) => `/team/${teamId}/analytics`,
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
