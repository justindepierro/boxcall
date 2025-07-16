import { mainPages, settingsPages } from '@config/sidebarConfig.js';
import { navigateTo } from '@routes/router.js';
import { initSidebarToggle } from './sidebarToggleHandler.js';

export function renderSidebar() {
  const container = document.getElementById('sidebar-root');
  if (!container) return console.warn('❌ #sidebar-root not found');

  container.innerHTML = `
<aside
  id="sidebar"
  class="flex flex-col h-full transition-all duration-300 w-64 bg-[var(--color-sidebar)] text-[var(--color-sidebar-text)] border-r border-[var(--color-border)]"
>
  <!-- 🔝 Header -->
  <div class="p-4 border-b border-[var(--color-border)] flex justify-between items-center font-header text-lg">
    <span class="sidebar-title">📦 BoxCall</span>
    <button id="sidebar-minimize" title="Toggle Sidebar">☰</button>
  </div>

  <!-- 🧭 Main Navigation (grows to fill space) -->
  <div class="flex-1 overflow-y-auto">
    <nav class="flex flex-col px-2 py-3 space-y-2 font-body">
      ${mainPages
        .map(
          ({ id, label, icon }) => `
          <button data-page="${id}" class="nav-btn flex items-center gap-2 px-3 py-2 rounded hover:bg-[var(--color-accent)] transition">
            <span class="nav-icon">${icon}</span>
            <span class="nav-label label">${label}</span>
          </button>
        `
        )
        .join('')}
    </nav>
  </div>

  <!-- ⚙️ Bottom Settings Nav (pinned to bottom) -->
  <div class="border-t border-[var(--color-border)] p-2">
    <nav class="flex flex-col px-2 py-3 space-y-2 font-body">
      ${settingsPages
        .map(
          ({ id, label, icon }) => `
          <button data-page="${id}" class="nav-btn flex items-center gap-2 px-3 py-2 rounded hover:bg-[var(--color-accent)] transition">
            <span class="nav-icon">${icon}</span>
            <span class="nav-label label">${label}</span>
          </button>
        `
        )
        .join('')}
    </nav>
  </div>
</aside>
`;

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
