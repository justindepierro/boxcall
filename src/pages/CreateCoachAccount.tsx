import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../app/auth-store";
import { Typography } from "../components/design-system";
import { Button } from "../components/ui/Button/Button";
import { Icon } from "../components/ui/Icon/Icon";
import { usePermissions } from "../hooks/usePermissions";
import { ROUTES } from "../routes/paths";

/**
 * Create Coach Account Page
 *
 * Standalone coach account creation for $9.99 one-time purchase.
 * Allows coaches to build personal playbooks and later join teams.
 *
 * Features:
 * - Personal coach account setup
 * - Contact information collection
 * - Optional school lookup/team linking
 * - Payment integration for $9.99 fee
 * - Personal playbook space
 */

interface CoachAccountFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  // Address Information
  address: string;
  city: string;
  state: string;
  zipCode: string;

  // Coaching Information
  yearsExperience: string;
  primarySport: string;
  coachingLevel: string; // Youth, High School, College, Professional

  // Team Connection (Optional)
  hasSchoolCode: boolean;
  schoolCode: string;
  schoolName: string;
  requestTeamLink: boolean;
}

type CoachAccountStep =
  | "intro"
  | "personal-info"
  | "address-info"
  | "coaching-info"
  | "team-connection"
  | "payment"
  | "complete";

