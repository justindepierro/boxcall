import React from "react";
import clsx from "clsx";
import { Typography } from "../design-system/Typography";

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
      {(title || actions) && (
        <PageHeader title={title} subtitle={subtitle} actions={actions} />
      )}
      <PageContent variant={variant}>{children}</PageContent>
    </div>
  );
};

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
}) => (
  <div className="page-header mb-6 md:mb-8">
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <div className="flex-1 min-w-0">
        {title && (
          <Typography variant="display-lg" className="text-text-primary mb-2">
            {title}
          </Typography>
        )}
        {subtitle && (
          <Typography variant="body-lg" className="text-text-secondary">
            {subtitle}
          </Typography>
        )}
      </div>
      {actions && (
        <div className="flex flex-col sm:flex-row gap-3">{actions}</div>
      )}
    </div>
  </div>
);

interface PageContentProps {
  children: React.ReactNode;
  variant: PageLayoutProps["variant"];
}

const PageContent: React.FC<PageContentProps> = ({ children, variant }) => {
  const contentClasses = clsx("page-content", {
    "space-y-6": variant === "dashboard",
    "max-w-4xl": variant === "detail" || variant === "form",
    "space-y-4": variant === "list",
  });

  return <div className={contentClasses}>{children}</div>;
};

// Export individual components for advanced usage
export { PageHeader, PageContent };
export type { PageLayoutProps, PageHeaderProps, PageContentProps };
