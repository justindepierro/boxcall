/**
 * FormationBuilderCanvas - Modern Formation Editor
 *
 * Wraps the DiagramCanvas/PixiJS system in formation mode:
 * - Modern inline header toolbar (matches DiagramEditor)
 * - Simplified controls (no routes, no defense, no annotations)
 * - Focus on positioning offensive players only
 * - Personnel package integration with badge display
 * - Save directly to formation.player_positions
 *
 * Reuses: DiagramCanvas, PlayersLayer, useDiagramStore, usePixiApp
 * UI Pattern: Inline toolbar + full-width canvas (no sidebar)
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
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
import { useToast } from "../../../hooks/useToast";
import { v4 as uuidv4 } from "uuid";
import {
  FORMATION_TEMPLATES,
  loadFormationTemplate,
} from "./formationTemplates";
import { useFormationHistory } from "./useFormationHistory";
import {
  getOptimalPosition,
  checkFormationLegality,
} from "../diagram-editor/utils/SmartPositioning";

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
  formationId: _formationId,
  formation,
  creationSource = "formation_builder", // Default to formation_builder
  onSave,
  onCancel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false); // Track if we've run initialization
  const [selectedPersonnel, setSelectedPersonnel] = useState<string>(
    formation?.personnel_name || ""
  );
  const [hasLoadedDefaults, setHasLoadedDefaults] = useState(false);
  const [personnelLoading, setPersonnelLoading] = useState(true); // Track if we're still waiting for personnel
  const toast = useToast();
  const { saveState, undo, redo, clearHistory } = useFormationHistory();

  // Zustand store
  const { players, addPlayer, clearPlayers } = useDiagramStore();

  // Personnel configurations
  const { data: personnelConfigs, isLoading } =
    usePersonnelConfigurations(playbookId);

  // Auto-save to history when players change (with 500ms debounce)
  useEffect(() => {
    if (players.length === 0) return;

    const timer = setTimeout(() => {
      saveState(players);
    }, 500);

    return () => clearTimeout(timer);
  }, [players, saveState]);

  // Save formation with validation (defined early for keyboard shortcuts)
  const handleSave = useCallback(() => {
    // Validation: Check player count
    if (players.length === 0) {
      toast.error("Add at least one player to the formation");
      return;
    }

    if (players.length > 11) {
      toast.error("Formation cannot have more than 11 players");
      return;
    }

    // Validation: Check personnel selected
    if (!selectedPersonnel) {
      toast.error("Select a personnel package");
      return;
    }

    // Formation legality validation (NFL rules)
    const playersOnLOS = players.filter((p) => Math.abs(p.y - 20) < 0.5).length;
    if (playersOnLOS < 7) {
      toast.error(
        `Illegal formation: Only ${playersOnLOS} players on line of scrimmage (need at least 7)`
      );
      return;
    }

    if (playersOnLOS > 7) {
      toast.warning(
        `${playersOnLOS} players on LOS - ensure proper numbering for legal formation`
      );
    }

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

    console.log("💾 Saving formation:", {
      players: players.length,
      personnel: selectedPersonnel,
      positions: formationPositions.length,
      playersOnLOS,
      legal: playersOnLOS >= 7,
    });

    onSave(formationPositions, selectedPersonnel, creationSource);

    // Success feedback
    toast.success(`Formation saved with ${players.length} players`);
  }, [players, selectedPersonnel, onSave, creationSource, toast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + S to save
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (players.length > 0) {
          handleSave();
        }
      }

      // Cmd/Ctrl + Z to undo
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        const prevState = undo();
        if (prevState) {
          clearPlayers();
          prevState.forEach((p) => addPlayer(p));
          toast.success("Undo");
        }
      }

      // Cmd/Ctrl + Shift + Z to redo
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        const nextState = redo();
        if (nextState) {
          clearPlayers();
          nextState.forEach((p) => addPlayer(p));
          toast.success("Redo");
        }
      }

      // Delete/Backspace to clear all players
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        !e.metaKey &&
        !e.ctrlKey
      ) {
        // Only if not focused on input
        const target = e.target as HTMLElement;
        if (
          target.tagName !== "INPUT" &&
          target.tagName !== "TEXTAREA" &&
          target.tagName !== "SELECT"
        ) {
          e.preventDefault();
          clearPlayers();
          clearHistory();
          toast.success("All players cleared");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    players.length,
    clearPlayers,
    toast,
    handleSave,
    undo,
    redo,
    clearHistory,
    addPlayer,
  ]);

  // Log mount for debugging (only on actual mount/unmount, not prop changes)
  useEffect(() => {
    console.log("🚀 FormationBuilderCanvas: Mounted", {
      formationId: _formationId,
    });
    return () => {
      console.log("🧹 FormationBuilderCanvas: Unmounting, clearing players");
      hasInitialized.current = false; // Reset initialization flag
      clearPlayers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount/unmount

  // ============================================================================
  // HELPER: Load personnel players onto canvas (DRY - used in multiple places)
  // ============================================================================
  const loadPersonnelPlayers = useCallback(
    (config: any) => {
      if (!config || !config.players || config.players.length === 0) {
        console.warn("⚠️ Personnel config has no players");
        return;
      }

      console.log("🔄 Loading personnel players:", config.players.length);
      console.log("🧠 Using SMART POSITIONING system");

      // Build up players array as we go for smart positioning context
      const loadedPlayers: Player[] = [];

      // Add players from personnel config using intelligent positioning
      config.players.forEach((personnelPlayer: any, index: number) => {
        const position = personnelPlayer.player_position;

        // Use smart positioning engine with current + already-loaded players
        const suggestion = getOptimalPosition(position, loadedPlayers);

        console.log(
          `  📍 ${position} → (${suggestion.x.toFixed(1)}, ${suggestion.y.toFixed(1)}) - ${suggestion.reasoning}`
        );

        const player: Player = {
          id: `${personnelPlayer.id}-${index}`,
          x: suggestion.x,
          y: suggestion.y,
          jerseyNumber: personnelPlayer.label || position,
          team: "offense" as const,
          role: position,
          position: position.toUpperCase() === "C" ? "center" : "regular",
        };

        addPlayer(player);
        loadedPlayers.push(player); // Track for next iteration
      });

      // ALWAYS add offensive line if not already in personnel config
      const hasOLine = config.players.some((p: any) =>
        ["C", "LG", "RG", "LT", "RT"].includes(p.player_position)
      );

      if (!hasOLine) {
        console.log("📋 Adding offensive line to personnel (not in config)");

        // Use smart positioning for O-line (guarantees correct coordinates)
        const oLine: Array<{
          label: "C" | "LG" | "RG" | "LT" | "RT";
          position: "center" | "regular";
        }> = [
          { label: "LT", position: "regular" as const },
          { label: "LG", position: "regular" as const },
          { label: "C", position: "center" as const },
          { label: "RG", position: "regular" as const },
          { label: "RT", position: "regular" as const },
        ];

        oLine.forEach((lineman) => {
          const currentPlayers = Array.from(players);
          const suggestion = getOptimalPosition(lineman.label, currentPlayers);

          const player: Player = {
            id: `oline-${lineman.label}-${uuidv4()}`,
            x: suggestion.x,
            y: suggestion.y,
            jerseyNumber: lineman.label,
            team: "offense" as const,
            role: lineman.label,
            position: lineman.position,
          };
          addPlayer(player);
        });
      }

      // Check formation legality after loading
      const legality = checkFormationLegality(Array.from(players));
      if (!legality.isLegal) {
        console.warn("⚠️ Formation may be illegal:", legality.issues);
      }
      console.log(
        `✅ Formation loaded: ${legality.totalPlayers} players, ${legality.playersOnLOS} on LOS`
      );

      console.log(
        "✅ Personnel players loaded:",
        config.players.length,
        hasOLine ? "(with O-line)" : "(O-line added)"
      );
    },
    [addPlayer, players]
  ); // Added players dependency for smart positioning

  // Track when personnel configs finish loading
  useEffect(() => {
    if (!isLoading) {
      setPersonnelLoading(false);
      console.log(
        "📦 Personnel configs loaded:",
        personnelConfigs?.length || 0
      );
    }
  }, [isLoading, personnelConfigs?.length]); // Only depend on loading state and count, not full data object

  // Auto-select first personnel if none selected and configs are loaded (ONCE on mount)
  useEffect(() => {
    // Only run once
    if (hasInitialized.current) {
      return;
    }

    // DON'T auto-load if we have an existing formation with saved positions
    if (
      formation &&
      formation.player_positions &&
      formation.player_positions.length > 0
    ) {
      console.log(
        "⏭️  Skipping personnel auto-load - existing formation has saved positions"
      );
      hasInitialized.current = true; // Mark as initialized to prevent future runs
      return;
    }

    if (!selectedPersonnel && personnelConfigs && personnelConfigs.length > 0) {
      hasInitialized.current = true; // Mark as initialized

      // Prioritize "Blue" over alphabetical order
      const blueConfig = personnelConfigs.find((c) => c.name === "Blue");
      const defaultPersonnel = blueConfig
        ? blueConfig.name
        : personnelConfigs[0].name;
      const configToLoad = blueConfig || personnelConfigs[0];

      setSelectedPersonnel(defaultPersonnel);
      console.log("🎯 Auto-selected default personnel:", defaultPersonnel);

      // CRITICAL: Clear any existing players before loading personnel
      clearPlayers();

      // Auto-load the personnel players using shared helper
      loadPersonnelPlayers(configToLoad);
      setHasLoadedDefaults(true);
    }
  }, [
    formation,
    selectedPersonnel,
    personnelConfigs,
    clearPlayers,
    loadPersonnelPlayers,
  ]); // Include clearPlayers

  // Handle Pixi app ready - set LOS position
  const handleAppReady = (app: any) => {
    if (app?.fieldLayer) {
      // Move LOS up 5 yards for symmetry (from 25 to 20)
      // 25 = 50-yard line, 20 = 40-yard line (5 yards up field)
      app.fieldLayer.setLineOfScrimmage(20, true);
      console.log("✅ Formation Builder: LOS set to 40-yard line");
    }
  };

  // Load existing formation or add default O-line (ONLY if personnel didn't load)
  useEffect(() => {
    // Skip if already loaded defaults (prevents re-running)
    if (hasLoadedDefaults) {
      return;
    }

    // Wait for personnel configs to finish loading before deciding
    if (personnelLoading) {
      return; // Silent wait - no need to log every render
    }

    // If personnel exists and loaded players, we're done (DON'T add O-line on top)
    if (personnelConfigs && personnelConfigs.length > 0) {
      console.log("✅ Personnel configs available, skipping fallback O-line");
      return;
    }

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
      console.log("✅ Existing formation loaded");
      return;
    }

    // ONLY add default O-line if no personnel configs exist (absolute last resort fallback)
    if (!personnelConfigs || personnelConfigs.length === 0) {
      if (players.length === 0) {
        console.log(
          "📋 No personnel configs found - adding default O-line as fallback"
        );

        // Default offensive line: LT, LG, C, RG, RT
        const centerX = 26.67; // Middle of 53.33-yard field width
        const spacing = 1.5; // Yards between linemen
        const oLineY = 20; // On the LOS at 40-yard line

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
        console.log("✅ Default O-line added:", oLine.length, "players");
      }
    }
  }, [
    formation,
    hasLoadedDefaults,
    personnelConfigs,
    personnelLoading,
    players.length,
    addPlayer,
    clearPlayers,
  ]); // players.length safe here - only triggers fallback check

  // Load personnel package
  const handleLoadPersonnel = (personnelName: string) => {
    setSelectedPersonnel(personnelName);

    const config = personnelConfigs?.find((p) => p.name === personnelName);
    if (!config || !config.players) return;

    // Clear existing players and load new personnel using shared helper
    clearPlayers();
    loadPersonnelPlayers(config);
  };

  // Load formation template
  const handleLoadTemplate = (templateId: string) => {
    const template = FORMATION_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    // Clear existing players
    clearPlayers();

    // Load template players
    const templatePlayers = loadFormationTemplate(templateId);
    templatePlayers.forEach((player) => addPlayer(player));

    // Set personnel if available
    const matchingPersonnel = personnelConfigs?.find(
      (p) => p.name === template.personnel
    );
    if (matchingPersonnel) {
      setSelectedPersonnel(matchingPersonnel.name);
    }

    toast.success(`Loaded ${template.name} template`);
    console.log(
      "📋 Template loaded:",
      template.name,
      templatePlayers.length,
      "players"
    );
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
    <div className="flex flex-col h-full" ref={containerRef}>
      {/* Modern Header Toolbar */}
      <div className="flex flex-col gap-3 px-4 py-3 bg-surface-card border-b border-border">
        {/* Top Row: Title and Save/Cancel */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-content-primary flex items-center gap-2">
            <Icon name="grid" size="lg" />
            Formation Builder
          </h1>

          <div className="flex items-center gap-2">
            <Button onClick={onCancel} variant="ghost" size="sm">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              variant="primary"
              size="sm"
              disabled={players.length === 0}
            >
              <Icon name="save" size="sm" />
              Save Formation
            </Button>
          </div>
        </div>

        {/* Bottom Row: Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Formation Templates Dropdown */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="formation-template"
              className="text-xs text-content-secondary font-medium"
            >
              Quick Start:
            </label>
            <select
              id="formation-template"
              onChange={(e) => {
                if (e.target.value) {
                  handleLoadTemplate(e.target.value);
                  e.target.value = ""; // Reset dropdown
                }
              }}
              className="px-3 py-1.5 text-xs border border-border rounded-md bg-surface-primary text-content-primary hover:bg-surface-muted focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            >
              <option value="">Select Template...</option>
              {FORMATION_TEMPLATES.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} ({template.personnel})
                </option>
              ))}
            </select>
          </div>

          {/* Personnel Badge */}
          {selectedPersonnel && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-content-secondary font-medium">
                Personnel:
              </span>
              <div className="px-3 py-1.5 rounded-full bg-jade-600 text-white text-xs font-bold shadow-sm flex items-center gap-1.5">
                <Icon name="users" size="sm" />
                <span>{selectedPersonnel}</span>
                {personnelConfigs?.find((c) => c.name === selectedPersonnel)
                  ?.description && (
                  <span className="text-jade-100 font-normal">
                    (
                    {
                      personnelConfigs.find((c) => c.name === selectedPersonnel)
                        ?.description
                    }
                    )
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="h-6 w-px bg-border"></div>

          {/* Bulk Selection Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-content-secondary font-medium">
              Select:
            </span>
            <button
              onClick={() => {
                // Select all O-line players (C, LG, RG, LT, RT)
                const oLineCount = players.filter((p) =>
                  ["C", "LG", "RG", "LT", "RT"].includes(p.role || "")
                ).length;
                if (oLineCount > 0) {
                  toast.success(`Selected ${oLineCount} O-line players`);
                  // Note: Actual selection would be handled by DiagramCanvas/PlayersLayer
                } else {
                  toast.error("No O-line players found");
                }
              }}
              className="px-3 py-1.5 text-xs bg-surface-card border border-border text-content-primary hover:bg-surface-muted rounded-full font-medium transition-colors"
              title="Select all offensive line players"
            >
              O-Line
            </button>
            <button
              onClick={() => {
                const wrCount = players.filter((p) => p.role === "WR").length;
                if (wrCount > 0) {
                  toast.success(`Selected ${wrCount} receivers`);
                } else {
                  toast.error("No receivers found");
                }
              }}
              className="px-3 py-1.5 text-xs bg-surface-card border border-border text-content-primary hover:bg-surface-muted rounded-full font-medium transition-colors"
              title="Select all receivers"
            >
              WRs
            </button>
            <button
              onClick={() => {
                const skillCount = players.filter((p) =>
                  ["QB", "RB", "FB", "WR", "TE"].includes(p.role || "")
                ).length;
                if (skillCount > 0) {
                  toast.success(`Selected ${skillCount} skill players`);
                } else {
                  toast.error("No skill players found");
                }
              }}
              className="px-3 py-1.5 text-xs bg-surface-card border border-border text-content-primary hover:bg-surface-muted rounded-full font-medium transition-colors"
              title="Select all skill position players"
            >
              Skill
            </button>
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-border"></div>

          {/* Add Player */}
          <button
            onClick={handleAddPlayer}
            className="px-3 py-1.5 text-xs bg-blue-500 text-white hover:bg-blue-600 rounded-full font-medium transition-colors flex items-center gap-1 shadow-sm"
            title="Add Player"
          >
            <Icon name="plus-circle" size="sm" />
            <span>Add Player</span>
          </button>

          {/* Load Personnel */}
          <select
            value={selectedPersonnel}
            onChange={(e) => handleLoadPersonnel(e.target.value)}
            className="px-4 py-2 text-sm bg-jade-600 text-white hover:bg-jade-700 rounded-full font-medium transition-colors cursor-pointer shadow-sm border-none outline-none"
            title="Load Personnel Package"
          >
            <option value="">Load Personnel...</option>
            {personnelConfigs?.map((config) => (
              <option
                key={config.id}
                value={config.name}
                className="bg-white text-text-primary"
              >
                {config.name} - {config.description}
              </option>
            ))}
          </select>

          {/* Clear All */}
          <button
            onClick={() => clearPlayers()}
            disabled={players.length === 0}
            className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors flex items-center gap-1 shadow-sm ${
              players.length > 0
                ? "bg-error-50 text-error-700 hover:bg-error-100 hover:text-error-800"
                : "bg-surface-tertiary text-content-tertiary cursor-not-allowed opacity-50"
            }`}
            title="Clear All Players"
          >
            <Icon name="delete" size="sm" />
            <span>Clear All</span>
          </button>

          {/* Divider */}
          <div className="h-6 w-px bg-border"></div>

          {/* Player Count */}
          <div className="px-4 py-2 text-sm text-content-secondary bg-surface-muted rounded-full font-medium">
            {players.length} player{players.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Canvas Area - Full Width */}
      <div className="flex-1 relative bg-surface-secondary">
        <DiagramCanvas
          fieldWidth={53.333}
          fieldHeight={35}
          backgroundColor={0xf5f7ed}
          onReady={handleAppReady}
        />
      </div>
    </div>
  );
};
