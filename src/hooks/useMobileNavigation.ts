import { getRouteImporter } from "../routes/importers";
import { ROUTES, teamRoutes } from "../routes/paths";
import { useActiveTeamStore } from "../state/activeTeamStore";

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

  const teamId = useActiveTeamStore((s) => s.activeTeamId) || "1";
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
      label: "Team Hub",
      icon: "users",
      href: teamRoutes.bulletin(teamId),
      badge: notifications.bulletin,
      isActive:
        currentPath.includes("/team") || currentPath.includes("/bulletin"),
      importer: getRouteImporter(teamRoutes.bulletin(teamId)),
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
