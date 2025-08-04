import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../app/auth-store";
import { usePermissions } from "../hooks/usePermissions";
import { Typography } from "../components/design-system";
import { Icon } from "../components/ui/Icon/Icon";

/**
 * Create Team Page
 *
 * Multi-step team creation process with proper role assignment,
 * contact information, and school verification.
 *
 * Features:
 * - Step-by-step team creation wizard
 * - Role assignment (Team Owner vs Head Coach)
 * - Contact information collection
 * - School verification system
 * - Payment integration (future)
 * - Super admin bypass for testing
 */

interface TeamFormData {
  // Basic Team Info
  teamName: string; // Now stores mascot name (e.g., "Eagles")
  sport: string;
  season: string; // Auto-set to current school year (2024-2025)

  // School Information (moved from team-info step)
  schoolName: string;
  schoolDistrict: string;
  schoolAddress: string;
  schoolCity: string;
  schoolState: string;
  schoolZip: string;

  // Team Owner Information
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerRole: string; // Athletic Director, Principal, Head Coach, etc.

  // Head Coach Information (if different from owner)
  coachName: string;
  coachEmail: string;
  coachPhone: string;

  // Fallback/Emergency Contact
  fallbackName: string;
  fallbackEmail: string;
  fallbackPhone: string;
  fallbackRole: string; // Assistant Coach, Team Manager, etc.

  // Team Details
  expectedPlayerCount: number;
  coachingStaffCount: number;

  // Payment (Future)
  subscriptionTier: string;
  paymentMethod: string;
}

type CreationStep =
  | "intro"
  | "team-info"
  | "school-info"
  | "owner-info"
  | "coach-info"
  | "fallback-info"
  | "team-details"
  | "payment"
  | "review"
  | "complete";

