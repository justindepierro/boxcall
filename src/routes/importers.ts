// Centralized map of route path -> dynamic importer for hover prefetch
// Note: Prefer light heuristics for dynamic segments (e.g., team routes)

export type RouteImporter = () => Promise<unknown>;

export function getRouteImporter(path: string): RouteImporter | undefined {
  // Normalize: strip trailing slash
  const p = path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;
  switch (p) {
    case "/":
    case "/dashboard":
      return () => import("../pages/DashboardPage");
    case "/profile":
      return () => import("../pages/ProfilePage");
    case "/calendar":
      return () => import("../pages/CalendarShellPage");
    case "/playbook":
      return () => import("../pages/PlaybookPage");
    case "/boxcall":
      return () => import("../pages/BoxCall");
    case "/about":
      return () => import("../pages/legal/AboutPage");
    case "/privacy-policy":
      return () =>
        import("../pages/legal/PrivacyPolicyPage").then((m) => ({
          default: m.PrivacyPolicyPage,
        }));
    case "/terms-of-service":
      return () =>
        import("../pages/legal/TermsOfServicePage").then((m) => ({
          default: m.TermsOfServicePage,
        }));
    case "/contact":
      return () =>
        import("../pages/legal/ContactPage").then((m) => ({
          default: m.ContactPage,
        }));
    default:
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
