// src/components/sidebar.js

import { navigateTo } from '../routes/router.js';
import { signOut } from '../auth/auth.js';

const pages = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'teamdashboard', label: 'Team Dashboard', icon: '🧢' },
  { id: 'boxcall', label: 'BoxCall', icon: '📦' },
  { id: 'playbook', label: 'PlayBook', icon: '📖' },
  { id: 'team', label: 'Team', icon: '👥' },
  { id: 'calendar', label: 'Calendar', icon: '🗓️' },
  { id: 'templates', label: 'Templates', icon: '🧩' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
  { id: 'account', label: 'Account', icon: '👤' },
  { id: 'about', label: 'About', icon: 'ℹ️' },
];

/**
 * Injects and activates the left sidebar
 */
export function renderSidebar() {
  const root = document.getElementById('sidebar-root');
  if (!root) {
    console.warn('❌ Sidebar root element not found. Skipping render.');
    return;
  }

  root.innerHTML = `
    <aside
      id="sidebar"
      class="fixed top-0 left-0 h-full w-64 bg-gray-900 text-white z-50 transform -translate-x-full md:translate-x-0 md:relative transition-transform duration-300 ease-in-out"
      role="navigation"
      aria-label="Sidebar"
    >
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <h2 class="text-xl font-header">📦 BoxCall</h2>
        <button id="sidebar-toggle" class="md:hidden text-white text-2xl font-body focus:outline-none" aria-label="Toggle sidebar">
          ☰
        </button>
      </div>

      <nav class="flex flex-col mt-4 space-y-1 px-2 font-body">
        ${pages.map(createNavButton).join('')}
        <button
          id="signout-btn"
          class="mt-4 flex items-center gap-2 px-3 py-2 rounded hover:bg-red-600 text-red-300 hover:text-white transition font-body"
        >
          🚪 <span>Sign Out</span>
        </button>
      </nav>
    </aside>

    <div
      id="sidebar-overlay"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 hidden md:hidden"
      aria-hidden="true"
    ></div>
  `;

  attachSidebarBehavior();
  setActiveSidebar();
}

/**
 * Returns the HTML string for each nav button
 */
function createNavButton(page) {
  return `
    <button
      class="nav-btn flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-800 text-gray-400 transition"
      data-page="${page.id}"
      aria-label="Navigate to ${page.label}"
    >
      <span class="text-xl">${page.icon}</span>
      <span class="label">${page.label}</span>
    </button>
  `;
}

/**
 * Binds event handlers to sidebar toggles and buttons
 */
function attachSidebarBehavior() {
  const sidebar = document.getElementById('sidebar');
  const toggle = document.getElementById('sidebar-toggle');
  const overlay = document.getElementById('sidebar-overlay');

  toggle?.addEventListener('click', () => {
    sidebar.classList.toggle('-translate-x-full');
    sidebar.classList.toggle('translate-x-0');
    overlay.classList.toggle('hidden');
    document.body.classList.toggle('overflow-hidden');
  });

  overlay?.addEventListener('click', () => {
    sidebar.classList.add('-translate-x-full');
    sidebar.classList.remove('translate-x-0');
    overlay.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  });

  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;
      navigateTo(page);
      setActiveSidebar();

      if (window.innerWidth < 768) {
        sidebar.classList.add('-translate-x-full');
        sidebar.classList.remove('translate-x-0');
        overlay.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
      }
    });
  });

  document.getElementById('signout-btn')?.addEventListener('click', async () => {
    const confirmLogout = confirm('Are you sure you want to sign out?');
    if (!confirmLogout) return;

    try {
      await signOut();
      localStorage.removeItem('session');
      localStorage.removeItem('team_id');
      localStorage.removeItem('cached_theme');

      console.log('👋 Signed out and cleared session data.');
      navigateTo('login');
    } catch (err) {
      console.error('❌ Logout error:', err);
    }
  });
}

/**
 * Highlights the active page in the sidebar
 */
export function setActiveSidebar() {
  const currentPage = location.hash.replace('#/', '') || 'dashboard';

  document.querySelectorAll('.nav-btn').forEach((btn) => {
    const isActive = btn.dataset.page === currentPage;
    btn.classList.toggle('bg-gray-800', isActive);
    btn.classList.toggle('text-white', isActive);
    btn.classList.toggle('text-gray-400', !isActive);
  });
}
