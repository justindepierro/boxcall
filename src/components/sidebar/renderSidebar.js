// src/components/sidebar/renderSidebar.js
import {
  mainPages,
  settingsPages,
  MINIMIZE_SYMBOLS,
  SIDEBAR_ICON_SIZE,
} from '@config/sidebarConfig.js';
import { navigateTo } from '@routes/router.js';
import { createIconElement } from '@utils/iconRenderer.js';
import { BaseButton } from '@components/ui/baseButton.js';
import { signOut } from '@auth/auth.js';
import { showToast } from '@render/UIZones.js';
import { resetAppToPublic } from '@render/appReset.js';
import { devWarn } from '@utils/devLogger.js';

import { initSidebarToggle } from './sidebarToggleHandler.js';

export function renderSidebar(state = 'icon') {
  const root = document.getElementById('sidebar-root');
  if (!root) return devWarn('❌ #sidebar-root not found');

  // Reset content and classes
  root.innerHTML = '';
  root.classList.remove('expanded', 'icon', 'collapsed');
  root.classList.add(state);

  // --- Header ---
  root.appendChild(renderSidebarHeader(state));

  // --- Main Navigation ---
  const nav = document.createElement('nav');
  nav.className = 'flex flex-col py-3';
  mainPages().forEach(({ id, label, icon }) => {
    nav.appendChild(createSidebarButton(id, label, icon, state));
  });
  root.appendChild(nav);

  // --- Settings Navigation ---
  const settingsNav = document.createElement('nav');
  settingsNav.className = 'flex flex-col py-3 border-t border-[var(--color-border)]';
  settingsPages.forEach(({ id, label, icon }) => {
    settingsNav.appendChild(createSidebarButton(id, label, icon, state));
  });
  root.appendChild(settingsNav);

  // --- Logout Button ---
  const bottom = document.createElement('div');
  bottom.id = 'sidebar-bottom';
  bottom.className = 'mt-auto px-4 py-3';
  bottom.appendChild(renderLogoutButton(state));
  root.appendChild(bottom);

  // Initialize toggle button listener
  initSidebarToggle();
}

/**
 * Creates a sidebar button with label + icon.
 */
function createSidebarButton(id, label, icon, state) {
  const btn = BaseButton({
    icon,
    variant: 'sidebar',
    size: 'sidebar',
    fullWidth: true,
    iconOnly: state === 'icon',
    dataAttrs: { page: id },
    onClick: () => navigateTo(id),
  });

  const labelSpan = document.createElement('span');
  labelSpan.className = 'nav-label';
  labelSpan.textContent = label;

  btn.appendChild(labelSpan);
  btn.classList.add('nav-btn'); // No extra justify-start needed (BaseButton handles it)

  return btn;
}

/**
 * Renders sidebar header with toggle button and brand.
 */
function renderSidebarHeader(state) {
  const wrapper = document.createElement('div');
  wrapper.className =
    'flex items-center justify-between py-2 px-4 border-b border-[var(--color-border)]';

  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'sidebar-minimize';
  toggleBtn.className = 'hover:bg-[var(--color-accent)] rounded p-1';
  toggleBtn.style.color = 'var(--color-sidebar-icon)'; // enforce icon color
  toggleBtn.appendChild(createIconElement(MINIMIZE_SYMBOLS[state], SIDEBAR_ICON_SIZE));

  const brand = document.createElement('span');
  brand.id = 'sidebar-brand';
  brand.className = 'font-bold text-[var(--color-sidebar-text)] whitespace-nowrap';
  brand.textContent = 'BoxCall';

  wrapper.append(toggleBtn, brand);
  return wrapper;
}

/**
 * Renders logout button.
 */
function renderLogoutButton(state) {
  const btn = BaseButton({
    icon: 'log-out',
    variant: 'sidebar',
    size: 'sidebar',
    fullWidth: true,
    iconOnly: state === 'icon',
    dataAttrs: { page: 'logout' },
    onClick: async () => {
      const { error } = await signOut();
      if (error) {
        showToast(`❌ Logout failed: ${error.message}`, 'error');
      } else {
        showToast('👋 Logged out successfully!', 'info');
        await resetAppToPublic('login');
      }
    },
  });

  const labelSpan = document.createElement('span');
  labelSpan.className = 'nav-label';
  labelSpan.textContent = 'Logout';

  btn.appendChild(labelSpan);
  btn.classList.add('nav-btn', 'logout-btn'); // Add logout-btn class for extra CSS targeting

  return btn;
}
