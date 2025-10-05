import React from "react";

import { Typography } from "../design-system/Typography";
/**
 * Lazy Route Components
 *
 * Implements route-based code splitting to dramatically reduce initial bundle size
 * Each page component is loaded only when the user navigates to it
 */
import { Button } from "../ui";
import { lazyRoute } from "../ui/performance-utils";

// Lazy load all major page components
export const LazyDashboardPage = lazyRoute(
  () => import("../../pages/DashboardPage"),
  "Dashboard"
);

// Calendar Shell (final) – load direct page wrapper (legacy shims removed)
export const LazyCalendarShellPage = lazyRoute(
  () => import("../../pages/CalendarShellPage"),
  "Calendar"
);

export const LazyPlannerPage = lazyRoute(
  () => import("../../pages/PlannerPage"),
  "Planner"
);

export const LazyLoginPage = lazyRoute(
  () => import("../../pages/LoginPage"),
  "Login"
);

export const LazyProfilePage = lazyRoute(
  () =>
    import("../../pages/ProfilePage").then((module) => ({
      default: module.ProfilePage,
    })),
  "Profile"
);

export const LazyCollaborativeDemoPage = lazyRoute(
  () => import("../../pages/CollaborativeDemoPage"),
  "Collaborative Demo"
);

export const LazyDesignSystemShowcase = lazyRoute(
  () =>
    import("../design-system/DesignSystemShowcase").then((module) => ({
      default: module.DesignSystemShowcase,
    })),
  "Design System"
);

export const LazySocialFeaturesDemo = lazyRoute(
  () => import("../../pages/SocialFeaturesDemo"),
  "Social Features Demo"
);

export const LazyTeamBulletin = lazyRoute(
  () => import("../../pages/TeamBulletin"),
  "Team Bulletin"
);

export const LazyCreateTeam = lazyRoute(
  () =>
    import("../../pages/CreateTeam").then((module) => ({
      default: module.CreateTeam,
    })),
  "Create Team"
);

export const LazyJoinTeam = lazyRoute(
  () =>
    import("../../pages/JoinTeam").then((module) => ({
      default: module.JoinTeam,
    })),
  "Join Team"
);

export const LazyCreateCoachAccount = lazyRoute(
  () =>
    import("../../pages/CreateCoachAccount").then((module) => ({
      default: module.CreateCoachAccount,
    })),
  "Create Coach Account"
);

export const LazyBoxCall = lazyRoute(
  () => import("../../pages/BoxCall"),
  "BoxCall"
);

export const LazyPlaybookPage = lazyRoute(
  () => import("../../pages/PlaybookPage"),
  "Playbook"
);

export const LazyRosterPage = lazyRoute(
  () => import("../../pages/RosterPage"),
  "Roster"
);

export const LazyPracticePlansPage = lazyRoute(
  () => import("../../pages/PracticePlansPage"),
  "Practice Plans"
);
export const LazyGamePlansPage = lazyRoute(
  () => import("../../pages/GamePlansPage"),
  "Game Plans"
);

export const LazyAwardsPage = lazyRoute(
  () => import("../../pages/AwardsPage"),
  "Awards"
);

export const LazyTemplatesPage = lazyRoute(
  () => import("../../pages/TemplatesPage"),
  "Templates"
);

export const LazyTeamSettings = lazyRoute(
  () => import("../../pages/TeamSettings"),
  "Team Settings"
);
export const LazyAnalyticsPage = lazyRoute(
  () => import("../../pages/AnalyticsPage"),
  "Analytics"
);

export const LazyAboutPage = lazyRoute(
  () => import("../../pages/legal/AboutPage"),
  "About"
);

export const LazyPrivacyPolicyPage = lazyRoute(
  () =>
    import("../../pages/legal/PrivacyPolicyPage").then((module) => ({
      default: module.PrivacyPolicyPage,
    })),
  "Privacy Policy"
);

export const LazyTermsOfServicePage = lazyRoute(
  () =>
    import("../../pages/legal/TermsOfServicePage").then((module) => ({
      default: module.TermsOfServicePage,
    })),
  "Terms of Service"
);

export const LazyContactPage = lazyRoute(
  () =>
    import("../../pages/legal/ContactPage").then((module) => ({
      default: module.ContactPage,
    })),
  "Contact"
);

// Role-specific dashboard pages
export const LazyCoachManagementPage = lazyRoute(
  () => import("../../pages/roles/CoachManagementPage"),
  "Coach Management"
);

export const LazyPlayerDashboardPage = lazyRoute(
  () => import("../../pages/roles/PlayerDashboardPage"),
  "Player Dashboard"
);

export const LazyAchievementAdminPage = lazyRoute(
  () => import("../../pages/AchievementAdminPage"),
  "Achievement Admin"
);

// Route loading spinner component

export const LazyPracticePlanner = lazyRoute(
  () => import("../../pages/PracticePlanner"),
  "Practice Planner"
);

// Health Check API Routes
export const LazyHealthCheckPage = lazyRoute(
  () => import("../../pages/api/HealthCheckPage"),
  "Health Check"
);

export const LazyReadinessCheckPage = lazyRoute(
  () => import("../../pages/api/ReadinessCheckPage"),
  "Readiness Check"
);

export const LazyLivenessCheckPage = lazyRoute(
  () => import("../../pages/api/LivenessCheckPage"),
  "Liveness Check"
);

// Heavy component lazy loading
export const LazyPracticeScriptModal = lazyRoute(
  () =>
    import("../practice/PracticeScriptModal/index").then((module) => ({
      default: module.PracticeScriptModal,
    })),
  "Practice Script Modal"
);

// Loading component for lazy routes
export const RouteLoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface-app relative overflow-hidden">
    <div className="absolute inset-0 bg-aurora-radial" />
    <div className="relative z-10 text-center px-6 py-10 rounded-3xl shadow-2xl bg-surface-primary/90 backdrop-blur-md border border-surface-subtle max-w-sm w-full">
      <div className="mx-auto mb-6 h-14 w-14 rounded-full bg-jade-100 text-jade-700 flex items-center justify-center">
        <span className="text-2xl font-semibold">BC</span>
      </div>
      <p className="text-lg font-semibold text-text-primary">
        Preparing BoxCall
      </p>
      <p className="text-sm text-text-muted mt-2">
        Loading secure data and initializing your coaching workspace.
      </p>
      <div className="mt-6 flex items-center justify-center gap-2">
        <span className="sr-only">Loading</span>
        <div className="h-2 w-2 rounded-full bg-jade-500 animate-bounce [animation-delay:-0.32s]"></div>
        <div className="h-2 w-2 rounded-full bg-jade-500 animate-bounce [animation-delay:-0.16s]"></div>
        <div className="h-2 w-2 rounded-full bg-jade-500 animate-bounce"></div>
      </div>
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
              <div className="text-text-error mb-4">
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
