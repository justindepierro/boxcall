// src/js/init.js
import { initAuthState, isLoggedIn } from '../src/state/authState.js';
import { applyContextualTheme } from '../src/config/themes/themeController.js';
import { applyFontTheme, applyColorTheme } from '../src/config/themes/themeLoader.js';
import { initAuthListeners } from '../src/components/authGuard.js';
import { renderAppShell } from '../src/render/renderAppShell.js';
// import { renderLoadingScreen } from './loading.js';
import { handleRouting } from '../src/routes/router.js';

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

  // 🔐 Init auth state globally
  await initAuthState();
  initAuthListeners();

  const currentPage = getCurrentPage();

  // 🚧 Redirect if user not logged in and trying to access protected page
  if (isProtectedPage(currentPage) && !isLoggedIn()) {
    console.warn('🔒 Not logged in, redirecting...');
    window.location.hash = '#/login';
  }

  // 🎨 Load user/team theme
  try {
    await applyContextualTheme(currentPage);
  } catch (err) {
    console.warn('⚠️ Theme fallback triggered:', err.message);
    applyFontTheme('classic');
    applyColorTheme('classic');
  }

  // 🧱 Layout Shell
  renderAppShell();

  // Wait 1 frame to allow layout shell to mount
  requestAnimationFrame(async () => {
    const pageView = document.getElementById('page-view');
    if (!pageView) {
      console.error('❌ #page-view not found!');
      return;
    }

    const newPage = getCurrentPage();

    if (newPage === 'login') {
      const { default: renderLoginPage } = await import('../src/pages/login/index.js');
      renderLoginPage(pageView);
      return;
    }

    // 🧭 Sidebar only if logged in on protected page
    if (isLoggedIn() && isProtectedPage(newPage)) {
      const { renderSidebar } = await import('../src/components/sidebar.js');
      renderSidebar();
    }

    // 🚦 Route to appropriate view
    await handleRouting();
    window.addEventListener('hashchange', handleRouting);
  });
}