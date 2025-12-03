import React, { useState } from "react";
import { Icon } from "../ui/Icon/Icon";
import { Button } from "../ui/Button/Button";
import { Typography } from "../design-system/Typography";
import { Modal } from "../ui/Modal/Modal";
import { ImageUpload } from "../ui/ImageUpload";
import type { Play } from "../../types/play";
import { useIsMobile } from "../../hooks/useBreakpoint";
import { useMobileButtonProps } from "../../hooks/useMobileButtonProps";
import {
  DIRECTION_OPTIONS,
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
  FormationSection,
  PlayNameSection,
  PersonnelSection,
  PlayTypeSection,
  PreferencesSection,
  AdvancedOptionsSection,
} from "./AddNewPlayModal/sections";
import {
  PersonnelCreationPanel,
  DuplicatePlayWarning,
} from "./AddNewPlayModal/components";
import { MobileWizardView } from "./AddNewPlayModal/MobileWizardView";
import { useDuplicatePlayDetection } from "./AddNewPlayModal/useDuplicatePlayDetection";
import { importFormationAsTemplate } from "../../utils/formationDiagramHelpers";
import { FormationDirectionWarningModal } from "./FormationDirectionWarningModal";
import {
  detectDirectionInFormationName,
  type DirectionDetectionResult,
} from "../../utils/formationDirectionDetection";
import {
  validateFormationName,
  validatePersonnelValue,
} from "../../utils/playFieldValidation";
import type { PlayCombo } from "../../hooks/useRecentPlayCombos";

