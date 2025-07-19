import { initSidebar } from '@components/sidebar/initSidebar.js';

/**
 * Renders the application shell (layout structure) into the #app container.
 *
 * - For **public pages** (login, signup, forgot, 404), the sidebar is hidden.
 * - For **authenticated pages**, the sidebar is included and initialized.
 *
 * @param {boolean} [isPublic=false] - If true, renders a public shell without the sidebar.
 */
export function renderAppShell(isPublic = false) {
  const root = document.getElementById('app');
  if (!root) {
    console.error('❌ renderAppShell(): #app container not found');
    return;
  }

  // ========================================================================
  // 1. Inject Base App Shell
  // ------------------------------------------------------------------------
  // This HTML defines the entire app layout:
  // - Sidebar container (if not public)
  // - Main content area (#page-view)
  // - Global UI overlay zones (zoom, modal, toast)
  // ========================================================================
  root.innerHTML = `
    <div id="shell" class="flex h-screen w-full overflow-hidden bg-[var(--color-bg)] text-[var(--color-text)]">
      ${isPublic ? '' : '<div id="sidebar-root" class="flex flex-col h-full w-64"></div>'}
      
      <main id="page-view" class="flex-1 overflow-y-auto p-6 bg-[var(--color-bg)]">
        <div id="page-content" class="max-w-screen-lg mx-auto"></div>
      </main>
      
      <!-- Global Overlay Zones -->
      <div id="zoom-root"></div>
      <div id="modal-root"></div>
      <div id="toast-root" class="fixed bottom-4 right-4 space-y-2 z-[9999]"></div>
    </div>
  `;

  // ========================================================================
  // 2. Initialize Sidebar (if user is logged in / not a public page)
  // ------------------------------------------------------------------------
  // Sidebar logic (toggle state, navigation, etc.) is only needed when the
  // user is authenticated and viewing protected pages.
  // ========================================================================
  requestAnimationFrame(() => {
    if (!isPublic) {
      initSidebar();
      console.log('✅ renderAppShell(): Shell with sidebar initialized');
    } else {
      console.log('✅ renderAppShell(): Public shell (no sidebar) initialized');
    }
  });
}
