// src/components/sidebar/sidebarDOM.js

import { applySidebarState } from './sidebarStateController.js';
import { getSidebarState } from '../../state/sidebarState.js';
import { initSidebarToggle } from './sidebarToggleHandler.js';
import { getSidebarParts } from '../../utils/sidebarUtils.js';
import { navigateTo } from '../../routes/router.js';
import { signOut } from '../../auth/auth.js';
import { themeMap } from '../../config/themes/themeMap.js';
import { getTheme } from '../../config/themes/themeController.js';

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

  const themeKey = getTheme();
  const { sidebarBg, text, accent, border } =
    themeMap[themeKey]?.colors || themeMap['modern'].colors;

  root.innerHTML = `
    <aside id="sidebar" class="sidebar w-64 min-h-screen ${sidebarBg} ${text} transition-all duration-300 ease-in-out">
      <div class="flex items-center justify-between px-4 py-3 border-b ${border}">
        <h2 class="text-xl font-header sidebar-title">📦 BoxCall</h2>
        <div class="flex items-center gap-2">
          <button id="sidebar-toggle" class="md:hidden ${text} text-2xl">☰</button>
          <button id="sidebar-minimize" class="hidden md:inline ${text} text-xl">⇤</button>
        </div>
      </div>

      <div id="team-switcher" class="px-4 py-2 border-b ${border}">
        <select id="team-select" class="w-full bg-slate-800 ${text} px-2 py-1 rounded">
          <option value="">Select Team</option>
        </select>
      </div>

      <nav class="flex flex-col mt-4 space-y-1 px-2 font-body sidebar-content">
        ${mainPages.map((page) => createNavButton(page, { text, accent })).join('')}

        <div class="border-t ${border} mt-4 pt-2">
          <button class="collapsible-btn flex items-center justify-between w-full px-3 py-2 rounded hover:${accent} transition">
            <span class="flex items-center gap-2"><span>🧭</span> <span class="label ${text}">More</span></span>
            <span class="toggle-arrow">▼</span>
          </button>
          <div class="collapsible-section hidden flex-col mt-1 space-y-1">
            ${settingsPages.map((page) => createNavButton(page, { text, accent })).join('')}
          </div>
        </div>

        <button id="signout-btn" class="mt-4 flex items-center gap-2 px-3 py-2 rounded hover:bg-red-600 text-red-300 hover:text-white transition">
          🚪 <span class="label">Sign Out</span>
        </button>
      </nav>
    </aside>

    <div id="sidebar-overlay" class="fixed inset-0 bg-black bg-opacity-50 z-40 hidden md:hidden"></div>
  `;

  attachSidebarEvents();
  applySidebarState(getSidebarState());
  initSidebarToggle();
}

function createNavButton({ id, label, icon }, theme) {
  return `
    <button
      class="nav-btn flex items-center gap-2 px-3 py-2 rounded hover:${theme.accent} ${theme.text} transition"
      data-page="${id}"
      aria-label="Navigate to ${label}"
    >
      <span class="text-xl">${icon}</span>
      <span class="label ${theme.text}">${label}</span>
    </button>
  `;
}

/**
 * 🧠 Sets up event listeners for sidebar interactions.
 */
function attachSidebarEvents() {
  const { sidebar, overlay } = getSidebarParts();

  // ☰ Mobile slide-in toggle
  document.getElementById('sidebar-toggle')?.addEventListener('click', () => {
    sidebar.classList.toggle('-translate-x-full');
    sidebar.classList.toggle('translate-x-0');
    overlay.classList.toggle('hidden');
    document.body.classList.toggle('overflow-hidden');
  });

  // 🕶️ Dismiss overlay
  overlay?.addEventListener('click', () => {
    sidebar.classList.add('-translate-x-full');
    overlay.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  });

  // 🔁 Collapsible "More" section
  document.querySelectorAll('.collapsible-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const section = btn.nextElementSibling;
      section.classList.toggle('hidden');
      const arrow = btn.querySelector('.toggle-arrow');
      arrow.textContent = section.classList.contains('hidden') ? '▼' : '▲';
      btn.setAttribute('aria-expanded', !section.classList.contains('hidden'));
    });
  });

  // 📦 Navigation buttons
  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;
      navigateTo(page);
      setActiveSidebar();

      // 👇 Auto-close sidebar on mobile
      if (window.innerWidth < 768) {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
      }
    });
  });

  // 🚪 Sign out
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

/**
 * 🔦 Highlights the active page in the sidebar nav.
 */
export function setActiveSidebar() {
  const currentPage = location.hash.replace('#/', '').split('/')[0] || 'dashboard';

  document.querySelectorAll('.nav-btn').forEach((btn) => {
    const isActive = btn.dataset.page === currentPage;
    btn.classList.toggle('bg-gray-800', isActive);
    btn.classList.toggle('text-white', isActive);
    btn.classList.toggle('text-gray-400', !isActive);
  });
}
