import React from "react";
import { useDiagramStore } from "../../stores/diagramStore";
import type { Player } from "../../types/Player";
import type { ProfessionalPixiEngine } from "../../core/ProfessionalPixiEngine";

interface PlayersTabProps {
  app: ProfessionalPixiEngine | null;
}

/**
 * PlayersTab - Mobile-optimized player management
 *
 * Features:
 * - Add single offense/defense players
 * - Player count display
 * - Quick formation shortcuts
 * - Clear team buttons
 */
export const PlayersTab: React.FC<PlayersTabProps> = ({ app }) => {
  const { players, addPlayer, removePlayer } = useDiagramStore();

  const offensePlayers = players.filter((p) => p.team === "offense");
  const defensePlayers = players.filter((p) => p.team === "defense");

  const handleAddOffense = () => {
    if (!app?.playersLayer) return;

    const number = offensePlayers.length + 1;
    const lastPos = app.playersLayer.getLastDroppedPosition();

    const x = lastPos
      ? Math.min(app.coordinates.fieldWidth - 1, lastPos.x + 2.0)
      : 26.666;
    const y = lastPos ? lastPos.y : 17.5;

    const newPlayer: Player = {
      id: `player-${Date.now()}`,
      x,
      y,
      jerseyNumber: number.toString(),
      team: "offense",
    };

    addPlayer(newPlayer);
  };

  const handleAddDefense = () => {
    if (!app?.playersLayer) return;

    const number = defensePlayers.length + 1;
    const lastPos = app.playersLayer.getLastDroppedPosition();

    const x = lastPos
      ? Math.min(app.coordinates.fieldWidth - 1, lastPos.x + 2.0)
      : 26.666;
    const y = lastPos ? lastPos.y : 27.5;

    const newPlayer: Player = {
      id: `player-${Date.now()}`,
      x,
      y,
      jerseyNumber: number.toString(),
      team: "defense",
    };

    addPlayer(newPlayer);
  };

  const handleClearOffense = () => {
    offensePlayers.forEach((p) => removePlayer(p.id));
  };

  const handleClearDefense = () => {
    defensePlayers.forEach((p) => removePlayer(p.id));
  };

  return (
    <div className="space-y-4">
      {/* Player Count */}
      <div className="bg-surface-secondary rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-secondary">
              Total Players
            </div>
            <div className="text-2xl font-bold text-primary">
              {players.length}
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-xs text-secondary">Offense</div>
              <div className="text-lg font-bold text-blue-600">
                {offensePlayers.length}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-secondary">Defense</div>
              <div className="text-lg font-bold text-error-600">
                {defensePlayers.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Single Players */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-primary">Add Players</h3>
        <button
          onClick={handleAddOffense}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors flex items-center justify-center gap-2 touch-manipulation"
        >
          <span className="text-lg">⚪</span>
          <span>Add Offense Player</span>
        </button>
        <button
          onClick={handleAddDefense}
          className="w-full px-4 py-3 bg-error-600 text-white rounded-lg font-medium hover:bg-error-700 active:bg-error-800 transition-colors flex items-center justify-center gap-2 touch-manipulation"
        >
          <span className="text-lg">⚫</span>
          <span>Add Defense Player</span>
        </button>
      </div>

      {/* Clear Team Buttons */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-primary">Clear Team</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleClearOffense}
            disabled={offensePlayers.length === 0}
            className="px-4 py-3 bg-surface-secondary text-primary rounded-lg font-medium hover:bg-surface-tertiary active:bg-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
            Clear Offense
          </button>
          <button
            onClick={handleClearDefense}
            disabled={defensePlayers.length === 0}
            className="px-4 py-3 bg-surface-secondary text-primary rounded-lg font-medium hover:bg-surface-tertiary active:bg-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
            Clear Defense
          </button>
        </div>
      </div>

      {/* Quick Tip */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-900 dark:text-blue-100">
          💡 <strong>Tip:</strong> Tap a player on the field to select and drag.
          Use the FAB (bottom-right) for quick actions.
        </p>
      </div>
    </div>
  );
};
