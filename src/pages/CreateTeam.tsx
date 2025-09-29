import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../app/auth-store";
import { useRoles } from "../hooks/useRoles";
import { Typography } from "../components/design-system";
import { Button } from "../components/ui/Button/Button";
import { Icon } from "../components/ui/Icon/Icon";
import { PageLayout } from "../components/layout/PageLayout";
import { teamRoutes } from "../routes/paths";
import { TeamWelcomeModal } from "../components/onboarding/TeamWelcomeModal";
import {
  EnhancedInput,
  EnhancedSelect,
} from "../components/forms/EnhancedFormFields";

// Services
import {
  TeamCreationService,
  type TeamCreationInput,
} from "../services/teamCreationService";
import { TeamValidationService } from "../services/teamValidationService";

/**
 * Create Team Page - Clean, Service-Based Architecture
 *
 * Uses extracted services for all business logic:
 * - TeamCreationService: Database operations
 * - TeamValidationService: Form validation
 * - ProgressTrackingService: Progress persistence
 * - useWizardState: Step navigation
 */

const STEPS = [
  { id: "team-info", title: "Team Information", component: TeamInfoStep },
  { id: "school-info", title: "School Details", component: SchoolInfoStep },
  { id: "review", title: "Review", component: ReviewStep },
  { id: "complete", title: "Complete", component: CompleteStep },
] as const;

type StepId = (typeof STEPS)[number]["id"];

export const CreateTeam: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshRoles } = useRoles();

  // Wizard state management
  const {
    currentStep,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    canGoNext,
    canGoPrevious,
  } = useWizardState<StepId>({
    steps: STEPS.map((s) => s.id),
    initialStep: "team-info",
  });

  // Form and UI state
  const [formData, setFormData] = useState<TeamCreationInput>({
    teamName: "",
    schoolName: "",
    sport: "Football",
    season: "2025-2026",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Creating team...");
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdTeamId, setCreatedTeamId] = useState<string | null>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // Form data update handler
  const updateFormData = (updates: Partial<TeamCreationInput>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    // Auto-save progress
    ProgressTrackingService.saveProgress({ ...formData, ...updates });
  };

  // Validation
  const validateCurrentStep = (): boolean => {
    const validation = TeamValidationService.validateTeamForm(formData);
    return validation.success;
  };

  // Team creation handler
  const handleCreateTeam = async () => {
    if (!user?.id) {
      setCreateError("User not authenticated");
      return;
    }

    setIsLoading(true);
    setCreateError(null);

    try {
      const result = await TeamCreationService.createTeam(
        formData,
        { id: user.id, email: user.email },
        { setLoadingMessage }
      );

      if (result.success && result.teamId) {
        setCreatedTeamId(result.teamId);

        // Refresh roles to include new team membership
        await refreshRoles();

        // Clear saved progress
        ProgressTrackingService.clearProgress();

        // Go to completion step
        goToStep("complete");
      } else {
        setCreateError(result.error || "Failed to create team");
      }
    } catch (error) {
      console.error("Team creation failed:", error);
      setCreateError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoading(false);
      setLoadingMessage("Creating team...");
    }
  };

  // Step navigation handler
  const handleNext = () => {
    if (currentStep === "review") {
      handleCreateTeam();
    } else if (canGoNext && validateCurrentStep()) {
      goToNextStep();
    }
  };

  // Welcome modal handlers
  const handleShowWelcome = () => {
    setShowWelcomeModal(true);
  };

  const handleGoToBulletin = () => {
    setShowWelcomeModal(false);
    if (createdTeamId) {
      navigate(teamRoutes.bulletin(createdTeamId));
    }
  };

  // Render current step component
  const currentStepConfig = STEPS.find((step) => step.id === currentStep);
  const StepComponent = currentStepConfig?.component;

  return (
    <PageLayout
      title="Create Team"
      subtitle="Set up your team in just a few steps"
    >
      <div className="max-w-2xl mx-auto">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${
                  index < STEPS.length - 1 ? "flex-1" : ""
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.id === currentStep
                      ? "bg-primary text-white"
                      : STEPS.findIndex((s) => s.id === currentStep) > index
                        ? "bg-success text-white"
                        : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {index + 1}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      STEPS.findIndex((s) => s.id === currentStep) > index
                        ? "bg-success"
                        : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 text-center">
            {currentStepConfig?.title}
          </p>
        </div>

        {/* Step content */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {StepComponent && (
            <StepComponent
              formData={formData}
              updateFormData={updateFormData}
              onShowWelcome={handleShowWelcome}
              isLoading={isLoading}
              loadingMessage={loadingMessage}
              createError={createError}
              createdTeamId={createdTeamId}
            />
          )}
        </div>

        {/* Navigation */}
        {currentStep !== "complete" && (
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={goToPreviousStep}
              disabled={!canGoPrevious}
              className="px-4 py-2 text-gray-600 disabled:text-gray-400"
            >
              ← Previous
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={isLoading || !validateCurrentStep()}
              className="px-6 py-2 bg-primary text-white rounded-md disabled:bg-gray-300"
            >
              {isLoading
                ? loadingMessage
                : currentStep === "review"
                  ? "Create Team"
                  : "Next →"}
            </button>
          </div>
        )}
      </div>

      {/* Welcome Modal */}
      <TeamWelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        teamName={`${formData.schoolName} ${formData.teamName}`}
        onGoToBulletin={handleGoToBulletin}
      />
    </PageLayout>
  );
};
