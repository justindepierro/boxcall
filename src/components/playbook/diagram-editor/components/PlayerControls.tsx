import React from "react";
import { useDiagramStore } from "../stores/diagramStore";
import type { Player, TeamSide } from "../types/Player";
import type { DiagramPixiApp } from "../core/PixiApp";
import {
  alignPlayersHorizontal,
  alignPlayersVertical,
  distributePlayersHorizontal,
  distributePlayersVertical,
  spacePlayersUniformHorizontal,
  spacePlayersUniformVertical,
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

    // Try to place next to the last dropped player
    let x: number;
    let y: number;

    if (app?.playersLayer) {
      const lastPos = app.playersLayer.getLastDroppedPosition();
      if (lastPos) {
        // Place 2 yards to the right of the last dropped player
        x = Math.min(app.coordinates.fieldWidth - 1, lastPos.x + 2.0);
        y = lastPos.y;
      } else {
        // Default: center of field with small offset for team
        const yOffset = team === "offense" ? 0 : 10;
        x = 26.666;
        y = 17.5 + yOffset;
      }
    } else {
      // Fallback if app not ready
      const yOffset = team === "offense" ? 0 : 10;
      x = 26.666;
      y = 17.5 + yOffset;
    }

    const newPlayer: Player = {
      id: `player-${Date.now()}`,
      x,
      y,
      jerseyNumber: number.toString(),
      team,
    };

    addPlayer(newPlayer);
  };

  /**
   * Add full offensive formation (11 players)
   * Standard spread formation below line of scrimmage:
   * LOS -  WR           LT LG [C] RG RT           WR
   * 1yd -     WR                                WR
   * 4yd -                     RB QB
   */
  const handleAddOffenseFormation = () => {
    if (players.some((p) => p.team === "offense")) {
      if (!window.confirm("This will add 11 offensive players. Continue?")) {
        return;
      }
    }

    const losYard = app?.fieldLayer?.getLineOfScrimmage() || 25;
    const fieldWidth = app?.coordinates.fieldWidth || 53.333;
    const centerX = fieldWidth / 2; // Middle of field (26.666 yards)

    // All players are positioned BELOW (higher Y value) the line of scrimmage
    // Line of scrimmage is at losYard, offense is at losYard + offset (towards bottom of field)

    const formationPlayers: Omit<Player, "id">[] = [
      // OFFENSIVE LINE (5 players) - ON the line of scrimmage
      {
        x: centerX,
        y: losYard + 0.5,
        jerseyNumber: "C",
        team: "offense",
        position: "center",
      }, // Center (square)
      {
        x: centerX - 1.5,
        y: losYard + 0.5,
        jerseyNumber: "LG",
        team: "offense",
      }, // Left Guard
      {
        x: centerX + 1.5,
        y: losYard + 0.5,
        jerseyNumber: "RG",
        team: "offense",
      }, // Right Guard
      { x: centerX - 3, y: losYard + 0.5, jerseyNumber: "LT", team: "offense" }, // Left Tackle
      { x: centerX + 3, y: losYard + 0.5, jerseyNumber: "RT", team: "offense" }, // Right Tackle

      // OUTSIDE WIDE RECEIVERS (2 players) - ON the line, split out wide near sidelines
      { x: 6, y: losYard + 0.5, jerseyNumber: "WR", team: "offense" }, // Left WR (near left sideline)
      {
        x: fieldWidth - 6,
        y: losYard + 0.5,
        jerseyNumber: "WR",
        team: "offense",
      }, // Right WR (near right sideline)

      // SLOT RECEIVERS (2 players) - 1 yard back from LOS, inside the outside WRs
      { x: 12, y: losYard + 1.5, jerseyNumber: "WR", team: "offense" }, // Left Slot
      {
        x: fieldWidth - 12,
        y: losYard + 1.5,
        jerseyNumber: "WR",
        team: "offense",
      }, // Right Slot

      // BACKFIELD (2 players) - 4 yards behind the line (shotgun)
      { x: centerX, y: losYard + 4.5, jerseyNumber: "QB", team: "offense" }, // Quarterback (directly behind center)
      {
        x: centerX - 2.5,
        y: losYard + 4.5,
        jerseyNumber: "RB",
        team: "offense",
      }, // Running Back (offset left)
    ];

    // Add all players with unique IDs and small time offsets
    formationPlayers.forEach((playerData, index) => {
      setTimeout(() => {
        const newPlayer: Player = {
          ...playerData,
          id: `offense-formation-${Date.now()}-${index}`,
        };
        addPlayer(newPlayer);
      }, index * 10); // Slight delay between each player for smooth addition
    });

    console.log(
      `🏈 Added full offensive formation (11 players) - Spread shotgun below LOS at yard ${losYard}`
    );
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
  const handleAlign = (
    mode: "left" | "center" | "right" | "top" | "middle" | "bottom"
  ) => {
    if (!app?.playersLayer) return;

    const selectedIds = app.playersLayer.getSelectedPlayerIds();
    if (selectedIds.length < 2) {
      alert("Please select 2 or more players to align");
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
    if (mode === "left" || mode === "center" || mode === "right") {
      aligned = alignPlayersHorizontal(selectedPlayers, mode);
    } else {
      aligned = alignPlayersVertical(
        selectedPlayers,
        mode as "top" | "middle" | "bottom"
      );
    }

    // Update positions
    aligned.forEach((player) => {
      app.playersLayer!.updatePlayer(player.id, { x: player.x, y: player.y });
    });

    console.log(`📐 Aligned ${aligned.length} players: ${mode}`);
  };

  // Distribute handlers
  const handleDistribute = (direction: "horizontal" | "vertical") => {
    if (!app?.playersLayer) return;

    const selectedIds = app.playersLayer.getSelectedPlayerIds();
    if (selectedIds.length < 3) {
      alert("Please select 3 or more players to distribute");
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
    const distributed =
      direction === "horizontal"
        ? distributePlayersHorizontal(selectedPlayers)
        : distributePlayersVertical(selectedPlayers);

    // Update positions
    distributed.forEach((player) => {
      app.playersLayer!.updatePlayer(player.id, { x: player.x, y: player.y });
    });

    console.log(`📏 Distributed ${distributed.length} players: ${direction}`);
  };

  // Uniform spacing handlers
  const handleUniformSpacing = (
    direction: "horizontal" | "vertical",
    spacing: number
  ) => {
    if (!app?.playersLayer) return;

    const selectedIds = app.playersLayer.getSelectedPlayerIds();
    if (selectedIds.length < 2) {
      alert("Please select 2 or more players to apply uniform spacing");
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

    // Apply uniform spacing
    const spaced =
      direction === "horizontal"
        ? spacePlayersUniformHorizontal(selectedPlayers, spacing)
        : spacePlayersUniformVertical(selectedPlayers, spacing);

    // Update positions
    spaced.forEach((player) => {
      app.playersLayer!.updatePlayer(player.id, { x: player.x, y: player.y });
    });

    console.log(
      `📐 Applied ${spacing} yard uniform spacing to ${spaced.length} players: ${direction}`
    );
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
              onClick={handleAddOffenseFormation}
              className={`${buttonBaseClasses} bg-blue-600 text-white hover:bg-blue-700 font-bold`}
              title="Add Full Offensive Formation (11 players)"
            >
              🏈 Add Offense Formation
            </button>
            <button
              onClick={() => handleAddPlayer("offense")}
              className={`${buttonBaseClasses} bg-blue-500 text-white hover:bg-blue-600`}
              title="Add Single Offense Player"
            >
              + Single Offense
            </button>
            <button
              onClick={() => handleAddPlayer("defense")}
              className={`${buttonBaseClasses} bg-error-500 text-white hover:bg-error-600`}
              title="Add Defense Player"
            >
              + Defense
            </button>
            <button
              onClick={() => {
                const newPlayer: Player = {
                  id: `center-${Date.now()}`,
                  x: 26.666, // Center of field
                  y: 17.5,
                  jerseyNumber: "C",
                  team: "offense",
                  position: "center",
                };
                addPlayer(newPlayer);
              }}
              className={`${buttonBaseClasses} bg-success-600 text-white hover:bg-success-700`}
              title="Add Center (Square marker)"
            >
              ◼ Add Center
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
                onClick={() => handleAlign("left")}
                className="px-2 py-1.5 text-xs bg-surface-secondary hover:bg-surface-tertiary rounded border border-border transition-colors"
                title="Align Left"
              >
                ⫣ Left
              </button>
              <button
                onClick={() => handleAlign("center")}
                className="px-2 py-1.5 text-xs bg-surface-secondary hover:bg-surface-tertiary rounded border border-border transition-colors"
                title="Center Horizontal"
              >
                ⫯ Center
              </button>
              <button
                onClick={() => handleAlign("right")}
                className="px-2 py-1.5 text-xs bg-surface-secondary hover:bg-surface-tertiary rounded border border-border transition-colors"
                title="Align Right"
              >
                ⫤ Right
              </button>
            </div>
            {/* Vertical alignment */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleAlign("top")}
                className="px-2 py-1.5 text-xs bg-surface-secondary hover:bg-surface-tertiary rounded border border-border transition-colors"
                title="Align Top"
              >
                ⫪ Top
              </button>
              <button
                onClick={() => handleAlign("middle")}
                className="px-2 py-1.5 text-xs bg-surface-secondary hover:bg-surface-tertiary rounded border border-border transition-colors"
                title="Center Vertical"
              >
                ⊟ Middle
              </button>
              <button
                onClick={() => handleAlign("bottom")}
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
              onClick={() => handleDistribute("horizontal")}
              className="px-3 py-2 text-xs bg-surface-secondary hover:bg-surface-tertiary rounded border border-border transition-colors"
              title="Distribute Horizontal - Space evenly left to right"
            >
              ↔ Horizontal
            </button>
            <button
              onClick={() => handleDistribute("vertical")}
              className="px-3 py-2 text-xs bg-surface-secondary hover:bg-surface-tertiary rounded border border-border transition-colors"
              title="Distribute Vertical - Space evenly top to bottom"
            >
              ↕ Vertical
            </button>
          </div>
        </div>

        {/* Uniform Spacing Section */}
        <div className="pt-4 border-t border-border">
          <h3 className="text-sm font-semibold text-content-primary mb-2">
            Uniform Spacing (2+ selected)
          </h3>
          <p className="text-xs text-content-tertiary mb-2">
            Apply equal spacing between players
          </p>

          {/* Horizontal Spacing Buttons */}
          <div className="mb-2">
            <p className="text-xs font-medium text-content-secondary mb-1">
              Horizontal:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleUniformSpacing("horizontal", 1)}
                className="px-2 py-1.5 text-xs bg-surface-secondary hover:bg-surface-tertiary rounded border border-border transition-colors"
                title="1 yard spacing horizontally"
              >
                1 yd
              </button>
              <button
                onClick={() => handleUniformSpacing("horizontal", 1.5)}
                className="px-2 py-1.5 text-xs bg-surface-secondary hover:bg-surface-tertiary rounded border border-border transition-colors"
                title="1.5 yard spacing horizontally"
              >
                1.5 yd
              </button>
              <button
                onClick={() => handleUniformSpacing("horizontal", 2)}
                className="px-2 py-1.5 text-xs bg-surface-secondary hover:bg-surface-tertiary rounded border border-border transition-colors"
                title="2 yard spacing horizontally"
              >
                2 yd
              </button>
            </div>
          </div>

          {/* Vertical Spacing Buttons */}
          <div>
            <p className="text-xs font-medium text-content-secondary mb-1">
              Vertical:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleUniformSpacing("vertical", 1)}
                className="px-2 py-1.5 text-xs bg-surface-secondary hover:bg-surface-tertiary rounded border border-border transition-colors"
                title="1 yard spacing vertically"
              >
                1 yd
              </button>
              <button
                onClick={() => handleUniformSpacing("vertical", 1.5)}
                className="px-2 py-1.5 text-xs bg-surface-secondary hover:bg-surface-tertiary rounded border border-border transition-colors"
                title="1.5 yard spacing vertically"
              >
                1.5 yd
              </button>
              <button
                onClick={() => handleUniformSpacing("vertical", 2)}
                className="px-2 py-1.5 text-xs bg-surface-secondary hover:bg-surface-tertiary rounded border border-border transition-colors"
                title="2 yard spacing vertically"
              >
                2 yd
              </button>
            </div>
          </div>
        </div>

        {/* Spacing Indicator Section */}
        <div className="pt-4 border-t border-border">
          <h3 className="text-sm font-semibold text-content-primary mb-2">
            Spacing Tool
          </h3>
          <button
            onClick={() => {
              if (app?.spacingIndicatorLayer) {
                app.spacingIndicatorLayer.toggle();
                // Update with current players
                app.spacingIndicatorLayer.updatePlayers(players);
              }
            }}
            className={`${buttonBaseClasses} ${
              app?.spacingIndicatorLayer?.isShowing()
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-surface-secondary text-content-primary hover:bg-surface-tertiary border border-border"
            }`}
            title="Toggle draggable spacing indicator - Drag to measure uniform spacing"
          >
            📏 {app?.spacingIndicatorLayer?.isShowing() ? "Hide" : "Show"}{" "}
            Spacing
          </button>
          <p className="text-xs text-content-tertiary mt-2">
            💡 Drag the blue line to measure spacing between aligned players
          </p>
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
          <li>• Drag selected players to move as group</li>
          <li>• Shift+Click for multi-select</li>
          <li>• Shift+Drag (3+ players) for auto-spacing</li>
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
