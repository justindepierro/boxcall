// Centralized map of route path -> dynamic importer for hover prefetch
// Note: Prefer light heuristics for dynamic segments (e.g., team routes)

export type RouteImporter = () => Promise<unknown>;

import { ROUTES } from "./paths";

export function getRouteImporter(path: string): RouteImporter | undefined {
  // Normalize: strip trailing slash
  const p = path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;
  switch (p) {
    case ROUTES.ROOT:
    case ROUTES.DASHBOARD:
      return () => import("../pages/DashboardPage");
    case ROUTES.PROFILE:
      return () =>
        import("../pages/ProfilePage").then((m) => ({
          default: m.ProfilePage,
        }));
    case ROUTES.CALENDAR:
      return () =>
        import("../pages/CalendarShellPage").then((m) => ({
          default: m.CalendarShellPage,
        }));
    case ROUTES.PLAYBOOK:
      return () => import("../pages/Playbook");
    case ROUTES.BOXCALL:
      return () => import("../pages/BoxCall");
    case ROUTES.ABOUT:
      return () => import("../pages/legal/AboutPage");
    case ROUTES.PRIVACY:
      return () =>
        import("../pages/legal/PrivacyPolicyPage").then((m) => ({
          default: m.PrivacyPolicyPage,
        }));
    case ROUTES.TERMS:
      return () =>
        import("../pages/legal/TermsOfServicePage").then((m) => ({
          default: m.TermsOfServicePage,
        }));
    case ROUTES.CONTACT:
      return () =>
        import("../pages/legal/ContactPage").then((m) => ({
          default: m.ContactPage,
        }));default:
      // Dynamic team routes
      if (p.startsWith("/team/") && p.endsWith("/bulletin")) {
        return () => import("../pages/TeamBulletin");
      }
      if (p.startsWith("/team/") && p.endsWith("/settings")) {
        return () => import("../pages/TeamSettings");
      }
      return undefined;
  }
}
