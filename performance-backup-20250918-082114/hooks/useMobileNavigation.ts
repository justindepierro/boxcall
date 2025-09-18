import type { MobileNavItem } from "../components/mobile/MobileBottomNavigation";
import { getRouteImporter } from "../routes/importers";

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
      href: "/dashboard",
      badge: notifications.dashboard,
      isActive: currentPath === "/dashboard" || currentPath === "/",
      importer: getRouteImporter("/dashboard"),
    },
    {
      id: "calendar",
      label: "Calendar",
      icon: "calendar",
      href: "/calendar",
      badge: notifications.calendar,
      isActive: currentPath.startsWith("/calendar"),
      importer: getRouteImporter("/calendar"),
    },
    {
      id: "bulletin",
      label: "Team",
      icon: "users",
      href: "/team/1/bulletin",
      badge: notifications.bulletin,
      isActive:
        currentPath.includes("/team") || currentPath.includes("/bulletin"),
      importer: getRouteImporter("/team/1/bulletin"),
    },
    {
      id: "profile",
      label: "Profile",
      icon: "user",
      href: "/profile",
      badge: notifications.profile,
      isActive: currentPath.startsWith("/profile"),
      importer: getRouteImporter("/profile"),
    },
  ];

  return { items, notifications };
};
