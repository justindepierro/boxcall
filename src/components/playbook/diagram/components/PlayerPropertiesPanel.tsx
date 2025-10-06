import React from "react";
import { useDiagramEditor } from "../context/useDiagramEditor";
import type { DiagramPlayer } from "../types/types";
import { colorTokens } from "../../../../design-system/tokens";

export const PlayerPropertiesPanel: React.FC = () => {
  const { state, dispatch } = useDiagramEditor();

  // Get the selected player
  const selectedPlayerId = state.ui.selectedIds?.[0];
  const selectedPlayer = selectedPlayerId
    ? state.doc.players.find((p) => p.id === selectedPlayerId)
    : null;

  if (!selectedPlayer) {
    return (
      <div className="p-4">
        <div className="text-sm text-content-secondary">
          Select a player to edit properties
        </div>
      </div>
    );
  }

  const updatePlayer = (updates: Partial<DiagramPlayer>) => {
    dispatch({
      type: "UPDATE_PLAYER",
      id: selectedPlayer.id,
      patch: updates,
    });
  };

  const colorOptions = [
    colorTokens.emerald[700], // Green
    colorTokens.blue[900], // Blue
    colorTokens.red[600], // Red
    colorTokens.purple[600], // Purple
    colorTokens.emerald[600], // Emerald
    colorTokens.amber[600], // Orange
    colorTokens.cyan[600], // Cyan
    colorTokens.violet[600], // Rose
  ];

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-sm font-medium text-content-primary mb-3">
          Player Properties
        </h3>
      </div>

      {/* Label */}
      <div>
        <label className="block text-xs font-medium text-content-secondary mb-1">
          Label
        </label>
        <input
          type="text"
          value={selectedPlayer.label}
          onChange={(e) => updatePlayer({ label: e.target.value })}
          className="w-full px-2 py-1 text-sm bg-surface-secondary border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Role */}
      <div>
        <label className="block text-xs font-medium text-content-secondary mb-1">
          Role
        </label>
        <input
          type="text"
          value={selectedPlayer.role || ""}
          onChange={(e) => updatePlayer({ role: e.target.value })}
          className="w-full px-2 py-1 text-sm bg-surface-secondary border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="e.g., QB, RB, WR"
        />
      </div>

      {/* Side */}
      <div>
        <label className="block text-xs font-medium text-content-secondary mb-1">
          Side
        </label>
        <select
          value={selectedPlayer.side || ""}
          onChange={(e) =>
            updatePlayer({ side: e.target.value as "O" | "D" | "ST" })
          }
          className="w-full px-2 py-1 text-sm bg-surface-secondary border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">None</option>
          <option value="O">Offense</option>
          <option value="D">Defense</option>
          <option value="ST">Special Teams</option>
        </select>
      </div>

      {/* Color */}
      <div>
        <label className="block text-xs font-medium text-content-secondary mb-2">
          Color
        </label>
        <div className="grid grid-cols-4 gap-2">
          {colorOptions.map((color) => (
            <button
              key={color}
              onClick={() => updatePlayer({ color })}
              className={`w-8 h-8 rounded-lg border-2 ${
                selectedPlayer.color === color
                  ? "border-primary"
                  : "border-border hover:border-primary/50"
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Assignment/Notes */}
      <div>
        <label className="block text-xs font-medium text-content-secondary mb-1">
          Assignment
        </label>
        <textarea
          value={selectedPlayer.assignment || ""}
          onChange={(e) => updatePlayer({ assignment: e.target.value })}
          className="w-full px-2 py-1 text-sm bg-surface-secondary border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          rows={3}
          placeholder="Assignment or notes..."
        />
      </div>

      {/* Lock Toggle */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-content-secondary">
          Locked
        </label>
        <button
          onClick={() => updatePlayer({ locked: !selectedPlayer.locked })}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            selectedPlayer.locked ? "bg-primary" : "bg-surface-tertiary"
          }`}
        >
          <span
            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
              selectedPlayer.locked ? "translate-x-5" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Actions */}
      <div className="pt-4 border-t border-border">
        <button
          onClick={() =>
            dispatch({ type: "REMOVE_PLAYER", id: selectedPlayer.id })
          }
          className="w-full px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Remove Player
        </button>
      </div>
    </div>
  );
};
