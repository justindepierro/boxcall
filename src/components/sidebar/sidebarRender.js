// src/components/sidebar/sidebarRender.js
import { mainPages, settingsPages } from '@config/sidebarConfig.js';

/**
 * Renders the sidebar HTML inside #sidebar-root.
 */
export function renderSidebar() {
  const container = document.getElementById('sidebar-root');
  if (!container) return console.warn('❌ #sidebar-root not found');

  container.innerHTML = `
<div id="sidebar-toggle-wrapper" class="flex items-left justify-left px-3 py-2 transition-all duration-300 w-64 bg-[var(--color-sidebar)] text-[var(--color-sidebar-text)] border-r border-[var(--color-border)]">
  <button id="sidebar-minimize" title="Toggle Sidebar" class="text-lg">☰</button>
  <span id="sidebar-brand" class="ml-2 text-white font-bold">BoxCall</span>
</div>

  <aside
  id="sidebar"
  class="flex flex-col h-full transition-all duration-300 w-64 bg-[var(--color-sidebar)] text-[var(--color-sidebar-text)] border-r border-[var(--color-border)]"
>


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
<button
  data-page="${id}"
  class="nav-btn pr-4 flex items-center w-full transition rounded hover:bg-[var(--color-accent)]"
>
  <span class="nav-icon flex-shrink-0 w-6 text-center">${icon}</span>
  <span class="nav-label ml-3">${label}</span>
</button>
    `
    )
    .join('');
}
