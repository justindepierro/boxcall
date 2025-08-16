import React, { useState } from "react";
import { useAuth } from "../../app/auth-store";
import { Typography } from "../design-system";
import { Button, Card, Input, Select } from "../ui";
import { AuthLogo } from "../ui/Logo";
interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}
/**
 * RegisterForm Component
 *
 * Professional registration form with role selection
 * Creates both auth user and profile in database
 */
export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onSwitchToLogin,
}) => {
  const { signUp, loading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "coach" as "coach" | "player" | "family" | "admin",
  });
  const [validationErrors, setValidationErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    role?: string;
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
    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    }
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
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (!formData.role) {
      errors.role = "Please select your role";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    const result = await signUp(formData.email, formData.password, {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      role: formData.role,
    });
    if (result.success) {
      onSuccess?.();
    }
  };
  const roleOptions = [
    { value: "coach", label: "Coach" },
    { value: "player", label: "Player" },
    { value: "family", label: "Family Member" },
    { value: "admin", label: "Administrator" },
  ];
  return (
    <Card className="w-full max-w-md mx-auto bc-card-padding">
      <div className="bc-card-padding">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <AuthLogo />
          </div>
          <Typography variant="headline-lg" as="h2" className="mb-2">
            Join BoxCall
          </Typography>
          <Typography variant="body-md" color="muted">
            Create your account to get started
          </Typography>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="text"
              label="First Name"
              placeholder="John"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              status={validationErrors.firstName ? "error" : undefined}
              errorMessage={validationErrors.firstName}
              required
              fullWidth
            />
            <Input
              type="text"
              label="Last Name"
              placeholder="Smith"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              status={validationErrors.lastName ? "error" : undefined}
              errorMessage={validationErrors.lastName}
              required
              fullWidth
            />
          </div>
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
          <Select
            label="Role"
            value={formData.role}
            onChange={(value) => handleInputChange("role", String(value))}
            options={roleOptions}
            status={validationErrors.role ? "error" : undefined}
            errorMessage={validationErrors.role}
            required
            fullWidth
          />
          <Input
            type="password"
            label="Password"
            placeholder="Create a password"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            status={validationErrors.password ? "error" : undefined}
            errorMessage={validationErrors.password}
            showPasswordToggle
            required
            fullWidth
          />
          <Input
            type="password"
            label="Confirm Password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={(e) =>
              handleInputChange("confirmPassword", e.target.value)
            }
            status={validationErrors.confirmPassword ? "error" : undefined}
            errorMessage={validationErrors.confirmPassword}
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
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
        <div className="mt-6 text-center">
          <Typography variant="body-sm" color="muted">
            Already have an account?{" "}
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={onSwitchToLogin}
              className="p-0 h-auto align-baseline font-medium"
            >
              Sign in here
            </Button>
          </Typography>
        </div>
      </div>
    </Card>
  );
};
