import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../app/auth-store";
import { Typography } from "../components/design-system";
import { Button } from "../components/ui/Button/Button";
import { Icon } from "../components/ui/Icon/Icon";
import { usePermissions } from "../hooks/usePermissions";
import { supabase } from "../lib/supabase";
import { emitTelemetry } from "../lib/telemetry";
import { PageLayout } from "../components/layout/PageLayout";
import { ROUTES, teamRoutes } from "../routes/paths";
import { createTeamSchema } from "../schemas/createTeamSchema";
import { TeamOnboardingWizard } from "../components/onboarding/TeamOnboardingWizard";
import { EnhancedInput, EnhancedSelect } from "../components/forms/EnhancedFormFields";

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
  const STORAGE_KEY = "boxcall:create-team-v1";
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
  const [showOnboarding, setShowOnboarding] = useState(false);

  const steps = useMemo(() => [
    {
      id: "intro" as const,
      title: "Welcome",
      description: "Let's get your team set up",
    },
    {
      id: "team-info" as const,
      title: "Team Information",
      description: "School and team details",
    },
    {
      id: "school-info" as const,
      title: "School Details",
      description: "Address and contact information",
    },
    {
      id: "owner-info" as const,
      title: "Team Owner",
      description: "Person responsible for the account",
    },
    {
      id: "coach-info" as const,
      title: "Head Coach",
      description: "Primary coaching contact",
    },
    {
      id: "fallback-info" as const,
      title: "Emergency Contact",
      description: "Backup contact information",
    },
    {
      id: "team-details" as const,
      title: "Team Size",
      description: "Expected team composition",
    },
    { id: "payment" as const, title: "Subscription", description: "Choose your plan" },
    { id: "review" as const, title: "Review", description: "Confirm your information" },
    {
      id: "complete" as const,
      title: "Complete",
      description: "Team creation successful",
    },
  ], []);

  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved?.formData) {
        setFormData((prev) => ({ ...prev, ...saved.formData }));
      }
      if (
        saved?.currentStep &&
        steps.some((step) => step.id === saved.currentStep)
      ) {
        setCurrentStep(saved.currentStep as CreationStep);
      }
    } catch (err) {
      console.warn("CreateTeam: failed to restore draft", err);
    }
  }, [steps]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ formData, currentStep })
      );
    } catch {
      /* ignore */
    }
  }, [formData, currentStep]);

  useEffect(() => {
    emitTelemetry("team.create.step", { step: currentStep });
  }, [currentStep]);

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
      const validation = createTeamSchema.safeParse(formData);
      if (!validation.success) {
        const message =
          validation.error.issues[0]?.message || "Please review the form.";
        setCreateError(message);
        emitTelemetry("team.create.validation_error", {
          message,
          issues: validation.error.issues,
        });
        return;
      }

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
      const { data: teamInsert, error: teamErr } = await supabase
        .from("teams")
        .insert({
          name: teamNameCombined || "New Team",
          school_name: formData.schoolName || null,
          mascot: formData.teamName || null,
          season_year: seasonYear,
        })
        .select("id")
        .single();
      if (teamErr || !teamInsert) {
        throw teamErr || new Error("Team insert failed");
      }
      const newTeamId = teamInsert.id as string;
      // Insert membership (coach by default)
      if (user?.id) {
        const { error: memberErr } = await supabase
          .from("team_members")
          .insert({
            team_id: newTeamId,
            user_id: user.id,
            team_role: "head_coach",
            status: "active",
          });
        if (memberErr) console.warn("team_members insert warning", memberErr);
      }
      // Persist active team selection
      try {
        localStorage.setItem("activeTeamId", newTeamId);
      } catch {
        /* ignore */
      }
      setCreatedTeamId(newTeamId);
      emitTelemetry("team.create.success", {
        teamId: newTeamId,
        season_year: seasonYear,
        season_display: seasonDisplay,
        sport_ui: formData.sport,
      });
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
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
            {/* Hero Section */}
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-jade-500 to-emerald-600 rounded-full flex items-center justify-center mb-6">
                <Icon name="trophy" size="xl" className="text-white" />
              </div>
              <Typography variant="headline-xl" className="mb-4 bg-gradient-to-r from-jade-600 to-emerald-600 bg-clip-text text-transparent">
                Let's Build Your Championship Team
              </Typography>
              <Typography
                variant="body-lg"
                color="muted"
                className="mb-6 max-w-2xl mx-auto leading-relaxed"
              >
                Welcome to BoxCall! We'll guide you through setting up your team in just a few steps. 
                This takes about <strong className="text-jade-600">5 minutes</strong> and gets your team ready for success.
              </Typography>
            </div>

            {/* Progress Indicator */}
            <div className="mb-8 flex items-center justify-center gap-2">
              <div className="flex items-center gap-1 px-3 py-1.5 bg-jade-50 dark:bg-jade-900/20 rounded-full border border-jade-200 dark:border-jade-800">
                <Icon name="clock" size="xs" className="text-jade-600" />
                <Typography variant="body-xs" className="text-jade-700 dark:text-jade-300 font-medium">
                  ~5 minutes
                </Typography>
              </div>
              <div className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-200 dark:border-blue-800">
                <Icon name="users" size="xs" className="text-blue-600" />
                <Typography variant="body-xs" className="text-blue-700 dark:text-blue-300 font-medium">
                  7 simple steps
                </Typography>
              </div>
            </div>

            {isSuperAdmin && (
              <div className="bg-jade-50 dark:bg-jade-900/20 border border-jade-200 dark:border-jade-800 rounded-lg p-4 mb-8">
                <div className="flex items-center justify-center gap-2 text-jade-700 dark:text-jade-300">
                  <Icon name="unlock" size="sm" />
                  <Typography variant="body-sm" className="font-medium">
                    Super Admin Mode: Unlimited team creation access
                  </Typography>
                </div>
              </div>
            )}

            {/* Feature Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="group p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon name="users" size="md" className="text-white" />
                </div>
                <Typography variant="body-md" className="font-semibold mb-2">
                  Team Management
                </Typography>
                <Typography variant="body-sm" color="muted">
                  Organize players, coaches, and staff with role-based permissions
                </Typography>
              </div>
              
              <div className="group p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 mx-auto bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon name="calendar" size="md" className="text-white" />
                </div>
                <Typography variant="body-md" className="font-semibold mb-2">
                  Smart Scheduling
                </Typography>
                <Typography variant="body-sm" color="muted">
                  Plan practices, games, and events with automated notifications
                </Typography>
              </div>
              
              <div className="group p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 mx-auto bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon name="trophy" size="md" className="text-white" />
                </div>
                <Typography variant="body-md" className="font-semibold mb-2">
                  Performance Insights
                </Typography>
                <Typography variant="body-sm" color="muted">
                  Track progress, achievements, and team analytics
                </Typography>
              </div>
            </div>

            {/* What's Next Preview */}
            <div className="bg-gradient-to-r from-jade-50 to-emerald-50 dark:from-jade-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-jade-200 dark:border-jade-800">
              <Typography variant="body-md" className="font-semibold mb-3 text-jade-800 dark:text-jade-200">
                Here's what we'll set up together:
              </Typography>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                <div className="flex items-center gap-2">
                  <Icon name="check" size="xs" className="text-jade-600" />
                  <Typography variant="body-sm" className="text-jade-700 dark:text-jade-300">
                    Team & school information
                  </Typography>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="check" size="xs" className="text-jade-600" />
                  <Typography variant="body-sm" className="text-jade-700 dark:text-jade-300">
                    Coaching staff contacts
                  </Typography>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="check" size="xs" className="text-jade-600" />
                  <Typography variant="body-sm" className="text-jade-700 dark:text-jade-300">
                    Emergency contacts
                  </Typography>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="check" size="xs" className="text-jade-600" />
                  <Typography variant="body-sm" className="text-jade-700 dark:text-jade-300">
                    Team size planning
                  </Typography>
                </div>
              </div>
            </div>
          </div>
        );

      case "team-info":
        return (
          <div>
            <div className="text-center mb-8">
              <div className="w-12 h-12 mx-auto bg-gradient-to-br from-jade-500 to-emerald-600 rounded-full flex items-center justify-center mb-4">
                <Icon name="users" size="md" className="text-white" />
              </div>
              <Typography variant="headline-lg" className="mb-2">
                Tell Us About Your Team
              </Typography>
              <Typography variant="body-md" color="muted">
                Basic information to get your team set up in BoxCall
              </Typography>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EnhancedInput
                label="School Name"
                value={formData.schoolName}
                onChange={(value) => setFormData({ ...formData, schoolName: value })}
                placeholder="e.g., Burke Catholic High School"
                required
                helperText="The official name of your school or organization"
                validation={{
                  minLength: 2,
                  message: "School name must be at least 2 characters"
                }}
              />
              
              <EnhancedInput
                label="Team Mascot"
                value={formData.teamName}
                onChange={(value) => setFormData({ ...formData, teamName: value })}
                placeholder="e.g., Eagles, Warriors, Tigers"
                required
                helperText="Your team's mascot or nickname"
                validation={{
                  minLength: 2,
                  message: "Team name must be at least 2 characters"
                }}
              />
              
              <div className="md:col-span-2">
                <EnhancedSelect
                  label="Sport"
                  value={formData.sport}
                  onChange={(value) => setFormData({ ...formData, sport: value })}
                  required
                  helperText="Select the primary sport for this team"
                  options={[
                    { value: "Football", label: "Football" },
                    { value: "Basketball", label: "Basketball" },
                    { value: "Baseball", label: "Baseball" },
                    { value: "Soccer", label: "Soccer" },
                    { value: "Track & Field", label: "Track & Field" },
                    { value: "Wrestling", label: "Wrestling" },
                    { value: "Volleyball", label: "Volleyball" },
                    { value: "Cross Country", label: "Cross Country" },
                    { value: "Swimming", label: "Swimming" },
                    { value: "Tennis", label: "Tennis" },
                    { value: "Golf", label: "Golf" },
                    { value: "Lacrosse", label: "Lacrosse" },
                    { value: "Field Hockey", label: "Field Hockey" },
                    { value: "Softball", label: "Softball" },
                    { value: "Other", label: "Other" }
                  ]}
                />
              </div>
            </div>

            {/* Season automatically set - shows current school year */}
            <div className="mt-6 p-4 surface-subtle dark:bg-surface-info/20 border border-subtle dark:border-text-info rounded-lg">
              <div className="flex items-start gap-2">
                <Icon name="info" size="sm" color="info" className="mt-0.5" />
                <div>
                  <Typography
                    variant="body-sm"
                    className="font-medium text-text-info dark:text-text-info mb-1"
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
            <div className="surface-subtle dark:bg-surface-info/20 border border-subtle dark:border-text-info rounded-lg p-4 mb-6">
              <div className="flex items-start gap-2">
                <Icon name="info" size="sm" color="info" className="mt-0.5" />
                <div>
                  <Typography
                    variant="body-sm"
                    className="font-medium text-text-info dark:text-text-info mb-1"
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
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-medium mb-2"
                >
                  School Name *
                </Typography>
                <input
                  type="text"
                  value={formData.schoolName}
                  onChange={(e) =>
                    setFormData({ ...formData, schoolName: e.target.value })
                  }
                  placeholder="e.g., Central High School"
                  className="w-full px-3 py-2 border border-border-medium rounded-lg focus:ring-2 focus:ring-jade-500 focus:border-jade-500"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-medium mb-2"
                >
                  School District
                </Typography>
                <input
                  type="text"
                  value={formData.schoolDistrict}
                  onChange={(e) =>
                    setFormData({ ...formData, schoolDistrict: e.target.value })
                  }
                  placeholder="e.g., Central Independent School District"
                  className="w-full px-3 py-2 border border-border-medium rounded-lg focus:ring-2 focus:ring-jade-500 focus:border-jade-500"
                />
              </div>
              <div className="md:col-span-2">
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-medium mb-2"
                >
                  School Address *
                </Typography>
                <input
                  type="text"
                  value={formData.schoolAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, schoolAddress: e.target.value })
                  }
                  placeholder="e.g., 123 School Street"
                  className="w-full px-3 py-2 border border-border-medium rounded-lg focus:ring-2 focus:ring-jade-500 focus:border-jade-500"
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
                  value={formData.schoolCity}
                  onChange={(e) =>
                    setFormData({ ...formData, schoolCity: e.target.value })
                  }
                  placeholder="e.g., Austin"
                  className="w-full px-3 py-2 border border-border-medium rounded-lg focus:ring-2 focus:ring-jade-500 focus:border-jade-500"
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
                  value={formData.schoolState}
                  onChange={(e) =>
                    setFormData({ ...formData, schoolState: e.target.value })
                  }
                  placeholder="e.g., TX"
                  className="w-full px-3 py-2 border border-border-medium rounded-lg focus:ring-2 focus:ring-jade-500 focus:border-jade-500"
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
                    teams get full access during our beta period.
                  </Typography>
                </div>
              </div>
            </div>

            {isSuperAdmin && (
              <div className="surface-subtle dark:bg-surface-success/20 border border-subtle dark:border-text-success rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 text-text-success dark:text-text-success">
                  <Icon name="unlock" size="sm" />
                  <Typography variant="body-sm" className="font-medium">
                    Super Admin: Payment bypassed - unlimited access granted
                  </Typography>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Founders Plan */}
              <div className="lg:col-span-2 border-2 border-jade-500 rounded-lg p-6 relative surface-subtle dark:bg-jade-900/10">
                <div className="absolute -top-3 left-6">
                  <Typography
                    variant="body-sm"
                    as="span"
                    className="surface-subtle0 text-text-inverse px-4 py-1 rounded-full font-medium flex items-center gap-1"
                  >
                    <Icon name="star" size="xs" className="text-text-primary" />
                    Founders Price - Limited Time
                  </Typography>
                </div>

                <div className="mt-4">
                  <Typography variant="headline-xl" className="mb-2">
                    $199<span className="text-lg text-text-muted">/year</span>
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
                        <span className="text-text-muted">$199</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Icon name="check" size="xs" color="success" />1 Sub
                          Team (JV/Freshmen)
                        </span>
                        <span className="text-text-success font-medium">
                          -$10
                        </span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Icon name="check" size="xs" color="success" />1 Head
                          Coach Code
                        </span>
                        <span className="text-text-success font-medium">
                          -$10
                        </span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Icon name="check" size="xs" color="success" />4 Free
                          Coach Codes
                        </span>
                        <span className="text-text-success font-medium">
                          -$40
                        </span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Icon name="check" size="xs" color="success" />2 Free
                          Manager Codes
                        </span>
                        <span className="text-text-success font-medium">
                          -$20
                        </span>
                      </li>
                      <li className="border-t pt-2 mt-2 flex items-center justify-between font-medium">
                        <span className="text-text-success dark:text-text-success">
                          Total Savings:
                        </span>
                        <span className="text-text-success font-bold">$80</span>
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
              <div className="border border-subtle rounded-lg p-6 surface-subtle dark:bg-surface-secondary">
                <Typography variant="headline-md" className="mb-4">
                  Not Ready to Create a Team?
                </Typography>

                <div className="surface-subtle dark:bg-surface-info/20 border border-subtle dark:border-border-info rounded-lg p-4 mb-4">
                  <Typography variant="body-md" className="font-medium mb-2">
                    Try our Coach Account
                  </Typography>
                  <Typography variant="headline-lg" className="mb-2">
                    $9.99<span className="text-sm text-text-muted">/month</span>
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
                    console.info("🏃‍♂️ Redirecting to Coach Account signup");
                    navigate(ROUTES.CREATE_COACH_ACCOUNT);
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
                : `Congratulations! Your team "${formData.schoolName} ${formData.teamName}" has been created and is ready to use.`}
            </Typography>
            <div className="flex flex-col gap-4">
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => setShowOnboarding(true)}
                  variant="primary"
                  size="md"
                  icon={<Icon name="play" size="sm" />}
                  iconPosition="right"
                >
                  Complete Team Setup
                </Button>
                <Button
                  onClick={() =>
                    navigate(
                      teamRoutes.bulletin(String(createdTeamId || "unknown"))
                    )
                  }
                  variant="ghost"
                  size="md"
                >
                  Skip to Dashboard
                </Button>
              </div>
              <Typography variant="body-sm" color="muted" className="mt-2">
                🎯 Recommended: Take 5 minutes to set up your team for success
              </Typography>
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

  // Show onboarding wizard after team creation
  if (showOnboarding && createdTeamId) {
    return (
      <TeamOnboardingWizard
        teamId={createdTeamId}
        teamName={formData.teamName}
        schoolName={formData.schoolName}
        onComplete={() => {
          setShowOnboarding(false);
          navigate(teamRoutes.bulletin(createdTeamId));
        }}
        onSkip={() => {
          setShowOnboarding(false);
          navigate(teamRoutes.bulletin(createdTeamId));
        }}
      />
    );
  }

  return (
    <PageLayout title="Create Team" variant="form">
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
            <div className="w-full surface-subtle rounded-full h-2">
              <div
                className="surface-subtle0 h-2 rounded-full transition-all duration-300"
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
          <div className="mt-4 p-4 surface-subtle dark:bg-surface-error/20 border border-subtle dark:border-border-error rounded-lg text-sm text-text-error">
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
    </PageLayout>
  );
};
