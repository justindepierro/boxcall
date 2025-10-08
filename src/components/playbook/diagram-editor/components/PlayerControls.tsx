import React from "react";
import { useDiagramStore } from "../stores/diagramStore";
import type { Player, TeamSide } from "../types/Player";
import type { DiagramPixiApp } from "../core/PixiApp";
import {
  alignPlayersHorizontal,
  alignPlayersVertical,
  distributePlayersHorizontal,
  distributePlayersVertical,
} from "../utils/alignmentUtils";

interface PlayerControlsProps {
  app: DiagramPixiApp | null;
}

/**
 * Player Controls - Sidebar UI for adding/removing players
 */
export const PlayerControls: React.FC<PlayerControlsProps> = ({ app }) => {
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

  // Alignment handlers
  const handleAlign = (mode: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (!app?.playersLayer) return;
    
    const selectedIds = app.playersLayer.getSelectedPlayerIds();
    if (selectedIds.length < 2) {
      alert('Please select 2 or more players to align');
      return;
    }

    // Get selected players
    const selectedPlayers: Player[] = [];
    selectedIds.forEach((id: string) => {
      const sprite = app.playersLayer!.getPlayer(id);
      if (sprite) {
        selectedPlayers.push(sprite.getPlayer());
      }
    });

    // Apply alignment
    let aligned: Player[];
    if (mode === 'left' || mode === 'center' || mode === 'right') {
      aligned = alignPlayersHorizontal(selectedPlayers, mode);
    } else {
      aligned = alignPlayersVertical(selectedPlayers, mode as 'top' | 'middle' | 'bottom');
    }

    // Update positions
    aligned.forEach(player => {
      app.playersLayer!.updatePlayer(player.id, { x: player.x, y: player.y });
    });

    console.log(`📐 Aligned ${aligned.length} players: ${mode}`);
  };

  // Distribute handlers
  const handleDistribute = (direction: 'horizontal' | 'vertical') => {
    if (!app?.playersLayer) return;
    
    const selectedIds = app.playersLayer.getSelectedPlayerIds();
    if (selectedIds.length < 3) {
      alert('Please select 3 or more players to distribute');
      return;
    }

    // Get selected players
    const selectedPlayers: Player[] = [];
    selectedIds.forEach((id: string) => {
      const sprite = app.playersLayer!.getPlayer(id);
      if (sprite) {
        selectedPlayers.push(sprite.getPlayer());
      }
    });

    // Apply distribution
    const distributed = direction === 'horizontal'
      ? distributePlayersHorizontal(selectedPlayers)
      : distributePlayersVertical(selectedPlayers);

    // Update positions
    distributed.forEach(player => {
      app.playersLayer!.updatePlayer(player.id, { x: player.x, y: player.y });
    });

    console.log(`📏 Distributed ${distributed.length} players: ${direction}`);
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

        {/* Align Section */}
        <div className="pt-4 border-t border-border">
          <h3 className="text-sm font-semibold text-content-primary mb-2">
            Align (2+ selected)
          </h3>
          <div className="space-y-2">
            {/* Horizontal alignment */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleAlign('left')}
                className="px-2 py-1.5 text-xs bg-surface-secondary hover:bg-surface-tertiary rounded border border-border transition-colors"
                title="Align Left"
              >
                ⫣ Left
              </button>
              <button
                onClick={() => handleAlign('center')}
                className="px-2 py-1.5 text-xs bg-surface-secondary hover:bg-surface-tertiary rounded border border-border transition-colors"
                title="Center Horizontal"
              >
                ⫯ Center
              </button>
              <button
                onClick={() => handleAlign('right')}
                className="px-2 py-1.5 text-xs bg-surface-secondary hover:bg-surface-tertiary rounded border border-border transition-colors"
                title="Align Right"
              >
                ⫤ Right
              </button>
            </div>
            {/* Vertical alignment */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleAlign('top')}
                className="px-2 py-1.5 text-xs bg-surface-secondary hover:bg-surface-tertiary rounded border border-border transition-colors"
                title="Align Top"
              >
                ⫪ Top
              </button>
              <button
                onClick={() => handleAlign('middle')}
                className="px-2 py-1.5 text-xs bg-surface-secondary hover:bg-surface-tertiary rounded border border-border transition-colors"
                title="Center Vertical"
              >
                ⊟ Middle
              </button>
              <button
                onClick={() => handleAlign('bottom')}
                className="px-2 py-1.5 text-xs bg-surface-secondary hover:bg-surface-tertiary rounded border border-border transition-colors"
                title="Align Bottom"
              >
                ⫫ Bottom
              </button>
            </div>
          </div>
        </div>

        {/* Distribute Section */}
        <div className="pt-4 border-t border-border">
          <h3 className="text-sm font-semibold text-content-primary mb-2">
            Distribute (3+ selected)
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDistribute('horizontal')}
              className="px-3 py-2 text-xs bg-surface-secondary hover:bg-surface-tertiary rounded border border-border transition-colors"
              title="Distribute Horizontal - Space evenly left to right"
            >
              ↔ Horizontal
            </button>
            <button
              onClick={() => handleDistribute('vertical')}
              className="px-3 py-2 text-xs bg-surface-secondary hover:bg-surface-tertiary rounded border border-border transition-colors"
              title="Distribute Vertical - Space evenly top to bottom"
            >
              ↕ Vertical
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
          <li>• Alt/Option to snap to yard lines/hashes</li>
          <li>• Arrow keys to nudge</li>
          <li>• Ctrl/Cmd+C/V/D to copy/paste</li>
          <li>• Ctrl/Cmd+Z to undo, Ctrl/Cmd+Shift+Z to redo</li>
          <li>• Delete key to remove</li>
        </ul>
      </div>
    </div>
  );
};
