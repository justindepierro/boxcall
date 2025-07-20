// src/components/ui/SidebarButton.js
import { createIconElement } from '@utils/iconRenderer.js';
import { getSidebarState } from '@state/sidebarState.js';
import { navigateTo } from '@routes/router.js'; // ✅ add this

export function SidebarButton({ id, label, icon }) {
  const btn = document.createElement('button');
  btn.className = `
    nav-btn group flex items-center rounded transition
    hover:bg-[var(--color-accent)] text-[var(--color-sidebar-text)]
    justify-start gap-2 px-2 py-2 w-full
  `.trim();

  btn.dataset.page = id;

  const iconEl = createIconElement(icon, '20');
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

  // ✅ ROUTER INTEGRATION
  btn.addEventListener('click', () => {
    navigateTo(id);
  });

  btn.append(iconEl, labelEl);
  return btn;
}
