import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../app/auth-store";
import { usePermissions } from "../hooks/usePermissions";
import { Typography } from "../components/design-system";
import { Icon } from "../components/ui/Icon/Icon";
import { Button } from "../components/ui/Button/Button";
import { supabase } from "../lib/supabase";
import { emitTelemetry } from "../lib/telemetry";

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
  teamName: string; // Mascot name (e.g., "Eagles")
  sport: string; // (UI only for now – not yet persisted until schema supports it)
  season: string; // Display string for academic year (e.g., "2025-2026")

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

// Helper: compute academic (school) year given current date.
// Academic year starts July 1 -> June 30 the following year.
function computeAcademicYear(date: Date = new Date()) {
  const month = date.getMonth(); // 0=Jan
  const startYear = month >= 6 ? date.getFullYear() : date.getFullYear() - 1; // July (6) or later => current year start
  const endYear = startYear + 1;
  return {
    startYear,
    endYear,
    display: `${startYear}-${endYear}`,
  };
}

export const CreateTeam: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isSuperAdmin } = usePermissions();
  // TEMPORARY: Universal access (any authenticated user) regardless of prior permission flags
  const universalAccess = true;

  const [currentStep, setCurrentStep] = useState<CreationStep>("intro");
  const initialAcademic = computeAcademicYear();
  const [formData, setFormData] = useState<TeamFormData>({
    teamName: "", // Mascot name (e.g., "Eagles")
    sport: "Football",
    season: initialAcademic.display, // Dynamic current academic year
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

  // If universal access is disabled in future, revert to permission gate above.

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdTeamId, setCreatedTeamId] = useState<string | null>(null);

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
    if (creating) return;
    setCreating(true);
    setCreateError(null);
    try {
      emitTelemetry("team.create.attempt", {
        universalAccess,
        super: isSuperAdmin,
      });
      // Minimal required fields for teams table
      const teamNameCombined =
        `${formData.schoolName.trim()} ${formData.teamName.trim()}`.trim();
      const { startYear: seasonYear, display: seasonDisplay } =
        computeAcademicYear();
      if (!user?.id) throw new Error("User not authenticated");
      // Attempt insert including created_by (needed on production schema). If column doesn't exist locally, fallback.
      const teamInsertRes = await supabase
        .from("teams")
        .insert({
          name: teamNameCombined || "New Team",
          school_name: formData.schoolName || null,
          mascot: formData.teamName || null,
          season_year: seasonYear,
          created_by: user.id, // Production schema requires this
        })
        .select("id")
        .single();
      let teamInsert = teamInsertRes.data;
      let teamErr = teamInsertRes.error;
      // Attempt to include sport if migration applied; silent ignore if column missing.
      if (!teamErr && formData.sport) {
        const { error: sportErr } = await supabase
          .from("teams")
          .update({ sport: formData.sport })
          .eq("id", teamInsert?.id || "")
          .select("id")
          .single();
        if (
          sportErr &&
          /column .*sport.* does not exist/i.test(sportErr.message)
        ) {
          emitTelemetry("team.create.sport_column_missing", {
            message: sportErr.message,
          });
        }
      }
      if (
        teamErr &&
        /created_by|column .* does not exist/i.test(teamErr.message)
      ) {
        // Retry without created_by for local dev schemas that haven't added the column
        emitTelemetry("team.create.retry_without_created_by", {
          reason: teamErr.message,
        });
        const retry = await supabase
          .from("teams")
          .insert({
            name: teamNameCombined || "New Team",
            school_name: formData.schoolName || null,
            mascot: formData.teamName || null,
            season_year: seasonYear,
          })
          .select("id")
          .single();
        teamInsert = retry.data;
        teamErr = retry.error;
      }
      if (teamErr || !teamInsert)
        throw teamErr || new Error("Team insert failed");
      const newTeamId = teamInsert.id as string;
      // Insert membership (coach by default)
      if (user?.id) {
        const { error: memberErr } = await supabase
          .from("team_members")
          .insert({
            team_id: newTeamId,
            user_id: user.id,
            role: "coach",
            status: "active",
          });
        if (memberErr) console.warn("team_members insert warning", memberErr);
      }
      // Persist active team selection
      try {
        localStorage.setItem("activeTeamId", newTeamId);
      } catch (_err) {
        /* ignore */
      }
      setCreatedTeamId(newTeamId);
      emitTelemetry("team.create.success", {
        teamId: newTeamId,
        season_year: seasonYear,
        season_display: seasonDisplay,
        sport_ui: formData.sport,
      });
      setCurrentStep("complete");
    } catch (e) {
      const msg = (e as Error).message;
      setCreateError(msg);
      emitTelemetry("team.create.error", { error: msg });
    } finally {
      setCreating(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "intro":
        return (
          <div className="text-center">
            <Icon
              name="users"
              size="xl"
              color="primary"
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
                  color="primary"
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
                  color="primary"
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
                  color="primary"
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
                    Season: {computeAcademicYear().display} School Year
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
                  <span className="bg-jade-500 text-text-inverse px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Icon name="star" size="xs" className="text-text-primary" />
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
                  <div className="surface-card elevation-card rounded-lg p-4 mb-6">
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

                <Button
                  onClick={() => {
                    console.log("🏃‍♂️ Redirecting to Coach Account signup");
                    navigate("/create-coach-account");
                  }}
                  fullWidth
                  variant="primary"
                  size="sm"
                >
                  Get Coach Account
                </Button>
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
              Team Created Successfully!
            </Typography>
            <Typography
              variant="body-lg"
              color="muted"
              className="mb-8 max-w-2xl mx-auto"
            >
              {createError
                ? "Team was created locally but an error occurred when finalizing setup. You can retry from dashboard."
                : `Congratulations! Your team "${formData.schoolName} ${formData.teamName}" has been created and is ready to use. You can now start inviting players and coaches.`}
            </Typography>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() =>
                  navigate(`/team/${createdTeamId || "unknown"}/bulletin`)
                }
                variant="primary"
                size="sm"
              >
                Go to Team Dashboard
              </Button>
              <Button
                onClick={() => navigate("/dashboard")}
                variant="ghost"
                size="sm"
              >
                Back to Dashboard
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

            {currentStep === "review" ? (
              <Button
                onClick={handleSubmit}
                disabled={creating}
                variant="primary"
                size="sm"
                icon={!creating ? <Icon name="check" size="sm" /> : undefined}
                iconPosition="right"
                loading={creating}
              >
                {creating ? "Creating..." : "Create Team"}
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

        {createError && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
            Error creating team: {createError}
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
