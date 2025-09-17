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
import dynamicIconImports from "lucide-react/dynamicIconImports";
// Minimal static fallbacks for critical icons (Trophy Shelf + common)
import {
  Trophy as FbkTrophy,
  Award as FbkAward,
  Medal as FbkMedal,
  Star as FbkStar,
  Target as FbkTarget,
  Zap as FbkZap,
  Activity as FbkActivity,
  Shield as FbkShield,
  MessageCircle as FbkMessageCircle,
  Calendar as FbkCalendar,
  Flag as FbkFlag,
  Check as FbkCheck,
  Camera as FbkCamera,
} from "lucide-react";

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
  | "check-square"
  | "clipboard"
  | "tag"
  | "calendar"
  | "clock"
  | "users"
  | "user"
  | "user-plus"
  | "target"
  | "trophy"
  | "award"
  | "medal"
  | "star"
  | "trending-up"
  | "zap"
  | "flag"
  | "shield"
  | "activity"
  | "chart"
  | "bar-chart"
  | "map"
  | "map-pin"
  | "message"
  | "home"
  | "refresh-cw"
  | "refresh"
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
  | "football"
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

// Use lucide's official dynamic loader map so Vite resolves chunks correctly
// Convert kebab/lowercase ids (e.g. "arrow-left", "bar-chart", "gamepad-2")
// to Lucide's PascalCase component keys ("ArrowLeft", "BarChart", "Gamepad2")
const toPascalKey = (id: string): string =>
  id
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");

const importIcon = (id: string): Loader => {
  return () => {
    const map = dynamicIconImports as unknown as Record<
      string,
      () => Promise<unknown>
    >;
    const pascal = toPascalKey(id);
    // lucide-react dynamicIconImports typically uses kebab-case OR PascalCase keys.
    const candidates = [id, pascal];
    const foundLoader = candidates
      .map((key) => map[key])
      .find((loader): loader is () => Promise<unknown> => Boolean(loader));

    const tryModuleFallback = () =>
      import("lucide-react").then((mod) => {
        const Comp = (mod as Record<string, unknown>)[pascal] as unknown as
          | LucideComponent
          | undefined;
        if (!Comp) {
          const tried = candidates.join(", ");
          throw new Error(
            `Lucide icon not found in dynamic map or module: id='${id}' tried keys=[${tried}]`
          );
        }
        return Comp as unknown as { default: LucideComponent } | LucideComponent;
      });

    if (foundLoader) {
      return (foundLoader() as Promise<
        { default: LucideComponent } | LucideComponent
      >).catch(() => tryModuleFallback());
    }

    // No loader in the map, go straight to module fallback.
    return tryModuleFallback();
  };
};

// Static fallback components keyed by our public icon names
const fallbackIcons: Partial<Record<ModularIconName, LucideComponent>> = {
  trophy: FbkTrophy as unknown as LucideComponent,
  award: FbkAward as unknown as LucideComponent,
  medal: FbkMedal as unknown as LucideComponent,
  star: FbkStar as unknown as LucideComponent,
  target: FbkTarget as unknown as LucideComponent,
  zap: FbkZap as unknown as LucideComponent,
  activity: FbkActivity as unknown as LucideComponent,
  shield: FbkShield as unknown as LucideComponent,
  message: FbkMessageCircle as unknown as LucideComponent,
  calendar: FbkCalendar as unknown as LucideComponent,
  football: FbkTrophy as unknown as LucideComponent,
  flag: FbkFlag as unknown as LucideComponent,
  check: FbkCheck as unknown as LucideComponent,
  camera: FbkCamera as unknown as LucideComponent,
};

