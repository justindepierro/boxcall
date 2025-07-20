import { createElement } from 'lucide';

// 🧠 Import each icon you want to use from Lucide
import {
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

// 🗺️ Map kebab-case names to Lucide icon components
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

/**
 * Returns a Lucide SVG icon inside a <span> wrapper.
 * @param {string} name - kebab-case name like "calendar-days"
 * @param {string} className - Tailwind classes for styling the SVG (e.g., "h-5 w-5 text-gray-600")
 * @returns {HTMLElement}
 */
export function createIconElement(name, className = 'h-5 w-5 text-gray-700') {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    console.warn(`❌ Unknown Lucide icon: "${name}"`);
    const fallback = document.createElement('span');
    fallback.textContent = '?';
    fallback.className = `inline-block ${className} bg-red-500 text-white text-xs text-center`;
    return fallback;
  }

  const wrapper = document.createElement('span');
  wrapper.className = 'inline-flex items-center justify-center';

  const svg = createElement(IconComponent, {
    class: className,
  });

  wrapper.appendChild(svg);
  return wrapper;
}
