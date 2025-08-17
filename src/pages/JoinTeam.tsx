import React, { useState } from "react";
// (Removed unused Search import after log text simplification)
import { useNavigate } from "react-router-dom";
import { ROUTES, teamRoutes } from "../routes/paths";

import { useAuth } from "../app/auth-store";
import { Typography } from "../components/design-system";
import { Button } from "../components/ui/Button/Button";
import { Icon } from "../components/ui/Icon/Icon";
import { Tag } from "../components/ui/Tag";

/**
 * Join Team Page
 *
 * Allows users to join existing teams through various methods:
 * - Team invite codes
 * - Email invitations
 * - School-based team discovery
 * - Request to join functionality
 *
 * Features:
 * - Multiple join methods
 * - Team search and discovery
 * - Invitation code verification
 * - Role selection during join process
 * - School verification for team access
 */

interface JoinMethod {
  id: string;
  title: string;
  description: string;
  icon: string;
  primary?: boolean;
}

interface TeamSearchResult {
  id: string;
  name: string;
  school: string;
  sport: string;
  level: string;
  memberCount: number;
  coachName: string;
  isPublic: boolean;
  requiresApproval: boolean;
}

type JoinStep =
  | "method"
  | "invite-code"
  | "search"
  | "email-invite"
  | "request"
  | "complete";

