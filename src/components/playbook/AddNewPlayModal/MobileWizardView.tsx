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
import { Button } from "../../ui/Button/Button";
import type { PlayCombo } from "../../../hooks/useRecentPlayCombos";

type WizardController = ReturnType<typeof useWizardState>;

function buildSyntheticSubmitEvent(): React.FormEvent {
  return { preventDefault: () => {} } as React.FormEvent;
}

function isWizardStepValid(params: {
  step: number;
  formData: PlayFormData;
}): boolean {
  const { step, formData } = params;

  switch (step) {
    case 1:
      return Boolean(formData.formation?.trim() && formData.playName?.trim());
    case 2:
      return true;
    case 3:
      return true;
    case 4:
      return true;
    default:
      return false;
  }
}

function useMobileWizardActions(params: {
  wizard: WizardController;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}) {
  const { wizard, onClose, onSubmit } = params;

  const handleNext = () => {
    if (wizard.isLastStep) {
      void onSubmit(buildSyntheticSubmitEvent());
    } else {
      wizard.goNext();
    }
  };

  const handleSkip = () => {
    if (wizard.isLastStep) {
      void onSubmit(buildSyntheticSubmitEvent());
    } else {
      wizard.goNext();
    }
  };

  const handleClose = () => {
    wizard.reset();
    onClose();
  };

  return { handleNext, handleSkip, handleClose };
}

const MobileWizardHeader: React.FC<{
  existingPlay: Play | null | undefined;
  isSubmitting: boolean;
  onClose: () => void;
}> = ({ existingPlay, isSubmitting, onClose }) => (
  <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-primary">
    <div className="flex items-center justify-between">
      <button
        type="button"
        onClick={onClose}
        className="text-muted hover:text-primary transition-colors"
        disabled={isSubmitting}
      >
        <Icon name="close" size="lg" />
      </button>

      <Typography variant="headline-md" className="font-semibold">
        {existingPlay ? "Edit Play" : "New Play"}
      </Typography>

      <div className="w-6" />
    </div>
  </div>
);

const MobileWizardErrorBanner: React.FC<{ errorMessage: string }> = ({
  errorMessage,
}) => (
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
);

const MobileWizardRateLimitBanner: React.FC<{ rateLimitFeedback: any }> = ({
  rateLimitFeedback,
}) => (
  <div className="mx-6 mt-4 bg-warning-subtle border border-warning-default rounded-lg p-4 flex items-center gap-3">
    <Icon name="clock" size="md" className="text-warning-default" />
    <Typography variant="body-sm" className="text-warning-default">
      {rateLimitFeedback.remaining} play creation
      {rateLimitFeedback.remaining === 1 ? "" : "s"} remaining this minute
    </Typography>
  </div>
);

const WizardStepOne: React.FC<{
  wizard: WizardController;
  formData: PlayFormData;
  playbookId?: string;
  existingPlays: Play[];
  quickCombos: PlayCombo[];
  updateField: <K extends keyof PlayFormData>(
    field: K,
    value: PlayFormData[K]
  ) => void;
  updateFields: (updates: Partial<PlayFormData>) => void;
  onFormationChange: (value: string) => void;
  onFormationIdChange: (id: string | null, formation: any) => void;
}> = ({
  wizard,
  formData,
  playbookId,
  existingPlays,
  quickCombos,
  updateField,
  updateFields,
  onFormationChange,
  onFormationIdChange,
}) => (
  <WizardStep title="Basic Info" step={1} totalSteps={4} className="flex-1">
    {quickCombos.length > 0 && (
      <div className="mb-4">
        <Typography
          variant="label-md"
          className="mb-2 text-secondary uppercase tracking-wide"
        >
          Recent combos
        </Typography>
        <div className="flex flex-wrap gap-2">
          {quickCombos.map((combo) => (
            <Button
              key={`${combo.formation}-${combo.personnel || "none"}-${combo.playType || "any"}`}
              variant="secondary"
              size="sm"
              className="rounded-full bg-secondary text-secondary hover:bg-muted"
              onClick={() => {
                updateFields({
                  formation: combo.formation,
                  formation_id: null,
                  personnel: combo.personnel || "",
                  playType: combo.playType || formData.playType,
                });
              }}
            >
              <Icon name="zap" className="mr-2 h-4 w-4 text-primary" />
              <span className="truncate max-w-36">
                {combo.formation}
                {combo.personnel ? ` • ${combo.personnel}` : ""}
              </span>
            </Button>
          ))}
        </div>
      </div>
    )}

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
      existingPlays={existingPlays}
      onNextField={() => wizard.goNext()}
    />

    <PlayNameSection
      playName={formData.playName}
      playDir={formData.playDir}
      playShowInName={formData.playShowInName}
      onPlayNameChange={(value) => updateField("playName", value)}
      onPlayDirChange={(value) => updateField("playDir", value)}
      onPlayShowInNameChange={(value) => updateField("playShowInName", value)}
      existingPlays={existingPlays}
      onNextField={() => wizard.goNext()}
    />
  </WizardStep>
);

