/**
 * Modular Icon System v2
 *
 * SAFE PARALLEL IMPLEMENTATION
 * - Builds alongside the existing 998-line Icon.tsx
 * - Can be gradually adopted by components
 * - Zero risk to existing functionality
 * - Perfect tree shaking for new adopters
 */

import React from "react";
import { getComponentColor } from "../../../design-system/tokens";

// Core types
type AccessibleSvgProps = Pick<
  React.SVGProps<SVGSVGElement>,
  "role" | "aria-label" | "aria-hidden" | "focusable" | "tabIndex"
>;

export interface ModularIconProps extends AccessibleSvgProps {
  name: ModularIconName;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "touch" | number;
  className?: string;
  color?:
    | "current"
    | "primary"
    | "secondary"
    | "jade"
    | "navy"
    | "slate"
    | "success"
    | "warning"
    | "error"
    | "info";
  strokeWidth?: number;
}

// Start with just the most common icons to prove the concept
export type ModularIconName =
  | "menu"
  | "close"
  | "plus"
  | "plus-circle"
  | "minus"
  | "edit"
  | "delete"
  | "check"
  | "alert-triangle"
  | "warning"
  | "error"
  | "info"
  | "alert"
  | "tag"
  | "calendar"
  | "clock"
  | "users"
  | "user"
  | "user-plus"
  | "target"
  | "trophy"
  | "award"
  | "star"
  | "trending-up"
  | "zap"
  | "flag"
  | "shield"
  | "activity"
  | "map"
  | "map-pin"
  | "message"
  | "home"
  | "refresh-cw"
  | "wrench"
  | "help-circle"
  | "bug"
  | "wifi-off"
  | "server"
  | "save"
  | "download"
  | "upload"
  | "search"
  | "filter"
  | "image"
  | "camera"
  | "arrow-left"
  | "arrow-right"
  | "arrow-up"
  | "arrow-down"
  | "chevron-down"
  | "chevron-up"
  | "chevron-left"
  | "chevron-right"
  | "play"
  | "pause"
  | "team"
  | "book"
  | "file"
  | "pdf"
  | "copy"
  | "folder"
  | "database"
  | "phone"
  | "mail"
  | "eye"
  | "eye-off"
  | "lock"
  | "unlock"
  | "key"
  | "hash"
  | "clipboard-list"
  | "check-circle"
  | "grid"
  | "power"
  | "pointer"
  | "hand"
  | "move"
  | "pen-tool"
  | "link"
  | "sparkles"
  | "crown"
  | "toggle-right"
  | "toggle-left"
  | "back"
  | "forward"
  | "settings"
  | "gamepad-2"
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
  | "shirt";

// Dynamic imports for perfect tree shaking (limited to our supported set)
type LucideComponent = React.ComponentType<
  AccessibleSvgProps & {
    size?: number;
    color?: string;
    strokeWidth?: number;
    className?: string;
  }
