import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../lib/supabase";
import { ROUTES } from "../routes/paths";
import { Card } from "../components/ui/Card";
import { Typography } from "../components/design-system";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import {
  validatePasswordConfirmation,
  validatePasswordStrength,
} from "../utils/passwordValidation";

type PageState = "checking" | "ready" | "invalid" | "submitting" | "success";

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const [pageState, setPageState] = useState<PageState>("checking");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordValidation = useMemo(
    () => validatePasswordStrength(password),
    [password]
  );

  const confirmValidation = useMemo(
    () => validatePasswordConfirmation(password, confirmPassword),
    [password, confirmPassword]
  );

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (cancelled) return;

        if (!session) {
          setPageState("invalid");
          return;
        }

        setPageState("ready");
      } catch {
        if (cancelled) return;
        setPageState("invalid");
      }
    }

    void checkSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!passwordValidation.isValid) {
      setErrorMessage(passwordValidation.message);
      return;
    }

    if (!confirmValidation.isValid) {
      setErrorMessage(confirmValidation.message);
      return;
    }

    setPageState("submitting");

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setErrorMessage(error.message || "Failed to update password");
      setPageState("ready");
      return;
    }

    // Sign out to ensure the user re-authenticates with the new password.
    await supabase.auth.signOut();

    setPageState("success");

    setTimeout(() => {
      navigate(ROUTES.LOGIN, { replace: true });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      <Card className="content-narrow">
        <div className="p-8 space-y-4">
          <Typography variant="headline-md">Reset Password</Typography>

          {pageState === "checking" && (
            <Typography variant="body-sm" color="muted">
              Verifying reset link…
            </Typography>
          )}

          {pageState === "invalid" && (
            <>
              <Typography variant="body-sm" color="muted">
                This reset link is invalid or expired.
              </Typography>
              <Button variant="primary" onClick={() => navigate(ROUTES.LOGIN)}>
                Go to Sign In
              </Button>
            </>
          )}

          {(pageState === "ready" || pageState === "submitting") && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="password"
                label="New Password"
                placeholder="Enter a new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                status={
                  !password || passwordValidation.isValid ? undefined : "error"
                }
                errorMessage={
                  !password || passwordValidation.isValid
                    ? undefined
                    : passwordValidation.message
                }
                required
                fullWidth
              />

              <Input
                type="password"
                label="Confirm Password"
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                status={
                  !confirmPassword || confirmValidation.isValid
                    ? undefined
                    : "error"
                }
                errorMessage={
                  !confirmPassword || confirmValidation.isValid
                    ? undefined
                    : confirmValidation.message
                }
                required
                fullWidth
              />

              {errorMessage && (
                <div className="bg-error-bg border border-error-200 text-error-800 rounded-lg p-3 text-sm">
                  {errorMessage}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={pageState === "submitting"}
              >
                {pageState === "submitting" ? "Updating…" : "Update Password"}
              </Button>
            </form>
          )}

          {pageState === "success" && (
            <Typography variant="body-sm" color="muted">
              Password updated. Redirecting to sign in…
            </Typography>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
