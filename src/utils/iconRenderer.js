// src/utils/iconRenderer.js

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
};

/**
 * Returns an SVG icon inside a span container.
 * @param {string} name - kebab-case name like "calendar-days"
 * @param {number} size - size in px
 * @returns {HTMLElement}
 */
export function createIconElement(name, size = 20) {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    console.warn(`❌ Unknown Lucide icon: "${name}"`);
    const fallback = document.createElement('span');
    fallback.textContent = '?';
    fallback.className = `inline-block w-[${size}px] h-[${size}px] bg-red-500 text-white text-xs text-center`;
    return fallback;
  }

  const wrapper = document.createElement('span');
  wrapper.className = `flex items-center justify-center min-w-[24px] h-[24px]`;

  const svg = createElement(IconComponent, {
    size,
    color: 'currentColor',
  });

  wrapper.appendChild(svg);
  return wrapper;
}