export const CreateCoachAccount: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isSuperAdmin } = usePermissions();

  const [currentStep, setCurrentStep] = useState<CoachAccountStep>("intro");
  const [formData, setFormData] = useState<CoachAccountFormData>({
    firstName: "",
    lastName: "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    yearsExperience: "1-3 years",
    primarySport: "Football",
    coachingLevel: "High School",
    hasSchoolCode: false,
    schoolCode: "",
    schoolName: "",
    requestTeamLink: false,
  });

  const steps: { id: CoachAccountStep; title: string; description: string }[] =
    [
      {
        id: "intro",
        title: "Welcome",
        description: "Get started with your coach account",
      },
      {
        id: "personal-info",
        title: "Personal Information",
        description: "Basic contact details",
      },
      {
        id: "address-info",
        title: "Address",
        description: "Location information",
      },
      {
        id: "coaching-info",
        title: "Coaching Background",
        description: "Your coaching experience",
      },
      {
        id: "team-connection",
        title: "Team Connection",
        description: "Optional team linking",
      },
      {
        id: "payment",
        title: "Payment",
        description: "Complete your purchase",
      },
      {
        id: "complete",
        title: "Complete",
        description: "Account ready to use",
      },
    ];

  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleNext = () => {
    const currentIndex = steps.findIndex((step) => step.id === currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    const currentIndex = steps.findIndex((step) => step.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id);
    }
  };

  const handleSubmit = async () => {
    // TODO: Implement actual coach account creation logic
    console.info("🏃‍♂️ Creating coach account with data:", formData);

    if (isSuperAdmin) {
      console.info("🔓 Super admin coach account creation - bypassing payment");
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setCurrentStep("complete");
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "intro":
        return (
          <div className="text-center">
            <Icon name="user" size="xl" color="info" className="mx-auto mb-6" />
            <Typography variant="headline-xl" className="mb-4">
              Create Your Coach Account
            </Typography>
            <Typography
              variant="body-lg"
              color="muted"
              className="mb-8 container-content"
            >
              Join BoxCall as an individual coach! Build your personal
              playbooks, create practice plans, and enhance your coaching
              toolkit. Later, you can easily connect to any team.
            </Typography>

            {/* Value Proposition */}
            <div className="surface-subtle dark:bg-surface-info/20 border border-subtle dark:border-text-info rounded-lg p-6 mb-8">
              <Typography
                variant="headline-md"
                className="mb-4 text-text-info dark:text-text-info"
              >
                Why Coach Account?
              </Typography>
              <div className="grid-form gap-4 text-left">
                <div className="flex items-start gap-3">
                  <Icon name="book" size="sm" color="info" className="mt-1" />
                  <div>
                    <Typography variant="body-sm" className="font-medium mb-1">
                      Personal Playbook Library
                    </Typography>
                    <Typography variant="body-sm" color="muted">
                      Build and save your plays, practice plans, and game
                      strategies
                    </Typography>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon
                    name="calendar"
                    size="sm"
                    color="info"
                    className="mt-1"
                  />
                  <div>
                    <Typography variant="body-sm" className="font-medium mb-1">
                      Practice Planning Tools
                    </Typography>
                    <Typography variant="body-sm" color="muted">
                      Create detailed practice schedules and drill sequences
                    </Typography>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon
                    name="bar-chart"
                    size="sm"
                    color="info"
                    className="mt-1"
                  />
                  <div>
                    <Typography variant="body-sm" className="font-medium mb-1">
                      Analytics & Insights
                    </Typography>
                    <Typography variant="body-sm" color="muted">
                      Track your coaching development and methodology
                    </Typography>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="users" size="sm" color="info" className="mt-1" />
                  <div>
                    <Typography variant="body-sm" className="font-medium mb-1">
                      Easy Team Integration
                    </Typography>
                    <Typography variant="body-sm" color="muted">
                      Import your content when you join a team
                    </Typography>
                  </div>
                </div>
              </div>
            </div>

            <div className="surface-subtle dark:bg-surface-success/20 border border-subtle dark:border-text-success rounded-lg p-4">
              <Typography
                variant="body-md"
                className="font-medium text-text-success dark:text-text-success"
              >
                One-time purchase: $9.99 • No recurring fees • Lifetime access
              </Typography>
            </div>
          </div>
        );

      case "personal-info":
        return (
          <div>
            <Typography variant="headline-lg" className="mb-6">
              Personal Information
            </Typography>
            <div className="grid-form">
              <div>
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-medium mb-2"
                >
                  First Name *
                </Typography>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  placeholder="John"
                  className="w-full px-3 py-2 border border-border-medium rounded-lg focus-ring"
                  required
                />
              </div>
              <div>
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-medium mb-2"
                >
                  Last Name *
                </Typography>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  placeholder="Smith"
                  className="w-full px-3 py-2 border border-border-medium rounded-lg focus-ring"
                  required
                />
              </div>
              <div>
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-medium mb-2"
                >
                  Email Address *
                </Typography>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="john.smith@example.com"
                  className="w-full px-3 py-2 border border-border-medium rounded-lg focus-ring"
                  required
                />
              </div>
              <div>
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-medium mb-2"
                >
                  Phone Number *
                </Typography>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="(555) 123-4567"
                  className="w-full px-3 py-2 border border-border-medium rounded-lg focus-ring"
                  required
                />
              </div>
            </div>
          </div>
        );

      case "address-info":
        return (
          <div>
            <Typography variant="headline-lg" className="mb-6">
              Address Information
            </Typography>
            <div className="grid-form">
              <div className="md:col-span-2">
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-medium mb-2"
                >
                  Street Address *
                </Typography>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="123 Main Street"
                  className="w-full px-3 py-2 border border-border-medium rounded-lg focus-ring"
                  required
                />
              </div>
              <div>
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-medium mb-2"
                >
                  City *
                </Typography>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="New York"
                  className="w-full px-3 py-2 border border-border-medium rounded-lg focus-ring"
                  required
                />
              </div>
              <div>
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-medium mb-2"
                >
                  State *
                </Typography>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  placeholder="NY"
                  className="w-full px-3 py-2 border border-border-medium rounded-lg focus-ring"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-medium mb-2"
                >
                  Zip Code *
                </Typography>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) =>
                    setFormData({ ...formData, zipCode: e.target.value })
                  }
                  placeholder="10001"
                  className="w-full px-3 py-2 border border-border-medium rounded-lg focus-ring"
                  required
                />
              </div>
            </div>
          </div>
        );

      case "coaching-info":
        return (
          <div>
            <Typography variant="headline-lg" className="mb-6">
              Coaching Background
            </Typography>
            <div className="grid-form">
              <div>
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-medium mb-2"
                >
                  Primary Sport *
                </Typography>
                <select
                  value={formData.primarySport}
                  onChange={(e) =>
                    setFormData({ ...formData, primarySport: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border-medium rounded-lg focus-ring"
                >
                  <option value="Football">Football</option>
                  <option value="Basketball">Basketball</option>
                  <option value="Baseball">Baseball</option>
                  <option value="Soccer">Soccer</option>
                  <option value="Track & Field">Track & Field</option>
                  <option value="Wrestling">Wrestling</option>
                  <option value="Volleyball">Volleyball</option>
                  <option value="Cross Country">Cross Country</option>
                  <option value="Swimming">Swimming</option>
                  <option value="Tennis">Tennis</option>
                  <option value="Golf">Golf</option>
                  <option value="Lacrosse">Lacrosse</option>
                  <option value="Field Hockey">Field Hockey</option>
                  <option value="Softball">Softball</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-medium mb-2"
                >
                  Years of Experience *
                </Typography>
                <select
                  value={formData.yearsExperience}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      yearsExperience: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-border-medium rounded-lg focus-ring"
                >
                  <option value="New Coach">New Coach (0 years)</option>
                  <option value="1-3 years">1-3 years</option>
                  <option value="4-7 years">4-7 years</option>
                  <option value="8-15 years">8-15 years</option>
                  <option value="15+ years">15+ years</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-medium mb-2"
                >
                  Coaching Level *
                </Typography>
                <select
                  value={formData.coachingLevel}
                  onChange={(e) =>
                    setFormData({ ...formData, coachingLevel: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border-medium rounded-lg focus-ring"
                >
                  <option value="Youth">Youth (Under 14)</option>
                  <option value="High School">High School</option>
                  <option value="College">College</option>
                  <option value="Professional">Professional</option>
                  <option value="Multiple Levels">Multiple Levels</option>
                </select>
              </div>
            </div>
          </div>
        );

      case "team-connection":
        return (
          <div>
            <Typography variant="headline-lg" className="mb-2">
              Team Connection
            </Typography>
            <Typography variant="body-md" color="muted" className="mb-6">
              Optionally connect with a team now, or skip and join teams later.
            </Typography>

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="hasSchoolCode"
                  checked={formData.hasSchoolCode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hasSchoolCode: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-text-info surface-subtle border-border-medium rounded-lg focus-ring"
                />
                <Typography
                  variant="body-sm"
                  as="label"
                  className="font-medium"
                >
                  I have a school/team code
                </Typography>
              </div>

              {formData.hasSchoolCode && (
                <div className="grid-form p-4 surface-subtle dark:bg-surface-info/20 rounded-lg">
                  <div>
                    <Typography
                      variant="body-sm"
                      as="label"
                      className="block font-medium mb-2"
                    >
                      School/Team Code
                    </Typography>
                    <input
                      type="text"
                      value={formData.schoolCode}
                      onChange={(e) =>
                        setFormData({ ...formData, schoolCode: e.target.value })
                      }
                      placeholder="e.g., BCHS-FB-2024"
                      className="w-full px-3 py-2 border border-border-medium rounded-lg focus-ring"
                    />
                  </div>
                  <div>
                    <Typography
                      variant="body-sm"
                      as="label"
                      className="block font-medium mb-2"
                    >
                      School Name (Auto-filled)
                    </Typography>
                    <input
                      type="text"
                      value={formData.schoolName}
                      onChange={(e) =>
                        setFormData({ ...formData, schoolName: e.target.value })
                      }
                      placeholder="Will auto-populate"
                      className="w-full px-3 py-2 border border-border-medium rounded-lg surface-subtle text-text-muted"
                      disabled
                    />
                  </div>
                  <div className="md:col-span-2 flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="requestTeamLink"
                      checked={formData.requestTeamLink}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          requestTeamLink: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-text-info surface-subtle border-border-medium rounded-lg focus-ring"
                    />
                    <label htmlFor="requestTeamLink" className="text-sm">
                      Request to be linked to this team (Head Coach will
                      approve)
                    </label>
                  </div>
                </div>
              )}

              {!formData.hasSchoolCode && (
                <div className="p-4 surface-subtle dark:bg-surface-secondary rounded-lg">
                  <Typography variant="body-sm" color="muted">
                    No problem! You can always join teams later from your coach
                    dashboard. Your personal playbooks and content will be ready
                    to import when you do.
                  </Typography>
                </div>
              )}
            </div>
          </div>
        );

      case "payment":
        return (
          <div>
            <Typography variant="headline-lg" className="mb-2">
              Complete Your Purchase
            </Typography>
            <Typography variant="body-md" color="muted" className="mb-6">
              One-time payment for lifetime coach account access.
            </Typography>

            {/* Payment System Coming Soon Notice */}
            <div className="surface-subtle dark:bg-surface-warning/20 border border-subtle dark:border-text-warning rounded-lg p-4 mb-6">
              <div className="flex items-start gap-2">
                <Icon
                  name="warning"
                  size="sm"
                  color="warning"
                  className="mt-0.5"
                />
                <div>
                  <Typography
                    variant="body-sm"
                    className="font-medium text-text-warning dark:text-text-warning mb-1"
                  >
                    Payment System Coming Soon
                  </Typography>
                  <Typography variant="body-sm" color="muted">
                    We're still setting up our payment processing. For now, all
                    coach accounts get full access during our beta period.
                  </Typography>
                </div>
              </div>
            </div>

            {isSuperAdmin && (
              <div className="bg-surface-jade dark:bg-surface-jade-dark border border-surface-jade-dark dark:border-brand-jade-dark rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 text-brand-jade-dark dark:text-brand-jade-light">
                  <Icon name="unlock" size="sm" />
                  <Typography variant="body-sm" className="font-medium">
                    Super Admin: Payment bypassed - coach account access granted
                  </Typography>
                </div>
              </div>
            )}

            {/* Coach Account Package */}
            <div className="border-2 border-component-badge-primary rounded-lg p-6 surface-subtle dark:bg-surface-info/10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Typography variant="headline-lg" className="mb-2">
                    Coach Account
                  </Typography>
                  <Typography variant="body-md" color="muted">
                    Personal coaching toolkit and playbook system
                  </Typography>
                </div>
                <Typography variant="headline-xl" className="text-text-info">
                  $9.99
                </Typography>
              </div>

              <div className="border-t pt-4">
                <Typography variant="body-sm" className="font-medium mb-2">
                  What you get:
                </Typography>
                <ul className="grid-form gap-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Icon name="check" size="xs" color="success" />
                    Personal playbook library
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="check" size="xs" color="success" />
                    Practice planning tools
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="check" size="xs" color="success" />
                    Game planning features
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="check" size="xs" color="success" />
                    Analytics dashboard
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="check" size="xs" color="success" />
                    Team integration ready
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="check" size="xs" color="success" />
                    Lifetime access
                  </li>
                </ul>
              </div>
            </div>
          </div>
        );

      case "complete":
        return (
          <div className="text-center">
            <Icon
              name="check-circle"
              size="xl"
              color="success"
              className="mx-auto mb-6"
            />
            <Typography variant="headline-xl" className="mb-4">
              Coach Account Created!
            </Typography>
            <Typography
              variant="body-lg"
              color="muted"
              className="mb-8 container-content"
            >
              Welcome to BoxCall, Coach {formData.firstName}! Your personal
              coaching account is ready to use. Start building your playbooks
              and planning your practices.
            </Typography>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => navigate(ROUTES.DASHBOARD)}
                variant="primary"
                size="sm"
              >
                Go to Coach Dashboard
              </Button>
              <Button
                onClick={() => navigate(ROUTES.PLAYBOOK)}
                variant="ghost"
                size="sm"
              >
                Start Building Playbooks
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
      <div className="content-medium">
        {/* Progress Bar */}
        {currentStep !== "intro" && currentStep !== "complete" && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <Typography variant="body-sm" color="muted">
                Step {currentStepIndex + 1} of {steps.length}
              </Typography>
              <Typography variant="body-sm" color="muted">
                {Math.round(progress)}% Complete
              </Typography>
            </div>
            <div className="w-full surface-subtle rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${progress}%`,
                  backgroundColor: "var(--component-button-primary-bg)",
                }}
              />
            </div>
            <Typography variant="body-sm" className="mt-2 font-medium">
              {steps[currentStepIndex]?.title}
            </Typography>
          </div>
        )}

        {/* Step Content */}
        <div className="surface-card elevation-card border-subtle rounded-lg p-8 mb-6">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        {currentStep !== "intro" && currentStep !== "complete" && (
          <div className="flex justify-between">
            <Button
              onClick={handlePrevious}
              disabled={currentStepIndex === 0}
              variant="ghost"
              size="sm"
              icon={<Icon name="chevron-left" size="sm" />}
            >
              Previous
            </Button>
            {currentStep === "payment" ? (
              <Button
                onClick={handleSubmit}
                variant="primary"
                size="sm"
                icon={<Icon name="check" size="sm" />}
                iconPosition="right"
              >
                Create Coach Account
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                variant="primary"
                size="sm"
                icon={<Icon name="chevron-right" size="sm" />}
                iconPosition="right"
              >
                Next
              </Button>
            )}
          </div>
        )}

        {currentStep === "intro" && (
          <div className="text-center">
            <Button onClick={handleNext} variant="primary" size="md">
              Get Started
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
