import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listTeamPosts, createPost, updatePostPin } from "../services/postsService";
import type { TeamPostListItem } from "../services/postsService";
import { listTeamEvents, createEvent } from "../services/eventsService";
import type {
  TeamEventListItem,
  CreateEventInput,
} from "../services/eventsService";
import { listGameResults, logGameResult } from "../services/gameResultsService";
import type {
  GameResultListItem,
  LogGameResultInput,
} from "../services/gameResultsService";
import { getSeasonStats } from "../services/statsService";
import {
  postCreateStarted,
  postCreateSucceeded,
  postCreateFailed,
  eventCreateStarted,
  eventCreateSucceeded,
  eventCreateFailed,
  gameResultLogStarted,
  gameResultLogSucceeded,
  gameResultLogFailed,
} from "../lib/telemetry";

// Query keys
const qk = {
  posts: (teamId: string) => ["team", teamId, "posts"] as const,
  events: (teamId: string) => ["team", teamId, "events"] as const,
  results: (teamId: string) => ["team", teamId, "game_results"] as const,
  stats: (teamId: string) => ["team", teamId, "season_stats"] as const,
};

// Posts
export function useTeamPosts(teamId: string | undefined) {
  return useQuery({
    queryKey: teamId ? qk.posts(teamId) : ["team", "no-id", "posts"],
    queryFn: () => listTeamPosts(teamId || ""),
    enabled: !!teamId,
  });
}
export function useCreatePost(teamId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      if (!teamId) throw new Error("Missing teamId");
      postCreateStarted();
      try {
        const created = await createPost({ teamId, content });
        postCreateSucceeded({ id: created.id });
        return created;
      } catch (e) {
        postCreateFailed({ error: (e as Error).message });
        throw e;
      }
    },
    onMutate: async (content: string) => {
      if (!teamId) return;
      await qc.cancelQueries({ queryKey: qk.posts(teamId) });
      const prev = qc.getQueryData(qk.posts(teamId));
      const optimistic = {
        id: `optimistic-${Date.now()}`,
        team_id: teamId,
        author_id: "me",
        content,
        created_at: new Date().toISOString(),
        is_pinned: false,
      };
      qc.setQueryData<TeamPostListItem[] | undefined>(
        qk.posts(teamId),
        (old) => (old ? [optimistic, ...old] : [optimistic])
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (teamId && ctx?.prev) qc.setQueryData(qk.posts(teamId), ctx.prev);
    },
    onSuccess: (data) => {
      if (!teamId) return;
      qc.setQueryData<TeamPostListItem[] | undefined>(
        qk.posts(teamId),
        (old) => {
          if (!old) return [data];
          return [
            data,
            ...old.filter((p) => !String(p.id).startsWith("optimistic-")),
          ];
        }
      );
    },
    onSettled: () => {
      if (teamId) qc.invalidateQueries({ queryKey: qk.posts(teamId) });
    },
  });
}

export function usePinPost(teamId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ postId, pin }: { postId: string; pin: boolean }) => {
      return updatePostPin(postId, pin);
    },
    onMutate: async ({ postId, pin }) => {
      if (!teamId) return;
      await qc.cancelQueries({ queryKey: qk.posts(teamId) });
      const prev = qc.getQueryData<TeamPostListItem[] | undefined>(qk.posts(teamId));
      if (prev) {
        qc.setQueryData<TeamPostListItem[] | undefined>(qk.posts(teamId), prev.map(p => p.id === postId ? { ...p, is_pinned: pin } : p));
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (teamId && ctx?.prev) qc.setQueryData(qk.posts(teamId), ctx.prev);
    },
    onSettled: () => {
      if (teamId) qc.invalidateQueries({ queryKey: qk.posts(teamId) });
    }
  });
}

