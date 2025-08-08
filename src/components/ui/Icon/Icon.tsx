/**
 * Streamlined Icon System
 * Simplified from 999-line monster to clean, maintainable component
 */
import React from "react";
import * as LucideIcons from "lucide-react";
import { getComponentColor } from "../../../design-system/tokens";

// Size mapping
const SIZE_MAP = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  touch: 44,
} as const;

export type IconSize = keyof typeof SIZE_MAP;
export type IconColor =
  | "primary"
  | "secondary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "current";

// Essential icons for BoxCall - only what we actually use
const ICON_MAP = {
  // Navigation
  home: LucideIcons.Home,
  menu: LucideIcons.Menu,
  close: LucideIcons.X,
  settings: LucideIcons.Settings,
  back: LucideIcons.ArrowLeft,
  forward: LucideIcons.ArrowRight,
  "chevron-up": LucideIcons.ChevronUp,
  "chevron-down": LucideIcons.ChevronDown,
  "chevron-left": LucideIcons.ChevronLeft,
  "chevron-right": LucideIcons.ChevronRight,

  // Core football app
  play: LucideIcons.Play,
  pause: LucideIcons.Pause,
  calendar: LucideIcons.Calendar,
  clock: LucideIcons.Clock,
  team: LucideIcons.Users,
  user: LucideIcons.User,
  users: LucideIcons.Users, // For team navigation
  book: LucideIcons.Book, // For playbook
  edit: LucideIcons.Edit3,
  delete: LucideIcons.Trash2,
  plus: LucideIcons.Plus,
  minus: LucideIcons.Minus,

  // Files & Actions
  save: LucideIcons.Save,
  download: LucideIcons.Download,
  upload: LucideIcons.Upload,
  search: LucideIcons.Search,
  filter: LucideIcons.Filter,

  // Status & Feedback
  check: LucideIcons.Check,
  warning: LucideIcons.AlertTriangle,
  error: LucideIcons.AlertCircle,
  info: LucideIcons.Info,

  // Sports specific
  target: LucideIcons.Target,
  zap: LucideIcons.Zap,
  award: LucideIcons.Award,
  flag: LucideIcons.Flag,
  star: LucideIcons.Star,
  "trending-up": LucideIcons.TrendingUp,

  // Communication
  phone: LucideIcons.Phone,
  mail: LucideIcons.Mail,
  message: LucideIcons.MessageCircle,

  // Files
  file: LucideIcons.File,
  folder: LucideIcons.Folder,
  pdf: LucideIcons.FileText,
  database: LucideIcons.Database,

  // System
  eye: LucideIcons.Eye,
  "eye-off": LucideIcons.EyeOff,
  lock: LucideIcons.Lock,
  unlock: LucideIcons.Unlock,
  key: LucideIcons.Key,
  "user-plus": LucideIcons.UserPlus,
  "check-circle": LucideIcons.CheckCircle,

  // Arrows for UI
  "arrow-up": LucideIcons.ArrowUp,
  "arrow-down": LucideIcons.ArrowDown,
  "arrow-left": LucideIcons.ArrowLeft,
  "arrow-right": LucideIcons.ArrowRight,
} as const;

export type IconName = keyof typeof ICON_MAP;

export interface IconProps {
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
}) => {
  const IconComponent = ICON_MAP[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return <LucideIcons.HelpCircle size={SIZE_MAP[size]} />;
  }

  const colorClass =
    color === "current" ? "" : getComponentColor("icon", color);

  return (
    <IconComponent
      size={SIZE_MAP[size]}
      className={`${colorClass} ${className}`.trim()}
    />
  );
};

// Convenience components for common use cases
export const PlayIcon = () => <Icon name="play" color="primary" />;
export const EditIcon = () => <Icon name="edit" color="secondary" />;
export const DeleteIcon = () => <Icon name="delete" color="error" />;

export default Icon;
