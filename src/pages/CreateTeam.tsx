import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { teamRoutes } from "../routes/paths";
import { useAuth } from "../app/auth-store";
import { useRoles } from "../hooks/useRoles";
import { Button } from "../components/ui/Button/Button";
import { Typography } from "../components/design-system/Typography";
import { Icon } from "../components/ui/Icon/Icon";
import { TeamWelcomeModal } from "../components/onboarding/TeamWelcomeModal";
import {
  TeamService as TeamCreationService,
  TeamService as TeamValidationService,
  TeamService as TeamDuplicatePreventionService,
} from "../services/teamService";
import { ProgressTrackingService } from "../services/progressTrackingService";
import { LocationFinderService } from "../services/locationFinderService";

import type {
  TeamCreationInput,
  DuplicateCheckResult,
} from "../services/teamService";
import type { AddressSuggestion } from "../services/locationFinderService";
import { logError, warn } from "../utils/logger";

// Extracted step components
import {
  TeamInfoStep,
  SchoolInfoStep,
  ReviewStep,
  CompleteStep,
  StepProgress,
} from "./CreateTeam/components";

/**
 * Create Team Page - Simplified Working Version
 *
 * A clean, working team creation form using extracted services:
 * - TeamCreationService: Database operations
 * - TeamValidationService: Form validation
 * - ProgressTrackingService: Progress persistence
 */

type StepId = "team-info" | "school-info" | "review" | "complete";

const CREATE_TEAM_STEPS: Array<{ id: StepId; title: string }> = [
  { id: "team-info", title: "Team Information" },
  { id: "school-info", title: "School Details" },
  { id: "review", title: "Review" },
  { id: "complete", title: "Complete" },
];

const saveProgressSafe = (step: StepId, data: TeamCreationInput) => {
  try {
    ProgressTrackingService.saveProgress(step, data, []);
  } catch (error) {
    warn("Could not save progress:", error);
  }
};

const validateStep = (step: StepId, data: TeamCreationInput): boolean => {
  if (step === "team-info") {
    return data.teamName.length > 0 && data.schoolName.length > 0;
  }

  if (step === "school-info") {
    return true;
  }

  if (step === "review") {
    const validation = TeamValidationService.validateTeamForm(data);
    return validation.success;
  }

  return true;
};

const runDuplicateCheck = async (params: {
  formData: TeamCreationInput;
  setDuplicateCheck: (result: DuplicateCheckResult | null) => void;
  setShowDuplicateWarning: (value: boolean) => void;
  setDuplicateCheckLoading: (value: boolean) => void;
  setCreateError: (value: string | null) => void;
}): Promise<boolean> => {
  const {
    formData,
    setDuplicateCheck,
    setShowDuplicateWarning,
    setDuplicateCheckLoading,
    setCreateError,
  } = params;

  setDuplicateCheckLoading(true);
  setCreateError(null);

  try {
    const result = await TeamDuplicatePreventionService.checkForDuplicates(
      formData.teamName,
      formData.schoolName,
      formData.schoolDistrict,
      formData.schoolCity,
      formData.schoolState
    );

    setDuplicateCheck(result);

    if (result.isDuplicate) {
      setShowDuplicateWarning(true);
      setCreateError(result.warningMessage || "Similar team found");
      return false;
    }

    if (result.requiresApproval) {
      setShowDuplicateWarning(true);
      setCreateError(
        result.warningMessage || "Please verify this is not a duplicate"
      );
      return false;
    }

    return true;
  } catch (error) {
    logError("Duplicate check failed:", error);
    return true;
  } finally {
    setDuplicateCheckLoading(false);
  }
};

