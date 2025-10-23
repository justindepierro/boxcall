import {
  getActiveTeamIdFromStore,
  useActiveTeamStore,
} from "../stores/activeTeamStore";

/**
 * Active Team helpers
 * Provides a single source of truth for reading/writing the active team id.
 */
export function getActiveTeamId(): string {
  try {
    const fromStore = getActiveTeamIdFromStore();
    // Treat "1" as invalid (old default) and use demo team instead
    if (fromStore && fromStore !== "1") return fromStore;
  } catch {
    // store may not be initialized yet
  }
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("activeTeamId");
      // Treat "1" as invalid and use demo team instead
      if (stored && stored !== "1") return stored;
      return "550e8400-e29b-41d4-a716-446655440000";
    } catch {
      return "550e8400-e29b-41d4-a716-446655440000";
    }
  }
  return "550e8400-e29b-41d4-a716-446655440000";
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
