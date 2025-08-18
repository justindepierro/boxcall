import React, { lazy } from "react";

import { Typography } from "../design-system/Typography";
/**
 * Lazy Route Components
 *
 * Implements route-based code splitting to dramatically reduce initial bundle size
 * Each page component is loaded only when the user navigates to it
 */
import { Button } from "../ui";

// Lazy load all major page components
export const LazyDashboardPage = lazy(
  () => import("../../pages/DashboardPage")
);

// Calendar Shell (final) – load direct page wrapper (legacy shims removed)
export const LazyCalendarShellPage = lazy(() =>
  import("../../pages/CalendarShellPage").then((m) => ({
    default: m.CalendarShellPage,
  }))
);

export const LazyLoginPage = lazy(() => import("../../pages/LoginPage"));

export const LazyProfilePage = lazy(() =>
  import("../../pages/ProfilePage").then((module) => ({
    default: module.ProfilePage,
  }))
);

export const LazyTeamBulletin = lazy(() => import("../../pages/TeamBulletin"));

export const LazyTeamsPage = lazy(() => import("../../pages/TeamsPage"));

export const LazyCreateTeam = lazy(() =>
  import("../../pages/CreateTeam").then((module) => ({
    default: module.CreateTeam,
  }))
);

export const LazyJoinTeam = lazy(() =>
  import("../../pages/JoinTeam").then((module) => ({
    default: module.JoinTeam,
  }))
);

export const LazyCreateCoachAccount = lazy(() =>
  import("../../pages/CreateCoachAccount").then((module) => ({
    default: module.CreateCoachAccount,
  }))
);

export const LazyBoxCall = lazy(() => import("../../pages/BoxCall"));

export const LazyPlaybookPage = lazy(() => import("../../pages/Playbook"));

export const LazyTeamSettings = lazy(() => import("../../pages/TeamSettings"));
export const LazyTemplatesPage = lazy(() => import("../../pages/Templates"));
export const LazyAnalyticsPage = lazy(
  () => import("../../pages/AnalyticsPage")
);

export const LazyAboutPage = lazy(() => import("../../pages/legal/AboutPage"));

export const LazyPrivacyPolicyPage = lazy(() =>
  import("../../pages/legal/PrivacyPolicyPage").then((module) => ({
    default: module.PrivacyPolicyPage,
  }))
);

export const LazyTermsOfServicePage = lazy(() =>
  import("../../pages/legal/TermsOfServicePage").then((module) => ({
    default: module.TermsOfServicePage,
  }))
);

export const LazyContactPage = lazy(() =>
  import("../../pages/legal/ContactPage").then((module) => ({
    default: module.ContactPage,
  }))
);

// Role-specific dashboard pages
export const LazyCoachManagementPage = lazy(
  () => import("../../pages/roles/CoachManagementPage")
);

export const LazyPlayerDashboardPage = lazy(
  () => import("../../pages/roles/PlayerDashboardPage")
);

// Route loading spinner component

export const LazyPracticePlanner = lazy(
  () => import("../../pages/PracticePlanner")
);

// Heavy component lazy loading
export const LazyPracticePlannerModal = lazy(() =>
  import("../practice/PracticePlannerModal/index").then((module) => ({
    default: module.PracticePlannerModal,
  }))
);

// Loading component for lazy routes
export const RouteLoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jade-600 mx-auto mb-4"></div>
      <p className="text-text-secondary">Loading page...</p>
    </div>
  </div>
);

// Error boundary for lazy loading failures
export class LazyLoadErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: {
    children: React.ReactNode;
    fallback?: React.ReactNode;
  }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("Lazy loading error:", error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <svg
                  className="w-12 h-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <Typography
                variant="headline-sm"
                as="h2"
                className="text-text-primary mb-2"
              >
                Failed to load page
              </Typography>
              <p className="text-text-secondary mb-4">
                There was an error loading this page. Please try refreshing.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
