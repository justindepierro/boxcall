import React from "react";
import {
  WizardStep,
  WizardNavigation,
  WizardProgress,
  useWizardState,
} from "./wizard";
import {
  FormationSection,
  PlayNameSection,
  PersonnelSection,
  PlayTypeSection,
  PreferencesSection,
  AdvancedOptionsSection,
} from "./sections";
import type { Play } from "../../../types/play";
import type { PlayFormData } from "./usePlayFormState";
import { Modal } from "../../ui/Modal/Modal";
import { Icon } from "../../ui/Icon/Icon";
import { Typography } from "../../design-system/Typography";
import {
  DIRECTION_OPTIONS,
  DOWN_OPTIONS,
  DISTANCE_OPTIONS,
  HASH_OPTIONS,
} from "../play-card/constants";

interface MobileWizardViewProps {
  // Modal control
  isOpen: boolean;
  onClose: () => void;

  // Form data (properly typed)
  formData: PlayFormData;
  updateField: <K extends keyof PlayFormData>(
    field: K,
    value: PlayFormData[K]
  ) => void;
  updateFields: (updates: Partial<PlayFormData>) => void;

  // Validation
  isValid: () => boolean;

  // Submit
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;

  // Suggestions (properly typed)
  suggestions: {
    formations: string[];
    playNames: string[];
    personnel: string[];
  };
  isSuggestionsVisible: (
    type: "formation" | "playName" | "personnel"
  ) => boolean;
  showSuggestions: (type: "formation" | "playName" | "personnel") => void;
  hideSuggestions: (type: "formation" | "playName" | "personnel") => void;

  // Formation handling
  onFormationChange: (value: string) => void;
  onFormationIdChange: (id: string | null, formation: any) => void;

  // Personnel
  personnelPanelOpen: boolean;
  setPersonnelPanelOpen: (open: boolean) => void;

  // Advanced
  isAdvancedOpen: boolean;
  setIsAdvancedOpen: (open: boolean) => void;

  // IDs
  playbookId?: string;
  existingPlay?: Play | null;

  // Error handling
  errorMessage: string | null;

  // Rate limiting
  rateLimitFeedback: any;
}

/**
 * MobileWizardView - Mobile-optimized wizard for AddNewPlayModal
 *
 * 4-step wizard flow:
 * - Step 1: Basic Info (Formation, Play Name)
 * - Step 2: Personnel & Type
 * - Step 3: Game Situation (optional)
 * - Step 4: Advanced Details (optional)
 */
