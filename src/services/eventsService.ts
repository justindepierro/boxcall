import { supabase } from "../lib/supabase";

export interface TeamEventListItem {
  id: string;
  team_id: string;
  title: string;
  event_type: string;
  starts_at: string;
  location: string | null;
  created_at: string | null;
}

const EVENT_COLUMNS =
  "id, team_id, title, event_type, starts_at, location, created_at" as const;

export async function listTeamEvents(teamId: string): Promise<TeamEventListItem[]> {
  if (!teamId) return [];
  const { data, error } = await supabase
    .from("team_events")
    .select(EVENT_COLUMNS)
    .eq("team_id", teamId)
    .order("starts_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export interface CreateEventInput {
  teamId: string;
  title: string;
  eventType: string;
  startsAt: string; // ISO
  location?: string;
}

export async function createEvent(input: CreateEventInput) {
  const { teamId, title, eventType, startsAt, location } = input;
  const { data, error } = await supabase
    .from("team_events")
    .insert({
      team_id: teamId,
      title,
      event_type: eventType,
      starts_at: startsAt,
      location,
    })
    .select(EVENT_COLUMNS)
    .single();
  if (error) throw error;
  return data;
}
