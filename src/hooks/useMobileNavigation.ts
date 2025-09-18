import { useMemo } from "react";
import { appRoutes, type RouteConfig } from "../routes/appRoutes";

export interface MobileNavItem {
  id: string;
  label: string;
  icon: string; // Assuming icon is a string name, adjust if it's a component
  href: string;
  badge?: number;
  isActive: boolean;
}

/**
 * Hook to get mobile navigation items from the centralized route config
 */
export const useMobileNavigation = (currentPath: string = "/") => {
  // Mock notifications for demo - replace with real data
  const notifications = useMemo(
    () => ({
      dashboard: 2,
      calendar: 1,
      bulletin: 3,
      profile: 0,
      teams: 0,
      playbooks: 0,
      settings: 0,
      components: 0,
      analytics: 0,
    }),
    []
  );

  const items: MobileNavItem[] = useMemo(() => {
    return appRoutes
      .filter(
        (
          route
        ): route is RouteConfig & { nav: NonNullable<RouteConfig["nav"]> } =>
          route.nav !== null
      )
      .map((route) => {
        const path = route.path;
        const nav = route.nav;
        // A bit of a hack to match icon names to notification keys
        const id = nav.label.toLowerCase().replace(/\s/g, "");
        return {
          id: id,
          label: nav.label,
          icon: nav.Icon.displayName?.toLowerCase() || id, // Or however you map icons
          href: path,
          // @ts-expect-error - dynamic key
          badge: notifications[id],
          isActive:
            currentPath === path ||
            (path !== "/dashboard" && currentPath.startsWith(path)),
        };
      });
  }, [currentPath, notifications]);

  return { items, notifications };
};
