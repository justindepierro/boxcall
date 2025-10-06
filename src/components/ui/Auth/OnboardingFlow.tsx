import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Typography } from "../../design-system";
import { Button } from "../Button";
import { Card } from "../Card";
import Icon from "../Icon/Icon";
import type { User } from "./Auth";

interface OnboardingFlowProps {
  user: User;
  onComplete: () => void;
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  skipLabel?: string;
}

export function OnboardingFlow({ user, onComplete }: OnboardingFlowProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  // Role-based onboarding steps
  const getOnboardingSteps = (role: User["role"]): OnboardingStep[] => {
    const baseSteps: OnboardingStep[] = [
      {
        id: "welcome",
        title: "Welcome to BoxCall!",
        description: `Hi ${user.name}! You're now part of the BoxCall community. Let's get you set up with everything you need.`,
        icon: "sparkles",
      },
    ];

    switch (role) {
      case "coach":
        return [
          ...baseSteps,
          {
            id: "create-team",
            title: "Create Your Team",
            description:
              "Start by creating your football team profile. Add team details, colors, and basic information.",
            icon: "users",
            action: {
              label: "Create Team",
              onClick: () => navigate("/teams/create"),
            },
            skipLabel: "Skip for now",
          },
          {
            id: "invite-players",
            title: "Invite Your Players",
            description:
              "Send invitations to your players so they can join your team and start tracking their performance.",
            icon: "user-plus",
            action: {
              label: "Invite Players",
              onClick: () => navigate("/teams/manage"),
            },
            skipLabel: "Do this later",
          },
          {
            id: "first-play",
            title: "Record Your First Play",
            description:
              "Ready to start coaching? Record your first play to see how BoxCall helps you analyze and improve your team's performance.",
            icon: "play",
            action: {
              label: "Start Recording",
              onClick: () => navigate("/plays/record"),
            },
            skipLabel: "Explore first",
          },
        ];

      case "player":
        return [
          ...baseSteps,
          {
            id: "join-team",
            title: "Join Your Team",
            description:
              "Connect with your coach and join your team's BoxCall profile to start tracking your performance.",
            icon: "user-check",
            action: {
              label: "Find My Team",
              onClick: () => navigate("/teams/join"),
            },
            skipLabel: "I'll do this later",
          },
          {
            id: "profile-setup",
            title: "Complete Your Profile",
            description:
              "Add your position, jersey number, and other details to help your coach track your progress.",
            icon: "user-cog",
            action: {
              label: "Update Profile",
              onClick: () => navigate("/profile"),
            },
            skipLabel: "Skip for now",
          },
          {
            id: "explore-plays",
            title: "Explore Your Plays",
            description:
              "Check out your play history and see how you're performing in different situations.",
            icon: "chart-bar",
            action: {
              label: "View My Plays",
              onClick: () => navigate("/plays"),
            },
            skipLabel: "Explore later",
          },
        ];

      case "parent":
        return [
          ...baseSteps,
          {
            id: "link-child",
            title: "Connect with Your Child",
            description:
              "Link your account with your child's player profile to follow their progress and achievements.",
            icon: "heart",
            action: {
              label: "Link Account",
              onClick: () => navigate("/family/link"),
            },
            skipLabel: "Do this later",
          },
          {
            id: "view-progress",
            title: "Track Progress",
            description:
              "See your child's performance stats, achievements, and development over time.",
            icon: "trending-up",
            action: {
              label: "View Progress",
              onClick: () => navigate("/family/progress"),
            },
            skipLabel: "Explore first",
          },
        ];

      case "admin":
        return [
          ...baseSteps,
          {
            id: "admin-setup",
            title: "Admin Dashboard",
            description:
              "Access your admin dashboard to manage teams, users, and system settings.",
            icon: "cog",
            action: {
              label: "Go to Dashboard",
              onClick: () => navigate("/admin"),
            },
          },
        ];

      default:
        return baseSteps;
    }
  };

  const steps = getOnboardingSteps(user.role);
  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    // Simulate completion delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 1000));
    onComplete();
  };

  const handleAction = () => {
    if (currentStepData.action) {
      currentStepData.action.onClick();
      // Don't complete onboarding yet - let user explore
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-success to-surface-info dark:from-surface-primary dark:to-surface-secondary flex items-center justify-center p-4">
      <Card className="w-full container-content shadow-xl">
        <div className="p-8">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-8 rounded-full transition-colors ${
                    index <= currentStep
                      ? "bg-text-success"
                      : "bg-border dark:bg-surface-secondary"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-surface-success dark:bg-surface-success/20 rounded-full mb-6">
              <Icon
                name={currentStepData.icon as any}
                className="w-8 h-8 text-text-success dark:text-text-success"
              />
            </div>

            <Typography variant="headline-lg" className="mb-4">
              {currentStepData.title}
            </Typography>

            <Typography variant="body-lg" color="secondary" className="mb-8">
              {currentStepData.description}
            </Typography>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {currentStepData.action && (
              <Button
                variant="primary"
                size="lg"
                onClick={handleAction}
                className="flex-1 sm:flex-none"
              >
                {currentStepData.action.label}
              </Button>
            )}

            <Button
              variant={currentStepData.action ? "secondary" : "primary"}
              size="lg"
              onClick={handleNext}
              loading={isCompleting && isLastStep}
              disabled={isCompleting}
              className="flex-1 sm:flex-none"
            >
              {isLastStep ? "Get Started" : "Next"}
            </Button>

            {currentStepData.skipLabel && !isLastStep && (
              <Button
                variant="ghost"
                size="lg"
                onClick={handleSkip}
                disabled={isCompleting}
              >
                {currentStepData.skipLabel}
              </Button>
            )}
          </div>

          {/* Completion Message */}
          {isCompleting && (
            <div className="mt-6 text-center">
              <Typography variant="body-sm" color="muted">
                Setting up your account...
              </Typography>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
