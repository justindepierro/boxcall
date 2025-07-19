// src/components/sidebar/renderSidebar.js
import {
  mainPages,
  settingsPages,
  TOGGLE_BUTTON_CLASSES,
  SIDEBAR_ICON_SIZE,
  MINIMIZE_SYMBOLS,
} from '@config/sidebarConfig.js';
import { navigateTo } from '@routes/router.js';
import { initSidebarToggle } from './sidebarToggleHandler.js';
import { createIconElement } from '@utils/iconRenderer.js';
import { signOut } from '@auth/auth.js';
import { showToast } from '@render/UIZones.js';
import { resetAppToPublic } from '@render/appReset.js';

/**
 * Renders the entire sidebar (main navigation, settings, logout).
 * @param {"expanded" | "collapsed" | "icon"} state - Current sidebar state.
 */
export function renderSidebar(state = 'expanded') {
  const container = document.getElementById('sidebar-root');
  if (!container) return console.warn('❌ #sidebar-root not found');

  // Clear existing content
  container.innerHTML = '';

  // === Outer Sidebar Container ===
  const sidebar = document.createElement('aside');
  sidebar.id = 'sidebar';
  sidebar.className = `
    flex flex-col h-full transition-all duration-300
    bg-[var(--color-sidebar)] text-[var(--color-sidebar-text)]
    border-r border-[var(--color-border)]
  `;

  // Add toggle header (pass state)
  container.appendChild(renderSidebarHeader(state));

  // === Main Navigation ===
  const navWrapper = document.createElement('div');
  navWrapper.className = 'flex-1 overflow-y-auto py-3 w-full max-w-full';
  navWrapper.appendChild(renderMainNav());
  sidebar.appendChild(navWrapper);

  // === Settings + Logout ===
  const navSettingsWrapper = document.createElement('div');
  navSettingsWrapper.className = 'border-t border-[var(--color-border)] px-4 py-3';
  const navSettings = renderSettingsNav();
  navSettings.appendChild(renderLogoutButton());
  navSettingsWrapper.appendChild(navSettings);
  sidebar.appendChild(navSettingsWrapper);

  // Add sidebar to container
  container.appendChild(sidebar);

  // Attach events
  attachSidebarEvents();
  initSidebarToggle();
}

/**
 * Creates the top header with toggle and brand.
 */
function renderSidebarHeader(state = 'expanded') {
  const wrapper = document.createElement('div');
  wrapper.id = 'sidebar-toggle-wrapper';
  wrapper.className = `
    flex items-center justify-between py-2 pl-4 pr-2 
    border-b border-[var(--color-border)] bg-[var(--color-sidebar)]
  `;

  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'sidebar-minimize';
  toggleBtn.title = 'Toggle Sidebar';
  toggleBtn.className = TOGGLE_BUTTON_CLASSES;

  // Use state to determine icon
  const iconName = MINIMIZE_SYMBOLS[state] || 'menu';
  toggleBtn.appendChild(createIconElement(iconName, SIDEBAR_ICON_SIZE));

  const brand = document.createElement('span');
  brand.id = 'sidebar-brand';
  brand.className = 'ml-1 font-bold whitespace-nowrap text-[var(--color-sidebar-text)]';
  brand.textContent = 'BoxCall';

  wrapper.append(toggleBtn, brand);
  return wrapper;
}

/**
 * Builds the main navigation buttons (Dashboard, Team, etc.).
 */
function renderMainNav() {
  const nav = document.createElement('nav');
  nav.id = 'sidebar-nav';
  nav.className = 'flex flex-col w-full max-w-full font-body';

  mainPages().forEach(({ id, label, icon }) => {
    nav.appendChild(createSidebarButton(id, label, icon));
  });

  return nav;
}

/**
 * Builds the settings navigation buttons.
 */
function renderSettingsNav() {
  const nav = document.createElement('nav');
  nav.className = 'flex flex-col space-y-2 font-body';

  settingsPages.forEach(({ id, label, icon }) => {
    nav.appendChild(createSidebarButton(id, label, icon));
  });

  return nav;
}

/**
 * Creates a single sidebar button with icon and label.
 */
function createSidebarButton(id, label, icon) {
  const btn = document.createElement('button');
  btn.dataset.page = id;
  btn.className = `
    nav-btn group flex items-center w-full rounded transition
    hover:bg-[var(--color-accent)] text-[var(--color-sidebar-text)]
    justify-start gap-2 px-4 py-2
  `;

  const iconEl = createIconElement(icon, SIDEBAR_ICON_SIZE);
  iconEl.classList.add('nav-icon');

  const labelEl = document.createElement('span');
  labelEl.className = 'label nav-label';
  labelEl.textContent = label;

  btn.append(iconEl, labelEl);
  return btn;
}

/**
 * Creates the logout button.
 */
function renderLogoutButton() {
  const btn = document.createElement('button');
  btn.className = `
    nav-btn group flex items-center w-full rounded transition
    hover:bg-[var(--color-accent)] text-[var(--color-sidebar-text)]
    justify-start gap-2 px-4 py-2
  `;
  btn.dataset.page = 'logout';

  const iconEl = createIconElement('log-out', SIDEBAR_ICON_SIZE);
  iconEl.classList.add('nav-icon');

  const labelEl = document.createElement('span');
  labelEl.className = 'label nav-label';
  labelEl.textContent = 'Logout';

  btn.append(iconEl, labelEl);

  btn.addEventListener('click', async () => {
    const { error } = await signOut();
    if (error) {
      showToast(`❌ Logout failed: ${error.message}`, 'error');
    } else {
      showToast('👋 Logged out successfully!', 'info');
      await resetAppToPublic(); // Call the helper
    }
  });

  return btn;
}

/**
 * Attaches click events to navigation buttons.
 */
function attachSidebarEvents() {
  const navButtons = document.querySelectorAll('.nav-btn');

  navButtons.forEach((btn) => {
    const button = /** @type {HTMLButtonElement} */ (btn);
    button.addEventListener('click', () => {
      const page = button.dataset.page;
      if (page && page !== 'logout') {
        navigateTo(page);
      }
    });
  });
}
