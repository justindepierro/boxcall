import { getCurrentUser } from '@state/userState.js';
import { DEV_EMAIL } from '@config/devConfig.js';

export const SIDEBAR_STATES = ['expanded', 'icon', 'collapsed'];

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
    pages.push({ id: 'playground', label: 'Playground', icon: 'flask-conical' });
  }
  return pages;
}

export const settingsPages = [
  { id: 'settings', label: 'Settings', icon: 'settings' },
  { id: 'account', label: 'Account', icon: 'user' },
  { id: 'about', label: 'About', icon: 'info' },
];

export const MINIMIZE_SYMBOLS = {
  expanded: 'arrow-left-to-line',
  icon: 'arrow-left-to-line',
  collapsed: 'menu',
};

export const SIDEBAR_ICON_SIZE = '20';

export const TOGGLE_BUTTON_CLASSES = `
  sidebar-toggle-btn flex items-center justify-center
  w-8 h-8 p-0 rounded
  hover:bg-[var(--color-accent)]
  transition duration-200 text-[var(--color-sidebar-icon)]
`;