const iconLoaders: Record<ModularIconName, Loader> = {
  // core navigation/actions
  menu: importIcon("menu"),
  close: importIcon("x"),
  plus: importIcon("plus"),
  "plus-circle": importIcon("plus-circle"),
  minus: importIcon("minus"),
  edit: importIcon("edit-3"),
  delete: importIcon("trash-2"),
  check: importIcon("check"),
  "alert-triangle": importIcon("alert-triangle"),
  warning: importIcon("alert-triangle"),
  error: importIcon("alert-circle"),
  info: importIcon("info"),
  alert: importIcon("alert-triangle"),
  "check-square": importIcon("check-square"),
  clipboard: importIcon("clipboard"),
  tag: importIcon("tag"),
  calendar: importIcon("calendar"),
  clock: importIcon("clock"),
  users: importIcon("users"),
  user: importIcon("user"),
  "user-plus": importIcon("user-plus"),
  target: importIcon("target"),
  trophy: importIcon("trophy"),
  award: importIcon("award"),
  medal: importIcon("medal"),
  star: importIcon("star"),
  "trending-up": importIcon("trending-up"),
  zap: importIcon("zap"),
  flag: importIcon("flag"),
  shield: importIcon("shield"),
  activity: importIcon("activity"),
  chart: importIcon("bar-chart"),
  "bar-chart": importIcon("bar-chart"),
  map: importIcon("map"),
  "map-pin": importIcon("map-pin"),
  message: importIcon("message-circle"),
  home: importIcon("home"),
  "refresh-cw": importIcon("refresh-cw"),
  refresh: importIcon("refresh-cw"),
  wrench: importIcon("wrench"),
  "help-circle": importIcon("help-circle"),
  bug: importIcon("bug"),
  "wifi-off": importIcon("wifi-off"),
  server: importIcon("server"),
  save: importIcon("save"),
  download: importIcon("download"),
  upload: importIcon("upload"),
  search: importIcon("search"),
  filter: importIcon("filter"),
  image: importIcon("image"),
  camera: importIcon("camera"),
  "arrow-left": importIcon("arrow-left"),
  "arrow-right": importIcon("arrow-right"),
  "arrow-up": importIcon("arrow-up"),
  "arrow-down": importIcon("arrow-down"),
  "chevron-down": importIcon("chevron-down"),
  "chevron-up": importIcon("chevron-up"),
  "chevron-left": importIcon("chevron-left"),
  "chevron-right": importIcon("chevron-right"),
  play: importIcon("play"),
  pause: importIcon("pause"),
  team: importIcon("users"),
  book: importIcon("book"),
  file: importIcon("file"),
  pdf: importIcon("file-text"),
  copy: importIcon("copy"),
  folder: importIcon("folder"),
  database: importIcon("database"),
  phone: importIcon("phone"),
  mail: importIcon("mail"),
  eye: importIcon("eye"),
  "eye-off": importIcon("eye-off"),
  lock: importIcon("lock"),
  unlock: importIcon("unlock"),
  key: importIcon("key"),
  hash: importIcon("hash"),
  "clipboard-list": importIcon("clipboard-list"),
  "check-circle": importIcon("check-circle"),
  grid: importIcon("grid"),
  power: importIcon("power"),
  pointer: importIcon("mouse-pointer"),
  hand: importIcon("hand"),
  move: importIcon("move"),
  "pen-tool": importIcon("pen-tool"),
  link: importIcon("link"),
  sparkles: importIcon("sparkles"),
  crown: importIcon("crown"),
  football: importIcon("football"),
  "toggle-right": importIcon("toggle-right"),
  "toggle-left": importIcon("toggle-left"),
  back: importIcon("arrow-left"),
  forward: importIcon("arrow-right"),
  settings: importIcon("settings"),
  "gamepad-2": importIcon("gamepad-2"),
  inbox: importIcon("inbox"),
  "flask-conical": importIcon("flask-conical"),
  sprout: importIcon("sprout"),
  lightbulb: importIcon("lightbulb"),
  rocket: importIcon("rocket"),
  "party-popper": importIcon("party-popper"),
  type: importIcon("type"),
  list: importIcon("list"),
  circle: importIcon("circle"),
  "graduation-cap": importIcon("graduation-cap"),
  shirt: importIcon("shirt"),
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
  const debugEnabled =
    (typeof window !== "undefined" &&
      // @ts-expect-error: custom debug flag
      (window.__ICON_DEBUG__ === true ||
        localStorage.getItem("debugIcons") === "1")) ||
    false;
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
      if (debugEnabled) {
        console.debug(`[IconDebug] start load`, { name });
      }
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
            if (debugEnabled) {
              console.debug(`[IconDebug] load success`, { name });
            }
          }
          setLoading(false);
        })
        .catch((error) => {
          // Swallow errors during tests/SSR; keep placeholder visible
          if (debugEnabled) {
            console.error(`[IconDebug] load error`, { name, error });
          } else {
            console.error(`Failed to load icon: ${name}`, error);
          }
          // Last-chance static fallback for critical icons
          const Fallback = fallbackIcons[name as ModularIconName];
          if (Fallback) {
            iconRegistry.set(name, Fallback);
            setIconComponent(Fallback);
            if (debugEnabled) {
              console.debug(`[IconDebug] used static fallback`, { name });
            }
          }
          if (!isMounted) return;
          setLoading(false);
        });
      return () => {
        isMounted = false;
      };
    }
  }, [name, loading, debugEnabled]);

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
    <span
      role={role ?? "img"}
      aria-label={ariaLabel ?? name}
      aria-hidden={ariaHidden}
      tabIndex={tabIndex}
      // Ensure wrapper doesn't break layout
      style={{ display: "inline-flex", lineHeight: 0 }}
    >
      <IconComponent
        size={iconSize}
        color={iconColor}
        strokeWidth={strokeWidth}
        className={className}
        // Pass-through focusability to SVG when provided
        // @ts-expect-error: lucide types may not declare focusable
        focusable={focusable}
      />
    </span>
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
