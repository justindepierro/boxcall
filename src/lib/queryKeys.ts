/**
 * React Query query-key factories
 *
 * Single source of truth for cache keys across hooks, prefetch, and invalidation.
 */

export const queryKeys = {
  all: ["boxcall"] as const,

  // Cross-cutting / aggregate (admin-style or multi-team views)
  playbooksAll: () => [...queryKeys.all, "playbooks", "all"] as const,
  playsAll: () => [...queryKeys.all, "plays", "all"] as const,
  playsAllPage: (page: number) => [...queryKeys.playsAll(), "page", page] as const,
  playsAllTotalCount: () => [...queryKeys.playsAll(), "totalCount"] as const,

  // Teams
  teams: () => [...queryKeys.all, "teams"] as const,
  team: (teamId: string) => [...queryKeys.teams(), teamId] as const,
  teamMembers: (teamId: string) =>
    [...queryKeys.team(teamId), "members"] as const,
  teamMembersCount: (teamId: string) =>
    [...queryKeys.team(teamId), "members", "count"] as const,
  teamMembershipRole: (teamId: string, userId: string) =>
    [...queryKeys.team(teamId), "membership_role", userId] as const,

  // Playbooks
  playbooks: (teamId: string) =>
    [...queryKeys.team(teamId), "playbooks"] as const,
  playbook: (playbookId: string) =>
    [...queryKeys.all, "playbook", playbookId] as const,

  // Plays
  plays: (playbookIds: string[]) =>
    [...queryKeys.all, "plays", ...playbookIds] as const,
  play: (playId: string) => [...queryKeys.all, "play", playId] as const,
  playsCount: (teamId: string) =>
    [...queryKeys.team(teamId), "plays", "count"] as const,

  // Formations
  formations: (playbookIds: string[]) =>
    [...queryKeys.all, "formations", ...playbookIds] as const,
  formationsByPlaybook: (playbookId: string) =>
    [...queryKeys.all, "formations", playbookId] as const,
  incompleteFormations: (playbookId: string) =>
    [...queryKeys.formationsByPlaybook(playbookId), "incomplete"] as const,
  directionReview: (playbookId: string) =>
    [...queryKeys.formationsByPlaybook(playbookId), "review"] as const,
  formation: (formationId: string) =>
    [...queryKeys.all, "formation", formationId] as const,
  oppositeFormation: (formationId: string) =>
    [...queryKeys.formation(formationId), "opposite"] as const,

  // Game Plans
  gamePlans: (teamId: string) =>
    [...queryKeys.team(teamId), "gamePlans"] as const,
  gamePlan: (gamePlanId: string) =>
    [...queryKeys.all, "gamePlan", gamePlanId] as const,

  // Roster
  roster: () => [...queryKeys.all, "roster"] as const,
  rosterTeam: (teamId: string) => [...queryKeys.roster(), teamId] as const,
  rosterPlayer: (playerId: string) =>
    [...queryKeys.roster(), "player", playerId] as const,

  // Personnel
  personnel: () => [...queryKeys.all, "personnel"] as const,
  personnelConfigurations: (playbookId: string) =>
    [...queryKeys.personnel(), "configurations", playbookId] as const,
  personnelConfiguration: (playbookId: string, name: string) =>
    [...queryKeys.personnel(), "configuration", playbookId, name] as const,
  personnelPlayers: (configId: string) =>
    [...queryKeys.personnel(), "players", configId] as const,

  // Calendar
  calendar: () => [...queryKeys.all, "calendar"] as const,
  calendarEventsAll: () => [...queryKeys.calendar(), "events"] as const,
  calendarEvents: (
    filters?: {
      teamIds?: string[];
      eventTypes?: string[];
      dateRange?: { start: string; end: string };
      tags?: string[];
    },
    range?: { start: string; end: string },
    devMode?: string
  ) =>
    [
      ...queryKeys.calendarEventsAll(),
      {
        ...(filters || {}),
        range: range ? { s: range.start, e: range.end } : undefined,
        devMode,
      },
    ] as const,
  calendarEvent: (id: string) => [...queryKeys.calendar(), "event", id] as const,
  calendarRsvps: (eventId: string) =>
    [...queryKeys.calendar(), "rsvps", eventId] as const,
  calendarComments: (eventId: string) =>
    [...queryKeys.calendar(), "comments", eventId] as const,

  // Practice Scripts
  practiceScripts: (teamId: string) =>
    [...queryKeys.team(teamId), "practiceScripts"] as const,
  practiceScript: (practiceScriptId: string) =>
    [...queryKeys.all, "practiceScript", practiceScriptId] as const,

  // Users
  profile: (userId: string) => [...queryKeys.all, "profile", userId] as const,
  userTeams: (userId: string) =>
    [...queryKeys.all, "user", userId, "team_memberships"] as const,
  userTeamMemberships: (userId: string) =>
    [...queryKeys.all, "user", userId, "team_memberships"] as const,
} as const;
