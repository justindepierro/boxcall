import { getCurrentUser } from '@state/userState.js';
import { DEV_EMAIL } from '@config/devConfig.js';

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

export const SIDEBAR_STATES = ['expanded', 'icon', 'collapsed'];

export const WIDTH_CLASSES = {
  expanded: 'w-64',
  icon: 'w-8',
  collapsed: 'w-6',
};

export const MARGIN_CLASSES = {
  expanded: 'ml-64',
  icon: 'ml-8',
  collapsed: 'ml-8',
};

export const MINIMIZE_SYMBOLS = {
  expanded: 'arrow-left-to-line',
  icon: 'arrow-left-to-line',
  collapsed: 'menu',
};

// src/config/uiConstants.js
export const SIDEBAR_PADDING_X = 'pl-4 pr-2'; // left + right padding
export const SIDEBAR_PADDING_Y = 'py-2'; // vertical padding
export const SIDEBAR_GAP = 'gap-2'; // spacing between icon + label
export const SIDEBAR_ICON_SIZE = 20; // consistent icon size

/**
 * Sidebar layout wrapper classes
 * - Includes padding, margin, and background color
 * - Uses CSS variables for theming
 * - Responsive design with flexbox
 * - Transition effects for smooth state changes
 * - Border for visual separation
 * - Font styling for consistency
 */
export const WRAPPER_CLASSES = `
  w-full
  flex items-center justify-start ${SIDEBAR_PADDING_X} ${SIDEBAR_PADDING_Y} ${SIDEBAR_GAP}
  mb-2 border-r border-[var(--color-border)]
  bg-[var(--color-sidebar)] text-[var(--color-sidebar-text)]
  transition-all duration-300
`;

/**
 * Sidebar toggle button classes
 * - Flexbox for centering icon
 * - Padding for clickable area
 *  - Rounded corners for aesthetics
 * - Hover effect for interactivity
 */
export const TOGGLE_BUTTON_CLASSES = `
  sidebar-toggle-btn flex items-center justify-center 
  w-8 h-8 p-0 rounded
  hover:bg-[var(--color-accent)]
  transition duration-200 text-[var(--color-icon)]
`;

/**
 * Sidebar layout configuration
 * - Padding, gap, and icon size for consistent layout
 * - Wrapper class for overall sidebar container
 * - Toggle button class for the minimize/expand button
 *  - Icon size for sidebar icons
 * - Responsive design with flexbox
 * - Transition effects for smooth state changes
 */

export const SIDEBAR_LAYOUT = {
  paddingX: 'pl-4 pr-2',
  paddingY: 'py-2',
  gap: 'gap-2',
  iconSize: 20,
  wrapper: `
    flex items-center justify-start pl-4 pr-2 py-2 gap-2
    mb-2 border-r border-[var(--color-border)]
    bg-[var(--color-sidebar)] text-[var(--color-sidebar-text)]
    transition-all duration-300
  `,
  toggleButton: `
    sidebar-toggle-btn flex items-center justify-center p-2 rounded
    hover:bg-[var(--color-accent)]
    transition duration-200 text-[var(--color-icon)]
  `,
};
