/**
 * JoinTeam Component
 *
 * Multi-step wizard for joining teams through various methods:
 * - Team invite codes
 * - Email invitations
 * - School-based team discovery
 * - Request to join functionality
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { Typography } from "../../components/design-system";
import { Icon } from "../../components/ui/Icon/Icon";
import { Button } from "../../components/ui/Button/Button";
import { useJoinTeamHandlers } from "./useJoinTeamHandlers";
import { JOIN_METHODS } from "./constants";
import {
  MethodStep,
  InviteCodeStep,
  SearchStep,
  RequestStep,
  CompleteStep,
  DefaultStep,
} from "./steps";

const JoinTeam: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentStep,
    inviteCode,
    searchQuery,
    searchResults,
    selectedTeam,
    selectedRole,
    isLoading,
    handleMethodSelect,
    handleInviteCodeChange,
    handleInviteCodeSubmit,
    handleSearchQueryChange,
    handleTeamSearch,
    handleJoinTeam,
    handleGoToDashboard,
    handleGoToTeam,
    handleJoinAnother,
    handleSwitchToSearch,
    handleSwitchToInviteCode,
    handleBackToMethods,
  } = useJoinTeamHandlers();

  const renderStepContent = () => {
    switch (currentStep) {
      case "method":
        return (
          <MethodStep
            joinMethods={JOIN_METHODS}
            onMethodSelect={handleMethodSelect}
          />
        );

      case "invite-code":
        return (
          <InviteCodeStep
            inviteCode={inviteCode}
            isLoading={isLoading}
            onInviteCodeChange={handleInviteCodeChange}
            onSubmit={handleInviteCodeSubmit}
            onSwitchToSearch={handleSwitchToSearch}
          />
        );

      case "search":
        return (
          <SearchStep
            searchQuery={searchQuery}
            searchResults={searchResults}
            isLoading={isLoading}
            onSearchQueryChange={handleSearchQueryChange}
            onSearch={handleTeamSearch}
            onJoinTeam={handleJoinTeam}
            onSwitchToInviteCode={handleSwitchToInviteCode}
          />
        );

      case "request":
        return (
          <RequestStep
            selectedTeam={selectedTeam}
            onGoToDashboard={handleGoToDashboard}
            onJoinAnother={handleJoinAnother}
          />
        );

      case "complete":
        return (
          <CompleteStep
            selectedRole={selectedRole}
            onGoToTeam={handleGoToTeam}
            onGoToDashboard={handleGoToDashboard}
          />
        );

      default:
        return <DefaultStep currentStep={currentStep} />;
    }
  };

  return (
    <div className="min-h-screen bg-secondary p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="mb-6">
          <Typography variant="headline-lg" className="text-primary mb-1">
            Join Team
          </Typography>
          <Typography variant="body" className="text-secondary">
            Find and join your team
          </Typography>
        </header>
        <div className="content-medium">
          {/* Back Navigation */}
          {currentStep !== "method" && currentStep !== "complete" && (
            <div className="mb-6">
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={handleBackToMethods}
                className="flex items-center gap-1 text-secondary hover:text-primary"
              >
                <Icon name="chevron-left" size="sm" /> Back to join methods
              </Button>
            </div>
          )}

          {/* Step Content */}
          <div className="bg-primary elevation-card border-muted rounded-lg p-8">
            {renderStepContent()}
          </div>

          {/* Help Section */}
          {currentStep === "method" && (
            <div className="mt-8 text-center">
              <Typography variant="body-sm" color="muted" className="mb-2">
                Need help joining your team?
              </Typography>
              <div className="space-x-4">
                <Button type="button" variant="brandLink" size="sm">
                  Contact Support
                </Button>
                <span className="text-border-light">•</span>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={() => navigate("/create-team")}
                >
                  Create a New Team Instead
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

JoinTeam.displayName = "JoinTeam";

export default React.memo(JoinTeam);
