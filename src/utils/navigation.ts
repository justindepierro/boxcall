import type { SidebarItem } from "../components/ui/Sidebar";
import type { Database } from "../types/database";
import React from "react";
import { Icon } from "../components/ui/Icon/Icon";
import type { IconName } from "../components/ui/Icon/Icon";
import { ROUTES, teamRoutes } from "../routes/paths";
type UserRole = Database["public"]["Tables"]["profiles"]["Row"]["role"];
type ExtendedUserRole = UserRole | "super_admin";
export interface NavigationItem {
  id: string;
  label: string;
  icon?: IconName;
  href: string;
  roles?: ExtendedUserRole[];
  children?: NavigationItem[];
  divider?: boolean;
  badge?: string | number;
  description?: string;
}
/**
 * Complete navigation structure for BoxCall application
 * Based on comprehensive requirements with role-based access
 */
export const getNavigationItems = (
  userRole?: UserRole | null | string,
  activeTeamId?: string | null
): NavigationItem[] => {
  // Only log in development mode to reduce console noise
  if (process.env.NODE_ENV === "development") {
    console.info(
      "getNavigationItems called with userRole:",
      userRole,
      typeof userRole
    );
  }
  // Dynamic team selection (persisted after creation)
  let resolvedTeamId = activeTeamId || null;
  try {
    const stored = localStorage.getItem("activeTeamId");
    if (stored) resolvedTeamId = stored;
  } catch {
    /* ignore */
  }
  const items: NavigationItem[] = [
    // Dashboard - Available to everyone
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "home",
      href: ROUTES.DASHBOARD,
      description: "Personal dashboard with live feed and notifications",
    },
    // Team Bulletin - Available to everyone (renamed from Team Dashboard)
    {
      id: "team-bulletin",
      label: "Team Bulletin",
      icon: "users",
      href: resolvedTeamId ? teamRoutes.bulletin(resolvedTeamId) : ROUTES.TEAMS,
      description: "Team-specific feed, announcements, and quick actions",
    },
  ];
  // BoxCall - Coaches and super_admin only (premium feature)
  if (
    userRole === "admin" ||
    userRole === "coach" ||
    (userRole as string) === "super_admin"
  ) {
    items.push({
      id: "boxcall",
      label: "BoxCall",
      icon: "phone",
      href: ROUTES.BOXCALL,
      roles: ["admin", "coach", "super_admin"],
      badge: "Pro",
      description: "Advanced coaching tools and analytics (Premium)",
    });
  }
  // Playbook - Coaches, players, and super_admin
  const shouldShowPlaybook =
    userRole === "admin" ||
    userRole === "coach" ||
    userRole === "player" ||
    (userRole as string) === "super_admin";
  console.info("Playbook check:", {
    userRole,
    userRoleType: typeof userRole,
    isAdmin: userRole === "admin",
    isCoach: userRole === "coach",
    isPlayer: userRole === "player",
    isSuperAdmin: (userRole as string) === "super_admin",
    shouldShowPlaybook,
  });
  if (shouldShowPlaybook) {
    items.push({
      id: "playbook",
      label: "Playbook",
      icon: "book",
      href: ROUTES.PLAYBOOK,
      roles: ["admin", "coach", "player", "super_admin"],
      description: "Team plays and strategies",
    });
  }
  // Calendar - Available to everyone
  items.push({
    id: "calendar",
    label: "Calendar",
    icon: "calendar",
    href: resolvedTeamId ? teamRoutes.calendar(resolvedTeamId) : ROUTES.CALENDAR,
    description: "Personal and team calendars",
  });
  // Planner - Available to everyone
  items.push({
    id: "planner",
    label: "Planner",
    icon: "clipboard-list",
    href: ROUTES.PLANNER,
    description: "Weekly planning dashboard for coaches",
  });
  // Awards - Coaches and super_admin only
  if (
    userRole === "admin" ||
    userRole === "coach" ||
    (userRole as string) === "super_admin"
  ) {
    items.push({
      id: "awards",
      label: "Awards",
      icon: "award",
      href: ROUTES.AWARDS,
      roles: ["admin", "coach", "super_admin"],
      description: "Give out awards and recognition to players and staff",
    });
  }
  // Profile - Available to everyone
  items.push({
    id: "profile",
    label: "Profile",
    icon: "user",
    href: ROUTES.PROFILE,
    description: "Edit user settings and preferences",
  });
  // Team Settings - Coaches and super_admin only
  // TEMP: Expose Team Settings to all authenticated roles for rapid iteration (will re-gate later)
  if (resolvedTeamId) {
    items.push({
      id: "team-settings",
      label: "Team Settings",
      icon: "settings",
      href: teamRoutes.settings(resolvedTeamId),
      description: "Manage team configuration and roster",
    });
  }
  // Divider before utility pages
  items.push({
    id: "divider-utility",
    label: "",
    href: "",
    divider: true,
  });
  // About - Available to everyone
  items.push({
    id: "about",
    label: "About",
    icon: "info",
    href: ROUTES.ABOUT,
    description: "Learn about BoxCall",
  });
  // Design System Showcase - Available to everyone (dev/demo feature)
  items.push({
    id: "design-system",
    label: "Design System",
    icon: "sparkles",
    href: ROUTES.DESIGN_SYSTEM,
    description: "Explore our advanced design system and theming",
  });
  // Social Features Demo - Available to everyone (dev/demo feature)
  items.push({
    id: "social-demo",
    label: "Social Demo",
    icon: "message",
    href: ROUTES.SOCIAL,
    description: "Experience social features and interactions",
  });
  // Templates - Coaches and super_admin only
  if (
    userRole === "admin" ||
    userRole === "coach" ||
    (userRole as string) === "super_admin"
  ) {
    items.push({
      id: "templates",
      label: "Templates",
      icon: "file",
      href: ROUTES.TEMPLATES,
      roles: ["admin", "coach", "super_admin"],
      description: "Pre-built templates and resources",
    });
  }

  // Divider before logout
  items.push({
    id: "divider-logout",
    label: "",
    href: "",
    divider: true,
  });
  // Logout - Available to everyone
  items.push({
    id: "logout",
    label: "Log Out",
    icon: "arrow-right",
    href: "/logout",
    description: "Sign out of BoxCall",
  });
  return items;
};
/**
 * Convert NavigationItem to SidebarItem format
 * BoxCall icons are styled with jade color for brand consistency
 */
