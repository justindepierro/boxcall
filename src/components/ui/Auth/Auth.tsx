import { useState } from "react";
import Icon from "../Icon/Icon";
import { Typography } from "../../design-system";
import { Button } from "../Button";
import { Form, FormActions, FormField } from "../Form";
import { Input } from "../Input";
import { FormSelect } from "../FormSelect/FormSelect";
import {
  validatePasswordStrength,
  validatePasswordConfirmation,
} from "../../../utils/passwordValidation";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";
export interface User {
  id: string;
  email: string;
  name: string;
  role: "player" | "coach" | "admin" | "parent";
  avatar?: string;
  teamId?: string;
  position?: string;
  jerseyNumber?: number;
}
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}
export interface SignupData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  role: "player" | "coach" | "admin" | "parent";
  acceptTerms: boolean;
}
export interface ResetPasswordData {
  email: string;
}
export interface AuthFormProps<T = unknown> {
  onSubmit: (data: T) => void | Promise<void>;
  loading?: boolean;
  error?: string | null;
  variant?: "card" | "modal" | "inline";
  className?: string;
}
export interface LoginFormProps extends AuthFormProps<LoginCredentials> {
  onForgotPassword?: () => void;
  onSignUp?: () => void;
  showSocialLogin?: boolean;
}
export interface SignupFormProps extends AuthFormProps<SignupData> {
  onLogin?: () => void;
  showSocialSignup?: boolean;
}
export interface ResetPasswordFormProps
  extends AuthFormProps<ResetPasswordData> {
  onBackToLogin?: () => void;
}
/**
 * LoginForm - Professional login form with validation
 */
export function LoginForm({
  onSubmit,
  loading = false,
  error = null,
  variant = "card",
  onForgotPassword,
  onSignUp,
  showSocialLogin = true,
  className = "",
}: LoginFormProps) {
  const [formData, setFormData] = useState<LoginCredentials>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [validationErrors, setValidationErrors] = useState<
    Partial<LoginCredentials>
  >({});
  const validateForm = (): boolean => {
    const errors: Partial<LoginCredentials> = {};
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!formData.password) {
      errors.password = "Password is required";
    } else {
      const passwordValidation = validatePasswordStrength(formData.password);
      if (!passwordValidation.isValid) {
        errors.password = passwordValidation.message;
      }
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const handleSubmit = async () => {
    if (!validateForm()) return;
    await onSubmit(formData);
  };
  const handleInputChange = (
    field: keyof LoginCredentials,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };
  return (
    <Form
      variant={variant}
      title="Sign In"
      description="Welcome back! Sign in to your BoxCall account."
      onSubmit={handleSubmit}
      loading={loading}
      className={className}
      footer={
        <FormActions align="between">
          <div className="flex flex-col space-y-2">
            {onForgotPassword && (
              <Button variant="ghost" size="sm" onClick={onForgotPassword}>
                Forgot your password?
              </Button>
            )}
            {onSignUp && (
              <div className="flex items-center space-x-1">
                <Typography variant="body-sm" color="muted">
                  Don't have an account?
                </Typography>
                <Button variant="ghost" size="sm" onClick={onSignUp}>
                  Sign up
                </Button>
              </div>
            )}
          </div>
          <Button type="submit" variant="primary" loading={loading}>
            Sign In
          </Button>
        </FormActions>
      }
    >
      {error && (
        <div className="p-3 bg-error-bg rounded-lg">
          <Typography variant="body-sm" className="text-error">
            {error}
          </Typography>
        </div>
      )}
      {/* Social Login */}
      {showSocialLogin && (
        <div className="space-y-3">
          <Button variant="secondary" className="w-full" disabled={loading}>
            <span className="mr-2">
              <Icon
                name="link"
                className="inline h-4 w-4 align-middle text-primary"
              />
            </span>
            Continue with Google
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-primary text-secondary">
                Or continue with email
              </span>
            </div>
          </div>
        </div>
      )}
      {/* Email Field */}
      <FormField label="Email" required error={validationErrors.email}>
        <Input
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          status={validationErrors.email ? "error" : undefined}
          disabled={loading}
          fullWidth
        />
      </FormField>
      {/* Password Field */}
      <FormField label="Password" required error={validationErrors.password}>
        <Input
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={(e) => handleInputChange("password", e.target.value)}
          status={validationErrors.password ? "error" : undefined}
          showPasswordToggle
          disabled={loading}
          fullWidth
        />
      </FormField>
      {/* Remember Me */}
      <div className="flex items-center">
        <input
          id="remember-me"
          type="checkbox"
          checked={formData.rememberMe}
          onChange={(e) => handleInputChange("rememberMe", e.target.checked)}
          className="h-4 w-4 text-primary focus:ring-text-primary rounded-lg"
          disabled={loading}
        />
        <label
          htmlFor="remember-me"
          className="ml-2 block text-sm text-primary dark:text-border-light"
        >
          {" "}
          Remember me
        </label>
      </div>
    </Form>
  );
}

// Signup form validation
function validateSignupForm(formData: SignupData): Partial<SignupData> {
  const errors: Partial<SignupData> = {};

  if (!formData.name.trim()) {
    errors.name = "Name is required";
  }

  if (!formData.email) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = "Please enter a valid email address";
  }

  if (!formData.password) {
    errors.password = "Password is required";
  } else {
    const passwordValidation = validatePasswordStrength(formData.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.message;
    }
  }

  const confirmValidation = validatePasswordConfirmation(
    formData.password,
    formData.confirmPassword
  );
  if (!confirmValidation.isValid) {
    errors.confirmPassword = confirmValidation.message;
  }

  if (!formData.acceptTerms) {
    errors.acceptTerms = "You must accept the terms and conditions" as never;
  }

  return errors;
}

