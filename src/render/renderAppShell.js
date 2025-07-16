// src/render/renderAppShell.js
import { renderSidebar } from '@components/sidebar/sidebarDOM.js';
import { applySidebarState } from '@components/sidebar/sidebarStateController.js';
import { getSidebarState } from '@state/sidebarState.js';

export function renderAppShell() {
  const root = document.getElementById('app');
  if (!root) return console.error('❌ renderAppShell(): #app container not found');

  console.log('✅ renderAppShell(): Found #app, injecting layout...');

  root.innerHTML = `
    <div id="shell" class="flex h-screen w-full overflow-hidden bg-[var(--color-bg)] text-[var(--color-text)]">
      <div id="sidebar-root"></div> <!-- 💡 inserted here -->
      <main id="page-view" class="flex-1 overflow-y-auto p-6 bg-[var(--color-bg)]">
        <div id="page-content" class="max-w-screen-lg mx-auto"></div>
      </main>
      <div id="zoom-root"></div>
      <div id="modal-root"></div>
      <div id="toast-root" class="fixed bottom-4 right-4 space-y-2 z-[9999]"></div>
    </div>
  `;

  // ✅ Only after HTML injected
  requestAnimationFrame(() => {
    console.log('✅ renderAppShell(): Layout injected, calling renderSidebar()');
    renderSidebar();

    console.log('✅ renderAppShell(): Sidebar rendered, applying sidebar state');
    applySidebarState(getSidebarState());

    console.log('✅ renderAppShell(): Shell fully initialized');
  });
}