const WizardStepTwo: React.FC<{
  wizard: WizardController;
  formData: PlayFormData;
  playbookId?: string;
  existingPlays: Play[];
  suggestions: MobileWizardViewProps["suggestions"];
  updateField: <K extends keyof PlayFormData>(
    field: K,
    value: PlayFormData[K]
  ) => void;
  isSuggestionsVisible: MobileWizardViewProps["isSuggestionsVisible"];
  showSuggestions: MobileWizardViewProps["showSuggestions"];
  hideSuggestions: MobileWizardViewProps["hideSuggestions"];
  setPersonnelPanelOpen: (open: boolean) => void;
}> = ({
  wizard,
  formData,
  playbookId,
  existingPlays,
  suggestions,
  updateField,
  isSuggestionsVisible,
  showSuggestions,
  hideSuggestions,
  setPersonnelPanelOpen,
}) => (
  <WizardStep
    title="Personnel & Type"
    step={2}
    totalSteps={4}
    optional
    className="flex-1"
  >
    <PersonnelSection
      personnel={formData.personnel}
      onPersonnelChange={(value) => updateField("personnel", value)}
      suggestions={suggestions.personnel}
      showSuggestions={isSuggestionsVisible("personnel")}
      onShowSuggestionsChange={(show) =>
        show ? showSuggestions("personnel") : hideSuggestions("personnel")
      }
      onAddNew={() => setPersonnelPanelOpen(true)}
      playbookId={playbookId}
      existingPlays={existingPlays}
      onNextField={() => wizard.goNext()}
    />

    <PlayTypeSection
      playType={formData.playType}
      onPlayTypeChange={(value) => updateField("playType", value)}
    />
  </WizardStep>
);

const WizardStepThree: React.FC<{
  formData: PlayFormData;
  updateField: <K extends keyof PlayFormData>(
    field: K,
    value: PlayFormData[K]
  ) => void;
}> = ({ formData, updateField }) => (
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
      prefFieldPos={formData.prefFieldPos}
      prefSituation={formData.prefSituation}
      onPrefDownChange={(value) => updateField("prefDown", value)}
      onPrefDistanceChange={(value) => updateField("prefDistance", value)}
      onPrefHashChange={(value) => updateField("prefHash", value)}
      onPrefCoverageChange={(value) => updateField("prefCoverage", value)}
      onPrefFrontChange={(value) => updateField("prefFront", value)}
      onPrefFieldPosChange={(value) => updateField("prefFieldPos", value)}
      onPrefSituationChange={(value) => updateField("prefSituation", value)}
      downOptions={DOWN_OPTIONS}
      distanceOptions={DISTANCE_OPTIONS}
      hashOptions={HASH_OPTIONS}
    />
  </WizardStep>
);

