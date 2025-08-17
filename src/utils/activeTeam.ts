/**
 * Active Team helpers
 * Provides a single source of truth for reading/writing the active team id.
 */
export function getActiveTeamId(): string {
  let activeTeamId = "1";
  try {
    const stored = localStorage.getItem("activeTeamId");
    if (stored) activeTeamId = stored;
  } catch {
    // ignore SSR or storage access issues
  }
  return activeTeamId;
}

export function setActiveTeamId(teamId: string) {
  try {
    localStorage.setItem("activeTeamId", teamId);
  } catch {
    // ignore
  }
}