export const CreateTeam: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isSuperAdmin, canCreateTeamUnlimited } = usePermissions();

  const [currentStep, setCurrentStep] = useState<CreationStep>("intro");
  const [formData, setFormData] = useState<TeamFormData>({
    teamName: "", // Mascot name (e.g., "Eagles")
    sport: "Football",
    season: "2024-2025", // Auto-set to current school year
    schoolName: "",
    schoolDistrict: "",
    schoolAddress: "",
    schoolCity: "",
    schoolState: "",
    schoolZip: "",
    ownerName: "",
    ownerEmail: user?.email || "",
    ownerPhone: "",
    ownerRole: "Head Coach",
    coachName: "",
    coachEmail: "",
    coachPhone: "",
    fallbackName: "",
    fallbackEmail: "",
    fallbackPhone: "",
    fallbackRole: "Assistant Coach",
    expectedPlayerCount: 25,
    coachingStaffCount: 3,
    subscriptionTier: "team-basic",
    paymentMethod: "",
  });

  // Check if user has permission to create teams
  if (!canCreateTeamUnlimited && !isSuperAdmin) {
    return (
      <div className="py-12">
        <div className="max-w-2xl mx-auto text-center">
          <Icon name="lock" size="xl" color="error" className="mx-auto mb-4" />
          <Typography variant="headline-lg" className="mb-4">
            Team Creation Not Available
          </Typography>
          <Typography variant="body-lg" color="muted" className="mb-6">
            You don't have permission to create teams. Please contact your
            administrator or join an existing team instead.
          </Typography>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate("/join-team")}
              className="bg-jade-500 hover:bg-jade-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Join Existing Team
            </button>
            <button
              onClick={() => navigate("/")}
              className="border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const steps: { id: CreationStep; title: string; description: string }[] = [
    {
      id: "intro",
      title: "Welcome",
      description: "Let's get your team set up",
    },
    {
      id: "team-info",
      title: "Team Information",
      description: "School and team details",
    },
    {
      id: "school-info",
      title: "School Details",
      description: "Address and contact information",
    },
    {
      id: "owner-info",
      title: "Team Owner",
      description: "Person responsible for the account",
    },
    {
      id: "coach-info",
      title: "Head Coach",
      description: "Primary coaching contact",
    },
    {
      id: "fallback-info",
      title: "Emergency Contact",
      description: "Backup contact information",
    },
    {
      id: "team-details",
      title: "Team Size",
      description: "Expected team composition",
    },
    { id: "payment", title: "Subscription", description: "Choose your plan" },
    { id: "review", title: "Review", description: "Confirm your information" },
    {
      id: "complete",
      title: "Complete",
      description: "Team creation successful",
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
    // TODO: Implement actual team creation logic
    console.log("🎯 Creating team with data:", formData);

    if (isSuperAdmin) {
      console.log("🔓 Super admin team creation - bypassing payment");
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
            <Icon
              name="boxcall"
              size="3xl"
              color="jade"
              className="mx-auto mb-6"
            />
            <Typography variant="headline-xl" className="mb-4">
              Create Your Team
            </Typography>
            <Typography
              variant="body-lg"
              color="muted"
              className="mb-8 max-w-2xl mx-auto"
            >
              Welcome to BoxCall! We'll help you set up your team in just a few
              steps. This process takes about 5 minutes and will get your team
              ready to use all of BoxCall's features.
            </Typography>
            {isSuperAdmin && (
              <div className="bg-jade-50 dark:bg-jade-900/20 border border-jade-200 dark:border-jade-800 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 text-jade-700 dark:text-jade-300">
                  <Icon name="unlock" size="sm" />
                  <Typography variant="body-sm" className="font-medium">
                    Super Admin Mode: Unlimited team creation access
                  </Typography>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4">
                <Icon
                  name="users"
                  size="lg"
                  color="jade"
                  className="mx-auto mb-2"
                />
                <Typography variant="body-md" className="font-medium mb-1">
                  Team Management
                </Typography>
                <Typography variant="body-sm" color="muted">
                  Manage players, coaches, and staff
                </Typography>
              </div>
              <div className="text-center p-4">
                <Icon
                  name="calendar"
                  size="lg"
                  color="jade"
                  className="mx-auto mb-2"
                />
                <Typography variant="body-md" className="font-medium mb-1">
                  Schedule & Planning
                </Typography>
                <Typography variant="body-sm" color="muted">
                  Practices, games, and events
                </Typography>
              </div>
              <div className="text-center p-4">
                <Icon
                  name="trophy"
                  size="lg"
                  color="jade"
                  className="mx-auto mb-2"
                />
                <Typography variant="body-md" className="font-medium mb-1">
                  Performance Tracking
                </Typography>
                <Typography variant="body-sm" color="muted">
                  Stats, achievements, and progress
                </Typography>
              </div>
            </div>
          </div>
        );

      case "team-info":
        return (
          <div>
            <Typography variant="headline-lg" className="mb-6">
              Team Information
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  School Name *
                </label>
                <input
                  type="text"
                  value={formData.schoolName}
                  onChange={(e) =>
                    setFormData({ ...formData, schoolName: e.target.value })
                  }
                  placeholder="e.g., Burke Catholic High School"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jade-500 focus:border-jade-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Team Mascot *
                </label>
                <input
                  type="text"
                  value={formData.teamName}
                  onChange={(e) =>
                    setFormData({ ...formData, teamName: e.target.value })
                  }
                  placeholder="e.g., Eagles"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jade-500 focus:border-jade-500"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Sport *
                </label>
                <select
                  value={formData.sport}
                  onChange={(e) =>
                    setFormData({ ...formData, sport: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jade-500 focus:border-jade-500"
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
            </div>

            {/* Season automatically set - shows current school year */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-2">
                <Icon name="info" size="sm" color="info" className="mt-0.5" />
                <div>
                  <Typography
                    variant="body-sm"
                    className="font-medium text-blue-700 dark:text-blue-300 mb-1"
                  >
                    Season: 2024-2025 School Year
                  </Typography>
                  <Typography variant="body-sm" color="muted">
                    Teams are automatically assigned to the current school year.
                    This ensures continuity as players progress through the
                    program across multiple years.
                  </Typography>
                </div>
              </div>
            </div>
          </div>
        );

      case "school-info":
        return (
          <div>
            <Typography variant="headline-lg" className="mb-2">
              School Information
            </Typography>
            <Typography variant="body-md" color="muted" className="mb-6">
              This helps us verify your school and set up proper team
              identification.
            </Typography>

            {/* TODO: Implement school search/verification system */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-2">
                <Icon name="info" size="sm" color="info" className="mt-0.5" />
                <div>
                  <Typography
                    variant="body-sm"
                    className="font-medium text-blue-700 dark:text-blue-300 mb-1"
                  >
                    School Verification Coming Soon
                  </Typography>
                  <Typography variant="body-sm" color="muted">
                    We're working on integrating with school databases for
                    automatic verification. For now, please enter your school
                    information manually.
                  </Typography>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  School Name *
                </label>
                <input
                  type="text"
                  value={formData.schoolName}
                  onChange={(e) =>
                    setFormData({ ...formData, schoolName: e.target.value })
                  }
                  placeholder="e.g., Central High School"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jade-500 focus:border-jade-500"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  School District
                </label>
                <input
                  type="text"
                  value={formData.schoolDistrict}
                  onChange={(e) =>
                    setFormData({ ...formData, schoolDistrict: e.target.value })
                  }
                  placeholder="e.g., Central Independent School District"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jade-500 focus:border-jade-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  School Address *
                </label>
                <input
                  type="text"
                  value={formData.schoolAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, schoolAddress: e.target.value })
                  }
                  placeholder="e.g., 123 School Street"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jade-500 focus:border-jade-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">City *</label>
                <input
                  type="text"
                  value={formData.schoolCity}
                  onChange={(e) =>
                    setFormData({ ...formData, schoolCity: e.target.value })
                  }
                  placeholder="e.g., Austin"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jade-500 focus:border-jade-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  State *
                </label>
                <input
                  type="text"
                  value={formData.schoolState}
                  onChange={(e) =>
                    setFormData({ ...formData, schoolState: e.target.value })
                  }
                  placeholder="e.g., TX"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jade-500 focus:border-jade-500"
                  required
                />
              </div>
            </div>
          </div>
        );

      case "payment":
        return (
          <div>
            <Typography variant="headline-lg" className="mb-2">
              Choose Your Plan
            </Typography>
            <Typography variant="body-md" color="muted" className="mb-6">
              Get started with our exclusive Founders pricing for early
              adopters.
            </Typography>

            {/* TODO: Implement actual payment system */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
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
                    className="font-medium text-yellow-700 dark:text-yellow-300 mb-1"
                  >
                    Payment System Coming Soon
                  </Typography>
                  <Typography variant="body-sm" color="muted">
                    We're still setting up our payment processing. For now, all
                    teams get full access during our beta period.
                  </Typography>
                </div>
              </div>
            </div>

            {isSuperAdmin && (
              <div className="bg-jade-50 dark:bg-jade-900/20 border border-jade-200 dark:border-jade-800 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 text-jade-700 dark:text-jade-300">
                  <Icon name="unlock" size="sm" />
                  <Typography variant="body-sm" className="font-medium">
                    Super Admin: Payment bypassed - unlimited access granted
                  </Typography>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Founders Plan */}
              <div className="lg:col-span-2 border-2 border-jade-500 rounded-lg p-6 relative bg-jade-50 dark:bg-jade-900/10">
                <div className="absolute -top-3 left-6">
                  <span className="bg-jade-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Icon name="star" size="xs" className="text-white" />
                    Founders Price - Limited Time
                  </span>
                </div>

                <div className="mt-4">
                  <Typography variant="headline-xl" className="mb-2">
                    $199<span className="text-lg text-gray-500">/year</span>
                  </Typography>
                  <Typography
                    variant="body-md"
                    className="text-jade-700 dark:text-jade-300 font-medium mb-6"
                  >
                    Complete Team Management Solution
                  </Typography>

                  {/* Value Breakdown */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6">
                    <Typography variant="body-sm" className="font-medium mb-3">
                      What's Included (normally $279/year):
                    </Typography>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Icon name="check" size="xs" color="success" />
                          Full Team Management Platform
                        </span>
                        <span className="text-gray-500">$199</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Icon name="check" size="xs" color="success" />1 Sub
                          Team (JV/Freshmen)
                        </span>
                        <span className="text-green-600 font-medium">-$10</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Icon name="check" size="xs" color="success" />1 Head
                          Coach Code
                        </span>
                        <span className="text-green-600 font-medium">-$10</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Icon name="check" size="xs" color="success" />4 Free
                          Coach Codes
                        </span>
                        <span className="text-green-600 font-medium">-$40</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Icon name="check" size="xs" color="success" />2 Free
                          Manager Codes
                        </span>
                        <span className="text-green-600 font-medium">-$20</span>
                      </li>
                      <li className="border-t pt-2 mt-2 flex items-center justify-between font-medium">
                        <span className="text-jade-700 dark:text-jade-300">
                          Total Savings:
                        </span>
                        <span className="text-jade-600 font-bold">$80</span>
                      </li>
                    </ul>
                  </div>

                  {/* Core Features */}
                  <Typography variant="body-sm" className="font-medium mb-2">
                    Complete Platform Features:
                  </Typography>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Icon name="check" size="xs" color="success" />
                      Unlimited players & staff
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon name="check" size="xs" color="success" />
                      Advanced analytics & reports
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon name="check" size="xs" color="success" />
                      Complete playbook system
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon name="check" size="xs" color="success" />
                      Schedule & calendar management
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon name="check" size="xs" color="success" />
                      Team communication tools
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon name="check" size="xs" color="success" />
                      Priority support
                    </li>
                  </ul>
                </div>
              </div>

              {/* Coach Account Option */}
              <div className="border border-gray-200 rounded-lg p-6 bg-gray-50 dark:bg-gray-800">
                <Typography variant="headline-md" className="mb-4">
                  Not Ready to Create a Team?
                </Typography>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                  <Typography variant="body-md" className="font-medium mb-2">
                    Try our Coach Account
                  </Typography>
                  <Typography variant="headline-lg" className="mb-2">
                    $9.99<span className="text-sm text-gray-500">/month</span>
                  </Typography>
                  <Typography variant="body-sm" color="muted" className="mb-4">
                    Experience the full BoxCall App and playbook features
                  </Typography>

                  <Typography variant="body-sm" className="font-medium mb-2">
                    Including:
                  </Typography>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <Icon name="check" size="xs" color="info" />
                      Full playbook access
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon name="check" size="xs" color="info" />
                      Personal coach tools
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon name="check" size="xs" color="info" />
                      BoxCall features
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon name="check" size="xs" color="info" />
                      Practice planning
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon name="check" size="xs" color="info" />
                      Analytics dashboard
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => {
                    console.log("🏃‍♂️ Redirecting to Coach Account signup");
                    navigate("/create-coach-account");
                  }}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Get Coach Account
                </button>
              </div>
            </div>
          </div>
        );

      case "complete":
        return (
          <div className="text-center">
            <Icon
              name="check-circle"
              size="3xl"
              color="success"
              className="mx-auto mb-6"
            />
            <Typography variant="headline-xl" className="mb-4">
              Team Created Successfully!
            </Typography>
            <Typography
              variant="body-lg"
              color="muted"
              className="mb-8 max-w-2xl mx-auto"
            >
              Congratulations! Your team "{formData.schoolName}{" "}
              {formData.teamName}" has been created and is ready to use. You can
              now start inviting players and coaches to join your team.
            </Typography>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate(`/team/new-team-id/bulletin`)}
                className="bg-jade-500 hover:bg-jade-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Go to Team Dashboard
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Back to Dashboard
              </button>
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
      <div className="max-w-4xl mx-auto">
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
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-jade-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <Typography variant="body-sm" className="mt-2 font-medium">
              {steps[currentStepIndex]?.title}
            </Typography>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 mb-6">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        {currentStep !== "intro" && currentStep !== "complete" && (
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStepIndex === 0}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Icon name="chevron-left" size="sm" />
              Previous
            </button>

            {currentStep === "review" ? (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 bg-jade-500 hover:bg-jade-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Create Team
                <Icon name="check" size="sm" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 bg-jade-500 hover:bg-jade-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Next
                <Icon name="chevron-right" size="sm" />
              </button>
            )}
          </div>
        )}

        {currentStep === "intro" && (
          <div className="text-center">
            <button
              onClick={handleNext}
              className="bg-jade-500 hover:bg-jade-600 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Get Started
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
