// /config/sidebarConfig.js
// 🧭 This file defines the sidebar's page sections, labels, and icons.
// It is imported by the renderer to avoid hardcoding structure into render logic.

// Each entry contains:
// - `id`: the route/page name
// - `label`: visible label for full sidebar
// - `icon`: emoji or icon string (can later be swapped to Lucide/Heroicons/etc.)
// - `roles`: (optional) restrict who sees this tab (e.g., 'HeadCoach', 'Player', etc.)

// 📦 Main app navigation section
export const mainPages = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'teamdashboard', label: 'Team Dashboard', icon: '🧢' },
  { id: 'boxcall', label: 'BoxCall', icon: '📦' },
  { id: 'playbook', label: 'PlayBook', icon: '📖' },
  { id: 'team', label: 'Team', icon: '👥' },
  { id: 'calendar', label: 'Calendar', icon: '🗓️' },
  { id: 'templates', label: 'Templates', icon: '🧩' },
];

// ⚙️ Settings section (in collapsible dropdown)
export const settingsPages = [
  { id: 'settings', label: 'Settings', icon: '⚙️' },
  { id: 'account', label: 'Account', icon: '👤' },
  { id: 'about', label: 'About', icon: 'ℹ️' },
];

// 🧠 Export grouped config (optional convenience)
export const sidebarGroups = {
  main: mainPages,
  settings: settingsPages,
};
