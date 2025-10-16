/**
 * FormationBuilderCanvas - Formation Editor using DiagramEditor
 *
 * Wraps the existing DiagramCanvas/PixiJS system in formation mode:
 * - Simplified controls (no routes, no defense, no annotations)
 * - Focus on positioning offensive players only
 * - Personnel package integration
 * - Save directly to formation.player_positions
 *
 * Reuses: DiagramCanvas, PlayersLayer, useDiagramStore, usePixiApp
 * Custom: Formation-specific sidebar controls
 */

import React, { useState, useRef, useEffect } from "react";
import { DiagramCanvas } from "../diagram-editor/components/DiagramCanvas";
import { useDiagramStore } from "../diagram-editor/stores/diagramStore";
import type { DiagramPixiApp } from "../diagram-editor/core/PixiApp";
import type { Player } from "../diagram-editor/types/Player";
import type { Formation, FormationPlayerPosition } from "../../../types/formation";
import { usePersonnelConfigurations } from "../../../hooks/usePersonnel";
import { Button } from "../../ui/Button/Button";
import { Icon } from "../../ui/Icon/Icon";
import { Typography } from "../../design-system/Typography";
import { v4 as uuidv4 } from "uuid";

interface FormationBuilderCanvasProps {
  playbookId: string;
  formationId?: string; // For editing existing formation
  formation?: Formation | null; // Existing formation data
  onSave: (players: FormationPlayerPosition[], personnel: string) => void;
  onCancel: () => void;
}

