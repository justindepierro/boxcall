import React from "react";

import { useRoster } from "../../hooks/useRoster";
import { Button } from "../ui";

import { PlayerList } from "./PlayerList";

import type { RosterPlayerView } from "../../services/rosterService";
import type { TeamPlayer } from "../../types/team-management";

// Adapter to convert RosterPlayerView to TeamPlayer for PlayerList compatibility
function mapRosterToTeamPlayer(view: RosterPlayerView): TeamPlayer {
  return {
    id: view.id,
    team_id: view.team_id,
    user_id: view.user_id || undefined,
    first_name: view.first_name || "Unknown",
    last_name: view.last_name || "Player",
    email: view.email_address || undefined,
    phone: view.phone_number || undefined,
    parent_email: view.parent_contact || undefined,
    positions: view.position ? [view.position] : [],
    jersey_number: view.jersey_number || undefined,
    height: view.height_inches
      ? `${Math.floor(view.height_inches / 12)}'${view.height_inches % 12}"`
      : undefined,
    weight: view.weight_pounds || undefined,
    graduation_year: view.graduation_year || undefined,
    team_level: (view.class_year || "varsity") as TeamPlayer["team_level"],
    created_at: view.created_at || new Date().toISOString(),
    updated_at: view.updated_at || new Date().toISOString(),
  };
}

interface PlayerRosterContainerProps {
  teamId: string;
  compact?: boolean; // For sidebar display
}

export const PlayerRosterContainer: React.FC<PlayerRosterContainerProps> = ({
  teamId,
  compact = false,
}) => {
  const { players: rosterPlayers, loading, error, refresh } = useRoster(teamId);

  const mappedPlayers: TeamPlayer[] = rosterPlayers.map(mapRosterToTeamPlayer);

  if (loading) return <div className="p-4 text-sm">Loading roster…</div>;
  if (error)
    return (
      <div className="p-4 text-sm text-text-error">
        Roster error: {error}{" "}
        <Button
          variant="link"
          size="xs"
          onClick={refresh}
          className="p-0 h-auto align-baseline"
        >
          Retry
        </Button>
      </div>
    );

  // Compact list view for sidebar
  if (compact) {
    return (
      <div className="space-y-2">
        {mappedPlayers.slice(0, 10).map((player) => (
          <div
            key={player.id}
            className="flex items-center gap-3 p-2 hover:bg-surface-secondary rounded-lg transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 bg-brand-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-brand-primary flex-shrink-0">
              {player.jersey_number || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary truncate">
                {player.first_name} {player.last_name}
              </p>
              <p className="text-xs text-secondary truncate">
                {player.positions[0] || "Player"}
              </p>
            </div>
          </div>
        ))}
        {mappedPlayers.length > 10 && (
          <button className="w-full text-center text-xs text-brand-primary hover:text-brand-secondary py-2">
            View all {mappedPlayers.length} players
          </button>
        )}
      </div>
    );
  }

  return (
    <PlayerList
      players={mappedPlayers}
      onEditPlayer={(p) => console.info("edit player", p.id)}
      onDeletePlayer={(id) => console.info("delete player", id)}
      onAddPlayer={() => console.info("add player")}
    />
  );
};
