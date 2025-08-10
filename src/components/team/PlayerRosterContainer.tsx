import React from "react";
import { useRoster } from "../../hooks/useRoster";
import { PlayerList } from "./PlayerList";
import { Button } from "../ui";
import type { TeamPlayer } from "../../types/team-management";
import type { RosterPlayerView } from "../../services/rosterService";

type ExtendedRosterPlayer = RosterPlayerView & {
  first_name?: string;
  last_name?: string;
  email?: string;
};

// Temporary adapter mapping from RosterPlayerView to TeamPlayer shape subset.
function mapToTeamPlayer(view: ExtendedRosterPlayer): TeamPlayer {
  return {
    id: view.id,
    team_id: view.team_id,
    user_id: view.user_id ?? undefined,
    first_name: view.first_name || "Unknown",
    last_name: view.last_name || "Player",
    email: view.email || undefined,
    phone: undefined,
    parent_email: undefined,
    positions: view.position ? [view.position] : [],
    jersey_number: view.jersey_number || undefined,
    height: view.height_inches
      ? `${Math.floor(view.height_inches / 12)}'${view.height_inches % 12}`
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
}

export const PlayerRosterContainer: React.FC<PlayerRosterContainerProps> = ({
  teamId,
}) => {
  const { players: rosterPlayers, loading, error, refresh } = useRoster(teamId);

  const mapped: TeamPlayer[] = (rosterPlayers as ExtendedRosterPlayer[]).map(
    mapToTeamPlayer
  );

  if (loading) return <div className="p-4 text-sm">Loading roster…</div>;
  if (error)
    return (
      <div className="p-4 text-sm text-red-600">
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

  return (
    <PlayerList
      players={mapped}
      onEditPlayer={(p) => console.log("edit player", p.id)}
      onDeletePlayer={(id) => console.log("delete player", id)}
      onAddPlayer={() => console.log("add player")}
    />
  );
};
