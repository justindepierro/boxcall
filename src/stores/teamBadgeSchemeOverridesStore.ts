import { create } from "zustand";

// Service deleted - using local types
type TeamBadgeSchemeOverrides = Record<string, unknown>;
type TeamBadgeSchemeOverridesPatch = Partial<TeamBadgeSchemeOverrides>;

type OverridesEntry = {
  overrides: TeamBadgeSchemeOverrides | null;
  loading: boolean;
  loaded: boolean;
};

type TeamBadgeSchemeOverridesState = {
  byTeamId: Record<string, OverridesEntry | undefined>;
  load: (teamId: string) => Promise<void>;
  set: (
    teamId: string,
    patch: TeamBadgeSchemeOverridesPatch
  ) => Promise<TeamBadgeSchemeOverrides | null>;
};

const initialEntry = (): OverridesEntry => ({
  overrides: null,
  loading: false,
  loaded: false,
});

export const useTeamBadgeSchemeOverridesStore =
  create<TeamBadgeSchemeOverridesState>((set, get) => ({
    byTeamId: {},

    load: async (teamId: string) => {
      const current = get().byTeamId[teamId];
      if (current?.loading) return;
      if (current?.loaded) return;

      set((s) => ({
        byTeamId: {
          ...s.byTeamId,
          [teamId]: {
            ...(s.byTeamId[teamId] ?? initialEntry()),
            loading: true,
          },
        },
      }));

      try {
        // Service deleted - return empty overrides
        const loaded = {};
        set((s) => ({
          byTeamId: {
            ...s.byTeamId,
            [teamId]: {
              overrides: loaded,
              loading: false,
              loaded: true,
            },
          },
        }));
      } catch {
        set((s) => ({
          byTeamId: {
            ...s.byTeamId,
            [teamId]: {
              overrides: null,
              loading: false,
              loaded: true,
            },
          },
        }));
      }
    },

    set: async (teamId: string, patch: TeamBadgeSchemeOverridesPatch) => {
      const current = get().byTeamId[teamId];

      set((s) => ({
        byTeamId: {
          ...s.byTeamId,
          [teamId]: {
            ...(s.byTeamId[teamId] ?? initialEntry()),
            overrides: current?.overrides ?? null,
            loading: true,
          },
        },
      }));

      try {
        // Service deleted - return merged overrides
        const saved = { ...(current?.overrides ?? {}), ...patch };
        set((s) => ({
          byTeamId: {
            ...s.byTeamId,
            [teamId]: {
              overrides: saved,
              loading: false,
              loaded: true,
            },
          },
        }));
        return saved;
      } catch {
        set((s) => ({
          byTeamId: {
            ...s.byTeamId,
            [teamId]: {
              overrides: current?.overrides ?? null,
              loading: false,
              loaded: true,
            },
          },
        }));
        return current?.overrides ?? null;
      }
    },
  }));
