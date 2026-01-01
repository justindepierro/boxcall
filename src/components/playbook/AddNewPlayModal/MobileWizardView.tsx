/**
 * MobileWizardView - Mobile-optimized wizard for AddNewPlayModal
 *
 * Reorganized December 2025 with simplified 4-step flow:
 * - Step 1: Core Info (Formation, Play Name, Personnel, Type)
 * - Step 2: Diagram & Quick Details
 * - Step 3: Tags & Organization
 * - Step 4: Situational Preferences (optional)
 */

import React from "react";
import {
  WizardStep,
  WizardNavigation,
  WizardProgress,
  useWizardState,
} from "./wizard";
import {
  CoreInfoSection,
  DiagramSection,
  QuickDetailsSection,
  TagsSection,
  GameSituationSection,
} from "./sections";
import type { Play } from "../../../types/play";
import type { PlayFormData } from "./usePlayFormState";
import type { Database } from "../../../types/database";
import type { RateLimitFeedback } from "../../../hooks/useRateLimitFeedback";
import { Modal } from "../../ui/Modal/Modal";
import { Icon } from "../../ui/Icon/Icon";
import { Typography } from "../../design-system/Typography";
import {
  DISTANCE_OPTIONS,
  DOWN_OPTIONS,
  HASH_OPTIONS,
} from "../play-card/constants";
import { Button } from "../../ui/Button/Button";
import type { PlayCombo } from "../../../types/play";

type FormationRow = Database["public"]["Tables"]["formations"]["Row"];
type WizardController = ReturnType<typeof useWizardState>;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function buildSyntheticSubmitEvent(): React.FormEvent {
  return { preventDefault: () => {} } as React.FormEvent;
}

function isWizardStepValid(step: number, formData: PlayFormData): boolean {
  switch (step) {
    case 1:
      return Boolean(formData.formation?.trim() && formData.playName?.trim());
    case 2:
    case 3:
    case 4:
      return true; // Optional steps
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
    wizard.isLastStep
      ? void onSubmit(buildSyntheticSubmitEvent())
      : wizard.goNext();
  };

  const handleClose = () => {
    wizard.reset();
    onClose();
  };

  return { handleNext, handleSkip, handleClose };
}

// =============================================================================
// HEADER COMPONENTS
// =============================================================================

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

const MobileWizardRateLimitBanner: React.FC<{
  rateLimitFeedback: RateLimitFeedback;
}> = ({ rateLimitFeedback }) => (
  <div className="mx-6 mt-4 bg-warning-subtle border border-warning-default rounded-lg p-4 flex items-center gap-3">
    <Icon name="clock" size="md" className="text-warning-default" />
    <Typography variant="body-sm" className="text-warning-default">
      {rateLimitFeedback.remaining} play creation
      {rateLimitFeedback.remaining === 1 ? "" : "s"} remaining
    </Typography>
  </div>
);

// =============================================================================
// WIZARD STEP COMPONENTS
// =============================================================================

