import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { logError } from "../utils/logger";

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
  const [_showLocationFinder, _setShowLocationFinder] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<
    AddressSuggestion[]
  >([]);
  const [locationLoading, setLocationLoading] = useState(false);

  // Form data update handler
  const updateFormData = (updates: Partial<TeamCreationInput>) => {
    const newFormData = { ...formData, ...updates };
    setFormData(newFormData);
    // Auto-save progress
    try {
      ProgressTrackingService.saveProgress(currentStep, newFormData, []);
    } catch (error) {
      console.warn("Could not save progress:", error);
    }
  };

  // Validation
  const validateCurrentStep = (): boolean => {
    if (currentStep === "team-info") {
      return formData.teamName.length > 0 && formData.schoolName.length > 0;
    }
    if (currentStep === "school-info") {
      return true; // Optional fields
    }
    if (currentStep === "review") {
      const validation = TeamValidationService.validateTeamForm(formData);
      return validation.success;
    }
    return true;
  };

  // Check for duplicate teams
  const handleDuplicateCheck = async () => {
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
      } else if (result.requiresApproval) {
        setShowDuplicateWarning(true);
        setCreateError(
          result.warningMessage || "Please verify this is not a duplicate"
        );
        return false;
      }

      return true;
    } catch (error) {
      logError("Duplicate check failed:", error);
      // Allow creation if check fails
      return true;
    } finally {
      setDuplicateCheckLoading(false);
    }
  };

  // Location finder functions
  const handleUseCurrentLocation = async () => {
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

        // Try to get school district
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

  const handleAddressSearch = async (query: string) => {
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
      console.warn("Address search failed:", error);
    }
  };

  const handleSelectAddress = async (address: AddressSuggestion) => {
    updateFormData({
      schoolAddress: address.streetAddress,
      schoolCity: address.city,
      schoolState: address.state,
      schoolZip: address.zipCode,
    });

    // Try to get school district
    const district = await LocationFinderService.getSchoolDistrict(address);
    if (district) {
      updateFormData({ schoolDistrict: district });
    }

    setAddressSuggestions([]);
  };

  // Team creation handler
  const handleCreateTeam = async () => {
    if (!user?.id) {
      setCreateError("User not authenticated");
      return;
    }

    // Check for duplicates first
    const canProceed = await handleDuplicateCheck();
    if (!canProceed) {
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
        try {
          ProgressTrackingService.clearProgress();
        } catch (error) {
          console.warn("Could not clear progress:", error);
        }

        // Go to completion step
        setCurrentStep("complete");
      } else {
        setCreateError(result.error || "Failed to create team");
      }
    } catch (error) {
      logError("Team creation failed:", error);
      setCreateError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoading(false);
      setLoadingMessage("Creating team...");
    }
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
      navigate(`/teams/${createdTeamId}/bulletin`);
    }
  };

  // Render step content
  const renderStepContent = () => {
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
            onUseCurrentLocation={handleUseCurrentLocation}
            onAddressSearch={handleAddressSearch}
            onSelectAddress={handleSelectAddress}
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
            onDismissDuplicateWarning={() => {
              setShowDuplicateWarning(false);
              setDuplicateCheck(null);
              setCreateError(null);
            }}
            onContactSupport={() => {
              setCreateError("Please contact customer support for assistance.");
            }}
          />
        );

      case "complete":
        return (
          <CompleteStep
            schoolName={formData.schoolName}
            teamName={formData.teamName}
            onShowWelcome={handleShowWelcome}
          />
        );

      default:
        return null;
    }
  };

  if (!user) {
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
  }

  const steps = [
    { id: "team-info", title: "Team Information" },
    { id: "school-info", title: "School Details" },
    { id: "review", title: "Review" },
    { id: "complete", title: "Complete" },
  ];

  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);

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
          <StepProgress steps={steps} currentStepIndex={currentStepIndex} />

          {/* Step Content */}
          <div className="bg-primary shadow-lg rounded-lg p-lg mb-lg">
            {renderStepContent()}
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
          {isLoading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-primary p-lg rounded-lg shadow-2xl max-w-sm w-full mx-md text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-md"></div>
                <Typography variant="body-md">{loadingMessage}</Typography>
              </div>
            </div>
          )}

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
