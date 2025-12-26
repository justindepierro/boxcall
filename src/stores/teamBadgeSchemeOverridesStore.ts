import { create } from "zustand";

import {
  TeamBadgeSchemeOverridesService,
  type TeamBadgeSchemeOverrides,
  type TeamBadgeSchemeOverridesPatch,
} from "../services/teamBadgeSchemeOverridesService";

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
        const loaded = await TeamBadgeSchemeOverridesService.get(teamId);
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
        const saved = await TeamBadgeSchemeOverridesService.set(teamId, patch);
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
