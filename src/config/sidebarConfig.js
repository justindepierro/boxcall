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
  expanded: 'w-64',
  icon: 'w-16',
  collapsed: 'w-12',
};
export const MARGIN_CLASSES = {
  expanded: 'ml-64',
  icon: 'ml-16',
  collapsed: 'ml-12',
};
export const MINIMIZE_SYMBOLS = {
  expanded: '⇤',
  icon: '⇥',
  collapsed: '☰',
};