>;
type Loader = () => Promise<{ default: LucideComponent } | LucideComponent>;
const iconLoaders: Record<ModularIconName, Loader> = {
  // core navigation/actions
  menu: () => import("lucide-react/dist/esm/icons/menu.js"),
  close: () => import("lucide-react/dist/esm/icons/x.js"),
  plus: () => import("lucide-react/dist/esm/icons/plus.js"),
  "plus-circle": () => import("lucide-react/dist/esm/icons/plus-circle.js"),
  minus: () => import("lucide-react/dist/esm/icons/minus.js"),
  edit: () => import("lucide-react/dist/esm/icons/edit-3.js"),
  delete: () => import("lucide-react/dist/esm/icons/trash-2.js"),
  check: () => import("lucide-react/dist/esm/icons/check.js"),
  "alert-triangle": () =>
    import("lucide-react/dist/esm/icons/alert-triangle.js"),
  warning: () => import("lucide-react/dist/esm/icons/alert-triangle.js"),
  error: () => import("lucide-react/dist/esm/icons/alert-circle.js"),
  info: () => import("lucide-react/dist/esm/icons/info.js"),
  alert: () => import("lucide-react/dist/esm/icons/alert-triangle.js"),
  tag: () => import("lucide-react/dist/esm/icons/tag.js"),
  calendar: () => import("lucide-react/dist/esm/icons/calendar.js"),
  clock: () => import("lucide-react/dist/esm/icons/clock.js"),
  users: () => import("lucide-react/dist/esm/icons/users.js"),
  user: () => import("lucide-react/dist/esm/icons/user.js"),
  "user-plus": () => import("lucide-react/dist/esm/icons/user-plus.js"),
  target: () => import("lucide-react/dist/esm/icons/target.js"),
  trophy: () => import("lucide-react/dist/esm/icons/trophy.js"),
  award: () => import("lucide-react/dist/esm/icons/award.js"),
  star: () => import("lucide-react/dist/esm/icons/star.js"),
  "trending-up": () => import("lucide-react/dist/esm/icons/trending-up.js"),
  zap: () => import("lucide-react/dist/esm/icons/zap.js"),
  flag: () => import("lucide-react/dist/esm/icons/flag.js"),
  shield: () => import("lucide-react/dist/esm/icons/shield.js"),
  activity: () => import("lucide-react/dist/esm/icons/activity.js"),
  map: () => import("lucide-react/dist/esm/icons/map.js"),
  "map-pin": () => import("lucide-react/dist/esm/icons/map-pin.js"),
  message: () => import("lucide-react/dist/esm/icons/message-circle.js"),
  home: () => import("lucide-react/dist/esm/icons/home.js"),
  "refresh-cw": () => import("lucide-react/dist/esm/icons/refresh-cw.js"),
  wrench: () => import("lucide-react/dist/esm/icons/wrench.js"),
  "help-circle": () => import("lucide-react/dist/esm/icons/help-circle.js"),
  bug: () => import("lucide-react/dist/esm/icons/bug.js"),
  "wifi-off": () => import("lucide-react/dist/esm/icons/wifi-off.js"),
  server: () => import("lucide-react/dist/esm/icons/server.js"),
  save: () => import("lucide-react/dist/esm/icons/save.js"),
  download: () => import("lucide-react/dist/esm/icons/download.js"),
  upload: () => import("lucide-react/dist/esm/icons/upload.js"),
  search: () => import("lucide-react/dist/esm/icons/search.js"),
  filter: () => import("lucide-react/dist/esm/icons/filter.js"),
  image: () => import("lucide-react/dist/esm/icons/image.js"),
  camera: () => import("lucide-react/dist/esm/icons/camera.js"),
  "arrow-left": () => import("lucide-react/dist/esm/icons/arrow-left.js"),
  "arrow-right": () => import("lucide-react/dist/esm/icons/arrow-right.js"),
  "arrow-up": () => import("lucide-react/dist/esm/icons/arrow-up.js"),
  "arrow-down": () => import("lucide-react/dist/esm/icons/arrow-down.js"),
  "chevron-down": () => import("lucide-react/dist/esm/icons/chevron-down.js"),
  "chevron-up": () => import("lucide-react/dist/esm/icons/chevron-up.js"),
  "chevron-left": () => import("lucide-react/dist/esm/icons/chevron-left.js"),
  "chevron-right": () => import("lucide-react/dist/esm/icons/chevron-right.js"),
  play: () => import("lucide-react/dist/esm/icons/play.js"),
  pause: () => import("lucide-react/dist/esm/icons/pause.js"),
  team: () => import("lucide-react/dist/esm/icons/users.js"),
  book: () => import("lucide-react/dist/esm/icons/book.js"),
  file: () => import("lucide-react/dist/esm/icons/file.js"),
  pdf: () => import("lucide-react/dist/esm/icons/file-text.js"),
  copy: () => import("lucide-react/dist/esm/icons/copy.js"),
  folder: () => import("lucide-react/dist/esm/icons/folder.js"),
  database: () => import("lucide-react/dist/esm/icons/database.js"),
  phone: () => import("lucide-react/dist/esm/icons/phone.js"),
  mail: () => import("lucide-react/dist/esm/icons/mail.js"),
  eye: () => import("lucide-react/dist/esm/icons/eye.js"),
  "eye-off": () => import("lucide-react/dist/esm/icons/eye-off.js"),
  lock: () => import("lucide-react/dist/esm/icons/lock.js"),
  unlock: () => import("lucide-react/dist/esm/icons/unlock.js"),
  key: () => import("lucide-react/dist/esm/icons/key.js"),
  hash: () => import("lucide-react/dist/esm/icons/hash.js"),
  "clipboard-list": () =>
    import("lucide-react/dist/esm/icons/clipboard-list.js"),
  "check-circle": () => import("lucide-react/dist/esm/icons/check-circle.js"),
  grid: () => import("lucide-react/dist/esm/icons/grid.js"),
  power: () => import("lucide-react/dist/esm/icons/power.js"),
  pointer: () => import("lucide-react/dist/esm/icons/mouse-pointer.js"),
  hand: () => import("lucide-react/dist/esm/icons/hand.js"),
  move: () => import("lucide-react/dist/esm/icons/move.js"),
  "pen-tool": () => import("lucide-react/dist/esm/icons/pen-tool.js"),
  link: () => import("lucide-react/dist/esm/icons/link.js"),
  sparkles: () => import("lucide-react/dist/esm/icons/sparkles.js"),
  crown: () => import("lucide-react/dist/esm/icons/crown.js"),
  "toggle-right": () => import("lucide-react/dist/esm/icons/toggle-right.js"),
  "toggle-left": () => import("lucide-react/dist/esm/icons/toggle-left.js"),
  back: () => import("lucide-react/dist/esm/icons/arrow-left.js"),
  forward: () => import("lucide-react/dist/esm/icons/arrow-right.js"),
  settings: () => import("lucide-react/dist/esm/icons/settings.js"),
  "gamepad-2": () => import("lucide-react/dist/esm/icons/gamepad-2.js"),
  inbox: () => import("lucide-react/dist/esm/icons/inbox.js"),
  "flask-conical": () => import("lucide-react/dist/esm/icons/flask-conical.js"),
  sprout: () => import("lucide-react/dist/esm/icons/sprout.js"),
  lightbulb: () => import("lucide-react/dist/esm/icons/lightbulb.js"),
  rocket: () => import("lucide-react/dist/esm/icons/rocket.js"),
  "party-popper": () => import("lucide-react/dist/esm/icons/party-popper.js"),
  type: () => import("lucide-react/dist/esm/icons/type.js"),
  list: () => import("lucide-react/dist/esm/icons/list.js"),
  circle: () => import("lucide-react/dist/esm/icons/circle.js"),
  "graduation-cap": () =>
    import("lucide-react/dist/esm/icons/graduation-cap.js"),
  shirt: () => import("lucide-react/dist/esm/icons/shirt.js"),
};

