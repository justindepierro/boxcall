/**
 * Search Query Execution
 *
 * Handles parallel database queries for global search
 */

import { supabase } from "../../../lib/supabase";
import { SEARCH_LIMITS } from "./constants";

export interface SearchQueryParams {
  searchTerm: string;
  activeTeamId: string;
  playbookId: string | null;
  signal: AbortSignal;
}

export interface RawSearchResults {
  plays: PlaySearchResult[] | null;
  formations: FormationSearchResult[] | null;
  players: PlayerSearchResult[] | null;
  announcements: AnnouncementSearchResult[] | null;
  gamePlans: GamePlanSearchResult[] | null;
  practiceScripts: PracticeScriptSearchResult[] | null;
  calendarEvents: CalendarEventSearchResult[] | null;
  equipment: EquipmentSearchResult[] | null;
}

// Raw result types from database
export interface PlaySearchResult {
  id: string;
  play_name: string;
  formation: string | null;
  one_word_play: string | null;
  personnel: string | null;
  p_type: string | null;
}

export interface FormationSearchResult {
  id: string;
  name: string;
}

export interface PlayerSearchResult {
  id: string;
  first_name: string | null;
  last_name: string | null;
  jersey_number: number | null;
  position: string | null;
}

export interface AnnouncementSearchResult {
  id: string;
  title: string;
  created_at: string;
}

export interface GamePlanSearchResult {
  id: string;
  opponent: string;
  game_date: string;
}

export interface PracticeScriptSearchResult {
  id: string;
  title: string;
}

export interface CalendarEventSearchResult {
  id: string;
  title: string;
  event_date: string;
  event_type: string | null;
}

export interface EquipmentSearchResult {
  id: string;
  name: string;
  category: string;
  quantity: number | null;
}

/**
 * Execute all search queries in parallel
 */
export async function executeSearchQueries(
  params: SearchQueryParams
): Promise<RawSearchResults> {
  const { searchTerm, activeTeamId, playbookId, signal } = params;

  const [
    playsResponse,
    formationsResponse,
    playersResponse,
    announcementsResponse,
    gamePlansResponse,
    practiceScriptsResponse,
    calendarEventsResponse,
    equipmentResponse,
  ] = await Promise.all([
    // Search plays (only if we have a playbook)
    searchPlays(playbookId, searchTerm, signal),
    // Search formations (only if we have a playbook)
    searchFormations(playbookId, searchTerm, signal),
    // Search players
    searchPlayers(activeTeamId, searchTerm, signal),
    // Search team announcements
    searchAnnouncements(activeTeamId, searchTerm, signal),
    // Search game plans
    searchGamePlans(activeTeamId, searchTerm, signal),
    // Search practice scripts
    searchPracticeScripts(activeTeamId, searchTerm, signal),
    // Search calendar events
    searchCalendarEvents(activeTeamId, searchTerm, signal),
    // Search equipment
    searchEquipment(activeTeamId, searchTerm, signal),
  ]);

  return {
    plays: playsResponse.data,
    formations: formationsResponse.data,
    players: playersResponse.data,
    announcements: announcementsResponse.data as
      | AnnouncementSearchResult[]
      | null,
    gamePlans: gamePlansResponse.data,
    practiceScripts: practiceScriptsResponse.data,
    calendarEvents: calendarEventsResponse.data,
    equipment: equipmentResponse.data,
  };
}

// Individual search functions
async function searchPlays(
  playbookId: string | null,
  searchTerm: string,
  signal: AbortSignal
) {
  if (!playbookId) return { data: null };

  return supabase
    .from("plays")
    .select("id, play_name, formation, one_word_play, personnel, p_type")
    .eq("playbook_id", playbookId)
    .or(
      `play_name.ilike.%${searchTerm}%,formation.ilike.%${searchTerm}%,one_word_play.ilike.%${searchTerm}%,personnel.ilike.%${searchTerm}%,p_type.ilike.%${searchTerm}%`
    )
    .limit(SEARCH_LIMITS.plays)
    .abortSignal(signal);
}

async function searchFormations(
  playbookId: string | null,
  searchTerm: string,
  signal: AbortSignal
) {
  if (!playbookId) return { data: null };

  return supabase
    .from("formations")
    .select("id, name")
    .eq("playbook_id", playbookId)
    .ilike("name", `%${searchTerm}%`)
    .limit(SEARCH_LIMITS.formations)
    .abortSignal(signal);
}

async function searchPlayers(
  teamId: string,
  searchTerm: string,
  signal: AbortSignal
) {
  return supabase
    .from("team_players")
    .select("id, first_name, last_name, jersey_number, position")
    .eq("team_id", teamId)
    .eq("is_active", true)
    .or(
      `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,nickname.ilike.%${searchTerm}%,position.ilike.%${searchTerm}%`
    )
    .limit(SEARCH_LIMITS.players)
    .abortSignal(signal);
}

async function searchAnnouncements(
  teamId: string,
  searchTerm: string,
  signal: AbortSignal
) {
  // team_announcements table not yet in generated Database types
  return (supabase as any)
    .from("team_announcements")
    .select("id, title, created_at")
    .eq("team_id", teamId)
    .is("deleted_at", null)
    .ilike("title", `%${searchTerm}%`)
    .limit(SEARCH_LIMITS.announcements)
    .abortSignal(signal);
}

async function searchGamePlans(
  teamId: string,
  searchTerm: string,
  signal: AbortSignal
) {
  return supabase
    .from("game_plans")
    .select("id, opponent, game_date")
    .eq("team_id", teamId)
    .ilike("opponent", `%${searchTerm}%`)
    .limit(SEARCH_LIMITS.gamePlans)
    .abortSignal(signal);
}

async function searchPracticeScripts(
  teamId: string,
  searchTerm: string,
  signal: AbortSignal
) {
  return supabase
    .from("practice_scripts")
    .select("id, title")
    .eq("team_id", teamId)
    .ilike("title", `%${searchTerm}%`)
    .limit(SEARCH_LIMITS.practiceScripts)
    .abortSignal(signal);
}

async function searchCalendarEvents(
  teamId: string,
  searchTerm: string,
  signal: AbortSignal
) {
  return supabase
    .from("calendar_events")
    .select("id, title, event_date, event_type")
    .eq("team_id", teamId)
    .ilike("title", `%${searchTerm}%`)
    .limit(SEARCH_LIMITS.calendarEvents)
    .abortSignal(signal);
}

async function searchEquipment(
  teamId: string,
  searchTerm: string,
  signal: AbortSignal
) {
  return supabase
    .from("equipment")
    .select("id, name, category, quantity")
    .eq("team_id", teamId)
    .ilike("name", `%${searchTerm}%`)
    .limit(SEARCH_LIMITS.equipment)
    .abortSignal(signal);
}

/**
 * Get playbook ID for a team (with caching support)
 */
export async function getPlaybookId(
  teamId: string,
  signal: AbortSignal
): Promise<string | null> {
  const { data: playbooks } = await supabase
    .from("playbooks")
    .select("id")
    .eq("team_id", teamId)
    .eq("is_active", true)
    .limit(1)
    .abortSignal(signal);

  return playbooks?.[0]?.id || null;
}
