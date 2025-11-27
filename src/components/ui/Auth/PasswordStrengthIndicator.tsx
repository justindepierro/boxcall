// Password Strength Indicator Component
import { Typography } from "../../design-system";
import { validatePasswordStrength } from "../../../utils/passwordValidation";

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

export function PasswordStrengthIndicator({
  password,
  className = "",
}: PasswordStrengthIndicatorProps) {
  const validation = validatePasswordStrength(password);

  if (!password) {
    return (
      <div className={`mt-2 ${className}`}>
        <Typography variant="caption" color="muted">
          Password must be at least 12 characters with mixed case, numbers, and
          symbols
        </Typography>
      </div>
    );
  }

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case "weak":
        return "bg-error";
      case "medium":
        return "bg-warning";
      case "strong":
        return "bg-success";
      default:
        return "bg-muted";
    }
  };

  const getStrengthWidth = (strength: string) => {
    switch (strength) {
      case "weak":
        return "w-1/3";
      case "medium":
        return "w-2/3";
      case "strong":
        return "w-full";
      default:
        return "w-0";
    }
  };

  return (
    <div className={`mt-2 space-y-2 ${className}`}>
      {/* Strength bar */}
      <div className="w-full bg-border dark:bg-text-primary rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(
            validation.strength
          )} ${getStrengthWidth(validation.strength)}`}
        />
      </div>

      {/* Requirements checklist */}
      <div className="space-y-1">
        <Typography
          variant="caption"
          className={`flex items-center space-x-2 ${
            password.length >= 12 ? "text-success" : "text-error"
          }`}
        >
          <span className="text-xs">{password.length >= 12 ? "✓" : "✗"}</span>
          <span>At least 12 characters</span>
        </Typography>

        <Typography
          variant="caption"
          className={`flex items-center space-x-2 ${
            /[a-z]/.test(password) ? "text-success" : "text-error"
          }`}
        >
          <span className="text-xs">{/[a-z]/.test(password) ? "✓" : "✗"}</span>
          <span>Lowercase letter</span>
        </Typography>

        <Typography
          variant="caption"
          className={`flex items-center space-x-2 ${
            /[A-Z]/.test(password) ? "text-success" : "text-error"
          }`}
        >
          <span className="text-xs">{/[A-Z]/.test(password) ? "✓" : "✗"}</span>
          <span>Uppercase letter</span>
        </Typography>

        <Typography
          variant="caption"
          className={`flex items-center space-x-2 ${
            /\d/.test(password) ? "text-success" : "text-error"
          }`}
        >
          <span className="text-xs">{/\d/.test(password) ? "✓" : "✗"}</span>
          <span>Number</span>
        </Typography>

        <Typography
          variant="caption"
          className={`flex items-center space-x-2 ${
            /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
              ? "text-success"
              : "text-error"
          }`}
        >
          <span className="text-xs">
            {/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) ? "✓" : "✗"}
          </span>
          <span>Special character</span>
        </Typography>
      </div>

      {/* Strength message */}
      <Typography
        variant="caption"
        className={`font-medium ${
          validation.strength === "strong"
            ? "text-success"
            : validation.strength === "medium"
              ? "text-warning"
              : "text-error"
        }`}
      >
        {validation.message}
      </Typography>
    </div>
  );
}
