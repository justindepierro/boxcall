import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../app/auth-store";
import { Typography } from "../components/design-system";
import { Button } from "../components/ui/Button/Button";
import { Icon } from "../components/ui/Icon/Icon";
import { usePermissions } from "../hooks/usePermissions";
import { useRoles } from "../hooks/useRoles";
import { supabase } from "../lib/supabase";
import { emitTelemetry } from "../lib/telemetry";
import { PageLayout } from "../components/layout/PageLayout";
import { ROUTES, teamRoutes } from "../routes/paths";
import { createTeamSchema } from "../schemas/createTeamSchema";
import { TeamOnboardingWizard } from "../components/onboarding/TeamOnboardingWizard";
import { TeamWelcomeModal } from "../components/onboarding/TeamWelcomeModal";
import {
  EnhancedInput,
  EnhancedSelect,
} from "../components/forms/EnhancedFormFields";
import { AddressAutocomplete } from "../components/forms/AddressAutocomplete";

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

// Define steps outside component to prevent recreation on each render
const TEAM_CREATION_STEPS = [
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
  {
    id: "payment" as const,
    title: "Subscription",
    description: "Choose your plan",
  },
  {
    id: "review" as const,
    title: "Review",
    description: "Confirm your information",
  },
  {
    id: "complete" as const,
    title: "Complete",
    description: "Team creation successful",
  },
] as const;

