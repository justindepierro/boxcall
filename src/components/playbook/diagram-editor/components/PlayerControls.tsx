import React from "react";
import { useDiagramStore } from "../stores/diagramStore";
import type { Player, TeamSide } from "../types/Player";

/**
 * Player Controls - Sidebar UI for adding/removing players
 */
export const PlayerControls: React.FC = () => {
  const { players, addPlayer, removePlayer, selectedPlayerId, clearPlayers } =
    useDiagramStore();

  // Count selected players (for multi-select support)
  const selectedCount = selectedPlayerId ? 1 : 0;

  const handleAddPlayer = (team: TeamSide) => {
    const number = players.filter((p) => p.team === team).length + 1;
    const yOffset = team === "offense" ? 0 : 10;

    const newPlayer: Player = {
      id: `player-${Date.now()}`,
      x: 26.666 + (Math.random() * 10 - 5), // Near center, randomized
      y: 17.5 + yOffset + (Math.random() * 5 - 2.5),
      jerseyNumber: number.toString(),
      team,
    };

    addPlayer(newPlayer);
  };

  const handleRemoveSelected = () => {
    if (selectedPlayerId) {
      removePlayer(selectedPlayerId);
    }
  };

  const handleClearAll = () => {
    if (window.confirm("Remove all players?")) {
      clearPlayers();
    }
  };

  const buttonBaseClasses =
    "w-full px-4 py-2 rounded-lg font-medium transition-all shadow-sm hover:shadow-md active:scale-95 text-sm";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-bold text-content-primary">Players</h2>
        <p className="text-xs text-content-secondary mt-1">
          {players.length} total • {selectedCount} selected
        </p>
      </div>

      {/* Controls */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Add Players Section */}
        <div>
          <h3 className="text-sm font-semibold text-content-primary mb-2">
            Add Players
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => handleAddPlayer("offense")}
              className={`${buttonBaseClasses} bg-blue-500 text-white hover:bg-blue-600`}
              title="Add Offense Player"
            >
              + Offense
            </button>
            <button
              onClick={() => handleAddPlayer("defense")}
              className={`${buttonBaseClasses} bg-error-500 text-white hover:bg-error-600`}
              title="Add Defense Player"
            >
              + Defense
            </button>
          </div>
        </div>

        {/* Edit Section */}
        <div className="pt-4 border-t border-border">
          <h3 className="text-sm font-semibold text-content-primary mb-2">
            Edit
          </h3>
          <div className="space-y-2">
            <button
              onClick={handleRemoveSelected}
              disabled={!selectedPlayerId}
              className={`${buttonBaseClasses} ${
                selectedPlayerId
                  ? "bg-gray-700 text-white hover:bg-gray-800"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
              title="Remove Selected Player (or press Delete)"
            >
              Remove Selected
            </button>
            <button
              onClick={handleClearAll}
              disabled={players.length === 0}
              className={`${buttonBaseClasses} ${
                players.length > 0
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
              title="Clear All Players"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Selection Info */}
        {selectedPlayerId && (
          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-semibold text-content-primary mb-2">
              Selection
            </h3>
            <div className="text-sm text-content-secondary bg-surface-secondary rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span>Jersey #:</span>
                <span className="font-mono font-bold">
                  {players.find((p) => p.id === selectedPlayerId)?.jerseyNumber}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span>Team:</span>
                <span className="capitalize">
                  {players.find((p) => p.id === selectedPlayerId)?.team}
                </span>
              </div>
            </div>
            <p className="text-xs text-content-tertiary mt-2">
              💡 Hold Shift to select multiple players
            </p>
          </div>
        )}
      </div>

      {/* Help Footer */}
      <div className="p-4 border-t border-border bg-surface-secondary">
        <h3 className="text-xs font-semibold text-content-primary mb-2">
          Quick Tips
        </h3>
        <ul className="text-xs text-content-secondary space-y-1">
          <li>• Click to select a player</li>
          <li>• Drag to move players</li>
          <li>• Shift+Click for multi-select</li>
          <li>• Click+Drag empty field for box select</li>
          <li>• Arrow keys to nudge</li>
          <li>• Ctrl/Cmd+C/V/D to copy/paste</li>
          <li>• Delete key to remove</li>
        </ul>
      </div>
    </div>
  );
};
