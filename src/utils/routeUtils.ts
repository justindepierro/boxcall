/**
 * Route Utilities
 * Part of Phase 3D: Final Mobile Polish & Performance Optimization
 */

// Route preloading utilities
export const preloadRoute = (routeName: string) => {
  switch (routeName) {
    case "dashboard":
      return import("../pages/DashboardPage");
    case "profile":
      return import("../pages/ProfilePage");
    case "playbook":
      return import("../pages/PlaybookPage");
    case "practice-planner":
      return import("../pages/PracticePlanner");
    case "calendar":
      return import("../pages/CalendarShellPage");
    case "team-settings":
      return import("../pages/TeamSettings");
    case "login":
      return import("../pages/LoginPage");
    default:
      console.warn("Unknown route for preloading:", routeName);
      return Promise.resolve();
  }
};

// Smart preloading based on user navigation patterns
export const useSmartPreloading = () => {
  const preloadNextRoutes = (currentPath: string) => {
    // Preload likely next routes based on current page
    const preloadingMap: Record<string, string[]> = {
      "/": ["dashboard", "login"],
      "/dashboard": ["playbook", "practice-planner", "calendar"],
      "/playbook": ["practice-planner"],
      "/practice-planner": ["calendar"],
      "/settings": ["profile", "team-settings"],
    };

    const routesToPreload = preloadingMap[currentPath] || [];
    routesToPreload.forEach((route) => {
      // Preload after a small delay to not interfere with current page loading
      setTimeout(() => {
        preloadRoute(route).catch((error) => {
          console.warn("Route preloading failed:", route, error);
        });
      }, 100);
    });
  };

  return { preloadNextRoutes };
};

// Route analytics and performance monitoring
export const useRouteAnalytics = () => {
  const trackRouteChange = (routeName: string, loadTime: number) => {
    // Track route performance
    if (typeof gtag !== "undefined") {
      gtag("event", "route_change", {
        route_name: routeName,
        load_time: loadTime,
      });
    }

    // Log performance in development
    if (process.env.NODE_ENV === "development") {
  console.info(`📊 Route ${routeName} loaded in ${loadTime}ms`);
    }
  };

  const trackRouteError = (routeName: string, error: Error) => {
    // Track route errors
    if (typeof gtag !== "undefined") {
      gtag("event", "route_error", {
        route_name: routeName,
        error_message: error.message,
      });
    }

    console.error(`❌ Route ${routeName} failed to load:`, error);
  };

  return { trackRouteChange, trackRouteError };
};

declare global {
  function gtag(
    command: string,
    action: string,
    parameters?: Record<string, unknown>
  ): void;
}
