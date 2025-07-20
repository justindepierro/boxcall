// src/components/sidebar/renderSidebar.js
import { mainPages, settingsPages, TOGGLE_BUTTON_CLASSES } from '@config/sidebarConfig.js';
import { navigateTo } from '@routes/router.js';
import { initSidebarToggle } from '@components/sidebar/sidebarToggleHandler.js';
import { createIconElement } from '@utils/iconRenderer.js';

import { devWarn } from './devLogger';

export function renderSidebar() {
  const container = document.getElementById('sidebar-root');
  if (!container) return devWarn('❌ #sidebar-root not found');

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
  toggleBtn.appendChild(createIconElement('arrow-left-to-line', 'h-5 w-5'));

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

    const iconEl = createIconElement(icon, 'h-5 w-5');
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

    const iconEl = createIconElement(icon, 'h-5 w-5');
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
  /** @type {NodeListOf<HTMLButtonElement>} */
  const navButtons = document.querySelectorAll('.nav-btn');

  navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;
      if (page) navigateTo(page);
    });
  });
}

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

export function adjustSidebarButtons(state) {
  const buttons = document.querySelectorAll('.nav-btn');

  buttons.forEach((btn) => {
    btn.classList.remove('justify-center', 'justify-start', 'px-2', 'px-4');
    btn.classList.add('items-center', 'transition', 'rounded', 'hover:bg-[var(--color-accent)]');

    if (state === 'expanded') {
      btn.classList.add('justify-start', 'gap-2', 'px-4');
    } else {
      btn.classList.add('justify-center', 'px-2');
    }
  });
}

export function updateSidebarVisibility({ labels, icons, title }, newState) {
  const isExpanded = newState === 'expanded';
  const isCollapsed = newState === 'collapsed';

  toggleElementsVisibility(labels, isExpanded);
  toggleElementsVisibility(icons, !isCollapsed);

  if (title) title.classList.toggle('hidden', !isExpanded);

  const brand = document.getElementById('sidebar-brand');
  if (brand) brand.style.display = isExpanded ? 'inline' : 'none';
}

function toggleElementsVisibility(elements, visible) {
  elements.forEach((el) => {
    el.classList.toggle('hidden', !visible);
  });
}