const runUseCurrentLocation = async (params: {
  setLocationLoading: (value: boolean) => void;
  updateFormData: (updates: Partial<TeamCreationInput>) => void;
  setCreateError: (value: string | null) => void;
}) => {
  const { setLocationLoading, updateFormData, setCreateError } = params;

  setLocationLoading(true);
  try {
    const result = await LocationFinderService.getCurrentLocation();

    if (result.success && result.address) {
      updateFormData({
        schoolAddress: result.address.streetAddress,
        schoolCity: result.address.city,
        schoolState: result.address.state,
        schoolZip: result.address.zipCode,
      });

      const district = await LocationFinderService.getSchoolDistrict(
        result.address
      );
      if (district) {
        updateFormData({ schoolDistrict: district });
      }
    } else {
      setCreateError(result.error || "Could not get location");
    }
  } catch {
    setCreateError("Location access failed");
  } finally {
    setLocationLoading(false);
  }
};

const runAddressSearch = async (params: {
  query: string;
  setAddressSuggestions: (value: AddressSuggestion[]) => void;
}) => {
  const { query, setAddressSuggestions } = params;

  if (!query || query.length < 3) {
    setAddressSuggestions([]);
    return;
  }

  try {
    const result = await LocationFinderService.searchAddresses(query);
    if (result.success) {
      setAddressSuggestions(result.suggestions);
    }
  } catch (error) {
    warn("Address search failed:", error);
  }
};

const runSelectAddress = async (params: {
  address: AddressSuggestion;
  updateFormData: (updates: Partial<TeamCreationInput>) => void;
  setAddressSuggestions: (value: AddressSuggestion[]) => void;
}) => {
  const { address, updateFormData, setAddressSuggestions } = params;

  updateFormData({
    schoolAddress: address.streetAddress,
    schoolCity: address.city,
    schoolState: address.state,
    schoolZip: address.zipCode,
  });

  const district = await LocationFinderService.getSchoolDistrict(address);
  if (district) {
    updateFormData({ schoolDistrict: district });
  }

  setAddressSuggestions([]);
};

const runCreateTeam = async (params: {
  userId: string;
  userEmail: string | undefined;
  formData: TeamCreationInput;
  refreshRoles: () => Promise<void>;
  setCreatedTeamId: (value: string | null) => void;
  setCurrentStep: (value: StepId) => void;
  setIsLoading: (value: boolean) => void;
  setLoadingMessage: (value: string) => void;
  setCreateError: (value: string | null) => void;
}) => {
  const {
    userId,
    userEmail,
    formData,
    refreshRoles,
    setCreatedTeamId,
    setCurrentStep,
    setIsLoading,
    setLoadingMessage,
    setCreateError,
  } = params;

  setIsLoading(true);
  setCreateError(null);

  try {
    const result = await TeamCreationService.createTeam(
      formData,
      { id: userId, email: userEmail },
      { setLoadingMessage }
    );

    if (result.success && result.teamId) {
      setCreatedTeamId(result.teamId);
      await refreshRoles();

      try {
        ProgressTrackingService.clearProgress();
      } catch (error) {
        warn("Could not clear progress:", error);
      }

      setCurrentStep("complete");
      return;
    }

    setCreateError(result.error || "Failed to create team");
  } catch (error) {
    logError("Team creation failed:", error);
    setCreateError(error instanceof Error ? error.message : "Unknown error");
  } finally {
    setIsLoading(false);
    setLoadingMessage("Creating team...");
  }
};

interface CreateTeamStepContentProps {
  currentStep: StepId;
  formData: TeamCreationInput;
  updateFormData: (updates: Partial<TeamCreationInput>) => void;
  onUseCurrentLocation: () => Promise<void>;
  onAddressSearch: (query: string) => Promise<void>;
  onSelectAddress: (address: AddressSuggestion) => Promise<void>;
  locationLoading: boolean;
  addressSuggestions: AddressSuggestion[];
  duplicateCheckLoading: boolean;
  showDuplicateWarning: boolean;
  duplicateCheck: DuplicateCheckResult | null;
  createError: string | null;
  dismissDuplicateWarning: () => void;
  onContactSupport: () => void;
  onShowWelcome: () => void;
}

