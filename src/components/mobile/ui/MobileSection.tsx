import React from "react";

export interface MobileSectionProps {
  /** Section title */
  title?: string;
  /** Optional action link/button text */
  action?: string;
  /** Action click handler */
  onAction?: () => void;
  /** Children content */
  children: React.ReactNode;
  /** Spacing variant */
  spacing?: "tight" | "comfortable" | "spacious";
  /** Whether section is collapsed by default */
  defaultCollapsed?: boolean;
  /** Optional class name */
  className?: string;
}

/**
 * MobileSection - Consistent Section Wrapper
 *
 * Provides standardized spacing and title treatment for mobile page sections.
 * Supports progressive disclosure with collapsible content.
 *
 * @example
 * ```tsx
 * // Simple section
 * <MobileSection title="Your Plays">
 *   <PlayList />
 * </MobileSection>
 *
 * // Section with action link
 * <MobileSection
 *   title="Recent Activity"
 *   action="See All"
 *   onAction={() => navigate('/activity')}
 * >
 *   <ActivityFeed limit={3} />
 * </MobileSection>
 *
 * // Collapsible section
 * <MobileSection
 *   title="Recent Activity"
 *   action="See All"
 *   defaultCollapsed={true}
 * >
 *   <ActivityFeed />
 * </MobileSection>
 * ```
 *
 * Spacing:
 * - tight: 16px (between related items)
 * - comfortable: 24px (default, between sections)
 * - spacious: 32px (between major sections)
 */
export function MobileSection({
  title,
  action,
  onAction,
  children,
  spacing = "comfortable",
  defaultCollapsed = false,
  className = "",
}: MobileSectionProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  const spacingClasses = {
    tight: "mb-4",
    comfortable: "mb-6",
    spacious: "mb-8",
  };

  const handleToggle = () => {
    if (defaultCollapsed !== undefined) {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <section className={`${spacingClasses[spacing]} ${className}`}>
      {/* Section Header */}
      {title && (
        <div className="flex items-center justify-between mb-3 px-4">
          <button
            onClick={handleToggle}
            className="flex items-center gap-2 flex-1 text-left"
            disabled={defaultCollapsed === undefined}
          >
            <h2 className="text-lg font-semibold text-primary">{title}</h2>
            {defaultCollapsed !== undefined && (
              <svg
                className={`w-5 h-5 text-muted transition-transform ${
                  isCollapsed ? "" : "rotate-180"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            )}
          </button>

          {action && onAction && (
            <button
              onClick={onAction}
              className="
                text-sm font-medium text-brand-primary 
                hover:text-brand-primary/80 
                active:scale-95
                transition-all
                px-2 py-1
              "
            >
              {action}
            </button>
          )}
        </div>
      )}

      {/* Section Content */}
      {!isCollapsed && <div className="px-4">{children}</div>}
    </section>
  );
}