// Icon registry for loaded components
const iconRegistry = new Map<string, LucideComponent>();

// Size mapping
const sizeMap = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  "2xl": 40,
  "3xl": 48,
  touch: 44,
};

// Color mapping
const colorMap = {
  current: "currentColor",
  primary: getComponentColor("icon", "primary"),
  secondary: getComponentColor("icon", "secondary"),
  jade: getComponentColor("icon", "jade"),
  navy: getComponentColor("icon", "navy"),
  slate: getComponentColor("icon", "slate"),
  success: getComponentColor("icon", "success"),
  warning: getComponentColor("icon", "warning"),
  error: getComponentColor("icon", "error"),
  info: getComponentColor("icon", "info"),
};

/**
 * ModularIcon - Tree-shakeable icon component
 *
 * Only imports the specific icons that are used
 * Perfect for new components that want bundle optimization
 */
export const ModularIcon: React.FC<ModularIconProps> = ({
  name,
  size = "md",
  className = "",
  color = "current",
  strokeWidth = 2,
  "aria-label": ariaLabel,
  role,
  tabIndex,
  focusable,
  "aria-hidden": ariaHidden,
}) => {
  const [IconComponent, setIconComponent] = React.useState<React.ComponentType<{
    size?: number;
    color?: string;
    strokeWidth?: number;
    className?: string;
  }> | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    // Check if already loaded
    if (iconRegistry.has(name)) {
      setIconComponent(iconRegistry.get(name)!);
      return;
    }

    // Load the icon dynamically (per-icon subpath to avoid bundling the whole library)
    const loader = iconLoaders[name];
    if (loader && !loading) {
      let isMounted = true;
      setLoading(true);
      loader()
        .then((mod) => {
          if (!isMounted) return;
          const component = mod as
            | { default?: LucideComponent }
            | LucideComponent;
          const Comp = (
            typeof component === "function"
              ? component
              : (component as { default?: LucideComponent }).default
          ) as LucideComponent;
          if (Comp) {
            iconRegistry.set(name, Comp);
            setIconComponent(Comp);
          }
          setLoading(false);
        })
        .catch((error) => {
          // Swallow errors during tests/SSR; keep placeholder visible
          console.error(`Failed to load icon: ${name}`, error);
          if (!isMounted) return;
          setLoading(false);
        });
      return () => {
        isMounted = false;
      };
    }
  }, [name, loading]);

  if (loading || !IconComponent) {
    // Return a minimal loading placeholder
    return (
      <svg
        role={role ?? "img"}
        aria-label={ariaLabel ?? name}
        aria-hidden={ariaHidden}
        focusable={focusable}
        tabIndex={tabIndex}
        className={`inline-block surface-subtle rounded ${className}`}
        width={typeof size === "number" ? size : sizeMap[size]}
        height={typeof size === "number" ? size : sizeMap[size]}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Simple neutral placeholder mark */}
        <circle cx="12" cy="12" r="10" stroke="#00A86B" strokeWidth="2" />
      </svg>
    );
  }

  const iconSize = typeof size === "number" ? size : sizeMap[size];
  const iconColor = colorMap[color];

  return (
    <IconComponent
      size={iconSize}
      color={iconColor}
      strokeWidth={strokeWidth}
      className={className}
      role={role ?? "img"}
      aria-label={ariaLabel ?? name}
      aria-hidden={ariaHidden}
      focusable={focusable}
      tabIndex={tabIndex}
    />
  );
};

// Convenience components for quick adoption
export const ModularPlayIcon: React.FC = () => (
  <ModularIcon name="play" color="primary" />
);
export const ModularEditIcon: React.FC = () => (
  <ModularIcon name="edit" size="sm" color="secondary" />
);
export const ModularDeleteIcon: React.FC = () => (
  <ModularIcon name="delete" size="sm" color="error" />
);
export const ModularAddIcon: React.FC = () => (
  <ModularIcon name="plus" color="primary" />
);
export const ModularCalendarIcon: React.FC = () => (
  <ModularIcon name="calendar" color="navy" />
);
export const ModularClockIcon: React.FC = () => (
  <ModularIcon name="clock" color="secondary" />
);
export const ModularTeamIcon: React.FC = () => (
  <ModularIcon name="users" color="navy" />
);
export const ModularSettingsIcon: React.FC = () => (
  <ModularIcon name="settings" color="secondary" />
);
