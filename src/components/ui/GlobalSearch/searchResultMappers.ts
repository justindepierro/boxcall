/**
 * Search Result Mappers
 *
 * Transform raw database results into SearchResult format
 */

import type { SearchResult } from "./types";
import type { RawSearchResults } from "./searchQueries";
import { teamRoutes } from "../../../routes/paths";

/**
 * Transform all raw search results into formatted SearchResult array
 */
export function mapSearchResults(
  raw: RawSearchResults,
  activeTeamId: string
): SearchResult[] {
  return [
    ...mapPlays(raw.plays, activeTeamId),
    ...mapFormations(raw.formations),
    ...mapPlayers(raw.players),
    ...mapAnnouncements(raw.announcements, activeTeamId),
    ...mapGamePlans(raw.gamePlans, activeTeamId),
    ...mapPracticeScripts(raw.practiceScripts, activeTeamId),
    ...mapCalendarEvents(raw.calendarEvents, activeTeamId),
    ...mapEquipment(raw.equipment),
  ];
}

function mapPlays(
  plays: RawSearchResults["plays"],
  activeTeamId: string
): SearchResult[] {
  if (!plays) return [];

  return plays.map((play) => ({
    type: "play" as const,
    id: play.id,
    title: play.one_word_play || play.play_name || "Unnamed Play",
    subtitle: formatPlaySubtitle(play),
    url: teamRoutes.playbook(activeTeamId),
  }));
}

function formatPlaySubtitle(play: {
  formation: string | null;
  personnel: string | null;
  p_type: string | null;
}): string {
  const parts = ["Play"];
  if (play.formation) parts.push(play.formation);
  if (play.personnel) parts.push(play.personnel);
  if (play.p_type) parts.push(play.p_type);
  return parts.join(" • ");
}

function mapFormations(
  formations: RawSearchResults["formations"]
): SearchResult[] {
  if (!formations) return [];

  return formations.map((formation) => ({
    type: "formation" as const,
    id: formation.id,
    title: formation.name,
    subtitle: "Formation",
    url: `/playbook/formations`,
  }));
}

function mapPlayers(players: RawSearchResults["players"]): SearchResult[] {
  if (!players) return [];

  return players.map((player) => ({
    type: "player" as const,
    id: player.id,
    title: `${player.first_name || ""} ${player.last_name || ""}`.trim(),
    subtitle: `Player • #${player.jersey_number || "N/A"} ${player.position || ""}`,
    url: `/roster/${player.id}`,
  }));
}

function mapAnnouncements(
  announcements: RawSearchResults["announcements"],
  activeTeamId: string
): SearchResult[] {
  if (!announcements) return [];

  return announcements.map((announcement) => ({
    type: "announcement" as const,
    id: announcement.id,
    title: announcement.title,
    subtitle: `Announcement • ${new Date(announcement.created_at).toLocaleDateString()}`,
    url: teamRoutes.announcements(activeTeamId),
  }));
}

function mapGamePlans(
  gamePlans: RawSearchResults["gamePlans"],
  activeTeamId: string
): SearchResult[] {
  if (!gamePlans) return [];

  return gamePlans.map((gamePlan) => ({
    type: "game_plan" as const,
    id: gamePlan.id,
    title: `vs ${gamePlan.opponent}`,
    subtitle: `Game Plan • ${new Date(gamePlan.game_date).toLocaleDateString()}`,
    url: teamRoutes.gamePlans(activeTeamId),
  }));
}

function mapPracticeScripts(
  practiceScripts: RawSearchResults["practiceScripts"],
  activeTeamId: string
): SearchResult[] {
  if (!practiceScripts) return [];

  return practiceScripts.map((script) => ({
    type: "practice_script" as const,
    id: script.id,
    title: script.title,
    subtitle: "Practice Script",
    url: teamRoutes.practicePlans(activeTeamId),
  }));
}

function mapCalendarEvents(
  calendarEvents: RawSearchResults["calendarEvents"],
  activeTeamId: string
): SearchResult[] {
  if (!calendarEvents) return [];

  return calendarEvents.map((event) => ({
    type: "calendar_event" as const,
    id: event.id,
    title: event.title,
    subtitle: `${event.event_type || "Event"} • ${new Date(event.event_date).toLocaleDateString()}`,
    url: teamRoutes.calendar(activeTeamId),
  }));
}

function mapEquipment(
  equipment: RawSearchResults["equipment"]
): SearchResult[] {
  if (!equipment) return [];

  return equipment.map((item) => ({
    type: "equipment" as const,
    id: item.id,
    title: item.name,
    subtitle: `Equipment • ${item.category} (${item.quantity} available)`,
    url: `/equipment`,
  }));
}
