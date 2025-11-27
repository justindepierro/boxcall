/**
 * PageTemplate - Unified Page Architecture
 * 
 * Single source of truth for page design language across BoxCall.
 * All pages should use this template for consistency.
 * 
 * Features:
 * - Shadow-based card elevation (LiteWork pattern)
 * - Consistent spacing and typography
 * - Mobile-first responsive
 * - Loading states with skeletons
 * - Error boundaries
 * - Automatic haptic feedback
 * 
 * @example
 * ```tsx
 * <PageTemplate
 *   title="Playbook"
 *   subtitle="10 plays • Diagram 0%"
 *   actions={<Button>New Play</Button>}
 * >
 *   <PageContent />
 * </PageTemplate>
 * ```
 */

import { ReactNode } from "react";
import { Aurora } from "../ui/Aurora";
import { PageLayout } from "./PageLayout";
import { Card } from "../ui/Card";
import { Typography } from "../design-system/Typography";
import { PageLoadingSkeleton } from "../ui/Skeleton";

export interface PageTemplateProps {
  /** Page title */
  title: string;
  /** Optional subtitle or metadata */
  subtitle?: string;
  /** Action buttons in header */
  actions?: ReactNode;
  /** Main page content */
  children: ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Error state */
  error?: string | null;
  /** Max width constraint */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "7xl" | "full";
  /** Disable Aurora background */
  noAurora?: boolean;
  /** Custom header content (replaces title/subtitle/actions) */
  customHeader?: ReactNode;
  /** Additional class names */
  className?: string;
}

/**
 * PageTemplate - Use this for ALL pages
 */
export function PageTemplate({
  title,
  subtitle,
  actions,
  children,
  loading = false,
  error = null,
  maxWidth = "7xl",
  noAurora = false,
  customHeader,
  className = "",
}: PageTemplateProps) {
  // Loading state
  if (loading) {
    return (
      <PageLayout title={title} subtitle={subtitle}>
        <PageLoadingSkeleton />
      </PageLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <PageLayout title={title} subtitle={subtitle}>
        <Card variant="outlined" className="p-6 border-error">
          <Typography variant="headline-lg" className="text-error mb-2">
            Error
          </Typography>
          <Typography variant="body" color="muted">
            {error}
          </Typography>
        </Card>
      </PageLayout>
    );
  }

  const content = (
    <PageLayout
      title={title}
      subtitle={subtitle}
      variant="dashboard"
      maxWidth={maxWidth}
    >
      {/* Custom Header (if provided) */}
      {customHeader && <div className="mb-6">{customHeader}</div>}

      {/* Default Header with Actions */}
      {!customHeader && actions && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <Typography variant="headline-lg" className="text-primary">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body" color="muted" className="mt-1">
                {subtitle}
              </Typography>
            )}
          </div>
          <div className="flex items-center gap-3">{actions}</div>
        </div>
      )}

      {/* Main Content */}
      <div className={className}>{children}</div>
    </PageLayout>
  );

  // Wrap in Aurora if needed
  if (noAurora) {
    return content;
  }

  return (
    <Aurora variant="shell" fullHeight>
      {content}
    </Aurora>
  );
}

/**
 * ContentSection - Reusable section wrapper with consistent spacing
 */
export interface ContentSectionProps {
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Section actions */
  actions?: ReactNode;
  /** Section content */
  children: ReactNode;
  /** Use Card wrapper */
  card?: boolean;
  /** Card variant */
  cardVariant?: "default" | "glass" | "elevated" | "outlined" | "filled" | "accent";
  /** Additional class names */
  className?: string;
}

export function ContentSection({
  title,
  description,
  actions,
  children,
  card = false,
  cardVariant = "default",
  className = "",
}: ContentSectionProps) {
  const header = (title || description || actions) && (
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        {title && (
          <Typography variant="headline-md" className="text-primary mb-1">
            {title}
          </Typography>
        )}
        {description && (
          <Typography variant="body-sm" color="muted">
            {description}
          </Typography>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );

  const content = (
    <>
      {header}
      {children}
    </>
  );

  if (card) {
    return (
      <Card variant={cardVariant} size="lg" className={className}>
        {content}
      </Card>
    );
  }

  return <div className={`space-y-4 ${className}`}>{content}</div>;
}

/**
 * GridLayout - Responsive grid for cards/items
 */
export interface GridLayoutProps {
  /** Grid items */
  children: ReactNode;
  /** Columns configuration */
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  /** Gap size */
  gap?: "sm" | "md" | "lg";
  /** Additional class names */
  className?: string;
}

export function GridLayout({
  children,
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = "md",
  className = "",
}: GridLayoutProps) {
  const gapClasses = {
    sm: "gap-3",
    md: "gap-4",
    lg: "gap-6",
  };

  const gridClasses = `
    grid
    grid-cols-${columns.sm || 1}
    md:grid-cols-${columns.md || 2}
    lg:grid-cols-${columns.lg || 3}
    xl:grid-cols-${columns.xl || 4}
    ${gapClasses[gap]}
    ${className}
  `.trim();

  return <div className={gridClasses}>{children}</div>;
}

/**
 * ActionBar - Consistent action button layout
 */
export interface ActionBarProps {
  /** Primary action (right side) */
  primary?: ReactNode;
  /** Secondary actions (left side) */
  secondary?: ReactNode;
  /** Align to end (right) */
  alignEnd?: boolean;
  /** Additional class names */
  className?: string;
}

export function ActionBar({
  primary,
  secondary,
  alignEnd = false,
  className = "",
}: ActionBarProps) {
  if (alignEnd) {
    return (
      <div className={`flex items-center justify-end gap-3 ${className}`}>
        {primary}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
      <div className="flex items-center gap-2">{secondary}</div>
      <div className="flex items-center gap-2">{primary}</div>
    </div>
  );
}

/**
 * EmptyState - Consistent empty state design
 */
export interface EmptyStateProps {
  /** Icon name */
  icon?: string;
  /** Title */
  title: string;
  /** Description */
  description?: string;
  /** Action button */
  action?: ReactNode;
  /** Additional class names */
  className?: string;
}

export function EmptyState({
  icon = "inbox",
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <Card variant="outlined" className={`p-12 text-center ${className}`}>
      <div className="flex flex-col items-center justify-center space-y-4">
        {/* Icon placeholder - can integrate Icon component */}
        <div className="text-6xl text-muted opacity-50">📦</div>
        <div className="space-y-2">
          <Typography variant="headline-md" className="text-primary">
            {title}
          </Typography>
          {description && (
            <Typography variant="body" color="muted">
              {description}
            </Typography>
          )}
        </div>
        {action && <div className="mt-4">{action}</div>}
      </div>
    </Card>
  );
}
