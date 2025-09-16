/**
 * Icon Adapter
 * Preserves the existing Icon API but delegates rendering to the tree-shakeable ModularIcon.
 */
import React from "react";
import { getComponentColor } from "../../../design-system/tokens";
import {
  ModularIcon,
  type ModularIconName,
  type ModularIconProps,
} from "./ModularIcon";

// Size mapping kept for backwards compatibility
const SIZE_MAP = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  touch: 44,
} as const;

export type IconSize = keyof typeof SIZE_MAP | number;
export type IconColor =
  | "primary"
  | "secondary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "navy"
  | "current";

// Keep the IconName as a superset of what ModularIcon supports; unknown names will fall back to help-circle
export type IconName =
  | "home"
  | "menu"
  | "close"
  | "tag"
  | "settings"
  | "back"
  | "forward"
  | "chevron-up"
  | "chevron-down"
  | "chevron-left"
  | "chevron-right"
  | "play"
  | "pause"
  | "calendar"
  | "clock"
  | "team"
  | "user"
  | "users"
  | "book"
  | "edit"
  | "delete"
  | "plus"
  | "plus-circle"
  | "minus"
  | "save"
  | "download"
  | "upload"
  | "search"
  | "filter"
  | "check"
  | "warning"
  | "alert-triangle"
  | "refresh-cw"
  | "error"
  | "info"
  | "alert"
  | "wrench"
  | "bug"
  | "camera"
  | "target"
  | "zap"
  | "award"
  | "trophy"
  | "flag"
  | "star"
  | "trending-up"
  | "activity"
  | "chart"
  | "bar-chart"
  | "shield"
  | "phone"
  | "mail"
  | "message"
  | "file"
  | "copy"
  | "folder"
  | "pdf"
  | "database"
  | "image"
  | "eye"
  | "eye-off"
  | "lock"
  | "unlock"
  | "key"
  | "hash"
  | "clipboard-list"
  | "trending-up"
  | "user-plus"
  | "inbox"
  | "flask-conical"
  | "sprout"
  | "lightbulb"
  | "rocket"
  | "party-popper"
  | "type"
  | "list"
  | "circle"
  | "graduation-cap"
  | "shirt"
  | "check-circle"
  | "grid"
  | "power"
  | "arrow-up"
  | "arrow-down"
  | "arrow-left"
  | "arrow-right"
  | "map"
  | "map-pin"
  | "crown"
  | "wifi-off"
  | "toggle-right"
  | "toggle-left"
  | "gamepad-2"
  | "pointer"
  | "hand"
  | "move"
  | "pen-tool"
  | "link"
  | "sparkles";

type AccessibleSvgProps = Pick<
  React.SVGProps<SVGSVGElement>,
  "role" | "aria-label" | "aria-hidden" | "focusable" | "tabIndex"
>;

export interface IconProps extends AccessibleSvgProps {
  name: IconName;
  size?: IconSize;
  color?: IconColor;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = "md",
  color = "current",
  className = "",
  "aria-label": ariaLabel,
  role,
  tabIndex,
  focusable,
  "aria-hidden": ariaHidden,
}) => {
  const resolvedSize =
    typeof size === "number" ? size : (SIZE_MAP[size] ?? SIZE_MAP.md);

  const colorClass =
    color === "current"
      ? ""
      : getComponentColor("icon", color === "navy" ? "secondary" : color);

  // ModularIcon controls the vector color via 'color' prop; we pass className for layout only
  const vectorColor =
    color === "current"
      ? "current"
      : (color as unknown as ModularIconProps["color"]);

  // Runtime guard to ensure the name is a supported ModularIconName; fallback to 'help-circle'
  const toModularName = (n: IconName): ModularIconName => {
    const supported = new Set<ModularIconName>([
      "home",
      "menu",
      "close",
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
      "tag",
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
      "target",
      "zap",
      "award",
      "trophy",
      "flag",
      "star",
      "trending-up",
      "activity",
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
      "camera",
      "eye",
      "eye-off",
      "lock",
      "unlock",
      "key",
      "hash",
      "clipboard-list",
      "user-plus",
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
    ]);
    return supported.has(n as ModularIconName)
      ? (n as ModularIconName)
      : "help-circle";
  };

  return (
    <ModularIcon
      name={toModularName(name)}
      size={resolvedSize}
      color={vectorColor}
      className={className ? `${className} ${colorClass}`.trim() : colorClass}
      role={role}
      aria-label={ariaLabel ?? name}
      aria-hidden={ariaHidden}
      focusable={focusable}
      tabIndex={tabIndex}
    />
  );
};

// Convenience components for common use cases
export const PlayIcon = () => <Icon name="play" color="primary" />;
export const EditIcon = () => <Icon name="edit" color="secondary" />;
export const DeleteIcon = () => <Icon name="delete" color="error" />;

export default Icon;