const SocialSignupSection: React.FC<{ loading: boolean }> = ({ loading }) => (
  <div className="space-y-3">
    <Button variant="secondary" className="w-full" disabled={loading}>
      <span className="mr-2">
        <Icon
          name="link"
          className="inline h-4 w-4 align-middle text-primary"
        />
      </span>
      Sign up with Google
    </Button>
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-2 bg-primary text-secondary">
          Or sign up with email
        </span>
      </div>
    </div>
  </div>
);

const SignupFormFields: React.FC<{
  formData: SignupData;
  validationErrors: Partial<SignupData>;
  loading: boolean;
  onInputChange: (field: keyof SignupData, value: string | boolean) => void;
}> = ({ formData, validationErrors, loading, onInputChange }) => (
  <>
    <FormField label="Full Name" required error={validationErrors.name}>
      <Input
        type="text"
        placeholder="Enter your full name"
        value={formData.name}
        onChange={(e) => onInputChange("name", e.target.value)}
        status={validationErrors.name ? "error" : undefined}
        disabled={loading}
        fullWidth
      />
    </FormField>

    <FormField label="Email" required error={validationErrors.email}>
      <Input
        type="email"
        placeholder="Enter your email"
        value={formData.email}
        onChange={(e) => onInputChange("email", e.target.value)}
        status={validationErrors.email ? "error" : undefined}
        disabled={loading}
        fullWidth
      />
    </FormField>

    <FormField
      label="Role"
      description="Select your primary role in the team"
      required
    >
      <FormSelect
        value={formData.role}
        onChange={(value) => onInputChange("role", value as SignupData["role"])}
        disabled={loading}
        options={[
          { value: "player", label: "Player" },
          { value: "coach", label: "Coach" },
          { value: "admin", label: "Team Admin" },
          { value: "parent", label: "Parent/Guardian" },
        ]}
      />
    </FormField>

    <FormField
      label="Password"
      description="Must be at least 8 characters with uppercase, lowercase, and number"
      required
      error={validationErrors.password}
    >
      <Input
        type="password"
        placeholder="Create a strong password"
        value={formData.password}
        onChange={(e) => onInputChange("password", e.target.value)}
        status={validationErrors.password ? "error" : undefined}
        showPasswordToggle
        disabled={loading}
        fullWidth
      />
      <PasswordStrengthIndicator password={formData.password} />
    </FormField>

    <FormField
      label="Confirm Password"
      required
      error={validationErrors.confirmPassword}
    >
      <Input
        type="password"
        placeholder="Confirm your password"
        value={formData.confirmPassword}
        onChange={(e) => onInputChange("confirmPassword", e.target.value)}
        status={validationErrors.confirmPassword ? "error" : undefined}
        disabled={loading}
        fullWidth
      />
    </FormField>

    <div className="space-y-2">
      <div className="flex items-start">
        <input
          id="accept-terms"
          type="checkbox"
          checked={formData.acceptTerms}
          onChange={(e) => onInputChange("acceptTerms", e.target.checked)}
          className="h-4 w-4 text-info focus:ring-jade-500 rounded-lg mt-1"
          disabled={loading}
        />
        <label
          htmlFor="accept-terms"
          className="ml-2 block text-sm text-primary dark:text-border-light"
        >
          I agree to the{" "}
          <a href="/terms" className="text-primary hover:text-secondary">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-primary hover:text-secondary">
            Privacy Policy
          </a>
        </label>
      </div>
      {validationErrors.acceptTerms && (
        <Typography variant="caption" className="text-error dark:text-error">
          {validationErrors.acceptTerms}
        </Typography>
      )}
    </div>
  </>
);

