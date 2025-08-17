import { getRouteImporter } from "../routes/importers";
import { ROUTES, teamRoutes } from "../routes/paths";

import type { MobileNavItem } from "../components/mobile/MobileBottomNavigation";

/**
 * Hook to get mobile navigation items based on user role and current route
 */
export const useMobileNavigation = (currentPath: string = "/") => {
  // Mock notifications for demo - replace with real data
  const notifications = {
    dashboard: 2,
    calendar: 1,
    bulletin: 3,
    profile: 0,
  };

  const items: MobileNavItem[] = [
    {
      id: "dashboard",
      label: "Home",
      icon: "home",
      href: ROUTES.DASHBOARD,
      badge: notifications.dashboard,
      isActive: currentPath === ROUTES.DASHBOARD || currentPath === "/",
      importer: getRouteImporter(ROUTES.DASHBOARD),
    },
    {
      id: "calendar",
      label: "Calendar",
      icon: "calendar",
      href: ROUTES.CALENDAR,
      badge: notifications.calendar,
      isActive: currentPath.startsWith(ROUTES.CALENDAR),
      importer: getRouteImporter(ROUTES.CALENDAR),
    },
    {
      id: "bulletin",
      label: "Team",
      icon: "users",
      href: teamRoutes.bulletin("1"),
      badge: notifications.bulletin,
      isActive:
        currentPath.includes("/team") || currentPath.includes("/bulletin"),
      importer: getRouteImporter(teamRoutes.bulletin("1")),
    },
    {
      id: "profile",
      label: "Profile",
      icon: "user",
      href: ROUTES.PROFILE,
      badge: notifications.profile,
      isActive: currentPath.startsWith(ROUTES.PROFILE),
      importer: getRouteImporter(ROUTES.PROFILE),
    },
  ];

  return { items, notifications };
};
