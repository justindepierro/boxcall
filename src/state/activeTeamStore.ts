import { create } from "zustand";

type ActiveTeamState = {
  activeTeamId: string | null;
  setActiveTeamId: (id: string | null) => void;
};

const STORAGE_KEY = "activeTeamId";

function loadInitial(): string | null {
  try {
    const v = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    return v || null;
  } catch {
    return null;
  }
}

export const useActiveTeamStore = create<ActiveTeamState>((set) => ({
  activeTeamId: loadInitial(),
  setActiveTeamId: (id) => {
    try {
      if (typeof window !== "undefined") {
        if (id) localStorage.setItem(STORAGE_KEY, id);
        else localStorage.removeItem(STORAGE_KEY);
      }
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
