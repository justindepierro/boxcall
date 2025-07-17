// src/config/sidebarConfig.js

import { getCurrentUser } from '@state/userState.js';
import { DEV_EMAIL } from '@config/devConfig.js';

// 🔢 App states
export const SIDEBAR_STATES = ['expanded', 'icon', 'collapsed'];

/**
 * 🔁 Page structure
 */
export function mainPages() {
  const user = getCurrentUser();

  const pages = [
    { id: 'dashboard', label: 'Dashboard', icon: 'home' },
    { id: 'teamdashboard', label: 'Team Dashboard', icon: 'users' },
    { id: 'boxcall', label: 'BoxCall', icon: 'package' },
    { id: 'playbook', label: 'PlayBook', icon: 'book-open' },
    { id: 'team', label: 'Team', icon: 'user-check' },
    { id: 'calendar', label: 'Calendar', icon: 'calendar-days' },
    { id: 'templates', label: 'Templates', icon: 'puzzle' },
  ];

  if (user?.email === DEV_EMAIL) {
    pages.push({ id: 'playground', label: 'Playground', icon: 'flask-conical' }); // 👨‍🔬 Dev only
  }

  return pages;
}

export const settingsPages = [
  { id: 'settings', label: 'Settings', icon: 'settings' },
  { id: 'account', label: 'Account', icon: 'user' },
  { id: 'about', label: 'About', icon: 'info' },
];

/**
 * 📏 Sidebar width and margin classes for each state
 * Expanded uses dynamic variable for future flexibility
 */
export const WIDTH_CLASSES = {
  expanded: 'w-64',
  icon: 'w-[56px]', // 💡 formerly w-64
  collapsed: 'w-[56px]', // 💡 formerly w-64
};

export const MARGIN_CLASSES = {
  expanded: 'ml-64',
  icon: 'ml-64',
  collapsed: 'ml-[56]',
};

/**
 * 🧭 Icon changes for toggle button
 */
export const MINIMIZE_SYMBOLS = {
  expanded: 'arrow-left-to-line',
  icon: 'arrow-left-to-line',
  collapsed: 'menu',
};

/**
 * 🎨 Sidebar layout constants
 */
export const SIDEBAR_ICON_SIZE = 20; // applies across views

export const SIDEBAR_PADDING_X = 'pl-4 pr-2'; // icon & label spacing
export const SIDEBAR_PADDING_Y = 'py-2';
export const SIDEBAR_GAP = 'gap-2';

/**
 * 📦 Wrapper (toggle + sidebar column)
 */
export const WRAPPER_CLASSES = `
  flex h-full transition-all duration-300
`;

/**
 * ⏹️ Toggle button styling
 */
export const TOGGLE_BUTTON_CLASSES = `
  sidebar-toggle-btn flex items-center justify-center
  w-8 h-8 p-0 rounded
  hover:bg-[var(--color-accent)]
  transition duration-200 text-[var(--color-sidebar-icon)]
`;

/**
 * 🧩 Default layout map for use in rendering
 */
export const SIDEBAR_LAYOUT = {
  iconSize: SIDEBAR_ICON_SIZE,
  paddingX: SIDEBAR_PADDING_X,
  paddingY: SIDEBAR_PADDING_Y,
  gap: SIDEBAR_GAP,
  wrapper: WRAPPER_CLASSES,
  toggleButton: TOGGLE_BUTTON_CLASSES,
};
