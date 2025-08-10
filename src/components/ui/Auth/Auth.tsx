import { useState } from "react";
import { Typography } from "../../design-system";
import { Button } from "../Button";
import { Form, FormActions, FormField } from "../Form";
import { Input } from "../Input";
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
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
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
      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <Typography
            variant="body-sm"
            className="text-red-700 dark:text-red-400"
          >
            {error}
          </Typography>
        </div>
      )}
      {/* Social Login */}
      {showSocialLogin && (
        <div className="space-y-3">
          <Button variant="outline" className="w-full" disabled={loading}>
            <span className="mr-2">🔗</span>
            Continue with Google
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
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
          className="h-4 w-4 text-blue-600 focus:ring-jade-500 border-gray-300 rounded"
          disabled={loading}
        />
        <label
          htmlFor="remember-me"
          className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
        >
          Remember me
        </label>
      </div>
    </Form>
  );
}
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
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password =
        "Password must contain uppercase, lowercase, and number";
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    if (!formData.acceptTerms) {
      errors.acceptTerms = "You must accept the terms and conditions" as never;
    }
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
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <Typography
            variant="body-sm"
            className="text-red-700 dark:text-red-400"
          >
            {error}
          </Typography>
        </div>
      )}
      {/* Social Signup */}
      {showSocialSignup && (
        <div className="space-y-3">
          <Button variant="outline" className="w-full" disabled={loading}>
            <span className="mr-2">🔗</span>
            Sign up with Google
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                Or sign up with email
              </span>
            </div>
          </div>
        </div>
      )}
      {/* Name Field */}
      <FormField label="Full Name" required error={validationErrors.name}>
        <Input
          type="text"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          status={validationErrors.name ? "error" : undefined}
          disabled={loading}
          fullWidth
        />
      </FormField>
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
      {/* Role Selection */}
      <FormField
        label="Role"
        description="Select your primary role in the team"
        required
      >
        <select
          value={formData.role}
          onChange={(e) =>
            handleInputChange("role", e.target.value as SignupData["role"])
          }
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-jade-500 focus:border-jade-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          disabled={loading}
        >
          <option value="player">Player</option>
          <option value="coach">Coach</option>
          <option value="admin">Team Admin</option>
          <option value="parent">Parent/Guardian</option>
        </select>
      </FormField>
      {/* Password Field */}
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
          onChange={(e) => handleInputChange("password", e.target.value)}
          status={validationErrors.password ? "error" : undefined}
          showPasswordToggle
          disabled={loading}
          fullWidth
        />
      </FormField>
      {/* Confirm Password Field */}
      <FormField
        label="Confirm Password"
        required
        error={validationErrors.confirmPassword}
      >
        <Input
          type="password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
          status={validationErrors.confirmPassword ? "error" : undefined}
          disabled={loading}
          fullWidth
        />
      </FormField>
      {/* Terms Acceptance */}
      <div className="space-y-2">
        <div className="flex items-start">
          <input
            id="accept-terms"
            type="checkbox"
            checked={formData.acceptTerms}
            onChange={(e) => handleInputChange("acceptTerms", e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-jade-500 border-gray-300 rounded mt-1"
            disabled={loading}
          />
          <label
            htmlFor="accept-terms"
            className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
          >
            I agree to the{" "}
            <a href="/terms" className="text-blue-600 hover:text-blue-500">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-blue-600 hover:text-blue-500">
              Privacy Policy
            </a>
          </label>
        </div>
        {validationErrors.acceptTerms && (
          <Typography
            variant="caption"
            className="text-red-600 dark:text-red-400"
          >
            {validationErrors.acceptTerms}
          </Typography>
        )}
      </div>
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
              <Button variant="outline" onClick={onBackToLogin}>
                Back to Sign In
              </Button>
            )}
          </FormActions>
        }
      >
        <div className="text-center py-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
            <span className="text-2xl">✉️</span>
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
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <Typography
            variant="body-sm"
            className="text-red-700 dark:text-red-400"
          >
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
