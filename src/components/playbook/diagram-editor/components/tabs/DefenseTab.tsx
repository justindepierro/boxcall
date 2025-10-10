import React from "react";
import { useDiagramStore } from "../../stores/diagramStore";
import type { Player } from "../../types/Player";
import type { DiagramPixiApp } from "../../core/PixiApp";

interface DefenseTabProps {
  app: DiagramPixiApp | null;
  selectedAlignment: "left" | "middle" | "right";
}

/**
 * DefenseTab - Mobile-optimized defense scheme picker
 *
 * Features:
 * - Quick defense insertion
 * - Common schemes (4-3, 4-2-5, 3-4)
 * - Auto-match offense (coming soon)
 */
export const DefenseTab: React.FC<DefenseTabProps> = ({
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

  // Helper to add defense formation
  const addDefenseFormation = (formationType: string) => {
    const defensePlayers = players.filter((p) => p.team === "defense");
    if (defensePlayers.length > 0) {
      const confirmed = window.confirm(
        `This will replace your current ${defensePlayers.length} defensive players. Continue?`
      );
      if (!confirmed) return;

      // Clear existing defense
      defensePlayers.forEach((p) => useDiagramStore.getState().removePlayer(p.id));
    }

    const centerX = getCenterXForAlignment(selectedAlignment);
    const newPlayers: Player[] = [];

    // Nickel 4-2-5
    if (formationType === "nickel425") {
      newPlayers.push(
        // DL
        { id: `player-${Date.now()}-1`, x: centerX - 2.5, y: 22, jerseyNumber: "99", team: "defense" },
        { id: `player-${Date.now()}-2`, x: centerX - 0.5, y: 22, jerseyNumber: "98", team: "defense" },
        { id: `player-${Date.now()}-3`, x: centerX + 0.5, y: 22, jerseyNumber: "97", team: "defense" },
        { id: `player-${Date.now()}-4`, x: centerX + 2.5, y: 22, jerseyNumber: "96", team: "defense" },
        // LB
        { id: `player-${Date.now()}-5`, x: centerX - 1.5, y: 25, jerseyNumber: "50", team: "defense" },
        { id: `player-${Date.now()}-6`, x: centerX + 1.5, y: 25, jerseyNumber: "51", team: "defense" },
        // DB
        { id: `player-${Date.now()}-7`, x: centerX - 8, y: 28, jerseyNumber: "20", team: "defense" },
        { id: `player-${Date.now()}-8`, x: centerX - 4, y: 28, jerseyNumber: "21", team: "defense" },
        { id: `player-${Date.now()}-9`, x: centerX, y: 33, jerseyNumber: "25", team: "defense" },
        { id: `player-${Date.now()}-10`, x: centerX + 4, y: 28, jerseyNumber: "22", team: "defense" },
        { id: `player-${Date.now()}-11`, x: centerX + 8, y: 28, jerseyNumber: "23", team: "defense" }
      );
    }

    // Add all players
    newPlayers.forEach((player) => addPlayer(player));
  };

  const defenseSchemes = [
    {
      id: "nickel425",
      name: "Nickel 4-2-5",
      description: "4 DL, 2 LB, 5 DB vs Spread",
      icon: "🛡️",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Defense Schemes */}
      <div>
        <h3 className="text-sm font-semibold text-primary mb-2">Defensive Schemes</h3>
        <div className="space-y-2">
          {defenseSchemes.map((scheme) => (
            <button
              key={scheme.id}
              onClick={() => addDefenseFormation(scheme.id)}
              className="w-full px-4 py-3 bg-surface-secondary hover:bg-surface-tertiary active:bg-border rounded-lg transition-colors text-left touch-manipulation"
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{scheme.icon}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-primary">{scheme.name}</div>
                  <div className="text-xs text-secondary mt-0.5">{scheme.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Auto-Match Defense (Coming Soon) */}
      <div>
        <h3 className="text-sm font-semibold text-primary mb-2">Auto-Match Defense</h3>
        <button
          disabled
          className="w-full px-4 py-3 bg-surface-secondary text-secondary rounded-lg transition-colors cursor-not-allowed opacity-50 touch-manipulation"
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-lg">🤖</span>
            <span className="text-sm font-medium">Auto-Detect Formation</span>
          </div>
          <div className="text-xs mt-1">Analyze offense & suggest defense</div>
        </button>
      </div>

      {/* Coverage Adjustments (Coming Soon) */}
      <div>
        <h3 className="text-sm font-semibold text-primary mb-2">Coverage Adjustments</h3>
        <div className="grid grid-cols-2 gap-2 opacity-50">
          <button
            disabled
            className="px-4 py-3 bg-surface-secondary text-secondary rounded-lg cursor-not-allowed touch-manipulation"
          >
            <div className="text-xs font-medium">Cover 2</div>
          </button>
          <button
            disabled
            className="px-4 py-3 bg-surface-secondary text-secondary rounded-lg cursor-not-allowed touch-manipulation"
          >
            <div className="text-xs font-medium">Cover 3</div>
          </button>
          <button
            disabled
            className="px-4 py-3 bg-surface-secondary text-secondary rounded-lg cursor-not-allowed touch-manipulation"
          >
            <div className="text-xs font-medium">Man</div>
          </button>
          <button
            disabled
            className="px-4 py-3 bg-surface-secondary text-secondary rounded-lg cursor-not-allowed touch-manipulation"
          >
            <div className="text-xs font-medium">Blitz</div>
          </button>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="text-center py-8">
        <div className="text-4xl mb-2">🚧</div>
        <p className="text-sm font-medium text-secondary">More Schemes Coming Soon</p>
        <p className="text-xs text-secondary mt-1">4-3, 3-4, Dime, Quarter, and more!</p>
      </div>
    </div>
  );
};
