/**
 * Invitation Acceptance Page
 *
 * Handles the full invitation acceptance flow:
 * 1. Token validation
 * 2. User authentication (sign up or sign in)
 * 3. Invitation acceptance
 * 4. Redirect to team dashboard
 */

import { useEffect, useState, type ReactNode } from "react";
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
import { logError } from "../utils/logger";
import { teamRoutes } from "../routes/paths";

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

const LoadingState = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface">
    <div className="text-center">
      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
      <p className="text-secondary">Loading invitation...</p>
    </div>
  </div>
);

const InvalidTokenState = ({ onGoHome }: { onGoHome: () => void }) => (
  <div className="min-h-screen flex items-center justify-center bg-surface p-4">
    <div className="max-w-md w-full bg-primary rounded-lg shadow-2xl p-8">
      <Alert variant="error" className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Invalid Invitation</h2>
        <p>This invitation link is not valid.</p>
      </Alert>
      <Button onClick={onGoHome} className="w-full">
        Go to Home
      </Button>
    </div>
  </div>
);

const ExpiredTokenState = ({ onGoHome }: { onGoHome: () => void }) => (
  <div className="min-h-screen flex items-center justify-center bg-surface p-4">
    <div className="max-w-md w-full bg-primary rounded-lg shadow-2xl p-8">
      <Alert variant="warning" className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Invitation Expired</h2>
        <p>
          This invitation has expired. Please contact your coach to request a
          new invitation.
        </p>
      </Alert>
      <Button onClick={onGoHome} className="w-full">
        Go to Home
      </Button>
    </div>
  </div>
);

const AlreadyAcceptedState = ({
  team,
  onGoToTeam,
}: {
  team: TeamData | null;
  onGoToTeam: (teamId: string) => void;
}) => (
  <div className="min-h-screen flex items-center justify-center bg-surface p-4">
    <div className="max-w-md w-full bg-primary rounded-lg shadow-2xl p-8">
      <Alert variant="info" className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Already a Member</h2>
        <p>You are already a member of this team.</p>
      </Alert>
      {team && (
        <Button onClick={() => onGoToTeam(team.id)} className="w-full">
          Go to {team.name}
        </Button>
      )}
    </div>
  </div>
);

const AcceptingState = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface">
    <div className="text-center">
      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
      <p className="text-secondary">Accepting invitation...</p>
    </div>
  </div>
);

