import React from "react";
import clsx from "clsx";
import { Typography } from "../design-system/Typography";
import { useAuth } from "../../app/auth-store";

const CompactTrophyShelf = React.lazy(async () => {
  const module = await import("../dashboard/CompactTrophyShelf");
  return { default: module.CompactTrophyShelf };
});

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  variant?: "default" | "dashboard" | "detail" | "form" | "list";
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "7xl" | "full";
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
  maxWidth,
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
      <div
        className={clsx(
          "container-page container-padding",
          maxWidth &&
            (
              {
                sm: "max-w-sm",
                md: "max-w-md",
                lg: "max-w-lg",
                xl: "max-w-xl",
                "2xl": "max-w-2xl",
                "7xl": "max-w-7xl",
                full: "max-w-full",
              } as const
            )[maxWidth]
        )}
      >
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
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 sm:gap-8">
        <div className="flex-1 min-w-0">
          {title && (
            <Typography
              variant="display-lg"
              className="text-primary mb-3"
              as="h1"
            >
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="body-lg" className="text-secondary">
              {subtitle}
            </Typography>
          )}
        </div>

        {/* Dashboard Trophy Shelf - Aligned with Team Feeds */}
        {variant === "dashboard" && user && (
          <div className="flex items-center gap-4 justify-end">
            <React.Suspense fallback={null}>
              <CompactTrophyShelf userId={user.id} />
            </React.Suspense>
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
