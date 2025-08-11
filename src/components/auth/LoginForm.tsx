import React, { useState } from "react";
import { useAuth } from "../../app/auth-store";
import { Typography } from "../design-system";
import { Button, Card, Input } from "../ui";
import { AuthLogo } from "../ui/Logo";
interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}
/**
 * LoginForm Component
 *
 * Professional login form with email/password authentication
 * Integrates with our Supabase auth store
 */
export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToRegister,
}) => {
  const { signIn, loading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field as keyof typeof validationErrors]) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    // Clear auth error
    if (error) {
      clearError();
    }
  };
  const validateForm = () => {
    const errors: typeof validationErrors = {};
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    const result = await signIn(formData.email, formData.password);
    if (result.success) {
      onSuccess?.();
    }
  };
  return (
    <Card className="w-full max-w-md mx-auto bc-card-padding">
      <div className="bc-card-padding">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <AuthLogo />
          </div>
          <Typography variant="headline-lg" as="h2" className="mb-2">
            Welcome Back
          </Typography>
          <Typography variant="body-md" color="muted">
            Sign in to your BoxCall account
          </Typography>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            label="Email"
            placeholder="coach@team.com"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            status={validationErrors.email ? "error" : undefined}
            errorMessage={validationErrors.email}
            required
            fullWidth
          />
          <Input
            type="password"
            label="Password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            status={validationErrors.password ? "error" : undefined}
            errorMessage={validationErrors.password}
            showPasswordToggle
            required
            fullWidth
          />
          {error && (
            <div className="p-3 surface-subtle dark:bg-red-900/10 border border-subtle dark:border-red-800 rounded-md">
              <Typography
                variant="body-sm"
                className="text-red-700 dark:text-red-400"
              >
                {error}
              </Typography>
            </div>
          )}
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading}
            fullWidth
            size="lg"
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>
        <div className="mt-6 text-center">
          <Typography variant="body-sm" color="muted">
            Don't have an account?{" "}
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={onSwitchToRegister}
              className="p-0 h-auto align-baseline font-medium"
            >
              Sign up here
            </Button>
          </Typography>
        </div>
      </div>
    </Card>
  );
};
