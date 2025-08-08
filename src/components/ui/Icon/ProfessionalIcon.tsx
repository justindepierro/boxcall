/**
 * Professional Icon System - Complete Replacement
 *
 * Tree-shakable, performance-optimized icon system
 * Replaces the 998-line legacy Icon.tsx with modern architecture
 */

import React from "react";
import { getComponentColor } from "../../../design-system/tokens";
import {
  // Navigation & Layout
  Menu,
  X as Close,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Home,
  Settings,
  Grid,
  Search,
  Filter,

  // Actions & Controls
  Plus,
  PlusCircle,
  Edit3 as Edit,
  Trash2 as Delete,
  Download,
  Upload,
  Copy,
  Share,
  Eye,

  // Status & Feedback
  Check,
  CheckCircle,
  AlertTriangle as Warning,
  AlertTriangle,
  AlertCircle as Alert,
  Info,
  Lock,
  Unlock,
  Shield,
  ShieldCheck,

  // Practice & Sports
  Calendar,
  Clock,
  Play,
  Pause,
  Square as Stop,
  Users,
  User,
  UserCheck,
  Trophy,
  Award,
  Target,
  Medal,
  Crown,
  Flame,
  Zap,

  // Communication & Media
  Mail,
  Phone,
  MapPin,
  FileText as File,
  Clipboard,
  MessageSquare,

  // Data & Analytics
  BarChart3 as BarChart,
  TrendingUp,
  Activity,
  Database,

  // Technical & System
  Code,
  Wrench,
  Cog,
  Power,
  Key,
  Book,
  Star,
} from "lucide-react";

// Icon name mapping for all 67 used icons
const iconMap = {
  // Navigation
  menu: Menu,
  close: Close,
  "chevron-down": ChevronDown,
  "chevron-up": ChevronUp,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  "arrow-left": ArrowLeft,
  home: Home,
  settings: Settings,
  grid: Grid,
  search: Search,
  filter: Filter,

  // Actions
  plus: Plus,
  "plus-circle": PlusCircle,
  edit: Edit,
  delete: Delete,
  download: Download,
  upload: Upload,
  copy: Copy,
  share: Share,
  eye: Eye,

  // Status & Feedback
  check: Check,
  "check-circle": CheckCircle,
  warning: Warning,
  "alert-triangle": AlertTriangle,
  alert: Alert,
  info: Info,
  lock: Lock,
  unlock: Unlock,
  shield: Shield,
  "shield-check": ShieldCheck,

  // Practice & Sports
  calendar: Calendar,
  clock: Clock,
  play: Play,
  pause: Pause,
  stop: Stop,
  users: Users,
  user: User,
  "user-check": UserCheck,
  trophy: Trophy,
  award: Award,
  target: Target,
  medal: Medal,
  crown: Crown,
  flame: Flame,
  zap: Zap,

  // Communication
  mail: Mail,
  phone: Phone,
  map: MapPin,
  file: File,
  clipboard: Clipboard,
  message: MessageSquare,

  // Data & Analytics
  "bar-chart": BarChart,
  chart: BarChart, // alias
  "trending-up": TrendingUp,
  activity: Activity,
  database: Database,

  // Technical
  code: Code,
  wrench: Wrench,
  cog: Cog,
  power: Power,
  key: Key,
  book: Book,
  star: Star,
  pdf: File, // using File icon for PDF

  // Custom/Brand
  boxcall: Target, // using Target as BoxCall brand icon

  // Additional specific icons found in usage
  team: Users, // alias for users
  location: MapPin, // alias for map
  email: Mail, // alias for mail
} as const;

export type IconName = keyof typeof iconMap;

export type IconSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

export type IconColor =
  | "jade"
  | "navy"
  | "slate"
  | "white"
  | "black"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "current";

export interface IconProps {
  name: IconName;
  size?: IconSize;
  color?: IconColor;
  className?: string;
  strokeWidth?: number;
}

// Size mapping
const sizeMap = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  "2xl": 48,
  "3xl": 64,
} as const;

export const Icon: React.FC<IconProps> = ({
  name,
  size = "md",
  color = "current",
  className = "",
  strokeWidth = 2,
  ...props
}) => {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  const sizeValue = sizeMap[size] || size;
  const colorValue = getComponentColor("icon", color);

  return (
    <IconComponent
      size={sizeValue}
      strokeWidth={strokeWidth}
      className={className}
      style={{ color: colorValue }}
      {...props}
    />
  );
};

// Convenience exports for common patterns
export const PlayIcon = () => <Icon name="play" color="primary" />;
export const PauseIcon = () => <Icon name="pause" color="secondary" />;
export const EditIcon = () => <Icon name="edit" size="sm" color="secondary" />;
export const DeleteIcon = () => <Icon name="delete" size="sm" color="error" />;
export const AddIcon = () => <Icon name="plus" color="primary" />;
export const CalendarIcon = () => <Icon name="calendar" color="navy" />;
export const ClockIcon = () => <Icon name="clock" color="secondary" />;
export const TeamIcon = () => <Icon name="users" color="navy" />;
export const SettingsIcon = () => <Icon name="settings" color="secondary" />;

export default Icon;
