import React from "react";
import { Icon } from "../Icon/Icon";

// Map nav schema icon strings to Icon component names
const iconMap: Record<string, string> = {
  Home: "home",
  Calendar: "calendar",
  Book: "book",
  ClipboardList: "clipboard-list",
  BarChart3: "bar-chart",
  Settings: "settings",
  // Add more mappings as needed
};

export function getSidebarIcon(iconName?: string): React.ReactNode {
  if (!iconName || typeof iconName !== "string") return null;
  const mapped = iconMap[iconName] || iconName.toLowerCase();
  // Type guard: only use mapped if it's a valid IconName, else fallback
  const validNames: Set<string> = new Set([
    "home", "calendar", "book", "clipboard-list", "bar-chart", "settings", "help-circle",
    // Add more valid icon names as needed
  ]);
  const iconProp = validNames.has(mapped)
    ? (mapped as import("../Icon/Icon").IconName)
    : ("help-circle" as import("../Icon/Icon").IconName);
  return <Icon name={iconProp} size="md" />;
}
