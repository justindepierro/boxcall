/**
 * Modern Sidebar System - Consolidated Logic
 * Handles state management, rendering, and event handling in one place
 */

import { devLog, devError, devWarn } from '@utils/devLogger.js';
import { getCurrentUser } from '@state/userState.js';
import { navigateTo } from '@routes/router.js';
import { createIconElement } from '@utils/iconRenderer.js';
import { signOut } from '@auth/auth.js';
import { showToast } from '@utils/toast.js';
import { resetAppToPublic } from '@render/appReset.js';
import { DEV_EMAIL } from '@config/devConfig.js';

/**
 * @typedef {'expanded' | 'icon' | 'collapsed'} SidebarState
 */

/** @type {SidebarState[]} */
const SIDEBAR_STATES = ['expanded', 'icon', 'collapsed'];
const DEFAULT_STATE = 'icon';
const STORAGE_KEY = 'sidebarState';

/** @type {SidebarState} */
let currentState = DEFAULT_STATE;

/** @type {AbortController|null} */
let eventController = null;

/** @type {ResizeObserver|null} */
let resizeObserver = null;

/**
 * Responsive breakpoints
 */
const BREAKPOINTS = {
  mobile: 768, // Below this = force collapsed
  tablet: 1024, // Below this = prefer icon mode
  desktop: 1200, // Above this = allow expanded
};

/**
 * Sidebar configuration with theme integration
 */
const CONFIG = {
  TOGGLE_ICONS: {
    expanded: 'arrow-left-to-line',
    icon: 'arrow-left-to-line',
    collapsed: 'menu',
  },
  ICON_SIZE: '20',

  // Theme classes using CSS custom properties
  CLASSES: {
    sidebar: `
      flex flex-col h-full
      bg-[var(--color-sidebar-bg)]
      border-r border-[var(--color-sidebar-border)]
      text-[var(--color-sidebar-text)]
      transition-all duration-300 ease-in-out
    `,
    header: `
      sidebar-header flex items-center justify-between px-4 py-3
      border-b border-[var(--color-sidebar-border)]
      bg-[var(--color-sidebar-header-bg)]
      h-16
    `,
    title: `
      sidebar-title font-bold text-lg
      text-[var(--color-sidebar-title)]
      transition-opacity duration-200
    `,
    toggleBtn: `
      sidebar-toggle flex items-center justify-center
      w-8 h-8 p-0 rounded-md
      hover:bg-[var(--color-sidebar-hover)]
      active:bg-[var(--color-sidebar-active)]
      transition-all duration-200
      text-[var(--color-sidebar-icon)]
      border border-transparent
      hover:border-[var(--color-sidebar-border)]
    `,
    navItem: `
      sidebar-nav-item w-full flex items-center gap-3 p-3 mx-2 rounded-lg
      hover:bg-[var(--color-sidebar-hover)]
      active:bg-[var(--color-sidebar-active)]
      transition-all duration-200
      text-[var(--color-sidebar-text)]
      border border-transparent
      hover:border-[var(--color-sidebar-item-border)]
      focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]
    `,
    navIcon: `
      flex-shrink-0 transition-transform duration-200
      text-[var(--color-sidebar-icon)]
    `,
    navLabel: `
      sidebar-label transition-all duration-200
      text-[var(--color-sidebar-text)]
      font-medium
    `,
    section: `
      flex flex-col py-2
    `,
    sectionDivider: `
      border-t border-[var(--color-sidebar-divider)]
    `,
    footer: `
      sidebar-footer mt-auto p-4
      border-t border-[var(--color-sidebar-border)]
      bg-[var(--color-sidebar-footer-bg)]
    `,
  },

  mainPages() {
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
  },

  settingsPages: [
    { id: 'settings', label: 'Settings', icon: 'settings' },
    { id: 'profile', label: 'Profile', icon: 'user' },
  ],
};

/**
 * Initialize the sidebar system
 */
export function initSidebar() {
  try {
    devLog('🧱 Initializing modern sidebar...');

    // Load saved state
    loadState();

    // Check responsive state
    checkResponsiveState();

    // Render sidebar
    render();

    // Apply state classes
    applyState();

    // Setup event listeners
    attachEventListeners();

    // Setup responsive observer
    setupResponsiveObserver();

    devLog(`✅ Sidebar initialized in "${currentState}" state`);
  } catch (error) {
    devError(`❌ Sidebar initialization failed: ${error.message}`);
  }
}

/**
 * Clean up sidebar event listeners
 */
export function destroySidebar() {
  if (eventController) {
    eventController.abort();
    eventController = null;
  }

  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }

  devLog('🧹 Sidebar event listeners cleaned up');
}

/**
 * Get current sidebar state
 */
export function getSidebarState() {
  return currentState;
}

/**
 * Set sidebar state programmatically
 */
export function setSidebarState(newState) {
  if (!SIDEBAR_STATES.includes(newState)) {
    devWarn(`❌ Invalid sidebar state: "${newState}"`);
    return false;
  }

  currentState = newState;
  saveState();

  // Full re-render for collapsed mode since structure changes
  if (newState === 'collapsed' || document.querySelector('#sidebar-root').children.length === 1) {
    render();
    attachEventListeners();
  } else {
    updateDynamicContent();
  }

  applyState();

  devLog(`🎯 Sidebar state set to: ${newState}`);
  return true;
}

