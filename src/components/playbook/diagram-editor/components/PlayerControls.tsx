import React from 'react';
import { useDiagramStore } from '../stores/diagramStore';
import type { Player, TeamSide } from '../types/Player';

/**
 * Player Controls - UI for adding/removing players
 * Testing component for Phase 3
 */
export const PlayerControls: React.FC = () => {
  const { players, addPlayer, removePlayer, selectedPlayerId, clearPlayers } = useDiagramStore();

  const handleAddPlayer = (team: TeamSide) => {
    const number = players.filter(p => p.team === team).length + 1;
    const yOffset = team === 'offense' ? 0 : 10;
    
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
    if (window.confirm('Remove all players?')) {
      clearPlayers();
    }
  };

  const buttonBaseClasses =
    'px-4 py-2 rounded-lg font-medium transition-all shadow-sm hover:shadow-md active:scale-95';

  return (
    <div className="absolute bottom-4 left-4 flex flex-col gap-2 bg-white rounded-lg shadow-lg p-4 z-10">
      <div className="text-sm font-bold text-content-primary mb-2">
        Players ({players.length})
      </div>

      {/* Add Players */}
      <div className="flex gap-2">
        <button
          onClick={() => handleAddPlayer('offense')}
          className={`${buttonBaseClasses} bg-blue-500 text-white hover:bg-blue-600`}
          title="Add Offense Player"
        >
          + Offense
        </button>
        <button
          onClick={() => handleAddPlayer('defense')}
          className={`${buttonBaseClasses} bg-error-500 text-white hover:bg-error-600`}
          title="Add Defense Player"
        >
          + Defense
        </button>
      </div>

      {/* Remove/Clear */}
      <div className="flex gap-2 pt-2 border-t border-border">
        <button
          onClick={handleRemoveSelected}
          disabled={!selectedPlayerId}
          className={`${buttonBaseClasses} ${
            selectedPlayerId
              ? 'bg-gray-700 text-white hover:bg-gray-800'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          title="Remove Selected Player"
        >
          Remove Selected
        </button>
        <button
          onClick={handleClearAll}
          disabled={players.length === 0}
          className={`${buttonBaseClasses} ${
            players.length > 0
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          title="Clear All Players"
        >
          Clear All
        </button>
      </div>

      {/* Info */}
      {selectedPlayerId && (
        <div className="text-xs text-content-secondary pt-2 border-t border-border">
          Selected: {players.find(p => p.id === selectedPlayerId)?.jerseyNumber}
        </div>
      )}
    </div>
  );
};
