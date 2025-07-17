import { createIconElement } from '@utils/iconRenderer.js';
import { getSidebarState } from '@state/sidebarState.js';
import {
  // SIDEBAR_PADDING_X,
  // SIDEBAR_PADDING_Y,
  // SIDEBAR_GAP,
  SIDEBAR_ICON_SIZE,
} from '@config/sidebarConfig.js';

/**
 * Sidebar button with icon + label.
 * @param {Object} opts
 * @param {string} opts.id - page ID (for routing)
 * @param {string} opts.label - visible label
 * @param {string} opts.icon - Lucide icon name
 * @returns {HTMLButtonElement}
 */
export function SidebarButton({ id, label, icon }) {
  const btn = document.createElement('button');
  btn.className = `
  nav-btn group flex items-center rounded transition
  hover:bg-[var(--color-accent)] text-[var(--color-sidebar-text)]
  justify-start gap-2 px-4 py-2 w-full
`;

  btn.dataset.page = id;

  const iconEl = createIconElement(icon, SIDEBAR_ICON_SIZE);
  iconEl.classList.add(
    'nav-icon',
    'text-[var(--color-sidebar-icon)]',
    'transition-colors',
    'duration-200',
    'group-hover:text-[var(--color-sidebar-text-hover)]'
  );

  const labelEl = document.createElement('span');
  labelEl.className = 'nav-label ml-1 transition-all duration-200';
  if (getSidebarState() === 'icon') {
    labelEl.classList.add('hidden');
  }
  labelEl.textContent = label;

  btn.append(iconEl, labelEl);
  return btn;
}
