import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../app/auth-store";
import { useRoles } from "../hooks/useRoles";
import { PageLayout } from "../components/layout/PageLayout";
import { Button } from "../components/ui/Button/Button";
import { Typography } from "../components/design-system/Typography";
import { Icon } from "../components/ui/Icon/Icon";
import { Aurora } from "../components/ui/Aurora";
import {
  EnhancedInput,
  EnhancedSelect,
} from "../components/forms/EnhancedFormFields";
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

/**
 * Create Team Page - Simplified Working Version
 *
 * A clean, working team creation form using extracted services:
 * - TeamCreationService: Database operations
 * - TeamValidationService: Form validation
 * - ProgressTrackingService: Progress persistence
 */

type StepId = "team-info" | "school-info" | "review" | "complete";

export const CreateTeam: React.FC = () => {
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
      console.error("Duplicate check failed:", error);
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
      console.error("Team creation failed:", error);
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
          <div className="space-y-spacing-md">
            <Typography variant="headline-md" className="mb-spacing-md">
              Team Information
            </Typography>
            <EnhancedInput
              label="School Name"
              placeholder="e.g., Burke Catholic High School"
              value={formData.schoolName}
              onChange={(value) => updateFormData({ schoolName: value })}
              required
            />
            <EnhancedInput
              label="Team Name"
              placeholder="e.g., Eagles"
              value={formData.teamName}
              onChange={(value) => updateFormData({ teamName: value })}
              required
            />
            <EnhancedSelect
              label="Sport"
              value={formData.sport}
              onChange={(value) => updateFormData({ sport: value })}
              options={[
                { value: "Football", label: "Football" },
                { value: "Basketball", label: "Basketball" },
                { value: "Baseball", label: "Baseball" },
                { value: "Soccer", label: "Soccer" },
                { value: "Other", label: "Other" },
              ]}
            />
          </div>
        );

      case "school-info":
        return (
          <div className="space-y-spacing-md">
            <Typography variant="headline-md" className="mb-spacing-md">
              School Details (Optional)
            </Typography>

            {/* Location Helper */}
            <div className="bg-status-info-bg border border-blue-200 rounded-lg p-spacing-md">
              <div className="flex items-start gap-spacing-sm">
                <Icon
                  name="map-pin"
                  size="sm"
                  color="primary"
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <Typography
                    variant="body-sm"
                    className="font-medium mb-spacing-xs"
                  >
                    Quick Location Setup
                  </Typography>
                  <Typography
                    variant="body-sm"
                    color="muted"
                    className="mb-spacing-sm"
                  >
                    We can help fill in your school's location automatically.
                  </Typography>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleUseCurrentLocation}
                    loading={locationLoading}
                    icon={<Icon name="map-pin" size="xs" />}
                  >
                    Use My Current Location
                  </Button>
                </div>
              </div>
            </div>

            <EnhancedInput
              label="School District"
              placeholder="e.g., Goshen Central School District"
              value={formData.schoolDistrict || ""}
              onChange={(value) => updateFormData({ schoolDistrict: value })}
            />

            <div className="relative">
              <EnhancedInput
                label="School Address"
                placeholder="e.g., 545 Goshen Avenue"
                value={formData.schoolAddress || ""}
                onChange={(value) => {
                  updateFormData({ schoolAddress: value });
                  handleAddressSearch(value);
                }}
              />

              {/* Address Suggestions */}
              {addressSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-spacing-xs bg-primary rounded-lg shadow-xl max-h-48 overflow-y-auto">
                  {addressSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      className="w-full px-spacing-md py-spacing-xs text-left hover:bg-secondary border-b border-subtle last:border-b-0"
                      onClick={() => handleSelectAddress(suggestion)}
                    >
                      <div className="font-medium">
                        {suggestion.streetAddress}
                      </div>
                      <div className="text-sm text-secondary">
                        {suggestion.city}, {suggestion.state}{" "}
                        {suggestion.zipCode}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-spacing-md">
              <EnhancedInput
                label="City"
                placeholder="e.g., Goshen"
                value={formData.schoolCity || ""}
                onChange={(value) => updateFormData({ schoolCity: value })}
              />
              <EnhancedInput
                label="State"
                placeholder="e.g., NY"
                value={formData.schoolState || ""}
                onChange={(value) => updateFormData({ schoolState: value })}
              />
            </div>

            <EnhancedInput
              label="ZIP Code"
              placeholder="e.g., 10924"
              value={formData.schoolZip || ""}
              onChange={(value) => updateFormData({ schoolZip: value })}
            />
          </div>
        );

      case "review":
        return (
          <div className="space-y-spacing-md">
            <Typography variant="headline-md" className="mb-spacing-md">
              Review Your Team
            </Typography>

            {/* Duplicate Check Loading */}
            {duplicateCheckLoading && (
              <div className="bg-status-info-bg border border-blue-200 rounded-lg p-spacing-md">
                <div className="flex items-center gap-spacing-sm">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <Typography variant="body-sm">
                    Checking for similar teams...
                  </Typography>
                </div>
              </div>
            )}

            {/* Duplicate Warning */}
            {showDuplicateWarning && duplicateCheck && (
              <div className="bg-warning border border-orange-200 rounded-lg p-spacing-md">
                <div className="flex items-start gap-spacing-sm">
                  <Icon
                    name="alert-triangle"
                    size="sm"
                    color="warning"
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <Typography
                      variant="body-sm"
                      className="font-medium mb-spacing-xs"
                    >
                      Similar Team Found
                    </Typography>
                    <Typography
                      variant="body-sm"
                      color="muted"
                      className="mb-spacing-sm"
                    >
                      {duplicateCheck.warningMessage}
                    </Typography>

                    {duplicateCheck.similarTeams.length > 0 && (
                      <div className="bg-secondary rounded-lg p-spacing-sm mb-spacing-sm">
                        <Typography
                          variant="body-xs"
                          className="font-medium mb-spacing-xs"
                        >
                          Similar Team:
                        </Typography>
                        {duplicateCheck.similarTeams
                          .slice(0, 1)
                          .map((similar) => (
                            <div key={similar.teamId} className="text-sm">
                              <div className="font-medium">
                                {similar.schoolName} {similar.teamName}
                              </div>
                              {similar.schoolCity && similar.schoolState && (
                                <div className="text-secondary">
                                  {similar.schoolCity}, {similar.schoolState}
                                </div>
                              )}
                              <div className="text-xs text-muted mt-spacing-xs">
                                Match reasons: {similar.matchReasons.join(", ")}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}

                    {duplicateCheck.isDuplicate ? (
                      <div className="flex gap-spacing-xs">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            // Contact support functionality
                            setCreateError(
                              "Please contact customer support to resolve this duplicate team issue."
                            );
                          }}
                          icon={<Icon name="mail" size="xs" />}
                        >
                          Contact Support
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-spacing-xs">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setShowDuplicateWarning(false);
                            setDuplicateCheck(null);
                            setCreateError(null);
                          }}
                        >
                          This is Different
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            // Contact support for account transfer
                            setCreateError(
                              "Please contact customer support for account transfer assistance."
                            );
                          }}
                          icon={<Icon name="mail" size="xs" />}
                        >
                          I'm the New Coach
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-secondary p-spacing-md rounded-lg space-y-spacing-xs">
              <div>
                <span className="font-medium">School:</span>{" "}
                {formData.schoolName}
              </div>
              <div>
                <span className="font-medium">Team:</span> {formData.teamName}
              </div>
              <div>
                <span className="font-medium">Sport:</span> {formData.sport}
              </div>
              <div>
                <span className="font-medium">Season:</span> {formData.season}
              </div>
              {formData.schoolDistrict && (
                <div>
                  <span className="font-medium">District:</span>{" "}
                  {formData.schoolDistrict}
                </div>
              )}
              {formData.schoolAddress && (
                <div>
                  <span className="font-medium">Address:</span>{" "}
                  {formData.schoolAddress}
                </div>
              )}
              {formData.schoolCity && formData.schoolState && (
                <div>
                  <span className="font-medium">Location:</span>{" "}
                  {formData.schoolCity}, {formData.schoolState}{" "}
                  {formData.schoolZip}
                </div>
              )}
            </div>

            {createError && !showDuplicateWarning && (
              <div className="bg-error-bg border border-error-200 text-error-600 px-spacing-md py-spacing-sm rounded-lg">
                {createError}
              </div>
            )}
          </div>
        );

      case "complete":
        return (
          <div className="text-center space-y-spacing-lg">
            <Icon
              name="check-circle"
              size="xl"
              color="success"
              className="mx-auto"
            />
            <Typography variant="headline-lg">
              Team Created Successfully!
            </Typography>
            <Typography variant="body-md" color="muted">
              Congratulations! Your team "{formData.schoolName}{" "}
              {formData.teamName}" has been created.
            </Typography>
            <Button
              onClick={handleShowWelcome}
              variant="primary"
              size="lg"
              icon={<Icon name="arrow-right" size="sm" />}
              iconPosition="right"
            >
              Continue to Team
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  if (!user) {
    return (
      <Aurora variant="shell" fullHeight>
        <PageLayout title="Create Team">
          <div className="text-center">
            <Typography variant="body-lg">
              Please log in to create a team.
            </Typography>
          </div>
        </PageLayout>
      </Aurora>
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
    <Aurora variant="shell" fullHeight>
      <PageLayout title="Create Team">
        <div className="container-content">
          {/* Progress Steps */}
          <div className="mb-spacing-xl">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center ${
                    index < steps.length - 1 ? "flex-1" : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step.id === currentStep
                        ? "bg-blue-600 text-white"
                        : currentStepIndex > index
                          ? "bg-green-600 text-white"
                          : "bg-muted text-secondary"
                    }`}
                  >
                    {index + 1}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-spacing-md ${
                        currentStepIndex > index
                          ? "bg-green-600"
                          : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-spacing-xs text-center">
              <Typography variant="body-lg" className="font-medium">
                {steps[currentStepIndex]?.title}
              </Typography>
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-primary shadow-lg rounded-lg p-spacing-lg mb-spacing-lg">
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
              <div className="bg-primary p-spacing-lg rounded-lg shadow-2xl max-w-sm w-full mx-spacing-md text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-spacing-md"></div>
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
      </PageLayout>
    </Aurora>
  );
};