// Events
export function useTeamEvents(teamId: string | undefined) {
  return useQuery({
    queryKey: teamId ? qk.events(teamId) : ["team", "no-id", "events"],
    queryFn: () => listTeamEvents(teamId || ""),
    enabled: !!teamId,
  });
}
export function useCreateEvent(teamId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      input: Omit<CreateEventInput, "teamId"> & { teamId?: string }
    ) => {
      const tid = input.teamId || teamId;
      if (!tid) throw new Error("Missing teamId");
      eventCreateStarted();
      try {
        const created = await createEvent({
          teamId: tid,
          title: input.title,
          eventType: input.eventType,
          startsAt: input.startsAt,
          location: input.location,
        });
        eventCreateSucceeded({ id: created.id });
        return created;
      } catch (e) {
        eventCreateFailed({ error: (e as Error).message });
        throw e;
      }
    },
    onMutate: async (input) => {
      const tid = input.teamId || teamId;
      if (!tid) return;
      await qc.cancelQueries({ queryKey: qk.events(tid) });
      const prev = qc.getQueryData(qk.events(tid));
      const optimistic = {
        id: `optimistic-${Date.now()}`,
        team_id: tid,
        title: input.title,
        event_type: input.eventType,
        starts_at: input.startsAt,
        location: input.location || null,
        created_at: new Date().toISOString(),
      };
      qc.setQueryData<TeamEventListItem[] | undefined>(qk.events(tid), (old) =>
        old ? [optimistic, ...old] : [optimistic]
      );
      return { prev, tid };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.tid && ctx.prev) qc.setQueryData(qk.events(ctx.tid), ctx.prev);
    },
    onSuccess: (data, _vars, ctx) => {
      if (!ctx?.tid) return;
      qc.setQueryData<TeamEventListItem[] | undefined>(
        qk.events(ctx.tid),
        (old) => {
          if (!old) return [data];
          return [
            data,
            ...old.filter((e) => !String(e.id).startsWith("optimistic-")),
          ];
        }
      );
    },
    onSettled: (_data, _err, _vars, ctx) => {
      if (ctx?.tid) qc.invalidateQueries({ queryKey: qk.events(ctx.tid) });
    },
  });
}

// Game Results
export function useGameResults(teamId: string | undefined) {
  return useQuery({
    queryKey: teamId ? qk.results(teamId) : ["team", "no-id", "game_results"],
    queryFn: () => listGameResults(teamId || ""),
    enabled: !!teamId,
  });
}
export function useLogGameResult(teamId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      input: Omit<LogGameResultInput, "teamId"> & { teamId?: string }
    ) => {
      const tid = input.teamId || teamId;
      if (!tid) throw new Error("Missing teamId");
      gameResultLogStarted();
      try {
        const created = await logGameResult({
          teamId: tid,
          gameDate: input.gameDate,
          opponent: input.opponent,
          site: input.site,
          pointsFor: input.pointsFor,
          pointsAgainst: input.pointsAgainst,
          notes: input.notes,
        });
        gameResultLogSucceeded({ id: created.id });
        return created;
      } catch (e) {
        gameResultLogFailed({ error: (e as Error).message });
        throw e;
      }
    },
    onMutate: async (input) => {
      const tid = input.teamId || teamId;
      if (!tid) return;
      await qc.cancelQueries({ queryKey: qk.results(tid) });
      const prev = qc.getQueryData(qk.results(tid));
      const optimistic = {
        id: `optimistic-${Date.now()}`,
        team_id: tid,
        game_date: input.gameDate,
        opponent: input.opponent,
        site: input.site,
        points_for: input.pointsFor,
        points_against: input.pointsAgainst,
        created_at: new Date().toISOString(),
      };
      qc.setQueryData<GameResultListItem[] | undefined>(
        qk.results(tid),
        (old) => (old ? [optimistic, ...old] : [optimistic])
      );
      return { prev, tid };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.tid && ctx.prev) qc.setQueryData(qk.results(ctx.tid), ctx.prev);
    },
    onSuccess: (_data, _vars, ctx) => {
      if (ctx?.tid) qc.invalidateQueries({ queryKey: qk.stats(ctx.tid) });
    },
    onSettled: (_data, _err, _vars, ctx) => {
      if (ctx?.tid) qc.invalidateQueries({ queryKey: qk.results(ctx.tid) });
    },
  });
}

// Season Stats
export function useSeasonStats(teamId: string | undefined) {
  return useQuery({
    queryKey: teamId ? qk.stats(teamId) : ["team", "no-id", "season_stats"],
    queryFn: () => getSeasonStats(teamId || ""),
    enabled: !!teamId,
  });
}
