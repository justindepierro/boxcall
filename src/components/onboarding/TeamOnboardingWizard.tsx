import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Typography } from "../design-system/Typography";
import { Button } from "../ui/Button/Button";
import { Icon } from "../ui/Icon/Icon";
import { Badge } from "../ui/Badge";
import { teamRoutes } from "../../routes/paths";

interface TeamOnboardingWizardProps {
  teamId: string;
  teamName: string;
  schoolName: string;
  onComplete: () => void;
  onSkip: () => void;
}

type OnboardingStep =
  | "welcome"
  | "invite-coaches"
  | "add-players"
  | "first-practice"
  | "explore-features"
  | "complete";

interface OnboardingStepConfig {
  id: OnboardingStep;
  title: string;
  description: string;
  icon: string;
  estimatedTime: string;
  primaryAction: string;
  secondaryAction?: string;
}

export const TeamOnboardingWizard: React.FC<TeamOnboardingWizardProps> = ({
  teamId,
  teamName,
  schoolName,
  onComplete,
  onSkip,
}) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");

  const steps: OnboardingStepConfig[] = [
    {
      id: "welcome",
      title: `Welcome to ${schoolName} ${teamName}!`,
      description:
        "Let's get your team ready for success. We'll walk you through the essential setup steps to get the most out of BoxCall.",
      icon: "trophy",
      estimatedTime: "5 minutes",
      primaryAction: "Let's Get Started",
      secondaryAction: "Skip Setup",
    },
    {
      id: "invite-coaches",
      title: "Invite Your Coaching Staff",
      description:
        "Add assistant coaches, coordinators, and support staff. They'll help manage the team and can access relevant features based on their role.",
      icon: "user-plus",
      estimatedTime: "2 minutes",
      primaryAction: "Invite Coaches",
      secondaryAction: "Skip for Now",
    },
    {
      id: "add-players",
      title: "Add Your Players",
      description:
        "Import your roster or add players individually. You can also send invite links for players and parents to join themselves.",
      icon: "users",
      estimatedTime: "3 minutes",
      primaryAction: "Add Players",
      secondaryAction: "Do This Later",
    },
    {
      id: "first-practice",
      title: "Schedule Your First Practice",
      description:
        "Set up your first practice or meeting. This helps establish your team calendar and gets everyone synchronized.",
      icon: "calendar-plus",
      estimatedTime: "2 minutes",
      primaryAction: "Schedule Practice",
      secondaryAction: "Skip for Now",
    },
    {
      id: "explore-features",
      title: "Explore Key Features",
      description:
        "Take a quick tour of playbooks, messaging, attendance tracking, and other tools that will help you coach more effectively.",
      icon: "compass",
      estimatedTime: "3 minutes",
      primaryAction: "Take Tour",
      secondaryAction: "Explore Later",
    },
    {
      id: "complete",
      title: "You're All Set!",
      description: `${schoolName} ${teamName} is ready to go. Your team dashboard has everything you need to manage practices, games, and team communication.`,
      icon: "check-circle",
      estimatedTime: "",
      primaryAction: "Go to Dashboard",
    },
  ];

  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);
  const currentStepConfig = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    }
  };

  const handlePrimaryAction = () => {
    switch (currentStep) {
      case "welcome":
        handleNext();
        break;
      case "invite-coaches":
        navigate(teamRoutes.settings(teamId));
        break;
      case "add-players":
        navigate(teamRoutes.bulletin(teamId)); // Go to team bulletin where roster management will be
        break;
      case "first-practice":
        navigate(teamRoutes.calendar(teamId));
        break;
      case "explore-features":
        // Navigate to feature tour or help center
        navigate(teamRoutes.bulletin(teamId));
        break;
      case "complete":
        onComplete();
        navigate(teamRoutes.bulletin(teamId));
        break;
      default:
        handleNext();
    }
  };

  const handleSecondaryAction = () => {
    if (currentStep === "welcome") {
      onSkip();
      return;
    }
    handleNext();
  };

  const renderStepContent = () => {
    return (
      <div className="text-center max-w-2xl mx-auto">
        {/* Icon */}
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-jade-500 to-emerald-600 rounded-full flex items-center justify-center">
            <Icon
              name={currentStepConfig.icon as any}
              size="lg"
              className="text-white"
            />
          </div>
        </div>

        {/* Title */}
        <Typography variant="headline-xl" className="mb-4">
          {currentStepConfig.title}
        </Typography>

        {/* Description */}
        <Typography
          variant="body-lg"
          color="muted"
          className="mb-8 leading-relaxed"
        >
          {currentStepConfig.description}
        </Typography>

        {/* Time estimate */}
        {currentStepConfig.estimatedTime && (
          <div className="mb-8">
            <Badge variant="neutral" className="text-xs">
              <Icon name="clock" size="xs" className="mr-1" />
              {currentStepConfig.estimatedTime}
            </Badge>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={handlePrimaryAction}
            variant="primary"
            size="md"
            className="min-w-[140px]"
          >
            {currentStepConfig.primaryAction}
          </Button>

          {currentStepConfig.secondaryAction && (
            <Button
              onClick={handleSecondaryAction}
              variant="ghost"
              size="md"
              className="min-w-[140px]"
            >
              {currentStepConfig.secondaryAction}
            </Button>
          )}
        </div>

        {/* Step-specific additional content */}
        {currentStep === "invite-coaches" && (
          <div className="mt-8 p-4 bg-jade-50 dark:bg-jade-900/20 rounded-lg border border-jade-200 dark:border-jade-800">
            <div className="flex items-start gap-3">
              <Icon
                name="lightbulb"
                size="sm"
                className="text-jade-600 dark:text-jade-400 mt-0.5"
              />
              <div className="text-left">
                <Typography
                  variant="body-sm"
                  className="font-medium text-jade-800 dark:text-jade-200 mb-1"
                >
                  Pro Tip: Different Coaching Roles
                </Typography>
                <Typography
                  variant="body-sm"
                  className="text-jade-700 dark:text-jade-300"
                >
                  Invite assistant coaches, coordinators, and team managers.
                  Each role has different permissions to help manage your team
                  effectively.
                </Typography>
              </div>
            </div>
          </div>
        )}

        {currentStep === "add-players" && (
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Icon
                name="upload"
                size="sm"
                className="text-blue-600 dark:text-blue-400 mt-0.5"
              />
              <div className="text-left">
                <Typography
                  variant="body-sm"
                  className="font-medium text-blue-800 dark:text-blue-200 mb-1"
                >
                  Multiple Ways to Add Players
                </Typography>
                <Typography
                  variant="body-sm"
                  className="text-blue-700 dark:text-blue-300"
                >
                  Upload a CSV roster, add players manually, or send invite
                  links for self-registration. Parents can also be included in
                  communications.
                </Typography>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress bar */}
        {currentStep !== "welcome" && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <Typography variant="body-sm" color="muted">
                Step {currentStepIndex + 1} of {steps.length}
              </Typography>
              <Typography variant="body-sm" color="muted">
                Team Setup
              </Typography>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-jade-500 to-emerald-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Step content */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
          {renderStepContent()}
        </div>

        {/* Footer navigation */}
        {currentStep !== "welcome" && currentStep !== "complete" && (
          <div className="mt-6 flex justify-between items-center">
            <Button
              onClick={() => {
                const prevIndex = currentStepIndex - 1;
                if (prevIndex >= 0) {
                  setCurrentStep(steps[prevIndex].id);
                }
              }}
              variant="ghost"
              size="sm"
              disabled={currentStepIndex === 0}
              icon={<Icon name="chevron-left" size="sm" />}
            >
              Previous
            </Button>

            <Button
              onClick={onSkip}
              variant="ghost"
              size="sm"
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Skip Setup
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
