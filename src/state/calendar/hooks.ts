import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { QueryKey } from "@tanstack/react-query";
import { calendarKeys, type EventFilters } from "./queryKeys";
import { CalendarAPI } from "../../infra/calendar/api";
import { CalendarRSVP } from "../../infra/calendar/rsvp";
import type {
  CalendarEventCreate,
  EventRSVP,
  CalendarEvent,
} from "../../domain/calendar/types";
import {
  CalendarEventSchema,
  EventRSVPSchema,
  CalendarCommentSchema,
} from "../../domain/calendar/types";

// Types for ranges & params
export interface EventsQueryParams {
  range?: { start: string; end: string };
  filters?: EventFilters;
  devMode?: string; // dev profile flag
  userId: string; // required to scope events
}

export function useEvents(params: EventsQueryParams) {
  const { range, filters, devMode, userId } = params;
  return useQuery({
    queryKey: calendarKeys.events(filters, range, devMode),
    queryFn: async () => {
      const data = await CalendarAPI.listUserEvents(userId, devMode, filters);
      if (import.meta.env.DEV && Array.isArray(data)) {
        for (const ev of data.slice(0, 25)) {
          const parse = CalendarEventSchema.safeParse(ev);
          if (!parse.success) {
            console.warn("Invalid CalendarEvent shape", parse.error.issues, ev);
          }
        }
      }
      return data;
    },
    // Keep previous data to avoid loading jank when filters/range adjust
    placeholderData: (prev) => prev,
  });
}

export function useEvent(id: string) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: calendarKeys.event(id),
    queryFn: async (): Promise<CalendarEvent | null> => {
      // Attempt to hydrate from any cached events query
      const cached = qc
        .getQueryCache()
        .findAll({ queryKey: ["calendar", "events"] })
        .map((q) => q.state.data as unknown)
        .filter(Boolean) as unknown[];
      for (const dataset of cached) {
        if (Array.isArray(dataset)) {
          const found = (dataset as CalendarEvent[]).find((e) => e.id === id);
          if (found) return found;
        }
      }
      const results = await CalendarAPI.search(id);
      const match = results.find((e) => e.id === id) ?? null;
      if (import.meta.env.DEV && match) {
        const parse = CalendarEventSchema.safeParse(match);
        if (!parse.success) {
          console.warn(
            "Invalid CalendarEvent shape",
            parse.error.issues,
            match
          );
        }
      }
      return match;
    },
    enabled: !!id,
  });
}

export function useCreateEvent(
  _userId: string,
  devMode?: string,
  filters?: EventFilters
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CalendarEventCreate) => CalendarAPI.createEvent(data),
    onMutate: async (data) => {
      const key = calendarKeys.events(
        filters,
        undefined,
        devMode
      ) as unknown as QueryKey;
      const previous = qc.getQueryData<CalendarEvent[]>(key) || [];
      const tempId = `temp-${Date.now()}`;
      const optimisticEvent: CalendarEvent = {
        id: tempId,
        title: data.title,
        start: data.start,
        type: data.type,
        rsvp_required: data.rsvp_required ?? false,
        end: data.end,
        team_id: data.team_id,
        location: data.location,
        tags: data.tags,
      } as CalendarEvent;
      qc.setQueryData<CalendarEvent[]>(key, [...previous, optimisticEvent]);
      return { key, previous, tempId };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx) qc.setQueryData(ctx.key, ctx.previous);
    },
    onSuccess: (created, _vars, ctx) => {
      if (!created) return;
      if (ctx) {
        const current = qc.getQueryData<CalendarEvent[]>(ctx.key) || [];
        qc.setQueryData<CalendarEvent[]>(
          ctx.key,
          current.map((ev) => (ev.id === ctx.tempId ? created : ev))
        );
      }
    },
    onSettled: () => {
      qc.invalidateQueries({
        queryKey: calendarKeys.events(filters, undefined, devMode),
      });
    },
  });
}

