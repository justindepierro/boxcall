import React from "react";
import { Icon } from "../Icon/Icon";

// Map nav schema icon strings to Icon component names
const iconMap: Record<string, string> = {
  Home: "home",
  Dashboard: "home",
  "Team Bulletin": "users",
  BoxCall: "box",
  Playbook: "book",
  Calendar: "calendar",
  Profile: "user",
  "Team Settings": "settings",
  About: "info",
  Templates: "list",
  "Log Out": "power",
  // Add more mappings as needed
  Bulletin: "users",
  Team: "users",
  Settings: "settings",
  Info: "info",
  Help: "help-circle",
  Logout: "power",
  Exit: "power",
  Members: "users",
  Coaches: "users",
  Players: "users",
  Reports: "bar-chart",
  Analytics: "bar-chart",
  Files: "file",
  Documents: "file",
  "User Profile": "user",
  "Account Settings": "settings",
  "Admin Panel": "settings",
  "Manage Team": "users",
  "Manage Playbook": "book",
  "Manage Calendar": "calendar",
  "Manage Templates": "list",
  "Manage Members": "users",
  "Manage Coaches": "users",
  "Manage Players": "users",
  // Add more as needed
};
export function getSidebarIcon(
  icon?: string | React.ReactNode
): React.ReactNode {
  if (!icon) {
    console.warn(`[Sidebar] No icon provided for sidebar item.`);
    return null;
  }
  // If already a ReactNode (e.g., <Icon ... />), return as-is
  if (React.isValidElement(icon)) {
    console.info(`[Sidebar] Icon is a ReactNode:`, icon);
    return icon;
  }
  if (typeof icon !== "string") {
    console.warn(`[Sidebar] Icon is not a string or ReactNode:`, icon);
    return null;
  }
  const mapped = iconMap[icon] || icon.toLowerCase();
  console.info(`[Sidebar] Requested icon: '${icon}', mapped to: '${mapped}'`);
  // Expanded valid icon names from IconName type
  const validNames: Set<string> = new Set([
    "home",
    "menu",
    "close",
    "tag",
    "settings",
    "back",
    "forward",
    "chevron-up",
    "chevron-down",
    "chevron-left",
    "chevron-right",
    "play",
    "pause",
    "calendar",
    "clock",
    "team",
    "user",
    "users",
    "book",
    "edit",
    "delete",
    "plus",
    "plus-circle",
    "minus",
    "save",
    "download",
    "upload",
    "search",
    "filter",
    "check",
    "warning",
    "alert-triangle",
    "refresh-cw",
    "error",
    "info",
    "alert",
    "wrench",
    "bug",
    "camera",
    "target",
    "zap",
    "award",
    "trophy",
    "flag",
    "star",
    "trending-up",
    "activity",
    "chart",
    "bar-chart",
    "shield",
    "phone",
    "mail",
    "message",
    "file",
    "copy",
    "folder",
    "pdf",
    "database",
    "image",
    "eye",
    "eye-off",
    "lock",
    "unlock",
    "key",
    "hash",
    "clipboard-list",
    "user-plus",
    "inbox",
    "flask-conical",
    "sprout",
    "lightbulb",
    "rocket",
    "party-popper",
    "type",
    "list",
    "circle",
    "graduation-cap",
    "shirt",
    "check-circle",
    "grid",
    "power",
    "arrow-up",
    "arrow-down",
    "arrow-left",
    "arrow-right",
    "map",
    "map-pin",
    "crown",
    "wifi-off",
    "toggle-right",
    "toggle-left",
    "gamepad-2",
    "pointer",
    "hand",
    "move",
    "pen-tool",
    "link",
    "sparkles",
    "help-circle",
  ]);
  const iconProp = validNames.has(mapped)
    ? (mapped as import("../Icon/Icon").IconName)
    : ("help-circle" as import("../Icon/Icon").IconName);
  if (!validNames.has(mapped)) {
    // ...existing code...
    console.warn(
      `[Sidebar] Unknown icon: '${icon}'. Falling back to 'help-circle'.`
    );
  }
  return <Icon name={iconProp} size="md" />;
}
