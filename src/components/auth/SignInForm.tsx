/**
 * Sign In Form for Invitation Flow
 * Simplified login form for existing users accepting invitations
 */

import React, { useState } from 'react';
import { useAuth } from '../../app/auth-store';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface SignInFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export function SignInForm({ onSuccess }: SignInFormProps) {
  const { signIn, loading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
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

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="email"
        label="Email"
        placeholder="your@email.com"
        value={formData.email}
        onChange={(e) => handleInputChange('email', e.target.value)}
        status={validationErrors.email ? 'error' : undefined}
        errorMessage={validationErrors.email}
        required
        fullWidth
      />

      <Input
        type="password"
        label="Password"
        placeholder="Enter your password"
        value={formData.password}
        onChange={(e) => handleInputChange('password', e.target.value)}
        status={validationErrors.password ? 'error' : undefined}
        errorMessage={validationErrors.password}
        required
        fullWidth
      />

      {error && (
        <div className="bg-error-bg border border-error-200 text-error-800 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      <Button type="submit" fullWidth disabled={loading}>
        {loading ? 'Signing In...' : 'Sign In & Join Team'}
      </Button>

      <p className="text-xs text-muted text-center">
        <a href="/forgot-password" className="text-primary hover:underline">
          Forgot your password?
        </a>
      </p>
    </form>
  );
}