export const MobileWizardView: React.FC<MobileWizardViewProps> = ({
  isOpen,
  onClose,
  formData,
  updateField,
  updateFields: _updateFields, // Reserved for future use
  isValid: _isValid, // Reserved for potential future use
  onSubmit,
  isSubmitting,
  suggestions,
  isSuggestionsVisible,
  showSuggestions,
  hideSuggestions,
  onFormationChange,
  onFormationIdChange,
  personnelPanelOpen: _personnelPanelOpen, // Handled in parent, kept for consistency
  setPersonnelPanelOpen,
  isAdvancedOpen: _isAdvancedOpen, // Not used in wizard (always expanded)
  setIsAdvancedOpen: _setIsAdvancedOpen, // Not used in wizard
  playbookId,
  existingPlay,
  errorMessage,
  rateLimitFeedback,
}) => {
  const wizard = useWizardState(4); // 4 steps total

  // Validation per step
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1: // Basic Info - Formation and Play Name required
        return !!(formData.formation?.trim() && formData.playName?.trim());

      case 2: // Personnel & Type - Both required
        return !!(formData.personnel?.trim() && formData.playType);

      case 3: // Game Situation - Optional, always valid
        return true;

      case 4: // Advanced - Optional, always valid
        return true;

      default:
        return false;
    }
  };

  // Handle Next button
  const handleNext = () => {
    if (wizard.isLastStep) {
      // Submit form
      onSubmit({ preventDefault: () => {} } as React.FormEvent);
    } else {
      // Go to next step
      wizard.goNext();
    }
  };

  // Handle Skip button (for optional steps)
  const handleSkip = () => {
    if (wizard.isLastStep) {
      // Skip to submit
      onSubmit({ preventDefault: () => {} } as React.FormEvent);
    } else {
      wizard.goNext();
    }
  };

  // Handle modal close - reset wizard
  const handleClose = () => {
    wizard.reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="fullscreen" // Full-screen on mobile
      className="h-screen rounded-none" // No rounded corners on mobile
    >
      {/* Modal Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-surface-primary">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleClose}
            className="text-muted hover:text-primary transition-colors"
            disabled={isSubmitting}
          >
            <Icon name="close" size="lg" />
          </button>

          <Typography variant="headline-md" className="font-semibold">
            {existingPlay ? "Edit Play" : "New Play"}
          </Typography>

          {/* Empty div for flex spacing */}
          <div className="w-6" />
        </div>
      </div>

      {/* Wizard Progress */}
      <WizardProgress currentStep={wizard.currentStep} totalSteps={4} />

      {/* Error Messages */}
      {errorMessage && (
        <div className="mx-6 mt-4 bg-danger-subtle border border-danger-default rounded-lg p-4 flex items-start gap-3">
          <Icon
            name="alert-triangle"
            size="md"
            className="text-danger-default flex-shrink-0 mt-0.5"
          />
          <Typography variant="body-sm" className="text-danger-default flex-1">
            {errorMessage}
          </Typography>
        </div>
      )}

      {/* Rate Limit Warning */}
      {!existingPlay && rateLimitFeedback?.isNearLimit && (
        <div className="mx-6 mt-4 bg-warning-subtle border border-warning-default rounded-lg p-4 flex items-center gap-3">
          <Icon name="clock" size="md" className="text-warning-default" />
          <Typography variant="body-sm" className="text-warning-default">
            {rateLimitFeedback.remaining} play creation
            {rateLimitFeedback.remaining === 1 ? "" : "s"} remaining this minute
          </Typography>
        </div>
      )}

      {/* Wizard Steps */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Step 1: Basic Info */}
        {wizard.currentStep === 1 && (
          <WizardStep
            title="Basic Info"
            step={1}
            totalSteps={4}
            className="flex-1"
          >
            <FormationSection
              formation={formData.formation}
              formationId={formData.formation_id}
              formationDir={formData.formation_direction || ""}
              formationShowInName={formData.formationShowInName}
              playbookId={playbookId}
              onFormationChange={onFormationChange}
              onFormationIdChange={onFormationIdChange}
              onFormationDirChange={(value) =>
                updateField(
                  "formation_direction",
                  value as "base" | "left" | "right" | null
                )
              }
              onFormationShowInNameChange={(value) =>
                updateField("formationShowInName", value)
              }
              suggestions={suggestions.formations}
              showSuggestions={isSuggestionsVisible("formation")}
              onShowSuggestionsChange={(show) =>
                show
                  ? showSuggestions("formation")
                  : hideSuggestions("formation")
              }
            />

            <PlayNameSection
              playName={formData.playName}
              playDir={formData.playDir}
              playShowInName={formData.playShowInName}
              onPlayNameChange={(value) => updateField("playName", value)}
              onPlayDirChange={(value) => updateField("playDir", value)}
              onPlayShowInNameChange={(value) =>
                updateField("playShowInName", value)
              }
              suggestions={suggestions.playNames}
              showSuggestions={isSuggestionsVisible("playName")}
              onShowSuggestionsChange={(show) =>
                show ? showSuggestions("playName") : hideSuggestions("playName")
              }
            />
          </WizardStep>
        )}

        {/* Step 2: Personnel & Type */}
        {wizard.currentStep === 2 && (
          <WizardStep
            title="Personnel & Type"
            step={2}
            totalSteps={4}
            className="flex-1"
          >
            <PersonnelSection
              personnel={formData.personnel}
              onPersonnelChange={(value) => updateField("personnel", value)}
              suggestions={suggestions.personnel}
              showSuggestions={isSuggestionsVisible("personnel")}
              onShowSuggestionsChange={(show) =>
                show
                  ? showSuggestions("personnel")
                  : hideSuggestions("personnel")
              }
              onAddNew={() => setPersonnelPanelOpen(true)}
            />

            <PlayTypeSection
              playType={formData.playType}
              onPlayTypeChange={(value) => updateField("playType", value)}
            />
          </WizardStep>
        )}

        {/* Step 3: Game Situation (Optional) */}
        {wizard.currentStep === 3 && (
          <WizardStep
            title="Game Situation"
            step={3}
            totalSteps={4}
            optional
            className="flex-1"
          >
            <PreferencesSection
              prefDown={formData.prefDown}
              prefDistance={formData.prefDistance}
              prefHash={formData.prefHash}
              prefCoverage={formData.prefCoverage}
              prefFront={formData.prefFront}
              onPrefDownChange={(value) => updateField("prefDown", value)}
              onPrefDistanceChange={(value) =>
                updateField("prefDistance", value)
              }
              onPrefHashChange={(value) => updateField("prefHash", value)}
              onPrefCoverageChange={(value) =>
                updateField("prefCoverage", value)
              }
              onPrefFrontChange={(value) => updateField("prefFront", value)}
              downOptions={DOWN_OPTIONS}
              distanceOptions={DISTANCE_OPTIONS}
              hashOptions={HASH_OPTIONS}
            />
          </WizardStep>
        )}

        {/* Step 4: Advanced Details (Optional) */}
        {wizard.currentStep === 4 && (
          <WizardStep
            title="Advanced Details"
            step={4}
            totalSteps={4}
            optional
            className="flex-1"
          >
            <AdvancedOptionsSection
              isOpen={true} // Always open in wizard
              onToggle={() => {}} // No toggle in wizard
              // Formation details
              formationType={formData.formationType}
              formationDir={formData.formationDir}
              backAlign={formData.backAlign}
              shift={formData.shift}
              motion={formData.motion}
              formationTags={formData.formationTags}
              runStrength={formData.runStrength}
              passStrength={formData.passStrength}
              onFormationTypeChange={(value) =>
                updateField("formationType", value)
              }
              onFormationDirChange={(value) =>
                updateField("formationDir", value)
              }
              onBackAlignChange={(value) => updateField("backAlign", value)}
              onShiftChange={(value) => updateField("shift", value)}
              onMotionChange={(value) => updateField("motion", value)}
              onFormationTagsChange={(value) =>
                updateField("formationTags", value)
              }
              onRunStrengthChange={(value) => updateField("runStrength", value)}
              onPassStrengthChange={(value) =>
                updateField("passStrength", value)
              }
              // Play details
              playDir={formData.playDir}
              protection={formData.protection}
              playTags={formData.playTags}
              onPlayDirChange={(value) => updateField("playDir", value)}
              onProtectionChange={(value) => updateField("protection", value)}
              onPlayTagsChange={(value) => updateField("playTags", value)}
              // Confidence
              confidence={formData.confidence}
              onConfidenceChange={(value) => updateField("confidence", value)}
              // Play Metadata Arrays
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
              onDescriptionChange={(value) => updateField("description", value)}
              // Constants
              directionOptions={DIRECTION_OPTIONS}
            />
          </WizardStep>
        )}

        {/* Wizard Navigation */}
        <WizardNavigation
          currentStep={wizard.currentStep}
          totalSteps={4}
          onBack={wizard.goBack}
          onNext={handleNext}
          onSkip={wizard.currentStep >= 3 ? handleSkip : undefined} // Only on steps 3 & 4
          nextDisabled={!isStepValid(wizard.currentStep)}
          nextLabel={wizard.isLastStep ? "Create Play" : "Next"}
          loading={isSubmitting}
        />
      </div>
    </Modal>
  );
};
