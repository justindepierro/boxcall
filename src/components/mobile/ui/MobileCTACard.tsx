import React from "react";
import { Card } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Icon } from "../../ui/Icon";
import type { IconName } from "../../ui/Icon/Icon";

export interface MobileCTACardProps {
  /** Icon name to display */
  icon?: IconName;
  /** Card title (large, bold) */
  title: string;
  /** Supporting description text */
  description: string;
  /** Button label */
  action: string;
  /** Visual variant */
  variant?: "primary" | "secondary" | "accent";
  /** Optional illustration component */
  illustration?: React.ReactNode;
  /** Click handler */
  onTap: () => void;
  /** Optional class name */
  className?: string;
}

/**
 * MobileCTACard - Hero Call-to-Action Card
 *
 * A prominent card component designed for mobile-first experiences.
 * Perfect for empty states, primary actions, and feature highlighting.
 *
 * @example
 * ```tsx
 * <MobileCTACard
 *   icon="plus"
 *   title="Create Your First Play"
 *   description="Build offensive and defensive plays with our diagram editor"
 *   action="Get Started"
 *   variant="primary"
 *   onTap={() => navigate('/playbook/new')}
 * />
 * ```
 *
 * Specifications:
 * - Height: 180px minimum (auto-adjusts for content)
 * - Touch target: Full card is tappable
 * - Text: 16px minimum for body, 24px for title
 * - Padding: 24px for comfortable spacing
 * - Animation: Scale down on tap (active feedback)
 */
export function MobileCTACard({
  icon,
  title,
  description,
  action,
  variant = "primary",
  illustration,
  onTap,
}: MobileCTACardProps) {
  const variantStyles = {
    primary: "bg-gradient-to-br from-brand-primary/5 to-brand-primary/10",
    secondary: "bg-secondary",
    accent: "bg-gradient-to-br from-purple-500/5 to-purple-600/10",
  };

  // Map variant to Button variant type
  const buttonVariant = (() => {
    if (variant === "accent") return "primary";
    return variant;
  })();

  return (
    <Card
      className={`
        relative overflow-hidden
        min-h-45 p-6 rounded-2xl
        active:scale-[0.98] transition-all duration-200
        shadow-sm active:shadow-md
        cursor-pointer
        ${variantStyles[variant]}
      `}
      onClick={onTap}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onTap();
        }
      }}
    >
      {/* Icon or Illustration */}
      {(() => {
        if (illustration) {
          return <div className="w-20 h-20">{illustration}</div>;
        }
        if (icon) {
          return (
            <div
              className="
              w-16 h-16 rounded-full 
              bg-brand-primary/10 
              flex items-center justify-center
            "
            >
              <Icon name={icon} size="xl" className="text-brand-primary" />
            </div>
          );
        }
        return null;
      })()}

      {/* Title */}
      <h3 className="text-2xl font-semibold text-primary leading-tight">
        {title}
      </h3>

      {/* Description */}
      <p className="text-base text-muted max-w-sm leading-relaxed">
        {description}
      </p>

      {/* CTA Button */}
      <Button
        variant={buttonVariant}
        size="lg"
        className="min-h-12 w-full max-w-xs mt-2"
      >
        {action}
      </Button>
    </Card>
  );
}
