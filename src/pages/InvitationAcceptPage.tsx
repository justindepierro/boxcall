/**
 * Invitation Acceptance Page
 *
 * Handles the full invitation acceptance flow:
 * 1. Token validation
 * 2. User authentication (sign up or sign in)
 * 3. Invitation acceptance
 * 4. Redirect to team dashboard
 */

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  getInvitationByToken,
  acceptInvitation,
} from "../services/invitationService";
import { SignUpForm } from "../components/auth/SignUpForm";
import { SignInForm } from "../components/auth/SignInForm";
import { Button } from "../components/ui/Button";
import { Alert } from "../components/ui/Alert";
import { Loader2 } from "lucide-react";

type PageState =
  | "loading"
  | "invalid-token"
  | "expired-token"
  | "already-accepted"
  | "auth-required"
  | "accepting"
  | "success"
  | "error";

interface InvitationData {
  id: string;
  team_id: string;
  first_name: string;
  last_name: string;
  invitation_expires_at: string;
  invitation_status: string;
  user_id?: string | null;
}

interface TeamData {
  id: string;
  name: string;
  school_name: string | null;
}

export function InvitationAcceptPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [pageState, setPageState] = useState<PageState>("loading");
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [team, setTeam] = useState<TeamData | null>(null);
  const [playerEmail, setPlayerEmail] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [authMode, setAuthMode] = useState<"signup" | "signin">("signup");

  // Load invitation details
  useEffect(() => {
    async function loadInvitation() {
      if (!token) {
        setPageState("invalid-token");
        return;
      }

      try {
        // Check if user is already logged in
        const {
          data: { user },
        } = await supabase.auth.getUser();

        // Get invitation details
        const invitationData = await getInvitationByToken(token);

        if (!invitationData) {
          setPageState("expired-token");
          return;
        }

        // Check if already accepted
        if (invitationData.invitation_status === "accepted") {
          setPageState("already-accepted");
          return;
        }

        // Get team details
        const { data: teamData, error: teamError } = await supabase
          .from("teams")
          .select("id, name, school_name")
          .eq("id", invitationData.team_id || "")
          .single();

        if (teamError || !teamData) {
          setErrorMessage("Team not found");
          setPageState("error");
          return;
        }

        setInvitation(invitationData as InvitationData);
        setTeam(teamData);

        // Try to get email from linked profile if user_id exists
        if (invitationData.user_id) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("email")
            .eq("id", invitationData.user_id)
            .single();

          if (profileData?.email) {
            setPlayerEmail(profileData.email);
          }
        }

        // If user is logged in, show confirmation
        // If not logged in, show auth forms
        if (user) {
          // Auto-accept for logged-in users
          await handleAccept(user.id);
        } else {
          setPageState("auth-required");
        }
      } catch (error) {
        console.error("Error loading invitation:", error);
        setErrorMessage("Failed to load invitation details");
        setPageState("error");
      }
    }

    loadInvitation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Handle invitation acceptance
  async function handleAccept(userId: string) {
    if (!token) return;

    setPageState("accepting");

    try {
      const result = await acceptInvitation(token, userId);

      if (!result.success) {
        if (result.error === "already_member") {
          setErrorMessage("You are already a member of this team");
          setPageState("already-accepted");
        } else {
          setErrorMessage(result.message || "Failed to accept invitation");
          setPageState("error");
        }
        return;
      }

      setPageState("success");

      // Redirect to team dashboard after 2 seconds
      setTimeout(() => {
        navigate(`/teams/${result.teamId}`);
      }, 2000);
    } catch (error) {
      console.error("Error accepting invitation:", error);
      setErrorMessage("An unexpected error occurred");
      setPageState("error");
    }
  }

  // Handle successful sign up
  async function handleSignUpSuccess(userId: string) {
    await handleAccept(userId);
  }

  // Handle successful sign in
  async function handleSignInSuccess() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await handleAccept(user.id);
    }
  }

  // Render different states
  if (pageState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-secondary">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (pageState === "invalid-token") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-4">
        <div className="max-w-md w-full bg-primary rounded-lg shadow-2xl p-8">
          <Alert variant="error" className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Invalid Invitation</h2>
            <p>This invitation link is not valid.</p>
          </Alert>
          <Button onClick={() => navigate("/")} className="w-full">
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  if (pageState === "expired-token") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-4">
        <div className="max-w-md w-full bg-primary rounded-lg shadow-2xl p-8">
          <Alert variant="warning" className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Invitation Expired</h2>
            <p>
              This invitation has expired. Please contact your coach to request
              a new invitation.
            </p>
          </Alert>
          <Button onClick={() => navigate("/")} className="w-full">
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  if (pageState === "already-accepted") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-4">
        <div className="max-w-md w-full bg-primary rounded-lg shadow-2xl p-8">
          <Alert variant="info" className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Already a Member</h2>
            <p>You are already a member of this team.</p>
          </Alert>
          {team && (
            <Button
              onClick={() => navigate(`/teams/${team.id}`)}
              className="w-full"
            >
              Go to {team.name}
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (pageState === "accepting") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-secondary">Accepting invitation...</p>
        </div>
      </div>
    );
  }

  if (pageState === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-4">
        <div className="max-w-md w-full bg-primary rounded-lg shadow-2xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-success-bg rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-success-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-primary mb-2">
              Welcome to the Team!
            </h2>
            {invitation && team && (
              <>
                <p className="text-secondary mb-4">
                  You've successfully joined <strong>{team.name}</strong> as{" "}
                  <strong>
                    {invitation.first_name} {invitation.last_name}
                  </strong>
                  .
                </p>
                <p className="text-muted text-sm">
                  Redirecting to your team dashboard...
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (pageState === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-4">
        <div className="max-w-md w-full bg-primary rounded-lg shadow-2xl p-8">
          <Alert variant="error" className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Error</h2>
            <p>{errorMessage || "An unexpected error occurred"}</p>
          </Alert>
          <Button onClick={() => navigate("/")} className="w-full">
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  // Auth required state - show sign up/sign in forms
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="max-w-md w-full">
        {/* Team Header */}
        {team && invitation && (
          <div className="bg-primary rounded-lg shadow-md p-6 mb-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-primary mb-2">
                Join {team.name}
              </h1>
              {team.school_name && (
                <p className="text-secondary text-sm mb-4">
                  {team.school_name}
                </p>
              )}
              <div className="bg-secondary rounded-lg p-4">
                <p className="text-sm text-secondary mb-1">
                  You've been invited as:
                </p>
                <p className="text-lg font-semibold text-primary">
                  {invitation.first_name} {invitation.last_name}
                </p>
                {playerEmail && (
                  <p className="text-sm text-muted">{playerEmail}</p>
                )}
              </div>
              <div className="mt-4 text-xs text-muted">
                Invitation expires:{" "}
                {new Date(
                  invitation.invitation_expires_at
                ).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}

        {/* Auth Forms */}
        <div className="bg-primary rounded-lg shadow-2xl p-6">
          {/* Tab Switcher */}
          <div className="flex border-b border-subtle mb-6">
            <button
              onClick={() => setAuthMode("signup")}
              className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                authMode === "signup"
                  ? "border-primary text-primary"
                  : "border-transparent text-secondary hover:text-primary"
              }`}
            >
              Create Account
            </button>
            <button
              onClick={() => setAuthMode("signin")}
              className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                authMode === "signin"
                  ? "border-primary text-primary"
                  : "border-transparent text-secondary hover:text-primary"
              }`}
            >
              Sign In
            </button>
          </div>

          {/* Sign Up Form */}
          {authMode === "signup" && invitation && (
            <SignUpForm
              prefilledEmail={playerEmail}
              prefilledFirstName={invitation.first_name}
              prefilledLastName={invitation.last_name}
              onSuccess={handleSignUpSuccess}
              redirectTo={`/invite/accept?token=${token}`}
            />
          )}

          {/* Sign In Form */}
          {authMode === "signin" && (
            <SignInForm
              onSuccess={handleSignInSuccess}
              redirectTo={`/invite/accept?token=${token}`}
            />
          )}
        </div>
      </div>
    </div>
  );
}
