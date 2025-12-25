/**
 * Search Query Execution
 *
 * Handles parallel database queries for global search
 */

import { fromAny, table } from "../../../data/supabase/db";
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

type GlobalSearchRpcResultType =
  | "play"
  | "formation"
  | "player"
  | "announcement"
  | "game_plan"
  | "practice_script"
  | "calendar_event"
  | "equipment";

interface GlobalSearchRpcRow {
  result_type: GlobalSearchRpcResultType;
  id: string;
  play_name: string | null;
  formation: string | null;
  one_word_play: string | null;
  personnel: string | null;
  p_type: string | null;
  name: string | null;
  first_name: string | null;
  last_name: string | null;
  jersey_number: number | null;
  player_position: string | null;
  title: string | null;
  created_at: string | null;
  opponent: string | null;
  game_date: string | null;
  event_date: string | null;
  event_type: string | null;
  category: string | null;
  quantity: number | null;
  score: number | null;
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

  // Prefer a single fast RPC when available.
  // Falls back to existing parallel queries if the RPC isn't deployed yet.
  const rpcResults = await tryExecuteSearchRpc({
    searchTerm,
    activeTeamId,
    playbookId,
    signal,
  });

  if (rpcResults) {
    return rpcResults;
  }

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

// eslint-disable-next-line complexity
async function tryExecuteSearchRpc(params: SearchQueryParams) {
  const { searchTerm, activeTeamId, playbookId, signal } = params;

  // Mirror the existing limits, but allow a slightly larger total so ranking has room.
  const limitPerType = Math.max(
    SEARCH_LIMITS.plays,
    SEARCH_LIMITS.formations,
    SEARCH_LIMITS.players,
    SEARCH_LIMITS.announcements,
    SEARCH_LIMITS.gamePlans,
    SEARCH_LIMITS.practiceScripts,
    SEARCH_LIMITS.calendarEvents,
    SEARCH_LIMITS.equipment
  );

  const limitTotal =
    SEARCH_LIMITS.plays +
    SEARCH_LIMITS.formations +
    SEARCH_LIMITS.players +
    SEARCH_LIMITS.announcements +
    SEARCH_LIMITS.gamePlans +
    SEARCH_LIMITS.practiceScripts +
    SEARCH_LIMITS.calendarEvents +
    SEARCH_LIMITS.equipment;

  try {
    const { data, error } = await (supabase as any)
      .rpc("boxcall_global_search", {
        p_team_id: activeTeamId,
        p_query: searchTerm,
        p_playbook_id: playbookId,
        p_limit_per_type: limitPerType,
        p_limit_total: limitTotal,
      })
      .abortSignal(signal);

    if (error) {
      // Function doesn't exist yet / not deployed in this environment
      return null;
    }

    const rows: GlobalSearchRpcRow[] = Array.isArray(data) ? data : [];
    if (!rows.length) {
      return {
        plays: [],
        formations: [],
        players: [],
        announcements: [],
        gamePlans: [],
        practiceScripts: [],
        calendarEvents: [],
        equipment: [],
      } as RawSearchResults;
    }

    const plays: PlaySearchResult[] = [];
    const formations: FormationSearchResult[] = [];
    const players: PlayerSearchResult[] = [];
    const announcements: AnnouncementSearchResult[] = [];
    const gamePlans: GamePlanSearchResult[] = [];
    const practiceScripts: PracticeScriptSearchResult[] = [];
    const calendarEvents: CalendarEventSearchResult[] = [];
    const equipment: EquipmentSearchResult[] = [];

    for (const row of rows) {
      switch (row.result_type) {
        case "play":
          plays.push({
            id: row.id,
            play_name: row.play_name || "",
            formation: row.formation,
            one_word_play: row.one_word_play,
            personnel: row.personnel,
            p_type: row.p_type,
          });
          break;
        case "formation":
          if (row.name) {
            formations.push({ id: row.id, name: row.name });
          }
          break;
        case "player":
          players.push({
            id: row.id,
            first_name: row.first_name,
            last_name: row.last_name,
            jersey_number: row.jersey_number,
            position: row.player_position,
          });
          break;
        case "announcement":
          if (row.title && row.created_at) {
            announcements.push({
              id: row.id,
              title: row.title,
              created_at: row.created_at,
            });
          }
          break;
        case "game_plan":
          if (row.opponent && row.game_date) {
            gamePlans.push({
              id: row.id,
              opponent: row.opponent,
              game_date: row.game_date,
            });
          }
          break;
        case "practice_script":
          if (row.title) {
            practiceScripts.push({ id: row.id, title: row.title });
          }
          break;
        case "calendar_event":
          if (row.title && row.event_date) {
            calendarEvents.push({
              id: row.id,
              title: row.title,
              event_date: row.event_date,
              event_type: row.event_type,
            });
          }
          break;
        case "equipment":
          if (row.name && row.category) {
            equipment.push({
              id: row.id,
              name: row.name,
              category: row.category,
              quantity: row.quantity,
            });
          }
          break;
      }
    }

    return {
      plays,
      formations,
      players,
      announcements,
      gamePlans,
      practiceScripts,
      calendarEvents,
      equipment,
    } as RawSearchResults;
  } catch {
    return null;
  }
}

// Individual search functions
async function searchPlays(
  playbookId: string | null,
  searchTerm: string,
  signal: AbortSignal
) {
  if (!playbookId) return { data: null };

  return table("plays")
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

  return table("formations")
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
  return table("team_players")
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
  return fromAny("team_announcements")
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
  return table("game_plans")
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
  return table("practice_scripts")
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
  return table("calendar_events")
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
  return table("equipment")
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
  // Prefer the active playbook, but fall back to any playbook so search can still
  // surface plays/formations for teams that haven't marked one as active.
  const { data: activePlaybooks } = await table("playbooks")
    .select("id")
    .eq("team_id", teamId)
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .abortSignal(signal);

  const activeId = activePlaybooks?.[0]?.id;
  if (activeId) return activeId;

  const { data: anyPlaybooks } = await table("playbooks")
    .select("id")
    .eq("team_id", teamId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .abortSignal(signal);

  return anyPlaybooks?.[0]?.id || null;
}
