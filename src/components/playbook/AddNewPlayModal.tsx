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
import { leftRightToLegacyValue, parseLeftRight } from "../../utils/leftRight";
import {
  validateFormationName,
  validatePersonnelValue,
} from "../../utils/playFieldValidation";
import type { PlayCombo } from "../../hooks/useRecentPlayCombos";
import { debug, logError } from "../../utils/logger";
import { useActiveTeamStore } from "../../stores/activeTeamStore";
import { TeamSituationDefinitionsService } from "../../services/teamSituationDefinitionsService";
import { getFieldZoneDefinitions } from "../../utils/situationBucketing";
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

    if (!isValid()) {
      setErrorMessage("Please enter formation and play name");
      return;
    }

    // Validate formation field
    if (formData.formation.trim()) {
      const formationValidation = validateFormationName(
        formData.formation.trim()
      );
      if (!formationValidation.isValid) {
        setErrorMessage(formationValidation.error || "Invalid formation name");
        return;
      }
    }

    // Validate personnel field
    if (formData.personnel.trim()) {
      const personnelValidation = validatePersonnelValue(
        formData.personnel.trim()
      );
      if (!personnelValidation.isValid) {
        setErrorMessage(personnelValidation.error || "Invalid personnel value");
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Validate preferences against team settings
      if (activeTeamId) {
        try {
          const defs = await TeamSituationDefinitionsService.get(activeTeamId);
          const fieldZoneLabels = getFieldZoneDefinitions(defs).map(
            (z) => z.label
          );
          const customSituationLabels = Array.isArray(
            (defs as any).custom_situations
          )
            ? ((defs as any).custom_situations as any[])
                .map((s) => String(s?.label ?? "").trim())
                .filter(Boolean)
            : [];

          const fieldPos = formData.prefFieldPos.trim();
          if (
            fieldPos &&
            fieldZoneLabels.length > 0 &&
            !fieldZoneLabels.some(
              (l) => l.toLowerCase() === fieldPos.toLowerCase()
            )
          ) {
            setErrorMessage(
              "Preferred field position must match Team Settings"
            );
            setIsSubmitting(false);
            return;
          }

          const situation = formData.prefSituation.trim();
          if (
            situation &&
            customSituationLabels.length > 0 &&
            !customSituationLabels.some(
              (l) => l.toLowerCase() === situation.toLowerCase()
            )
          ) {
            setErrorMessage("Preferred situation must match Team Settings");
            setIsSubmitting(false);
            return;
          }
        } catch {
          // Don't block play creation if definitions fail to load
        }
      }

      // Parse tags
      const fTags = formData.formationTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const pTags = formData.playTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      // Handle direction
      const formationDirToken = parseLeftRight(
        String(formData.formation_direction ?? formData.formationDir)
      );
      const canonicalLegacyFDir = leftRightToLegacyValue(formationDirToken);

      const playData = {
        formation: formData.formation.trim(),
        play_name: formData.playName.trim(),
        p_type: formData.playType?.trim() || undefined,
        personnel: formData.personnel.trim() || undefined,

        // Formation fields
        f_type: formData.formationType.trim() || undefined,
        f_dir: canonicalLegacyFDir || formData.formationDir.trim() || undefined,
        formation_direction: formationDirToken,
        back_align: formData.backAlign.trim() || undefined,
        back_left_of_qb: formData.backLeftOfQb || undefined,
        back_right_of_qb: formData.backRightOfQb || undefined,
        shift: formData.shift.trim() || undefined,
        motion: formData.motion.trim() || undefined,
        ftag1: fTags[0] || undefined,
        ftag2: fTags[1] || undefined,
        r_str: formData.runStrength.trim() || undefined,
        p_str: formData.passStrength.trim() || undefined,

        // Play details
        p_dir: formData.playDir || undefined,
        protection: formData.protection.trim() || undefined,
        check_into: formData.checkInto.trim() || undefined,
        p_tag1: pTags[0] || undefined,
        p_tag2: pTags[1] || undefined,

        // Preferences
        pref_down: formData.prefDown || undefined,
        pref_dis: formData.prefDistance || undefined,
        pref_hash: formData.prefHash || undefined,
        pref_cov: formData.prefCoverage.trim() || undefined,
        pref_front: formData.prefFront.trim() || undefined,
        pref_field_pos: formData.prefFieldPos.trim() || undefined,
        pref_situation: formData.prefSituation.trim() || undefined,

        // Other
        confidence_base: formData.confidence,
        one_word_play: formData.oneWordPlay.trim() || undefined,
        wristband_number: formData.wristbandNumber.trim() || undefined,
        notes: formData.description.trim() || undefined,
        diagram_image_url: formData.diagram_image_url || undefined,

        // Metadata arrays
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        key_positions:
          formData.key_positions.length > 0
            ? formData.key_positions
            : undefined,
        key_players:
          formData.key_players.length > 0 ? formData.key_players : undefined,
        flags: formData.flags.length > 0 ? formData.flags : undefined,
      };

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

      if (error && typeof error === "object" && "issues" in error) {
        const issues = (error as { issues: Array<{ message: string }> }).issues;
        setErrorMessage(issues.map((i) => i.message).join(", "));
      } else if (error instanceof Error) {
        if (
          error.message.includes("Rate limit") ||
          error.message.includes("too quickly")
        ) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("Failed to create play. Please try again.");
        }
      } else {
        setErrorMessage("Failed to create play. Please try again.");
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
        <div className="flex justify-end gap-sm">
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
          >
            {isSubmitting ? (
              <>{existingPlay ? "Updating..." : "Creating..."}</>
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
      }
    >
      <div className="space-y-lg max-h-[70vh] overflow-y-auto pr-sm">
        {/* Error Messages */}
        {errorMessage && (
          <div className="bg-danger-subtle border border-danger-default rounded-lg p-md flex items-start gap-sm">
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
              className="text-danger-default hover:text-danger-emphasis"
            >
              <Icon name="close" className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Rate Limit Warning */}
        {!existingPlay && rateLimitFeedback.isNearLimit && (
          <div className="bg-warning-subtle border border-warning-default rounded-lg p-md flex items-center gap-sm">
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
          <div className="bg-danger-subtle border border-danger-default rounded-lg p-md flex items-center gap-sm">
            <Icon
              name="alert-triangle"
              className="h-5 w-5 text-danger-default"
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
