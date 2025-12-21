/**
 * React Query query-key factories
 *
 * Single source of truth for cache keys across hooks, prefetch, and invalidation.
 */

export const queryKeys = {
  all: ["boxcall"] as const,

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
