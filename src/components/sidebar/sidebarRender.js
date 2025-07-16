// src/components/sidebar/sidebarRender.js
import { mainPages, settingsPages } from '@config/sidebarConfig.js';

/**
 * Renders the sidebar HTML inside #sidebar-root.
 */
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

  <!-- 🧭 Main Navigation -->
  <div class="flex-1 overflow-y-auto">
    <nav class="flex flex-col px-2 py-3 space-y-2 font-body">
      ${renderNavButtons(mainPages)}
    </nav>
  </div>

  <!-- ⚙️ Bottom Settings -->
  <div class="border-t border-[var(--color-border)] p-2">
    <nav class="flex flex-col px-2 py-3 space-y-2 font-body">
      ${renderNavButtons(settingsPages)}
    </nav>
  </div>
</aside>
`;
}

/**
 * Renders button HTML from page config.
 */
function renderNavButtons(pages = []) {
  return pages
    .map(
      ({ id, label, icon }) => `
      <button data-page="${id}" class="nav-btn flex items-center gap-2 px-3 py-2 rounded hover:bg-[var(--color-accent)] transition">
        <span class="nav-icon">${icon}</span>
        <span class="nav-label label">${label}</span>
      </button>
    `
    )
    .join('');
}
