/**
 * BoxCall Icon System
 * 
 * Centralized icon component using Lucide React for consistent iconography.
 * Replaces all emojis with professional, scalable SVG icons.
 * 
 * Design Philosophy: "Carhartt Reliability" - functional, clear, dependable icons
 */

import React from 'react';
import {
  // Navigation & Layout
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Home,
  Settings,
  
  // Practice & Planning
  Calendar,
  Clock,
  Play,
  Pause,
  Square,
  SkipForward,
  SkipBack,
  Timer,
  MapPin,
  Users,
  User,
  UserCheck,
  
  // Actions & Controls
  Plus,
  Minus,
  Edit3 as Edit,
  Trash2 as Delete,
  Save,
  Download,
  Upload,
  Copy,
  Check,
  AlertCircle,
  Info,
  
  // Theme Icons
  Sun,
  Moon,
  
  // Sports & Achievement Icons
  Trophy,
  Medal,
  Flame,
  
  // Communication & Data
  MessageSquare,
  Phone,
  Mail,
  FileText,
  Folder,
  FolderOpen,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Book,
  
  // Sports Specific
  Target,
  Flag,
  Award,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  
  // PDF & Export
  FileDown,
  Printer,
  Share,
  
  // Status & Feedback
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info as InfoIcon,
  HelpCircle,
  
  // Tools & Equipment
  Wrench,
  Settings as Cog,
  Zap,
  Shield,
  Lock,
  Unlock,
  
  // Team & Roster
  UserPlus,
  UserMinus,
  Crown,
  Star,
  
  // Game & Strategy
  Compass,
  Route,
  Crosshair,
  Eye,
  EyeOff,
  
  // Data & Analytics
  Database,
  BarChart,
  LineChart,
  TrendingUp as TrendingUpIcon,
  Percent,
  Hash,
} from 'lucide-react';

// Icon name mapping for easy usage
const iconMap = {
  // Navigation & Layout
  'menu': Menu,
  'close': X,
  'chevron-down': ChevronDown,
  'chevron-up': ChevronUp,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  'home': Home,
  'settings': Settings,
  
  // Practice & Planning
  'calendar': Calendar,
  'clock': Clock,
  'play': Play,
  'pause': Pause,
  'stop': Square,
  'skip-forward': SkipForward,
  'skip-back': SkipBack,
  'timer': Timer,
  'location': MapPin,
  'users': Users,
  'user': User,
  'user-check': UserCheck,
  
  // Actions & Controls
  'plus': Plus,
  'minus': Minus,
  'edit': Edit,
  'delete': Delete,
  'save': Save,
  'download': Download,
  'upload': Upload,
  'copy': Copy,
  'check': Check,
  'alert': AlertCircle,
  'info': Info,
  
  // Communication & Data
  'message': MessageSquare,
  'phone': Phone,
  'mail': Mail,
  'file': FileText,
  'folder': Folder,
  'folder-open': FolderOpen,
  'search': Search,
  'filter': Filter,
  'sort-asc': SortAsc,
  'sort-desc': SortDesc,
  'book': Book,
  
  // Sports Specific
  'target': Target,
  'flag': Flag,
  'award': Award,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  'bar-chart': BarChart3,
  'pie-chart': PieChart,
  'activity': Activity,
  
  // PDF & Export
  'pdf': FileDown,
  'print': Printer,
  'share': Share,
  
  // Status & Feedback
  'success': CheckCircle,
  'error': XCircle,
  'warning': AlertTriangle,
  'info-circle': InfoIcon,
  'help': HelpCircle,
  
  // Tools & Equipment
  'wrench': Wrench,
  'cog': Cog,
  'zap': Zap,
  'shield': Shield,
  'lock': Lock,
  'unlock': Unlock,
  
  // Team & Roster
  'user-plus': UserPlus,
  'user-minus': UserMinus,
  'team': Users,
  'crown': Crown,
  'star': Star,
  
  // Game & Strategy
  'compass': Compass,
  'route': Route,
  'crosshair': Crosshair,
  'eye': Eye,
  'eye-off': EyeOff,
  
  // Theme Icons
  'sun': Sun,
  'moon': Moon,
  
  // Sports & Achievement Icons
  'trophy': Trophy,
  'medal': Medal,
  'flame': Flame,
  'boxcall': Target, // Use target as BoxCall brand icon
  
  // Data & Analytics
  'database': Database,
  'chart': BarChart,
  'line-chart': LineChart,
  'trend': TrendingUpIcon,
  'percent': Percent,
  'hash': Hash,
} as const;

export type IconName = keyof typeof iconMap;

interface IconProps {
  name: IconName;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'touch' | number;
  className?: string;
  color?: 'current' | 'jade' | 'navy' | 'slate' | 'success' | 'warning' | 'error' | 'info';
  strokeWidth?: number;
}

const sizeMap = {
  xs: 12,    // Tight UI elements
  sm: 16,    // Default small buttons
  md: 20,    // Standard icons
  lg: 24,    // Larger buttons
  xl: 32,    // Headers, prominent actions
  '2xl': 40, // Coach-friendly size
  '3xl': 48, // Extra large for accessibility
  'touch': 44, // Minimum touch target (44px recommended)
};

const colorMap = {
  current: 'currentColor',
  jade: '#047857',
  navy: '#0F172A', 
  slate: '#64748B',
  success: '#047857',
  warning: '#D97706',
  error: '#DC2626',
  info: '#0369A1',
};

export const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 'md', 
  className = '', 
  color = 'current',
  strokeWidth = 2 
}) => {
  const IconComponent = iconMap[name];
  const iconSize = typeof size === 'number' ? size : sizeMap[size];
  const iconColor = colorMap[color];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }
  
  return (
    <IconComponent
      size={iconSize}
      color={iconColor}
      strokeWidth={strokeWidth}
      className={className}
    />
  );
};

// Convenience components for common use cases
export const PlayIcon = () => <Icon name="play" color="jade" />;
export const PauseIcon = () => <Icon name="pause" color="slate" />;
export const EditIcon = () => <Icon name="edit" size="sm" color="slate" />;
export const DeleteIcon = () => <Icon name="delete" size="sm" color="error" />;
export const AddIcon = () => <Icon name="plus" color="jade" />;
export const PDFIcon = () => <Icon name="pdf" color="jade" />;
export const CalendarIcon = () => <Icon name="calendar" color="navy" />;
export const ClockIcon = () => <Icon name="clock" color="slate" />;
export const TeamIcon = () => <Icon name="team" color="navy" />;
export const SettingsIcon = () => <Icon name="settings" color="slate" />;

// Coach-friendly accessibility components
export const CoachActionIcon = ({ name, color = "slate" }: { name: IconName; color?: IconProps['color'] }) => 
  <Icon name={name} size="lg" color={color} />;

export const HeaderIcon = ({ name, color = "navy" }: { name: IconName; color?: IconProps['color'] }) => 
  <Icon name={name} size="xl" color={color} />;

export const TouchTargetIcon = ({ name, color = "current" }: { name: IconName; color?: IconProps['color'] }) => 
  <Icon name={name} size="touch" color={color} />;

// Quick access for common coach actions
export const CoachEditIcon = () => <CoachActionIcon name="edit" color="slate" />;
export const CoachDeleteIcon = () => <CoachActionIcon name="delete" color="error" />;
export const CoachPDFIcon = () => <CoachActionIcon name="pdf" color="jade" />;
export const CoachCloseIcon = () => <TouchTargetIcon name="close" color="slate" />;

export default Icon;
