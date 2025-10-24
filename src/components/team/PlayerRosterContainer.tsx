import React, { useState, useEffect, useRef, useCallback } from "react";

import { useRoster } from "../../hooks/useRoster";
import { Button } from "../ui";
import { UserProfilePopover } from "../ui/UserProfilePopover";

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
    email: undefined, // Not in RosterPlayerView
    phone: undefined, // Not in RosterPlayerView
    parent_email: undefined, // Not in RosterPlayerView
    positions: view.position ? [view.position] : [],
    jersey_number: view.jersey_number || undefined,
    height: view.height_inches
      ? `${Math.floor(view.height_inches / 12)}'${view.height_inches % 12}"`
      : undefined,
    weight: view.weight_lbs || undefined,
    graduation_year: undefined, // Not in RosterPlayerView
    team_level: (view.grade_level || "varsity") as TeamPlayer["team_level"],
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
  const [visibleCount, setVisibleCount] = useState(10);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const mappedPlayers: TeamPlayer[] = rosterPlayers.map(mapRosterToTeamPlayer);

  // Reset visible count when players change
  useEffect(() => {
    setVisibleCount(10);
  }, [rosterPlayers.length]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (!containerRef.current || loadingRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

    // Load more when user scrolls past 80%
    if (scrollPercentage > 0.8 && visibleCount < mappedPlayers.length) {
      loadingRef.current = true;
      // Add small delay to prevent multiple triggers
      setTimeout(() => {
        setVisibleCount((prev) => Math.min(prev + 10, mappedPlayers.length));
        loadingRef.current = false;
      }, 100);
    }
  }, [visibleCount, mappedPlayers.length]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

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

  const visiblePlayers = mappedPlayers.slice(0, visibleCount);
  const hasMore = visibleCount < mappedPlayers.length;

  // Compact list view for sidebar with infinite scroll
  if (compact) {
    return (
      <div className="space-y-2">
        <div ref={containerRef} className="space-y-2 max-h-96 overflow-y-auto">
          {visiblePlayers.map((player) => {
            const playerTrigger = (
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
            );

            // Show popover if player has user_id
            if (player.user_id) {
              return (
                <UserProfilePopover
                  key={player.id}
                  userId={player.user_id}
                  trigger={playerTrigger}
                  showOnHover
                  teamId={teamId}
                />
              );
            }

            return playerTrigger;
          })}

          {hasMore && (
            <div className="text-center py-2 text-xs text-secondary">
              Scroll for more ({visibleCount} of {mappedPlayers.length})
            </div>
          )}
        </div>
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
