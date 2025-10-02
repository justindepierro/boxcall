import React from "react";
import clsx from "clsx";
import { Typography } from "../design-system/Typography";
import { CompactTrophyShelf } from "../dashboard/CompactTrophyShelf";
import { useAuth } from "../../app/auth-store";

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  variant?: "default" | "dashboard" | "detail" | "form" | "list";
  className?: string;
}

/**
 * PageLayout - Standardized page layout component
 *
 * Provides consistent structure, spacing, and responsive behavior
 * for all application pages.
 */
export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  subtitle,
  actions,
  variant = "default",
  className,
}) => {
  const layoutClasses = clsx(
    "page-layout",
    {
      "page-dashboard": variant === "dashboard",
      "page-detail": variant === "detail",
      "page-form": variant === "form",
      "page-list": variant === "list",
    },
    className
  );

  return (
    <div className={layoutClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(title || actions) && (
          <PageHeader
            title={title}
            subtitle={subtitle}
            actions={actions}
            variant={variant}
          />
        )}
        <main id="main-content" role="main">
          <PageContent variant={variant}>{children}</PageContent>
        </main>
      </div>
    </div>
  );
};

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  variant?: "default" | "dashboard" | "detail" | "form" | "list";
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  variant,
}) => {
  const { user } = useAuth();

  return (
    <header className="page-header mb-6 md:mb-8 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          {title && (
            <Typography variant="display-lg" className="text-text-primary mb-2" as="h1">
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="body-lg" className="text-text-secondary">
              {subtitle}
            </Typography>
          )}
        </div>

        {/* Dashboard Trophy Shelf - Aligned with Team Feeds */}
        {variant === "dashboard" && user && (
          <div className="flex items-center gap-4 justify-end">
            <CompactTrophyShelf userId={user.id} />
            {actions && (
              <div className="flex flex-col sm:flex-row gap-3">{actions}</div>
            )}
          </div>
        )}

        {/* Regular Actions for Non-Dashboard Pages */}
        {variant !== "dashboard" && actions && (
          <div className="flex flex-col sm:flex-row gap-3">{actions}</div>
        )}
      </div>
    </header>
  );
};

interface PageContentProps {
  children: React.ReactNode;
  variant: PageLayoutProps["variant"];
}

const PageContent: React.FC<PageContentProps> = ({ children, variant }) => {
  const contentClasses = clsx("page-content", {
    "space-y-4":
      variant === "dashboard" ||
      variant ===
        "list" /* Reduced from space-y-6 to space-y-4 for dashboard */,
    "max-w-4xl": variant === "detail" || variant === "form",
  });

  return <div className={contentClasses}>{children}</div>;
};

// Export individual components for advanced usage
export { PageHeader, PageContent };
export type { PageLayoutProps, PageHeaderProps, PageContentProps };
