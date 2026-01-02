/**
 * AddNewPlayModal - Create/Edit Play Form
 *
 * Reorganized December 2025 for better UX and cleaner code.
 *
 * Section Order (Desktop):
 * 1. Core Info - Formation, Play Name, Personnel, Play Type
 * 2. Diagram - Play diagram upload (moved up - key feature)
 * 3. Quick Details - One Word Call, Protection, Notes
 * 4. Tags - Tags & organization
 * 5. Advanced Formation - Collapsible advanced settings
 * 6. Game Situation - Collapsible situational preferences
 *
 * Mobile: Uses wizard flow via MobileWizardView
 */

import React, { useState } from "react";
import { Icon } from "../ui/Icon/Icon";
import { Button } from "../ui/Button/Button";
import { Typography } from "../design-system/Typography";
import { Modal } from "../ui/Modal/Modal";
import type { Play } from "../../types/play";
import { useIsMobile } from "../../hooks/useBreakpoint";
import { useMobileButtonProps } from "../../hooks/useMobileButtonProps";
import {
  DOWN_OPTIONS,
  DISTANCE_OPTIONS,
  HASH_OPTIONS,
} from "./play-card/constants";
import { usePlayFormState } from "./AddNewPlayModal/usePlayFormState";
import { useAISuggestions } from "./AddNewPlayModal/useAISuggestions";
import {
  useRateLimitFeedback,
  formatCountdown,
} from "../../hooks/useRateLimitFeedback";
import {
  CoreInfoSection,
  DiagramSection,
  QuickDetailsSection,
  TagsSection,
  FormationAdvancedSection,
  GameSituationSection,
} from "./AddNewPlayModal/sections";
import {
  PersonnelCreationPanel,
  SimilarityIndicator,
} from "./AddNewPlayModal/components";
import { MobileWizardView } from "./AddNewPlayModal/MobileWizardView";
import { usePlaySimilarity } from "./AddNewPlayModal/usePlaySimilarity";
import { FormationDirectionWarningModal } from "./FormationDirectionWarningModal";
import {
  detectDirectionInFormationName,
  type DirectionDetectionResult,
} from "../../utils/formationDirectionDetection";
import type { PlayCombo } from "../../types/play";
import { debug, logError } from "../../utils/logger";
import { useActiveTeamStore } from "../../stores/activeTeamStore";
import {
  getPlayErrorMessage,
  isDuplicateError,
  isRateLimitError,
} from "../../errors/playErrors";
import {
  validateBasicFields,
  validatePersonnel,
  validateFieldPosition,
  validateSituation,
  transformFormDataToPlayData,
} from "./AddNewPlayModal/helpers/submitHelpers";
import type { Database } from "../../types/database";

type FormationRow = Database["public"]["Tables"]["formations"]["Row"];

interface AddNewPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePlay?: (playData: Partial<Play>) => Promise<Play | void>;
  onPlayCreated?: (play: Play) => void;
  existingPlay?: Play | null;
  playbookId?: string;
  existingPlays?: Play[];
  recentCombos?: PlayCombo[];
}

