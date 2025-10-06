// Progressive Auth Flow - Enhanced UX for authentication
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../app/auth-store";
import { Typography } from "../../design-system";
import { Button } from "../Button";
import { Card } from "../Card";
import Icon from "../Icon/Icon";
import { LoginForm, SignupForm, ResetPasswordForm } from "./Auth";
import { OnboardingFlow } from "./OnboardingFlow";
import { ROUTES } from "../../../routes/paths";
import {
  auth as logAuth,
  success,
  error as logError,
  debug,
} from "../../../utils/logger";

type AuthStep = "welcome" | "login" | "signup" | "reset" | "onboarding";

interface ProgressiveAuthFlowProps {
  initialStep?: AuthStep;
  onSuccess?: () => void;
  className?: string;
}

/**
 * ProgressiveAuthFlow - Enhanced authentication experience
 *
 * Provides a step-by-step authentication flow with:
 * - Welcome screen with value proposition
 * - Progressive form disclosure
 * - Social login prioritization
 * - Professional loading states
 * - Clear navigation between steps
 */
export function ProgressiveAuthFlow({
  initialStep = "welcome",
  onSuccess,
  className = "",
}: ProgressiveAuthFlowProps) {
  const [currentStep, setCurrentStep] = useState<AuthStep>(initialStep);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();
  const {
    signIn,
    signUp,
    resetPassword,
    loading,
    error,
    clearError,
    user,
    profile,
  } = useAuth();

  // Handle step transitions with smooth animations
  const transitionToStep = (step: AuthStep) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(step);
      setIsTransitioning(false);
      clearError();
    }, 150);
  };

  // Handle successful authentication
  const handleAuthSuccess = (isNewUser = false) => {
    debug("Auth success handler called", { isNewUser });
    if (isNewUser) {
      transitionToStep("onboarding");
    } else {
      // For existing users, skip onboarding and go directly to success
      success("Calling onSuccess callback");
      onSuccess?.();
    }
  };

  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    success("Onboarding complete, calling onSuccess");
    onSuccess?.();
  };

  // Handle login submission
  const handleLogin = async (credentials: any) => {
    logAuth("ProgressiveAuthFlow: handleLogin called");
    try {
      const result = await signIn(credentials.email, credentials.password);
      logAuth("ProgressiveAuthFlow: signIn result:", result);

      if (result.success) {
        success("Login successful, calling handleAuthSuccess");
        handleAuthSuccess(false); // Existing user login
      } else {
        logError("Login failed:", result.error);
      }
    } catch (error) {
      logError("Login error:", error);
    }
  };

  // Handle signup submission
  const handleSignup = async (data: any) => {
    logAuth("ProgressiveAuthFlow: handleSignup called");
    try {
      const result = await signUp(data.email, data.password, {
        firstName: data.name.split(" ")[0] || "",
        lastName: data.name.split(" ").slice(1).join(" ") || "",
        role: data.role,
      });
      logAuth("ProgressiveAuthFlow: signUp result:", result);

      if (result.success) {
        success("Signup successful, calling handleAuthSuccess(true)");
        handleAuthSuccess(true); // New user signup
      } else {
        logError("Signup failed:", result.error);
      }
    } catch (error) {
      logError("Signup error:", error);
    }
  };

  // Handle password reset
  const handlePasswordReset = async (data: any) => {
    await resetPassword(data.email);
  };

  // Welcome screen component
  const WelcomeScreen = () => (
    <Card className="content-narrow">
      <div className="text-center p-8">
        {/* Logo and branding */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-surface-secondary rounded-full mb-4">
            <Icon name="target" size="xl" className="text-text-primary" />
          </div>
          <Typography variant="headline-lg" className="mb-2">
            Welcome to BoxCall
          </Typography>
          <Typography variant="body-lg" color="muted" className="mb-6">
            The complete football management platform for coaches, players, and
            teams
          </Typography>
        </div>

        {/* Value proposition */}
        <div className="grid grid-cols-1 gap-4 mb-8 text-left">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-success-bg rounded-full flex items-center justify-center mt-0.5">
              <Icon name="check" size="sm" className="text-success" />
            </div>
            <div>
              <Typography variant="body-sm" className="font-medium">
                Playbook Management
              </Typography>
              <Typography variant="caption" color="muted">
                Create, share, and execute winning strategies
              </Typography>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-success-bg rounded-full flex items-center justify-center mt-0.5">
              <Icon name="check" size="sm" className="text-success" />
            </div>
            <div>
              <Typography variant="body-sm" className="font-medium">
                Team Communication
              </Typography>
              <Typography variant="caption" color="muted">
                Keep everyone connected and informed
              </Typography>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-success-bg rounded-full flex items-center justify-center mt-0.5">
              <Icon name="check" size="sm" className="text-success" />
            </div>
            <div>
              <Typography variant="body-sm" className="font-medium">
                Performance Analytics
              </Typography>
              <Typography variant="caption" color="muted">
                Track progress and make data-driven decisions
              </Typography>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => transitionToStep("login")}
          >
            Sign In to Your Account
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={() => transitionToStep("signup")}
          >
            Create New Account
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-border">
          <Typography variant="caption" color="muted">
            By continuing, you agree to our{" "}
            <button
              className="text-text-primary hover:underline"
              onClick={() => navigate(ROUTES.TERMS)}
            >
              Terms of Service
            </button>{" "}
            and{" "}
            <button
              className="text-text-primary hover:underline"
              onClick={() => navigate(ROUTES.PRIVACY)}
            >
              Privacy Policy
            </button>
          </Typography>
        </div>
      </div>
    </Card>
  );

  // Render current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case "welcome":
        return <WelcomeScreen />;

      case "login":
        return (
          <LoginForm
            onSubmit={handleLogin}
            loading={loading}
            error={error}
            onSignUp={() => transitionToStep("signup")}
            onForgotPassword={() => transitionToStep("reset")}
            showSocialLogin={true}
          />
        );

      case "signup":
        return (
          <SignupForm
            onSubmit={handleSignup}
            loading={loading}
            error={error}
            onLogin={() => transitionToStep("login")}
            showSocialSignup={true}
          />
        );

      case "reset":
        return (
          <ResetPasswordForm
            onSubmit={handlePasswordReset}
            loading={loading}
            error={error}
            onBackToLogin={() => transitionToStep("login")}
          />
        );

      case "onboarding":
        if (!user || !profile) {
          // Fallback to welcome if no user data
          return <WelcomeScreen />;
        }
        return (
          <OnboardingFlow
            user={{
              id: user.id,
              email: user.email || "",
              name: profile.full_name || profile.display_name || "User",
              role:
                profile.role === "family"
                  ? "parent"
                  : profile.role === "admin" || profile.role === "super_admin"
                    ? "admin"
                    : profile.role,
              avatar: profile.avatar_url || undefined,
            }}
            onComplete={handleOnboardingComplete}
          />
        );

      default:
        return <WelcomeScreen />;
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 ${className}`}
    >
      <div className="w-full max-w-md">
        {/* Back button for non-welcome steps */}
        {currentStep !== "welcome" && (
          <div className="mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => transitionToStep("welcome")}
              className="flex items-center space-x-2"
            >
              <Icon name="arrow-left" size="sm" />
              <span>Back</span>
            </Button>
          </div>
        )}

        {/* Step content with transition animation */}
        <div
          className={`transition-all duration-300 ease-in-out ${
            isTransitioning
              ? "opacity-0 transform translate-x-4"
              : "opacity-100 transform translate-x-0"
          }`}
        >
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
}
