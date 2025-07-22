import {
  createElement,
  Home,
  Users,
  Package,
  BookOpen,
  UserCheck,
  CalendarDays,
  Puzzle,
  FlaskConical,
  Settings,
  User,
  Info,
  Menu,
  ArrowLeftToLine,
  Trash,
  ArrowDownToLine,
  Loader,
  MousePointerClick,
  Sparkles,
  Edit,
  X,
  LogOut,
  Shield,
  Crown,
  ClipboardList,
} from 'lucide';

import { devWarn } from './devLogger';

/**
 * A map of kebab-case icon names to Lucide icon components.
 */
const iconMap = {
  home: Home,
  users: Users,
  package: Package,
  'book-open': BookOpen,
  'user-check': UserCheck,
  'calendar-days': CalendarDays,
  puzzle: Puzzle,
  'flask-conical': FlaskConical,
  settings: Settings,
  user: User,
  info: Info,
  menu: Menu,
  'arrow-left-to-line': ArrowLeftToLine,
  trash: Trash,
  'arrow-down-to-line': ArrowDownToLine,
  loader: Loader,
  'mouse-pointer-click': MousePointerClick,
  sparkles: Sparkles,
  edit: Edit,
  x: X,
  'log-out': LogOut,
  shield: Shield,
  crown: Crown,
  'clipboard-list': ClipboardList,
};

// Cache to avoid re-creating icons unnecessarily
const iconCache = {};

/**
 * Returns a Lucide SVG icon inside a <span> wrapper.
 *
 * @param {string} name - kebab-case icon name, e.g., "calendar-days".
 * @param {string} className - Tailwind classes for styling the SVG.
 * @returns {HTMLElement}
 */
export function createIconElement(name, className = 'h-5 w-5 text-gray-700') {
  const iconKey = name.toLowerCase();
  const IconComponent = iconMap[iconKey] || Info;

  if (!iconMap[iconKey]) {
    devWarn(`❌ Unknown Lucide icon: "${name}", using fallback "Info".`);
  }

  // Use cached icon if available
  const cacheKey = `${iconKey}-${className}`;
  if (iconCache[cacheKey]) {
    return iconCache[cacheKey].cloneNode(true);
  }

  const wrapper = document.createElement('span');
  wrapper.className = 'inline-flex items-center justify-center';

  const svg = createElement(IconComponent, { class: className });
  wrapper.appendChild(svg);

  iconCache[cacheKey] = wrapper.cloneNode(true);
  return wrapper;
}
