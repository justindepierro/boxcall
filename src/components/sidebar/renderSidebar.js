import {
  mainPages,
  settingsPages,
  MINIMIZE_SYMBOLS,
  // WRAPPER_CLASSES,
  TOGGLE_BUTTON_CLASSES,
  SIDEBAR_ICON_SIZE,
} from '@config/sidebarConfig.js';

import { SidebarButton } from '@components/ui/sidebarButton.js';
import { getCurrentUser } from '@state/userState.js';
import { getSidebarState } from '@state/sidebarState.js';
import { createIconElement } from '@utils/iconRenderer.js';

export function renderSidebar(state = 'expanded') {
  const container = document.getElementById('sidebar-root');
  if (!container) return console.warn('❌ #sidebar-root not found');

  const main = mainPages(getCurrentUser());

  // 🔘 Header Toggle
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

  const currentState = getSidebarState();
  const iconName = MINIMIZE_SYMBOLS[currentState] || 'menu';
  const iconEl = createIconElement(iconName, SIDEBAR_ICON_SIZE);
  iconEl.classList.add('w-5', 'h-5'); // ensure sizing
  toggleBtn.innerHTML = '';
  toggleBtn.appendChild(iconEl);

  const brand = document.createElement('span');
  brand.id = 'sidebar-brand';
  brand.className = 'ml-1 text-[var(--color-sidebar-text)] font-bold whitespace-nowrap';
  brand.textContent = 'BoxCall';

  if (state !== 'expanded') {
    brand.classList.add('hidden');
  }

  toggleWrapper.append(toggleBtn, brand);

  // 📐 Sidebar container
  const aside = document.createElement('aside');
  aside.id = 'sidebar';
  aside.className = `
  flex flex-col h-full w-full
  transition-all duration-300
  bg-[var(--color-sidebar)] text-[var(--color-sidebar-text)] border-r border-[var(--color-border)]
`;

  // 🧭 Main Nav
  const navMain = document.createElement('nav');
  navMain.className = 'flex-1 min-h-0 overflow-y-auto';
  main.forEach((page) => {
    navMain.appendChild(SidebarButton(page));
  });

  const navMainWrapper = document.createElement('div');
  navMainWrapper.className = 'flex-1 overflow-y-auto  py-3';
  navMainWrapper.appendChild(navMain);

  // ⚙️ Settings Nav
  const navSettings = document.createElement('nav');
  navSettings.className = 'flex flex-col py-3 space-y-2 font-body';
  settingsPages.forEach((page) => {
    navSettings.appendChild(SidebarButton(page));
  });

  const navSettingsWrapper = document.createElement('div');
  navSettingsWrapper.className = 'border-t border-[var(--color-border)] py-3';
  navSettingsWrapper.appendChild(navSettings);

  // 📦 Final Assembly
  aside.append(navMainWrapper, navSettingsWrapper);
  container.innerHTML = '';
  container.append(toggleWrapper, aside);
}
