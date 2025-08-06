/**
 * Lazy Route Components
 *
 * Implements route-based code splitting to dramatically reduce initial bundle size
 * Each page component is loaded only when the user navigates to it
 */
import React, { lazy } from "react";

// Lazy load all major page components
export const LazyDashboardPage = lazy(
  () => import("../../pages/DashboardPage")
);

export const LazyCalendarPage = lazy(() => import("../../pages/CalendarPage"));

export const LazyLoginPage = lazy(() => import("../../pages/LoginPage"));

export const LazyProfilePage = lazy(() =>
  import("../../pages/ProfilePage").then((module) => ({
    default: module.ProfilePage,
  }))
);

export const LazyTeamBulletin = lazy(() => import("../../pages/TeamBulletin"));

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

export const LazyTemplates = lazy(() => import("../../pages/Templates"));

export const LazyPlayground = lazy(() => import("../../pages/Playground"));

export const LazyAboutPage = lazy(() =>
  import("../../pages/legal/AboutPage").then((module) => ({
    default: module.AboutPage,
  }))
);

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

export const LazyPhase4DemoPage = lazy(
  () => import("../../pages/Phase4DemoPage")
);

export const LazyPracticePlanner = lazy(
  () => import("../../pages/PracticePlanner")
);

// Heavy component lazy loading
export const LazyPracticePlannerModal = lazy(() =>
  import("../practice/PracticePlannerModal").then((module) => ({
    default: module.PracticePlannerModal,
  }))
);

export const LazyBulkOperationsInterface = lazy(() =>
  import("../BulkOperationsInterface").then((module) => ({
    default: module.BulkOperationsInterface,
  }))
);

export const LazyAdvancedRSVPInterface = lazy(() =>
  import("../AdvancedRSVPInterface").then((module) => ({
    default: module.AdvancedRSVPInterface,
  }))
);

// Loading component for lazy routes
export const RouteLoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading page...</p>
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
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Failed to load page
              </h2>
              <p className="text-gray-600 mb-4">
                There was an error loading this page. Please try refreshing.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Refresh Page
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