interface AddNewPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePlay?: (playData: Partial<Play>) => Promise<Play | void>; // Can now return the created play
  onPlayCreated?: (play: Play) => void; // NEW: Callback after play creation to open diagram
  existingPlay?: Play | null;
  playbookId?: string; // NEW: Required for FormationSelector
  existingPlays?: Play[]; // NEW: For duplicate detection
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDirectionWarning, setShowDirectionWarning] = useState(false);
  const [personnelPanelOpen, setPersonnelPanelOpen] = useState(false);
  const [directionDetection, setDirectionDetection] =
    useState<DirectionDetectionResult | null>(null);

  // Use extracted hooks
  const { formData, updateField, updateFields, resetForm, isValid } =
    usePlayFormState({ existingPlay });

  const {
    suggestions,
    aiSuggestions,
    showSuggestions,
    hideSuggestions,
    isSuggestionsVisible,
    updateContext,
  } = useAISuggestions(playbookId);

  // Rate limit feedback
  const rateLimitFeedback = useRateLimitFeedback("play-create", 10);

  // Duplicate play detection
  const duplicateDetection = useDuplicatePlayDetection(existingPlays, {
    play_name: formData.playName,
    formation: formData.formation,
  });

  // Mobile-optimized button sizes
  const isMobile = useIsMobile();
  const mobileButtonSize = useMobileButtonProps("md", true).size;
  const mobileSecondaryButtonSize = useMobileButtonProps("md", false).size;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid()) {
      setErrorMessage("Please enter formation and play name");
      return;
    }

    // Validate formation field doesn't contain personnel package names
    if (formData.formation.trim()) {
      const formationValidation = validateFormationName(
        formData.formation.trim()
      );
      if (!formationValidation.isValid) {
        setErrorMessage(
          formationValidation.error ||
            "Invalid formation name. Please use formation names like 'Shotgun', 'Trips Right', etc."
        );
        return;
      }
    }

    // Validate personnel field doesn't contain formation names
    if (formData.personnel.trim()) {
      const personnelValidation = validatePersonnelValue(
        formData.personnel.trim()
      );
      if (!personnelValidation.isValid) {
        setErrorMessage(
          personnelValidation.error ||
            "Invalid personnel value. Please use personnel packages like '11', '12', 'Blue', etc."
        );
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // ===================================================================
      // SIMPLIFIED: Formation stored as TEXT in plays table
      // No separate formations table needed!
      // ===================================================================

      // Parse formation tags
      const fTags = formData.formationTags
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean);

      // Parse play tags
      const pTags = formData.playTags
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean);

      const playData = {
        formation: formData.formation.trim(), // Just TEXT - simple!
        play_name: formData.playName.trim(),
        p_type: formData.playType?.trim() || undefined,
        personnel: formData.personnel.trim() || undefined,

        // Formation fields
        f_type: formData.formationType.trim() || undefined,
        f_dir: formData.formationDir || undefined,
        back_align: formData.backAlign.trim() || undefined,
        back_left_of_qb: formData.backLeftOfQb || undefined,
        back_right_of_qb: formData.backRightOfQb || undefined,
        shift: formData.shift.trim() || undefined,
        motion: formData.motion.trim() || undefined,
        ftag1: fTags[0] || undefined,
        ftag2: fTags[1] || undefined,
        r_str: formData.runStrength.trim() || undefined,
        p_str: formData.passStrength.trim() || undefined,

        // Play details fields
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

        // Other
        confidence_base: formData.confidence,
        one_word_play: formData.oneWordPlay.trim() || undefined,
        wristband_number: formData.wristbandNumber.trim() || undefined,
        notes: formData.description.trim() || undefined,

        // Play diagram (NEW - November 27, 2025)
        diagram_image_url: formData.diagram_image_url || undefined,

        // NEW: Play Metadata Arrays (October 17, 2025)
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        key_positions:
          formData.key_positions.length > 0
            ? formData.key_positions
            : undefined,
        key_players:
          formData.key_players.length > 0 ? formData.key_players : undefined,
        flags: formData.flags.length > 0 ? formData.flags : undefined,

        // DEPRECATED: Legacy tags & roles (kept for backwards compatibility)
        positions: formData.positions,
        players: formData.players,
      };

      const createdPlay = await onCreatePlay?.(playData);

      // NEW: If this was a new play creation (not edit) and we have the created play,
      // call onPlayCreated to allow parent to open diagram editor automatically
      if (!existingPlay && createdPlay && onPlayCreated) {
        onPlayCreated(createdPlay);
      }

      resetForm();
      setIsAdvancedOpen(false);
      onClose();
    } catch (error) {
      console.error("Failed to create play:", error);

      // Check if it's a validation error
      if (error && typeof error === "object" && "issues" in error) {
        const issues = (error as { issues: Array<{ message: string }> }).issues;
        setErrorMessage(issues.map((i) => i.message).join(", "));
      } else if (error instanceof Error) {
        // Check for rate limit errors
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

  // Handle formation name change with direction detection
  const handleFormationChange = (value: string) => {
    const detection = detectDirectionInFormationName(value);

    if (detection.hasDirection) {
      // Direction detected - show warning modal
      setDirectionDetection(detection);
      setShowDirectionWarning(true);
    } else {
      // No direction - just update normally
      updateField("formation", value);
      // Update AI suggestions context
      updateContext("formation", value);
    }
  };

  // User accepts suggestion from warning modal
  const handleAcceptDirectionSuggestion = (
    cleanName: string,
    direction: "R" | "L"
  ) => {
    updateFields({
      formation: cleanName,
      formationDir: direction,
    });
  };

  // User wants to keep original (with warning shown)
  const handleKeepOriginalFormation = () => {
    if (directionDetection) {
      updateField("formation", directionDetection.originalInput);
    }
  };

  // ========================================================================
  // MOBILE WIZARD VIEW
  // ========================================================================
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
          onFormationIdChange={(id, formation) => {
            // Same logic as desktop - pull in ALL formation metadata
            const updates: Partial<typeof formData> = {
              formation_id: id,
              formation: formation?.name || "",
              formation_direction: formation?.direction || null,
            };

            if (formation) {
              if (formation.personnel_name) {
                updates.personnel = formation.personnel_name;
              }
              if (formation.formation_type) {
                updates.formationType = formation.formation_type;
              }
            }

            updateFields(updates);
          }}
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

        {/* Personnel Creation Panel (shared with desktop) */}
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

  // ========================================================================
  // DESKTOP FORM VIEW
  // ========================================================================
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existingPlay ? "Edit Play" : "Create New Play"}
      size="lg"
      footer={
        <div
          className={`flex justify-end gap-sm ${isMobile ? "flex-col" : ""}`}
        >
          <Button
            type="button"
            variant="secondary"
            size={mobileSecondaryButtonSize}
            onClick={onClose}
            disabled={isSubmitting}
            className={isMobile ? "w-full" : ""}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size={mobileButtonSize}
            disabled={isSubmitting || !isValid()}
            onClick={handleSubmit}
            className={isMobile ? "w-full" : ""}
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
      <div className="space-y-lg">
        <div className="flex items-center gap-sm mb-lg">
          <div className="p-xs bg-secondary rounded-lg">
            <Icon name="plus" className="h-6 w-6 text-primary" />
          </div>
          <div>
            <Typography variant="body-lg" className="text-secondary">
              {existingPlay
                ? "Update play details"
                : "Add a new play to your playbook"}
            </Typography>
          </div>
        </div>

        {/* Error Message */}
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
            <div className="flex-1">
              <Typography
                variant="body-sm"
                className="text-warning-default font-medium"
              >
                {rateLimitFeedback.remaining} play creation
                {rateLimitFeedback.remaining === 1 ? "" : "s"} remaining this
                minute
              </Typography>
            </div>
          </div>
        )}

        {/* Rate Limit Exceeded */}
        {!existingPlay && rateLimitFeedback.isLimited && (
          <div className="bg-danger-subtle border border-danger-default rounded-lg p-md flex items-center gap-sm">
            <Icon
              name="alert-triangle"
              className="h-5 w-5 text-danger-default"
            />
            <div className="flex-1">
              <Typography
                variant="body-sm"
                className="text-danger-default font-medium"
              >
                Rate limit reached. Please wait{" "}
                {formatCountdown(rateLimitFeedback.secondsUntilReset)} before
                creating more plays.
              </Typography>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-lg">
          {/* Formation Section */}
          <FormationSection
            formation={formData.formation}
            formationId={formData.formation_id}
            formationDir={formData.formation_direction || ""} // Use formation_direction for database
            formationShowInName={formData.formationShowInName}
            playbookId={playbookId}
            existingPlays={existingPlays}
            onFormationChange={handleFormationChange}
            onFormationIdChange={(id, formation) => {
              // When formation is selected, pull in ALL formation metadata
              const updates: Partial<typeof formData> = {
                formation_id: id,
                formation: formation?.name || "",
                formation_direction: formation?.direction || null,
              };

              // Transfer formation metadata to play
              if (formation) {
                // Personnel
                if (formation.personnel_name) {
                  updates.personnel = formation.personnel_name;
                }

                // Formation type (e.g., "Shotgun", "I Formation")
                if (formation.formation_type) {
                  updates.formationType = formation.formation_type;
                }

                // Formation category tags (spread, pro, power, etc.)
                if (formation.category) {
                  // Append category to formation tags if not already present
                  const existingTags = formData.formationTags
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean);
                  if (!existingTags.includes(formation.category)) {
                    existingTags.push(formation.category);
                  }
                  updates.formationTags = existingTags.join(", ");
                }

                // Formation tags (twins, trips, bunch, etc.)
                if (formation.tags?.length > 0) {
                  const existingTags = formData.formationTags
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean);
                  // Merge formation tags with existing tags
                  formation.tags.forEach((tag) => {
                    if (!existingTags.includes(tag)) {
                      existingTags.push(tag);
                    }
                  });
                  updates.formationTags = existingTags.join(", ");
                }

                // Run/Pass strength
                if (formation.run_strength) {
                  updates.runStrength = formation.run_strength;
                }
                if (formation.pass_strength) {
                  updates.passStrength = formation.pass_strength;
                }

                console.log("📋 Formation metadata transferred to play:", {
                  formation: formation.name,
                  personnel: updates.personnel,
                  type: updates.formationType,
                  category: formation.category,
                  tags: updates.formationTags,
                  runStrength: updates.runStrength,
                  passStrength: updates.passStrength,
                });
              }

              updateFields(updates);

              // Phase 7: Formation → Diagram Template System
              // When a formation is selected, import its player positions into diagram editor
              if (formation && formation.player_positions?.length > 0) {
                const diagramTemplate = importFormationAsTemplate(formation);
                console.log("[Phase 7] Formation diagram template ready:", {
                  formationName: formation.name,
                  playerCount: diagramTemplate.players.length,
                  template: diagramTemplate,
                });
                // TODO: Formation diagram templates ready for future image upload integration
              }
            }}
            onFormationDirChange={(value) => {
              // Update formation_direction (database field), not formationDir (legacy field)
              const direction =
                value === "Left" ? "left" : value === "Right" ? "right" : null;
              updateField("formation_direction", direction);
            }}
            onFormationShowInNameChange={(value) =>
              updateField("formationShowInName", value)
            }
          />

          {/* Play Name Section */}
          <PlayNameSection
            playName={formData.playName}
            playDir={formData.playDir}
            playShowInName={formData.playShowInName}
            existingPlays={existingPlays}
            onPlayNameChange={(value) => updateField("playName", value)}
            onPlayDirChange={(value) => updateField("playDir", value)}
            onPlayShowInNameChange={(value) =>
              updateField("playShowInName", value)
            }
          />

          {/* Duplicate Play Warning */}
          {duplicateDetection.isDuplicate && !existingPlay && (
            <DuplicatePlayWarning
              matchingPlays={duplicateDetection.matchingPlays}
            />
          )}

          {/* Personnel Section */}
          <PersonnelSection
            personnel={formData.personnel}
            onPersonnelChange={(value) => updateField("personnel", value)}
            existingPlays={existingPlays}
            onAddNew={() => setPersonnelPanelOpen(true)}
            playbookId={playbookId}
          />

          {/* Play Type Section */}
          <PlayTypeSection
            playType={formData.playType}
            onPlayTypeChange={(value) => {
              updateField("playType", value);
              updateContext("playType", value);
            }}
            suggestions={suggestions.playTypes}
          />

          {/* Preferences Section */}
          <PreferencesSection
            prefDown={formData.prefDown}
            prefDistance={formData.prefDistance}
            prefHash={formData.prefHash}
            prefCoverage={formData.prefCoverage}
            prefFront={formData.prefFront}
            onPrefDownChange={(value) => updateField("prefDown", value)}
            onPrefDistanceChange={(value) => updateField("prefDistance", value)}
            onPrefHashChange={(value) => updateField("prefHash", value)}
            onPrefCoverageChange={(value) => updateField("prefCoverage", value)}
            onPrefFrontChange={(value) => updateField("prefFront", value)}
            downOptions={DOWN_OPTIONS}
            distanceOptions={DISTANCE_OPTIONS}
            hashOptions={HASH_OPTIONS}
          />

          {/* Advanced Options Section */}
          <AdvancedOptionsSection
            isOpen={isAdvancedOpen}
            onToggle={() => setIsAdvancedOpen(!isAdvancedOpen)}
            // Formation details
            formationType={formData.formationType}
            formationDir={formData.formationDir}
            backAlign={formData.backAlign}
            backLeftOfQb={formData.backLeftOfQb}
            backRightOfQb={formData.backRightOfQb}
            shift={formData.shift}
            motion={formData.motion}
            formationTags={formData.formationTags}
            runStrength={formData.runStrength}
            passStrength={formData.passStrength}
            onFormationTypeChange={(value) =>
              updateField("formationType", value)
            }
            onFormationDirChange={(value) => updateField("formationDir", value)}
            onBackAlignChange={(value) => updateField("backAlign", value)}
            onBackLeftOfQbChange={(value) => updateField("backLeftOfQb", value)}
            onBackRightOfQbChange={(value) =>
              updateField("backRightOfQb", value)
            }
            onShiftChange={(value) => updateField("shift", value)}
            onMotionChange={(value) => updateField("motion", value)}
            onFormationTagsChange={(value) =>
              updateField("formationTags", value)
            }
            onRunStrengthChange={(value) => updateField("runStrength", value)}
            onPassStrengthChange={(value) => updateField("passStrength", value)}
            // Play details
            playDir={formData.playDir}
            protection={formData.protection}
            checkInto={formData.checkInto}
            playTags={formData.playTags}
            onPlayDirChange={(value) => updateField("playDir", value)}
            onProtectionChange={(value) => updateField("protection", value)}
            onCheckIntoChange={(value) => updateField("checkInto", value)}
            onPlayTagsChange={(value) => updateField("playTags", value)}
            // Confidence
            confidence={formData.confidence}
            onConfidenceChange={(value) => updateField("confidence", value)}
            // NEW: Play Metadata Arrays (October 17, 2025)
            tags={formData.tags}
            key_positions={formData.key_positions}
            key_players={formData.key_players}
            personnel={formData.personnel}
            playbookId={playbookId}
            onTagsChange={(tags) => updateField("tags", tags)}
            onKeyPositionsChange={(positions) =>
              updateField("key_positions", positions)
            }
            onKeyPlayersChange={(players) =>
              updateField("key_players", players)
            }
            // Additional info
            oneWordPlay={formData.oneWordPlay}
            wristbandNumber={formData.wristbandNumber}
            description={formData.description}
            onOneWordPlayChange={(value) => updateField("oneWordPlay", value)}
            onWristbandNumberChange={(value) =>
              updateField("wristbandNumber", value)
            }
            // NEW: Validation data
            existingPlays={existingPlays}
            onDescriptionChange={(value) => updateField("description", value)}
            // Constants
            directionOptions={DIRECTION_OPTIONS}
          />

          {/* Play Diagram Upload */}
          <div className="space-y-sm border-t border-primary pt-lg">
            <Typography variant="label" className="text-primary font-semibold">
              Play Diagram (Optional)
            </Typography>
            <Typography variant="caption" className="text-tertiary">
              Upload a photo or screenshot of your play diagram from your phone
            </Typography>
            <ImageUpload
              value={formData.diagram_image_url || null}
              onChange={(url) => updateField("diagram_image_url", url)}
              bucket="play-diagrams"
              storagePath="diagrams"
              maxSizeMB={10}
              uploadButtonText="Upload Play Diagram"
              showPreview={true}
            />
          </div>
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
            // Update the personnel field with the newly created configuration
            updateField("personnel", newPersonnel.name);
            setPersonnelPanelOpen(false);
          }}
        />
      )}
    </Modal>
  );
};
