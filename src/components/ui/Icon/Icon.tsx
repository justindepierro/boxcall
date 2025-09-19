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
  | "check-square"
  | "clipboard"
  | "wrench"
  | "bug"
  | "camera"
  | "target"
  | "zap"
  | "award"
  | "medal"
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
  | "football"
  | "server"
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
  name: IconName | { name: IconName };
  size?: IconSize;
  color?: IconColor;
  className?: string;
}

export const Icon: React.FC<IconProps> = (props) => {
  const {
    name,
    size = "md",
    color = "current",
    className = "",
    "aria-label": ariaLabel,
    role,
    tabIndex,
    focusable,
  } = props;
  // Accept both hyphenated and camelCase forms just in case
  type AriaHiddenProps = { "aria-hidden"?: boolean; ariaHidden?: boolean };
  const ariaHidden =
    (props as unknown as AriaHiddenProps)["aria-hidden"] ??
    (props as unknown as AriaHiddenProps).ariaHidden ??
    false;
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
  const toModularName = (n: IconName | { name: IconName }): ModularIconName => {
    // Handle case where an object with name property is passed
    const actualName =
      typeof n === "object" && n !== null && "name" in n ? n.name : n;
    const debugEnabled =
      (typeof window !== "undefined" &&
        // @ts-expect-error custom flag on window
        (window.__ICON_DEBUG__ === true ||
          localStorage.getItem("debugIcons") === "1")) ||
      false; // DEBUGGING DISABLED - Issue resolved
    if (debugEnabled) {
      console.info(`[IconDebug] toModularName input:`, {
        input: n,
        actualName,
      });
    }
    const supported = new Set<ModularIconName>([
      "menu",
      "close",
      "plus",
      "plus-circle",
      "minus",
      "edit",
      "delete",
      "check",
      "alert-triangle",
      "warning",
      "error",
      "info",
      "alert",
      "check-square",
      "clipboard",
      "tag",
      "calendar",
      "clock",
      "users",
      "user",
      "user-plus",
      "target",
      "trophy",
      "award",
      "medal",
      "star",
      "trending-up",
      "zap",
      "flag",
      "shield",
      "activity",
      "chart",
      "bar-chart",
      "map",
      "map-pin",
      "message",
      "home",
      "refresh-cw",
      "refresh",
      "wrench",
      "help-circle",
      "bug",
      "wifi-off",
      "server",
      "save",
      "download",
      "upload",
      "search",
      "filter",
      "image",
      "camera",
      "arrow-left",
      "arrow-right",
      "arrow-up",
      "arrow-down",
      "chevron-down",
      "chevron-up",
      "chevron-left",
      "chevron-right",
      "play",
      "pause",
      "team",
      "book",
      "file",
      "pdf",
      "copy",
      "folder",
      "database",
      "phone",
      "mail",
      "eye",
      "eye-off",
      "lock",
      "unlock",
      "key",
      "hash",
      "clipboard-list",
      "check-circle",
      "grid",
      "power",
      "pointer",
      "hand",
      "move",
      "pen-tool",
      "link",
      "sparkles",
      "crown",
      "football",
      "toggle-right",
      "toggle-left",
      "back",
      "forward",
      "settings",
      "gamepad-2",
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
    const ok = supported.has(actualName as ModularIconName);
    if (!ok && debugEnabled) {
      console.warn(`[IconDebug] unsupported icon name; falling back`, {
        name: actualName,
        originalInput: n,
      });
    }
    return ok ? (actualName as ModularIconName) : "help-circle";
  };

  // Extract the actual icon name for use throughout the component
  const actualIconName =
    typeof name === "object" && name !== null && "name" in name
      ? name.name
      : name;

  // If the icon is decorative (aria-hidden), do not provide an aria-label
  const computedAriaLabel = ariaHidden
    ? undefined
    : (ariaLabel ?? actualIconName);

  return (
    <ModularIcon
      name={toModularName(name)}
      size={resolvedSize}
      color={vectorColor}
      className={className ? `${className} ${colorClass}`.trim() : colorClass}
      role={role}
      aria-label={computedAriaLabel}
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
