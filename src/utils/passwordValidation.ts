// Password validation utilities
export const validatePasswordStrength = (
  password: string
): {
  isValid: boolean;
  message: string;
  strength: "weak" | "medium" | "strong";
} => {
  // Simple 6 character minimum for development
  const minLength = 6;

  if (password.length < minLength) {
    return {
      isValid: false,
      message: `Password must be at least ${minLength} characters`,
      strength: "weak",
    };
  }

  // Any password with 6+ characters is valid
  if (password.length >= 10) {
    return { isValid: true, message: "Strong password", strength: "strong" };
  }

  if (password.length >= 8) {
    return {
      isValid: true,
      message: "Medium strength password",
      strength: "medium",
    };
  }

  return { isValid: true, message: "Password accepted", strength: "weak" };
};

export const validatePasswordConfirmation = (
  password: string,
  confirmPassword: string
): { isValid: boolean; message: string } => {
  if (password !== confirmPassword) {
    return { isValid: false, message: "Passwords do not match" };
  }
  return { isValid: true, message: "" };
};
