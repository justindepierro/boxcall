import React from "react";
import { useDiagramStore } from "../stores/diagramStore";
import type { Player } from "../types/Player";
import type { ProfessionalPixiEngine } from "../core/ProfessionalPixiEngine";
import { useToast } from "../../../../hooks/useToast";
import { colorTokens } from "../../../../design-system/tokens";

// Custom hooks
import { useFormationDropdowns } from "./PlayerControls/hooks/useFormationDropdowns";
import { useClickOutside } from "./PlayerControls/hooks/useClickOutside";
import { useAlignmentState } from "./PlayerControls/hooks/useAlignmentState";
import { useFormationAnalysis } from "./PlayerControls/hooks/useFormationAnalysis";
import { useCoverageAdjustment } from "./PlayerControls/hooks/useCoverageAdjustment";

// Handlers
import {
  executeOffenseFormation,
  detectOffensiveAlignment,
  executeDefenseFormation,
  handleAlignmentChange as handleAlignmentChangeHandler,
} from "./PlayerControls/handlers";

interface PlayerControlsProps {
  app: ProfessionalPixiEngine | null;
  externalAlignment?: "left" | "middle" | "right";
}

/**
 * Player Controls - Sidebar UI for adding/removing players
 */
export const PlayerControls: React.FC<PlayerControlsProps> = ({
  app,
  externalAlignment,
}) => {
  const { players, addPlayer, removePlayer, selectedPlayerId } =
    useDiagramStore();

  // Count selected players (for multi-select support)
  const selectedCount = selectedPlayerId ? 1 : 0;

  const toast = useToast();

  // Formation dropdown state (custom hook)
  const {
    isFormationDropdownOpen,
    setIsFormationDropdownOpen,
    isDefenseDropdownOpen,
    setIsDefenseDropdownOpen,
    isCoverageDropdownOpen,
    setIsCoverageDropdownOpen,
  } = useFormationDropdowns();

  // Click outside refs (custom hook)
  const { dropdownRef, defenseDropdownRef, coverageDropdownRef } =
    useClickOutside({
      isFormationDropdownOpen,
      setIsFormationDropdownOpen,
      isDefenseDropdownOpen,
      setIsDefenseDropdownOpen,
      isCoverageDropdownOpen,
      setIsCoverageDropdownOpen,
    });

  // Alignment state (custom hook with handler)
  const { selectedAlignment, setInternalAlignment } = useAlignmentState({
    externalAlignment,
    onAlignmentChange: (newAlignment) => {
      handleAlignmentChangeHandler(
        newAlignment,
        app,
        players,
        setInternalAlignment
      );
    },
  });

  // Formation analysis (custom hook)
  const formationAnalysis = useFormationAnalysis({
    players,
    selectedAlignment,
  });

  // Coverage adjustment callback (custom hook)
  const { handleAutoAdjustCoverage } = useCoverageAdjustment({
    app,
    formationAnalysis,
    players,
    selectedAlignment,
    toast,
  });

  // Formation confirmation dialog state (local state for modal)
  const [showFormationConfirm, setShowFormationConfirm] = React.useState(false);
  const [pendingFormationAction, setPendingFormationAction] = React.useState<
    (() => void) | null
  >(null);
  const [confirmTitle, setConfirmTitle] = React.useState("⚠️ Confirm Action");
  const [confirmMessage, setConfirmMessage] = React.useState("");

  // Count offensive players
  const offensivePlayerCount = players.filter(
    (p) => p.team === "offense"
  ).length;

  // Helper to show confirm modal
  const showConfirmModal = (
    message: string,
    onConfirm: () => void,
    title: string = "⚠️ Confirm Action"
  ) => {
    setConfirmTitle(title);
    setConfirmMessage(message);
    setShowFormationConfirm(true);
    setPendingFormationAction(() => onConfirm);
  };

  /**
   * Add full offensive formation (11 players)
   * Standard spread formation below line of scrimmage:
   * LOS -  WR           LT LG [C] RG RT           WR
   * 1yd -     WR                                WR
   * 4yd -                     RB QB
   */
  const handleAddOffenseFormation = (
    formationType:
      | "spread2x2"
      | "spread3x1Right"
      | "spread3x1Left" = "spread2x2"
  ) => {
    // Check if already at 11 players - offer to replace formation
    if (offensivePlayerCount >= 11) {
      showConfirmModal(
        `⚠️ You already have a full formation (11 offensive players) on the field.\n\nChanging formations will remove all existing players and reset the formation.\n\nThis will also clear any routes, assignments, or drawings associated with these players.\n\nAre you sure you want to continue?`,
        () => {
          // Clear existing offensive players
          const offensivePlayers = players.filter((p) => p.team === "offense");
          offensivePlayers.forEach((p) => removePlayer(p.id));
          // Execute the formation based on type with current alignment
          executeFormation(formationType, selectedAlignment);
        },
        "⚠️ Replace Formation?"
      );
      setIsFormationDropdownOpen(false);
      return;
    }

    // Check if there are existing offensive players (but less than 11)
    if (offensivePlayerCount > 0 && offensivePlayerCount < 11) {
      showConfirmModal(
        `⚠️ Changing formations will remove all ${offensivePlayerCount} existing offensive player${offensivePlayerCount !== 1 ? "s" : ""}.\n\nThis will also clear any routes, assignments, or drawings associated with these players.\n\nAre you sure you want to continue?`,
        () => {
          // Clear existing offensive players
          const offensivePlayers = players.filter((p) => p.team === "offense");
          offensivePlayers.forEach((p) => removePlayer(p.id));
          // Execute the formation based on type with current alignment
          executeFormation(formationType, selectedAlignment);
        },
        "⚠️ Change Formation?"
      );
      setIsFormationDropdownOpen(false);
      return;
    }

    // No offensive players yet, proceed directly with current alignment
    executeFormation(formationType, selectedAlignment);
    setIsFormationDropdownOpen(false);
  };

  /**
   * Execute the appropriate formation based on type
   */
  const executeFormation = (
    formationType: "spread2x2" | "spread3x1Right" | "spread3x1Left",
    alignment: "left" | "middle" | "right"
  ) => {
    executeOffenseFormation(formationType, alignment, app, addPlayer);
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
            {/* Formation Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() =>
                  setIsFormationDropdownOpen(!isFormationDropdownOpen)
                }
                className={`${buttonBaseClasses} bg-blue-600 text-white hover:bg-blue-700 font-bold flex items-center justify-between`}
                title="Add Full Offensive Formation"
              >
                <span>🏈 Add Offense Formation</span>
                <span className="ml-2">
                  {isFormationDropdownOpen ? "▲" : "▼"}
                </span>
              </button>

              {/* Dropdown Menu */}
              {isFormationDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-surface-primary/95 dark:bg-surface-secondary/95 backdrop-blur-md border border-stroke rounded-lg shadow-2xl z-50 overflow-hidden">
                  <button
                    onClick={() => {
                      handleAddOffenseFormation("spread2x2");
                      setIsFormationDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-content-primary hover:bg-surface-secondary/50 transition-colors border-b border-stroke/50"
                  >
                    <div className="font-medium">Spread 2x2</div>
                    <div className="text-xs text-content-secondary">
                      Shotgun, 2 WR each side
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      handleAddOffenseFormation("spread3x1Right");
                      setIsFormationDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-content-primary hover:bg-surface-secondary/50 transition-colors border-b border-stroke/50"
                  >
                    <div className="font-medium">Spread 3x1 Right</div>
                    <div className="text-xs text-content-secondary">
                      Shotgun, 3 WR right, 1 WR left
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      handleAddOffenseFormation("spread3x1Left");
                      setIsFormationDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-content-primary hover:bg-surface-secondary/50 transition-colors"
                  >
                    <div className="font-medium">Spread 3x1 Left</div>
                    <div className="text-xs text-content-secondary">
                      Shotgun, 3 WR left, 1 WR right
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Defense Formation Dropdown */}
            <div className="relative" ref={defenseDropdownRef}>
              <button
                onClick={() => setIsDefenseDropdownOpen(!isDefenseDropdownOpen)}
                className={`${buttonBaseClasses} bg-error-600 text-white hover:bg-error-700 font-bold flex items-center justify-between`}
                title="Add Full Defensive Formation"
              >
                <span>🛡️ Add Defense Formation</span>
                <span className="ml-2">
                  {isDefenseDropdownOpen ? "▲" : "▼"}
                </span>
              </button>

              {/* Dropdown Menu */}
              {isDefenseDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-surface-primary/95 dark:bg-surface-secondary/95 backdrop-blur-md border border-stroke rounded-lg shadow-2xl z-50 overflow-hidden">
                  <button
                    onClick={() => {
                      const offenseAlignment = detectOffensiveAlignment(
                        players,
                        app,
                        selectedAlignment
                      );
                      executeDefenseFormation(
                        "nickel425",
                        offenseAlignment,
                        app,
                        addPlayer
                      );
                      setIsDefenseDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-content-primary hover:bg-surface-secondary/50 transition-colors"
                  >
                    <div className="font-medium">Nickel 4-2-5</div>
                    <div className="text-xs text-content-secondary">
                      4 DL, 2 LB, 5 DB vs Spread
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Coverage Presets Dropdown */}
            {formationAnalysis &&
              players.filter((p) => p.team === "defense").length > 0 && (
                <div className="relative" ref={coverageDropdownRef}>
                  <button
                    onClick={() =>
                      setIsCoverageDropdownOpen(!isCoverageDropdownOpen)
                    }
                    className={`${buttonBaseClasses} bg-primary-600 text-white hover:bg-primary-700 font-medium flex items-center justify-between`}
                    title="Apply Coverage Preset"
                  >
                    <span>📋 Coverage Presets</span>
                    <span className="ml-2">
                      {isCoverageDropdownOpen ? "▲" : "▼"}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {isCoverageDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-surface-primary/95 dark:bg-surface-secondary/95 backdrop-blur-md border border-stroke rounded-lg shadow-2xl z-50 overflow-hidden">
                      <button
                        onClick={() => {
                          toast.info("Cover 2", "Coming soon!");
                          setIsCoverageDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-content-primary hover:bg-surface-secondary/50 transition-colors"
                      >
                        <div className="font-medium">Cover 2</div>
                        <div className="text-xs text-content-secondary">
                          2-deep safeties, 5 underneath
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          toast.info("Cover 3", "Coming soon!");
                          setIsCoverageDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-content-primary hover:bg-surface-secondary/50 transition-colors"
                      >
                        <div className="font-medium">Cover 3</div>
                        <div className="text-xs text-content-secondary">
                          3-deep zones, 4 underneath
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          toast.info("Cover 4", "Coming soon!");
                          setIsCoverageDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-content-primary hover:bg-surface-secondary/50 transition-colors"
                      >
                        <div className="font-medium">Cover 4 (Quarters)</div>
                        <div className="text-xs text-content-secondary">
                          4-deep zones, pattern match
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          toast.info("Cover 6", "Coming soon!");
                          setIsCoverageDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-content-primary hover:bg-surface-secondary/50 transition-colors"
                      >
                        <div className="font-medium">
                          Cover 6 (Quarter-Quarter-Half)
                        </div>
                        <div className="text-xs text-content-secondary">
                          Split-field coverage
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          handleAutoAdjustCoverage();
                          setIsCoverageDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-content-primary hover:bg-primary-600/10 transition-colors border-t border-border/30"
                      >
                        <div className="font-medium text-primary-400">
                          🛡️ Auto-Adjust (Smart)
                        </div>
                        <div className="text-xs text-content-secondary">
                          Analyze formation and adjust
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              )}

            {/* Add Center Button (keep this here as it's less commonly used) */}
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

      {/* Formation Confirmation Dialog */}
      {showFormationConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-lg">
          <div
            className="relative rounded-2xl p-8 max-w-lg mx-4 animate-in fade-in zoom-in duration-200"
            style={{
              background: "white",
              border: "1px solid rgba(229, 231, 235, 0.8)",
              boxShadow:
                "0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1) inset",
            }}
          >
            <div className="flex items-start gap-5 mb-7">
              <div
                className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)",
                  boxShadow: "0 8px 24px rgba(245, 158, 11, 0.4)",
                }}
              >
                <span className="text-5xl drop-shadow-lg">⚠️</span>
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <h2
                  className="text-2xl font-bold mb-3 leading-tight"
                  style={{ color: colorTokens.gray[900] }}
                >
                  {confirmTitle.replace(/⚠️|❌|✅/gu, "").trim()}
                </h2>
                <p
                  className="text-base whitespace-pre-line leading-relaxed"
                  style={{ color: colorTokens.gray[700] }}
                >
                  {confirmMessage}
                </p>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  if (pendingFormationAction) {
                    pendingFormationAction();
                  }
                  setShowFormationConfirm(false);
                  setPendingFormationAction(null);
                }}
                className="flex-1 px-6 py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-150"
              >
                Yes, Continue
              </button>
              <button
                onClick={() => {
                  setShowFormationConfirm(false);
                  setPendingFormationAction(null);
                }}
                className="flex-1 px-6 py-4 rounded-xl font-semibold text-base transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 shadow-md"
                style={{
                  background: colorTokens.gray[100],
                  color: colorTokens.gray[900],
                  border: "1px solid #D1D5DB",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colorTokens.gray[200];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colorTokens.gray[100];
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
