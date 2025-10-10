import React from "react";
import { Typography } from "../design-system/Typography";

export interface MobilePageHeaderProps {
  /** Main page title */
  title: string;
  /** Optional subtitle/metadata */
  subtitle?: string;
  /** Optional greeting text (e.g., "Good morning") */
  greeting?: string;
  /** Optional badge component */
  badge?: React.ReactNode;
  /** Optional action buttons/icons */
  actions?: React.ReactNode;
  /** Optional avatar component */
  avatar?: React.ReactNode;
  /** Optional class name */
  className?: string;
}

/**
 * MobilePageHeader - Consistent Page Header Component
 *
 * Provides a standardized header for mobile pages with optional
 * greeting, subtitle, badge, and action elements.
 *
 * @example
 * ```tsx
 * // Simple header
 * <MobilePageHeader title="Playbook" subtitle="0/100 plays" />
 *
 * // Header with greeting and avatar
 * <MobilePageHeader
 *   greeting="Good morning"
 *   title="Justin DePierro"
 *   subtitle="Head Coach"
 *   avatar={<Avatar src="/avatar.jpg" size="48px" />}
 *   actions={<NotificationButton badge={3} />}
 * />
 *
 * // Header with badge
 * <MobilePageHeader
 *   title="Playbook"
 *   subtitle="0/100 plays"
 *   badge={<ProgressBadge value={0} total={100} />}
 *   actions={<IconButton icon="settings" />}
 * />
 * ```
 *
 * Specifications:
 * - Title: 24px bold
 * - Subtitle: 14px regular, muted
 * - Greeting: 16px regular, muted
 * - Padding: 16px horizontal, 12px vertical on mobile
 * - Layout: Responsive flex with proper alignment
 */
export function MobilePageHeader({
  title,
  subtitle,
  greeting,
  badge,
  actions,
  avatar,
  className = "",
}: MobilePageHeaderProps) {
  return (
    <header
      className={`
        px-4 py-3 
        sm:px-6 sm:py-4
        bg-surface-base
        border-b border-subtle
        ${className}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left side: Avatar + Text */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {avatar && <div className="flex-shrink-0 pt-1">{avatar}</div>}

          <div className="flex-1 min-w-0">
            {/* Greeting */}
            {greeting && (
              <Typography variant="body" className="text-muted text-sm mb-0.5">
                {greeting}
              </Typography>
            )}

            {/* Title */}
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-semibold text-primary truncate">
                {title}
              </h1>
              {badge && <div className="flex-shrink-0">{badge}</div>}
            </div>

            {/* Subtitle */}
            {subtitle && (
              <Typography
                variant="body"
                className="text-muted text-sm mt-0.5 line-clamp-1"
              >
                {subtitle}
              </Typography>
            )}
          </div>
        </div>

        {/* Right side: Actions */}
        {actions && <div className="flex-shrink-0">{actions}</div>}
      </div>
    </header>
  );
}
