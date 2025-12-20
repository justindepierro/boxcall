import React, { useMemo, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { Button } from "../../ui/Button/Button";
import { Typography } from "../../design-system/Typography";
import { Badge } from "../../ui/Badge";
import { FormSelect } from "../../ui";
import { PlaySelectorModal } from "../PlaySelectorModal";
import { triggerHapticFeedback } from "../../../lib/hapticFeedback";
import { logError } from "../../../utils/logger";
import { useToast } from "../../../hooks/useToast";
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

const SITUATION_RECOMMENDATIONS: Record<
  BillickSituationType,
  { min: number; max: number; runPassBalance?: boolean }
> = {
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

function analyzePlayBalanceWarnings(
  plays: GamePlanPlay[],
  situationType: BillickSituationType
): string[] | null {
  if (plays.length === 0) return null;

  const totalPlays = plays.length;

  // Count play types
  const runPlays = plays.filter(
    (p) =>
      p.playName?.toLowerCase().includes("run") ||
      p.formation?.toLowerCase().includes("i-form") ||
      p.formation?.toLowerCase().includes("power")
  ).length;
  const passPlays = plays.filter(
    (p) =>
      p.playName?.toLowerCase().includes("pass") ||
      p.formation?.toLowerCase().includes("trips") ||
      p.formation?.toLowerCase().includes("spread")
  ).length;

  const rec = SITUATION_RECOMMENDATIONS[situationType];
  const warnings: string[] = [];

  if (totalPlays < rec.min) {
    warnings.push(`Only ${totalPlays} plays (recommend ${rec.min}-${rec.max})`);
  }

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
}

function GamePlanModalShell({
  onBackdropClose,
  children,
}: {
  onBackdropClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 bg-backdrop flex items-center justify-center p-4 z-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onBackdropClose();
        }
      }}
    >
      <div
        className="bg-primary elevation-modal rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function ModalHeader({
  title,
  onClose,
}: {
  title: string;
  onClose: () => void;
}) {
  return (
    <div className="flex justify-between items-center mb-6">
      <Typography variant="display-lg">{title}</Typography>
      <button
        onClick={onClose}
        className="text-secondary hover:text-primary transition-colors"
        aria-label="Close modal"
      >
        ✕
      </button>
    </div>
  );
}

function GamePlanDetailsForm({
  formData,
  setFormData,
}: {
  formData: GamePlanFormData;
  setFormData: React.Dispatch<React.SetStateAction<GamePlanFormData>>;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div>
        <label className="block text-secondary text-sm font-medium mb-2">
          Game Plan Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
        <FormSelect
          value={formData.gameLocation || ""}
          onChange={(value) =>
            setFormData({
              ...formData,
              gameLocation: value as "Home" | "Away" | "Neutral" | undefined,
            })
          }
          placeholder="Select..."
          options={[
            { value: "Home", label: "Home" },
            { value: "Away", label: "Away" },
            { value: "Neutral", label: "Neutral" },
          ]}
        />
      </div>
    </div>
  );
}

