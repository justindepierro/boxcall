// src/render/renderAppShell.js
import { initSidebar } from '@components/sidebar/initSidebar.js';
import { devError, devLog } from '@utils/devLogger';

/**
 * Injects the base app HTML layout with optional sidebar.
 * @param {boolean} includeSidebar
 */
function renderBaseAppShell(includeSidebar) {
  const root = document.getElementById('app');
  if (!root) {
    devError('❌ renderBaseAppShell(): #app container not found');
    return;
  }

  root.innerHTML = `
    <div id="shell" class="flex h-screen w-full overflow-hidden bg-[var(--color-bg)] text-[var(--color-text)]">
      ${includeSidebar ? '<aside id="sidebar-root" class="flex-shrink-0 h-full w-64"></aside>' : ''}
      
      <main id="page-view" class="flex-1 overflow-y-auto bg-[var(--color-bg)]">
        <div id="page-content"></div>
      </main>
      
      <!-- Global Overlay Zones -->
      <div id="zoom-root"></div>
      <div id="modal-root"></div>
      <div id="toast-root" class="fixed bottom-4 right-4 space-y-2 z-[9999]"></div>
    </div>
  `;
}

/**
 * Renders the public app shell (no sidebar).
 */
export function renderPublicAppShell() {
  renderBaseAppShell(false);
  requestAnimationFrame(() => devLog('✅ Public app shell initialized'));
}

/**
 * Renders the private app shell (with sidebar).
 */
export function renderPrivateAppShell() {
  renderBaseAppShell(true);
  requestAnimationFrame(() => {
    initSidebar();
    devLog('✅ Private app shell initialized');
  });
}
