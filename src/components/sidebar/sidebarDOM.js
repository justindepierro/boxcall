import { applySidebarState } from './sidebarStateController.js';
import { getSidebarState } from '@state/sidebarState.js';
import { initSidebarToggle } from './sidebarToggleHandler.js';
import { getSidebarParts } from '@utils/sidebarUtils.js';
import { navigateTo } from '@routes/router.js';
import { signOut } from '@auth/auth.js';

const mainPages = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'teamdashboard', label: 'Team Dashboard', icon: '🧢' },
  { id: 'boxcall', label: 'BoxCall', icon: '📦' },
  { id: 'playbook', label: 'PlayBook', icon: '📖' },
  { id: 'team', label: 'Team', icon: '👥' },
  { id: 'calendar', label: 'Calendar', icon: '🗓️' },
  { id: 'templates', label: 'Templates', icon: '🧩' },
];

const settingsPages = [
  { id: 'settings', label: 'Settings', icon: '⚙️' },
  { id: 'account', label: 'Account', icon: '👤' },
  { id: 'about', label: 'About', icon: 'ℹ️' },
];

export function renderSidebar() {
  const root = document.getElementById('sidebar-root');
  if (!root) return console.warn('❌ Sidebar root not found');
  root.innerHTML = getSidebarHTML();

  attachSidebarEvents();
  applySidebarState(getSidebarState());
  initSidebarToggle();
}

function getSidebarHTML() {
  return `
    <aside id="sidebar" class="sidebar w-64 min-h-screen bg-[var(--color-sidebar)] text-[var(--color-text)] transition-all duration-300 ease-in-out">
      <div class="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
        <h2 class="text-xl font-header sidebar-title">📦 BoxCall</h2>
        <div class="flex items-center gap-2">
          <button id="sidebar-toggle" class="md:hidden text-[var(--color-text)] text-2xl" aria-label="Toggle sidebar">☰</button>
          <button id="sidebar-minimize" class="hidden md:inline text-[var(--color-text)] text-xl" aria-label="Minimize sidebar">⇤</button>
        </div>
      </div>

      <div id="team-switcher" class="px-4 py-2 border-b border-[var(--color-border)]">
        <select id="team-select" class="w-full bg-slate-800 text-[var(--color-text)] px-2 py-1 rounded" aria-label="Select Team">
          <option value="">Select Team</option>
        </select>
      </div>

      <nav class="flex flex-col mt-4 space-y-1 px-2 font-body sidebar-content">
        ${mainPages.map(createNavButton).join('')}

        <div class="border-t border-[var(--color-border)] mt-4 pt-2">
          <button class="collapsible-btn flex items-center justify-between w-full px-3 py-2 rounded hover:bg-[var(--color-accent)] transition" aria-expanded="false">
            <span class="flex items-center gap-2"><span>🧭</span> <span class="label text-[var(--color-text)]">More</span></span>
            <span class="toggle-arrow">▼</span>
          </button>
          <div class="collapsible-section hidden flex-col mt-1 space-y-1">
            ${settingsPages.map(createNavButton).join('')}
          </div>
        </div>

        <button id="signout-btn" class="mt-4 flex items-center gap-2 px-3 py-2 rounded hover:bg-red-600 text-red-300 hover:text-white transition" aria-label="Sign out">
          🚪 <span class="label">Sign Out</span>
        </button>
      </nav>
    </aside>

    <div id="sidebar-overlay" class="fixed inset-0 bg-black bg-opacity-50 z-40 hidden md:hidden" aria-hidden="true"></div>
  `;
}

function createNavButton({ id, label, icon }) {
  return `
    <button
      class="nav-btn flex items-center gap-2 px-3 py-2 rounded hover:bg-[var(--color-accent)] text-[var(--color-text)] transition"
      data-page="${id}"
      aria-label="Navigate to ${label}"
    >
      <span class="text-xl">${icon}</span>
      <span class="label text-[var(--color-text)]">${label}</span>
    </button>
  `;
}

function attachSidebarEvents() {
  const { sidebar, overlay } = getSidebarParts();

  document.getElementById('sidebar-toggle')?.addEventListener('click', () => {
    sidebar.classList.toggle('-translate-x-full');
    sidebar.classList.toggle('translate-x-0');
    overlay.classList.toggle('hidden');
    document.body.classList.toggle('overflow-hidden');
  });

  overlay?.addEventListener('click', () => {
    sidebar.classList.add('-translate-x-full');
    overlay.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  });

  document.querySelectorAll('.collapsible-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const section = btn.nextElementSibling;
      section.classList.toggle('hidden');
      const arrow = btn.querySelector('.toggle-arrow');
      arrow.textContent = section.classList.contains('hidden') ? '▼' : '▲';
      btn.setAttribute('aria-expanded', !section.classList.contains('hidden'));
    });
  });

  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;
      navigateTo(page);
      setActiveSidebar();

      if (window.innerWidth < 768) {
        sidebar.classList.add('-translate-x-full');
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
      localStorage.clear();
      navigateTo('login');
    } catch (err) {
      console.error('❌ Logout error:', err);
    }
  });
}

export function setActiveSidebar() {
  const currentPage = location.hash.replace('#/', '').split('/')[0] || 'dashboard';

  document.querySelectorAll('.nav-btn').forEach((btn) => {
    const isActive = btn.dataset.page === currentPage;
    btn.classList.toggle('bg-gray-800', isActive);
    btn.classList.toggle('text-white', isActive);
    btn.classList.toggle('text-gray-400', !isActive);
  });
}
