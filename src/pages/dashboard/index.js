// src/pages/dashboard/index.js
import { authGuard } from '../../components/AuthGuard.js';
import { renderSidebar } from '../../components/sidebar.js';

export default function renderDashboardPage(container) {
  authGuard(() => {
    container.innerHTML = `
      <div class="flex h-screen">
        <div id="sidebar-root" class="w-64"></div>
        <main class="flex-1 p-6 overflow-y-auto">
          <h1 class="text-2xl font-bold mb-4">Dashboard</h1>
          <p>Welcome to your dashboard.</p>
        </main>
      </div>
    `;

    renderSidebar();
  });
}