// eslint-disable-next-line max-lines-per-function, complexity
export const AddNewPlayModal: React.FC<AddNewPlayModalProps> = ({
  isOpen,
  onClose,
  onCreatePlay,
  onPlayCreated,
  existingPlay,
  playbookId,
  existingPlays = [],
  recentCombos,
}) => {
  const activeTeamId = useActiveTeamStore((state) => state.activeTeamId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isGameSituationOpen, setIsGameSituationOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDirectionWarning, setShowDirectionWarning] = useState(false);
  const [personnelPanelOpen, setPersonnelPanelOpen] = useState(false);
  const [directionDetection, setDirectionDetection] =
    useState<DirectionDetectionResult | null>(null);

  // Form state hook
  const { formData, updateField, updateFields, resetForm, isValid } =
    usePlayFormState({ existingPlay });

  // AI suggestions
  const {
    suggestions,
    aiSuggestions,
    showSuggestions,
    hideSuggestions,
    isSuggestionsVisible,
    updateContext,
  } = useAISuggestions(playbookId);

  // Rate limiting
  const rateLimitFeedback = useRateLimitFeedback("play-create", 10);

  // Play similarity detection (replaces simple duplicate detection)
  const similarity = usePlaySimilarity(existingPlays, {
    play_name: formData.playName,
    formation: formData.formation,
    personnel: formData.personnel,
    p_type: formData.playType,
    motion: formData.motion,
    shift: formData.shift,
  });

  // Mobile detection
  const isMobile = useIsMobile();
  const mobileButtonSize = useMobileButtonProps("md", true).size;
  const mobileSecondaryButtonSize = useMobileButtonProps("md", false).size;

  if (!isOpen) return null;

  // ==========================================================================
  // FORM SUBMISSION
  // ==========================================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate basic fields
    const basicValidation = validateBasicFields(
      formData.formation,
      formData.playName
    );
    if (!basicValidation.isValid) {
      setErrorMessage(basicValidation.error || "Validation failed");
      return;
    }

    // Validate personnel field
    const personnelValidation = validatePersonnel(formData.personnel);
    if (!personnelValidation.isValid) {
      setErrorMessage(personnelValidation.error || "Invalid personnel");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Validate preferences against team settings
      if (activeTeamId) {
        const fieldPosValidation = await validateFieldPosition(
          formData.prefFieldPos,
          activeTeamId
        );
        if (!fieldPosValidation.isValid) {
          setErrorMessage(fieldPosValidation.error || "Invalid field position");
          setIsSubmitting(false);
          return;
        }

        const situationValidation = await validateSituation(
          formData.prefSituation,
          activeTeamId
        );
        if (!situationValidation.isValid) {
          setErrorMessage(situationValidation.error || "Invalid situation");
          setIsSubmitting(false);
          return;
        }
      }

      // Transform form data to play data
      const playData = transformFormDataToPlayData(formData);

      // Create the play
      const createdPlay = await onCreatePlay?.(playData);

      if (!existingPlay && createdPlay && onPlayCreated) {
        onPlayCreated(createdPlay);
      }

      resetForm();
      setIsAdvancedOpen(false);
      setIsGameSituationOpen(false);
      onClose();
    } catch (error) {
      logError("Failed to create play:", error);

      // Use centralized error message handling
      if (isDuplicateError(error)) {
        const formation = formData.formation.trim();
        const playName = formData.playName.trim();
        setErrorMessage(
          `A play named "${playName}" already exists in "${formation}". Try a different name or formation.`
        );
      } else if (isRateLimitError(error)) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "You're creating plays too quickly. Please wait."
        );
      } else {
        setErrorMessage(getPlayErrorMessage(error));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================================================
  // FORMATION DIRECTION DETECTION
  // ==========================================================================
  const handleFormationChange = (value: string) => {
    const detection = detectDirectionInFormationName(value);

    if (detection.hasDirection) {
      setDirectionDetection(detection);
      setShowDirectionWarning(true);
    } else {
      updateField("formation", value);
      updateContext("formation", value);
    }
  };

  const handleAcceptDirectionSuggestion = (
    cleanName: string,
    direction: "R" | "L"
  ) => {
    updateFields({
      formation: cleanName,
      formationDir: direction,
      formation_direction: direction === "L" ? "left" : "right",
    });
  };

  const handleKeepOriginalFormation = () => {
    if (directionDetection) {
      updateField("formation", directionDetection.originalInput);
    }
  };

  const handleFormationIdChange = (
    id: string | null,
    formation: FormationRow | null
  ) => {
    const updates: Partial<typeof formData> = {
      formation_id: id,
      formation: formation?.name || "",
      formation_direction:
        (formation?.direction as "base" | "left" | "right" | null) ?? null,
    };

    if (formation) {
      if (formation.personnel_name)
        updates.personnel = formation.personnel_name;
      if (formation.formation_type)
        updates.formationType = formation.formation_type;
      if (formation.category) {
        const existingTags = formData.formationTags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
        if (!existingTags.includes(formation.category))
          existingTags.push(formation.category);
        updates.formationTags = existingTags.join(", ");
      }
      if (formation.tags?.length) {
        const existingTags = formData.formationTags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
        formation.tags.forEach((tag: string) => {
          if (!existingTags.includes(tag)) existingTags.push(tag);
        });
        updates.formationTags = existingTags.join(", ");
      }
      if (formation.run_strength) updates.runStrength = formation.run_strength;
      if (formation.pass_strength)
        updates.passStrength = formation.pass_strength;

      debug("📋 Formation metadata transferred:", {
        formation: formation.name,
        updates,
      });
    }

    updateFields(updates);
  };

  // ==========================================================================
  // MOBILE WIZARD VIEW
  // ==========================================================================
  if (isMobile) {
    return (
      <>
        <MobileWizardView
          isOpen={isOpen}
          onClose={onClose}
          formData={formData}
          updateField={updateField}
          updateFields={updateFields}
          isValid={isValid}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          suggestions={suggestions}
          aiSuggestions={aiSuggestions}
          isSuggestionsVisible={isSuggestionsVisible}
          showSuggestions={showSuggestions}
          hideSuggestions={hideSuggestions}
          onFormationChange={handleFormationChange}
          onFormationIdChange={handleFormationIdChange}
          personnelPanelOpen={personnelPanelOpen}
          setPersonnelPanelOpen={setPersonnelPanelOpen}
          isAdvancedOpen={isAdvancedOpen}
          setIsAdvancedOpen={setIsAdvancedOpen}
          playbookId={playbookId}
          existingPlay={existingPlay}
          existingPlays={existingPlays}
          errorMessage={errorMessage}
          rateLimitFeedback={rateLimitFeedback}
          recentCombos={recentCombos}
        />

        {playbookId && (
          <PersonnelCreationPanel
            isOpen={personnelPanelOpen}
            onClose={() => setPersonnelPanelOpen(false)}
            playbookId={playbookId}
            onCreated={(newPersonnel) => {
              updateField("personnel", newPersonnel.name);
              setPersonnelPanelOpen(false);
            }}
          />
        )}
      </>
    );
  }

  // ==========================================================================
  // DESKTOP FORM VIEW
  // ==========================================================================
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existingPlay ? "Edit Play" : "Create New Play"}
      size="lg"
      footer={
        <div className="flex items-center justify-between gap-md border-t border-divider pt-md -mx-md px-md -mb-md pb-md bg-surface-primary">
          {/* Progress indicator */}
          <div className="hidden sm:flex items-center gap-xs text-xs text-tertiary">
            <span
              className={
                formData.formation && formData.playName ? "text-jade-600" : ""
              }
            >
              ●
            </span>
            <span>Core Info</span>
            <span className="text-divider">→</span>
            <span className={formData.diagram_image_url ? "text-jade-600" : ""}>
              ○
            </span>
            <span>Diagram</span>
          </div>
          <div className="flex gap-sm ml-auto">
            <Button
              type="button"
              variant="secondary"
              size={mobileSecondaryButtonSize}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size={mobileButtonSize}
              disabled={isSubmitting || !isValid()}
              onClick={handleSubmit}
              className="min-w-36"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-xs">
                  <span className="animate-spin">⏳</span>
                  {existingPlay ? "Updating..." : "Creating..."}
                </span>
              ) : (
                <>
                  <Icon
                    name={existingPlay ? "edit" : "plus"}
                    className="h-4 w-4 mr-xs"
                  />
                  {existingPlay ? "Update Play" : "Create Play"}
                </>
              )}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-lg max-h-[70vh] overflow-y-auto pr-sm -mr-sm scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-transparent">
        {/* Error Messages */}
        {errorMessage && (
          <div className="bg-gradient-to-r from-danger-subtle to-danger-subtle/50 border-l-4 border-danger-default rounded-r-lg p-md flex items-start gap-sm animate-in slide-in-from-top-2 duration-200">
            <Icon
              name="alert-triangle"
              className="h-5 w-5 text-danger-default flex-shrink-0 mt-0.5"
            />
            <div className="flex-1">
              <Typography
                variant="body-sm"
                className="text-danger-default font-medium"
              >
                {errorMessage}
              </Typography>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-danger-default/60 hover:text-danger-default transition-colors"
            >
              <Icon name="close" className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Rate Limit Warning */}
        {!existingPlay && rateLimitFeedback.isNearLimit && (
          <div className="bg-gradient-to-r from-warning-subtle to-warning-subtle/50 border-l-4 border-warning-default rounded-r-lg p-md flex items-center gap-sm animate-in fade-in duration-200">
            <Icon name="clock" className="h-5 w-5 text-warning-default" />
            <Typography
              variant="body-sm"
              className="text-warning-default font-medium"
            >
              {rateLimitFeedback.remaining} play creation
              {rateLimitFeedback.remaining === 1 ? "" : "s"} remaining
            </Typography>
          </div>
        )}

        {/* Rate Limit Exceeded */}
        {!existingPlay && rateLimitFeedback.isLimited && (
          <div className="bg-gradient-to-r from-danger-subtle to-danger-subtle/50 border-l-4 border-danger-default rounded-r-lg p-md flex items-center gap-sm animate-in fade-in duration-200">
            <Icon
              name="alert-triangle"
              className="h-5 w-5 text-danger-default animate-pulse"
            />
            <Typography
              variant="body-sm"
              className="text-danger-default font-medium"
            >
              Rate limit reached. Please wait{" "}
              {formatCountdown(rateLimitFeedback.secondsUntilReset)}
            </Typography>
          </div>
        )}

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="space-y-lg">
          {/* 1. Core Info */}
          <div className="relative">
            <div className="absolute -left-3 top-0 bottom-0 w-1 bg-gradient-to-b from-jade-500 to-jade-300 rounded-full" />
            <CoreInfoSection
              formation={formData.formation}
              formationDir={formData.formation_direction || ""}
              onFormationChange={handleFormationChange}
              onFormationDirChange={(dir) =>
                updateField("formation_direction", dir)
              }
              playName={formData.playName}
              playDir={formData.playDir}
              onPlayNameChange={(value) => updateField("playName", value)}
              onPlayDirChange={(value) => updateField("playDir", value)}
              personnel={formData.personnel}
              onPersonnelChange={(value) => updateField("personnel", value)}
              onAddNewPersonnel={() => setPersonnelPanelOpen(true)}
              playType={formData.playType}
              onPlayTypeChange={(value) => {
                updateField("playType", value);
                updateContext("playType", value);
              }}
              existingPlays={existingPlays}
            />
          </div>

          {/* Play Similarity Indicator */}
          {!existingPlay && similarity.showIndicator && (
            <SimilarityIndicator
              similarity={similarity}
              onAddMotion={() => setIsAdvancedOpen(true)}
              onAddShift={() => setIsAdvancedOpen(true)}
              onChangeFormation={() => {
                // Focus formation field - scroll to top
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          )}

          {/* 2. Diagram */}
          <DiagramSection
            diagramUrl={formData.diagram_image_url}
            onDiagramChange={(url) => updateField("diagram_image_url", url)}
          />

          {/* 3. Quick Details */}
          <QuickDetailsSection
            oneWordPlay={formData.oneWordPlay}
            protection={formData.protection}
            wristbandNumber={formData.wristbandNumber}
            notes={formData.description}
            onOneWordPlayChange={(value) => updateField("oneWordPlay", value)}
            onProtectionChange={(value) => updateField("protection", value)}
            onWristbandNumberChange={(value) =>
              updateField("wristbandNumber", value)
            }
            onNotesChange={(value) => updateField("description", value)}
            existingPlays={existingPlays}
          />

          {/* 4. Tags */}
          <TagsSection
            formationTags={formData.formationTags}
            playTags={formData.playTags}
            onFormationTagsChange={(value) =>
              updateField("formationTags", value)
            }
            onPlayTagsChange={(value) => updateField("playTags", value)}
            tags={formData.tags}
            onTagsChange={(tags) => updateField("tags", tags)}
            keyPositions={formData.key_positions}
            keyPlayers={formData.key_players}
            onKeyPositionsChange={(positions) =>
              updateField("key_positions", positions)
            }
            onKeyPlayersChange={(players) =>
              updateField("key_players", players)
            }
            personnel={formData.personnel}
            playbookId={playbookId}
          />

          {/* 5. Advanced Formation (Collapsible) */}
          <FormationAdvancedSection
            isOpen={isAdvancedOpen}
            onToggle={() => setIsAdvancedOpen(!isAdvancedOpen)}
            formationType={formData.formationType}
            backAlign={formData.backAlign}
            shift={formData.shift}
            motion={formData.motion}
            runStrength={formData.runStrength}
            passStrength={formData.passStrength}
            backLeftOfQb={formData.backLeftOfQb}
            backRightOfQb={formData.backRightOfQb}
            checkInto={formData.checkInto}
            onFormationTypeChange={(value) =>
              updateField("formationType", value)
            }
            onBackAlignChange={(value) => updateField("backAlign", value)}
            onShiftChange={(value) => updateField("shift", value)}
            onMotionChange={(value) => updateField("motion", value)}
            onRunStrengthChange={(value) => updateField("runStrength", value)}
            onPassStrengthChange={(value) => updateField("passStrength", value)}
            onBackLeftOfQbChange={(value) => updateField("backLeftOfQb", value)}
            onBackRightOfQbChange={(value) =>
              updateField("backRightOfQb", value)
            }
            onCheckIntoChange={(value) => updateField("checkInto", value)}
            confidence={formData.confidence}
            onConfidenceChange={(value) => updateField("confidence", value)}
            existingPlays={existingPlays}
          />

          {/* 6. Game Situation (Collapsible) */}
          <GameSituationSection
            isOpen={isGameSituationOpen}
            onToggle={() => setIsGameSituationOpen(!isGameSituationOpen)}
            prefDown={formData.prefDown}
            prefDistance={formData.prefDistance}
            prefHash={formData.prefHash}
            prefCoverage={formData.prefCoverage}
            prefFront={formData.prefFront}
            prefFieldPos={formData.prefFieldPos}
            prefSituation={formData.prefSituation}
            onPrefDownChange={(value) => updateField("prefDown", value)}
            onPrefDistanceChange={(value) => updateField("prefDistance", value)}
            onPrefHashChange={(value) => updateField("prefHash", value)}
            onPrefCoverageChange={(value) => updateField("prefCoverage", value)}
            onPrefFrontChange={(value) => updateField("prefFront", value)}
            onPrefFieldPosChange={(value) => updateField("prefFieldPos", value)}
            onPrefSituationChange={(value) =>
              updateField("prefSituation", value)
            }
            downOptions={DOWN_OPTIONS}
            distanceOptions={DISTANCE_OPTIONS}
            hashOptions={HASH_OPTIONS}
          />
        </form>
      </div>

      {/* Direction Warning Modal */}
      {directionDetection && (
        <FormationDirectionWarningModal
          isOpen={showDirectionWarning}
          onClose={() => setShowDirectionWarning(false)}
          detection={directionDetection}
          onAcceptSuggestion={handleAcceptDirectionSuggestion}
          onKeepOriginal={handleKeepOriginalFormation}
        />
      )}

      {/* Personnel Creation Panel */}
      {playbookId && (
        <PersonnelCreationPanel
          isOpen={personnelPanelOpen}
          onClose={() => setPersonnelPanelOpen(false)}
          playbookId={playbookId}
          onCreated={(newPersonnel) => {
            updateField("personnel", newPersonnel.name);
            setPersonnelPanelOpen(false);
          }}
        />
      )}
    </Modal>
  );
};