export const JoinTeam: React.FC = () => {
  const navigate = useNavigate();
  const { user: _user } = useAuth();

  const [currentStep, setCurrentStep] = useState<JoinStep>("method");
  const [_selectedMethod, setSelectedMethod] = useState<string>("");
  const [inviteCode, setInviteCode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TeamSearchResult[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<TeamSearchResult | null>(
    null
  );
  const [selectedRole, _setSelectedRole] = useState("player");
  const [isLoading, setIsLoading] = useState(false);

  const joinMethods: JoinMethod[] = [
    {
      id: "invite-code",
      title: "Team Invite Code",
      description: "Enter a 6-digit code provided by your coach",
      icon: "key",
      primary: true,
    },
    {
      id: "email-invite",
      title: "Email Invitation",
      description: "Join using a link sent to your email",
      icon: "mail",
    },
    {
      id: "search",
      title: "Find Your Team",
      description: "Search for teams by school or team name",
      icon: "search",
    },
    {
      id: "request",
      title: "Request to Join",
      description: "Send a request to join a private team",
      icon: "user-plus",
    },
  ];

  // Mock search results - replace with actual API call
  const mockSearchResults: TeamSearchResult[] = [
    {
      id: "team-1",
      name: "Central High Eagles",
      school: "Central High School",
      sport: "Football",
      level: "Varsity",
      memberCount: 45,
      coachName: "Coach Johnson",
      isPublic: true,
      requiresApproval: false,
    },
    {
      id: "team-2",
      name: "North Lions JV",
      school: "North High School",
      sport: "Football",
      level: "Junior Varsity",
      memberCount: 32,
      coachName: "Coach Williams",
      isPublic: false,
      requiresApproval: true,
    },
  ];

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    setCurrentStep(methodId as JoinStep);
  };

  const handleInviteCodeSubmit = async () => {
    if (!inviteCode || inviteCode.length !== 6) {
      alert("Please enter a valid 6-digit invite code");
      return;
    }

    setIsLoading(true);

    // TODO: Implement actual invite code verification
    console.log("🔑 Verifying invite code:", inviteCode);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock success - replace with actual logic
    setIsLoading(false);
    setCurrentStep("complete");
  };

  const handleTeamSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);

    // TODO: Implement actual team search API
    console.log("Searching for teams:", searchQuery);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock results - replace with actual search
    setSearchResults(
      mockSearchResults.filter(
        (team) =>
          team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          team.school.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

    setIsLoading(false);
  };

  const handleJoinTeam = async (team: TeamSearchResult) => {
    setSelectedTeam(team);

    if (team.requiresApproval) {
      // Send join request
      console.log("📨 Sending join request for team:", team.name);
      // TODO: Implement join request logic
      setCurrentStep("request");
    } else {
      // Join immediately
      console.log("✅ Joining team immediately:", team.name);
      // TODO: Implement immediate join logic
      setCurrentStep("complete");
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "method":
        return (
          <div>
            <div className="text-center mb-8">
              <Icon
                name="phone"
                size="xl"
                color="primary"
                className="mx-auto mb-4"
              />
              <Typography variant="headline-xl" className="mb-4">
                Join a Team
              </Typography>
              <Typography
                variant="body-lg"
                color="muted"
                className="max-w-2xl mx-auto"
              >
                Choose how you'd like to join your team. Most coaches will
                provide you with an invite code, but you can also search for
                your team directly.
              </Typography>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {joinMethods.map((method) => (
                <Button
                  key={method.id}
                  type="button"
                  variant={method.primary ? "primary" : "outline"}
                  onClick={() => handleMethodSelect(method.id)}
                  className={`p-6 h-auto w-full justify-start text-left rounded-lg ${
                    method.primary
                      ? ""
                      : "border-subtle dark:border-gray-700 bg-transparent"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <Icon
                      name={
                        method.icon as "key" | "mail" | "search" | "user-plus"
                      }
                      size="lg"
                      color={method.primary ? "primary" : "secondary"}
                    />
                    <div>
                      <Typography variant="headline-sm" className="mb-2">
                        {method.title}
                        {method.primary && (
                          <span className="ml-2 bg-surface-jade0 text-text-primary text-xs px-2 py-1 rounded-full">
                            Most Common
                          </span>
                        )}
                      </Typography>
                      <Typography variant="body-sm" color="muted">
                        {method.description}
                      </Typography>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        );

      case "invite-code":
        return (
          <div className="max-w-md mx-auto text-center">
            <Icon
              name="key"
              size="xl"
              color="primary"
              className="mx-auto mb-6"
            />
            <Typography variant="headline-lg" className="mb-4">
              Enter Invite Code
            </Typography>
            <Typography variant="body-md" color="muted" className="mb-8">
              Your coach should have provided you with a 6-digit invite code.
              Enter it below to join your team.
            </Typography>

            <div className="mb-6">
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength={6}
                className="w-full px-4 py-3 text-center font-mono text-[1.75rem] leading-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-jade-500 focus:border-brand-jade tracking-widest"
                aria-label="Invite code"
              />
              <Typography variant="body-sm" color="muted" className="mt-2">
                Enter the 6-character code exactly as provided
              </Typography>
            </div>

            <Button
              onClick={handleInviteCodeSubmit}
              disabled={inviteCode.length !== 6 || isLoading}
              variant="primary"
              size="md"
              className="w-full mb-4"
            >
              {isLoading ? "Verifying..." : "Join Team"}
            </Button>

            <div className="text-center">
              <Typography variant="body-sm" color="muted" className="mb-2">
                Don't have an invite code?
              </Typography>
              <Button
                type="button"
                variant="brandLink"
                size="sm"
                onClick={() => setCurrentStep("search")}
                className=""
              >
                Search for your team instead
              </Button>
            </div>
          </div>
        );

      case "search":
        return (
          <div>
            <div className="text-center mb-8">
              <Icon
                name="search"
                size="xl"
                color="primary"
                className="mx-auto mb-4"
              />
              <Typography variant="headline-lg" className="mb-4">
                Find Your Team
              </Typography>
              <Typography variant="body-md" color="muted">
                Search for your team by school name or team name
              </Typography>
            </div>

            <div className="max-w-2xl mx-auto mb-8">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by school or team name..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jade-500 focus:border-brand-jade"
                  onKeyPress={(e) => e.key === "Enter" && handleTeamSearch()}
                />
                <Button
                  onClick={handleTeamSearch}
                  disabled={!searchQuery.trim() || isLoading}
                  variant="primary"
                  size="md"
                >
                  {isLoading ? "Searching..." : "Search"}
                </Button>
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="max-w-3xl mx-auto">
                <Typography variant="headline-md" className="mb-4">
                  Found {searchResults.length} team
                  {searchResults.length !== 1 ? "s" : ""}
                </Typography>
                <div className="space-y-4">
                  {searchResults.map((team) => (
                    <div
                      key={team.id}
                      className="border border-subtle dark:border-gray-700 rounded-lg p-6"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Typography variant="headline-sm">
                              {team.name}
                            </Typography>
                            {!team.isPublic && (
                              <Tag variant="warning" size="sm">
                                Private
                              </Tag>
                            )}
                          </div>
                          <Typography
                            variant="body-sm"
                            color="muted"
                            className="mb-2"
                          >
                            {team.school} • {team.sport} • {team.level}
                          </Typography>
                          <div className="flex items-center gap-4 text-sm text-text-secondary">
                            <span>{team.memberCount} members</span>
                            <span>Coach: {team.coachName}</span>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={() => handleJoinTeam(team)}
                        >
                          {team.requiresApproval
                            ? "Request to Join"
                            : "Join Team"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchQuery && searchResults.length === 0 && !isLoading && (
              <div className="text-center py-8">
                <Icon
                  name="search"
                  size="xl"
                  color="secondary"
                  className="mx-auto mb-4"
                />
                <Typography variant="headline-md" className="mb-2">
                  No teams found
                </Typography>
                <Typography variant="body-md" color="muted" className="mb-4">
                  We couldn't find any teams matching "{searchQuery}". Try a
                  different search term or contact your coach for an invite
                  code.
                </Typography>
                <Button
                  type="button"
                  variant="brandLink"
                  onClick={() => setCurrentStep("invite-code")}
                  className=""
                >
                  Use an invite code instead
                </Button>
              </div>
            )}
          </div>
        );

      case "request":
        return (
          <div className="max-w-md mx-auto text-center">
            <Icon
              name="mail"
              size="xl"
              color="primary"
              className="mx-auto mb-6"
            />
            <Typography variant="headline-lg" className="mb-4">
              Request Sent!
            </Typography>
            <Typography variant="body-md" color="muted" className="mb-8">
              Your request to join "{selectedTeam?.name}" has been sent to the
              coaching staff. You'll receive an email notification when your
              request is approved.
            </Typography>

            <div className="surface-subtle dark:bg-blue-900/20 border border-subtle dark:border-blue-800 rounded-lg p-4 mb-6">
              <Typography
                variant="body-sm"
                className="text-blue-700 dark:text-blue-300"
              >
                <strong>What's next?</strong>
                <br />
                The team's coaching staff will review your request and either
                approve or contact you for more information. This usually takes
                1-2 business days.
              </Typography>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="primary"
                className="flex-1"
                onClick={() => navigate(ROUTES.DASHBOARD)}
              >
                Go to Dashboard
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={() => setCurrentStep("method")}
              >
                Join Another Team
              </Button>
            </div>
          </div>
        );

      case "complete":
        return (
          <div className="max-w-md mx-auto text-center">
            <Icon
              name="check-circle"
              size="xl"
              color="success"
              className="mx-auto mb-6"
            />
            <Typography variant="headline-lg" className="mb-4">
              Welcome to the Team!
            </Typography>
            <Typography variant="body-md" color="muted" className="mb-8">
              You've successfully joined your team. You can now access team
              schedules, announcements, and participate in all team activities.
            </Typography>

            <div className="mb-6">
              <Typography
                variant="body-sm"
                className="font-medium mb-2 flex items-center gap-2"
              >
                Your Role:
                <Tag variant="success" size="sm" className="capitalize">
                  {selectedRole}
                </Tag>
              </Typography>
              <Typography variant="body-sm" color="muted">
                If this isn't correct, contact your coach to update your role.
              </Typography>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="primary"
                className="flex-1"
                onClick={() => navigate(teamRoutes.bulletin("new-team-id"))}
              >
                Go to Team
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={() => navigate(ROUTES.DASHBOARD)}
              >
                Dashboard
              </Button>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center">
            <Typography variant="headline-lg" className="mb-4">
              Step: {currentStep}
            </Typography>
            <Typography variant="body-md" color="muted">
              This step is not yet implemented. Check back soon!
            </Typography>
          </div>
        );
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-5xl mx-auto">
        {/* Back Navigation */}
        {currentStep !== "method" && currentStep !== "complete" && (
          <div className="mb-6">
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={() => setCurrentStep("method")}
              className="flex items-center gap-1 text-text-secondary hover:text-text-primary"
            >
              <Icon name="chevron-left" size="sm" /> Back to join methods
            </Button>
          </div>
        )}

        {/* Step Content */}
        <div className="surface-card elevation-card border-subtle rounded-lg p-8">
          {renderStepContent()}
        </div>

        {/* Help Section */}
        {currentStep === "method" && (
          <div className="mt-8 text-center">
            <Typography variant="body-sm" color="muted" className="mb-2">
              Need help joining your team?
            </Typography>
            <div className="space-x-4">
              <Button type="button" variant="brandLink" size="sm" className="">
                Contact Support
              </Button>
              <span className="text-gray-300">•</span>
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={() => navigate(ROUTES.CREATE_TEAM)}
                className=""
              >
                Create a New Team Instead
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