const WizardStepFour: React.FC<{
  formData: PlayFormData;
  playbookId?: string;
  updateField: <K extends keyof PlayFormData>(
    field: K,
    value: PlayFormData[K]
  ) => void;
}> = ({ formData, playbookId, updateField }) => (
  <WizardStep
    title="Advanced Details"
    step={4}
    totalSteps={4}
    optional
    className="flex-1"
  >
    <AdvancedOptionsSection
      isOpen={true}
      onToggle={() => {}}
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
      onFormationTypeChange={(value) => updateField("formationType", value)}
      onFormationDirChange={(value) => updateField("formationDir", value)}
      onBackAlignChange={(value) => updateField("backAlign", value)}
      onBackLeftOfQbChange={(value) => updateField("backLeftOfQb", value)}
      onBackRightOfQbChange={(value) => updateField("backRightOfQb", value)}
      onShiftChange={(value) => updateField("shift", value)}
      onMotionChange={(value) => updateField("motion", value)}
      onFormationTagsChange={(value) => updateField("formationTags", value)}
      onRunStrengthChange={(value) => updateField("runStrength", value)}
      onPassStrengthChange={(value) => updateField("passStrength", value)}
      playDir={formData.playDir}
      protection={formData.protection}
      checkInto={formData.checkInto}
      playTags={formData.playTags}
      onPlayDirChange={(value) => updateField("playDir", value)}
      onProtectionChange={(value) => updateField("protection", value)}
      onCheckIntoChange={(value) => updateField("checkInto", value)}
      onPlayTagsChange={(value) => updateField("playTags", value)}
      confidence={formData.confidence}
      onConfidenceChange={(value) => updateField("confidence", value)}
      tags={formData.tags}
      key_positions={formData.key_positions}
      key_players={formData.key_players}
      personnel={formData.personnel}
      playbookId={playbookId}
      onTagsChange={(tags) => updateField("tags", tags)}
      onKeyPositionsChange={(positions) =>
        updateField("key_positions", positions)
      }
      onKeyPlayersChange={(players) => updateField("key_players", players)}
      oneWordPlay={formData.oneWordPlay}
      wristbandNumber={formData.wristbandNumber}
      description={formData.description}
      onOneWordPlayChange={(value) => updateField("oneWordPlay", value)}
      onWristbandNumberChange={(value) => updateField("wristbandNumber", value)}
      onDescriptionChange={(value) => updateField("description", value)}
      directionOptions={DIRECTION_OPTIONS}
    />
  </WizardStep>
);

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
  aiSuggestions?: {
    aiFormations: string[];
    aiPlayNames: string[];
    generatedPlayNames: string[];
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
  existingPlays?: Play[]; // NEW: For validation

  // Error handling
  errorMessage: string | null;

  // Rate limiting
  rateLimitFeedback: any;
  recentCombos?: PlayCombo[];
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
  updateFields,
  isValid: _isValid, // Reserved for potential future use
  onSubmit,
  isSubmitting,
  suggestions,
  aiSuggestions: _aiSuggestions,
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
  existingPlays = [],
  errorMessage,
  rateLimitFeedback,
  recentCombos = [],
}) => {
  const wizard = useWizardState(4); // 4 steps total
  const quickCombos = recentCombos.slice(0, 6);

  const { handleNext, handleSkip, handleClose } = useMobileWizardActions({
    wizard,
    onClose,
    onSubmit,
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="fullscreen" // Full-screen on mobile
      className="h-screen rounded-none" // No rounded corners on mobile
    >
      <MobileWizardHeader
        existingPlay={existingPlay}
        isSubmitting={isSubmitting}
        onClose={handleClose}
      />

      {/* Wizard Progress */}
      <WizardProgress currentStep={wizard.currentStep} totalSteps={4} />

      {/* Error Messages */}
      {errorMessage && <MobileWizardErrorBanner errorMessage={errorMessage} />}

      {/* Rate Limit Warning */}
      {!existingPlay && rateLimitFeedback?.isNearLimit && (
        <MobileWizardRateLimitBanner rateLimitFeedback={rateLimitFeedback} />
      )}

      {/* Wizard Steps */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Step 1: Basic Info */}
        {wizard.currentStep === 1 && (
          <WizardStepOne
            wizard={wizard}
            formData={formData}
            playbookId={playbookId}
            existingPlays={existingPlays}
            quickCombos={quickCombos}
            updateField={updateField}
            updateFields={updateFields}
            onFormationChange={onFormationChange}
            onFormationIdChange={onFormationIdChange}
          />
        )}

        {/* Step 2: Personnel & Type */}
        {wizard.currentStep === 2 && (
          <WizardStepTwo
            wizard={wizard}
            formData={formData}
            playbookId={playbookId}
            existingPlays={existingPlays}
            suggestions={suggestions}
            updateField={updateField}
            isSuggestionsVisible={isSuggestionsVisible}
            showSuggestions={showSuggestions}
            hideSuggestions={hideSuggestions}
            setPersonnelPanelOpen={setPersonnelPanelOpen}
          />
        )}

        {/* Step 3: Game Situation (Optional) */}
        {wizard.currentStep === 3 && (
          <WizardStepThree formData={formData} updateField={updateField} />
        )}

        {/* Step 4: Advanced Details (Optional) */}
        {wizard.currentStep === 4 && (
          <WizardStepFour
            formData={formData}
            playbookId={playbookId}
            updateField={updateField}
          />
        )}

        {/* Wizard Navigation */}
        <WizardNavigation
          currentStep={wizard.currentStep}
          totalSteps={4}
          onBack={wizard.goBack}
          onNext={handleNext}
          onSkip={wizard.currentStep >= 2 ? handleSkip : undefined}
          nextDisabled={
            !isWizardStepValid({ step: wizard.currentStep, formData })
          }
          nextLabel={wizard.isLastStep ? "Create Play" : "Next"}
          loading={isSubmitting}
        />
      </div>
    </Modal>
  );
};