export function useUpdateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<CalendarEventCreate>;
    }) => CalendarAPI.updateEvent(id, updates),
    onMutate: async ({ id, updates }) => {
      const eventsQueries = qc
        .getQueryCache()
        .getAll()
        .filter(
          (q) =>
            Array.isArray(q.queryKey) &&
            q.queryKey[0] === "calendar" &&
            q.queryKey[1] === "events"
        );
      const snapshots: Array<{
        key: QueryKey;
        data: CalendarEvent[] | undefined;
      }> = [];
      eventsQueries.forEach((q) => {
        const key = q.queryKey;
        const old = q.state.data as CalendarEvent[] | undefined;
        snapshots.push({ key, data: old });
        if (old)
          qc.setQueryData<CalendarEvent[]>(
            key,
            old.map((ev) =>
              ev.id === id ? ({ ...ev, ...updates } as CalendarEvent) : ev
            )
          );
      });
      return { snapshots, id, updates };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.snapshots.forEach((s) => qc.setQueryData(s.key, s.data));
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["calendar", "events"] });
    },
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => CalendarAPI.deleteEvent(id),
    onMutate: async (id) => {
      const eventsQueries = qc
        .getQueryCache()
        .getAll()
        .filter(
          (q) =>
            Array.isArray(q.queryKey) &&
            q.queryKey[0] === "calendar" &&
            q.queryKey[1] === "events"
        );
      const snapshots: Array<{
        key: QueryKey;
        data: CalendarEvent[] | undefined;
      }> = [];
      eventsQueries.forEach((q) => {
        const key = q.queryKey;
        const old = q.state.data as CalendarEvent[] | undefined;
        snapshots.push({ key, data: old });
        if (old)
          qc.setQueryData<CalendarEvent[]>(
            key,
            old.filter((ev) => ev.id !== id)
          );
      });
      return { snapshots };
    },
    onError: (_err, _vars, ctx) =>
      ctx?.snapshots.forEach((s) => qc.setQueryData(s.key, s.data)),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["calendar", "events"] });
    },
  });
}

export function useRSVPs(eventId: string) {
  return useQuery({
    queryKey: calendarKeys.rsvps(eventId),
    queryFn: () => CalendarAPI.getRSVPs(eventId),
    enabled: !!eventId,
  });
}

export function useUpdateRSVP(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      userId: string;
      status: EventRSVP["status"];
      note?: string;
    }) => CalendarRSVP.upsert(eventId, vars.userId, vars.status, vars.note),
    onMutate: async (vars) => {
      const key = calendarKeys.rsvps(eventId);
      const prev = qc.getQueryData<EventRSVP[]>(key);
      if (prev) {
        const existing = prev.find((r) => r.user_id === vars.userId);
        let next;
        if (existing) {
          next = prev.map((r) =>
            r.user_id === vars.userId
              ? { ...r, status: vars.status, note: vars.note }
              : r
          );
        } else {
          next = [
            ...prev,
            {
              id: `temp-rsvp-${Date.now()}`,
              event_id: eventId,
              user_id: vars.userId,
              status: vars.status,
              note: vars.note,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ];
        }
        qc.setQueryData(key, next);
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) =>
      ctx?.prev && qc.setQueryData(calendarKeys.rsvps(eventId), ctx.prev),
    onSuccess: (saved, vars) => {
      if (!saved) return;
      if (import.meta.env.DEV) {
        const parse = EventRSVPSchema.safeParse(saved);
        if (!parse.success) {
          console.warn("Invalid EventRSVP shape", parse.error.issues, saved);
        }
      }
      const key = calendarKeys.rsvps(eventId);
      const current = qc.getQueryData<EventRSVP[]>(key);
      if (current) {
        const updated = current.map((r) =>
          r.user_id === vars.userId ? saved : r
        );
        // If was a new RSVP, ensure it's present
        const ensure = updated.some((r) => r.user_id === vars.userId)
          ? updated
          : [...updated, saved];
        qc.setQueryData<EventRSVP[]>(key, ensure);
      }
    },
    onSettled: () =>
      qc.invalidateQueries({ queryKey: calendarKeys.rsvps(eventId) }),
  });
}

export function useComments(eventId: string) {
  return useQuery({
    queryKey: calendarKeys.comments(eventId),
    queryFn: async () => {
      const data = await CalendarAPI.listComments(eventId);
      if (import.meta.env.DEV && Array.isArray(data)) {
        for (const c of data.slice(0, 50)) {
          const parse = CalendarCommentSchema.safeParse(c);
          if (!parse.success) {
            console.warn(
              "Invalid CalendarComment shape",
              parse.error.issues,
              c
            );
          }
        }
      }
      return data;
    },
    enabled: !!eventId,
  });
}

export function useAddComment(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) =>
      CalendarAPI.addComment({ event_id: eventId, body: body }),
    onMutate: async (body) => {
      const key = calendarKeys.comments(eventId);
      interface CommentLike {
        id: string;
        event_id: string;
        user_id: string;
        body: string;
        created_at: string;
        updated_at: string;
      }
      const prev = (qc.getQueryData<CommentLike[]>(key) || []) as CommentLike[];
      const optimistic = {
        id: `temp-comment-${Date.now()}`,
        event_id: eventId,
        user_id: "me",
        body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      qc.setQueryData(key, [...prev, optimistic]);
      return { prev };
    },
    onError: (_err, _vars, ctx) =>
      ctx?.prev && qc.setQueryData(calendarKeys.comments(eventId), ctx.prev),
    onSettled: () =>
      qc.invalidateQueries({ queryKey: calendarKeys.comments(eventId) }),
  });
}
