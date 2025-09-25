import React, { useEffect } from "react";
import { Typography } from "../design-system";
import { Icon } from "../ui/Icon/Icon";
import { Button } from "../ui";
import { telemetry } from "../../lib/telemetry";

/**
 * Generic lightweight onboarding / empty-state hint component.
 * Keeps UI consistent while we replace mock data with guided tutorials.
 */
export interface OnboardingHintAction {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
}

// Derive IconName from Icon props if possible; otherwise fallback to string.
// We avoid using 'any' to satisfy lint rules.
type ExtractIconProp<T> = T extends { name: infer N } ? N : never;
type IconName =
  ExtractIconProp<Parameters<typeof Icon>[0]> extends never
    ? string
    : ExtractIconProp<Parameters<typeof Icon>[0]>;

interface OnboardingHintProps {
  icon?: IconName; // Icon name from shared Icon set
  title: string;
  message?: string;
  steps?: string[]; // Optional ordered guidance
  actions?: OnboardingHintAction[];
  className?: string;
}

export const OnboardingHint: React.FC<OnboardingHintProps> = ({
  icon = "info",
  title,
  message,
  steps,
  actions = [],
  className = "",
}) => {
  // Fire a single view event when mounted
  useEffect(() => {
    telemetry.onboardingView(title.toLowerCase().replace(/\s+/g, "_"));
  }, [title]);

  return (
    <div className={`surface-card border-subtle rounded-lg p-6 ${className}`}>
      <div className="flex items-start gap-3 mb-3">
        <div className="mt-0.5">
          <Icon name={icon as IconName} size="md" />
        </div>
        <div>
          <Typography variant="headline-sm" className="mb-1">
            {title}
          </Typography>
          {message && (
            <Typography
              variant="body-sm"
              color="muted"
              className="leading-relaxed"
            >
              {message}
            </Typography>
          )}
        </div>
      </div>
      {steps && steps.length > 0 && (
        <ol className="list-decimal list-inside space-y-1 text-sm text-text-secondary mb-4">
          {steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      )}
      {actions.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-2">
          {actions.map((a, i) => {
            const base =
              a.variant === "primary"
                ? "bg-jade-600 hover:bg-brand-jade-dark text-text-inverse"
                : a.variant === "secondary"
                  ? "border-subtle surface-subtle-hover"
                  : "text-jade-600 dark:text-jade-400 hover:underline";
            if (a.href) {
              return (
                <a
                  key={i}
                  href={a.href}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${base}`}
                  onClick={() => telemetry.onboardingAction(a.label)}
                >
                  {a.label}
                </a>
              );
            }
            return (
              <Button
                key={i}
                onClick={() => {
                  telemetry.onboardingAction(a.label);
                  a.onClick?.();
                }}
                variant={
                  a.variant === "primary"
                    ? "primary"
                    : a.variant === "secondary"
                      ? "outline"
                      : "link"
                }
                size="sm"
              >
                {a.label}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
};
