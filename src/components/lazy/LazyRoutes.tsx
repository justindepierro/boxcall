/**
 * Lazy Route Components
 *
 * Implements route-based code splitting to dramatically reduce initial bundle size
 * Each page component is loaded only when the user navigates to it
 */
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

export const LazyResetPasswordPage = lazyRoute(
  () => import("../../pages/ResetPasswordPage"),
  "Reset Password"
);

export const LazyProfilePage = lazyRoute(
  () => import("../../pages/ProfilePage"),
  "Profile"
);

export const LazyDesignSystemShowcase = lazyRoute(
  () =>
    import("../design-system/DesignSystemShowcase").then((module) => ({
      default: module.DesignSystemShowcase,
    })),
  "Design System"
);

export const LazyTeamAnnouncements = lazyRoute(
  () =>
    import("../team/TeamAnnouncements").then((module) => ({
      default: module.TeamAnnouncements,
    })),
  "Team Announcements"
);

export const LazyTeamBulletin = lazyRoute(
  () => import("../../pages/TeamBulletin"),
  "Team Bulletin"
);

export const LazyCreateTeam = lazyRoute(
  () => import("../../pages/CreateTeam"),
  "Create Team"
);

export const LazyJoinTeam = lazyRoute(
  () => import("../../pages/JoinTeam"),
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

export const LazySessionHistory = lazyRoute(
  () => import("../../pages/SessionHistoryPage"),
  "Session History"
);

export const LazyPracticeSession = lazyRoute(
  () => import("../../components/boxcall/ResponsivePracticeSession"),
  "Practice Session"
);

export const LazyGameSession = lazyRoute(
  () => import("../../components/boxcall/ResponsiveGameSession"),
  "Game Session"
);

export const LazyPlaybookPage = lazyRoute(
  () => import("../../pages/PlaybookPage"),
  "Playbook"
);

export const LazyRosterPage = lazyRoute(
  () => import("../../pages/RosterPage"),
  "Roster"
);

export const LazyPlayerDetailPage = lazyRoute(
  () => import("../../pages/PlayerDetailPage"),
  "Player Detail"
);

export const LazyPracticePlansPage = lazyRoute(
  () => import("../../pages/PracticePlansPage"),
  "Practice Plans"
);
export const LazyGamePlansPage = lazyRoute(
  () => import("../../pages/GamePlansPage"),
  "Game Plans"
);

export const LazyFormationMapperPage = lazyRoute(
  () => import("../../pages/FormationMapperPage"),
  "Formation Mapper"
);

export const LazyFormationLibraryPage = lazyRoute(
  () =>
    import("../../pages/FormationLibraryPage").then((module) => ({
      default: module.FormationLibraryPage,
    })),
  "Formation Library"
);

export const LazyPersonnelLibraryPage = lazyRoute(
  () =>
    import("../../pages/PersonnelLibraryPage").then((module) => ({
      default: module.PersonnelLibraryPage,
    })),
  "Personnel Library"
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

export const LazySuperAdminAnalyticsTestPage = lazyRoute(
  () =>
    import("../../pages/SuperAdminAnalyticsTestPage").then((module) => ({
      default: module.SuperAdminAnalyticsTestPage,
    })),
  "SuperAdmin Analytics Test"
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

export const LazyPracticePDFExportDialog = lazyRoute(
  () =>
    import("../practice/PracticePDFExportDialog").then((module) => ({
      default: module.PracticePDFExportDialog,
    })),
  "PDF Export Dialog"
);

// Loading component for lazy routes
export const RouteLoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface-app relative overflow-hidden">
    <div className="absolute inset-0 bg-aurora-radial" />
    <div className="relative z-10 text-center px-6 py-10 rounded-xl shadow-2xl bg-white dark:bg-navy-800 border border-neutral-200 dark:border-navy-600 max-w-sm w-full">
      <div className="mx-auto mb-6 h-14 w-14 rounded-full bg-jade-100 text-jade-700 flex items-center justify-center">
        <span className="text-2xl font-semibold">BC</span>
      </div>
      <p className="text-lg font-semibold text-primary">Preparing BoxCall</p>
      <p className="text-sm text-muted mt-2">
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
