// src/config/sidebarConfig.js

export const mainPages = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'teamdashboard', label: 'Team Dashboard', icon: '🧢' },
  { id: 'boxcall', label: 'BoxCall', icon: '📦' },
  { id: 'playbook', label: 'PlayBook', icon: '📖' },
  { id: 'team', label: 'Team', icon: '👥' },
  { id: 'calendar', label: 'Calendar', icon: '🗓️' },
  { id: 'templates', label: 'Templates', icon: '🧩' },
];

export const settingsPages = [
  { id: 'settings', label: 'Settings', icon: '⚙️' },
  { id: 'account', label: 'Account', icon: '👤' },
  { id: 'about', label: 'About', icon: 'ℹ️' },
];

export const SIDEBAR_STATES = ['expanded', 'icon', 'collapsed'];
export const WIDTH_CLASSES = {
  icon: 'w-8',
  collapsed: 'w-6',
};
export const MARGIN_CLASSES = {
  expanded: 'ml-64',
  icon: 'ml-8',
  collapsed: 'ml-8',
};
export const MINIMIZE_SYMBOLS = {
  expanded: '⇤',
  icon: '⇤',
  collapsed: '☰',
};
