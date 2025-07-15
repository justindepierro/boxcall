// src/render/renderAppShell.js
import { renderSidebar } from '../components/sidebar/sidebarDOM.js';

export function renderAppShell(contentHTML = '') {
  const root = document.getElementById('app');
  if (!root) return;

  root.innerHTML = `
    <div class="flex h-screen">
      <aside id="sidebar-root" class="w-64 bg-[var(--color-sidebar)] text-[var(--color-text)]"></aside>
      <div class="flex-1 overflow-y-auto p-4 bg-[var(--color-bg)] text-[var(--color-text)]" id="page-view">
        ${contentHTML}
      </div>
    </div>
  `;

  renderSidebar();
}
