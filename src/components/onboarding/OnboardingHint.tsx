import React, { useEffect } from "react";

import { telemetry } from "../../lib/telemetry";
import { Typography } from "../design-system";
import { Button } from "../ui";
import { Icon } from "../ui/Icon/Icon";

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
                ? "bg-[var(--semantic-primary-hover)] hover:bg-[var(--semantic-primary-active)] text-[var(--semantic-text-inverse)] border border-[var(--semantic-primary-hover)] hover:border-[var(--semantic-primary-active)]"
                : a.variant === "secondary"
                  ? "border-subtle surface-subtle-hover text-text-primary"
                  : "text-[var(--semantic-primary-hover)] hover:text-[var(--semantic-primary-active)] hover:underline";
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
