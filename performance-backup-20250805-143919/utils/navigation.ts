import type { SidebarItem } from "../components/ui/Sidebar";
import type { Database } from "../types/database";
import React from "react";
import { Icon } from "../components/ui/Icon/Icon";
import type { IconName } from "../components/ui/Icon/Icon";
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
  userRole?: UserRole | null | string
): NavigationItem[] => {
  console.log(
    "getNavigationItems called with userRole:",
    userRole,
    typeof userRole
  );
  const items: NavigationItem[] = [
    // Dashboard - Available to everyone
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "home",
      href: "/dashboard",
      description: "Personal dashboard with live feed and notifications",
    },
    // Team Bulletin - Available to everyone (renamed from Team Dashboard)
    {
      id: "team-bulletin",
      label: "Team Bulletin",
      icon: "users",
      href: "/team/1/bulletin", // Will need team switching dropdown
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
      href: "/boxcall",
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
  console.log("Playbook check:", {
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
      href: "/playbook",
      roles: ["admin", "coach", "player", "super_admin"],
      description: "Team plays and strategies",
    });
  }
  // Calendar - Available to everyone
  items.push({
    id: "calendar",
    label: "Calendar",
    icon: "calendar",
    href: "/calendar",
    description: "Personal and team calendars",
  });
  // Profile - Available to everyone
  items.push({
    id: "profile",
    label: "Profile",
    icon: "user",
    href: "/profile",
    description: "Edit user settings and preferences",
  });
  // Team Settings - Coaches and super_admin only
  if (
    userRole === "admin" ||
    userRole === "coach" ||
    (userRole as string) === "super_admin"
  ) {
    items.push({
      id: "team-settings",
      label: "Team Settings",
      icon: "settings",
      href: "/team/1/settings",
      roles: ["admin", "coach", "super_admin"],
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
    href: "/about",
    description: "Learn about BoxCall",
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
      href: "/templates",
      roles: ["admin", "coach"],
      description: "Pre-built templates and resources",
    });
  }
  // Playground - Developers and Super Admins only
  // Handle dev mode roles that include "super_admin"
  if (
    userRole === "admin" ||
    (userRole && userRole.includes("super_admin")) ||
    userRole === null ||
    userRole === "coach"
  ) {
    items.push({
      id: "smart-icon-playground",
      label: "Icon Playground",
      icon: "search",
      href: "/playground/smart-icon-system",
      description: "Test and explore the Smart Icon System",
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
  userRole?: UserRole | null | string
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
            color: item.id === "boxcall" ? "jade" : "current",
          })
        : undefined,
      onClick: item.divider
        ? undefined
        : () => {
            if (item.id === "logout") {
              // Handle logout specially
              handleLogout();
            } else {
              window.location.href = item.href;
            }
          },
      divider: item.divider,
      badge: item.badge,
      children: item.children
        ? toSidebarItems(item.children, userRole)
        : undefined,
    }));
};
/**
 * Handle logout functionality
 */
const handleLogout = async () => {
  try {
    // Import supabase dynamically to avoid circular imports
    const { supabase } = await import("../lib/supabase");
    await supabase.auth.signOut();
    window.location.href = "/login";
  } catch (error) {
    console.error("Error during logout:", error);
    // Fallback: force redirect to login
    window.location.href = "/login";
  }
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
    admin: { display: "Administrator", color: "red" },
    coach: { display: "Coach", color: "blue" },
    player: { display: "Player", color: "green" },
    family: { display: "Family", color: "purple" },
  };
  return roleInfo[role] || { display: role, color: "gray" };
};
