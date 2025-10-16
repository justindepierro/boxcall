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
import type { Player } from "../diagram-editor/types/Player";
import type {
  Formation,
  FormationPlayerPosition,
  FormationCreationSource,
} from "../../../types/formation";
import { usePersonnelConfigurations } from "../../../hooks/usePersonnel";
import { Button } from "../../ui/Button/Button";
import { Icon } from "../../ui/Icon/Icon";
import { Typography } from "../../design-system/Typography";
import { v4 as uuidv4 } from "uuid";

interface FormationBuilderCanvasProps {
  playbookId: string;
  formationId?: string; // For editing existing formation
  formation?: Formation | null; // Existing formation data
  creationSource?: FormationCreationSource; // Where is this being created from
  onSave: (
    players: FormationPlayerPosition[],
    personnel: string,
    creationSource?: FormationCreationSource
  ) => void;
  onCancel: () => void;
}

export const FormationBuilderCanvas: React.FC<FormationBuilderCanvasProps> = ({
  playbookId,
  formationId,
  formation,
  creationSource = "formation_builder", // Default to formation_builder
  onSave,
  onCancel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedPersonnel, setSelectedPersonnel] = useState<string>(
    formation?.personnel_name || "11"
  );
  const [hasLoadedDefaults, setHasLoadedDefaults] = useState(false);

  // Zustand store
  const { players, addPlayer, clearPlayers } = useDiagramStore();

  // Personnel configurations
  const { data: personnelConfigs } = usePersonnelConfigurations(playbookId);

  // Handle Pixi app ready - set LOS position
  const handleAppReady = (app: any) => {
    if (app?.fieldLayer) {
      // Move LOS up 5 yards for symmetry (from 25 to 20)
      // 25 = 50-yard line, 20 = 40-yard line (5 yards up field)
      app.fieldLayer.setLineOfScrimmage(20, true);
      console.log("✅ Formation Builder: LOS set to 40-yard line");
    }
  };

  // Load existing formation or add default O-line
  useEffect(() => {
    // If we have an existing formation, load it
    if (
      formation &&
      formation.player_positions &&
      formation.player_positions.length > 0
    ) {
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
      setHasLoadedDefaults(true);
      return;
    }

    // If no existing formation and we haven't loaded defaults yet, add default O-line
    if (!hasLoadedDefaults && players.length === 0) {
      console.log("📋 Adding default offensive line");

      // Default offensive line: LT, LG, C, RG, RT
      // Y position: 17.5 = middle of 35-yard field (bottom half for offense)
      // X positions: evenly spaced across center of field
      const centerX = 26.67; // Middle of 53.33-yard field width
      const spacing = 1.5; // Yards between linemen
      const oLineY = 21; // Bottom half, above the 20-yard line (offense territory)

      const oLine = [
        { label: "LT", x: centerX - spacing * 2, position: "regular" },
        { label: "LG", x: centerX - spacing, position: "regular" },
        { label: "C", x: centerX, position: "center" }, // Center gets special styling
        { label: "RG", x: centerX + spacing, position: "regular" },
        { label: "RT", x: centerX + spacing * 2, position: "regular" },
      ];

      oLine.forEach((lineman) => {
        const player: Player = {
          id: uuidv4(),
          x: lineman.x,
          y: oLineY,
          jerseyNumber: lineman.label,
          team: "offense" as const,
          role: lineman.label,
          position: lineman.position as "center" | "regular",
        };
        addPlayer(player);
      });

      setHasLoadedDefaults(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formation, hasLoadedDefaults]);

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
        position: position.toUpperCase() === "C" ? "center" : "regular",
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
        position: player.role || "WR", // Default to WR if no role
        label: player.jerseyNumber,
        role: player.role || "WR",
        jerseyNumber: player.jerseyNumber,
      })
    );

    onSave(formationPositions, selectedPersonnel, creationSource);
  };

  // Add single player
  const handleAddPlayer = () => {
    const centerX = 26.67; // Middle of field (53.33 / 2)
    const offensiveY = 21; // Bottom half (offensive territory, matches O-line)

    // Find last added player position
    const lastPlayer = players[players.length - 1];
    const offsetX = lastPlayer ? 5 : 0; // Offset 5 yards to right

    const player: Player = {
      id: uuidv4(),
      x: centerX + offsetX,
      y: offensiveY,
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
          fieldWidth={53.333}
          fieldHeight={35}
          backgroundColor={0xf5f7ed}
          onReady={handleAppReady}
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
            <Typography
              variant="caption"
              className="text-text-muted mt-spacing-xs"
            >
              Load pre-configured player positions
            </Typography>
          </div>

          {/* Player Controls */}
          <div>
            <Typography
              variant="headline-sm"
              className="text-text-primary mb-spacing-sm"
            >
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
                <Icon name="delete" size="sm" />
                Clear All
              </Button>
            </div>
            <Typography
              variant="caption"
              className="text-text-muted mt-spacing-sm"
            >
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
