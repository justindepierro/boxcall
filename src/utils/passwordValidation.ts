// Password validation utilities
export const validatePasswordStrength = (password: string): { isValid: boolean; message: string; strength: 'weak' | 'medium' | 'strong' } => {
  const minLength = 12;
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  if (password.length < minLength) {
    return { isValid: false, message: `Password must be at least ${minLength} characters`, strength: 'weak' };
  }

  const criteriaMet = [hasLowerCase, hasUpperCase, hasNumbers, hasSpecialChar].filter(Boolean).length;

  if (criteriaMet < 3) {
    return {
      isValid: false,
      message: 'Password must contain at least 3 of: lowercase, uppercase, numbers, special characters',
      strength: 'weak'
    };
  }

  if (criteriaMet === 3) {
    return { isValid: true, message: 'Medium strength password', strength: 'medium' };
  }

  return { isValid: true, message: 'Strong password', strength: 'strong' };
};

export const validatePasswordConfirmation = (password: string, confirmPassword: string): { isValid: boolean; message: string } => {
  if (password !== confirmPassword) {
    return { isValid: false, message: 'Passwords do not match' };
  }
  return { isValid: true, message: '' };
};