const CreateTeamStepContent: React.FC<CreateTeamStepContentProps> = ({
  currentStep,
  formData,
  updateFormData,
  onUseCurrentLocation,
  onAddressSearch,
  onSelectAddress,
  locationLoading,
  addressSuggestions,
  duplicateCheckLoading,
  showDuplicateWarning,
  duplicateCheck,
  createError,
  dismissDuplicateWarning,
  onContactSupport,
  onShowWelcome,
}) => {
  switch (currentStep) {
    case "team-info":
      return (
        <TeamInfoStep formData={formData} onUpdateFormData={updateFormData} />
      );

    case "school-info":
      return (
        <SchoolInfoStep
          formData={formData}
          onUpdateFormData={updateFormData}
          onUseCurrentLocation={onUseCurrentLocation}
          onAddressSearch={onAddressSearch}
          onSelectAddress={onSelectAddress}
          locationLoading={locationLoading}
          addressSuggestions={addressSuggestions}
        />
      );

    case "review":
      return (
        <ReviewStep
          formData={formData}
          duplicateCheckLoading={duplicateCheckLoading}
          showDuplicateWarning={showDuplicateWarning}
          duplicateCheck={duplicateCheck}
          createError={createError}
          onDismissDuplicateWarning={dismissDuplicateWarning}
          onContactSupport={onContactSupport}
        />
      );

    case "complete":
      return (
        <CompleteStep
          schoolName={formData.schoolName}
          teamName={formData.teamName}
          onShowWelcome={onShowWelcome}
        />
      );

    default:
      return null;
  }
};

const CreateTeamUnauthed: React.FC = () => {
  return (
    <div className="min-h-screen bg-secondary p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="mb-6">
          <Typography variant="headline-lg" className="text-primary mb-1">
            Create Team
          </Typography>
          <Typography variant="body" className="text-secondary">
            Set up your team
          </Typography>
        </header>
        <div className="text-center">
          <Typography variant="body-lg">
            Please log in to create a team.
          </Typography>
        </div>
      </div>
    </div>
  );
};

interface CreateTeamLoadingOverlayProps {
  message: string;
}

const CreateTeamLoadingOverlay: React.FC<CreateTeamLoadingOverlayProps> = ({
  message,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-primary p-lg rounded-lg shadow-2xl max-w-sm w-full mx-md text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-md"></div>
        <Typography variant="body-md">{message}</Typography>
      </div>
    </div>
  );
};

