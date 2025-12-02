import React, { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { Button } from "../../ui/Button/Button";
import { Typography } from "../../design-system/Typography";
import { Badge } from "../../ui/Badge";
import { PlaySelectorModal } from "../PlaySelectorModal";
import { GamePlanPDFService } from "../../../services/gamePlanPdfService";
import { triggerHapticFeedback } from "../../../lib/hapticFeedback";
import {
  getAllBillickSituations,
  getBillickSituationColorClasses,
  type BillickSituationType,
} from "../../../constants/gamePlanSituations";
import type { Play } from "../../../types/play";

import type {
  GamePlan,
  GamePlanFormData,
  GamePlanSituation,
  GamePlanPlay,
} from "./types";

interface GamePlanModalProps {
  onClose: () => void;
  onSave: (gamePlan: GamePlan) => void;
  initialGamePlan?: Partial<GamePlan>;
}

export const GamePlanModal: React.FC<GamePlanModalProps> = ({
  onClose,
  onSave,
  initialGamePlan,
}) => {
  const [formData, setFormData] = useState<GamePlanFormData>({
    name: initialGamePlan?.name || "",
    opponent: initialGamePlan?.opponent || "",
    gameDate: initialGamePlan?.gameDate,
    gameLocation: initialGamePlan?.gameLocation,
  });

  // Initialize all 12 Billick situations if not provided
  const allSituations = getAllBillickSituations();
  const [situations, _setSituations] = useState<GamePlanSituation[]>(
    initialGamePlan?.situations ||
      allSituations.map((config) => ({
        id: crypto.randomUUID(),
        situationType: config.type,
        plays: [],
      }))
  );

  const [activeSituation, setActiveSituation] = useState<BillickSituationType>(
    allSituations[0].type
  );

  const [showPlaySelector, setShowPlaySelector] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Helper function to analyze play balance and return warnings
  const getPlayBalanceWarnings = (situationType: BillickSituationType) => {
    const situation = situations.find((s) => s.situationType === situationType);
    if (!situation || situation.plays.length === 0) return null;

    const plays = situation.plays;
    const totalPlays = plays.length;
    
    // Count play types
    const runPlays = plays.filter((p) => 
      p.playName?.toLowerCase().includes("run") || 
      p.formation?.toLowerCase().includes("i-form") ||
      p.formation?.toLowerCase().includes("power")
    ).length;
    const passPlays = plays.filter((p) => 
      p.playName?.toLowerCase().includes("pass") || 
      p.formation?.toLowerCase().includes("trips") ||
      p.formation?.toLowerCase().includes("spread")
    ).length;

    // Recommended play counts by situation
    const recommendations: Record<BillickSituationType, { min: number; max: number; runPassBalance?: boolean }> = {
      first_and_10: { min: 10, max: 15, runPassBalance: true },
      second_and_short: { min: 8, max: 10 },
      second_and_medium: { min: 8, max: 10 },
      second_and_long: { min: 6, max: 8, runPassBalance: false },
      third_and_short: { min: 10, max: 12 },
      third_and_medium: { min: 10, max: 12 },
      third_and_long: { min: 6, max: 8, runPassBalance: false },
      red_zone: { min: 12, max: 15, runPassBalance: true },
      goal_line: { min: 8, max: 10 },
      two_minute_drill: { min: 10, max: 12, runPassBalance: false },
      short_yardage: { min: 6, max: 8 },
      situational: { min: 10, max: 15 },
    };

    const rec = recommendations[situationType];
    const warnings: string[] = [];

    // Check total play count
    if (totalPlays < rec.min) {
      warnings.push(`Only ${totalPlays} plays (recommend ${rec.min}-${rec.max})`);
    }

    // Check run/pass balance for situations that need it
    if (rec.runPassBalance && totalPlays >= 6) {
      const runPercentage = (runPlays / totalPlays) * 100;
      const passPercentage = (passPlays / totalPlays) * 100;
      
      if (runPercentage < 30) {
        warnings.push(`Low run plays (${runPlays}/${totalPlays})`);
      }
      if (passPercentage < 30) {
        warnings.push(`Low pass plays (${passPlays}/${totalPlays})`);
      }
    }

    return warnings.length > 0 ? warnings : null;
  };

  const handleAddPlayToSituation = (play: Play) => {
    const situation = situations.find(
      (s) => s.situationType === activeSituation
    );
    if (!situation) return;

    // Determine next priority
    const maxPriority =
      situation.plays.length > 0
        ? Math.max(...situation.plays.map((p) => p.priority))
        : 0;

    const newPlay: GamePlanPlay = {
      id: crypto.randomUUID(),
      playId: play.id,
      playName: play.play_name,
      formation: play.formation,
      personnel: play.personnel,
      wristbandNumber: play.wristband_number,
      priority: maxPriority + 1,
    };

    // Update situations by adding play to current situation
    _setSituations((prev) =>
      prev.map((s) =>
        s.situationType === activeSituation
          ? { ...s, plays: [...s.plays, newPlay] }
          : s
      )
    );
  };

  const handleRemovePlay = (playId: string) => {
    _setSituations((prev) =>
      prev.map((s) =>
        s.situationType === activeSituation
          ? {
              ...s,
              plays: s.plays
                .filter((p) => p.id !== playId)
                // Renumber priorities after removal
                .map((p, index) => ({ ...p, priority: index + 1 })),
            }
          : s
      )
    );
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    // Haptic feedback on successful reorder
    triggerHapticFeedback("medium");

    _setSituations((prev) =>
      prev.map((s) => {
        if (s.situationType !== activeSituation) return s;

        const reorderedPlays = Array.from(s.plays);
        const [movedPlay] = reorderedPlays.splice(sourceIndex, 1);
        reorderedPlays.splice(destinationIndex, 0, movedPlay);

        // Update priorities to match new order
        return {
          ...s,
          plays: reorderedPlays.map((p, index) => ({
            ...p,
            priority: index + 1,
          })),
        };
      })
    );
  };

  const handleExportPDF = async () => {
    if (!formData.name.trim() || !formData.opponent.trim()) {
      alert("Please fill in game plan name and opponent before exporting");
      return;
    }

    setIsExporting(true);
    try {
      const gamePlan: GamePlan = {
        id: initialGamePlan?.id || crypto.randomUUID(),
        name: formData.name,
        opponent: formData.opponent,
        gameDate: formData.gameDate,
        gameLocation: formData.gameLocation,
        situations,
        createdAt: initialGamePlan?.createdAt || new Date(),
        updatedAt: new Date(),
        isArchived: initialGamePlan?.isArchived || false,
      };

      await GamePlanPDFService.exportGamePlan(gamePlan, "call-sheet");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.opponent.trim()) {
      // TODO: Show validation error
      return;
    }

    const gamePlan: GamePlan = {
      id: initialGamePlan?.id || crypto.randomUUID(),
      name: formData.name,
      opponent: formData.opponent,
      gameDate: formData.gameDate,
      gameLocation: formData.gameLocation,
      situations,
      createdAt: initialGamePlan?.createdAt || new Date(),
      updatedAt: new Date(),
      isArchived: initialGamePlan?.isArchived || false,
    };

    onSave(gamePlan);
  };

  const currentSituation = situations.find(
    (s) => s.situationType === activeSituation
  );

  const currentSituationConfig = allSituations.find(
    (s) => s.type === activeSituation
  );

  // Get all selected play IDs to exclude from selector
  const selectedPlayIds = situations.flatMap((s) =>
    s.plays.map((p) => p.playId)
  );

  return (
    <div
      className="fixed inset-0 bg-backdrop flex items-center justify-center p-4 z-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-primary elevation-modal rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <Typography variant="display-lg">
              {initialGamePlan?.id ? "Edit Game Plan" : "New Game Plan"}
            </Typography>
            <button
              onClick={onClose}
              className="text-secondary hover:text-primary transition-colors"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>

          {/* Game Plan Form */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-secondary text-sm font-medium mb-2">
                Game Plan Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-base bg-surface-base text-primary"
                placeholder="e.g., Week 7 vs Eagles"
              />
            </div>
            <div>
              <label className="block text-secondary text-sm font-medium mb-2">
                Opponent *
              </label>
              <input
                type="text"
                value={formData.opponent}
                onChange={(e) =>
                  setFormData({ ...formData, opponent: e.target.value })
                }
                className="w-full px-4 py-2 border border-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-base bg-surface-base text-primary"
                placeholder="e.g., Philadelphia Eagles"
              />
            </div>
            <div>
              <label className="block text-secondary text-sm font-medium mb-2">
                Game Date
              </label>
              <input
                type="date"
                value={formData.gameDate || ""}
                onChange={(e) =>
                  setFormData({ ...formData, gameDate: e.target.value })
                }
                className="w-full px-4 py-2 border border-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-base bg-surface-base text-primary"
              />
            </div>
            <div>
              <label className="block text-secondary text-sm font-medium mb-2">
                Location
              </label>
              <select
                value={formData.gameLocation || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    gameLocation: e.target.value as
                      | "Home"
                      | "Away"
                      | "Neutral"
                      | undefined,
                  })
                }
                className="w-full px-4 py-2 border border-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-base bg-surface-base text-primary"
              >
                <option value="">Select...</option>
                <option value="Home">Home</option>
                <option value="Away">Away</option>
                <option value="Neutral">Neutral</option>
              </select>
            </div>
          </div>

          {/* Situation Tabs */}
          <div className="mb-6">
            <Typography variant="body-lg" className="mb-3 font-semibold">
              Billick Situations
            </Typography>
            <div className="flex flex-wrap gap-2 mb-4">
              {allSituations.map((situation) => {
                const isActive = activeSituation === situation.type;
                const colorClasses = getBillickSituationColorClasses(
                  situation.type
                );
                const situationPlays =
                  situations.find((s) => s.situationType === situation.type)
                    ?.plays || [];
                const playCount = situationPlays.length;
                const warnings = getPlayBalanceWarnings(situation.type);
                const hasWarnings = warnings && warnings.length > 0;

                return (
                  <button
                    key={situation.type}
                    onClick={() => setActiveSituation(situation.type)}
                    className={`
                      relative px-3 py-2 rounded-lg text-sm font-medium transition-all
                      ${isActive ? colorClasses.bg + " " + colorClasses.text : "bg-surface-elevated text-secondary hover:bg-surface-overlay"}
                      ${playCount > 0 ? "border-2 border-primary-light" : "border border-muted"}
                      ${hasWarnings ? "border-status-warning" : ""}
                    `}
                    title={warnings ? warnings.join(", ") : undefined}
                  >
                    {situation.label}
                    {playCount > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs rounded-full bg-primary-base text-inverse">
                        {playCount}
                      </span>
                    )}
                    {hasWarnings && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-warning opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-status-warning"></span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Situation Content */}
          {currentSituationConfig && currentSituation && (
            <div className="border border-muted rounded-lg p-6 mb-6">
              {/* Balance Warnings */}
              {getPlayBalanceWarnings(activeSituation) && (
                <div className="mb-4 p-3 bg-status-warning/10 border border-status-warning rounded-lg">
                  <div className="flex items-start gap-2">
                    <Typography variant="body-sm" className="font-medium text-status-warning">
                      ⚠️ Balance Warning:
                    </Typography>
                    <div className="flex-1">
                      {getPlayBalanceWarnings(activeSituation)?.map((warning, idx) => (
                        <Typography key={idx} variant="body-sm" className="text-secondary">
                          • {warning}
                        </Typography>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <div>
                  <Typography variant="display-md" className="mb-1">
                    {currentSituationConfig.label}
                  </Typography>
                  <Typography variant="body-sm" className="text-secondary">
                    {currentSituationConfig.description}
                  </Typography>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowPlaySelector(true)}
                >
                  + Add Play
                </Button>
              </div>

              {/* Play List for Current Situation */}
              {currentSituation.plays.length === 0 ? (
                <div className="text-center py-8 text-secondary">
                  <Typography variant="body-sm">
                    No plays assigned to this situation yet.
                  </Typography>
                  <Typography variant="body-sm">
                    Click "Add Play" to get started.
                  </Typography>
                </div>
              ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="situation-plays">
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="space-y-2"
                      >
                        {currentSituation.plays
                          .sort((a, b) => a.priority - b.priority)
                          .map((play, index) => (
                            <Draggable
                              key={play.id}
                              draggableId={play.id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`flex items-center justify-between p-3 border border-muted rounded-lg bg-surface-base hover:bg-surface-elevated transition-colors ${snapshot.isDragging ? "shadow-lg" : ""}`}
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="text-sm font-bold text-secondary w-6">
                                      {play.priority}
                                    </span>
                                    <div>
                                      <Typography
                                        variant="body-md"
                                        className="font-medium"
                                      >
                                        {play.playName}
                                      </Typography>
                                      <div className="flex gap-2 mt-1 flex-wrap items-center">
                                        {play.formation && (
                                          <Badge variant="neutral" size="sm">
                                            {play.formation}
                                          </Badge>
                                        )}
                                        {play.personnel && (
                                          <Badge variant="primary" size="sm">
                                            {play.personnel}
                                          </Badge>
                                        )}
                                        {play.wristbandNumber && (
                                          <Badge variant="info" size="sm">
                                            #{play.wristbandNumber}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleRemovePlay(play.id)}
                                    className="text-secondary hover:text-status-error transition-colors"
                                    aria-label="Remove play"
                                  >
                                    ✕
                                  </button>
                                </div>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-muted">
            <Button
              variant="secondary"
              onClick={handleExportPDF}
              disabled={
                !formData.name.trim() ||
                !formData.opponent.trim() ||
                isExporting
              }
            >
              {isExporting ? "Exporting..." : "📄 Export PDF"}
            </Button>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={!formData.name.trim() || !formData.opponent.trim()}
              >
                {initialGamePlan?.id ? "Save Changes" : "Create Game Plan"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Play Selector Modal */}
      <PlaySelectorModal
        isOpen={showPlaySelector}
        onClose={() => setShowPlaySelector(false)}
        onSelectPlay={handleAddPlayToSituation}
        selectedPlayIds={selectedPlayIds}
        title="Select Play for Game Plan"
      />
    </div>
  );
};