export const FormationBuilderCanvas: React.FC<FormationBuilderCanvasProps> = ({
  playbookId,
  formationId,
  formation,
  onSave,
  onCancel,
}) => {
  const [app, setApp] = useState<DiagramPixiApp | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedPersonnel, setSelectedPersonnel] = useState<string>(
    formation?.personnel_name || "11"
  );

  // Zustand store
  const { players, addPlayer, clearPlayers } = useDiagramStore();

  // Personnel configurations
  const { data: personnelConfigs } = usePersonnelConfigurations(playbookId);

  // Load existing formation on mount
  useEffect(() => {
    if (!formation || !formation.player_positions) return;

    // Clear existing players
    clearPlayers();

    // Convert formation positions to diagram players
    formation.player_positions.forEach((pos: FormationPlayerPosition) => {
      const player: Player = {
        id: uuidv4(),
        x: pos.x,
        y: pos.y,
        jerseyNumber: pos.label || pos.position || "?",
        team: "offense" as const,
        role: pos.role,
        position: pos.position?.toUpperCase() === "C" ? "center" : "regular",
      };
      addPlayer(player);
    });
  }, [formation, clearPlayers, addPlayer]);

  // Load personnel package
  const handleLoadPersonnel = (personnelName: string) => {
    setSelectedPersonnel(personnelName);

    const config = personnelConfigs?.find((p) => p.name === personnelName);
    if (!config || !config.players) return;

    // Clear existing players
    clearPlayers();

    // Position mapping for personnel positions
    const POSITION_COORDS: Record<string, { x: number; y: number }> = {
      QB: { x: 26.67, y: 12 },
      RB: { x: 31, y: 10 },
      FB: { x: 26.67, y: 8 },
      TE: { x: 21, y: 17.5 },
      WR: { x: 10, y: 17.5 },
      C: { x: 26.67, y: 17.5 },
      LG: { x: 24, y: 17.5 },
      RG: { x: 29.33, y: 17.5 },
      LT: { x: 21.33, y: 17.5 },
      RT: { x: 32, y: 17.5 },
    };

    // Add players from personnel config
    config.players.forEach((personnelPlayer, index) => {
      const position = personnelPlayer.player_position;
      let baseCoords = POSITION_COORDS[position] || { x: 26.67, y: 17.5 };

      // Spread WRs across field
      if (position === "WR") {
        const wrIndex = config.players
          .filter((p) => p.player_position === "WR")
          .findIndex((p) => p.id === personnelPlayer.id);

        const positions = [
          { x: 10, y: 17.5 }, // X - far left
          { x: 18, y: 17.5 }, // Y - slot left
          { x: 35, y: 17.5 }, // Z - slot right
          { x: 43, y: 17.5 }, // Additional WR - far right
        ];
        baseCoords = positions[wrIndex] || positions[0];
      }

      // Spread RBs
      if (position === "RB") {
        const rbIndex = config.players
          .filter((p) => p.player_position === "RB")
          .findIndex((p) => p.id === personnelPlayer.id);

        const positions = [
          { x: 31, y: 10 },
          { x: 22, y: 10 },
        ];
        baseCoords = positions[rbIndex] || positions[0];
      }

      const player: Player = {
        id: `${personnelPlayer.id}-${index}`,
        x: baseCoords.x,
        y: baseCoords.y,
        jerseyNumber: personnelPlayer.label || position,
        team: "offense" as const,
        role: position,
        position: position === "C" ? "center" : "regular",
      };

      addPlayer(player);
    });
  };

  // Save formation
  const handleSave = () => {
    // Convert diagram players to formation positions
    const formationPositions: FormationPlayerPosition[] = players.map(
      (player) => ({
        id: uuidv4(),
        x: player.x,
        y: player.y,
        position: player.role,
        label: player.jerseyNumber,
        role: player.role,
        jerseyNumber: player.jerseyNumber,
      })
    );

    onSave(formationPositions, selectedPersonnel);
  };

  // Add single player
  const handleAddPlayer = () => {
    const centerX = 26.67;
    const centerY = 17.5;

    // Find last added player position
    const lastPlayer = players[players.length - 1];
    const offsetX = lastPlayer ? 5 : 0; // Offset 5 yards to right

    const player: Player = {
      id: uuidv4(),
      x: centerX + offsetX,
      y: centerY,
      jerseyNumber: String(players.length + 1),
      team: "offense" as const,
      role: "WR",
      position: "regular",
    };

    addPlayer(player);
  };

  return (
    <div className="flex h-full" ref={containerRef}>
      {/* Canvas Area */}
      <div className="flex-1 relative bg-surface-secondary">
        <DiagramCanvas
          app={app}
          onAppReady={setApp}
          fieldWidth={53.333}
          fieldHeight={35}
          backgroundColor={0xf5f7ed}
        />
      </div>

      {/* Sidebar Controls */}
      <div className="w-80 bg-surface-primary border-l border-border-primary overflow-y-auto">
        <div className="p-spacing-lg space-y-spacing-lg">
          {/* Header */}
          <div>
            <Typography variant="headline-md" className="text-text-primary">
              Formation Builder
            </Typography>
            <Typography variant="caption" className="text-text-muted">
              {formationId ? "Edit formation" : "Create new formation"}
            </Typography>
          </div>

          {/* Personnel Selector */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-spacing-sm">
              Personnel Package
            </label>
            <select
              value={selectedPersonnel}
              onChange={(e) => handleLoadPersonnel(e.target.value)}
              className="w-full px-spacing-md py-spacing-sm border border-border-primary rounded-md bg-surface-primary text-text-primary"
            >
              <option value="">Select Personnel...</option>
              {personnelConfigs?.map((config) => (
                <option key={config.id} value={config.name}>
                  {config.name} - {config.description}
                </option>
              ))}
            </select>
            <Typography variant="caption" className="text-text-muted mt-spacing-xs">
              Load pre-configured player positions
            </Typography>
          </div>

          {/* Player Controls */}
          <div>
            <Typography variant="body-md-bold" className="text-text-primary mb-spacing-sm">
              Players
            </Typography>
            <div className="space-y-spacing-sm">
              <Button
                onClick={handleAddPlayer}
                variant="secondary"
                className="w-full"
              >
                <Icon name="plus" size="sm" />
                Add Player
              </Button>
              <Button
                onClick={() => clearPlayers()}
                variant="ghost"
                className="w-full"
              >
                <Icon name="trash-2" size="sm" />
                Clear All
              </Button>
            </div>
            <Typography variant="caption" className="text-text-muted mt-spacing-sm">
              {players.length} player{players.length !== 1 ? "s" : ""} on field
            </Typography>
          </div>

          {/* Instructions */}
          <div className="p-spacing-md bg-surface-muted rounded-md border border-border-primary">
            <Typography variant="caption" className="text-text-secondary">
              <strong>💡 Tips:</strong>
            </Typography>
            <ul className="mt-spacing-xs text-xs text-text-muted space-y-spacing-xs">
              <li>• Select personnel to load default positions</li>
              <li>• Drag players to position them</li>
              <li>• Click player to select/deselect</li>
              <li>• Add players manually as needed</li>
              <li>• Save when positions look good</li>
            </ul>
          </div>

          {/* Save/Cancel Buttons */}
          <div className="flex gap-spacing-sm pt-spacing-md border-t border-border-primary">
            <Button onClick={onCancel} variant="ghost" className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              variant="primary"
              className="flex-1"
              disabled={players.length === 0}
            >
              <Icon name="save" size="sm" />
              Save Formation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
