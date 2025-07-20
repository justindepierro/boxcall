import { initSidebar } from '@components/sidebar/initSidebar.js';
import { devError, devLog } from '@utils/devLogger';

/**
 * Injects the base app HTML layout.
 * @param {boolean} includeSidebar - If true, includes sidebar in layout.
 */
function renderBaseAppShell(includeSidebar) {
  const root = document.getElementById('app');
  if (!root) {
    devError('❌ renderAppShell(): #app container not found');
    return;
  }

  root.innerHTML = `
    <div id="shell" class="flex h-screen w-full overflow-hidden bg-[var(--color-bg)] text-[var(--color-text)]">
      ${includeSidebar ? '<div id="sidebar-root" class="flex flex-col h-full w-64"></div>' : ''}
      
      <main id="page-view" class="flex-1 overflow-y-auto p-6 bg-[var(--color-bg)]">
        <div id="page-content" class="max-w-screen-lg mx-auto"></div>
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
  requestAnimationFrame(() => {
    devLog('✅ renderPublicAppShell(): Public shell initialized');
  });
}

/**
 * Renders the private app shell (with sidebar).
 */
export function renderPrivateAppShell() {
  renderBaseAppShell(true);
  requestAnimationFrame(() => {
    initSidebar();
    devLog('✅ renderPrivateAppShell(): Shell with sidebar initialized');
  });
}
