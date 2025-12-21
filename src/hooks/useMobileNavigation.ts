import { useEffect, useMemo, useState } from "react";
import type { MobileNavItem } from "../components/mobile/core/MobileBottomNavigation";
import { getRouteImporter } from "../routes/importers";
import { NotificationsService } from "../services/notificationsService";

/**
 * Hook to get mobile navigation items based on user role and current route
 */
export const useMobileNavigation = (currentPath: string = "/") => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadUnread = async () => {
      const count = await NotificationsService.getUnreadCount();
      if (cancelled) return;
      setUnreadCount(count);
    };

    void loadUnread();
    const interval = window.setInterval(() => {
      void loadUnread();
    }, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const notifications = useMemo(
    () => ({
      dashboard: 0,
      calendar: 0,
      bulletin: unreadCount,
      profile: 0,
    }),
    [unreadCount]
  );

  const items: MobileNavItem[] = useMemo(
    () => [
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
    ],
    [currentPath, notifications]
  );

  return { items, notifications };
};
