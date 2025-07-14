// src/pages/dashboard/index.js
import { authGuard } from '../../components/AuthGuard.js';
import { renderPage } from '../../render/layout.js';

export default function renderDashboardPage(container) {
  authGuard(() => {
    renderPage(
      container,
      `
      <h1 class="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Welcome to your dashboard.</p>
    `
    );
  });
}