const CreateTeam: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshRoles } = useRoles();

  // State management
  const [currentStep, setCurrentStep] = useState<StepId>("team-info");
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

  // Duplicate prevention state
  const [duplicateCheck, setDuplicateCheck] =
    useState<DuplicateCheckResult | null>(null);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [duplicateCheckLoading, setDuplicateCheckLoading] = useState(false);

  // Location finder state
  const [addressSuggestions, setAddressSuggestions] = useState<
    AddressSuggestion[]
  >([]);
  const [locationLoading, setLocationLoading] = useState(false);

  // Form data update handler
  const updateFormData = (updates: Partial<TeamCreationInput>) => {
    const newFormData = { ...formData, ...updates };
    setFormData(newFormData);
    saveProgressSafe(currentStep, newFormData);
  };

  const validateCurrentStep = () => validateStep(currentStep, formData);

  // Check for duplicate teams
  const handleDuplicateCheck = async () =>
    runDuplicateCheck({
      formData,
      setDuplicateCheck,
      setShowDuplicateWarning,
      setDuplicateCheckLoading,
      setCreateError,
    });

  // Location finder functions
  const handleUseCurrentLocation = async () =>
    runUseCurrentLocation({
      setLocationLoading,
      updateFormData,
      setCreateError,
    });

  const handleAddressSearch = async (query: string) =>
    runAddressSearch({ query, setAddressSuggestions });

  const handleSelectAddress = async (address: AddressSuggestion) =>
    runSelectAddress({ address, updateFormData, setAddressSuggestions });

  // Team creation handler
  const handleCreateTeam = async () => {
    if (!user?.id) {
      setCreateError("User not authenticated");
      return;
    }

    const canProceed = await handleDuplicateCheck();
    if (!canProceed) return;

    await runCreateTeam({
      userId: user.id,
      userEmail: user.email,
      formData,
      refreshRoles,
      setCreatedTeamId,
      setCurrentStep,
      setIsLoading,
      setLoadingMessage,
      setCreateError,
    });
  };

  // Step navigation
  const handleNext = () => {
    if (currentStep === "team-info" && validateCurrentStep()) {
      setCurrentStep("school-info");
    } else if (currentStep === "school-info") {
      setCurrentStep("review");
    } else if (currentStep === "review") {
      handleCreateTeam();
    }
  };

  const handlePrevious = () => {
    if (currentStep === "school-info") {
      setCurrentStep("team-info");
    } else if (currentStep === "review") {
      setCurrentStep("school-info");
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

  const dismissDuplicateWarning = () => {
    setShowDuplicateWarning(false);
    setDuplicateCheck(null);
    setCreateError(null);
  };

  const handleContactSupport = () => {
    setCreateError("Please contact customer support for assistance.");
  };

  if (!user) {
    return <CreateTeamUnauthed />;
  }

  const currentStepIndex = CREATE_TEAM_STEPS.findIndex(
    (step) => step.id === currentStep
  );

  return (
    <div className="min-h-screen bg-secondary p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="mb-6">
          <Typography variant="headline-lg" className="text-primary mb-1">
            Create Team
          </Typography>
          <Typography variant="body" className="text-secondary">
            Set up your team in a few simple steps
          </Typography>
        </header>
        <div className="container-content">
          {/* Progress Steps */}
          <StepProgress
            steps={CREATE_TEAM_STEPS}
            currentStepIndex={currentStepIndex}
          />

          {/* Step Content */}
          <div className="bg-primary shadow-lg rounded-lg p-lg mb-lg">
            <CreateTeamStepContent
              currentStep={currentStep}
              formData={formData}
              updateFormData={updateFormData}
              onUseCurrentLocation={handleUseCurrentLocation}
              onAddressSearch={handleAddressSearch}
              onSelectAddress={handleSelectAddress}
              locationLoading={locationLoading}
              addressSuggestions={addressSuggestions}
              duplicateCheckLoading={duplicateCheckLoading}
              showDuplicateWarning={showDuplicateWarning}
              duplicateCheck={duplicateCheck}
              createError={createError}
              dismissDuplicateWarning={dismissDuplicateWarning}
              onContactSupport={handleContactSupport}
              onShowWelcome={handleShowWelcome}
            />
          </div>

          {/* Navigation */}
          {currentStep !== "complete" && (
            <div className="flex justify-between">
              <Button
                variant="secondary"
                onClick={handlePrevious}
                disabled={currentStepIndex === 0}
                icon={<Icon name="arrow-left" size="sm" />}
              >
                Previous
              </Button>
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={!validateCurrentStep() || isLoading}
                loading={isLoading}
                icon={
                  currentStep === "review" ? (
                    <Icon name="plus" size="sm" />
                  ) : (
                    <Icon name="arrow-right" size="sm" />
                  )
                }
                iconPosition="right"
              >
                {currentStep === "review" ? "Create Team" : "Next"}
              </Button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && <CreateTeamLoadingOverlay message={loadingMessage} />}

          {/* Welcome Modal */}
          {showWelcomeModal && createdTeamId && (
            <TeamWelcomeModal
              isOpen={showWelcomeModal}
              onClose={() => setShowWelcomeModal(false)}
              teamName={`${formData.schoolName} ${formData.teamName}`}
              onGoToBulletin={handleGoToBulletin}
            />
          )}
        </div>
      </div>
    </div>
  );
};

CreateTeam.displayName = "CreateTeam";

export default React.memo(CreateTeam);