export const CreateTeam: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isSuperAdmin } = usePermissions();
  const { refreshRoles } = useRoles();
  const STORAGE_KEY = "boxcall:create-team-v1";
  // TEMPORARY: Universal access (any authenticated user) regardless of prior permission flags
  const universalAccess = true;

  const [currentStep, setCurrentStep] = useState<CreationStep>("intro");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Creating team...");
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
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

  const [createError, setCreateError] = useState<string | null>(null);
  const [createdTeamId, setCreatedTeamId] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const steps = TEAM_CREATION_STEPS;

  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const saved = JSON.parse(raw);
      if (!saved?.formData && !saved?.currentStep) return;

      // Check if this is meaningful progress (not just intro step)
      const hasProgress = saved.currentStep && saved.currentStep !== "intro";
      const hasFormData =
        saved.formData &&
        Object.values(saved.formData).some(
          (value) => value && String(value).trim() !== ""
        );

      if (hasProgress || hasFormData) {
        setHasSavedDraft(true);
        setShowResumePrompt(true);

        // Show a brief notification about saved progress
        console.log("📋 Found saved team creation progress!");

        // Auto-restore if user was past intro step
        if (hasProgress) {
          if (saved.formData) {
            setFormData((prev) => ({ ...prev, ...saved.formData }));
          }
          if (steps.some((step) => step.id === saved.currentStep)) {
            setCurrentStep(saved.currentStep as CreationStep);
          }
          setShowResumePrompt(false); // Don't show prompt if auto-restoring
        }
      }
    } catch (err) {
      console.warn("CreateTeam: failed to restore draft", err);
    }
  }, [steps]); // Steps is now a stable reference to TEAM_CREATION_STEPS constant

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

  // Pre-populate owner info with current user data
  useEffect(() => {
    if (user && !formData.ownerName && !formData.ownerEmail) {
      setFormData((prev) => ({
        ...prev,
        ownerName: user.user_metadata?.full_name || "",
        ownerEmail: user.email || "",
      }));
    }
  }, [user, formData.ownerName, formData.ownerEmail]);

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case "intro":
        return true; // No validation needed
      case "team-info":
        return !!(formData.teamName && formData.sport && formData.season);
      case "school-info":
        return !!(
          formData.schoolName &&
          formData.schoolAddress &&
          formData.schoolCity &&
          formData.schoolState &&
          formData.schoolZip
        );
      case "owner-info":
        return !!(
          formData.ownerName &&
          formData.ownerEmail &&
          formData.ownerPhone &&
          formData.ownerRole
        );
      case "coach-info":
        return !!(
          formData.coachName &&
          formData.coachEmail &&
          formData.coachPhone
        );
      case "fallback-info":
        return !!(
          formData.fallbackName &&
          formData.fallbackEmail &&
          formData.fallbackPhone &&
          formData.fallbackRole
        );
      case "team-details":
        return (
          formData.expectedPlayerCount > 0 && formData.coachingStaffCount > 0
        );
      case "payment":
        return true; // No validation needed for now
      case "review":
        return true; // Final validation happens in handleSubmit
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (!validateCurrentStep()) {
      return; // Don't proceed if validation fails
    }

    if (currentStep === "review") {
      // Create the team
      setIsLoading(true);
      setCreateError(null);
      setLoadingMessage("Creating team...");

      try {
        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(
            () => {
              console.error(
                "🕐 Team creation timeout reached after 60 seconds"
              );
              reject(
                new Error(
                  "Team creation is taking longer than expected. This might be a database connectivity issue. Please check your internet connection and try again."
                )
              );
            },
            60000 // Increased to 60 seconds
          )
        );

        console.log(
          "🏁 Starting Promise.race with createTeam() and timeout..."
        );
        const raceStart = performance.now();
        const team = (await Promise.race([createTeam(), timeoutPromise])) as {
          id: string;
          name: string;
        };
        console.log(
          `🏆 Promise.race completed in ${performance.now() - raceStart}ms`
        );

        setCreatedTeamId(team.id);

        // Refresh roles to include the new team membership
        console.log("🔄 Refreshing user roles after team creation...");
        await refreshRoles();
        console.log("✅ Roles refreshed successfully");

        // Show the completion step instead of immediately navigating
        setCurrentStep("complete");
      } catch (error) {
        console.error("Failed to create team:", error);
        const message =
          error instanceof Error ? error.message : "Failed to create team";

        // Add helpful debugging info
        if (message.includes("taking longer than expected")) {
          setCreateError(
            `${message}\n\nDebugging tips:\n1. Check your internet connection\n2. Try again in a few moments\n3. Open browser console (F12) for detailed logs\n4. Run 'testDatabaseConnection()' in console for diagnostics`
          );
        } else {
          setCreateError(message);
        }
      } finally {
        setIsLoading(false);
        setLoadingMessage("Creating team...");
      }
      return;
    }

    const currentIndex = steps.findIndex((step) => step.id === currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id);
    }
  };

  const createTeam = async () => {
    console.log("🚀 Starting team creation...");
    const startTime = performance.now();

    // First, ensure user is properly authenticated
    console.log("🔐 Verifying authentication...");
    setLoadingMessage("Verifying your account...");

    // Get fresh session from Supabase with timeout
    console.log("🔍 Getting Supabase session...");

    let session, sessionError, authUser;

    try {
      // Add timeout to session call since it's hanging
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Session timeout")), 10000)
      );

      const sessionResult = (await Promise.race([
        sessionPromise,
        timeoutPromise,
      ])) as { data: { session: any }; error: any };
      session = sessionResult.data?.session;
      sessionError = sessionResult.error;

      console.log("📋 Session result:", {
        hasSession: !!session,
        error: sessionError,
      });
    } catch (timeoutError) {
      console.warn(
        "⚠️ Session call timed out, trying alternative auth method:",
        timeoutError
      );

      // Fallback to using the user from auth store
      if (!user?.id) {
        throw new Error(
          "Authentication required: Session timeout and no user available. Please refresh the page and try again."
        );
      }

      console.log("🔄 Using fallback user from auth store:", user.id);
      authUser = user;
    }

    if (!authUser) {
      if (sessionError || !session) {
        console.error("❌ No valid session:", sessionError);
        throw new Error(
          "Authentication required: Please sign out and sign back in to create a team."
        );
      }

      authUser = session.user;
      if (!authUser?.id) {
        throw new Error("User authentication failed: No user ID found.");
      }
    }

    console.log("✅ User authenticated:", {
      userId: authUser.id,
      email: authUser.email || "Not available",
      authMethod: session ? "session" : "fallback",
    });

    // Validate form data
    console.log("📋 Validating form data...");
    setLoadingMessage("Validating team information...");
    const validationStart = performance.now();
    const validation = createTeamSchema.safeParse(formData);
    console.log(
      `✅ Validation completed in ${performance.now() - validationStart}ms`
    );
    console.log("📊 Validation result:", {
      success: validation.success,
      data: validation.data,
    });

    if (!validation.success) {
      console.error("❌ Validation failed:", validation.error.issues);
      const message =
        validation.error.issues[0]?.message || "Please review the form.";
      emitTelemetry("team.create.validation_error", {
        message,
        issues: validation.error.issues,
      });
      throw new Error(message);
    }

    console.log("🎯 Starting telemetry...");
    emitTelemetry("team.create.attempt", {
      universalAccess,
      super: isSuperAdmin,
    });
    console.log("✅ Telemetry completed");

    // Test database connectivity (read-only test)
    console.log("🔌 Testing database connectivity...");
    setLoadingMessage("Connecting to database...");
    try {
      console.log("🔍 Attempting database select test...");

      // Add timeout to database operation since it might hang too
      const dbPromise = supabase.from("teams").select("id").limit(1);

      const dbTimeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Database select timeout")), 15000)
      );

      const dbResult = (await Promise.race([dbPromise, dbTimeoutPromise])) as {
        error: any;
      };
      const connectTest = dbResult.error;

      console.log("📊 Database select result:", { error: connectTest });

      if (connectTest) {
        console.error("❌ Database connectivity test failed:", connectTest);
        throw new Error(`Database connection failed: ${connectTest.message}`);
      }
      console.log("✅ Database connectivity confirmed");
    } catch (dbError) {
      console.error("❌ Database connectivity error:", dbError);

      // If it's a timeout, we might still be able to proceed
      if (
        dbError instanceof Error &&
        dbError.message === "Database select timeout"
      ) {
        console.warn(
          "⚠️ Database select timed out, but proceeding with team creation anyway..."
        );
        console.log("🔄 Skipping connectivity test due to timeout");
      } else {
        if (dbError instanceof Error) {
          throw dbError;
        }
        throw new Error(
          "Unable to connect to database. Please check your internet connection and try again."
        );
      }
    }

    // Create team name combining school and mascot
    console.log("🏷️ Creating team name...");
    const teamNameCombined =
      `${formData.schoolName.trim()} ${formData.teamName.trim()}`.trim();
    console.log("📝 Team name created:", teamNameCombined);

    console.log("📅 Computing academic year...");
    const { startYear: seasonYear, display: seasonDisplay } =
      computeAcademicYear();
    console.log("📅 Academic year computed:", { seasonYear, seasonDisplay });

    // Create the team record in Supabase
    console.log("🏗️ Creating team record in database...");
    setLoadingMessage("Creating your team...");

    const teamData = {
      name: teamNameCombined || "New Team",
      school_name: formData.schoolName || "Unknown School",
      mascot: formData.teamName || "Unknown",
      season_year: seasonYear,
    };
    console.log("📊 Team data to insert:", teamData);

    console.log("🚀 About to start team insert operation...");
    const dbStart = performance.now();

    // Test the fresh client first with isolated connection
    console.log("🧪 Testing fresh client with isolated connection...");

    // Log the exact URL and timing to help debug network issues
    console.log("🔗 Supabase URL:", import.meta.env.VITE_SUPABASE_URL);
    console.log("🕐 Starting network request at:", new Date().toISOString());

    try {
      // Create completely isolated client to test if this is an auth issue
      const { createClient } = await import("@supabase/supabase-js");
      const isolatedClient = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        {
          auth: {
            persistSession: false,
            detectSessionInUrl: false,
            autoRefreshToken: false,
          },
        }
      );

      console.log("🔍 Testing isolated client with simple count...");
      console.log(
        "📡 About to make network request - check Network tab in DevTools"
      );

      const countTimeout = new Promise((_, reject) =>
        setTimeout(() => {
          console.log("⏰ Count timeout after 5 seconds");
          reject(new Error("Isolated count timeout"));
        }, 5000)
      );

      const countPromise = isolatedClient
        .from("teams")
        .select("*", { count: "exact", head: true });
      console.log("🚀 Promise created, waiting for result...");

      const countResult = await Promise.race([countPromise, countTimeout]);
      console.log("✅ Isolated client count result:", countResult);
    } catch (testError) {
      console.error("❌ Isolated client test failed:", testError);
      console.log(
        "💡 Check the Network tab in DevTools to see if the request was made to Supabase"
      );
    }

    console.log("🚀 Starting team insert with direct HTTP API...");

    // Import and use direct HTTP approach to bypass Supabase client issues
    const { createTeamDirectly } = await import("../utils/direct-api");

    console.log("⏱️ Starting direct HTTP team creation...");
    const directInsertPromise = createTeamDirectly(teamData);

    const insertTimeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Team insert timeout")), 20000)
    );

    const insertResult = (await Promise.race([
      directInsertPromise,
      insertTimeoutPromise,
    ])) as { data: any; error: any };
    const teamInsert = insertResult.data;
    const teamErr = insertResult.error;

    const dbDuration = performance.now() - dbStart;
    console.log(`🗄️ Team insert completed in ${dbDuration}ms`);

    if (teamErr || !teamInsert) {
      console.error("❌ Team insert failed:", teamErr);

      // Check for specific database permission errors
      if (
        teamErr?.code === "42501" ||
        teamErr?.message?.includes("row-level security")
      ) {
        console.error("🔒 RLS Policy Error - Run the SQL fix in Supabase!");
        throw new Error(
          "Database permission error: Your account doesn't have permission to create teams. This might be an RLS policy issue. Please contact support."
        );
      }

      if (
        teamErr?.message?.includes("duplicate") ||
        teamErr?.code === "23505"
      ) {
        throw new Error(
          "A team with this name already exists. Please choose a different name."
        );
      }

      // Enhanced error reporting for debugging
      const errorDetails = {
        code: teamErr?.code,
        message: teamErr?.message,
        details: teamErr?.details,
        hint: teamErr?.hint,
      };
      console.error("📋 Detailed team insert error:", errorDetails);

      throw teamErr || new Error("Team insert failed - unknown database error");
    }

    const newTeamId = teamInsert.id as string;
    console.log(`✅ Team created with ID: ${newTeamId}`);

    // Insert membership (coach by default)
    console.log("👤 Adding team membership...");
    setLoadingMessage("Setting up your account...");
    const memberStart = performance.now();

    // Use direct HTTP approach for membership as well
    const { createTeamMembershipDirectly } = await import(
      "../utils/direct-api"
    );

    const membershipData = {
      team_id: newTeamId,
      user_id: authUser.id, // Use the authenticated user from session
      team_role: "head_coach",
      status: "active",
    };

    console.log("📊 Membership data to insert:", membershipData);

    // Add timeout to membership insertion using direct HTTP
    const memberInsertPromise = createTeamMembershipDirectly(membershipData);

    const memberTimeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Membership insert timeout")), 15000)
    );

    const memberResult = (await Promise.race([
      memberInsertPromise,
      memberTimeoutPromise,
    ])) as { data: any; error: any };
    const memberErr = memberResult.error;

    const memberDuration = performance.now() - memberStart;
    console.log(`👥 Membership insert completed in ${memberDuration}ms`);

    if (memberErr) {
      console.warn("⚠️ team_members insert warning:", memberErr);
      // Don't fail the entire operation for membership errors
    } else {
      console.log("✅ Team membership created successfully");
    }

    // Persist active team selection
    try {
      localStorage.setItem("activeTeamId", newTeamId);
    } catch {
      /* ignore localStorage errors */
    }

    // Emit success telemetry
    emitTelemetry("team.create.success", {
      teamId: newTeamId,
      season_year: seasonYear,
      season_display: seasonDisplay,
      sport_ui: formData.sport,
    });

    // Clear the form data from storage since team is created
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore localStorage errors */
    }

    const totalTime = performance.now() - startTime;
    console.log(`🎉 Team creation completed in ${totalTime}ms`);
    setLoadingMessage("Redirecting to your team...");

    return { id: newTeamId, name: teamNameCombined };
  };

  const handlePrevious = () => {
    const currentIndex = steps.findIndex((step) => step.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id);
    }
  };

  // Debug function to test database connectivity
  const testDatabaseConnection = async () => {
    console.log("🧪 Testing database connection...");
    try {
      const start = performance.now();

      // Test basic select
      const { data: selectTest, error: selectError } = await supabase
        .from("teams")
        .select("id")
        .limit(1);

      console.log(`📊 Select test: ${performance.now() - start}ms`, {
        data: selectTest,
        error: selectError,
      });

      // Test user auth and session
      const authStart = performance.now();
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      console.log(`👤 Auth test: ${performance.now() - authStart}ms`, {
        hasSession: !!session,
        sessionError,
        userId: authUser?.id,
        userEmail: authUser?.email,
        userRole: authUser?.role,
        authError,
      });

      // Test RLS policies by checking team_members (usually has better RLS setup)
      const { data: memberTest, error: memberError } = await supabase
        .from("team_members")
        .select("id")
        .limit(1);

      console.log("🔒 RLS policy test (team_members):", {
        data: memberTest,
        error: memberError,
      });

      console.log("✅ Database diagnostics complete");
      return {
        success: true,
        selectWorks: !selectError,
        authWorks: !authError && !!authUser,
        sessionValid: !sessionError && !!session,
        rlsTest: !memberError,
      };
    } catch (error) {
      console.error("❌ Database test failed:", error);
      return { success: false, error };
    }
  };

  // Add to window for manual testing
  if (typeof window !== "undefined") {
    (window as any).testDatabaseConnection = testDatabaseConnection;

    // Add helper to check current auth status
    (window as any).checkAuth = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      console.log("🔍 Current Auth Status:", {
        session: {
          exists: !!session,
          accessToken: session?.access_token ? "Present" : "Missing",
          user: session?.user?.id,
          error: sessionError,
        },
        user: {
          id: user?.id,
          email: user?.email,
          role: user?.role,
          error: userError,
        },
      });

      return { session, user, sessionError, userError };
    };

    // Add helper to attempt a simple team creation test
    (window as any).testTeamCreation = async () => {
      try {
        const testData = {
          name: "Test Team " + Date.now(),
          school_name: "Test School",
          mascot: "Test Mascot",
          season_year: new Date().getFullYear(),
        };

        console.log("🧪 Attempting test team creation...", testData);

        const { data, error } = await supabase
          .from("teams")
          .insert(testData)
          .select("id")
          .single();

        if (error) {
          console.error("❌ Test team creation failed:", error);
          return { success: false, error };
        }

        console.log("✅ Test team created successfully:", data);

        // Clean up the test team
        await supabase.from("teams").delete().eq("id", data.id);
        console.log("🧹 Test team cleaned up");

        return { success: true, data };
      } catch (error) {
        console.error("❌ Test team creation exception:", error);
        return { success: false, error };
      }
    };
  }

  const handleResumeDraft = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setShowResumePrompt(false);
        return;
      }

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

      setShowResumePrompt(false);
      console.log("✅ Resumed team creation from saved progress");
    } catch (err) {
      console.warn("Failed to resume draft:", err);
      setShowResumePrompt(false);
    }
  };

  const handleStartFresh = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      // Reset to initial state
      setFormData({
        teamName: "",
        sport: "Football",
        season: initialAcademic.display,
        schoolName: "",
        schoolDistrict: "",
        schoolAddress: "",
        schoolCity: "",
        schoolState: "",
        schoolZip: "",
        ownerName: "",
        ownerRole: "Head Coach",
        ownerEmail: user?.email || "",
        ownerPhone: "",
        coachName: "",
        coachEmail: "",
        coachPhone: "",
        fallbackName: "",
        fallbackRole: "Assistant Coach",
        fallbackEmail: "",
        fallbackPhone: "",
        expectedPlayerCount: 25,
        coachingStaffCount: 3,
        subscriptionTier: "team-basic",
        paymentMethod: "",
      });
      setCurrentStep("intro");
      setShowResumePrompt(false);
      setHasSavedDraft(false);
      console.log("🗑️ Started fresh team creation");
    } catch (err) {
      console.warn("Failed to clear draft:", err);
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
              <Typography
                variant="headline-xl"
                className="mb-4 bg-gradient-to-r from-jade-600 to-emerald-600 bg-clip-text text-transparent"
              >
                Let's Build Your Championship Team
              </Typography>
              <Typography
                variant="body-lg"
                color="muted"
                className="mb-6 max-w-2xl mx-auto leading-relaxed"
              >
                Welcome to BoxCall! We'll guide you through setting up your team
                in just a few steps. This takes about{" "}
                <strong className="text-jade-600">5 minutes</strong> and gets
                your team ready for success.
              </Typography>
            </div>

            {/* Progress Indicator */}
            <div className="mb-8 flex items-center justify-center gap-2">
              <div className="flex items-center gap-1 px-3 py-1.5 bg-jade-50 dark:bg-jade-900/20 rounded-full border border-jade-200 dark:border-jade-800">
                <Icon name="clock" size="xs" className="text-jade-600" />
                <Typography
                  variant="body-xs"
                  className="text-jade-700 dark:text-jade-300 font-medium"
                >
                  ~5 minutes
                </Typography>
              </div>
              <div className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-200 dark:border-blue-800">
                <Icon name="users" size="xs" className="text-blue-600" />
                <Typography
                  variant="body-xs"
                  className="text-blue-700 dark:text-blue-300 font-medium"
                >
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
                  Organize players, coaches, and staff with role-based
                  permissions
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
              <Typography
                variant="body-md"
                className="font-semibold mb-3 text-jade-800 dark:text-jade-200"
              >
                Here's what we'll set up together:
              </Typography>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                <div className="flex items-center gap-2">
                  <Icon name="check" size="xs" className="text-jade-600" />
                  <Typography
                    variant="body-sm"
                    className="text-jade-700 dark:text-jade-300"
                  >
                    Team & school information
                  </Typography>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="check" size="xs" className="text-jade-600" />
                  <Typography
                    variant="body-sm"
                    className="text-jade-700 dark:text-jade-300"
                  >
                    Coaching staff contacts
                  </Typography>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="check" size="xs" className="text-jade-600" />
                  <Typography
                    variant="body-sm"
                    className="text-jade-700 dark:text-jade-300"
                  >
                    Emergency contacts
                  </Typography>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="check" size="xs" className="text-jade-600" />
                  <Typography
                    variant="body-sm"
                    className="text-jade-700 dark:text-jade-300"
                  >
                    Team size planning
                  </Typography>
                </div>
              </div>
            </div>

            {/* Clear Progress Option */}
            {hasSavedDraft && (
              <div className="mt-8 pt-6 border-t border-border-subtle">
                <div className="flex items-center justify-center">
                  <Button
                    onClick={handleStartFresh}
                    variant="ghost"
                    size="sm"
                    icon={<Icon name="refresh-cw" size="xs" />}
                    className="text-muted hover:text-foreground"
                  >
                    Clear saved progress and start fresh
                  </Button>
                </div>
              </div>
            )}
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
                onChange={(value) =>
                  setFormData({ ...formData, schoolName: value })
                }
                placeholder="e.g., Burke Catholic High School"
                required
                helperText="The official name of your school or organization"
                validation={{
                  minLength: 2,
                  message: "School name must be at least 2 characters",
                }}
              />

              <EnhancedInput
                label="Team Mascot"
                value={formData.teamName}
                onChange={(value) =>
                  setFormData({ ...formData, teamName: value })
                }
                placeholder="e.g., Eagles, Warriors, Tigers"
                required
                helperText="Your team's mascot or nickname"
                validation={{
                  minLength: 2,
                  message: "Team name must be at least 2 characters",
                }}
              />

              <div className="md:col-span-2">
                <EnhancedSelect
                  label="Sport"
                  value={formData.sport}
                  onChange={(value) =>
                    setFormData({ ...formData, sport: value })
                  }
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
                    { value: "Other", label: "Other" },
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
                <AddressAutocomplete
                  label="School Address"
                  value={formData.schoolAddress}
                  onChange={(parsed) => {
                    setFormData({
                      ...formData,
                      schoolAddress: parsed.street,
                      schoolCity: parsed.city,
                      schoolState: parsed.state,
                      schoolZip: parsed.zip,
                    });
                  }}
                  onAddressChange={(address) => {
                    setFormData({ ...formData, schoolAddress: address });
                  }}
                  placeholder="Start typing your school address..."
                  required
                  helperText="We'll auto-fill city, state, and ZIP when you select an address"
                />
              </div>

              {/* Show parsed address components */}
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
              <div>
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-medium mb-2"
                >
                  ZIP Code *
                </Typography>
                <input
                  type="text"
                  value={formData.schoolZip}
                  onChange={(e) =>
                    setFormData({ ...formData, schoolZip: e.target.value })
                  }
                  placeholder="e.g., 78701"
                  className="w-full px-3 py-2 border border-border-medium rounded-lg focus:ring-2 focus:ring-jade-500 focus:border-jade-500"
                  required
                />
              </div>
            </div>
          </div>
        );

      case "owner-info":
        return (
          <div>
            <Typography variant="headline-lg" className="mb-2">
              Team Owner Information
            </Typography>
            <Typography variant="body-md" color="muted" className="mb-6">
              The team owner is the primary account holder responsible for
              billing and team management.
            </Typography>

            {/* Default to Current User */}
            <div className="bg-jade-50 dark:bg-jade-900/20 border border-jade-200 dark:border-jade-800 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Icon name="check" size="sm" className="text-jade-600 mt-0.5" />
                <div>
                  <Typography
                    variant="body-sm"
                    className="font-medium text-jade-800 dark:text-jade-200 mb-1"
                  >
                    You will be the team owner
                  </Typography>
                  <Typography variant="body-sm" color="muted">
                    As the person creating this team, you'll automatically
                    become the owner with full management access.
                  </Typography>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Full Name <span className="text-status-error">*</span>
                </label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) =>
                    setFormData({ ...formData, ownerName: e.target.value })
                  }
                  placeholder="e.g., John Smith"
                  className="w-full px-3 py-2 border border-border-medium rounded-lg focus:ring-2 focus:ring-jade-500 focus:border-jade-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Email Address <span className="text-status-error">*</span>
                </label>
                <input
                  type="email"
                  value={formData.ownerEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, ownerEmail: e.target.value })
                  }
                  placeholder="owner@school.edu"
                  className="w-full px-3 py-2 border border-border-medium rounded-lg focus:ring-2 focus:ring-jade-500 focus:border-jade-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Phone Number <span className="text-status-error">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.ownerPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, ownerPhone: e.target.value })
                  }
                  placeholder="(555) 123-4567"
                  className="w-full px-3 py-2 border border-border-medium rounded-lg focus:ring-2 focus:ring-jade-500 focus:border-jade-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Role/Title <span className="text-status-error">*</span>
                </label>
                <select
                  value={formData.ownerRole}
                  onChange={(e) =>
                    setFormData({ ...formData, ownerRole: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border-medium rounded-lg focus:ring-2 focus:ring-jade-500 focus:border-jade-500"
                  required
                >
                  <option value="Head Coach">Head Coach</option>
                  <option value="Athletic Director">Athletic Director</option>
                  <option value="Principal">Principal</option>
                  <option value="Assistant Principal">
                    Assistant Principal
                  </option>
                  <option value="Team Manager">Team Manager</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Transfer Ownership - Coming Soon */}
            <div className="mt-8 p-4 bg-surface-subtle border border-border-subtle rounded-lg">
              <div className="flex items-start gap-3">
                <Icon name="info" size="sm" className="text-blue-600 mt-0.5" />
                <div>
                  <Typography variant="body-sm" className="font-medium mb-1">
                    Transfer Ownership (Coming Soon)
                  </Typography>
                  <Typography variant="body-sm" color="muted">
                    Future feature: Transfer team ownership to another person
                    via email invitation.
                  </Typography>
                </div>
              </div>
            </div>
          </div>
        );

      case "coach-info":
        return (
          <div>
            <Typography variant="headline-lg" className="mb-2">
              Head Coach Information
            </Typography>
            <Typography variant="body-md" color="muted" className="mb-6">
              Primary coaching contact for the team. This can be the same as the
              owner or different.
            </Typography>

            {/* Same as Owner Toggle */}
            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.coachEmail === formData.ownerEmail}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({
                        ...formData,
                        coachName: formData.ownerName,
                        coachEmail: formData.ownerEmail,
                        coachPhone: formData.ownerPhone,
                      });
                    } else {
                      setFormData({
                        ...formData,
                        coachName: "",
                        coachEmail: "",
                        coachPhone: "",
                      });
                    }
                  }}
                  className="w-4 h-4 text-jade-600 rounded focus:ring-jade-500"
                />
                <Typography variant="body-sm">Same as team owner</Typography>
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Full Name <span className="text-status-error">*</span>
                </label>
                <input
                  type="text"
                  value={formData.coachName}
                  onChange={(e) =>
                    setFormData({ ...formData, coachName: e.target.value })
                  }
                  placeholder="e.g., Coach Johnson"
                  className="w-full px-3 py-2 border border-border-medium rounded-lg focus:ring-2 focus:ring-jade-500 focus:border-jade-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Email Address <span className="text-status-error">*</span>
                </label>
                <input
                  type="email"
                  value={formData.coachEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, coachEmail: e.target.value })
                  }
                  placeholder="coach@school.edu"
                  className="w-full px-3 py-2 border border-border-medium rounded-lg focus:ring-2 focus:ring-jade-500 focus:border-jade-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Phone Number <span className="text-status-error">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.coachPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, coachPhone: e.target.value })
                  }
                  placeholder="(555) 123-4567"
                  className="w-full px-3 py-2 border border-border-medium rounded-lg focus:ring-2 focus:ring-jade-500 focus:border-jade-500"
                  required
                />
              </div>
            </div>
          </div>
        );

      case "fallback-info":
        return (
          <div>
            <Typography variant="headline-lg" className="mb-2">
              Emergency Contact
            </Typography>
            <Typography variant="body-md" color="muted" className="mb-6">
              A backup contact person for team communication and emergencies.
            </Typography>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Full Name <span className="text-status-error">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fallbackName}
                  onChange={(e) =>
                    setFormData({ ...formData, fallbackName: e.target.value })
                  }
                  placeholder="e.g., Assistant Coach Smith"
                  className="w-full px-3 py-2 border border-border-medium rounded-lg focus:ring-2 focus:ring-jade-500 focus:border-jade-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Email Address <span className="text-status-error">*</span>
                </label>
                <input
                  type="email"
                  value={formData.fallbackEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, fallbackEmail: e.target.value })
                  }
                  placeholder="assistant@school.edu"
                  className="w-full px-3 py-2 border border-border-medium rounded-lg focus:ring-2 focus:ring-jade-500 focus:border-jade-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Phone Number <span className="text-status-error">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.fallbackPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, fallbackPhone: e.target.value })
                  }
                  placeholder="(555) 987-6543"
                  className="w-full px-3 py-2 border border-border-medium rounded-lg focus:ring-2 focus:ring-jade-500 focus:border-jade-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Role/Title <span className="text-status-error">*</span>
                </label>
                <select
                  value={formData.fallbackRole}
                  onChange={(e) =>
                    setFormData({ ...formData, fallbackRole: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border-medium rounded-lg focus:ring-2 focus:ring-jade-500 focus:border-jade-500"
                  required
                >
                  <option value="Assistant Coach">Assistant Coach</option>
                  <option value="Team Manager">Team Manager</option>
                  <option value="Athletic Trainer">Athletic Trainer</option>
                  <option value="Team Parent">Team Parent</option>
                  <option value="Administrative Assistant">
                    Administrative Assistant
                  </option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
        );

      case "team-details":
        return (
          <div>
            <Typography variant="headline-lg" className="mb-2">
              Team Size & Composition
            </Typography>
            <Typography variant="body-md" color="muted" className="mb-6">
              Help us understand your team size to optimize your experience.
            </Typography>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Expected Number of Players
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.expectedPlayerCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expectedPlayerCount: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-border-medium rounded-lg focus:ring-2 focus:ring-jade-500 focus:border-jade-500"
                  />
                  <Typography variant="body-xs" color="muted" className="mt-1">
                    Typical high school football teams have 25-40 players
                  </Typography>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Coaching Staff Count
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.coachingStaffCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        coachingStaffCount: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-border-medium rounded-lg focus:ring-2 focus:ring-jade-500 focus:border-jade-500"
                  />
                  <Typography variant="body-xs" color="muted" className="mt-1">
                    Include head coach, assistants, and support staff
                  </Typography>
                </div>
              </div>

              {/* Team Composition Preview */}
              <div className="bg-surface-subtle rounded-lg p-4">
                <Typography variant="body-sm" className="font-medium mb-3">
                  Team Overview
                </Typography>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Icon name="users" size="sm" className="text-blue-600" />
                    <div>
                      <Typography variant="body-sm" className="font-medium">
                        {formData.expectedPlayerCount} Players
                      </Typography>
                      <Typography variant="body-xs" color="muted">
                        Team roster
                      </Typography>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="user" size="sm" className="text-jade-600" />
                    <div>
                      <Typography variant="body-sm" className="font-medium">
                        {formData.coachingStaffCount} Coaches
                      </Typography>
                      <Typography variant="body-xs" color="muted">
                        Coaching staff
                      </Typography>
                    </div>
                  </div>
                </div>
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
              <Button
                onClick={() => setShowWelcomeModal(true)}
                variant="primary"
                size="lg"
                icon={<Icon name="arrow-right" size="sm" />}
                iconPosition="right"
              >
                Continue to Team
              </Button>
              <Typography variant="body-sm" color="muted" className="mt-2">
                � Get ready to discover everything you can do with your new
                team!
              </Typography>
            </div>
          </div>
        );

      case "review":
        return (
          <div>
            <Typography variant="headline-lg" className="mb-2">
              Review & Confirm Team Information
            </Typography>
            <Typography variant="body-md" color="muted" className="mb-8">
              Please review all information carefully. You can go back to edit
              any section.
            </Typography>

            <div className="space-y-8">
              {/* Team Information */}
              <div className="bg-surface-subtle rounded-xl p-6 border border-border-subtle">
                <div className="flex items-center justify-between mb-4">
                  <Typography
                    variant="headline-md"
                    className="flex items-center gap-2"
                  >
                    <Icon name="trophy" size="sm" className="text-jade-600" />
                    Team Information
                  </Typography>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setCurrentStep("team-info")}
                    icon={<Icon name="edit" size="xs" />}
                  >
                    Edit
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Typography
                      variant="body-xs"
                      color="muted"
                      className="mb-1"
                    >
                      Team Name
                    </Typography>
                    <Typography variant="body-sm" className="font-medium">
                      {formData.teamName || "Not specified"}
                    </Typography>
                  </div>
                  <div>
                    <Typography
                      variant="body-xs"
                      color="muted"
                      className="mb-1"
                    >
                      Sport
                    </Typography>
                    <Typography variant="body-sm" className="font-medium">
                      {formData.sport}
                    </Typography>
                  </div>
                  <div>
                    <Typography
                      variant="body-xs"
                      color="muted"
                      className="mb-1"
                    >
                      Season
                    </Typography>
                    <Typography variant="body-sm" className="font-medium">
                      {formData.season}
                    </Typography>
                  </div>
                </div>
              </div>

              {/* School Information */}
              <div className="bg-surface-subtle rounded-xl p-6 border border-border-subtle">
                <div className="flex items-center justify-between mb-4">
                  <Typography
                    variant="headline-md"
                    className="flex items-center gap-2"
                  >
                    <Icon name="map-pin" size="sm" className="text-blue-600" />
                    School Information
                  </Typography>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setCurrentStep("school-info")}
                    icon={<Icon name="edit" size="xs" />}
                  >
                    Edit
                  </Button>
                </div>
                <div className="space-y-3">
                  <div>
                    <Typography
                      variant="body-xs"
                      color="muted"
                      className="mb-1"
                    >
                      School Name
                    </Typography>
                    <Typography variant="body-sm" className="font-medium">
                      {formData.schoolName || "Not specified"}
                    </Typography>
                  </div>
                  {formData.schoolDistrict && (
                    <div>
                      <Typography
                        variant="body-xs"
                        color="muted"
                        className="mb-1"
                      >
                        District
                      </Typography>
                      <Typography variant="body-sm" className="font-medium">
                        {formData.schoolDistrict}
                      </Typography>
                    </div>
                  )}
                  <div>
                    <Typography
                      variant="body-xs"
                      color="muted"
                      className="mb-1"
                    >
                      Address
                    </Typography>
                    <Typography variant="body-sm" className="font-medium">
                      {[
                        formData.schoolAddress,
                        formData.schoolCity,
                        formData.schoolState,
                        formData.schoolZip,
                      ]
                        .filter(Boolean)
                        .join(", ") || "Not specified"}
                    </Typography>
                  </div>
                </div>
              </div>

              {/* Team Owner */}
              <div className="bg-surface-subtle rounded-xl p-6 border border-border-subtle">
                <div className="flex items-center justify-between mb-4">
                  <Typography
                    variant="headline-md"
                    className="flex items-center gap-2"
                  >
                    <Icon name="user" size="sm" className="text-emerald-600" />
                    Team Owner
                  </Typography>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setCurrentStep("owner-info")}
                    icon={<Icon name="edit" size="xs" />}
                  >
                    Edit
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Typography
                      variant="body-xs"
                      color="muted"
                      className="mb-1"
                    >
                      Name
                    </Typography>
                    <Typography variant="body-sm" className="font-medium">
                      {formData.ownerName || "Not specified"}
                    </Typography>
                  </div>
                  <div>
                    <Typography
                      variant="body-xs"
                      color="muted"
                      className="mb-1"
                    >
                      Role
                    </Typography>
                    <Typography variant="body-sm" className="font-medium">
                      {formData.ownerRole}
                    </Typography>
                  </div>
                  <div>
                    <Typography
                      variant="body-xs"
                      color="muted"
                      className="mb-1"
                    >
                      Email
                    </Typography>
                    <Typography variant="body-sm" className="font-medium">
                      {formData.ownerEmail || "Not specified"}
                    </Typography>
                  </div>
                  <div>
                    <Typography
                      variant="body-xs"
                      color="muted"
                      className="mb-1"
                    >
                      Phone
                    </Typography>
                    <Typography variant="body-sm" className="font-medium">
                      {formData.ownerPhone || "Not specified"}
                    </Typography>
                  </div>
                </div>
              </div>

              {/* Head Coach */}
              <div className="bg-surface-subtle rounded-xl p-6 border border-border-subtle">
                <div className="flex items-center justify-between mb-4">
                  <Typography
                    variant="headline-md"
                    className="flex items-center gap-2"
                  >
                    <Icon name="users" size="sm" className="text-amber-600" />
                    Head Coach
                  </Typography>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setCurrentStep("coach-info")}
                    icon={<Icon name="edit" size="xs" />}
                  >
                    Edit
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Typography
                      variant="body-xs"
                      color="muted"
                      className="mb-1"
                    >
                      Name
                    </Typography>
                    <Typography variant="body-sm" className="font-medium">
                      {formData.coachName || "Not specified"}
                    </Typography>
                  </div>
                  <div>
                    <Typography
                      variant="body-xs"
                      color="muted"
                      className="mb-1"
                    >
                      Same as Owner
                    </Typography>
                    <Typography variant="body-sm" className="font-medium">
                      {formData.coachEmail === formData.ownerEmail
                        ? "Yes"
                        : "No"}
                    </Typography>
                  </div>
                  <div>
                    <Typography
                      variant="body-xs"
                      color="muted"
                      className="mb-1"
                    >
                      Email
                    </Typography>
                    <Typography variant="body-sm" className="font-medium">
                      {formData.coachEmail || "Not specified"}
                    </Typography>
                  </div>
                  <div>
                    <Typography
                      variant="body-xs"
                      color="muted"
                      className="mb-1"
                    >
                      Phone
                    </Typography>
                    <Typography variant="body-sm" className="font-medium">
                      {formData.coachPhone || "Not specified"}
                    </Typography>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-surface-subtle rounded-xl p-6 border border-border-subtle">
                <div className="flex items-center justify-between mb-4">
                  <Typography
                    variant="headline-md"
                    className="flex items-center gap-2"
                  >
                    <Icon
                      name="alert-triangle"
                      size="sm"
                      className="text-orange-600"
                    />
                    Emergency Contact
                  </Typography>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setCurrentStep("fallback-info")}
                    icon={<Icon name="edit" size="xs" />}
                  >
                    Edit
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Typography
                      variant="body-xs"
                      color="muted"
                      className="mb-1"
                    >
                      Name
                    </Typography>
                    <Typography variant="body-sm" className="font-medium">
                      {formData.fallbackName || "Not specified"}
                    </Typography>
                  </div>
                  <div>
                    <Typography
                      variant="body-xs"
                      color="muted"
                      className="mb-1"
                    >
                      Role
                    </Typography>
                    <Typography variant="body-sm" className="font-medium">
                      {formData.fallbackRole}
                    </Typography>
                  </div>
                  <div>
                    <Typography
                      variant="body-xs"
                      color="muted"
                      className="mb-1"
                    >
                      Email
                    </Typography>
                    <Typography variant="body-sm" className="font-medium">
                      {formData.fallbackEmail || "Not specified"}
                    </Typography>
                  </div>
                  <div>
                    <Typography
                      variant="body-xs"
                      color="muted"
                      className="mb-1"
                    >
                      Phone
                    </Typography>
                    <Typography variant="body-sm" className="font-medium">
                      {formData.fallbackPhone || "Not specified"}
                    </Typography>
                  </div>
                </div>
              </div>

              {/* Team Composition */}
              <div className="bg-surface-subtle rounded-xl p-6 border border-border-subtle">
                <div className="flex items-center justify-between mb-4">
                  <Typography
                    variant="headline-md"
                    className="flex items-center gap-2"
                  >
                    <Icon
                      name="bar-chart"
                      size="sm"
                      className="text-purple-600"
                    />
                    Team Composition
                  </Typography>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setCurrentStep("team-details")}
                    icon={<Icon name="edit" size="xs" />}
                  >
                    Edit
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Icon name="users" size="sm" className="text-blue-600" />
                    </div>
                    <div>
                      <Typography variant="body-lg" className="font-semibold">
                        {formData.expectedPlayerCount}
                      </Typography>
                      <Typography variant="body-xs" color="muted">
                        Expected Players
                      </Typography>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-jade-500/20 flex items-center justify-center">
                      <Icon name="user" size="sm" className="text-jade-600" />
                    </div>
                    <div>
                      <Typography variant="body-lg" className="font-semibold">
                        {formData.coachingStaffCount}
                      </Typography>
                      <Typography variant="body-xs" color="muted">
                        Coaching Staff
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subscription Summary */}
              <div className="bg-gradient-to-br from-jade-50 to-emerald-50 dark:from-jade-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-jade-200 dark:border-jade-800">
                <div className="flex items-center gap-2 mb-4">
                  <Icon name="star" size="sm" className="text-jade-600" />
                  <Typography
                    variant="headline-md"
                    className="text-jade-800 dark:text-jade-200"
                  >
                    Subscription Plan
                  </Typography>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Typography
                      variant="body-md"
                      className="font-semibold mb-1"
                    >
                      Founders Pricing - Team Basic
                    </Typography>
                    <Typography variant="body-sm" color="muted">
                      Complete team management platform
                    </Typography>
                  </div>
                  <div className="text-right">
                    <Typography
                      variant="headline-md"
                      className="text-jade-700 dark:text-jade-300 font-bold"
                    >
                      $199<span className="text-sm font-normal">/year</span>
                    </Typography>
                    <Typography
                      variant="body-xs"
                      className="text-jade-600 dark:text-jade-400"
                    >
                      Limited time offer
                    </Typography>
                  </div>
                </div>
              </div>

              {/* Final Confirmation */}
              <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-white/20 dark:border-gray-700/30">
                <div className="flex items-start gap-3">
                  <Icon
                    name="info"
                    size="sm"
                    className="text-blue-600 mt-0.5"
                  />
                  <div>
                    <Typography variant="body-sm" className="font-medium mb-2">
                      Ready to Create Your Team
                    </Typography>
                    <Typography variant="body-xs" color="muted">
                      By clicking "Create Team" you confirm that all information
                      is accurate and agree to our terms of service. You'll be
                      able to modify team settings after creation.
                    </Typography>
                  </div>
                </div>
              </div>
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
        {/* Resume Draft Prompt */}
        {showResumePrompt && (
          <div className="mb-6 bg-gradient-to-r from-jade-50 to-emerald-50 dark:from-jade-900/20 dark:to-emerald-900/20 border border-jade-200 dark:border-jade-800 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-jade-100 dark:bg-jade-900/30 flex items-center justify-center">
                <Icon name="save" size="sm" className="text-jade-600" />
              </div>
              <div className="flex-1">
                <Typography
                  variant="headline-sm"
                  className="mb-2 text-jade-800 dark:text-jade-200"
                >
                  Resume Your Team Creation
                </Typography>
                <Typography variant="body-sm" color="muted" className="mb-4">
                  We found your saved progress! You can continue where you left
                  off or start fresh.
                </Typography>
                {hasSavedDraft && (
                  <div className="mb-4 p-3 bg-white/50 dark:bg-gray-900/50 rounded-lg border border-jade-200/50 dark:border-jade-800/50">
                    <Typography
                      variant="body-xs"
                      color="muted"
                      className="mb-2"
                    >
                      Saved progress includes:
                    </Typography>
                    <div className="flex flex-wrap gap-2">
                      {formData.teamName && (
                        <div className="px-2 py-1 bg-jade-100 dark:bg-jade-900/30 text-jade-700 dark:text-jade-300 rounded text-xs">
                          Team: {formData.teamName}
                        </div>
                      )}
                      {formData.schoolName && (
                        <div className="px-2 py-1 bg-jade-100 dark:bg-jade-900/30 text-jade-700 dark:text-jade-300 rounded text-xs">
                          School: {formData.schoolName}
                        </div>
                      )}
                      {formData.ownerName && (
                        <div className="px-2 py-1 bg-jade-100 dark:bg-jade-900/30 text-jade-700 dark:text-jade-300 rounded text-xs">
                          Owner: {formData.ownerName}
                        </div>
                      )}
                      {currentStep !== "intro" && (
                        <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
                          Step: {steps.find((s) => s.id === currentStep)?.title}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex gap-3">
                  <Button
                    onClick={handleResumeDraft}
                    variant="primary"
                    size="sm"
                    icon={<Icon name="play" size="xs" />}
                  >
                    Continue Where I Left Off
                  </Button>
                  <Button
                    onClick={handleStartFresh}
                    variant="ghost"
                    size="sm"
                    icon={<Icon name="refresh-cw" size="xs" />}
                  >
                    Start Fresh
                  </Button>
                </div>
              </div>
              <Button
                onClick={() => setShowResumePrompt(false)}
                variant="ghost"
                size="xs"
                icon={<Icon name="close" size="xs" />}
              />
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {currentStep !== "intro" && currentStep !== "complete" && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Typography variant="body-sm" color="muted">
                  Step {currentStepIndex + 1} of {steps.length}
                </Typography>
                {hasSavedDraft && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-jade-100 dark:bg-jade-900/30 text-jade-700 dark:text-jade-300 rounded-full">
                    <Icon name="save" size="xs" />
                    <Typography variant="body-xs">Auto-saved</Typography>
                  </div>
                )}
              </div>
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
                onClick={handleNext}
                disabled={isLoading}
                variant="primary"
                size="sm"
                icon={!isLoading ? <Icon name="check" size="sm" /> : undefined}
                iconPosition="right"
                loading={isLoading}
              >
                {isLoading ? loadingMessage : "Create Team"}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!validateCurrentStep()}
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

      {/* Welcome Modal */}
      <TeamWelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        teamName={`${formData.schoolName} ${formData.teamName}`}
        onGoToBulletin={() => {
          setShowWelcomeModal(false);
          navigate(teamRoutes.bulletin(String(createdTeamId || "unknown")));
        }}
        onStartTour={() => {
          setShowWelcomeModal(false);
          setShowOnboarding(true);
        }}
      />
    </PageLayout>
  );
};
