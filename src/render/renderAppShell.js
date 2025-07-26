// src/render/renderAppShell.js
import { initSidebar } from '@components/sidebar/index.js';
import { devLog, devError } from '@utils/devLogger.js';

/**
 * Base HTML shell template for the application.
 * @param {boolean} includeSidebar - Whether to include the sidebar layout.
 * @returns {string} - The generated shell HTML.
 */
function buildAppShellHTML(includeSidebar) {
  return `
    <div id="shell" class="flex h-screen w-full overflow-hidden bg-[var(--color-bg)] text-[var(--color-text)]">
      ${includeSidebar ? '<aside id="sidebar-root" class="flex-shrink-0 h-full"></aside>' : ''}
      
      <main id="page-view" class="flex-1 overflow-y-auto bg-[var(--color-bg)] min-w-0">
        <div id="page-content" class="h-full"></div>
      </main>
      
      <!-- Global Overlay Zones -->
      <div id="zoom-root"></div>
      <div id="modal-root"></div>
      <div id="toast-root" class="fixed bottom-4 right-4 space-y-2 z-[9999]"></div>
    </div>
  `;
}

/**
 * Injects the application shell into #app.
 * This function is future-proofed for both public and private shells.
 *
 * @param {Object} options
 * @param {boolean} [options.includeSidebar=false] - Whether to include sidebar.
 * @param {boolean} [options.resetScroll=true] - Whether to reset page scroll.
 */
export function renderAppShell({ includeSidebar = false, resetScroll = true } = {}) {
  const root = document.getElementById('app');
  if (!root) {
    devError('❌ renderAppShell(): #app container not found');
    return;
  }

  // Inject base shell
  root.innerHTML = buildAppShellHTML(includeSidebar);

  if (resetScroll) window.scrollTo(0, 0);

  if (includeSidebar) {
    requestAnimationFrame(() => {
      initSidebar();
      devLog('✅ Private app shell initialized (with sidebar)');
    });
  } else {
    requestAnimationFrame(() => devLog('✅ Public app shell initialized (no sidebar)'));
  }
}

/**
 * Shortcut: Render the public app shell (no sidebar).
 */
export function renderPublicAppShell() {
  renderAppShell({ includeSidebar: false });
}

/**
 * Shortcut: Render the private app shell (with sidebar).
 */
export function renderPrivateAppShell() {
  renderAppShell({ includeSidebar: true });
}