export const toSidebarItems = (
  items: NavigationItem[],
  userRole?: UserRole | null | string,
  onNavigate?: (href: string) => void
): SidebarItem[] => {
  return items
    .filter((item) => {
      // Show item if no roles specified or user has required role
      return (
        !item.roles ||
        (userRole && item.roles.includes(userRole as ExtendedUserRole))
      );
    })
    .map((item) => ({
      id: item.id,
      label: item.label,
      icon: item.icon
        ? React.createElement(Icon, {
            name: item.icon,
            size: "md",
            color: item.id === "boxcall" ? "primary" : "current",
          })
        : undefined,
      onClick: item.divider
        ? undefined
        : () => {
            // Use the provided navigation handler
            if (onNavigate) {
              onNavigate(item.href);
            } else {
              // Fallback: use window.location for navigation
              window.location.href = item.href;
            }
          },
      divider: item.divider,
      badge: item.badge,
      children: item.children
        ? toSidebarItems(item.children, userRole, onNavigate)
        : undefined,
    }));
};
/**
 * Get primary navigation items for the top navigation bar
 * These are the most important/frequently used items with quick actions
 */
export const getPrimaryNavigationItems = (
  userRole?: UserRole | null
): NavigationItem[] => {
  const items: NavigationItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "home",
      href: "/dashboard",
    },
    {
      id: "boxcall",
      label: "BoxCall",
      icon: "phone",
      href: "/boxcall",
    },
  ];
  return items.filter((item) => {
    // Filter based on role permissions
    if (item.id === "boxcall" && userRole !== "admin" && userRole !== "coach") {
      return false;
    }
    return true;
  });
};
/**
 * Get role-based display information
 */
export const getRoleDisplayInfo = (role?: UserRole | null) => {
  if (!role) return { display: "User", color: "gray" };
  const roleInfo: Record<
    NonNullable<UserRole>,
    { display: string; color: string }
  > = {
    super_admin: { display: "Super Admin", color: "red" },
    admin: { display: "Administrator", color: "red" },
    coach: { display: "Coach", color: "blue" },
    player: { display: "Player", color: "green" },
    family: { display: "Family", color: "purple" },
  };
  if (role in roleInfo) return roleInfo[role as NonNullable<UserRole>];
  // Fallback for team-role strings that may appear in some contexts
  switch (role as string) {
    case "head_coach":
      return { display: "Head Coach", color: "blue" };
    case "assistant_coach":
      return { display: "Assistant Coach", color: "blue" };
    case "manager":
      return { display: "Manager", color: "purple" };
    case "alumni":
      return { display: "Alumni", color: "gray" };
    default:
      return { display: String(role), color: "gray" };
  }
};