/**
 * Toggle through sidebar states
 */
export function toggleSidebar() {
  const currentIndex = SIDEBAR_STATES.indexOf(currentState);
  const nextIndex = (currentIndex + 1) % SIDEBAR_STATES.length;
  const nextState = SIDEBAR_STATES[nextIndex];

  setSidebarState(nextState);
  devLog(`🔄 Sidebar toggled to: ${nextState}`);
}

/**
 * Check and apply responsive state based on window size
 */
function checkResponsiveState() {
  const width = window.innerWidth;

  if (width < BREAKPOINTS.mobile) {
    // Force collapsed on mobile
    if (currentState !== 'collapsed') {
      devLog('📱 Mobile detected - forcing collapsed state');
      currentState = 'collapsed';
    }
  } else if (width < BREAKPOINTS.tablet) {
    // Prefer icon mode on tablet
    if (currentState === 'expanded') {
      devLog('📱 Tablet detected - switching to icon mode');
      currentState = 'icon';
    }
  }
  // Desktop allows any state
}

/**
 * Setup responsive observer
 */
function setupResponsiveObserver() {
  // Use ResizeObserver for better performance than window resize events
  resizeObserver = new ResizeObserver(() => {
    checkResponsiveState();
    applyState();
    updateDynamicContent();
  });

  // Observe the body element
  resizeObserver.observe(document.body);
}

/**
 * Load state from localStorage
 */
function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && SIDEBAR_STATES.includes(/** @type {SidebarState} */ (saved))) {
    currentState = /** @type {SidebarState} */ (saved);
  }
}

/**
 * Save state to localStorage
 */
function saveState() {
  localStorage.setItem(STORAGE_KEY, currentState);
}

/**
 * Apply state classes to DOM elements
 */
function applyState() {
  const root = document.getElementById('sidebar-root');
  const shell = document.getElementById('shell');

  if (!root || !shell) {
    devError('❌ Required DOM elements not found for sidebar state');
    return;
  }

  // Remove all state classes
  SIDEBAR_STATES.forEach((state) => {
    root.classList.remove(state);
    shell.classList.remove(`sidebar-${state}`);
  });

  // Add current state classes
  root.classList.add(currentState);
  shell.classList.add(`sidebar-${currentState}`);

  // Width is now handled entirely by CSS custom properties in sidebar-theme.css
  // No need for Tailwind width classes as they conflict with our responsive design
}

/**
 * Update dynamic content based on current state
 */
function updateDynamicContent() {
  updateTitle();
  updateToggleButton();
  updateNavigationLabels();
  updateLogoutButton();
}

/**
 * Update title visibility
 */
function updateTitle() {
  const title = /** @type {HTMLElement} */ (document.querySelector('.sidebar-title'));
  if (title) {
    title.textContent = currentState === 'expanded' ? 'BoxCall' : '';
    title.style.opacity = currentState === 'expanded' ? '1' : '0';
  }
}

/**
 * Update toggle button icon
 */
function updateToggleButton() {
  const toggleBtn = document.getElementById('sidebar-toggle');
  if (!toggleBtn) return;

  const icon = currentState === 'collapsed' ? 'menu' : 'arrow-left-to-line';
  const iconElement = toggleBtn.querySelector('svg');
  if (iconElement) {
    iconElement.replaceWith(createIconElement(icon, CONFIG.ICON_SIZE));
  }
}

/**
 * Update navigation labels
 */
function updateNavigationLabels() {
  const navLabels = document.querySelectorAll('.sidebar-label');
  navLabels.forEach((label) => {
    const labelEl = /** @type {HTMLElement} */ (label);
    if (currentState === 'expanded') {
      labelEl.style.opacity = '1';
      labelEl.style.width = 'auto';
      labelEl.style.overflow = 'visible';
    } else {
      labelEl.style.opacity = '0';
      labelEl.style.width = '0';
      labelEl.style.overflow = 'hidden';
    }
  });
}

/**
 * Update logout button label
 */
function updateLogoutButton() {
  const logoutBtn = document.getElementById('sidebar-logout');
  if (!logoutBtn) return;

  const existingLabel = logoutBtn.querySelector('.sidebar-label');
  if (currentState === 'expanded' && !existingLabel) {
    const label = document.createElement('span');
    label.className = 'sidebar-label';
    label.textContent = 'Logout';
    logoutBtn.appendChild(label);
  } else if (currentState !== 'expanded' && existingLabel) {
    existingLabel.remove();
  }
}

/**
 * Render the complete sidebar
 */
function render() {
  const root = document.getElementById('sidebar-root');
  if (!root) {
    devError('❌ #sidebar-root not found');
    return;
  }

  // Clear existing content
  root.innerHTML = '';

  // Always show header with toggle button
  root.appendChild(createHeader());

  // Only show navigation and footer if not in collapsed mode
  if (currentState !== 'collapsed') {
    root.appendChild(createMainNav());
    root.appendChild(createSettingsNav());
    root.appendChild(createFooter());
  }
}

