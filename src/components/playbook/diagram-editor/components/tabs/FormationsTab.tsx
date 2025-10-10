import React from "react";
import { useDiagramStore } from "../../stores/diagramStore";
import type { Player } from "../../types/Player";
import type { DiagramPixiApp } from "../../core/PixiApp";

interface FormationsTabProps {
  app: DiagramPixiApp | null;
  selectedAlignment: "left" | "middle" | "right";
}

/**
 * FormationsTab - Mobile-optimized formation picker
 *
 * Features:
 * - Visual formation grid
 * - Quick formation insertion
 * - Spread, Pro, I-Form, Pistol presets
 */
export const FormationsTab: React.FC<FormationsTabProps> = ({
  app,
  selectedAlignment,
}) => {
  const { players, addPlayer } = useDiagramStore();

  // Helper to get center X based on alignment
  const getCenterXForAlignment = (
    alignment: "left" | "middle" | "right"
  ): number => {
    if (!app) return 26.666;

    const fieldWidth = app.coordinates.fieldWidth;
    const thirdWidth = fieldWidth / 3;

    switch (alignment) {
      case "left":
        return thirdWidth / 2;
      case "right":
        return fieldWidth - thirdWidth / 2;
      case "middle":
      default:
        return fieldWidth / 2;
    }
  };

  // Helper to add formation
  const addFormation = (formationType: string) => {
    const offensePlayers = players.filter((p) => p.team === "offense");
    if (offensePlayers.length > 0) {
      const confirmed = window.confirm(
        `This will replace your current ${offensePlayers.length} offensive players. Continue?`
      );
      if (!confirmed) return;

      // Clear existing offense
      offensePlayers.forEach((p) => useDiagramStore.getState().removePlayer(p.id));
    }

    const centerX = getCenterXForAlignment(selectedAlignment);
    const newPlayers: Player[] = [];

    // Spread 2x2 Formation
    if (formationType === "spread2x2") {
      newPlayers.push(
        { id: `player-${Date.now()}-1`, x: centerX, y: 17.5, jerseyNumber: "7", team: "offense" },
        { id: `player-${Date.now()}-2`, x: centerX - 3, y: 18, jerseyNumber: "5", team: "offense" },
        { id: `player-${Date.now()}-3`, x: centerX + 3, y: 18, jerseyNumber: "6", team: "offense" },
        { id: `player-${Date.now()}-4`, x: centerX - 1, y: 20, jerseyNumber: "2", team: "offense" },
        { id: `player-${Date.now()}-5`, x: centerX, y: 20, jerseyNumber: "3", team: "offense" },
        { id: `player-${Date.now()}-6`, x: centerX + 1, y: 20, jerseyNumber: "4", team: "offense" },
        { id: `player-${Date.now()}-7`, x: centerX - 8, y: 15.5, jerseyNumber: "11", team: "offense" },
        { id: `player-${Date.now()}-8`, x: centerX - 4, y: 15.5, jerseyNumber: "10", team: "offense" },
        { id: `player-${Date.now()}-9`, x: centerX + 4, y: 15.5, jerseyNumber: "8", team: "offense" },
        { id: `player-${Date.now()}-10`, x: centerX + 8, y: 15.5, jerseyNumber: "9", team: "offense" },
        { id: `player-${Date.now()}-11`, x: centerX, y: 12, jerseyNumber: "1", team: "offense" }
      );
    }
    // Spread 3x1 Right
    else if (formationType === "spread3x1Right") {
      newPlayers.push(
        { id: `player-${Date.now()}-1`, x: centerX, y: 17.5, jerseyNumber: "7", team: "offense" },
        { id: `player-${Date.now()}-2`, x: centerX - 3, y: 18, jerseyNumber: "5", team: "offense" },
        { id: `player-${Date.now()}-3`, x: centerX + 3, y: 18, jerseyNumber: "6", team: "offense" },
        { id: `player-${Date.now()}-4`, x: centerX - 1, y: 20, jerseyNumber: "2", team: "offense" },
        { id: `player-${Date.now()}-5`, x: centerX, y: 20, jerseyNumber: "3", team: "offense" },
        { id: `player-${Date.now()}-6`, x: centerX + 1, y: 20, jerseyNumber: "4", team: "offense" },
        { id: `player-${Date.now()}-7`, x: centerX - 8, y: 15.5, jerseyNumber: "11", team: "offense" },
        { id: `player-${Date.now()}-8`, x: centerX + 3, y: 15.5, jerseyNumber: "10", team: "offense" },
        { id: `player-${Date.now()}-9`, x: centerX + 6, y: 15.5, jerseyNumber: "8", team: "offense" },
        { id: `player-${Date.now()}-10`, x: centerX + 9, y: 15.5, jerseyNumber: "9", team: "offense" },
        { id: `player-${Date.now()}-11`, x: centerX, y: 12, jerseyNumber: "1", team: "offense" }
      );
    }
    // Spread 3x1 Left
    else if (formationType === "spread3x1Left") {
      newPlayers.push(
        { id: `player-${Date.now()}-1`, x: centerX, y: 17.5, jerseyNumber: "7", team: "offense" },
        { id: `player-${Date.now()}-2`, x: centerX - 3, y: 18, jerseyNumber: "5", team: "offense" },
        { id: `player-${Date.now()}-3`, x: centerX + 3, y: 18, jerseyNumber: "6", team: "offense" },
        { id: `player-${Date.now()}-4`, x: centerX - 1, y: 20, jerseyNumber: "2", team: "offense" },
        { id: `player-${Date.now()}-5`, x: centerX, y: 20, jerseyNumber: "3", team: "offense" },
        { id: `player-${Date.now()}-6`, x: centerX + 1, y: 20, jerseyNumber: "4", team: "offense" },
        { id: `player-${Date.now()}-7`, x: centerX - 9, y: 15.5, jerseyNumber: "11", team: "offense" },
        { id: `player-${Date.now()}-8`, x: centerX - 6, y: 15.5, jerseyNumber: "10", team: "offense" },
        { id: `player-${Date.now()}-9`, x: centerX - 3, y: 15.5, jerseyNumber: "8", team: "offense" },
        { id: `player-${Date.now()}-10`, x: centerX + 8, y: 15.5, jerseyNumber: "9", team: "offense" },
        { id: `player-${Date.now()}-11`, x: centerX, y: 12, jerseyNumber: "1", team: "offense" }
      );
    }

    // Add all players
    newPlayers.forEach((player) => addPlayer(player));
  };

  const formations = [
    {
      id: "spread2x2",
      name: "Spread 2x2",
      description: "Shotgun, 2 WR each side",
      icon: "🏈",
    },
    {
      id: "spread3x1Right",
      name: "Spread 3x1 Right",
      description: "Shotgun, 3 WR right",
      icon: "▶️",
    },
    {
      id: "spread3x1Left",
      name: "Spread 3x1 Left",
      description: "Shotgun, 3 WR left",
      icon: "◀️",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Formation Grid */}
      <div>
        <h3 className="text-sm font-semibold text-primary mb-2">Offensive Formations</h3>
        <div className="space-y-2">
          {formations.map((formation) => (
            <button
              key={formation.id}
              onClick={() => addFormation(formation.id)}
              className="w-full px-4 py-3 bg-surface-secondary hover:bg-surface-tertiary active:bg-border rounded-lg transition-colors text-left touch-manipulation"
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{formation.icon}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-primary">{formation.name}</div>
                  <div className="text-xs text-secondary mt-0.5">{formation.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Alignment Info */}
      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
        <p className="text-xs text-purple-900 dark:text-purple-100">
          📍 <strong>Alignment:</strong> {selectedAlignment.charAt(0).toUpperCase() + selectedAlignment.slice(1)} hash
        </p>
        <p className="text-xs text-purple-900 dark:text-purple-100 mt-1">
          Change alignment in the "Align" tab or use the header selector.
        </p>
      </div>

      {/* Coming Soon */}
      <div className="text-center py-8">
        <div className="text-4xl mb-2">🚧</div>
        <p className="text-sm font-medium text-secondary">More Formations Coming Soon</p>
        <p className="text-xs text-secondary mt-1">Pro Set, I-Form, Pistol, and more!</p>
      </div>
    </div>
  );
};
