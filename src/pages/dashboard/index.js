// src/pages/dashboard/index.js
import { authGuard } from '../../components/AuthGuard.js';
import { renderPage } from '../../render/layout.js';

export default function renderDashboardPage(container) {
  authGuard(() => {
    // ✅ Build the HTML for the theme box
    const box = document.createElement('div');
    box.className = 'bg-main text-main border border-border-main p-4 rounded font-header';
    box.innerHTML = `<h1>Hello Theme</h1><p>This is the default theme test</p>`;
    document.getElementById('page-view')?.appendChild(box);

    // ✅ Now pass everything to renderPage
    renderPage(
      container,
      `
      ${box}
      <h1 class="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Welcome to your dashboard.</p>
    `
    );
  });
}
