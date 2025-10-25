/**
 * Sign Up Form for Invitation Flow
 * Simplified registration form for accepting team invitations
 */

import React, { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../app/auth-store";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

interface SignUpFormProps {
  prefilledEmail?: string;
  prefilledFirstName?: string;
  prefilledLastName?: string;
  onSuccess?: (userId: string) => void;
  redirectTo?: string;
}

export function SignUpForm({
  prefilledEmail = "",
  prefilledFirstName = "",
  prefilledLastName = "",
  onSuccess,
}: SignUpFormProps) {
  const { signUp, loading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    firstName: prefilledFirstName,
    lastName: prefilledLastName,
    email: prefilledEmail,
    password: "",
    confirmPassword: "",
  });
  const [validationErrors, setValidationErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field as keyof typeof validationErrors]) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
    }
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
      role: "player", // Default role for invited players
    });

    if (result.success) {
      // Get the newly created user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        onSuccess?.(user.id);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="text"
        label="First Name"
        placeholder="Enter your first name"
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
        placeholder="Enter your last name"
        value={formData.lastName}
        onChange={(e) => handleInputChange("lastName", e.target.value)}
        status={validationErrors.lastName ? "error" : undefined}
        errorMessage={validationErrors.lastName}
        required
        fullWidth
      />

      <Input
        type="email"
        label="Email"
        placeholder="your@email.com"
        value={formData.email}
        onChange={(e) => handleInputChange("email", e.target.value)}
        status={validationErrors.email ? "error" : undefined}
        errorMessage={validationErrors.email}
        required
        fullWidth
        disabled={!!prefilledEmail} // Disable if prefilled from invitation
      />

      <Input
        type="password"
        label="Password"
        placeholder="Create a password (min. 6 characters)"
        value={formData.password}
        onChange={(e) => handleInputChange("password", e.target.value)}
        status={validationErrors.password ? "error" : undefined}
        errorMessage={validationErrors.password}
        required
        fullWidth
      />

      <Input
        type="password"
        label="Confirm Password"
        placeholder="Re-enter your password"
        value={formData.confirmPassword}
        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
        status={validationErrors.confirmPassword ? "error" : undefined}
        errorMessage={validationErrors.confirmPassword}
        required
        fullWidth
      />

      {error && (
        <div className="bg-error-bg border border-error-200 text-error-800 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      <Button type="submit" fullWidth disabled={loading}>
        {loading ? "Creating Account..." : "Create Account & Join Team"}
      </Button>

      <p className="text-xs text-muted text-center">
        By creating an account, you agree to our Terms of Service and Privacy
        Policy.
      </p>
    </form>
  );
}