function SituationTabs({
  allSituations,
  situations,
  activeSituation,
  warningsByType,
  onSelectSituation,
}: {
  allSituations: ReturnType<typeof getAllBillickSituations>;
  situations: GamePlanSituation[];
  activeSituation: BillickSituationType;
  warningsByType: Partial<Record<BillickSituationType, string[]>>;
  onSelectSituation: (type: BillickSituationType) => void;
}) {
  return (
    <div className="mb-6">
      <Typography variant="body-lg" className="mb-3 font-semibold">
        Billick Situations
      </Typography>
      <div className="flex flex-wrap gap-2 mb-4">
        {allSituations.map((situation) => {
          const isActive = activeSituation === situation.type;
          const colorClasses = getBillickSituationColorClasses(situation.type);
          const situationPlays =
            situations.find((s) => s.situationType === situation.type)?.plays ||
            [];
          const playCount = situationPlays.length;
          const warnings = warningsByType[situation.type];
          const hasWarnings = Boolean(warnings && warnings.length > 0);

          return (
            <button
              key={situation.type}
              onClick={() => onSelectSituation(situation.type)}
              className={`
                relative px-3 py-2 rounded-lg text-sm font-medium transition-all
                ${
                  isActive
                    ? `${colorClasses.bg} ${colorClasses.text}`
                    : "bg-surface-elevated text-secondary hover:bg-surface-overlay"
                }
                ${
                  playCount > 0
                    ? "border-2 border-primary-light"
                    : "border border-muted"
                }
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
  );
}

function BalanceWarnings({ warnings }: { warnings: string[] }) {
  return (
    <div className="mb-4 p-3 bg-status-warning/10 border border-status-warning rounded-lg">
      <div className="flex items-start gap-2">
        <Typography
          variant="body-sm"
          className="font-medium text-status-warning"
        >
          ⚠️ Balance Warning:
        </Typography>
        <div className="flex-1">
          {warnings.map((warning) => (
            <Typography
              key={warning}
              variant="body-sm"
              className="text-secondary"
            >
              • {warning}
            </Typography>
          ))}
        </div>
      </div>
    </div>
  );
}

function SituationPlaysList({
  plays,
  onDragEnd,
  onRemove,
}: {
  plays: GamePlanPlay[];
  onDragEnd: (result: DropResult) => void;
  onRemove: (id: string) => void;
}) {
  if (plays.length === 0) {
    return (
      <div className="text-center py-8 text-secondary">
        <Typography variant="body-sm">
          No plays assigned to this situation yet.
        </Typography>
        <Typography variant="body-sm">
          Click "Add Play" to get started.
        </Typography>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="situation-plays">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="space-y-2"
          >
            {plays
              .sort((a, b) => a.priority - b.priority)
              .map((play, index) => (
                <Draggable key={play.id} draggableId={play.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`flex items-center justify-between p-3 border border-muted rounded-lg bg-surface-base hover:bg-surface-elevated transition-colors ${
                        snapshot.isDragging ? "shadow-lg" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-secondary w-6">
                          {play.priority}
                        </span>
                        <div>
                          <Typography variant="body-md" className="font-medium">
                            {play.playName}
                          </Typography>
                          <div className="flex gap-2 mt-1 flex-wrap items-center">
                            {play.formation && (
                              <Badge variant="neutral" size="sm">
                                {play.formation}
                              </Badge>
                            )}
                            {play.personnel && (
                              <Badge variant="info" size="sm">
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
                        onClick={() => onRemove(play.id)}
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
  );
}

function ActiveSituationPanel({
  activeSituationConfig,
  currentSituation,
  warnings,
  onAddPlay,
  onDragEnd,
  onRemovePlay,
}: {
  activeSituationConfig: ReturnType<typeof getAllBillickSituations>[number];
  currentSituation: GamePlanSituation;
  warnings: string[] | null;
  onAddPlay: () => void;
  onDragEnd: (result: DropResult) => void;
  onRemovePlay: (id: string) => void;
}) {
  return (
    <div className="border border-muted rounded-lg p-6 mb-6">
      {warnings && <BalanceWarnings warnings={warnings} />}

      <div className="flex items-center justify-between mb-4">
        <div>
          <Typography variant="display-md" className="mb-1">
            {activeSituationConfig.label}
          </Typography>
          <Typography variant="body-sm" className="text-secondary">
            {activeSituationConfig.description}
          </Typography>
        </div>
        <Button variant="secondary" size="sm" onClick={onAddPlay}>
          + Add Play
        </Button>
      </div>

      <SituationPlaysList
        plays={currentSituation.plays}
        onDragEnd={onDragEnd}
        onRemove={onRemovePlay}
      />
    </div>
  );
}

function FooterActions({
  canExport,
  isExporting,
  onExport,
  onCancel,
  canSave,
  onSave,
  saveLabel,
}: {
  canExport: boolean;
  isExporting: boolean;
  onExport: () => void;
  onCancel: () => void;
  canSave: boolean;
  onSave: () => void;
  saveLabel: string;
}) {
  return (
    <div className="flex justify-between items-center pt-4 border-t border-muted">
      <Button
        variant="secondary"
        onClick={onExport}
        disabled={!canExport || isExporting}
      >
        {isExporting ? "Exporting..." : "📄 Export PDF"}
      </Button>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onSave} disabled={!canSave}>
          {saveLabel}
        </Button>
      </div>
    </div>
  );
}

interface GamePlanModalProps {
  onClose: () => void;
  onSave: (gamePlan: GamePlan) => void;
  initialGamePlan?: Partial<GamePlan>;
}

function buildGamePlan(params: {
  formData: GamePlanFormData;
  situations: GamePlanSituation[];
  initialGamePlan?: Partial<GamePlan>;
}): GamePlan {
  const { formData, situations, initialGamePlan } = params;

  return {
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
}

export const GamePlanModal: React.FC<GamePlanModalProps> = ({
  onClose,
  onSave,
  initialGamePlan,
}) => {
  const toast = useToast();
  const allSituations = useMemo(() => getAllBillickSituations(), []);
  const [formData, setFormData] = useState<GamePlanFormData>({
    name: initialGamePlan?.name || "",
    opponent: initialGamePlan?.opponent || "",
    gameDate: initialGamePlan?.gameDate,
    gameLocation: initialGamePlan?.gameLocation,
  });

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
      toast.error(
        "Please fill in game plan name and opponent before exporting"
      );
      return;
    }

    setIsExporting(true);
    try {
      const gamePlan = buildGamePlan({ formData, situations, initialGamePlan });

      const { GamePlanPDFService } = await import(
        "../../../services/gamePlanPdfService"
      );
      await GamePlanPDFService.exportGamePlan(gamePlan, "call-sheet");
    } catch (error) {
      logError("Error exporting PDF:", error);
      toast.error("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.opponent.trim()) {
      // TODO: Show validation error
      return;
    }

    const gamePlan = buildGamePlan({ formData, situations, initialGamePlan });

    onSave(gamePlan);
  };

  const currentSituation = situations.find(
    (s) => s.situationType === activeSituation
  );
  const currentSituationConfig = allSituations.find(
    (s) => s.type === activeSituation
  );

  const warningsByType = useMemo(() => {
    const map: Partial<Record<BillickSituationType, string[]>> = {};
    for (const s of allSituations) {
      const situation = situations.find((x) => x.situationType === s.type);
      const warnings = analyzePlayBalanceWarnings(
        situation?.plays || [],
        s.type
      );
      if (warnings) map[s.type] = warnings;
    }
    return map;
  }, [allSituations, situations]);

  const activeWarnings = currentSituation
    ? analyzePlayBalanceWarnings(currentSituation.plays, activeSituation)
    : null;

  // Get all selected play IDs to exclude from selector
  const selectedPlayIds = situations.flatMap((s) =>
    s.plays.map((p) => p.playId)
  );

  const canSave = Boolean(formData.name.trim() && formData.opponent.trim());
  const title = initialGamePlan?.id ? "Edit Game Plan" : "New Game Plan";
  const saveLabel = initialGamePlan?.id ? "Save Changes" : "Create Game Plan";

  return (
    <GamePlanModalShell onBackdropClose={onClose}>
      <div className="p-6">
        <ModalHeader title={title} onClose={onClose} />
        <GamePlanDetailsForm formData={formData} setFormData={setFormData} />

        <SituationTabs
          allSituations={allSituations}
          situations={situations}
          activeSituation={activeSituation}
          warningsByType={warningsByType}
          onSelectSituation={setActiveSituation}
        />

        {currentSituationConfig && currentSituation && (
          <ActiveSituationPanel
            activeSituationConfig={currentSituationConfig}
            currentSituation={currentSituation}
            warnings={activeWarnings}
            onAddPlay={() => setShowPlaySelector(true)}
            onDragEnd={handleDragEnd}
            onRemovePlay={handleRemovePlay}
          />
        )}

        <FooterActions
          canExport={canSave}
          isExporting={isExporting}
          onExport={handleExportPDF}
          onCancel={onClose}
          canSave={canSave}
          onSave={handleSave}
          saveLabel={saveLabel}
        />
      </div>

      {/* Play Selector Modal */}
      <PlaySelectorModal
        isOpen={showPlaySelector}
        onClose={() => setShowPlaySelector(false)}
        onSelectPlay={handleAddPlayToSituation}
        selectedPlayIds={selectedPlayIds}
        title="Select Play for Game Plan"
      />
    </GamePlanModalShell>
  );
};
