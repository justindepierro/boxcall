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

// Import the official dynamic icon imports from lucide-react
import dynamicIconImports from "lucide-react/dist/esm/dynamicIconImports.js";

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
  menu: dynamicIconImports.menu,
  close: dynamicIconImports.x,
  plus: dynamicIconImports.plus,
  "plus-circle": dynamicIconImports["plus-circle"],
  minus: dynamicIconImports.minus,
  edit: dynamicIconImports["edit-3"],
  delete: dynamicIconImports["trash-2"],
  check: dynamicIconImports.check,
  "alert-triangle": dynamicIconImports["alert-triangle"],
  warning: dynamicIconImports["alert-triangle"],
  error: dynamicIconImports["alert-circle"],
  info: dynamicIconImports.info,
  alert: dynamicIconImports["alert-triangle"],
  tag: dynamicIconImports.tag,
  calendar: dynamicIconImports.calendar,
  clock: dynamicIconImports.clock,
  users: dynamicIconImports.users,
  user: dynamicIconImports.user,
  "user-plus": dynamicIconImports["user-plus"],
  target: dynamicIconImports.target,
  trophy: dynamicIconImports.trophy,
  award: dynamicIconImports.award,
  star: dynamicIconImports.star,
  "trending-up": dynamicIconImports["trending-up"],
  zap: dynamicIconImports.zap,
  flag: dynamicIconImports.flag,
  shield: dynamicIconImports.shield,
  activity: dynamicIconImports.activity,
  map: dynamicIconImports.map,
  "map-pin": dynamicIconImports["map-pin"],
  message: dynamicIconImports["message-circle"],
  home: dynamicIconImports.home,
  "refresh-cw": dynamicIconImports["refresh-cw"],
  wrench: dynamicIconImports.wrench,
  "help-circle": dynamicIconImports["help-circle"],
  bug: dynamicIconImports.bug,
  "wifi-off": dynamicIconImports["wifi-off"],
  server: dynamicIconImports.server,
  save: dynamicIconImports.save,
  download: dynamicIconImports.download,
  upload: dynamicIconImports.upload,
  search: dynamicIconImports.search,
  filter: dynamicIconImports.filter,
  image: dynamicIconImports.image,
  camera: dynamicIconImports.camera,
  "arrow-left": dynamicIconImports["arrow-left"],
  "arrow-right": dynamicIconImports["arrow-right"],
  "arrow-up": dynamicIconImports["arrow-up"],
  "arrow-down": dynamicIconImports["arrow-down"],
  "chevron-down": dynamicIconImports["chevron-down"],
  "chevron-up": dynamicIconImports["chevron-up"],
  "chevron-left": dynamicIconImports["chevron-left"],
  "chevron-right": dynamicIconImports["chevron-right"],
  play: dynamicIconImports.play,
  pause: dynamicIconImports.pause,
  team: dynamicIconImports.users,
  book: dynamicIconImports.book,
  file: dynamicIconImports.file,
  pdf: dynamicIconImports["file-text"],
  copy: dynamicIconImports.copy,
  folder: dynamicIconImports.folder,
  database: dynamicIconImports.database,
  phone: dynamicIconImports.phone,
  mail: dynamicIconImports.mail,
  eye: dynamicIconImports.eye,
  "eye-off": dynamicIconImports["eye-off"],
  lock: dynamicIconImports.lock,
  unlock: dynamicIconImports.unlock,
  key: dynamicIconImports.key,
  hash: dynamicIconImports.hash,
  "clipboard-list": dynamicIconImports["clipboard-list"],
  "check-circle": dynamicIconImports["check-circle"],
  grid: dynamicIconImports.grid,
  power: dynamicIconImports.power,
  pointer: dynamicIconImports["mouse-pointer"],
  hand: dynamicIconImports.hand,
  move: dynamicIconImports.move,
  "pen-tool": dynamicIconImports["pen-tool"],
  link: dynamicIconImports.link,
  sparkles: dynamicIconImports.sparkles,
  crown: dynamicIconImports.crown,
  "toggle-right": dynamicIconImports["toggle-right"],
  "toggle-left": dynamicIconImports["toggle-left"],
  back: dynamicIconImports["arrow-left"],
  forward: dynamicIconImports["arrow-right"],
  settings: dynamicIconImports.settings,
  "gamepad-2": dynamicIconImports["gamepad-2"],
  inbox: dynamicIconImports.inbox,
  "flask-conical": dynamicIconImports["flask-conical"],
  sprout: dynamicIconImports.sprout,
  lightbulb: dynamicIconImports.lightbulb,
  rocket: dynamicIconImports.rocket,
  "party-popper": dynamicIconImports["party-popper"],
  type: dynamicIconImports.type,
  list: dynamicIconImports.list,
  circle: dynamicIconImports.circle,
  "graduation-cap": dynamicIconImports["graduation-cap"],
  shirt: dynamicIconImports.shirt,
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