/**
 * Create sidebar header with toggle button
 */
function createHeader() {
  const header = document.createElement('div');

  // Adjust header layout based on state
  if (currentState === 'collapsed') {
    header.className = `${CONFIG.CLASSES.header} flex-col items-center justify-center`;
  } else {
    header.className = CONFIG.CLASSES.header;
  }

  // Logo/Title (only show if not collapsed)
  if (currentState !== 'collapsed') {
    const title = document.createElement('div');
    title.className = CONFIG.CLASSES.title;
    title.textContent = currentState === 'expanded' ? 'BoxCall' : '';
    header.appendChild(title);
  }

  // Toggle button (always visible)
  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'sidebar-toggle';
  toggleBtn.className = CONFIG.CLASSES.toggleBtn;
  toggleBtn.setAttribute('aria-label', 'Toggle sidebar');

  const icon = currentState === 'collapsed' ? 'menu' : 'arrow-left-to-line';
  toggleBtn.appendChild(createIconElement(icon, CONFIG.ICON_SIZE));

  header.appendChild(toggleBtn);

  return header;
}

/**
 * Create main navigation
 */
function createMainNav() {
  const nav = document.createElement('nav');
  nav.className = CONFIG.CLASSES.section;
  nav.setAttribute('aria-label', 'Main navigation');

  CONFIG.mainPages().forEach((page) => {
    nav.appendChild(createNavItem(page));
  });

  return nav;
}

/**
 * Create settings navigation
 */
function createSettingsNav() {
  const nav = document.createElement('nav');
  nav.className = `${CONFIG.CLASSES.section} ${CONFIG.CLASSES.sectionDivider}`;
  nav.setAttribute('aria-label', 'Settings navigation');

  CONFIG.settingsPages.forEach((page) => {
    nav.appendChild(createNavItem(page));
  });

  return nav;
}

/**
 * Create sidebar footer with logout
 */
function createFooter() {
  const footer = document.createElement('div');
  footer.className = CONFIG.CLASSES.footer;

  const logoutBtn = document.createElement('button');
  logoutBtn.id = 'sidebar-logout';
  logoutBtn.className = CONFIG.CLASSES.navItem;
  logoutBtn.setAttribute('aria-label', 'Logout');

  // Icon with theme classes
  const iconWrapper = document.createElement('div');
  iconWrapper.className = CONFIG.CLASSES.navIcon;
  iconWrapper.appendChild(createIconElement('log-out', CONFIG.ICON_SIZE));
  logoutBtn.appendChild(iconWrapper);

  // Label (only show in expanded mode)
  if (currentState === 'expanded') {
    const label = document.createElement('span');
    label.className = CONFIG.CLASSES.navLabel;
    label.textContent = 'Logout';
    logoutBtn.appendChild(label);
  }

  footer.appendChild(logoutBtn);
  return footer;
}

/**
 * Create a navigation item
 */
function createNavItem({ id, label, icon }) {
  const item = document.createElement('button');
  item.className = CONFIG.CLASSES.navItem;
  item.dataset.page = id;
  item.setAttribute('aria-label', label);

  // Icon with theme classes
  const iconWrapper = document.createElement('div');
  iconWrapper.className = CONFIG.CLASSES.navIcon;
  iconWrapper.appendChild(createIconElement(icon, CONFIG.ICON_SIZE));
  item.appendChild(iconWrapper);

  // Label (only show in expanded mode)
  if (currentState === 'expanded') {
    const labelEl = document.createElement('span');
    labelEl.className = CONFIG.CLASSES.navLabel;
    labelEl.textContent = label;
    item.appendChild(labelEl);
  }

  return item;
}

/**
 * Attach all event listeners using AbortController for cleanup
 */
function attachEventListeners() {
  // Clean up existing listeners
  if (eventController) {
    eventController.abort();
  }

  eventController = new AbortController();
  const { signal } = eventController;

  // Toggle button
  const toggleBtn = document.getElementById('sidebar-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleSidebar, { signal });
  }

  // Navigation items
  document.querySelectorAll('.sidebar-nav-item[data-page]').forEach((item) => {
    item.addEventListener(
      'click',
      (e) => {
        const target = /** @type {HTMLElement} */ (e.currentTarget);
        const pageId = target.dataset.page;
        if (pageId) {
          navigateTo(pageId);
        }
      },
      { signal }
    );
  });

  // Logout button
  const logoutBtn = document.getElementById('sidebar-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout, { signal });
  }
}

/**
 * Handle logout with confirmation
 */
async function handleLogout() {
  try {
    devLog('🚪 Logging out...');
    await signOut();
    showToast('👋 Logged out successfully', 'success');
    resetAppToPublic();
  } catch (error) {
    devError(`❌ Logout failed: ${error.message}`);
    showToast('❌ Logout failed', 'error');
  }
}

/**
 * Force refresh sidebar (useful after user changes)
 */
export function refreshSidebar() {
  devLog('🔄 Refreshing sidebar...');
  destroySidebar();
  render();
  applyState();
  attachEventListeners();
}
