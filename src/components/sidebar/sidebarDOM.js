// src/components/sidebar/renderSidebar.js

import { mainPages, settingsPages, TOGGLE_BUTTON_CLASSES } from '@config/sidebarConfig.js';
import { navigateTo } from '@routes/router.js';
import { createIconElement } from '@utils/iconRenderer.js';

import { initSidebarToggle } from './sidebarToggleHandler.js';

export function renderSidebar() {
  const container = document.getElementById('sidebar-root');
  if (!container) return console.warn('❌ #sidebar-root not found');

  // Reset inner HTML
  container.innerHTML = '';

  // 🏗️ Create outer wrapper
  const sidebar = document.createElement('aside');
  sidebar.id = 'sidebar';
  sidebar.className = `
    flex flex-col h-full transition-all duration-300
    bg-[var(--color-sidebar)] text-[var(--color-sidebar-text)]
    border-r border-[var(--color-border)]
  `;

  // 🔘 Toggle + Brand
  const toggleWrapper = document.createElement('div');
  toggleWrapper.id = 'sidebar-toggle-wrapper';
  toggleWrapper.className = `
  flex items-center justify-between py-2 pl-4 pr-2 
  border-b border-[var(--color-border)] bg-[var(--color-sidebar)]
`;
  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'sidebar-minimize';
  toggleBtn.title = 'Toggle Sidebar';
  toggleBtn.className = TOGGLE_BUTTON_CLASSES;
  toggleBtn.appendChild(createIconElement('arrow-left-to-line'));

  const brand = document.createElement('span');
  brand.id = 'sidebar-brand';
  brand.className = 'ml-1 font-bold whitespace-nowrap text-[var(--color-sidebar-text)]';
  brand.textContent = 'BoxCall';

  toggleWrapper.appendChild(toggleBtn);
  toggleWrapper.appendChild(brand);

  // 🧭 Main Nav
  const navWrapper = document.createElement('div');
  navWrapper.className = 'flex-1 overflow-y-auto py-3 w-full max-w-full';

  const mainNav = document.createElement('nav');
  mainNav.id = 'sidebar-nav';
  mainNav.className = 'flex flex-col w-full max-w-full font-body';

  mainPages().forEach(({ id, label, icon }) => {
    const btn = document.createElement('button');
    btn.dataset.page = id;
    btn.className = `
      nav-btn group flex items-center w-full rounded transition
      hover:bg-[var(--color-accent)] text-[var(--color-sidebar-text)]
      justify-start gap-2 px-4 py-2
    `;

    const iconEl = createIconElement(icon, '20px');
    iconEl.classList.add('nav-icon');

    const labelEl = document.createElement('span');
    labelEl.className = 'label nav-label';
    labelEl.textContent = label;

    btn.appendChild(iconEl);
    btn.appendChild(labelEl);
    mainNav.appendChild(btn);
  });

  navWrapper.appendChild(mainNav);

  // ⚙️ Settings Nav
  const navSettingsWrapper = document.createElement('div');
  navSettingsWrapper.className = 'border-t border-[var(--color-border)] px-4 py-3';

  const navSettings = document.createElement('nav');
  navSettings.className = 'flex flex-col space-y-2 font-body';

  settingsPages.forEach(({ id, label, icon }) => {
    const btn = document.createElement('button');
    btn.dataset.page = id;
    btn.className = `
      nav-btn group flex items-center w-full rounded transition
      hover:bg-[var(--color-accent)] text-[var(--color-sidebar-text)]
      justify-start gap-2 px-4 py-2
    `;

    const iconEl = createIconElement(icon, '20px');
    iconEl.classList.add('nav-icon');

    const labelEl = document.createElement('span');
    labelEl.className = 'label nav-label';
    labelEl.textContent = label;

    btn.appendChild(iconEl);
    btn.appendChild(labelEl);
    navSettings.appendChild(btn);
  });

  navSettingsWrapper.appendChild(navSettings);

  // ✅ Assemble
  container.appendChild(toggleWrapper);
  container.appendChild(sidebar);
  sidebar.appendChild(navWrapper);
  sidebar.appendChild(navSettingsWrapper);

  // 🧠 Hook up nav clicks + toggle
  attachSidebarEvents();
  initSidebarToggle();
}

function attachSidebarEvents() {
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach((btn) => {
    const button = /** @type {HTMLButtonElement} */ (btn);
    button.addEventListener('click', () => {
      const page = button.dataset.page;
      if (page) navigateTo(page);
    });
  });
}
