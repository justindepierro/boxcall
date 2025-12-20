import { create } from "zustand";
import {
  readLocalString,
  removeLocalItem,
  storageKeys,
  writeLocalString,
} from "../utils/storage";

type ActiveTeamState = {
  activeTeamId: string | null;
  setActiveTeamId: (id: string | null) => void;
};

function loadInitial(): string | null {
  try {
    const v = readLocalString(storageKeys.activeTeamId);
    // Treat "1" as invalid (old default) and return null instead
    return v && v !== "1" ? v : null;
  } catch {
    return null;
  }
}

export const useActiveTeamStore = create<ActiveTeamState>((set) => ({
  activeTeamId: loadInitial(),
  setActiveTeamId: (id) => {
    try {
      if (id) writeLocalString(storageKeys.activeTeamId, id);
      else removeLocalItem(storageKeys.activeTeamId);
    } catch {
      // ignore storage errors
    }
    set({ activeTeamId: id });
  },
}));

export function getActiveTeamIdFromStore(): string | null {
  try {
    return useActiveTeamStore.getState().activeTeamId;
  } catch {
    return null;
  }
}
