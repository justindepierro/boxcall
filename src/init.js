// src/js/init.js

import { applyContextualTheme } from '../src/config/themes/themeController.js';
import { applyFontTheme, applyColorTheme } from '../src/config/themes/themeLoader.js';
import { initAuthListeners } from '../src/components/authGuard.js';
import { renderAppShell } from '../src/render/renderAppShell.js';
// import { renderLoadingScreen } from './loading.js';     // Optional
import { handleRouting } from '../src/routes/router.js';       // Enable later

const PUBLIC_PAGES = ['login', 'signup', 'forgot'];

function isProtectedPage(page) {
  return !PUBLIC_PAGES.includes(page);
}

function getCurrentPage() {
  const raw = location.hash || '';
  return raw.replace(/^#\/?/, '') || 'dashboard';
}

export async function initApp() {
  console.log('📦 Initializing BoxCall App...');
  initAuthListeners();

  const currentPage = getCurrentPage();
  const sessionStr = localStorage.getItem('session');
  const sessionObj = sessionStr ? JSON.parse(sessionStr) : null;
  const userId = sessionObj?.user?.id || null;

  // 🔐 Redirect only if needed (but don’t return early)
  if (isProtectedPage(currentPage) && !userId) {
    console.warn('🔒 No session, redirecting to login...');
    window.location.hash = '#/login';
  }

  // 🎨 Theme Setup
  try {
    await applyContextualTheme(currentPage);
  } catch (err) {
    console.warn('⚠️ Theme fallback triggered');
    applyFontTheme('classic');
    applyColorTheme('classic');
  }

  // 🧱 Layout Shell Mount
  renderAppShell();

  // Wait for layout shell to mount
  requestAnimationFrame(async () => {
    const pageView = document.getElementById('page-view');
    if (!pageView) {
      console.error('❌ #page-view not found!');
      return;
    }

    const newPage = getCurrentPage(); // Get latest hash after possible redirect

    if (newPage === 'login') {
      const { default: renderLoginPage } = await import('../src/pages/login/index.js');
      renderLoginPage(pageView);
      return;
    }

    // 🧭 Sidebar + Routing
    if (userId && isProtectedPage(newPage)) {
      const { renderSidebar } = await import('../src/components/sidebar.js');
      renderSidebar();
    }

    await handleRouting();
    window.addEventListener('hashchange', handleRouting);
  });
}