/**
 * SignupForm - Professional signup form with validation
 */
export function SignupForm({
  onSubmit,
  loading = false,
  error = null,
  variant = "card",
  onLogin,
  showSocialSignup = true,
  className = "",
}: SignupFormProps) {
  const [formData, setFormData] = useState<SignupData>({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    role: "player",
    acceptTerms: false,
  });
  const [validationErrors, setValidationErrors] = useState<Partial<SignupData>>(
    {}
  );

  const validateForm = (): boolean => {
    const errors = validateSignupForm(formData);
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    await onSubmit(formData);
  };
  const handleInputChange = (
    field: keyof SignupData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };
  return (
    <Form
      variant={variant}
      title="Create Account"
      description="Join BoxCall and start managing your football team today!"
      onSubmit={handleSubmit}
      loading={loading}
      className={className}
      footer={
        <FormActions align="between">
          <div className="flex items-center space-x-1">
            <Typography variant="body-sm" color="muted">
              Already have an account?
            </Typography>
            {onLogin && (
              <Button variant="ghost" size="sm" onClick={onLogin}>
                Sign in
              </Button>
            )}
          </div>
          <Button type="submit" variant="primary" loading={loading}>
            Create Account
          </Button>
        </FormActions>
      }
    >
      {/* Error Message */}
      {error && (
        <div className="p-3 bg-subtle dark:bg-surface-error/20 rounded-lg">
          <Typography variant="body-sm" className="text-error dark:text-error">
            {error}
          </Typography>
        </div>
      )}

      {/* Social Signup */}
      {showSocialSignup && <SocialSignupSection loading={loading} />}

      {/* Form Fields */}
      <SignupFormFields
        formData={formData}
        validationErrors={validationErrors}
        loading={loading}
        onInputChange={handleInputChange}
      />
    </Form>
  );
}
/**
 * ResetPasswordForm - Password reset form
 */
