// src/components/sidebar/renderSidebar.js

import { mainPages, settingsPages, TOGGLE_BUTTON_CLASSES } from '@config/sidebarConfig.js';
import { navigateTo } from '@routes/router.js';
import { initSidebarToggle } from '@components/sidebar/sidebarToggleHandler.js';
import { createIconElement } from '@utils/iconRenderer.js';

export function renderSidebar() {
  const container = document.getElementById('sidebar-root');
  if (!container) return console.warn('❌ #sidebar-root not found');

  container.innerHTML = '';

  // 🔘 Toggle Header
  const toggleWrapper = document.createElement('div');
  toggleWrapper.id = 'sidebar-toggle-wrapper';
  toggleWrapper.className = `
    flex items-center justify-start gap-2 h-[56px] w-full px-4
    bg-[var(--color-sidebar)] border-r border-[var(--color-border)]
  `;

  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'sidebar-minimize';
  toggleBtn.title = 'Toggle Sidebar';
  toggleBtn.className = TOGGLE_BUTTON_CLASSES;
  toggleBtn.appendChild(createIconElement('arrow-left-to-line'));

  const brand = document.createElement('span');
  brand.id = 'sidebar-brand';
  brand.className = 'font-bold text-[var(--color-sidebar-text)]';
  brand.textContent = 'BoxCall';

  toggleWrapper.append(toggleBtn, brand);

  // 📐 Sidebar Container
  const sidebar = document.createElement('aside');
  sidebar.id = 'sidebar';
  sidebar.className = `
    flex flex-col h-full transition-all duration-300
    bg-[var(--color-sidebar)] text-[var(--color-sidebar-text)]
    border-r border-[var(--color-border)]
  `;

  // 🧭 Main Nav
  const mainNavWrapper = document.createElement('div');
  mainNavWrapper.className = 'flex-1 overflow-y-auto py-3 px-2';

  const mainNav = document.createElement('nav');
  mainNav.id = 'sidebar-nav';
  mainNav.className = 'flex flex-col gap-2 font-body';

  mainPages().forEach(({ id, label, icon }) => {
    const btn = document.createElement('button');
    btn.dataset.page = id;
    btn.className = `
      nav-btn group flex items-center w-full rounded transition
      hover:bg-[var(--color-accent)] text-[var(--color-sidebar-text)]
      justify-start gap-2 px-4 py-2
    `;

    const iconEl = createIconElement(icon, 20);
    iconEl.classList.add('nav-icon');

    const labelEl = document.createElement('span');
    labelEl.className = 'label nav-label';
    labelEl.textContent = label;

    btn.append(iconEl, labelEl);
    mainNav.appendChild(btn);
  });

  mainNavWrapper.appendChild(mainNav);

  // ⚙️ Settings Nav
  const settingsNavWrapper = document.createElement('div');
  settingsNavWrapper.className = 'border-t border-[var(--color-border)] py-3 px-2';

  const settingsNav = document.createElement('nav');
  settingsNav.id = 'sidebar-settings';
  settingsNav.className = 'flex flex-col gap-2 font-body';

  settingsPages.forEach(({ id, label, icon }) => {
    const btn = document.createElement('button');
    btn.dataset.page = id;
    btn.className = `
      nav-btn group flex items-center w-full rounded transition
      hover:bg-[var(--color-accent)] text-[var(--color-sidebar-text)]
      justify-start gap-2 px-4 py-2
    `;

    const iconEl = createIconElement(icon, 20);
    iconEl.classList.add('nav-icon');

    const labelEl = document.createElement('span');
    labelEl.className = 'label nav-label';
    labelEl.textContent = label;

    btn.append(iconEl, labelEl);
    settingsNav.appendChild(btn);
  });

  settingsNavWrapper.appendChild(settingsNav);

  // ✅ Final Assembly
  container.appendChild(toggleWrapper);
  container.appendChild(sidebar);
  sidebar.appendChild(mainNavWrapper);
  sidebar.appendChild(settingsNavWrapper);

  attachSidebarEvents();
  initSidebarToggle();
}

function attachSidebarEvents() {
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;
      if (page) navigateTo(page);
    });
  });
}

/**
 * Returns key parts of the sidebar DOM
 * @returns {Object} parts
 */
export function querySidebarElements() {
  const outer = document.getElementById('sidebar-root');
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('page-view');
  const labels = document.querySelectorAll('.nav-label');
  const icons = document.querySelectorAll('.nav-icon');
  const title = document.getElementById('sidebar-brand');
  const minimizeBtn = document.getElementById('sidebar-minimize');

  return { outer, sidebar, mainContent, labels, icons, title, minimizeBtn };
}

/**
 * Adjusts sidebar button alignment and spacing based on sidebar state.
 * @param {'expanded' | 'icon' | 'collapsed'} state
 */
export function adjustSidebarButtons(state) {
  const buttons = document.querySelectorAll('.nav-btn');

  buttons.forEach((btn) => {
    // Reset alignment and padding
    btn.classList.remove('justify-center', 'justify-start', 'px-2', 'px-4');

    // ✨ Common classes
    btn.classList.add('items-center', 'transition', 'rounded', 'hover:bg-[var(--color-accent)]');

    if (state === 'expanded') {
      btn.classList.add('justify-start', 'gap-2', 'px-4');
    } else if (state === 'icon') {
      btn.classList.add('justify-center', 'px-2');
    } else if (state === 'collapsed') {
      btn.classList.add('justify-center', 'px-2');
    }
  });
}

/**
 * Shows/hides sidebar elements like labels, icons, and title based on state.
 * @param {Object} elements - { labels, icons, title }
 * @param {'expanded' | 'icon' | 'collapsed'} newState
 */
export function updateSidebarVisibility({ labels, icons, title }, newState) {
  const isExpanded = newState === 'expanded';
  const isCollapsed = newState === 'collapsed';

  // 🏷️ Show/hide labels
  toggleElementsVisibility(labels, isExpanded);

  // 🔘 Show icons in expanded + icon mode
  toggleElementsVisibility(icons, !isCollapsed);

  // 📛 Show title only in expanded
  if (title) title.classList.toggle('hidden', !isExpanded);

  // 📛 Brand label visibility
  const brand = document.getElementById('sidebar-brand');
  if (brand) brand.style.display = isExpanded ? 'inline' : 'none';
}

/**
 * Helper for toggling visibility of multiple DOM elements.
 */
function toggleElementsVisibility(elements, visible) {
  elements.forEach((el) => {
    el.classList.toggle('hidden', !visible);
  });
}
