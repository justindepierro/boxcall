import { initSidebar } from '../components/sidebar/initSidebar';

export function renderAppShell() {
  const root = document.getElementById('app');
  if (!root) return console.error('❌ renderAppShell(): #app container not found');

  console.log('✅ renderAppShell(): Found #app, injecting layout...');

  root.innerHTML = `
    <div id="shell" class="flex h-screen w-full overflow-hidden bg-[var(--color-bg)] text-[var(--color-text)]">
      <div id="sidebar-root" class="flex flex-col h-full"></div>
      <main id="page-view" class="flex-1 overflow-y-auto p-6 bg-[var(--color-bg)]">
        <div id="page-content" class="max-w-screen-lg mx-auto"></div>
      </main>
      <div id="zoom-root"></div>
      <div id="modal-root"></div>
      <div id="toast-root" class="fixed bottom-4 right-4 space-y-2 z-[9999]"></div>
    </div>
  `;

  requestAnimationFrame(() => {
    console.log('✅ renderAppShell(): Layout injected, rendering sidebar and events');
    initSidebar();
    console.log('✅ renderAppShell(): Shell fully initialized');
  });
}
