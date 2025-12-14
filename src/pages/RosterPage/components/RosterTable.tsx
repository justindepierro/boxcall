import React from "react";
import { PlayerCard } from "./PlayerCard";
import { EmptyState } from "../../../components/ui/EmptyState";
import type { RosterPlayerView } from "../../../services/rosterService";

interface RosterTableProps {
  players: RosterPlayerView[];
  selectedPlayerIds: Set<string>;
  onToggleSelection: (playerId: string) => void;
  onSelectAll: () => void;
  onEditPlayer: (player: RosterPlayerView) => void;
  onDeletePlayer: (player: RosterPlayerView) => void;
  onSendInvitation: (player: RosterPlayerView) => void;
  onViewProfile: (playerId: string) => void;
  onToggleStatus: (player: RosterPlayerView, e: React.MouseEvent) => void;
  isAllSelected: boolean;
  hasFilters: boolean;
  onClearFilters: () => void;
}

export const RosterTable: React.FC<RosterTableProps> = ({
  players,
  selectedPlayerIds,
  onToggleSelection,
  onSelectAll,
  onEditPlayer,
  onDeletePlayer: _onDeletePlayer,
  onSendInvitation,
  onViewProfile,
  onToggleStatus,
  isAllSelected,
  hasFilters,
  onClearFilters,
}) => {
  // Empty state
  if (players.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          icon="users"
          title={hasFilters ? "No players found" : "No players yet"}
          description={
            hasFilters
              ? "Try adjusting your filters to see more results"
              : "Start building your roster by adding players manually or importing from CSV"
          }
          primaryAction={
            hasFilters
              ? {
                  label: "Clear Filters",
                  onClick: onClearFilters,
                }
              : undefined
          }
        />
      </div>
    );
  }

  return (
    <div>
      {/* Select All Bar */}
      <div className="mb-4 flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={onSelectAll}
            className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
          />
          <span className="text-sm text-secondary">
            Select all {players.length} player{players.length !== 1 ? "s" : ""}
          </span>
        </label>
      </div>

      {/* Player Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md animate-fade-in">
        {players.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            isSelected={selectedPlayerIds.has(player.id)}
            onToggleSelection={onToggleSelection}
            onEdit={onEditPlayer}
            onToggleStatus={onToggleStatus}
            onNavigate={onViewProfile}
            onSendInvite={(player, e) => {
              e.stopPropagation();
              onSendInvitation(player);
            }}
          />
        ))}
      </div>
    </div>
  );
};