const SuccessState = ({
  invitation,
  team,
}: {
  invitation: InvitationData | null;
  team: TeamData | null;
}) => (
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

const ErrorState = ({
  errorMessage,
  onGoHome,
}: {
  errorMessage: string;
  onGoHome: () => void;
}) => (
  <div className="min-h-screen flex items-center justify-center bg-surface p-4">
    <div className="max-w-md w-full bg-primary rounded-lg shadow-2xl p-8">
      <Alert variant="error" className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Error</h2>
        <p>{errorMessage || "An unexpected error occurred"}</p>
      </Alert>
      <Button onClick={onGoHome} className="w-full">
        Go to Home
      </Button>
    </div>
  </div>
);

const AuthRequiredState = ({
  team,
  invitation,
  token,
  playerEmail,
  authMode,
  onSetAuthMode,
  onSignUpSuccess,
  onSignInSuccess,
}: {
  team: TeamData | null;
  invitation: InvitationData | null;
  token: string | null;
  playerEmail: string;
  authMode: "signup" | "signin";
  onSetAuthMode: (mode: "signup" | "signin") => void;
  onSignUpSuccess: (userId: string) => Promise<void>;
  onSignInSuccess: () => Promise<void>;
}) => {
  const encodedToken = token ? encodeURIComponent(token) : null;
  const inviteAcceptPath = encodedToken
    ? `/invite/accept?token=${encodedToken}`
    : "/invite/accept";

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
          <div className="flex border-b border-muted mb-6">
            <button
              onClick={() => onSetAuthMode("signup")}
              className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                authMode === "signup"
                  ? "border-primary text-primary"
                  : "border-transparent text-secondary hover:text-primary"
              }`}
            >
              Create Account
            </button>
            <button
              onClick={() => onSetAuthMode("signin")}
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
              onSuccess={onSignUpSuccess}
              redirectTo={inviteAcceptPath}
            />
          )}

          {/* Sign In Form */}
          {authMode === "signin" && <SignInForm onSuccess={onSignInSuccess} />}
        </div>
      </div>
    </div>
  );
};

function InvitationAcceptPageBody(params: {
  pageState: PageState;
  invitation: InvitationData | null;
  team: TeamData | null;
  token: string | null;
  playerEmail: string;
  errorMessage: string;
  authMode: "signup" | "signin";
  onGoHome: () => void;
  onGoToTeam: (teamId: string) => void;
  onSetAuthMode: (mode: "signup" | "signin") => void;
  onSignUpSuccess: (userId: string) => Promise<void>;
  onSignInSuccess: () => Promise<void>;
}) {
  const {
    pageState,
    invitation,
    team,
    token,
    playerEmail,
    errorMessage,
    authMode,
    onGoHome,
    onGoToTeam,
    onSetAuthMode,
    onSignUpSuccess,
    onSignInSuccess,
  } = params;

  const renderers: Record<PageState, () => ReactNode> = {
    loading: () => <LoadingState />,
    "invalid-token": () => <InvalidTokenState onGoHome={onGoHome} />,
    "expired-token": () => <ExpiredTokenState onGoHome={onGoHome} />,
    "already-accepted": () => (
      <AlreadyAcceptedState team={team} onGoToTeam={onGoToTeam} />
    ),
    "auth-required": () => (
      <AuthRequiredState
        team={team}
        invitation={invitation}
        token={token}
        playerEmail={playerEmail}
        authMode={authMode}
        onSetAuthMode={onSetAuthMode}
        onSignUpSuccess={onSignUpSuccess}
        onSignInSuccess={onSignInSuccess}
      />
    ),
    accepting: () => <AcceptingState />,
    success: () => <SuccessState invitation={invitation} team={team} />,
    error: () => <ErrorState errorMessage={errorMessage} onGoHome={onGoHome} />,
  };

  return renderers[pageState]();
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
        if (result.teamId) {
          navigate(teamRoutes.bulletin(result.teamId), { replace: true });
          navigate("/dashboard", { replace: true });
        }
      }, 2000);
    } catch (error) {
      logError("Error accepting invitation:", error);
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

  // Load invitation details
  useEffect(() => {
    let cancelled = false;

    const safe = (fn: () => void) => {
      if (!cancelled) fn();
    };

    const validateToken = (t: string | null): PageState | null => {
      if (!t) return "invalid-token";
      // Defensive token sanity check (prevents weird parsing/redirect issues)
      if (t.length > 512) return "invalid-token";
      return null;
    };

    const fetchTeam = async (teamId: string | null | undefined) => {
      const { data: teamData, error: teamError } = await supabase
        .from("teams")
        .select("id, name, school_name")
        .eq("id", teamId || "")
        .single();

      if (teamError || !teamData) {
        throw new Error("Team not found");
      }

      return teamData as TeamData;
    };

    const fetchPlayerEmail = async (userId: string) => {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", userId)
        .single();
      return profileData?.email || "";
    };

    async function loadInvitation() {
      const tokenState = validateToken(token);
      if (tokenState) {
        safe(() => setPageState(tokenState));
        return;
      }

      const tokenValue = token;
      if (!tokenValue) {
        safe(() => setPageState("invalid-token"));
        return;
      }

      try {
        // Check if user is already logged in
        const {
          data: { user },
        } = await supabase.auth.getUser();

        // Get invitation details
        const invitationData = await getInvitationByToken(tokenValue);

        if (!invitationData) {
          safe(() => setPageState("expired-token"));
          return;
        }

        // Check if already accepted
        if (invitationData.invitation_status === "accepted") {
          safe(() => setPageState("already-accepted"));
          return;
        }

        const teamData = await fetchTeam(invitationData.team_id);

        safe(() => {
          setInvitation(invitationData as InvitationData);
          setTeam(teamData);
        });

        // Try to get email from linked profile if user_id exists
        if (invitationData.user_id) {
          const email = await fetchPlayerEmail(invitationData.user_id);
          if (email) safe(() => setPlayerEmail(email));
        }

        // If user is logged in, auto-accept. Otherwise, show auth forms.
        if (user) {
          await handleAccept(user.id);
        } else {
          safe(() => setPageState("auth-required"));
        }
      } catch (error) {
        logError("Error loading invitation:", error);
        safe(() => {
          setErrorMessage(
            error instanceof Error && error.message === "Team not found"
              ? "Team not found"
              : "Failed to load invitation details"
          );
          setPageState("error");
        });
      }
    }

    void loadInvitation();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <InvitationAcceptPageBody
      pageState={pageState}
      invitation={invitation}
      team={team}
      token={token}
      playerEmail={playerEmail}
      errorMessage={errorMessage}
      authMode={authMode}
      onGoHome={() => navigate("/")}
      onGoToTeam={(teamId) =>
        navigate(teamRoutes.bulletin(teamId), { replace: true })
      }
      onSetAuthMode={setAuthMode}
      onSignUpSuccess={handleSignUpSuccess}
      onSignInSuccess={handleSignInSuccess}
    />
  );
}