export function ResetPasswordForm({
  onSubmit,
  loading = false,
  error = null,
  variant = "card",
  onBackToLogin,
  className = "",
}: ResetPasswordFormProps) {
  const [formData, setFormData] = useState<ResetPasswordData>({
    email: "",
  });
  const [validationErrors, setValidationErrors] = useState<
    Partial<ResetPasswordData>
  >({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const validateForm = (): boolean => {
    const errors: Partial<ResetPasswordData> = {};
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const handleSubmit = async () => {
    if (!validateForm()) return;
    await onSubmit(formData);
    setIsSubmitted(true);
  };
  const handleInputChange = (field: keyof ResetPasswordData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };
  if (isSubmitted && !error) {
    return (
      <Form
        variant={variant}
        title="Check Your Email"
        description="We've sent password reset instructions to your email address."
        className={className}
        footer={
          <FormActions align="center">
            {onBackToLogin && (
              <Button variant="ghost" onClick={onBackToLogin}>
                Back to Sign In
              </Button>
            )}
          </FormActions>
        }
      >
        <div className="text-center py-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-success-bg mb-4">
            <Icon name="mail" size="md" className="text-success" />
          </div>
          <Typography variant="body-md" color="muted">
            If an account with that email exists, you'll receive password reset
            instructions shortly.
          </Typography>
        </div>
      </Form>
    );
  }
  return (
    <Form
      variant={variant}
      title="Reset Password"
      description="Enter your email address and we'll send you instructions to reset your password."
      onSubmit={handleSubmit}
      loading={loading}
      className={className}
      footer={
        <FormActions align="between">
          {onBackToLogin && (
            <Button variant="ghost" size="sm" onClick={onBackToLogin}>
              ← Back to Sign In
            </Button>
          )}
          <Button type="submit" variant="primary" loading={loading}>
            Send Reset Instructions
          </Button>
        </FormActions>
      }
    >
      {/* Error Message */}
      {error && (
        <div className="p-3 bg-subtle dark:bg-surface-error/20 rounded-lg">
          <Typography variant="body-sm" className="text-error dark:text-error">
            {error}
          </Typography>
        </div>
      )}
      {/* Email Field */}
      <FormField
        label="Email"
        description="Enter the email address associated with your account"
        required
        error={validationErrors.email}
      >
        <Input
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          status={validationErrors.email ? "error" : undefined}
          disabled={loading}
          fullWidth
        />
      </FormField>
    </Form>
  );
}
// Main Auth component that can render different auth forms
export interface AuthProps {
  /** Auth mode to display */
  mode?: "login" | "signup" | "reset";
  /** Callback when auth mode changes */
  onModeChange?: (mode: "login" | "signup" | "reset") => void;
  /** Auth submission handlers */
  onLogin?: (data: LoginCredentials) => void | Promise<void>;
  onSignup?: (data: SignupData) => void | Promise<void>;
  onResetPassword?: (data: ResetPasswordData) => void | Promise<void>;
  /** Loading states */
  loginLoading?: boolean;
  signupLoading?: boolean;
  resetLoading?: boolean;
  /** Error states */
  loginError?: string | null;
  signupError?: string | null;
  resetError?: string | null;
  /** Form variant */
  variant?: "card" | "modal" | "inline";
  /** Additional CSS classes */
  className?: string;
}
export function Auth({
  mode = "login",
  onModeChange,
  onLogin,
  onSignup,
  onResetPassword,
  loginLoading = false,
  signupLoading = false,
  resetLoading = false,
  loginError = null,
  signupError = null,
  resetError = null,
  variant = "card",
  className = "",
}: AuthProps) {
  const handleModeChange = (newMode: "login" | "signup" | "reset") => {
    onModeChange?.(newMode);
  };
  const renderForm = () => {
    switch (mode) {
      case "login":
        return (
          <LoginForm
            onSubmit={onLogin || (() => {})}
            loading={loginLoading}
            error={loginError}
            variant={variant}
            onSignUp={() => handleModeChange("signup")}
            onForgotPassword={() => handleModeChange("reset")}
          />
        );
      case "signup":
        return (
          <SignupForm
            onSubmit={onSignup || (() => {})}
            loading={signupLoading}
            error={signupError}
            variant={variant}
            onLogin={() => handleModeChange("login")}
          />
        );
      case "reset":
        return (
          <ResetPasswordForm
            onSubmit={onResetPassword || (() => {})}
            loading={resetLoading}
            error={resetError}
            variant={variant}
            onBackToLogin={() => handleModeChange("login")}
          />
        );
      default:
        return null;
    }
  };
  return <div className={className}>{renderForm()}</div>;
}
export default Auth;