const WizardStepOne: React.FC<{
  formData: PlayFormData;
  existingPlays: Play[];
  quickCombos: PlayCombo[];
  updateField: <K extends keyof PlayFormData>(
    field: K,
    value: PlayFormData[K]
  ) => void;
  updateFields: (updates: Partial<PlayFormData>) => void;
  onFormationChange: (value: string) => void;
  setPersonnelPanelOpen: (open: boolean) => void;
}> = ({
  formData,
  existingPlays,
  quickCombos,
  updateField,
  updateFields,
  onFormationChange,
  setPersonnelPanelOpen,
}) => (
  <WizardStep
    title="Play Info"
    step={1}
    totalSteps={4}
    className="flex-1 px-6 py-4 overflow-y-auto"
  >
    {/* Quick Combos */}
    {quickCombos.length > 0 && (
      <div className="mb-4">
        <Typography
          variant="caption"
          className="mb-2 text-tertiary uppercase tracking-wide"
        >
          Recent combos
        </Typography>
        <div className="flex flex-wrap gap-2">
          {quickCombos.map((combo) => (
            <Button
              key={`${combo.formation}-${combo.personnel || "none"}`}
              variant="secondary"
              size="sm"
              className="rounded-full"
              onClick={() => {
                updateFields({
                  formation: combo.formation,
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

    {/* Core Info Section */}
    <CoreInfoSection
      formation={formData.formation}
      formationDir={formData.formation_direction || ""}
      onFormationChange={onFormationChange}
      onFormationDirChange={(dir) => updateField("formation_direction", dir)}
      playName={formData.playName}
      playDir={formData.playDir}
      onPlayNameChange={(value) => updateField("playName", value)}
      onPlayDirChange={(value) => updateField("playDir", value)}
      personnel={formData.personnel}
      onPersonnelChange={(value) => updateField("personnel", value)}
      onAddNewPersonnel={() => setPersonnelPanelOpen(true)}
      playType={formData.playType}
      onPlayTypeChange={(value) => updateField("playType", value)}
      existingPlays={existingPlays}
    />
  </WizardStep>
);

const WizardStepTwo: React.FC<{
  formData: PlayFormData;
  existingPlays: Play[];
  updateField: <K extends keyof PlayFormData>(
    field: K,
    value: PlayFormData[K]
  ) => void;
}> = ({ formData, existingPlays, updateField }) => (
  <WizardStep
    title="Details"
    step={2}
    totalSteps={4}
    optional
    className="flex-1 px-6 py-4 overflow-y-auto"
  >
    {/* Diagram Section */}
    <DiagramSection
      diagramUrl={formData.diagram_image_url}
      onDiagramChange={(url) => updateField("diagram_image_url", url)}
    />

    <div className="mt-6">
      {/* Quick Details Section */}
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
    </div>
  </WizardStep>
);

const WizardStepThree: React.FC<{
  formData: PlayFormData;
  playbookId?: string;
  updateField: <K extends keyof PlayFormData>(
    field: K,
    value: PlayFormData[K]
  ) => void;
}> = ({ formData, playbookId, updateField }) => (
  <WizardStep
    title="Organization"
    step={3}
    totalSteps={4}
    optional
    className="flex-1 px-6 py-4 overflow-y-auto"
  >
    <TagsSection
      formationTags={formData.formationTags}
      playTags={formData.playTags}
      onFormationTagsChange={(value) => updateField("formationTags", value)}
      onPlayTagsChange={(value) => updateField("playTags", value)}
      tags={formData.tags}
      onTagsChange={(tags) => updateField("tags", tags)}
      keyPositions={formData.key_positions}
      keyPlayers={formData.key_players}
      onKeyPositionsChange={(positions) =>
        updateField("key_positions", positions)
      }
      onKeyPlayersChange={(players) => updateField("key_players", players)}
      personnel={formData.personnel}
      playbookId={playbookId}
    />
  </WizardStep>
);

const WizardStepFour: React.FC<{
  formData: PlayFormData;
  updateField: <K extends keyof PlayFormData>(
    field: K,
    value: PlayFormData[K]
  ) => void;
}> = ({ formData, updateField }) => (
  <WizardStep
    title="Situations"
    step={4}
    totalSteps={4}
    optional
    className="flex-1 px-6 py-4 overflow-y-auto"
  >
    <GameSituationSection
      isOpen={true}
      onToggle={() => {}}
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

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface MobileWizardViewProps {
  isOpen: boolean;
  onClose: () => void;
  formData: PlayFormData;
  updateField: <K extends keyof PlayFormData>(
    field: K,
    value: PlayFormData[K]
  ) => void;
  updateFields: (updates: Partial<PlayFormData>) => void;
  isValid: () => boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
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
  onFormationChange: (value: string) => void;
  onFormationIdChange: (
    id: string | null,
    formation: FormationRow | null
  ) => void;
  personnelPanelOpen: boolean;
  setPersonnelPanelOpen: (open: boolean) => void;
  isAdvancedOpen: boolean;
  setIsAdvancedOpen: (open: boolean) => void;
  playbookId?: string;
  existingPlay?: Play | null;
  existingPlays?: Play[];
  errorMessage: string | null;
  rateLimitFeedback: RateLimitFeedback;
  recentCombos?: PlayCombo[];
}

export const MobileWizardView: React.FC<MobileWizardViewProps> = ({
  isOpen,
  onClose,
  formData,
  updateField,
  updateFields,
  onSubmit,
  isSubmitting,
  onFormationChange,
  setPersonnelPanelOpen,
  playbookId,
  existingPlay,
  existingPlays = [],
  errorMessage,
  rateLimitFeedback,
  recentCombos = [],
}) => {
  const wizard = useWizardState(4);
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
      size="fullscreen"
      className="h-screen rounded-none"
    >
      <MobileWizardHeader
        existingPlay={existingPlay}
        isSubmitting={isSubmitting}
        onClose={handleClose}
      />

      <WizardProgress currentStep={wizard.currentStep} totalSteps={4} />

      {errorMessage && <MobileWizardErrorBanner errorMessage={errorMessage} />}

      {!existingPlay && rateLimitFeedback?.isNearLimit && (
        <MobileWizardRateLimitBanner rateLimitFeedback={rateLimitFeedback} />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {wizard.currentStep === 1 && (
          <WizardStepOne
            formData={formData}
            existingPlays={existingPlays}
            quickCombos={quickCombos}
            updateField={updateField}
            updateFields={updateFields}
            onFormationChange={onFormationChange}
            setPersonnelPanelOpen={setPersonnelPanelOpen}
          />
        )}

        {wizard.currentStep === 2 && (
          <WizardStepTwo
            formData={formData}
            existingPlays={existingPlays}
            updateField={updateField}
          />
        )}

        {wizard.currentStep === 3 && (
          <WizardStepThree
            formData={formData}
            playbookId={playbookId}
            updateField={updateField}
          />
        )}

        {wizard.currentStep === 4 && (
          <WizardStepFour formData={formData} updateField={updateField} />
        )}

        <WizardNavigation
          currentStep={wizard.currentStep}
          totalSteps={4}
          onBack={wizard.goBack}
          onNext={handleNext}
          onSkip={wizard.currentStep >= 2 ? handleSkip : undefined}
          nextDisabled={!isWizardStepValid(wizard.currentStep, formData)}
          nextLabel={wizard.isLastStep ? "Create Play" : "Next"}
          loading={isSubmitting}
        />
      </div>
    </Modal>
  );
};
