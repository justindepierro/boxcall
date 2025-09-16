import {
  getActiveTeamIdFromStore,
  useActiveTeamStore,
} from "../state/activeTeamStore";

/**
 * Active Team helpers
 * Provides a single source of truth for reading/writing the active team id.
 */
export function getActiveTeamId(): string {
  try {
    const fromStore = getActiveTeamIdFromStore();
    if (fromStore) return fromStore;
  } catch {
    // store may not be initialized yet
  }
  if (typeof window !== "undefined") {
    try {
      return localStorage.getItem("activeTeamId") || "1";
    } catch {
      return "1";
    }
  }
  return "1";
}

export function setActiveTeamId(teamId: string) {
  try {
    useActiveTeamStore.getState().setActiveTeamId(teamId);
    return;
  } catch {
    // store access failed, fall through to localStorage
  }
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("activeTeamId", teamId);
    } catch {
      // ignore storage errors
    }
  }
}
